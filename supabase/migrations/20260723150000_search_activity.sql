-- Fase 6 — Busca (search_index) e linha do tempo (activity_log).
-- Ambos são mantidos por TRIGGERS: o front nunca escreve neles.

create extension if not exists unaccent with schema extensions;

-- ── search_index ─────────────────────────────────────────────────────────
create table public.search_index (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  opportunity_id uuid,
  titulo text,
  corpo text,
  tsv tsvector,
  owner_id uuid,   -- para RLS (arquivos de pasta privada)
  visibility text, -- 'private' | 'team' | null (visível a qualquer autenticado)
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id)
);
create index idx_search_tsv on public.search_index using gin (tsv);
create index idx_search_opp on public.search_index (opportunity_id);

create or replace function public.sync_search_index()
returns trigger
language plpgsql
security definer
set search_path = extensions, public
as $$
declare
  v_entity text := tg_table_name;
  v_titulo text;
  v_corpo text;
  v_opp uuid;
  v_owner uuid;
  v_vis text;
begin
  if tg_op = 'DELETE' then
    delete from public.search_index where entity_type = v_entity and entity_id = old.id;
    return old;
  end if;

  if v_entity = 'opportunities' then
    v_titulo := new.titulo;
    v_corpo := coalesce(new.descricao, '') || ' ' || array_to_string(new.tags, ' ');
    v_opp := new.id;
  elsif v_entity = 'files' then
    if new.deleted_at is not null then
      delete from public.search_index where entity_type = 'files' and entity_id = new.id;
      return new;
    end if;
    v_titulo := new.nome;
    v_corpo := array_to_string(new.tags, ' ');
    v_opp := new.opportunity_id;
    select f.owner_id, f.visibility::text into v_owner, v_vis
    from public.folders f where f.id = new.folder_id;
  elsif v_entity = 'templates' then
    if new.is_published = false then
      delete from public.search_index where entity_type = 'templates' and entity_id = new.id;
      return new;
    end if;
    v_titulo := new.titulo;
    v_corpo := new.conteudo_md;
  elsif v_entity = 'documents' then
    v_titulo := new.titulo;
    v_corpo := new.conteudo_md;
    v_opp := new.opportunity_id;
  elsif v_entity = 'discovery_responses' then
    v_titulo := 'Discovery';
    v_corpo := coalesce(new.resumo_md, '') || ' ' || coalesce(new.answers::text, '');
    v_opp := new.opportunity_id;
  elsif v_entity = 'notices' then
    v_titulo := new.tipo::text;
    v_corpo := new.corpo;
  else
    return new;
  end if;

  insert into public.search_index
    (entity_type, entity_id, opportunity_id, titulo, corpo, tsv, owner_id, visibility, updated_at)
  values (
    v_entity, new.id, v_opp, v_titulo, v_corpo,
    to_tsvector('portuguese', unaccent(coalesce(v_titulo, '') || ' ' || coalesce(v_corpo, ''))),
    v_owner, v_vis, now()
  )
  on conflict (entity_type, entity_id) do update set
    opportunity_id = excluded.opportunity_id, titulo = excluded.titulo, corpo = excluded.corpo,
    tsv = excluded.tsv, owner_id = excluded.owner_id, visibility = excluded.visibility, updated_at = now();
  return new;
end;
$$;

create trigger trg_search_opportunities after insert or update or delete on public.opportunities for each row execute function public.sync_search_index();
create trigger trg_search_files after insert or update or delete on public.files for each row execute function public.sync_search_index();
create trigger trg_search_templates after insert or update or delete on public.templates for each row execute function public.sync_search_index();
create trigger trg_search_documents after insert or update or delete on public.documents for each row execute function public.sync_search_index();
create trigger trg_search_discovery after insert or update or delete on public.discovery_responses for each row execute function public.sync_search_index();
create trigger trg_search_notices after insert or update or delete on public.notices for each row execute function public.sync_search_index();

alter table public.search_index enable row level security;
create policy search_select on public.search_index for select to authenticated
  using (
    visibility is null
    or visibility = 'team'
    or owner_id = auth.uid()
    or public.is_admin()
  );
grant select on public.search_index to authenticated, service_role;
revoke insert, update, delete on public.search_index from authenticated;

-- Busca full-text: acentuação indiferente, com trecho destacado (delimitador ¦).
create or replace function public.buscar(q text)
returns table (
  entity_type text,
  entity_id uuid,
  opportunity_id uuid,
  titulo text,
  trecho text,
  rank real
)
language sql
stable
security invoker
set search_path = extensions, public
as $$
  select
    s.entity_type, s.entity_id, s.opportunity_id, s.titulo,
    ts_headline(
      'portuguese', coalesce(s.corpo, s.titulo),
      plainto_tsquery('portuguese', unaccent(q)),
      'MaxWords=18, MinWords=5, StartSel=¦, StopSel=¦, MaxFragments=1'
    ) as trecho,
    ts_rank(s.tsv, plainto_tsquery('portuguese', unaccent(q))) as rank
  from public.search_index s
  where s.tsv @@ plainto_tsquery('portuguese', unaccent(q))
  order by rank desc
  limit 30;
$$;
grant execute on function public.buscar(text) to authenticated, service_role;

-- ── activity_log ─────────────────────────────────────────────────────────
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  opportunity_id uuid,
  acao text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index idx_activity_opp on public.activity_log (opportunity_id, created_at desc);

create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_opp uuid;
  v_titulo text;
begin
  if tg_table_name = 'opportunities' then
    v_opp := new.id; v_titulo := new.titulo;
  elsif tg_table_name = 'files' then
    v_opp := new.opportunity_id; v_titulo := new.nome;
  elsif tg_table_name = 'documents' then
    v_opp := new.opportunity_id; v_titulo := new.titulo;
  elsif tg_table_name = 'reservations' then
    v_opp := new.opportunity_id; v_titulo := coalesce(new.finalidade, 'reserva');
  elsif tg_table_name = 'discovery_responses' then
    v_opp := new.opportunity_id; v_titulo := 'discovery';
  else
    return new;
  end if;

  if v_opp is null then return new; end if;

  insert into public.activity_log (actor_id, entity_type, entity_id, opportunity_id, acao, payload)
  values (auth.uid(), tg_table_name, new.id, v_opp, lower(tg_op), jsonb_build_object('titulo', v_titulo));
  return new;
end;
$$;

create trigger trg_log_opportunities after insert or update on public.opportunities for each row execute function public.log_activity();
create trigger trg_log_files after insert or update on public.files for each row execute function public.log_activity();
create trigger trg_log_documents after insert or update on public.documents for each row execute function public.log_activity();
create trigger trg_log_reservations after insert or update on public.reservations for each row execute function public.log_activity();
create trigger trg_log_discovery after insert or update on public.discovery_responses for each row execute function public.log_activity();

alter table public.activity_log enable row level security;
create policy activity_select on public.activity_log for select to authenticated using (true);
grant select on public.activity_log to authenticated, service_role;
revoke insert, update, delete on public.activity_log from authenticated;
