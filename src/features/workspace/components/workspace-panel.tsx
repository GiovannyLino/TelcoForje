import { useEffect, useState } from 'react'
import { FolderPlus, Lock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'
import { useFoldersByOpportunity } from '../hooks'
import { CreateFolderDialog } from './create-folder-dialog'
import { UploadDropzone } from './upload-dropzone'
import { FileList } from './file-list'

export function WorkspacePanel({ opportunityId }: { opportunityId: string }) {
  const folders = useFoldersByOpportunity(opportunityId)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (folders.data && folders.data.length > 0 && !selected) {
      setSelected(folders.data[0].id)
    }
  }, [folders.data, selected])

  if (folders.isLoading) return <Skeleton className="h-40" />

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">Pastas</span>
          <CreateFolderDialog
            opportunityId={opportunityId}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Nova pasta">
                <FolderPlus />
              </Button>
            }
          />
        </div>
        {folders.data && folders.data.length > 0 ? (
          <ul className="flex flex-col gap-0.5">
            {folders.data.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setSelected(f.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px]',
                    selected === f.id
                      ? 'bg-signal-weak text-signal'
                      : 'text-ink hover:bg-surface-2',
                  )}
                >
                  {f.visibility === 'team' ? (
                    <Users className="size-3.5 shrink-0" aria-label="Do time" />
                  ) : (
                    <Lock className="size-3.5 shrink-0" aria-label="Privada" />
                  )}
                  <span className="truncate">{f.nome}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] text-muted">Nenhuma pasta. Crie uma para anexar arquivos.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {selected ? (
          <>
            <UploadDropzone folderId={selected} opportunityId={opportunityId} />
            <FileList folderId={selected} />
          </>
        ) : (
          <EmptyState
            icon={<FolderPlus />}
            title="Crie uma pasta"
            description="As pastas organizam os arquivos desta oportunidade — privadas ou do time."
          />
        )}
      </div>
    </div>
  )
}
