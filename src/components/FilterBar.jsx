import { yearOf } from '../lib/dates.js'
import { useI18n } from '../lib/i18n.jsx'

// La búsqueda cubre artista, venue, ciudad y festival, que es lo que uno
// recuerda de un show. Los años van como chips porque son pocos y fijos.
export function matchesQuery(concert, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [concert.artist_name, concert.venue_name, concert.city, concert.festival]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(q))
}

export function filterConcerts(concerts, { query, year }) {
  return concerts.filter(
    (c) => (!year || yearOf(c.event_date) === year) && matchesQuery(c, query),
  )
}

export default function FilterBar({ years, query, year, onQuery, onYear, results, total }) {
  const { t } = useI18n()
  const filtering = query.trim() !== '' || year !== null

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t('filter.placeholder')}
          aria-label={t('filter.label')}
          className="w-full rounded-sm border border-edge bg-surface px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-dim/70 focus:border-chalk"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onYear(null)}
          aria-pressed={year === null}
          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.12em] transition-colors ${
            year === null ? 'bg-chalk text-night' : 'text-dim hover:text-chalk'
          }`}
        >
          {t('filter.all')}
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => onYear(year === y ? null : y)}
            aria-pressed={year === y}
            className={`rounded-full px-3 py-1 text-xs tabular-nums tracking-[0.12em] transition-colors ${
              year === y ? 'bg-chalk text-night' : 'text-dim hover:text-chalk'
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {filtering && (
        <p className="eyebrow">
          {t('filter.results', results, total)}
          <button onClick={() => { onQuery(''); onYear(null) }} className="ml-3 underline hover:text-chalk">
            {t('filter.clear')}
          </button>
        </p>
      )}
    </div>
  )
}
