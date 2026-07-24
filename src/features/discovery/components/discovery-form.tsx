import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { avaliarCondicional, calcularCompletude, estaRespondida, gerarResumo } from '../logic'
import type { Answer, Answers, ResumoMeta } from '../types'
import { FieldRenderer } from './field-renderer'
import { useFinalizeResponse, useSaveAnswers, type ResponseWithTemplate } from '../hooks'

export function DiscoveryForm({
  response,
  meta,
  onFinalizado,
}: {
  response: ResponseWithTemplate
  meta: ResumoMeta
  onFinalizado: () => void
}) {
  const schema = response.template!.schema
  const [answers, setAnswers] = useState<Answers>(
    () => (response.answers as unknown as Answers) ?? {},
  )
  const [saved, setSaved] = useState(true)
  const [activeSecao, setActiveSecao] = useState(schema.secoes[0]?.id ?? '')
  const save = useSaveAnswers()
  const finalize = useFinalizeResponse()
  const timer = useRef<number | undefined>(undefined)

  const completude = calcularCompletude(schema, answers)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function scheduleSave(next: Answers) {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      save.mutate(
        { id: response.id, answers: next, completude: calcularCompletude(schema, next) },
        { onSuccess: () => setSaved(true), onError: () => toast.error('Não foi possível salvar.') },
      )
    }, 2000)
  }

  function updateAnswer(id: string, a: Answer) {
    const next = { ...answers, [id]: a }
    setAnswers(next)
    setSaved(false)
    scheduleSave(next)
  }

  async function finalizar() {
    try {
      await finalize.mutateAsync({
        id: response.id,
        answers,
        completude,
        resumo_md: gerarResumo(schema, answers, meta),
      })
      toast.success('Discovery finalizado')
      onFinalizado()
    } catch {
      toast.error('Não foi possível finalizar.')
    }
  }

  const secao = schema.secoes.find((s) => s.id === activeSecao) ?? schema.secoes[0]
  const visiveis = secao?.perguntas.filter((p) => avaliarCondicional(p, answers)) ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-[12px] text-muted">
            <span>Completude</span>
            <span className="font-mono">{completude}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full bg-signal transition-all" style={{ width: `${completude}%` }} />
          </div>
        </div>
        <span className="flex items-center gap-1 text-[12px] text-muted">
          {saved ? (
            <>
              <Check className="size-3.5 text-live" /> salvo
            </>
          ) : (
            <>
              <Loader2 className="size-3.5 animate-spin" /> salvando…
            </>
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {schema.secoes.map((s) => {
          const vis = s.perguntas.filter((p) => avaliarCondicional(p, answers))
          const done = vis.length > 0 && vis.every((p) => estaRespondida(answers[p.id]))
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSecao(s.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px]',
                activeSecao === s.id ? 'bg-signal-weak text-signal' : 'text-muted hover:bg-surface-2',
              )}
            >
              {s.titulo}
              {done ? <span className="inline-block size-1.5 rounded-full bg-live" aria-hidden /> : null}
            </button>
          )
        })}
      </div>

      {secao ? (
        <div className="flex flex-col gap-5">
          {secao.descricao ? <p className="text-[13px] text-muted">{secao.descricao}</p> : null}
          {visiveis.map((p) => (
            <FieldRenderer
              key={p.id}
              pergunta={p}
              answer={answers[p.id]}
              onChange={(a) => updateAnswer(p.id, a)}
            />
          ))}
        </div>
      ) : null}

      <div className="flex justify-end border-t border-line pt-4">
        <Button onClick={() => void finalizar()} disabled={finalize.isPending}>
          Finalizar discovery
        </Button>
      </div>
    </div>
  )
}
