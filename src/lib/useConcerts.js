import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import { yearOf } from './dates.js'

export function useConcerts() {
  const [concerts, setConcerts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('concerts')
      .select('id, artist_name, venue_name, city, event_date, image_url, festival')
      .order('event_date', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setConcerts(data)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { concerts, error }
}

export function groupByYear(concerts) {
  const groups = new Map()
  for (const c of concerts) {
    const year = yearOf(c.event_date)
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year).push(c)
  }
  return [...groups.entries()]
}

export function concertStats(concerts) {
  return {
    shows: concerts.length,
    artists: new Set(concerts.map((c) => c.artist_name)).size,
    years: new Set(concerts.map((c) => yearOf(c.event_date))).size,
  }
}
