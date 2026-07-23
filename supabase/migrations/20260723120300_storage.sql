-- Fase 2 — Storage: buckets e policies espelhando o acesso às pastas.

insert into storage.buckets (id, name, public)
values ('files', 'files', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Bucket 'files' (privado). Caminho: {folder_id}/{file_id}/{versao}__{nome}.
-- O 1º segmento é o folder_id, então a policy deriva o acesso pela pasta.
create policy files_obj_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'files'
    and public.pode_ler_pasta(((storage.foldername(name))[1])::uuid)
  );

create policy files_obj_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'files'
    and public.pode_escrever_pasta(((storage.foldername(name))[1])::uuid)
  );

create policy files_obj_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'files'
    and public.pode_escrever_pasta(((storage.foldername(name))[1])::uuid)
  );

create policy files_obj_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'files'
    and public.pode_escrever_pasta(((storage.foldername(name))[1])::uuid)
  );

-- Bucket 'avatars' (leitura pública; usuário escreve só na própria pasta {user_id}/...).
create policy avatars_obj_read on storage.objects
  for select using (bucket_id = 'avatars');

create policy avatars_obj_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_obj_update on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
