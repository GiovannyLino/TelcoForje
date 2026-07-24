# PROGRESS.md — TelcoForge

Resumo do que mudou por fase. Cada fase fecha com `typecheck` + `lint` + `build` verdes.

---

## Fase 0 — Fundação ✅

**Feito**
- Scaffold Vite + React 19 + TypeScript strict (config única, `noEmit`, alias `@/`).
- Tailwind CSS v4 via `@tailwindcss/vite` + `@import "tailwindcss"` + `@theme inline` — **sem `tailwind.config.js`**.
- Tokens de tema (claro/escuro) por CSS vars com troca em runtime (`data-theme`) e `prefers-color-scheme`.
- Fontes locais via Fontsource (Space Grotesk, Inter, JetBrains Mono) — sem CDN.
- ESLint (flat, `no-explicit-any: error`) + Prettier + `components.json` (shadcn v4).
- `lib/`: `supabase.ts` (client tipado), `utils.ts` (`cn`), `constants.ts`, `tz.ts`.
- Componentes base: `Button`, `Input`, `Card`, `Badge` e compartilhados `StatusPill`, `EmptyState`, `ErrorState`, `PageHeader`, `DataTable`.
- **Elemento-assinatura `FaixaOcupacao`** nas 3 densidades (mini/média/completa), com ticks mono, blocos por status, hachura de manutenção e marcador "agora".
- Página de estilo (`App.tsx`) demonstrando tokens, tipografia, componentes e a faixa, com toggle de tema.
- Supabase CLI instalado e `supabase init` (config local).
- `README`, `.env.example`, `.gitignore`.

**Verificação:** `npm run typecheck` ✅ · `npm run lint` ✅ · `npm run build` ✅ (2417 módulos, CSS ~24 kB).

**Notas**
- `vitest` fixado em v3 para compartilhar o Vite 6 (v2 trazia um Vite 5 aninhado que quebrava os tipos do `vite.config.ts`). Efeito colateral bom: 0 vulnerabilidades no `npm audit`.
- `supabase start` (stack Docker) fica para o início da Fase 1, quando a autenticação passa a exigir o banco rodando.

**Pendências declaradas:** nenhuma para o "pronto quando" da Fase 0 (build + página de estilo).

---

## Fase 1 — Auth e shell ✅

**Feito**
- Providers: TanStack Query, `ThemeProvider` (claro/escuro/sistema, persistido, sem flash via script inline no `index.html`), `AuthProvider` (sessão via `onAuthStateChange`), `Toaster` (sonner).
- Auth por e-mail/senha: login, cadastro (`nome` → `user_metadata`), logout. Erros do GoTrue traduzidos para pt-BR. `react-hook-form` + `zod`.
- Roteamento (React Router v7 data router): rotas públicas `/login` e `/cadastro` (redirecionam se já logado) e área privada protegida por `RequireAuth` (redireciona para `/login` preservando a origem).
- Shell: topbar (toggle de menu, logo, campo de busca ⌘K placeholder, tema, menu do usuário) + sidebar colapsável (estado persistido) + conteúdo. Placeholders honestos "em construção" por módulo + página 404.
- `ThemeToggle` reativo ao tema resolvido (cobre `system` via `prefers-color-scheme`).

**Verificação:** typecheck ✅ · lint ✅ · build ✅. Teste de fumaça no GoTrue local: signup e login retornam `access_token` e gravam `nome` em `user_metadata`.

**Notas**
- Persistência de sessão via supabase-js (`persistSession`); o clique-a-clique completo (entrar → recarregar mantém → sair) entra no E2E do Playwright na Fase 6.
- Bundle único de ~820 kB (243 kB gzip): code-splitting por rota quando `recharts` (dashboard) e `@react-pdf` (discovery) forem usados.
- Perfil completo (tabela `profiles` + trigger `handle_new_user`) chega na Fase 2; por ora o nome vem de `user_metadata` e o item "Meu perfil" fica desabilitado.
- Navegação mobile (drawer) fica para acabamento; hoje a sidebar some em telas pequenas.

**Pendências declaradas:** nenhuma para o "pronto quando" da Fase 1 (entrar/sair/sessão/proteção de rotas).

---

## Fase 2 — Núcleo do domínio + Workspace ✅

**Banco (migrations + RLS + Storage)**
- Tabelas: `profiles`, `clients`, `board_columns`, `opportunities`, `folders`, `files`, `templates`, `documents`. `updated_at` por trigger; `deleted_at` (lixeira) em folders/files.
- Refinamentos: `board_columns` (colunas configuráveis) e `documents` (cópia de template dentro da oportunidade).
- Bootstrap de perfil (`handle_new_user` + backfill) e guard de `role` (só admin; contexto de servidor/seed liberado).
- RLS em todas as tabelas via helpers `security definer` (`is_admin`, `pode_ler_pasta`, `pode_escrever_pasta`) — sem recursão. Grants explícitos para `authenticated`/`service_role`.
- Storage: bucket privado `files` (policies espelham as pastas; caminho `{folder_id}/{file_id}/{versao}__nome`) + `avatars` público. Download por signed URL (300 s).
- Advisors/linter limpos; types do banco gerados.

**Isolamento provado (2 usuários):** Léo não lê nem baixa a pasta privada da Ana; a pasta do time é legível mas não gravável por não-dono (HTTP 403); upload no Storage idem (dono 200, não-dono bloqueado).

**UI**
- Oportunidades: lista, detalhe com abas + **trilho de contexto**, criar, mover coluna, excluir. Criar cliente.
- Workspace (aba Arquivos): árvore de pastas (privada/time), upload drag & drop com **progresso real** (XHR no endpoint de Storage), versionamento, tags, download por signed URL, preview de imagem/PDF, soft delete.
- Templates: biblioteca com filtro por tipo, editor Markdown com preview ao vivo, **"usar este template"** → cria documento na oportunidade.

**Verificação:** typecheck ✅ · lint ✅ · build ✅.

**Notas / pendências declaradas**
- Arquivos do seed são metadados (sem blob); download/preview deles falha graciosamente — uploads pela UI funcionam de verdade.
- Workspace é escopado por oportunidade; uma visão global "meus arquivos" (pastas sem oportunidade) fica como acabamento.
- Update/delete de cliente pela UI ainda não (só create + uso no select) — anotado para acabamento.
- Code-splitting por rota segue pendente (bundle único ~1 MB); farei quando `recharts`/`@react-pdf` entrarem (Fases 5–6).

---

## Fase 3 — Kanban ✅

**Feito**
- Board com colunas de `board_columns`; cada card é uma `opportunity` (sem entidade duplicada).
- Drag & drop (@dnd-kit) com **atualização otimista + rollback** e persistência de `position` fracionária (midpoint, sem reindexar a coluna toda).
- Handle de arraste separado do clique (o card continua navegável para o detalhe); `DragOverlay` durante o arraste.
- Filtros: cliente, responsável, prioridade e "vencendo (≤3d)". Prazo vencido destaca o card (borda `halt`).
- Falha ao mover reverte o card e mostra toast — a RLS só permite mover oportunidades das quais você é dono (admin move todas).

**Verificação:** typecheck ✅ · lint ✅ · build ✅. Persistência confirmada via API (PATCH 204 → releitura mantém coluna/posição). Rollback visual coberto pelo E2E na Fase 6.

---

## Fase 4 — Lab & Recursos ✅

**Banco**
- Tabelas `resources`, `reservations`, `notices` (+ enums). RLS: recursos só admin escreve; reservas e recados por dono ou admin.
- **Não-sobreposição garantida pelo banco**: `EXCLUDE USING gist (resource_id WITH =, periodo WITH &&) WHERE status <> 'cancelada'` (extensão `btree_gist`).
- Vencimento automático: `gerar_avisos_vencimento()` (idempotente) agendada por `pg_cron` (best-effort); o badge é query ao vivo e não depende do cron.

**Constraint provada:** inserir reserva com período idêntico ao de uma existente → `ERROR: conflicting key value violates exclusion constraint "reservations_sem_sobreposicao"`.

**UI**
- Inventário: recursos por tipo/status, metadata monoespaçada, expiração, e a **faixa de ocupação (mini)** por recurso.
- Calendário semanal: uma linha por recurso com a **faixa de ocupação (completa)** + marcador "agora".
- Reserva com **detecção de conflito**: ao receber o erro do banco, busca a reserva sobreposta e mostra quem reservou e até quando.
- Meus recursos: reservas com reagendar/cancelar. Mural: recados por tipo, fixar/expirar, com os avisos de vencimento gerados automaticamente.

**Verificação:** typecheck ✅ · lint ✅ · build ✅. Seed: 12 recursos, 9 reservas, 8 recados.

**Notas / pendências declaradas**
- Fuso: reservas do seed usam `current_date` do banco (UTC) e aparecem ~3h deslocadas no fuso SP — cosmético, não afeta a constraint.
- Criação por seleção de intervalo na faixa e arrastar-para-reagendar ficam como acabamento (hoje via diálogo).
- Vínculo reserva↔oportunidade existe no schema; o seletor no diálogo do Lab fica para acabamento (suportado via prop).

---

## Fase 5 — Discovery ✅

**Banco**
- `discovery_templates` (schema jsonb versionado) e `discovery_responses` (answers jsonb, completude, resumo_md, status). RLS: templates só admin escreve; respostas por engenheiro responsável ou admin.
- Seed: 3 templates reais (SD-WAN, Última Milha, Observabilidade+Segurança) com perguntas de verdade; 2 respostas (1 rascunho, 1 finalizada).

**Lógica de negócio (testada com Vitest — 11 testes)**
- Lógica condicional (mostrar pergunta B se A = valor), perguntas visíveis, completude ("não se aplica" conta, "pendente" não), pendências e geração do resumo Markdown. + helper de sobreposição de reservas.

**UI**
- Renderizador dirigido por schema: text, textarea, number, select, multiselect, boolean, date e **tabela dinâmica**; marcar "não se aplica"/"pendente".
- Preenchimento em reunião: navegação por seção, **autosave 2s com indicador "salvo"**, barra de completude, lógica condicional ao vivo.
- Ao finalizar: **resumo técnico** (Markdown renderizado) por seção com pendências destacadas; **Copiar como Markdown** e **Exportar PDF** (`@react-pdf/renderer`, no cliente, lazy-loaded).
- Listagem por cliente e engenheiro; aba Discovery dentro da oportunidade.

**Verificação:** typecheck ✅ · lint ✅ · build ✅ · test ✅ (11/11).

**Notas**
- PDF usa fontes nativas (Helvetica/Courier) para robustez; fontes do produto no PDF ficam como acabamento.
- Reabrir discovery finalizado para editar fica como acabamento (hoje é somente leitura + resumo/PDF).

---

## Fase 6 — Busca, dashboard e acabamento ✅

**Banco (triggers)**
- `search_index` mantido por trigger (tsv em português + `unaccent`); a linha carrega `owner_id`/`visibility` para a busca **não vazar** pasta privada. RPC `buscar(q)` com `ts_headline` (trecho destacado). Populado durante o seed pelos próprios triggers.
- `activity_log` alimentado por trigger (insert/update) nas tabelas relevantes; leitura por qualquer autenticado, escrita só por trigger.

**UI**
- Command palette (⌘K / Ctrl+K): busca + ações rápidas; página `/busca`; folha de atalhos (`?`).
- Dashboard "visão do dia": meus cards (gráfico Recharts), reservas de hoje, prazos vencendo, discoveries incompletos, recursos vencendo, mural.
- Trilho de contexto completo: arquivos, documentos, reservas, discoveries e **linha do tempo de atividade** reais.
- Code-splitting por rota: recharts, react-pdf e markdown saem do bundle inicial (chunks sob demanda).

**Testes**
- Vitest 11/11. **Playwright 3/3 fluxos passam** em Chromium: login→oportunidade→arquivo; reserva com conflito bloqueada; discovery→resumo→PDF.

**Deploy-ready**
- `vercel.json` (rewrite de SPA), README com passo a passo de Supabase nuvem + Vercel. **Não publicado** (Checkpoint B).

**Verificação:** typecheck ✅ · lint ✅ · build ✅ · test ✅ · e2e ✅.

**Notas / pendências declaradas (acabamento)**
- Chunk `index` ~820 kB (supabase-js + core): as libs pesadas já foram separadas; um split de vendor melhora cache, não o total.
- Filtros de busca por cliente/engenheiro/período: a RPC hoje é texto puro (respeitando RLS); filtros ficam para acabamento.
- Navegação mobile (drawer) e atalhos `N`/`G+letra` ficam para acabamento; `⌘K`, `?` e `Esc` funcionam.

---

## Rebranding + Redesign — TelcoForge (glass) ✅

Redesenho completo (login → última aba) sem quebrar funcionalidade. Cada fase fechou com `typecheck` + `lint` + `build` verdes; 11 testes unitários e 3 E2E passando ao final. Feito no branch `redesign/telcoforge-glass`.

- **F1 — Rebranding:** `Uplink` → **TelcoForge**; `<Logo/>` passa a usar o mark da **Logicalis** (SVG vetorial em `src/assets/brand/`) + favicon/`<title>`; accent único vira o **vermelho de marca** (`#E4002B`/`#F5324F`) via token `--signal`; chaves de localStorage renomeadas; usuários demo migrados para `@telcoforge.dev` / senha `telcoforge123`. Termo de rede "Uplink 10G" preservado.
- **F2 — Design system:** tokens de **glass/liquid glass**, elevação, malha aurora e motion (`--ease-out` + durações) em light/dark; utilitários `.glass`/`.glass-strong` com fallback `@supports`, `.app-bg`, `.hover-lift`, `.sheen`; superfícies migradas (Card, Topbar/Sidebar/Rail sticky, Dialog); `motion` (React 19) + `src/lib/motion.ts`.
- **F3 — Login:** card glass central, fundo aurora animado (transform), **carrossel de logos de parceiros** (duas faixas opostas, máscara de fade, pausa no hover, CSS puro) e `FloatingField` (label flutuante, ícone, toggle de senha). Autenticação intacta.
- **F4 — Dashboard e abas:** sidebar com indicador ativo animado (motion `layoutId`), transição de rota, KPIs com delta/sparkline (série real), funil em gráfico com gradiente e tooltip glass, `DataTable` polida, dropdown/command-palette em glass. Abas **Reservas** e **Atividade** da oportunidade ligadas a dados reais (fim dos placeholders).
- **F5 — Dados:** dataset telco/observability — clientes viram operadoras (**TIM, Claro, Vivo, Embratel, V.tal**), recursos usam fabricantes parceiros (**Splunk, NETSCOUT, Fortinet, VMware, Red Hat, Cisco, ThousandEyes**), métricas plausíveis (SLA, MTTR, latência, PoPs, R$) e cidades reais. IDs/enums/FKs e os períodos não-sobrepostos das reservas preservados.

**Decisões que valem registro:** logos recriadas como **SVG/wordmarks** (os PNGs não estavam no disco) — uso ilustrativo em demo; biblioteca de animação `motion` adicionada (autorizado); `tsconfig.json` restaurado (valor externo inválido `"ignoreDeprecations": "6.0"` quebrava o typecheck).
