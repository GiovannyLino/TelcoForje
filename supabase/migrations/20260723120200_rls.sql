-- Fase 2 — Row Level Security. Todas as policies são `to authenticated`
-- (o papel anon não tem policy = sem acesso).

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.board_columns enable row level security;
alter table public.opportunities enable row level security;
alter table public.folders enable row level security;
alter table public.files enable row level security;
alter table public.templates enable row level security;
alter table public.documents enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy profiles_update_self_or_admin on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy profiles_delete_admin on public.profiles
  for delete to authenticated using (public.is_admin());

-- ── clients ──────────────────────────────────────────────────────────────
create policy clients_select on public.clients
  for select to authenticated using (true);
create policy clients_insert on public.clients
  for insert to authenticated with check (owner_id = auth.uid() or public.is_admin());
create policy clients_update on public.clients
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy clients_delete on public.clients
  for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

-- ── board_columns (config: só admin escreve) ─────────────────────────────
create policy board_columns_select on public.board_columns
  for select to authenticated using (true);
create policy board_columns_insert on public.board_columns
  for insert to authenticated with check (public.is_admin());
create policy board_columns_update on public.board_columns
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy board_columns_delete on public.board_columns
  for delete to authenticated using (public.is_admin());

-- ── opportunities ────────────────────────────────────────────────────────
create policy opportunities_select on public.opportunities
  for select to authenticated using (true);
create policy opportunities_insert on public.opportunities
  for insert to authenticated with check (owner_id = auth.uid() or public.is_admin());
create policy opportunities_update on public.opportunities
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy opportunities_delete on public.opportunities
  for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

-- ── folders (privada = só dono; time = todos leem, dono/admin escreve) ────
create policy folders_select on public.folders
  for select to authenticated
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or (visibility = 'team' and deleted_at is null)
  );
create policy folders_insert on public.folders
  for insert to authenticated with check (owner_id = auth.uid() or public.is_admin());
create policy folders_update on public.folders
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy folders_delete on public.folders
  for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

-- ── files (herdam o acesso da pasta) ─────────────────────────────────────
create policy files_select on public.files
  for select to authenticated using (public.pode_ler_pasta(folder_id));
create policy files_insert on public.files
  for insert to authenticated with check (public.pode_escrever_pasta(folder_id));
create policy files_update on public.files
  for update to authenticated
  using (public.pode_escrever_pasta(folder_id))
  with check (public.pode_escrever_pasta(folder_id));
create policy files_delete on public.files
  for delete to authenticated using (public.pode_escrever_pasta(folder_id));

-- ── templates ────────────────────────────────────────────────────────────
create policy templates_select on public.templates
  for select to authenticated
  using (is_published or author_id = auth.uid() or public.is_admin());
create policy templates_insert on public.templates
  for insert to authenticated with check (author_id = auth.uid() or public.is_admin());
create policy templates_update on public.templates
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy templates_delete on public.templates
  for delete to authenticated using (author_id = auth.uid() or public.is_admin());

-- ── documents (seguem a oportunidade: qualquer autenticado lê) ───────────
create policy documents_select on public.documents
  for select to authenticated using (true);
create policy documents_insert on public.documents
  for insert to authenticated with check (author_id = auth.uid() or public.is_admin());
create policy documents_update on public.documents
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy documents_delete on public.documents
  for delete to authenticated using (author_id = auth.uid() or public.is_admin());
