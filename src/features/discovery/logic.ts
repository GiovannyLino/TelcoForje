import type {
  Answer,
  Answers,
  DiscoveryPergunta,
  DiscoverySchema,
  ResumoMeta,
  TableRow,
} from './types'

/** Uma pergunta conta como respondida se tem valor não-vazio ou marca 'na'. 'pendente' não conta. */
export function estaRespondida(a: Answer | undefined): boolean {
  if (!a) return false
  if (a.marca === 'na') return true
  if (a.marca === 'pendente') return false
  const v = a.valor
  if (v == null) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'number') return true
  if (typeof v === 'boolean') return true
  return false
}

/** Avalia a lógica condicional: a pergunta deve aparecer? */
export function avaliarCondicional(perg: DiscoveryPergunta, answers: Answers): boolean {
  const c = perg.condicional
  if (!c) return true
  const dep = answers[c.pergunta_id]
  if (c.operador === 'preenchido') return estaRespondida(dep)
  const depVal = dep?.valor
  const alvo = c.valor ?? ''
  const valores = Array.isArray(depVal) ? depVal.map(String) : [String(depVal ?? '')]
  const igual = valores.includes(alvo)
  return c.operador === 'igual' ? igual : !igual
}

export function perguntasVisiveis(schema: DiscoverySchema, answers: Answers): DiscoveryPergunta[] {
  return schema.secoes.flatMap((s) => s.perguntas.filter((p) => avaliarCondicional(p, answers)))
}

/** Completude 0–100 sobre as perguntas visíveis. */
export function calcularCompletude(schema: DiscoverySchema, answers: Answers): number {
  const vis = perguntasVisiveis(schema, answers)
  if (vis.length === 0) return 0
  const ok = vis.filter((p) => estaRespondida(answers[p.id])).length
  return Math.round((ok / vis.length) * 100)
}

/** Pendências: marcadas como 'pendente' ou obrigatórias ainda não respondidas. */
export function pendencias(schema: DiscoverySchema, answers: Answers): DiscoveryPergunta[] {
  return perguntasVisiveis(schema, answers).filter((p) => {
    const a = answers[p.id]
    return a?.marca === 'pendente' || (Boolean(p.obrigatorio) && !estaRespondida(a))
  })
}

function formatTable(perg: DiscoveryPergunta, rows: TableRow[]): string {
  const cols = perg.colunas ?? []
  if (cols.length === 0 || rows.length === 0) return '—'
  const header = `| ${cols.map((c) => c.label).join(' | ')} |`
  const sep = `| ${cols.map(() => '---').join(' | ')} |`
  const body = rows.map((r) => `| ${cols.map((c) => r[c.id] ?? '').join(' | ')} |`).join('\n')
  return [header, sep, body].join('\n')
}

function formatAnswer(a: Answer | undefined): string {
  if (!a) return '—'
  if (a.marca === 'na') return 'não se aplica'
  if (a.marca === 'pendente') return 'pendente com o cliente'
  const v = a.valor
  if (v == null || v === '') return '—'
  if (Array.isArray(v)) return (v as string[]).join(', ')
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não'
  return String(v)
}

/** Gera o resumo técnico em Markdown, agrupado por seção e destacando pendências. */
export function gerarResumo(schema: DiscoverySchema, answers: Answers, meta: ResumoMeta): string {
  const lines: string[] = []
  lines.push(`# Discovery — ${meta.oportunidade ?? meta.template ?? 'resumo'}`)
  const info = [
    meta.cliente && `Cliente: ${meta.cliente}`,
    meta.engenheiro && `Engenheiro: ${meta.engenheiro}`,
    meta.data && `Data: ${meta.data}`,
  ].filter(Boolean)
  if (info.length) lines.push(info.join(' · '))

  for (const sec of schema.secoes) {
    const vis = sec.perguntas.filter((p) => avaliarCondicional(p, answers))
    if (vis.length === 0) continue
    lines.push(`\n## ${sec.titulo}`)
    for (const p of vis) {
      const a = answers[p.id]
      if (p.tipo === 'table' && a?.valor && Array.isArray(a.valor) && !a.marca) {
        lines.push(`\n**${p.label}:**\n`)
        lines.push(formatTable(p, a.valor as TableRow[]))
      } else {
        lines.push(`- **${p.label}:** ${formatAnswer(a)}`)
      }
    }
  }

  const pend = pendencias(schema, answers)
  if (pend.length) {
    lines.push(`\n## Pendências e riscos`)
    for (const p of pend) {
      const motivo =
        answers[p.id]?.marca === 'pendente' ? 'pendente com o cliente' : 'obrigatório não respondido'
      lines.push(`- **${p.label}** — ${motivo}`)
    }
  }

  return lines.join('\n')
}
