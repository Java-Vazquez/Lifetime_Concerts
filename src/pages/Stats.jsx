import { Link } from 'react-router-dom'
import { useStats } from '../lib/useStats.js'
import { formatLong } from '../lib/dates.js'
import { useI18n } from '../lib/i18n.jsx'
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
  const { t, locale } = useI18n()
  const { stats, error } = useStats()

  if (error) return <p className="text-ember">{t('home.error', error)}</p>
  if (!stats) return <p className="text-dim">{t('common.loading')}</p>

  const { totals, years, busiest, first, nextUp, longestGap, longestSetlist } = stats
  const num = (n) => n.toLocaleString(locale)

  return (
    <div className="flex flex-col gap-14">
      <header>
        <h1 className="font-archivo text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-5xl">
          {t('stats.title')}
        </h1>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          <StatTile label={t('stats.shows')} value={totals.shows} />
          <StatTile label={t('stats.artists')} value={totals.artists} />
          <StatTile label={t('stats.years')} value={totals.years} />
          <StatTile label={t('stats.venues')} value={totals.venues} />
          <StatTile
            label={t('stats.songs')}
            value={num(totals.songs)}
            hint={t('stats.songsHint')}
          />
          <StatTile
            label={t('stats.unique')}
            value={num(totals.distinctSongs)}
            hint={t('stats.uniqueHint')}
          />
          <StatTile label={t('stats.cities')} value={totals.cities} />
          <StatTile label={t('stats.festivals')} value={stats.festivals.length} />
        </div>
      </header>

      <Section title={t('stats.perYear')}>
        <YearColumns data={years} />
      </Section>

      <Section title={t('stats.moments')}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Milestone label={t('stats.first')}>
            <Link to={`/concierto/${first.id}`} className="hover:text-ember">
              <span className="font-archivo text-xl font-bold uppercase">{first.artist_name}</span>
            </Link>
            <p className="text-sm text-dim">{formatLong(first.event_date, locale)}</p>
          </Milestone>

          <Milestone label={t('stats.record')}>
            <p className="font-archivo text-xl font-bold uppercase">{busiest.year}</p>
            <p className="text-sm text-dim">{t('stats.nShows', busiest.shows)}</p>
          </Milestone>

          {longestGap && (
            <Milestone label={t('stats.gap')}>
              <p className="font-archivo text-xl font-bold uppercase">
                {t('stats.nYears', Math.floor(longestGap.days / 365))}
              </p>
              <p className="text-sm text-dim">
                {t('stats.between', longestGap.from.artist_name, longestGap.to.artist_name)}
              </p>
            </Milestone>
          )}

          {longestSetlist && (
            <Milestone label={t('stats.longest')}>
              <Link to={`/concierto/${longestSetlist.concert.id}`} className="hover:text-ember">
                <span className="font-archivo text-xl font-bold uppercase">
                  {longestSetlist.concert.artist_name}
                </span>
              </Link>
              <p className="text-sm text-dim">{t('stats.nSongs', longestSetlist.count)}</p>
            </Milestone>
          )}

          {nextUp && (
            <Milestone label={t('stats.next')}>
              <Link to={`/concierto/${nextUp.id}`} className="hover:text-ember">
                <span className="font-archivo text-xl font-bold uppercase">
                  {nextUp.artist_name}
                </span>
              </Link>
              <p className="text-sm text-dim">{formatLong(nextUp.event_date, locale)}</p>
            </Milestone>
          )}
        </div>
      </Section>

      <div className="grid gap-14 sm:grid-cols-2">
        <Section title={t('stats.topVenues')} note={t('stats.nVenues', stats.topVenues.length)}>
          <BarList data={stats.topVenues} format={(n) => t('stats.nShows', n)} />
        </Section>

        {stats.repeatArtists.length > 0 && (
          <Section
            title={t('stats.repeatBands')}
            note={t('stats.nBands', stats.repeatArtists.length)}
          >
            <BarList data={stats.repeatArtists} format={(n) => t('stats.nTimes', n)} />
          </Section>
        )}
      </div>

      {stats.topSongs.length > 0 && (
        <Section title={t('stats.repeatSongs')} note={t('stats.nSongs', stats.topSongs.length)}>
          <BarList data={stats.topSongs} format={(n) => t('stats.nTimes', n)} />
        </Section>
      )}

      {stats.festivals.length > 0 && (
        <Section title={t('stats.festivals')}>
          <BarList data={stats.festivals} format={(n) => t('stats.nBands', n)} />
        </Section>
      )}
    </div>
  )
}
