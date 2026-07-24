-- Fase 4 — Lab: recursos, reservas (sem sobreposição garantida pelo banco), mural.

create extension if not exists btree_gist;

create type resource_tipo as enum (
  'licenca', 'servidor_lab', 'porta_switch', 'conta_demo', 'credito_nuvem', 'equipamento'
);
create type resource_status as enum ('disponivel', 'manutencao', 'baixado');
create type reservation_status as enum ('ativa', 'concluida', 'cancelada');
create type notice_tipo as enum ('aviso', 'manutencao', 'vencimento', 'incidente');

-- ── resources ────────────────────────────────────────────────────────────
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  tipo resource_tipo not null,
  nome text not null,
  descricao text,
  status resource_status not null default 'disponivel',
  metadata jsonb not null default '{}',
  expira_em date,
  responsavel_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_resources_updated
  before update on public.resources
  for each row execute function public.set_updated_at();

-- ── reservations (não-sobreposição no banco) ─────────────────────────────
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  periodo tstzrange not null,
  finalidade text,
  status reservation_status not null default 'ativa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_periodo_valido
    check (not isempty(periodo) and lower(periodo) is not null and upper(periodo) is not null),
  constraint reservations_sem_sobreposicao
    exclude using gist (resource_id with =, periodo with &&) where (status <> 'cancelada')
);
create index idx_reservations_resource on public.reservations (resource_id);
create index idx_reservations_user on public.reservations (user_id);
create index idx_reservations_opportunity on public.reservations (opportunity_id);
create trigger trg_reservations_updated
  before update on public.reservations
  for each row execute function public.set_updated_at();

-- ── notices (mural de passagem de turno) ─────────────────────────────────
create table public.notices (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  tipo notice_tipo not null default 'aviso',
  corpo text not null,
  pinned boolean not null default false,
  resource_id uuid references public.resources (id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_notices_created on public.notices (created_at desc);
create trigger trg_notices_updated
  before update on public.notices
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.resources enable row level security;
alter table public.reservations enable row level security;
alter table public.notices enable row level security;

create policy resources_select on public.resources for select to authenticated using (true);
create policy resources_insert on public.resources for insert to authenticated with check (public.is_admin());
create policy resources_update on public.resources for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy resources_delete on public.resources for delete to authenticated using (public.is_admin());

create policy reservations_select on public.reservations for select to authenticated using (true);
create policy reservations_insert on public.reservations for insert to authenticated with check (user_id = auth.uid() or public.is_admin());
create policy reservations_update on public.reservations for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy reservations_delete on public.reservations for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create policy notices_select on public.notices for select to authenticated using (true);
create policy notices_insert on public.notices for insert to authenticated with check (author_id = auth.uid() or public.is_admin());
create policy notices_update on public.notices for update to authenticated using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy notices_delete on public.notices for delete to authenticated using (author_id = auth.uid() or public.is_admin());

grant select, insert, update, delete on public.resources, public.reservations, public.notices
  to authenticated, service_role;

-- ── Vencimento automático ────────────────────────────────────────────────
-- Gera avisos de 'vencimento' para recursos que vencem em <= 7 dias (idempotente).
create or replace function public.gerar_avisos_vencimento()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notices (author_id, tipo, corpo, resource_id, expires_at)
  select
    null,
    'vencimento',
    'Recurso "' || r.nome || '" vence em ' || to_char(r.expira_em, 'DD/MM') || '.',
    r.id,
    (r.expira_em + 1)::timestamptz
  from public.resources r
  where r.expira_em is not null
    and r.expira_em >= current_date
    and r.expira_em <= current_date + 7
    and not exists (
      select 1 from public.notices n
      where n.resource_id = r.id
        and n.tipo = 'vencimento'
        and (n.expires_at is null or n.expires_at > now())
    );
end;
$$;

-- Agenda diária via pg_cron, se disponível (best-effort; o badge do dashboard é
-- uma query ao vivo e não depende disto).
do $$
begin
  execute 'create extension if not exists pg_cron';
  perform cron.schedule('avisos-vencimento', '0 8 * * *', 'select public.gerar_avisos_vencimento()');
exception
  when others then
    raise notice 'pg_cron indisponível; vencimentos ficam por query ao vivo e chamada manual da função.';
end;
$$;
