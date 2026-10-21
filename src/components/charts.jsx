// Piezas de gráfico compartidas. Todas son de una sola serie, así que no llevan
// leyenda: el título dice qué se está midiendo. El color vive en la barra; el
// texto siempre usa tinta (chalk/dim).

export function StatTile({ label, value, hint }) {
  return (
    <div>
      <p className="font-archivo text-3xl font-extrabold leading-none sm:text-4xl">{value}</p>
      <p className="eyebrow mt-2">{label}</p>
      {hint && <p className="mt-1 text-xs text-dim">{hint}</p>}
    </div>
  )
}

// Columnas para series temporales: la cronología importa, por eso van en fila.
// Las alturas van en px: un porcentaje necesitaría que el contenedor tuviera
// altura definida en cada nivel, y aquí las columnas se alinean al fondo.
const PLOT_HEIGHT = 150

export function YearColumns({ data }) {
  const max = Math.max(...data.map((d) => d.shows), 1)

  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-4">
        {data.map((d) => (
          <div key={d.year} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs tabular-nums text-dim">{d.shows}</span>
            <div
              className="w-full max-w-[24px] rounded-t-[4px] bg-chart"
              style={{ height: `${Math.max((d.shows / max) * PLOT_HEIGHT, 3)}px` }}
              title={`${d.year}: ${d.shows} shows`}
            />
          </div>
        ))}
      </div>
      {/* Eje recesivo: una hairline, sin grilla. */}
      <div className="h-px bg-edge" />
      <div className="mt-2 flex gap-2 sm:gap-4">
        {data.map((d) => (
          <span key={d.year} className="flex-1 text-center text-xs tabular-nums text-dim">
            {d.year}
          </span>
        ))}
      </div>
    </div>
  )
}

// Barras horizontales para rankings: el nombre necesita ancho, el valor va al extremo.
// Las listas largas no se recortan: se muestran enteras dentro de un área con scroll.
export function BarList({ data, unit, scrollAfter = 8 }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const scrolls = data.length > scrollAfter

  return (
    <ul
      className={`flex flex-col gap-3 ${
        scrolls ? 'max-h-80 overflow-y-auto pr-3 scroll-subtle' : ''
      }`}
    >
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="truncate text-sm">{d.label}</span>
            <span className="shrink-0 text-sm tabular-nums text-dim">
              {d.value}
              {unit ? ` ${unit}` : ''}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-chart"
              style={{ width: `${(d.value / max) * 100}%` }}
              title={`${d.label}: ${d.value}${unit ? ` ${unit}` : ''}`}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Section({ title, note, children }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 border-b border-edge pb-2">
        <h2 className="font-archivo text-lg font-bold uppercase tracking-tight">{title}</h2>
        {note && <span className="eyebrow shrink-0">{note}</span>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}
