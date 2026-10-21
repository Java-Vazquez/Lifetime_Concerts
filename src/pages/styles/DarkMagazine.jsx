import { Link } from 'react-router-dom'
import { groupByYear, concertStats } from '../../lib/useConcerts.js'
import { formatDayMonth, formatLong } from '../../lib/dates.js'
import { useI18n } from '../../lib/i18n.jsx'

function Feature({ concert, locale }) {
  return (
    <Link
      to={`/concierto/${concert.id}`}
      className="group relative block aspect-[16/10] overflow-hidden rounded-md bg-surface"
    >
      {concert.image_url && (
        <img
          src={concert.image_url}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      {/* El degradado solo cubre la franja de abajo donde va el texto;
          la foto queda limpia. La sombra en el texto hace el resto. */}
      <div className="absolute inset-0 bg-gradient-to-t from-night/95 from-2% via-night/55 via-24% to-transparent to-52%" />
      <div className="absolute inset-x-0 bottom-0 p-6 [text-shadow:0_1px_5px_rgb(0_0_0_/_0.9)] sm:p-8">
        <p className="eyebrow text-ember">{formatLong(concert.event_date, locale)}</p>
        <h2 className="mt-2 font-archivo text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl">
          {concert.artist_name}
        </h2>
        <p className="mt-2 text-sm text-dim">
          {[concert.venue_name, concert.city].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}

export default function DarkMagazine({ concerts }) {
  const { t, locale } = useI18n()
  const stats = concertStats(concerts)
  const [featured, ...rest] = concerts
  const showsByYear = new Map(groupByYear(concerts).map(([year, cs]) => [year, cs.length]))

  return (
    <div className="font-sans">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-archivo text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl">
          Lifetime
          <br />
          Concerts
        </h1>
        <dl className="flex gap-8">
          {[
            [stats.shows, t('stats.shows')],
            [stats.artists, t('stats.artists')],
            [stats.years, t('stats.years')],
          ].map(([value, label]) => (
            <div key={label} className="text-right">
              <dd className="font-archivo text-3xl font-extrabold">{value}</dd>
              <dt className="eyebrow mt-0.5">{label}</dt>
            </div>
          ))}
        </dl>
      </header>

      {featured && <Feature concert={featured} locale={locale} />}

      <div className="mt-16 space-y-14">
        {groupByYear(rest).map(([year, yearConcerts]) => (
          <section key={year}>
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-ember pb-2">
              <h2 className="font-archivo text-2xl font-extrabold uppercase tracking-tight">
                {year}
              </h2>
              {/* Cuenta sobre el total del año: el show destacado sale de la
                  grilla pero sigue perteneciendo a ese año. */}
              <span className="eyebrow">{t('stats.nShows', showsByYear.get(year))}</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              {yearConcerts.map((concert) => (
                <Link
                  key={concert.id}
                  to={`/concierto/${concert.id}`}
                  className="group flex gap-4"
                >
                  {concert.image_url && (
                    <img
                      src={concert.image_url}
                      alt=""
                      loading="lazy"
                      className="h-24 w-24 shrink-0 rounded-sm object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1 border-b border-edge pb-3">
                    <p className="eyebrow text-ember">
                      {formatDayMonth(concert.event_date, locale)}
                      {concert.festival && <span className="text-dim"> · {concert.festival}</span>}
                    </p>
                    <h3 className="mt-1 font-archivo text-lg font-bold uppercase leading-tight tracking-tight transition-colors group-hover:text-ember">
                      {concert.artist_name}
                    </h3>
                    <p className="truncate text-sm text-dim">
                      {[concert.venue_name, concert.city].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
