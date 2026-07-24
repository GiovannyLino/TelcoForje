/** Renderiza o trecho da busca, destacando o que está entre delimitadores ¦. */
export function Highlighted({ trecho }: { trecho: string }) {
  const partes = trecho.split('¦')
  return (
    <span className="text-[12px] text-muted">
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-xs bg-signal-weak px-0.5 text-signal">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  )
}
