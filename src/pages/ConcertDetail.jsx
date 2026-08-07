import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { formatLong } from '../lib/dates.js'
import Setlist from '../components/Setlist.jsx'

export default function ConcertDetail() {
  const { id } = useParams()
  const [concert, setConcert] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('concerts')
      .select('*, songs(*)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setConcert(data)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (error) return <p className="text-ember">No se encontró el concierto.</p>
  if (!concert) return <p className="text-dim">Cargando…</p>

  return (
    <article>
      <Link to="/" className="eyebrow transition-colors hover:text-chalk">
        ← Todos los shows
      </Link>

      <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
        {concert.image_url && (
          <img
            src={concert.image_url}
            alt={concert.artist_name}
            className="h-44 w-44 shrink-0 rounded-md object-cover sm:h-52 sm:w-52"
          />
        )}
        <div>
          <p className="eyebrow text-ember">{formatLong(concert.event_date)}</p>
          <h1 className="mt-2 font-archivo text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl">
            {concert.artist_name}
          </h1>
          {concert.festival && (
            <p className="mt-3">
              <span className="rounded-full border border-ember/50 px-3 py-1 text-xs uppercase tracking-[0.14em] text-ember">
                {concert.festival}
              </span>
            </p>
          )}
          <p className="mt-3 text-dim">
            {[concert.venue_name, concert.city, concert.country].filter(Boolean).join(' · ')}
          </p>
        </div>
      </header>

      <div className="mt-14">
        <Setlist concert={concert} />
      </div>
    </article>
  )
}
