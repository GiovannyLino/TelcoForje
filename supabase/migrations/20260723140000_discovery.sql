-- Fase 5 — Discovery: templates (schema jsonb versionado) e respostas.

create type discovery_status as enum ('rascunho', 'finalizado');

create table public.discovery_templates (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  schema jsonb not null,
  versao int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_discovery_templates_updated
  before update on public.discovery_templates
  for each row execute function public.set_updated_at();

create table public.discovery_responses (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.discovery_templates (id) on delete restrict,
  template_versao int not null,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  engineer_id uuid not null references public.profiles (id) on delete restrict,
  answers jsonb not null default '{}',
  status discovery_status not null default 'rascunho',
  completude int not null default 0,
  resumo_md text,
  finalizado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_discovery_responses_opp on public.discovery_responses (opportunity_id);
create index idx_discovery_responses_eng on public.discovery_responses (engineer_id);
create trigger trg_discovery_responses_updated
  before update on public.discovery_responses
  for each row execute function public.set_updated_at();

alter table public.discovery_templates enable row level security;
alter table public.discovery_responses enable row level security;

create policy discovery_templates_select on public.discovery_templates for select to authenticated using (true);
create policy discovery_templates_insert on public.discovery_templates for insert to authenticated with check (public.is_admin());
create policy discovery_templates_update on public.discovery_templates for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy discovery_templates_delete on public.discovery_templates for delete to authenticated using (public.is_admin());

create policy discovery_responses_select on public.discovery_responses for select to authenticated using (true);
create policy discovery_responses_insert on public.discovery_responses for insert to authenticated with check (engineer_id = auth.uid() or public.is_admin());
create policy discovery_responses_update on public.discovery_responses for update to authenticated using (engineer_id = auth.uid() or public.is_admin()) with check (engineer_id = auth.uid() or public.is_admin());
create policy discovery_responses_delete on public.discovery_responses for delete to authenticated using (engineer_id = auth.uid() or public.is_admin());

grant select, insert, update, delete on public.discovery_templates, public.discovery_responses
  to authenticated, service_role;
