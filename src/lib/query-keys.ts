// Chaves centralizadas do TanStack Query. Evita divergência entre queries e invalidations.
export const qk = {
  profiles: {
    all: ['profiles'] as const,
    list: () => ['profiles', 'list'] as const,
  },
  clients: {
    all: ['clients'] as const,
    list: () => ['clients', 'list'] as const,
  },
  boardColumns: {
    all: ['board_columns'] as const,
    list: () => ['board_columns', 'list'] as const,
  },
  opportunities: {
    all: ['opportunities'] as const,
    list: (filters?: unknown) => ['opportunities', 'list', filters ?? null] as const,
    detail: (id: string) => ['opportunities', 'detail', id] as const,
  },
  folders: {
    all: ['folders'] as const,
    byOpportunity: (oppId: string | null) => ['folders', 'opp', oppId] as const,
  },
  files: {
    byFolder: (folderId: string) => ['files', 'folder', folderId] as const,
    byOpportunity: (oppId: string) => ['files', 'opp', oppId] as const,
  },
  templates: {
    all: ['templates'] as const,
    list: () => ['templates', 'list'] as const,
    detail: (id: string) => ['templates', 'detail', id] as const,
  },
  documents: {
    byOpportunity: (oppId: string) => ['documents', 'opp', oppId] as const,
  },
  activity: {
    byOpportunity: (oppId: string) => ['activity', 'opp', oppId] as const,
  },
} as const
