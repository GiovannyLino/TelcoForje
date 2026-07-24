import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUploadFile } from '../hooks'

type Progresso = { nome: string; pct: number }

export function UploadDropzone({
  folderId,
  opportunityId,
}: {
  folderId: string
  opportunityId: string | null
}) {
  const upload = useUploadFile()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progresso, setProgresso] = useState<Progresso[]>([])

  async function enviar(files: FileList | null) {
    if (!files || files.length === 0) return
    const lista = Array.from(files)
    setProgresso(lista.map((f) => ({ nome: f.name, pct: 0 })))
    let ok = 0
    for (const file of lista) {
      try {
        await upload.mutateAsync({
          folderId,
          opportunityId,
          file,
          onProgress: (pct) =>
            setProgresso((prev) => prev.map((p) => (p.nome === file.name ? { ...p, pct } : p))),
        })
        ok++
      } catch {
        toast.error(`Falha ao enviar ${file.name}.`)
      }
    }
    if (ok > 0) toast.success(ok === 1 ? 'Arquivo enviado' : `${ok} arquivos enviados`)
    setProgresso([])
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void enviar(e.dataTransfer.files)
        }}
        className={cn(
          'flex w-full flex-col items-center gap-1 rounded-md border border-dashed border-line bg-surface px-4 py-6 text-center transition-colors hover:bg-surface-2',
          dragging && 'border-signal bg-signal-weak',
        )}
      >
        <UploadCloud className="size-5 text-muted" aria-hidden />
        <span className="text-[13px] text-ink">Arraste arquivos ou clique para enviar</span>
        <span className="text-[12px] text-muted">Vários arquivos, com progresso real</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => void enviar(e.target.files)}
      />
      {progresso.length > 0 ? (
        <div className="mt-2 flex flex-col gap-1">
          {progresso.map((p) => (
            <div key={p.nome} className="flex items-center gap-2 text-[12px]">
              <span className="w-40 truncate font-mono text-muted">{p.nome}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-signal transition-all" style={{ width: `${p.pct}%` }} />
              </div>
              <span className="w-8 text-right tabular-nums text-muted">{p.pct}%</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
