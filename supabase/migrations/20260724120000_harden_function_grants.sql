-- Endurecimento: o Supabase concede EXECUTE em funções do schema public a
-- anon/authenticated por default privileges. Funções SECURITY DEFINER que só
-- rodam em contexto de trigger (ou administrativo) não devem ser chamáveis via
-- RPC. Revoga o acesso desnecessário (o dono/owner e service_role continuam).

-- Funções apenas de trigger / administrativas: ninguém chama por RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.log_activity() from public, anon, authenticated;
revoke execute on function public.sync_search_index() from public, anon, authenticated;
revoke execute on function public.guard_profile_role() from public, anon, authenticated;
revoke execute on function public.gerar_avisos_vencimento() from public, anon, authenticated;

-- Helpers de RLS: precisam ser executáveis por 'authenticated' (as policies os
-- chamam), mas nunca por 'anon' (todo o domínio exige login).
revoke execute on function public.is_admin() from anon;
revoke execute on function public.pode_ler_pasta(uuid) from anon;
revoke execute on function public.pode_escrever_pasta(uuid) from anon;
revoke execute on function public.buscar(text) from anon;
