import { formatLong } from '../lib/dates.js'

export default function SetlistPreview({ results, onConfirm, saving }) {
  if (results.length === 0) {
    return (
      <p className="text-dim">
        No se encontró ningún setlist con esos datos. Probá ajustando el nombre del artista, la
        fecha o la ciudad.
      </p>
    )
  }

  return (
    <div>
      <h2 className="eyebrow border-b border-edge pb-3">
        {results.length} resultado{results.length > 1 ? 's' : ''} · elegí el correcto
      </h2>

      <ul className="divide-y divide-edge">
        {results.map((result, i) => (
          <li
            key={result.setlistfmId ?? i}
            className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap"
          >
            {result.imageUrl && (
              <img
                src={result.imageUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-sm object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-archivo font-bold uppercase tracking-tight text-lg leading-snug">{result.artistName}</h3>
              <p className="text-sm text-dim">
                {[result.venueName, result.city, result.country].filter(Boolean).join(' · ')}
              </p>
              <p className="eyebrow mt-1">
                {formatLong(result.eventDate)} · {result.songs.length} canciones
              </p>
            </div>
            <button
              onClick={() => onConfirm(result)}
              disabled={saving}
              className="shrink-0 rounded-sm border border-chalk px-4 py-2 text-sm transition-colors hover:bg-chalk hover:text-night disabled:opacity-40"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
