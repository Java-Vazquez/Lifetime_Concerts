import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import { yearOf } from './dates.js'

// Cuenta ocurrencias y devuelve el top n como [{ label, value }].
function topBy(items, key, n) {
  const counts = new Map()
  for (const it of items) {
    const k = typeof key === 'function' ? key(it) : it[key]
    if (!k) continue
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, n)
}

// setlist.fm anota partes del show que no son canciones ("Drum Solo", "Intro").
// Sumadas al ranking dan resultados sin sentido, porque las repite cualquier banda.
const PLACEHOLDER = /^(?:\w+\s+)?(?:solo|jam)$|^(?:intro|outro|interlude|intermission)$/i

function isPlaceholder(name) {
  return PLACEHOLDER.test(name.trim())
}

function buildStats(concerts, songs) {
  const byDate = [...concerts].sort((a, b) => a.event_date.localeCompare(b.event_date))
  const first = byDate[0]
  const today = new Date().toISOString().slice(0, 10)
  const past = byDate.filter((c) => c.event_date <= today)
  const upcoming = byDate.filter((c) => c.event_date > today)

  // Años con al menos un show, para el gráfico y para el récord.
  const perYear = new Map()
  for (const c of concerts) {
    const y = yearOf(c.event_date)
    perYear.set(y, (perYear.get(y) ?? 0) + 1)
  }
  const years = [...perYear.entries()].map(([year, shows]) => ({ year, shows })).sort((a, b) => a.year.localeCompare(b.year))
  const busiest = [...years].sort((a, b) => b.shows - a.shows)[0]

  // Pausa más larga entre dos shows consecutivos.
  let longestGap = null
  for (let i = 1; i < byDate.length; i++) {
    const from = byDate[i - 1]
    const to = byDate[i]
    const days = Math.round(
      (new Date(to.event_date) - new Date(from.event_date)) / 86400000,
    )
    if (!longestGap || days > longestGap.days) longestGap = { days, from, to }
  }

  const named = songs.filter(
    (s) => s.name?.trim() && !s.is_tape && !isPlaceholder(s.name),
  )
  const perConcert = new Map()
  for (const s of named) perConcert.set(s.concert_id, (perConcert.get(s.concert_id) ?? 0) + 1)
  const longestSetlist = [...perConcert.entries()]
    .map(([id, count]) => ({ concert: concerts.find((c) => c.id === id), count }))
    .filter((x) => x.concert)
    .sort((a, b) => b.count - a.count)[0]

  return {
    totals: {
      shows: concerts.length,
      artists: new Set(concerts.map((c) => c.artist_name)).size,
      venues: new Set(concerts.map((c) => c.venue_name).filter(Boolean)).size,
      cities: new Set(concerts.map((c) => c.city).filter(Boolean)).size,
      years: perYear.size,
      songs: named.length,
      distinctSongs: new Set(named.map((s) => s.name)).size,
      withSetlist: perConcert.size,
    },
    years,
    busiest,
    first,
    lastPast: past[past.length - 1],
    nextUp: upcoming[0],
    longestGap,
    longestSetlist,
    topVenues: topBy(concerts, 'venue_name', 6),
    repeatArtists: topBy(concerts, 'artist_name', 100).filter((a) => a.value > 1),
    topSongs: topBy(named, 'name', 8).filter((s) => s.value > 1),
    festivals: topBy(concerts, 'festival', 10),
  }
}

// Supabase corta las respuestas en 1000 filas, y las canciones ya pasan ese
// número: sin paginar, las estadísticas saldrían cortas sin avisar.
const PAGE = 1000

async function fetchAll(table, columns) {
  const rows = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    rows.push(...data)
    if (data.length < PAGE) return rows
  }
}

export function useStats() {
  const [state, setState] = useState({ stats: null, error: null })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [concerts, songs] = await Promise.all([
          fetchAll('concerts', 'id, artist_name, venue_name, city, event_date, festival'),
          fetchAll('songs', 'concert_id, name, is_tape'),
        ])
        if (cancelled) return
        setState({ stats: buildStats(concerts, songs), error: null })
      } catch (e) {
        if (!cancelled) setState({ stats: null, error: e.message })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
