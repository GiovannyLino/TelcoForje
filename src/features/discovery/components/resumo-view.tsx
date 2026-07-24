import { lazy, Suspense } from 'react'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/shared/markdown'

const PdfButton = lazy(() => import('./pdf-button'))

export function ResumoView({
  resumoMd,
  fileName,
  rodape,
}: {
  resumoMd: string
  fileName: string
  rodape?: string
}) {
  async function copiar() {
    try {
      await navigator.clipboard.writeText(resumoMd)
      toast.success('Resumo copiado como Markdown')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => void copiar()}>
          <Copy /> Copiar como Markdown
        </Button>
        <Suspense
          fallback={
            <Button variant="secondary" size="sm" disabled>
              PDF…
            </Button>
          }
        >
          <PdfButton resumoMd={resumoMd} fileName={fileName} rodape={rodape} />
        </Suspense>
      </div>
      <div className="rounded-md border border-line bg-surface p-5">
        <Markdown>{resumoMd}</Markdown>
      </div>
    </div>
  )
}
