-- Fase 2 — Seed. Roda após as migrations no `supabase db reset`.
-- Senha de todos os usuários demo: uplink123

-- ── Usuários demo ─────────────────────────────────────────────────────────
-- Bloco DO: criado e executado junto, sem depender de função pré-existente
-- (o executor de seed faz parse do arquivo inteiro antes de rodar).
do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('a0000000-0000-4000-8000-000000000001'::uuid, 'ana@uplink.dev', 'Ana Reis', 'admin'::user_role),
      ('a0000000-0000-4000-8000-000000000002'::uuid, 'leo@uplink.dev', 'Léo Martins', 'engenheiro'::user_role),
      ('a0000000-0000-4000-8000-000000000003'::uuid, 'rui@uplink.dev', 'Rui Alves', 'engenheiro'::user_role),
      ('a0000000-0000-4000-8000-000000000004'::uuid, 'bia@uplink.dev', 'Bia Costa', 'leitor'::user_role)
    ) as t(id, email, nome, role)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
      u.email, extensions.crypt('uplink123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nome', u.nome), now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      u.id::text, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email),
      'email', now(), now(), now()
    );
    -- o trigger handle_new_user já criou o profile; ajusta nome e role.
    update public.profiles set nome = u.nome, role = u.role where id = u.id;
  end loop;
end $$;

-- ── Colunas do Kanban ─────────────────────────────────────────────────────
insert into public.board_columns (id, nome, position) values
  ('c0000000-0000-4000-8000-000000000001', 'Análise inicial', 1),
  ('c0000000-0000-4000-8000-000000000002', 'Desenho da topologia', 2),
  ('c0000000-0000-4000-8000-000000000003', 'Revisão interna', 3),
  ('c0000000-0000-4000-8000-000000000004', 'Validado com cliente', 4),
  ('c0000000-0000-4000-8000-000000000005', 'Entregue', 5);

-- ── Clientes ──────────────────────────────────────────────────────────────
insert into public.clients (id, nome, segmento, owner_id) values
  ('d0000000-0000-4000-8000-000000000001', 'ACME Telecom', 'Telecom', 'a0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000002', 'Volt Energia', 'Utilities', 'a0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000003', 'Nexa Varejo', 'Varejo', 'a0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000004', 'Rede Sul', 'Provedor regional', 'a0000000-0000-4000-8000-000000000003'),
  ('d0000000-0000-4000-8000-000000000005', 'Sigma Cloud', 'Cloud / SaaS', 'a0000000-0000-4000-8000-000000000002');

-- ── Oportunidades (espalhadas pelo Kanban) ────────────────────────────────
insert into public.opportunities (id, client_id, titulo, descricao, column_id, prioridade, owner_id, due_date, position, tags) values
  ('e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'SD-WAN campus', 'Redesenho da WAN corporativa com SD-WAN em 24 sites.', 'c0000000-0000-4000-8000-000000000002', 'alta', 'a0000000-0000-4000-8000-000000000001', current_date + 2, 1, '{sd-wan,campus}'),
  ('e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'Última milha em fibra', 'Conectividade de última milha para 8 subestações.', 'c0000000-0000-4000-8000-000000000001', 'alta', 'a0000000-0000-4000-8000-000000000002', current_date + 10, 1, '{fibra,ultima-milha}'),
  ('e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000003', 'Observabilidade de rede', 'Stack de observabilidade e alerta para 300 lojas.', 'c0000000-0000-4000-8000-000000000003', 'media', 'a0000000-0000-4000-8000-000000000001', current_date + 5, 1, '{observabilidade,nms}'),
  ('e0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000004', 'Core MPLS', 'Upgrade do core MPLS e peering.', 'c0000000-0000-4000-8000-000000000004', 'media', 'a0000000-0000-4000-8000-000000000003', null, 1, '{mpls,core}'),
  ('e0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000005', 'Migração para cloud', 'Landing zone e conectividade híbrida.', 'c0000000-0000-4000-8000-000000000001', 'baixa', 'a0000000-0000-4000-8000-000000000002', current_date + 20, 2, '{cloud,hibrido}'),
  ('e0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000001', 'Segurança de perímetro', 'NGFW e segmentação para o data center.', 'c0000000-0000-4000-8000-000000000002', 'critica', 'a0000000-0000-4000-8000-000000000003', current_date - 1, 2, '{seguranca,ngfw}'),
  ('e0000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000002', 'Enlace por rádio', 'Backup por rádio licenciado entre dois sites.', 'c0000000-0000-4000-8000-000000000001', 'media', 'a0000000-0000-4000-8000-000000000001', current_date + 1, 3, '{radio,backup}'),
  ('e0000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000003', 'SD-WAN nas lojas', 'Piloto de SD-WAN entregue em 12 lojas.', 'c0000000-0000-4000-8000-000000000005', 'baixa', 'a0000000-0000-4000-8000-000000000002', null, 1, '{sd-wan,varejo}');

-- ── Pastas (privadas e do time) ───────────────────────────────────────────
insert into public.folders (id, owner_id, nome, visibility, opportunity_id) values
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Topologias', 'team', 'e0000000-0000-4000-8000-000000000001'),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Rascunhos', 'private', 'e0000000-0000-4000-8000-000000000001'),
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'Propostas', 'team', null);

-- ── Arquivos (metadados; blobs enviados pela UI) ──────────────────────────
insert into public.files (id, folder_id, opportunity_id, nome, storage_path, mime, size_bytes, versao, uploader_id, tags) values
  ('f1000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'topologia-acme-v3.drawio', 'f0000000-0000-4000-8000-000000000001/f1000000-0000-4000-8000-000000000001/3__topologia-acme-v3.drawio', 'application/xml', 214000, 3, 'a0000000-0000-4000-8000-000000000001', '{topologia,sd-wan}'),
  ('f1000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'baseline-links.xlsx', 'f0000000-0000-4000-8000-000000000001/f1000000-0000-4000-8000-000000000002/1__baseline-links.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 88000, 1, 'a0000000-0000-4000-8000-000000000001', '{baseline}'),
  ('f1000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'proposta-tecnica-rascunho.md', 'f0000000-0000-4000-8000-000000000002/f1000000-0000-4000-8000-000000000003/1__proposta-tecnica-rascunho.md', 'text/markdown', 12000, 1, 'a0000000-0000-4000-8000-000000000001', '{rascunho}'),
  ('f1000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000003', null, 'proposta-observabilidade.pdf', 'f0000000-0000-4000-8000-000000000003/f1000000-0000-4000-8000-000000000004/1__proposta-observabilidade.pdf', 'application/pdf', 640000, 1, 'a0000000-0000-4000-8000-000000000002', '{proposta,observabilidade}');

-- ── Templates (biblioteca curada, publicados) ─────────────────────────────
insert into public.templates (id, tipo, titulo, conteudo_md, tags, author_id, is_published) values
  ('b0000000-0000-4000-8000-000000000001', 'rfp', 'Resposta RFP — Conectividade WAN', $md$# Resposta RFP — Conectividade WAN

## 1. Entendimento do requisito
- Sites e capacidades solicitadas
- SLA alvo (disponibilidade, latência, jitter)

## 2. Solução proposta
- Topologia (hub-and-spoke / full-mesh)
- Roteamento e resiliência
- Segurança e segmentação

## 3. Premissas e exclusões
## 4. Plano de implantação
## 5. Comercial
$md$, '{rfp,wan}', 'a0000000-0000-4000-8000-000000000001', true),
  ('b0000000-0000-4000-8000-000000000002', 'poc', 'Modelo de PoC — SD-WAN', $md$# PoC SD-WAN

## Objetivo
Validar failover, roteamento por aplicação e visibilidade.

## Critérios de sucesso
- [ ] Failover < 1 s sem queda de sessão
- [ ] Steering por aplicação (voz vs. dados)
- [ ] Dashboard de telemetria por site

## Topologia de teste
## Roteiro de testes
## Resultados
$md$, '{poc,sd-wan}', 'a0000000-0000-4000-8000-000000000002', true),
  ('b0000000-0000-4000-8000-000000000003', 'proposta', 'Proposta técnica — Observabilidade', $md$# Proposta técnica — Observabilidade

## Coleta
- SNMP, streaming telemetry, flow (NetFlow/IPFIX)

## Processamento e armazenamento
## Alertas e SLOs
## Dashboards
## Roadmap de adoção
$md$, '{observabilidade,proposta}', 'a0000000-0000-4000-8000-000000000001', true);

-- ── Documento (cópia de template dentro de uma oportunidade) ──────────────
insert into public.documents (id, opportunity_id, source_template_id, titulo, conteudo_md, author_id) values
  ('b1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'PoC SD-WAN — ACME', $md$# PoC SD-WAN — ACME

## Objetivo
Validar failover e steering por aplicação nos 3 sites piloto da ACME.

## Critérios de sucesso
- [ ] Failover < 1 s no enlace primário
- [ ] Voz priorizada sobre o link de backup
$md$, 'a0000000-0000-4000-8000-000000000001');
