import type { SearchResult } from './hooks'

const labelMap: Record<string, string> = {
  opportunities: 'Oportunidade',
  files: 'Arquivo',
  documents: 'Documento',
  templates: 'Template',
  discovery_responses: 'Discovery',
  notices: 'Recado',
}

export function entityLabel(tipo: string): string {
  return labelMap[tipo] ?? tipo
}

export function entityRoute(r: SearchResult): string {
  switch (r.entity_type) {
    case 'opportunities':
      return `/oportunidades/${r.entity_id}`
    case 'discovery_responses':
      return `/discovery/${r.entity_id}`
    case 'templates':
      return `/templates/${r.entity_id}`
    case 'notices':
      return '/lab'
    case 'files':
    case 'documents':
      return r.opportunity_id ? `/oportunidades/${r.opportunity_id}` : '/oportunidades'
    default:
      return '/'
  }
}
