# Uplink

**Cockpit de pré-vendas técnica.** Área de trabalho única de um time de engenharia de pré-vendas (Solution Architects / Sales Engineers de redes, telecom e cloud): conhecimento e propostas, laboratório e recursos, e discovery técnico — tudo orbitando uma **Oportunidade** (cliente + demanda).

> Estado: em construção por fases. Veja [PROGRESS.md](PROGRESS.md) para o que já está pronto e [PLAN.md](PLAN.md) para a arquitetura.

## Stack

- **Front:** React 19 · Vite · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix) · TanStack Query · React Router v7 · react-hook-form + zod · @dnd-kit · date-fns · Recharts · @react-pdf/renderer · sonner
- **Back:** Supabase (Postgres + Auth + Storage + RLS + Realtime). Sem servidor intermediário — regra de acesso e de negócio vivem no banco.
- **Qualidade:** ESLint · Prettier · Vitest · Playwright

## Pré-requisitos

- **Node 20+** (testado no 24) e **npm**
- **Docker Desktop** (para o Supabase local)
- **git**

## Rodando localmente

```bash
# 1. Dependências
npm install

# 2. Sobe o Supabase local (Postgres, Auth, Storage, Studio) — precisa do Docker rodando
npm run db:start
#   Ao terminar, o CLI imprime API URL e anon key. Copie-os.

# 3. Variáveis de ambiente
cp .env.example .env
#   Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY com os valores do passo 2.

# 4. Aplica migrations + seed (a partir da Fase 2)
npm run db:reset

# 5. App em modo dev
npm run dev
```

Studio local do Supabase: <http://127.0.0.1:54323>.

### Usuários de demonstração

Criados pelo seed (a partir da Fase 2). Credenciais e papéis serão listados aqui. Em dev, o cadastro é aberto — você também pode criar a sua conta.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | App em desenvolvimento (Vite) |
| `npm run build` | Typecheck + build de produção |
| `npm run typecheck` | Só checagem de tipos |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (escrita) |
| `npm run test` | Vitest (regras de negócio) |
| `npm run db:start` / `db:stop` | Sobe / derruba o Supabase local |
| `npm run db:reset` | Recria o banco aplicando migrations + seed |
| `npm run db:types` | Gera `src/types/database.ts` a partir do banco local |

## Estrutura

```
src/
  app/          providers, router, layout raiz, tema
  features/     auth, opportunities, workspace, board, lab, discovery, search, dashboard
  components/ui/       base (shadcn)
  components/shared/   EmptyState, ErrorState, DataTable, PageHeader, StatusPill, FaixaOcupacao...
  hooks/  lib/  types/
supabase/
  migrations/   seed.sql
```

Nenhum componente chama o Supabase diretamente — sempre via hook da feature (TanStack Query).

## Deploy

Deploy-ready para **Vercel** (front) + **Supabase** (nuvem). Passo a passo detalhado na Fase 6. Publicação só sob demanda.

## Documentação

- [PLAN.md](PLAN.md) — arquitetura, modelo de dados, fases
- [DESIGN.md](DESIGN.md) — sistema visual e wireframes
- [DECISIONS.md](DECISIONS.md) — decisões e refinamentos
- [PROGRESS.md](PROGRESS.md) — o que mudou por fase
- [IDEAS.md](IDEAS.md) — ideias fora do escopo atual
