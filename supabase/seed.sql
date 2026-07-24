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

-- ── Recursos (12, tipos variados) ─────────────────────────────────────────
insert into public.resources (id, tipo, nome, descricao, status, metadata, expira_em, responsavel_id) values
  ('10000000-0000-4000-8000-000000000001', 'licenca', 'Cisco DNA Center', 'Licença de laboratório', 'disponivel', '{"vendor":"Cisco","edicao":"Advantage"}', current_date + 5, 'a0000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000002', 'licenca', 'Fortinet FortiManager', 'Gestão centralizada', 'disponivel', '{"vendor":"Fortinet"}', current_date + 20, 'a0000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000003', 'servidor_lab', 'Lab-rack R12', 'Servidor ESXi do rack R12', 'disponivel', '{"rack":"R12","cpu":"2x Xeon","ram":"256GB"}', null, 'a0000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000004', 'servidor_lab', 'Lab-rack R7', 'Servidor ESXi do rack R7', 'manutencao', '{"rack":"R7"}', null, null),
  ('10000000-0000-4000-8000-000000000005', 'porta_switch', 'Gi1/0/24', 'Porta de acesso do switch de lab', 'disponivel', '{"vendor":"Cisco","modelo":"C9300","rack":"R12","porta":"Gi1/0/24"}', null, 'a0000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000006', 'porta_switch', 'Te1/1/1', 'Uplink 10G', 'disponivel', '{"vendor":"Cisco","modelo":"C9500","porta":"Te1/1/1"}', null, null),
  ('10000000-0000-4000-8000-000000000007', 'conta_demo', 'Conta demo AWS', 'Sandbox AWS para PoCs', 'disponivel', '{"provider":"AWS","conta":"1234-5678"}', current_date + 3, 'a0000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000008', 'conta_demo', 'Conta demo Azure', 'Sandbox Azure', 'disponivel', '{"provider":"Azure"}', current_date + 25, 'a0000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000009', 'credito_nuvem', 'Créditos GCP', 'Créditos para labs', 'disponivel', '{"provider":"GCP","saldo":"USD 500"}', current_date + 40, null),
  ('10000000-0000-4000-8000-00000000000a', 'credito_nuvem', 'Créditos OCI', 'Créditos Oracle Cloud', 'disponivel', '{"provider":"OCI","saldo":"USD 300"}', null, null),
  ('10000000-0000-4000-8000-00000000000b', 'equipamento', 'Roteador C8300', 'Roteador de borda para bancada', 'disponivel', '{"vendor":"Cisco","modelo":"C8300-1N1S"}', null, 'a0000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-00000000000c', 'equipamento', 'AP Wi-Fi 6E', 'Access point de teste', 'baixado', '{"vendor":"Cisco","modelo":"C9166"}', null, null);

-- ── Reservas (ao longo de ~2 semanas, sem sobreposição por recurso) ───────
insert into public.reservations (id, resource_id, user_id, opportunity_id, periodo, finalidade) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', tstzrange((current_date)::timestamptz + interval '9 hours', (current_date)::timestamptz + interval '15 hours'), 'PoC SD-WAN ACME'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', null, tstzrange((current_date + 2)::timestamptz + interval '9 hours', (current_date + 2)::timestamptz + interval '12 hours'), 'Testes de licença'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000006', tstzrange((current_date + 1)::timestamptz + interval '14 hours', (current_date + 1)::timestamptz + interval '18 hours'), 'Lab de segurança'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', null, tstzrange((current_date + 4)::timestamptz + interval '9 hours', (current_date + 4)::timestamptz + interval '17 hours'), 'Preparação de demo'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000002', tstzrange((current_date + 1)::timestamptz + interval '10 hours', (current_date + 1)::timestamptz + interval '12 hours'), 'Conectividade última milha'),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000005', tstzrange((current_date)::timestamptz + interval '8 hours', (current_date + 3)::timestamptz + interval '20 hours'), 'Landing zone'),
  ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-00000000000b', 'a0000000-0000-4000-8000-000000000003', null, tstzrange((current_date + 5)::timestamptz + interval '13 hours', (current_date + 5)::timestamptz + interval '18 hours'), 'Bancada de roteador'),
  ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', null, tstzrange((current_date + 7)::timestamptz + interval '9 hours', (current_date + 7)::timestamptz + interval '11 hours'), 'Revisão de licenças'),
  ('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', null, tstzrange((current_date + 2)::timestamptz + interval '8 hours', (current_date + 2)::timestamptz + interval '18 hours'), 'Manutenção programada');

-- ── Mural (6 recados) ─────────────────────────────────────────────────────
insert into public.notices (id, author_id, tipo, corpo, pinned, resource_id, expires_at) values
  ('30000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'manutencao', 'Manutenção do Lab-rack R7 durante toda a semana. Evitem agendar nele.', true, '10000000-0000-4000-8000-000000000004', (current_date + 7)::timestamptz),
  ('30000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'aviso', 'Liberem as reservas de laboratório que não forem usar até sexta.', false, null, null),
  ('30000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'incidente', 'Porta Gi1/0/24 com flapping intermitente; em investigação.', false, '10000000-0000-4000-8000-000000000005', null),
  ('30000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'aviso', 'Nova licença Fortinet disponível para PoCs de segurança.', false, '10000000-0000-4000-8000-000000000002', null),
  ('30000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'manutencao', 'Janela de manutenção da nuvem OCI na quinta, 22h às 23h.', false, '10000000-0000-4000-8000-00000000000a', null),
  ('30000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'aviso', 'Passagem de turno: DNA Center reservado para a PoC da ACME hoje.', false, '10000000-0000-4000-8000-000000000001', (current_date + 2)::timestamptz);

-- Gera os avisos de vencimento automáticos (DNA Center, Conta demo AWS…).
select public.gerar_avisos_vencimento();

-- ── Discovery: 3 templates ────────────────────────────────────────────────
insert into public.discovery_templates (id, nome, descricao, schema) values
  ('a1000000-0000-4000-8000-000000000001', 'Rede Corporativa / SD-WAN', 'Levantamento de WAN corporativa, roteamento e última milha', $json${"versao":1,"secoes":[{"id":"contexto","titulo":"Contexto","perguntas":[{"id":"sites","label":"Quantidade de sites","tipo":"number","obrigatorio":true},{"id":"saida_internet","label":"Topologia de saída de internet","tipo":"select","opcoes":["Centralizada","Distribuída","Híbrida"],"obrigatorio":true}]},{"id":"roteamento","titulo":"Roteamento","perguntas":[{"id":"protocolo","label":"Protocolo de roteamento","tipo":"select","opcoes":["OSPF","BGP","EIGRP","Estático"],"obrigatorio":true},{"id":"asn","label":"ASN público","tipo":"number","ajuda":"Aparece quando o protocolo é BGP","condicional":{"pergunta_id":"protocolo","operador":"igual","valor":"BGP"}},{"id":"mtu","label":"MTU do enlace (bytes)","tipo":"number","ajuda":"Padrão 1500"}]},{"id":"acesso","titulo":"Última milha","perguntas":[{"id":"tipo_fibra","label":"Tipo de fibra","tipo":"select","opcoes":["Monomodo","Multimodo","Não se aplica"]},{"id":"links","label":"Inventário de links","tipo":"table","colunas":[{"id":"site","label":"Site","tipo":"text"},{"id":"acesso","label":"Acesso","tipo":"select","opcoes":["Fibra","Rádio","4G/5G"]},{"id":"banda","label":"Banda","tipo":"text"}]}]},{"id":"sla","titulo":"SLA e janela","perguntas":[{"id":"sla_atual","label":"SLA atual de disponibilidade","tipo":"text"},{"id":"janela","label":"Janela de manutenção","tipo":"text","obrigatorio":true}]}]}$json$),
  ('a1000000-0000-4000-8000-000000000002', 'Conectividade e Última Milha', 'Fibra, PON e rádio: acesso, sites e SLA', $json${"versao":1,"secoes":[{"id":"acesso","titulo":"Acesso","perguntas":[{"id":"tecnologia","label":"Tecnologia de acesso","tipo":"select","opcoes":["Fibra dedicada","PON","Rádio licenciado","Rádio não-licenciado"],"obrigatorio":true},{"id":"padrao_pon","label":"Padrão PON","tipo":"select","opcoes":["GPON","XGS-PON"],"condicional":{"pergunta_id":"tecnologia","operador":"igual","valor":"PON"}},{"id":"frequencia","label":"Faixa de frequência (GHz)","tipo":"text","condicional":{"pergunta_id":"tecnologia","operador":"diferente","valor":"Fibra dedicada"}},{"id":"distancia","label":"Distância até o PoP (km)","tipo":"number"}]},{"id":"sites","titulo":"Sites","perguntas":[{"id":"lista_sites","label":"Sites e capacidades","tipo":"table","obrigatorio":true,"colunas":[{"id":"site","label":"Site","tipo":"text"},{"id":"endereco","label":"Endereço","tipo":"text"},{"id":"banda","label":"Banda contratada","tipo":"text"}]}]},{"id":"sla","titulo":"SLA","perguntas":[{"id":"disponibilidade","label":"Disponibilidade alvo (%)","tipo":"number"},{"id":"instalacao","label":"Prazo de instalação aceitável","tipo":"text"}]}]}$json$),
  ('a1000000-0000-4000-8000-000000000003', 'Observabilidade e Segurança', 'Monitoração, segurança e continuidade (RPO/RTO)', $json${"versao":1,"secoes":[{"id":"monitoracao","titulo":"Monitoração","perguntas":[{"id":"ferramentas","label":"Ferramentas de monitoração em uso","tipo":"multiselect","opcoes":["Zabbix","PRTG","Grafana","Datadog","SolarWinds","Nenhuma"],"obrigatorio":true},{"id":"snmp","label":"Versão de SNMP","tipo":"select","opcoes":["v2c","v3","Não usa"]},{"id":"fluxo","label":"Coleta de fluxo","tipo":"select","opcoes":["NetFlow","IPFIX","sFlow","Não coleta"]}]},{"id":"seguranca","titulo":"Segurança","perguntas":[{"id":"ngfw","label":"Firewall de perímetro (NGFW)?","tipo":"boolean"},{"id":"segmentacao","label":"Estratégia de segmentação","tipo":"textarea"},{"id":"ferramentas_seg","label":"Ferramentas de segurança","tipo":"multiselect","opcoes":["EDR","SIEM","WAF","NAC","Nenhuma"]}]},{"id":"continuidade","titulo":"Continuidade","perguntas":[{"id":"rpo","label":"RPO alvo","tipo":"text","obrigatorio":true},{"id":"rto","label":"RTO alvo","tipo":"text","obrigatorio":true}]}]}$json$);

-- ── Discovery: 2 respostas ────────────────────────────────────────────────
insert into public.discovery_responses (id, template_id, template_versao, opportunity_id, engineer_id, answers, status, completude, resumo_md, finalizado_em) values
  ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 1, 'e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   $json${"sites":{"valor":24},"saida_internet":{"valor":"Centralizada"},"protocolo":{"valor":"BGP"},"asn":{"valor":64512},"mtu":{"valor":1500},"tipo_fibra":{"valor":"Monomodo"},"links":{"valor":[{"site":"Matriz SP","acesso":"Fibra","banda":"1 Gbps"},{"site":"Filial RJ","acesso":"Rádio","banda":"200 Mbps"}]},"sla_atual":{"marca":"pendente"},"janela":{"valor":"Domingos 00h-04h"}}$json$,
   'rascunho', 89, null, null),
  ('a2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', 1, 'e0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   $json${"ferramentas":{"valor":["Zabbix","Grafana"]},"snmp":{"valor":"v3"},"fluxo":{"valor":"IPFIX"},"ngfw":{"valor":true},"segmentacao":{"valor":"VLANs por ambiente e microssegmentação no data center."},"ferramentas_seg":{"valor":["SIEM","EDR"]},"rpo":{"valor":"15 min"},"rto":{"valor":"1 hora"}}$json$,
   'finalizado', 100,
   $md$# Discovery — Observabilidade de rede
Cliente: Nexa Varejo · Engenheiro: Ana Reis

## Monitoração
- **Ferramentas de monitoração em uso:** Zabbix, Grafana
- **Versão de SNMP:** v3
- **Coleta de fluxo:** IPFIX

## Segurança
- **Firewall de perímetro (NGFW)?:** Sim
- **Estratégia de segmentação:** VLANs por ambiente e microssegmentação no data center.
- **Ferramentas de segurança:** SIEM, EDR

## Continuidade
- **RPO alvo:** 15 min
- **RTO alvo:** 1 hora
$md$, now());
