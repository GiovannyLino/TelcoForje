import { PDFDownloadLink } from '@react-pdf/renderer'
import { DiscoveryPdf } from './discovery-pdf'

export default function PdfButton({
  resumoMd,
  fileName,
  rodape,
}: {
  resumoMd: string
  fileName: string
  rodape?: string
}) {
  return (
    <PDFDownloadLink
      document={<DiscoveryPdf resumoMd={resumoMd} rodape={rodape} />}
      fileName={fileName}
      className="inline-flex h-8 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm text-ink hover:bg-surface-2"
    >
      {({ loading }) => (loading ? 'Gerando…' : 'Exportar PDF')}
    </PDFDownloadLink>
  )
}
