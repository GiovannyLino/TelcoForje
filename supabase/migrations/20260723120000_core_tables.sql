-- Fase 2 — Núcleo do domínio: enums, tabelas e updated_at.
-- Tudo com RLS habilitado num migration posterior (20260723120200_rls.sql).

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ── Enums ────────────────────────────────────────────────────────────────
create type user_role as enum ('admin', 'engenheiro', 'leitor');
create type folder_visibility as enum ('private', 'team');
create type prioridade as enum ('baixa', 'media', 'alta', 'critica');
create type template_tipo as enum ('rfp', 'poc', 'proposta', 'topologia');

-- ── updated_at genérico ──────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles (espelha auth.users) ────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  avatar_url text,
  cargo text,
  squad text,
  role user_role not null default 'engenheiro',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── clients ──────────────────────────────────────────────────────────────
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  segmento text,
  logo_url text,
  owner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_clients_updated
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ── board_columns (colunas configuráveis do Kanban) ──────────────────────
create table public.board_columns (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  position numeric not null default 0,
  cor text,
  wip_limit int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_board_columns_updated
  before update on public.board_columns
  for each row execute function public.set_updated_at();

-- ── opportunities (entidade central = card do Kanban) ────────────────────
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  titulo text not null,
  descricao text,
  column_id uuid not null references public.board_columns (id) on delete restrict,
  prioridade prioridade not null default 'media',
  owner_id uuid not null references public.profiles (id) on delete restrict,
  due_date date,
  position numeric not null default 0,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_opportunities_client on public.opportunities (client_id);
create index idx_opportunities_column on public.opportunities (column_id);
create index idx_opportunities_owner on public.opportunities (owner_id);
create trigger trg_opportunities_updated
  before update on public.opportunities
  for each row execute function public.set_updated_at();

-- ── folders (pessoais ou do time) ────────────────────────────────────────
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.folders (id) on delete cascade,
  nome text not null,
  visibility folder_visibility not null default 'private',
  opportunity_id uuid references public.opportunities (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_folders_owner on public.folders (owner_id);
create index idx_folders_parent on public.folders (parent_id);
create index idx_folders_opportunity on public.folders (opportunity_id);
create trigger trg_folders_updated
  before update on public.folders
  for each row execute function public.set_updated_at();

-- ── files (com versionamento simples) ────────────────────────────────────
create table public.files (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.folders (id) on delete cascade,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  nome text not null,
  storage_path text not null,
  mime text,
  size_bytes bigint,
  versao int not null default 1,
  replaces_file_id uuid references public.files (id) on delete set null,
  is_current boolean not null default true,
  uploader_id uuid references public.profiles (id) on delete set null,
  tags text[] not null default '{}',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_files_folder on public.files (folder_id);
create index idx_files_opportunity on public.files (opportunity_id);
create trigger trg_files_updated
  before update on public.files
  for each row execute function public.set_updated_at();

-- ── templates (biblioteca curada) ────────────────────────────────────────
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  tipo template_tipo not null,
  titulo text not null,
  conteudo_md text not null default '',
  tags text[] not null default '{}',
  versao int not null default 1,
  author_id uuid references public.profiles (id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_templates_updated
  before update on public.templates
  for each row execute function public.set_updated_at();

-- ── documents (cópia editável de template dentro da oportunidade) ────────
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  source_template_id uuid references public.templates (id) on delete set null,
  titulo text not null,
  conteudo_md text not null default '',
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_documents_opportunity on public.documents (opportunity_id);
create trigger trg_documents_updated
  before update on public.documents
  for each row execute function public.set_updated_at();
