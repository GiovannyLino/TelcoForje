-- Fase 2 — Grants de tabela para os papéis do PostgREST.
-- O acesso por LINHA é controlado pelas policies de RLS; os grants apenas
-- permitem que o papel 'authenticated' toque nas tabelas (sem eles, 42501).
-- 'anon' recebe só USAGE no schema: sem grant de tabela = nenhum acesso
-- pré-login (todo o domínio exige autenticação).

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to authenticated, service_role;
grant usage, select on all sequences in schema public
  to authenticated, service_role;

-- Objetos criados nas próximas migrations herdam o grant.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
