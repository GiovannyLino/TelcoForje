export type DiscoveryFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'date'
  | 'table'

export type CondOperador = 'igual' | 'diferente' | 'preenchido'

export type DiscoveryCondicional = {
  pergunta_id: string
  operador: CondOperador
  valor?: string
}

export type DiscoveryColuna = {
  id: string
  label: string
  tipo: 'text' | 'number' | 'select'
  opcoes?: string[]
}

export type DiscoveryPergunta = {
  id: string
  label: string
  tipo: DiscoveryFieldType
  obrigatorio?: boolean
  opcoes?: string[]
  colunas?: DiscoveryColuna[]
  ajuda?: string
  condicional?: DiscoveryCondicional
}

export type DiscoverySecao = {
  id: string
  titulo: string
  descricao?: string
  perguntas: DiscoveryPergunta[]
}

export type DiscoverySchema = {
  versao: number
  secoes: DiscoverySecao[]
}

export type Marca = 'na' | 'pendente'
export type TableRow = Record<string, string>
export type AnswerValue = string | number | boolean | string[] | TableRow[]
export type Answer = { valor?: AnswerValue | null; marca?: Marca }
export type Answers = Record<string, Answer>

export type ResumoMeta = {
  cliente?: string
  oportunidade?: string
  engenheiro?: string
  data?: string
  template?: string
}
