-- Fase 2 — Funções auxiliares de autorização + bootstrap de perfil.

-- Helpers (security definer p/ ler sem disparar RLS = sem recursão).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.pode_ler_pasta(f_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.folders f
    where f.id = f_id
      and (
        f.owner_id = auth.uid()
        or public.is_admin()
        or (f.visibility = 'team' and f.deleted_at is null)
      )
  );
$$;

create or replace function public.pode_escrever_pasta(f_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.folders f
    where f.id = f_id
      and (f.owner_id = auth.uid() or public.is_admin())
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.pode_ler_pasta(uuid) from public;
revoke all on function public.pode_escrever_pasta(uuid) from public;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.pode_ler_pasta(uuid) to authenticated, service_role;
grant execute on function public.pode_escrever_pasta(uuid) to authenticated, service_role;

-- Cria profiles automaticamente quando nasce um usuário em auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: perfis para usuários que já existem (ex.: o do smoke test).
insert into public.profiles (id, nome, email)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'nome'), ''), split_part(u.email, '@', 1)),
  u.email
from auth.users u
where u.email is not null
  and not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- Só admin pode alterar o papel (role).
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Bloqueia troca de role por usuário autenticado que não é admin.
  -- Contexto de servidor/seed (auth.uid() nulo, ex.: service_role) é permitido.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Apenas admin pode alterar o papel (role).';
  end if;
  return new;
end;
$$;

create trigger trg_guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();
