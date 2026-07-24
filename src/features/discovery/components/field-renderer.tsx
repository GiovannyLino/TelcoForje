import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Answer, AnswerValue, DiscoveryPergunta, Marca, TableRow } from '../types'

function asStr(v: unknown): string {
  return v == null ? '' : String(v)
}

function Chips({
  opcoes,
  value,
  onChange,
}: {
  opcoes: string[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])
  return (
    <div className="flex flex-wrap gap-1.5">
      {opcoes.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={cn(
            'rounded-md border px-2.5 py-1 text-[13px]',
            value.includes(o)
              ? 'border-signal bg-signal-weak text-signal'
              : 'border-line text-muted hover:bg-surface-2',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function TableField({
  pergunta,
  value,
  onChange,
}: {
  pergunta: DiscoveryPergunta
  value: TableRow[]
  onChange: (v: TableRow[]) => void
}) {
  const cols = pergunta.colunas ?? []
  const setCell = (i: number, colId: string, v: string) =>
    onChange(value.map((r, idx) => (idx === i ? { ...r, [colId]: v } : r)))
  const addRow = () => onChange([...value, Object.fromEntries(cols.map((c) => [c.id, '']))])
  const delRow = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line">
              {cols.map((c) => (
                <th key={c.id} className="px-2 py-1.5 text-left font-medium text-muted">
                  {c.label}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {value.map((row, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                {cols.map((c) => (
                  <td key={c.id} className="px-1 py-1">
                    {c.tipo === 'select' ? (
                      <Select value={row[c.id] ?? ''} onValueChange={(v) => setCell(i, c.id, v)}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {c.opcoes?.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="h-8"
                        type={c.tipo === 'number' ? 'number' : 'text'}
                        value={row[c.id] ?? ''}
                        onChange={(e) => setCell(i, c.id, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="px-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => delRow(i)}
                    aria-label="Remover linha"
                  >
                    <X />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={addRow}>
        <Plus /> Adicionar linha
      </Button>
    </div>
  )
}

function FieldInput({
  pergunta,
  valor,
  onChange,
}: {
  pergunta: DiscoveryPergunta
  valor: AnswerValue | null | undefined
  onChange: (v: AnswerValue | null) => void
}) {
  switch (pergunta.tipo) {
    case 'textarea':
      return <Textarea value={asStr(valor)} onChange={(e) => onChange(e.target.value)} />
    case 'number':
      return (
        <Input
          type="number"
          value={asStr(valor)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      )
    case 'date':
      return <Input type="date" value={asStr(valor)} onChange={(e) => onChange(e.target.value)} />
    case 'boolean':
      return (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={valor === true ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onChange(true)}
          >
            Sim
          </Button>
          <Button
            type="button"
            variant={valor === false ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onChange(false)}
          >
            Não
          </Button>
        </div>
      )
    case 'select':
      return (
        <Select value={asStr(valor)} onValueChange={(v) => onChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {pergunta.opcoes?.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case 'multiselect':
      return (
        <Chips
          opcoes={pergunta.opcoes ?? []}
          value={Array.isArray(valor) ? (valor as string[]) : []}
          onChange={onChange}
        />
      )
    case 'table':
      return (
        <TableField
          pergunta={pergunta}
          value={Array.isArray(valor) ? (valor as TableRow[]) : []}
          onChange={onChange}
        />
      )
    default:
      return <Input value={asStr(valor)} onChange={(e) => onChange(e.target.value)} />
  }
}

export function FieldRenderer({
  pergunta,
  answer,
  onChange,
}: {
  pergunta: DiscoveryPergunta
  answer: Answer | undefined
  onChange: (a: Answer) => void
}) {
  const marca = answer?.marca
  const valor = answer?.valor
  const toggleMarca = (m: Marca) =>
    onChange(marca === m ? { valor: valor ?? null } : { marca: m })

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {pergunta.label}
        {pergunta.obrigatorio ? <span className="text-halt"> *</span> : null}
      </Label>
      {pergunta.ajuda ? <p className="text-[12px] text-muted">{pergunta.ajuda}</p> : null}

      {marca ? (
        <div className="rounded-md border border-dashed border-line bg-surface-2 px-3 py-2 text-[13px] text-muted">
          {marca === 'na' ? 'Não se aplica' : 'Pendente com o cliente'}
        </div>
      ) : (
        <FieldInput pergunta={pergunta} valor={valor} onChange={(v) => onChange({ valor: v })} />
      )}

      <div className="flex gap-3 text-[12px]">
        <button
          type="button"
          onClick={() => toggleMarca('na')}
          className={cn('hover:text-ink', marca === 'na' ? 'text-signal' : 'text-muted')}
        >
          não se aplica
        </button>
        <button
          type="button"
          onClick={() => toggleMarca('pendente')}
          className={cn('hover:text-ink', marca === 'pendente' ? 'text-warn' : 'text-muted')}
        >
          pendente com o cliente
        </button>
      </div>
    </div>
  )
}
