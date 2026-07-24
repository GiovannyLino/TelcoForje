import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Column<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  align?: 'left' | 'right'
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  empty,
  className,
  onRowClick,
  maxBodyHeight,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  empty?: ReactNode
  className?: string
  onRowClick?: (row: T) => void
  /** Se definido, o corpo rola e o cabeçalho fica fixo no topo. */
  maxBodyHeight?: number
}) {
  return (
    <div
      className={cn('glass overflow-auto rounded-lg', className)}
      style={maxBodyHeight ? { maxHeight: maxBodyHeight } : undefined}
    >
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'sticky top-0 z-10 border-b border-line bg-surface-2/90 px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted backdrop-blur-sm',
                  c.align === 'right' && 'text-right',
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-muted">
                {empty ?? 'Nada por aqui ainda.'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-line/70 transition-colors last:border-0 hover:bg-signal-weak/40',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-3 py-2.5 text-ink',
                      c.align === 'right' && 'text-right',
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
