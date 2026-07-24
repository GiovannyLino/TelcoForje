# PROGRESS.md — Uplink

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
