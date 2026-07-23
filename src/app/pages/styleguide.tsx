import type { ReactNode } from 'react'
import { FolderOpen, Plus, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusPill } from '@/components/shared/status-pill'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { FaixaOcupacao, type OcupacaoBloco } from '@/components/shared/faixa-ocupacao'

const base = new Date()
base.setHours(0, 0, 0, 0)
const h = (n: number) => new Date(base.getTime() + n * 3_600_000)

const blocos: OcupacaoBloco[] = [
  { id: '1', inicio: h(9), fim: h(15), tipo: 'reserva', status: 'ativa', rotulo: 'Ana Reis · PoC ACME · 09:00→15:00' },
  { id: '2', inicio: h(16), fim: h(18), tipo: 'manutencao', rotulo: 'Manutenção rack R12' },
  { id: '3', inicio: h(20), fim: h(23), tipo: 'reserva', status: 'a_vencer', rotulo: 'Léo · Lab Volt · 20:00→23:00' },
]

const swatches: { nome: string; classe: string; hex: string }[] = [
  { nome: 'paper', classe: 'bg-paper', hex: '#F2F4F7' },
  { nome: 'surface', classe: 'bg-surface', hex: '#FFFFFF' },
  { nome: 'ink', classe: 'bg-ink', hex: '#0F1A2A' },
  { nome: 'muted', classe: 'bg-muted', hex: '#5B6B80' },
  { nome: 'line', classe: 'bg-line', hex: '#D5DBE4' },
  { nome: 'signal', classe: 'bg-signal', hex: '#0B5FFF' },
  { nome: 'live', classe: 'bg-live', hex: '#12A594' },
  { nome: 'warn', classe: 'bg-warn', hex: '#B45309' },
  { nome: 'halt', classe: 'bg-halt', hex: '#D1372F' },
]

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-[12px] uppercase tracking-widest text-muted">{titulo}</h2>
      {children}
    </section>
  )
}

export function StyleGuide() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <PageHeader
        title="Página de estilo"
        description="Tokens e componentes base — referência de desenvolvimento"
      />

      <div className="flex flex-col gap-10 pt-4">
        <Secao titulo="Cores">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {swatches.map((s) => (
              <div key={s.nome} className="flex flex-col gap-1">
                <div className={`h-12 rounded-md border border-line ${s.classe}`} />
                <span className="text-[13px] text-ink">{s.nome}</span>
                <span className="font-mono text-[11px] text-muted">{s.hex}</span>
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo="Tipografia">
          <div className="flex flex-col gap-2">
            <p className="font-display text-[40px] font-semibold leading-none text-ink">
              Space Grotesk 40
            </p>
            <p className="text-[16px] text-ink">Inter 16 — corpo, formulários e tabelas.</p>
            <p className="font-mono text-[13px] text-ink">
              JetBrains Mono 13 — 10.20.30.1 · AS64512 · Gi1/0/24 · MTU 1500
            </p>
          </div>
        </Secao>

        <Secao titulo="Botões">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus /> Nova oportunidade
            </Button>
            <Button variant="secondary">Reservar laboratório</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger">Excluir</Button>
            <Button size="sm">Pequeno</Button>
          </div>
        </Secao>

        <Secao titulo="Campos e status">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Buscar oportunidade…" />
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="signal">SD-WAN</Badge>
              <Badge tone="live">validado</Badge>
              <Badge tone="warn">vencendo</Badge>
              <Badge tone="halt">conflito</Badge>
              <StatusPill tone="live">Reservado</StatusPill>
              <StatusPill tone="warn">A vencer</StatusPill>
            </div>
          </div>
        </Secao>

        <Secao titulo="Faixa de ocupação (elemento-assinatura)">
          <Card>
            <CardHeader>
              <CardTitle>Cisco DNA Center</CardTitle>
              <CardDescription>licença · R12 · Gi1/0/24 · expira em 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-muted">mini (lista)</span>
                <FaixaOcupacao janelaInicio={h(0)} janelaFim={h(24)} blocos={blocos} densidade="mini" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-muted">média (card)</span>
                <FaixaOcupacao
                  janelaInicio={h(0)}
                  janelaFim={h(24)}
                  blocos={blocos}
                  agora={h(11.5)}
                  densidade="media"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-muted">completa (calendário)</span>
                <FaixaOcupacao
                  janelaInicio={h(0)}
                  janelaFim={h(24)}
                  blocos={blocos}
                  agora={h(11.5)}
                  densidade="completa"
                  ticks={12}
                />
              </div>
            </CardContent>
          </Card>
        </Secao>

        <Secao titulo="Estados">
          <div className="grid gap-4 sm:grid-cols-2">
            <EmptyState
              icon={<FolderOpen />}
              title="Esta pasta está vazia"
              description="Arraste arquivos aqui ou envie do computador."
              action={
                <Button size="sm">
                  <Plus /> Enviar arquivo
                </Button>
              }
            />
            <ErrorState
              description="Não foi possível carregar as reservas. Verifique a conexão e tente de novo."
              onRetry={() => undefined}
            />
          </div>
          <EmptyState
            icon={<Server />}
            title="Você não tem nada reservado"
            description="Reserve um laboratório para a sua próxima demo."
            action={<Button size="sm">Reservar laboratório</Button>}
          />
        </Secao>
      </div>
    </div>
  )
}
