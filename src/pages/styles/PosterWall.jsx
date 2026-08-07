import { Link } from 'react-router-dom'
import { groupByYear, concertStats } from '../../lib/useConcerts.js'
import { formatDayMonth } from '../../lib/dates.js'

export default function PosterWall({ concerts }) {
  const stats = concertStats(concerts)

  return (
    <div className="font-sans">
      <header className="border-b border-edge pb-10">
        <h1 className="font-anton text-6xl uppercase leading-[0.92] tracking-tight sm:text-8xl">
          Lifetime
          <br />
          <span className="text-ember">Concerts</span>
        </h1>
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
          {[
            [stats.shows, 'shows'],
            [stats.artists, 'artistas'],
            [stats.years, 'años'],
          ].map(([value, label]) => (
            <p key={label} className="font-anton text-3xl uppercase">
              {value} <span className="text-sm tracking-widest text-dim">{label}</span>
            </p>
          ))}
        </div>
      </header>

      <div className="mt-14 space-y-16">
        {groupByYear(concerts).map(([year, yearConcerts]) => (
          <section key={year}>
            <div className="flex items-baseline gap-4">
              <h2 className="font-anton text-4xl uppercase text-ember">{year}</h2>
              <span className="h-px flex-1 bg-edge" />
              <span className="eyebrow">{yearConcerts.length} shows</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {yearConcerts.map((concert) => (
                <Link
                  key={concert.id}
                  to={`/concierto/${concert.id}`}
                  className="group relative aspect-square overflow-hidden rounded-sm bg-surface"
                >
                  {concert.image_url && (
                    <img
                      src={concert.image_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {/* El degradado solo cubre la franja de abajo donde va el texto;
                      la foto queda limpia. La sombra en el texto hace el resto. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-night/95 from-2% via-night/55 via-22% to-transparent to-48%" />
                  <div className="absolute inset-x-0 bottom-0 p-3 [text-shadow:0_1px_4px_rgb(0_0_0_/_0.9)]">
                    <p className="eyebrow text-ember">{formatDayMonth(concert.event_date)}</p>
                    <h3 className="font-anton text-lg uppercase leading-tight">
                      {concert.artist_name}
                    </h3>
                    <p className="truncate text-xs text-dim">
                      {concert.festival ? `${concert.festival} · ` : ''}
                      {concert.venue_name}
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
