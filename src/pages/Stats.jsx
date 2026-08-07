import { Link } from 'react-router-dom'
import { useStats } from '../lib/useStats.js'
import { formatLong } from '../lib/dates.js'
import { StatTile, YearColumns, BarList, Section } from '../components/charts.jsx'

function Milestone({ label, children }) {
  return (
    <div className="border-t border-edge pt-4">
      <p className="eyebrow">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export default function Stats() {
  const { stats, error } = useStats()

  if (error) return <p className="text-ember">Error cargando estadísticas: {error}</p>
  if (!stats) return <p className="text-dim">Cargando…</p>

  const { totals, years, busiest, first, nextUp, longestGap, longestSetlist } = stats
  const sinSetlist = totals.shows - totals.withSetlist

  return (
    <div className="flex flex-col gap-14">
      <header>
        <h1 className="font-archivo text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl">
          Estadísticas
        </h1>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          <StatTile label="Shows" value={totals.shows} />
          <StatTile label="Artistas" value={totals.artists} />
          <StatTile label="Años" value={totals.years} />
          <StatTile label="Venues" value={totals.venues} />
          <StatTile label="Canciones" value={totals.songs.toLocaleString('es-MX')} hint="tocadas en vivo" />
          <StatTile
            label="Distintas"
            value={totals.distinctSongs.toLocaleString('es-MX')}
            hint="sin repetir"
          />
          <StatTile label="Ciudades" value={totals.cities} />
          <StatTile label="Festivales" value={stats.festivals.length} />
        </div>
      </header>

      <Section title="Shows por año">
        <YearColumns data={years} />
      </Section>

      <Section title="Momentos">
        <div className="grid gap-6 sm:grid-cols-2">
          <Milestone label="El primero">
            <Link to={`/concierto/${first.id}`} className="hover:text-ember">
              <span className="font-archivo text-xl font-bold uppercase">{first.artist_name}</span>
            </Link>
            <p className="text-sm text-dim">{formatLong(first.event_date)}</p>
          </Milestone>

          <Milestone label="Año récord">
            <p className="font-archivo text-xl font-bold uppercase">{busiest.year}</p>
            <p className="text-sm text-dim">{busiest.shows} shows</p>
          </Milestone>

          {longestGap && (
            <Milestone label="La pausa más larga">
              <p className="font-archivo text-xl font-bold uppercase">
                {Math.floor(longestGap.days / 365)} años
              </p>
              <p className="text-sm text-dim">
                entre {longestGap.from.artist_name} y {longestGap.to.artist_name}
              </p>
            </Milestone>
          )}

          {longestSetlist && (
            <Milestone label="El setlist más largo">
              <Link to={`/concierto/${longestSetlist.concert.id}`} className="hover:text-ember">
                <span className="font-archivo text-xl font-bold uppercase">
                  {longestSetlist.concert.artist_name}
                </span>
              </Link>
              <p className="text-sm text-dim">{longestSetlist.count} canciones</p>
            </Milestone>
          )}

          {nextUp && (
            <Milestone label="El próximo">
              <Link to={`/concierto/${nextUp.id}`} className="hover:text-ember">
                <span className="font-archivo text-xl font-bold uppercase">
                  {nextUp.artist_name}
                </span>
              </Link>
              <p className="text-sm text-dim">{formatLong(nextUp.event_date)}</p>
            </Milestone>
          )}
        </div>
      </Section>

      <div className="grid gap-14 sm:grid-cols-2">
        <Section title="Venues más visitados">
          <BarList data={stats.topVenues} unit="shows" />
        </Section>

        {stats.repeatArtists.length > 0 && (
          <Section title="Bandas repetidas" note={`${stats.repeatArtists.length} bandas`}>
            <BarList data={stats.repeatArtists.slice(0, 6)} unit="veces" />
          </Section>
        )}
      </div>

      {stats.topSongs.length > 0 && (
        <Section
          title="Canciones más escuchadas"
          note={sinSetlist > 0 ? `${totals.withSetlist} de ${totals.shows} shows` : undefined}
        >
          <BarList data={stats.topSongs} unit="veces" />
          {sinSetlist > 0 && (
            <p className="mt-5 text-xs text-dim">
              setlist.fm no tiene el setlist de {sinSetlist} de tus shows, así que esas
              canciones no entran en la cuenta.
            </p>
          )}
        </Section>
      )}

      {stats.festivals.length > 0 && (
        <Section title="Festivales">
          <BarList data={stats.festivals} unit="bandas" />
        </Section>
      )}
    </div>
  )
}
