import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: '#0F1A2A', fontFamily: 'Helvetica', lineHeight: 1.5 },
  h1: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 4 },
  meta: { fontSize: 10, color: '#5B6B80', marginBottom: 8 },
  li: { marginLeft: 10, marginBottom: 2 },
  p: { marginBottom: 2 },
  mono: { fontFamily: 'Courier', fontSize: 9, color: '#0F1A2A' },
  rule: { borderBottomWidth: 1, borderBottomColor: '#D5DBE4', marginVertical: 8 },
})

const clean = (s: string) => s.replace(/\*\*/g, '')

/** Renderiza o resumo Markdown como um PDF legível (sem serviço externo). */
export function DiscoveryPdf({ resumoMd, rodape }: { resumoMd: string; rodape?: string }) {
  const linhas = resumoMd.split('\n')
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {linhas.map((linha, i) => {
          if (linha.startsWith('# ')) return <Text key={i} style={styles.h1}>{clean(linha.slice(2))}</Text>
          if (linha.startsWith('## ')) return <Text key={i} style={styles.h2}>{clean(linha.slice(3))}</Text>
          if (linha.startsWith('- ')) return <Text key={i} style={styles.li}>• {clean(linha.slice(2))}</Text>
          if (linha.startsWith('|')) return <Text key={i} style={styles.mono}>{linha}</Text>
          if (linha.trim() === '') return <View key={i} style={{ height: 5 }} />
          return <Text key={i} style={styles.p}>{clean(linha)}</Text>
        })}
        {rodape ? (
          <>
            <View style={styles.rule} />
            <Text style={styles.meta}>{rodape}</Text>
          </>
        ) : null}
      </Page>
    </Document>
  )
}
