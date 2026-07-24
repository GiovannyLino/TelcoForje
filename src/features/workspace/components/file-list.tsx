import { useRef, useState } from 'react'
import { Download, FileUp, MoreHorizontal, Tag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatBytes } from '@/lib/format'
import {
  getSignedUrl,
  useCreateFileVersion,
  useFilesByFolder,
  useSoftDeleteFile,
  type FileRow,
} from '../hooks'
import { FilePreviewDialog } from './file-preview-dialog'
import { TagsDialog } from './tags-dialog'

export function FileList({ folderId }: { folderId: string }) {
  const files = useFilesByFolder(folderId)
  const version = useCreateFileVersion()
  const del = useSoftDeleteFile()
  const [preview, setPreview] = useState<FileRow | null>(null)
  const [tagsFor, setTagsFor] = useState<FileRow | null>(null)
  const [versionTarget, setVersionTarget] = useState<FileRow | null>(null)
  const versionInput = useRef<HTMLInputElement>(null)

  async function baixar(f: FileRow) {
    try {
      const url = await getSignedUrl(f.storage_path)
      window.open(url, '_blank', 'noopener')
    } catch {
      toast.error('Não foi possível gerar o link (arquivos do seed não têm blob).')
    }
  }

  function pedirNovaVersao(f: FileRow) {
    setVersionTarget(f)
    versionInput.current?.click()
  }

  async function enviarNovaVersao(file: File | undefined) {
    if (!file || !versionTarget) return
    try {
      await version.mutateAsync({ current: versionTarget, file, onProgress: () => {} })
      toast.success('Nova versão enviada')
    } catch {
      toast.error('Não foi possível enviar a nova versão.')
    }
    setVersionTarget(null)
    if (versionInput.current) versionInput.current.value = ''
  }

  async function excluir(f: FileRow) {
    try {
      await del.mutateAsync(f)
      toast.success('Arquivo movido para a lixeira')
    } catch {
      toast.error('Não foi possível excluir.')
    }
  }

  if (files.isLoading) return <Skeleton className="h-24" />
  if (!files.data || files.data.length === 0) {
    return (
      <EmptyState
        title="Pasta vazia"
        description="Arraste arquivos para a área acima ou envie do computador."
      />
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-1">
        {files.data.map((f) => {
          const previewable = f.mime?.startsWith('image/') || f.mime === 'application/pdf'
          return (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-[13px]"
            >
              <button
                type="button"
                onClick={() => (previewable ? setPreview(f) : void baixar(f))}
                className="min-w-0 flex-1 truncate text-left font-mono text-ink hover:text-signal"
              >
                {f.nome}
              </button>
              {f.tags?.slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
              <span className="shrink-0 text-muted">v{f.versao}</span>
              <span className="hidden shrink-0 text-muted sm:inline">{formatBytes(f.size_bytes)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Ações de ${f.nome}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => void baixar(f)}>
                    <Download /> Baixar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => pedirNovaVersao(f)}>
                    <FileUp /> Nova versão
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTagsFor(f)}>
                    <Tag /> Tags
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void excluir(f)}>
                    <Trash2 /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          )
        })}
      </ul>

      <input
        ref={versionInput}
        type="file"
        className="hidden"
        onChange={(e) => void enviarNovaVersao(e.target.files?.[0])}
      />
      <FilePreviewDialog file={preview} open={Boolean(preview)} onOpenChange={(o) => !o && setPreview(null)} />
      <TagsDialog file={tagsFor} open={Boolean(tagsFor)} onOpenChange={(o) => !o && setTagsFor(null)} />
    </>
  )
}
