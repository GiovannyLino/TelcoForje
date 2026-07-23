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
