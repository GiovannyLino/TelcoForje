# DECISIONS.md — TelcoForge

Registro de decisões. Formato: **Decisão · Contexto · Consequência**.

## Setup (respondido pelo usuário no início)

1. **Banco: local (Docker) em dev, nuvem só no deploy (Fase 6).**
   Migrations e `seed.sql` versionados e portáveis, então o mesmo esquema roda dos dois lados. Linter de segurança: `supabase db lint` local; `get_advisors` via MCP na nuvem.

2. **Cadência: autônomo com 2 checkpoints.**
   Paro para aprovação (A) antes de aplicar RLS/Storage na Fase 2 e (B) antes de qualquer publicação real na Fase 6. Fora isso, sigo entre fases sem esperar, exceto em bloqueio real.

3. **Acesso: usuários demo prontos + cadastro aberto em dev.**
   Seed cria admin + engenheiros com credenciais documentadas no README. Necessário também para o teste de isolamento de RLS (2 usuários) exigido no "pronto quando" da Fase 2.

4. **Deploy: deploy-ready + documentado, sem publicar.**
   README traz o passo a passo. Publicação (Vercel + Supabase nuvem) só sob pedido.

## Refinamentos de arquitetura (meus, sobre o esboço do brief)

5. **Colunas do Kanban = tabela `board_columns`, não enum `stage`.**
   O brief pede colunas *configuráveis*; enum não é configurável. `opportunities.column_id` referencia `board_columns`; ordem via `opportunities.position`. Coluna não-vazia não pode ser removida (RESTRICT).

6. **`documents`: entidade para a cópia editável de template dentro da oportunidade.**
   "Usar este template" cria um `documents` (markdown editável) ligado à `opportunity`, sem poluir a biblioteca `templates` (que permanece curada). Evita reusar `files` (blobs no Storage, não editáveis in-app).

7. **Vencimentos por `pg_cron` + função SQL, sem Edge Function.**
   `gerar_avisos_vencimento()` roda diária e cria `notices` idempotentes. Mantém a regra no banco (preferência do brief). O badge do dashboard é query ao vivo, então funciona mesmo sem o cron.

8. **`search_index.tsv` mantido por trigger; linha carrega `owner_id`/`visibility`.**
   Trigger evita o problema de imutabilidade do `unaccent` em coluna gerada. `owner_id`/`visibility` na linha do índice permitem RLS que **não vaza arquivo de pasta privada** na busca global.

9. **Versão de arquivo: linha nova + `is_current`, via RPC atômica.**
   `criar_versao_arquivo()` insere `versao+1`, aponta `replaces_file_id` e desmarca a anterior numa transação. Histórico preservado.

10. **`position` fracionário (midpoint) no Kanban.**
    Reordenar por dnd-kit calcula a posição entre vizinhos, evitando reescrever a coluna inteira a cada movimento.

## Padrões herdados do brief (sem desvio)

- TS strict, zero `any`. Estado de servidor só em TanStack Query. Zod em toda entrada.
- Nenhum componente chama Supabase direto — só hooks da feature (mantém o Anexo A viável).
- Commits convencionais, por fase, com `typecheck+lint+build` verdes.
- Soft-delete só em `folders`/`files` (lixeira 30 dias), como o brief especifica.
