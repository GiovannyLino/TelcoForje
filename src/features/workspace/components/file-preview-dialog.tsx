import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getSignedUrl, type FileRow } from '../hooks'

export function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: {
  file: FileRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let active = true
    if (open && file) {
      setUrl(null)
      setErr(false)
      getSignedUrl(file.storage_path)
        .then((u) => active && setUrl(u))
        .catch(() => active && setErr(true))
    }
    return () => {
      active = false
    }
  }, [open, file])

  const isImg = file?.mime?.startsWith('image/')
  const isPdf = file?.mime === 'application/pdf'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate font-mono text-[15px]">{file?.nome}</DialogTitle>
        </DialogHeader>
        {err ? (
          <p className="py-10 text-center text-[13px] text-muted">
            Não foi possível carregar a prévia. Arquivos do seed não têm blob — envie um novo para
            visualizar aqui.
          </p>
        ) : !url ? (
          <div className="h-64 animate-pulse rounded-md bg-surface-2" />
        ) : isImg ? (
          <img
            src={url}
            alt={file?.nome ?? ''}
            className="max-h-[70vh] w-full rounded-md object-contain"
          />
        ) : isPdf ? (
          <iframe src={url} title={file?.nome ?? ''} className="h-[70vh] w-full rounded-md border border-line" />
        ) : (
          <p className="py-10 text-center text-[13px] text-muted">
            Prévia indisponível para este tipo. Use “Baixar”.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
