import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import { yearOf } from './dates.js'
import { isPerformedSong } from './songs.js'

// Cuenta ocurrencias y las devuelve ordenadas como [{ label, value }].
// Sin `n` devuelve la lista completa.
function topBy(items, key, n) {
  const counts = new Map()
  for (const it of items) {
    const k = typeof key === 'function' ? key(it) : it[key]
    if (!k) continue
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const ranked = [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
  return n ? ranked.slice(0, n) : ranked
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

  const named = songs.filter(isPerformedSong)
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
    // Sin recortes: las listas se muestran enteras y la UI les pone scroll.
    topVenues: topBy(concerts, 'venue_name'),
    repeatArtists: topBy(concerts, 'artist_name').filter((a) => a.value > 1),
    topSongs: topBy(named, 'name').filter((s) => s.value > 1),
    festivals: topBy(concerts, 'festival'),
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
