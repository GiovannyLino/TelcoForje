import { describe, expect, it } from 'vitest'
import {
  avaliarCondicional,
  calcularCompletude,
  estaRespondida,
  gerarResumo,
  pendencias,
  perguntasVisiveis,
} from './logic'
import type { Answers, DiscoverySchema } from './types'

const schema: DiscoverySchema = {
  versao: 1,
  secoes: [
    {
      id: 's1',
      titulo: 'Roteamento',
      perguntas: [
        { id: 'protocolo', label: 'Protocolo', tipo: 'select', opcoes: ['OSPF', 'BGP'], obrigatorio: true },
        {
          id: 'asn',
          label: 'ASN',
          tipo: 'number',
          condicional: { pergunta_id: 'protocolo', operador: 'igual', valor: 'BGP' },
        },
        { id: 'mtu', label: 'MTU', tipo: 'number' },
      ],
    },
    {
      id: 's2',
      titulo: 'SLA',
      perguntas: [{ id: 'janela', label: 'Janela', tipo: 'text', obrigatorio: true }],
    },
  ],
}

describe('lógica condicional', () => {
  it('mostra ASN só quando protocolo = BGP', () => {
    const asn = schema.secoes[0].perguntas[1]
    expect(avaliarCondicional(asn, { protocolo: { valor: 'OSPF' } })).toBe(false)
    expect(avaliarCondicional(asn, { protocolo: { valor: 'BGP' } })).toBe(true)
  })
  it('perguntasVisiveis reflete a condicional', () => {
    expect(perguntasVisiveis(schema, { protocolo: { valor: 'OSPF' } })).toHaveLength(3)
    expect(perguntasVisiveis(schema, { protocolo: { valor: 'BGP' } })).toHaveLength(4)
  })
})

describe('completude', () => {
  it('conta "não se aplica" como respondida e "pendente" como não', () => {
    const a: Answers = {
      protocolo: { valor: 'OSPF' },
      mtu: { marca: 'na' },
      janela: { marca: 'pendente' },
    }
    expect(calcularCompletude(schema, a)).toBe(67)
  })
  it('100% quando tudo respondido', () => {
    const a: Answers = {
      protocolo: { valor: 'BGP' },
      asn: { valor: 64512 },
      mtu: { valor: 1500 },
      janela: { valor: 'Dom 0-4h' },
    }
    expect(calcularCompletude(schema, a)).toBe(100)
  })
})

describe('resumo e pendências', () => {
  it('lista pendências (pendente + obrigatória vazia)', () => {
    const a: Answers = { protocolo: { marca: 'pendente' }, janela: { valor: '' } }
    const ids = pendencias(schema, a).map((x) => x.id)
    expect(ids).toContain('protocolo')
    expect(ids).toContain('janela')
  })
  it('gera markdown com seções e destaque de pendências', () => {
    const a: Answers = {
      protocolo: { valor: 'BGP' },
      asn: { valor: 64512 },
      mtu: { marca: 'na' },
      janela: { marca: 'pendente' },
    }
    const md = gerarResumo(schema, a, { cliente: 'ACME', oportunidade: 'SD-WAN' })
    expect(md).toContain('## Roteamento')
    expect(md).toContain('Protocolo:** BGP')
    expect(md).toContain('## Pendências e riscos')
    expect(md).toContain('Janela')
  })
})

describe('estaRespondida', () => {
  it('trata os tipos de valor', () => {
    expect(estaRespondida(undefined)).toBe(false)
    expect(estaRespondida({ valor: '' })).toBe(false)
    expect(estaRespondida({ valor: 0 })).toBe(true)
    expect(estaRespondida({ valor: false })).toBe(true)
    expect(estaRespondida({ valor: [] })).toBe(false)
    expect(estaRespondida({ valor: ['x'] })).toBe(true)
    expect(estaRespondida({ marca: 'na' })).toBe(true)
    expect(estaRespondida({ marca: 'pendente' })).toBe(false)
  })
})
