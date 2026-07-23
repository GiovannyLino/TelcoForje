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

## Fase 1 — Auth e shell ⏳
_(em andamento)_
