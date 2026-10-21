import { useMemo, useState } from 'react'
import { useConcerts } from '../lib/useConcerts.js'
import { yearOf } from '../lib/dates.js'
import PosterWall from './styles/PosterWall.jsx'
import DarkMagazine from './styles/DarkMagazine.jsx'
import FilterBar, { filterConcerts } from '../components/FilterBar.jsx'
import { useI18n } from '../lib/i18n.jsx'

const VIEWS = [
  { id: 'muro', labelKey: 'home.view.wall', Component: PosterWall },
  { id: 'revista', labelKey: 'home.view.magazine', Component: DarkMagazine },
]

const STORAGE_KEY = 'lifetime-concerts:view'

export default function Home() {
  const { t } = useI18n()
  const { concerts, error } = useConcerts()
  // La vista elegida se recuerda entre visitas.
  const [view, setView] = useState(() => localStorage.getItem(STORAGE_KEY) ?? VIEWS[0].id)
  const [query, setQuery] = useState('')
  const [year, setYear] = useState(null)

  const years = useMemo(
    () => [...new Set((concerts ?? []).map((c) => yearOf(c.event_date)))].sort().reverse(),
    [concerts],
  )
  const filtered = useMemo(
    () => filterConcerts(concerts ?? [], { query, year }),
    [concerts, query, year],
  )

  function chooseView(id) {
    setView(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  if (error) return <p className="text-ember">{t('home.error', error)}</p>
  if (concerts === null) return <p className="text-dim">{t('common.loading')}</p>
  if (concerts.length === 0) return <p className="text-dim">{t('home.empty')}</p>

  const { Component } = VIEWS.find((v) => v.id === view) ?? VIEWS[0]

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="sm:max-w-md sm:flex-1">
          <FilterBar
            years={years}
            query={query}
            year={year}
            onQuery={setQuery}
            onYear={setYear}
            results={filtered.length}
            total={concerts.length}
          />
        </div>

        <div
          role="group"
          aria-label={t('home.viewMode')}
          className="inline-flex shrink-0 gap-1 self-start rounded-full border border-edge bg-surface p-1"
        >
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => chooseView(v.id)}
              aria-pressed={v.id === view}
              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                v.id === view ? 'bg-chalk text-night' : 'text-dim hover:text-chalk'
              }`}
            >
              {t(v.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-dim">{t('home.noMatch')}</p>
      ) : (
        <Component concerts={filtered} />
      )}
    </div>
  )
}
