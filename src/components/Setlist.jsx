import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

// setlist.fm incluye intros/outros grabadas sin nombre; no aportan nada en la lista.
export function sortSongs(songs) {
  return [...songs].filter((s) => s.name?.trim()).sort((a, b) => a.position - b.position)
}

export default function Setlist({ concert }) {
  const [songs, setSongs] = useState(sortSongs(concert.songs ?? []))
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(!concert.setlistfm_id)
  const [error, setError] = useState(null)

  async function loadSetlist() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.functions.invoke('get-setlist', {
      body: { concertId: concert.id },
    })

    setLoading(false)

    if (error) {
      setError('No se pudo cargar el setlist.')
      return
    }
    if (data.unavailable) {
      setUnavailable(true)
      return
    }
    setSongs(sortSongs(data.songs))
  }

  if (songs.length > 0) {
    return (
      <section>
        <h2 className="eyebrow border-b border-edge pb-3">Lo que se tocó</h2>
        {/* columnas CSS: la lista baja por la izquierda y sigue en la derecha,
            que es como se lee un setlist (grid la ordenaría en zigzag). */}
        <ol className="mt-6 sm:columns-2 sm:gap-x-10">
          {songs.map((song, i) => (
            <li
              key={song.id ?? song.position}
              className="flex gap-3 break-inside-avoid py-1 text-[0.95rem]"
            >
              <span className="w-6 shrink-0 text-right tabular-nums text-dim">{i + 1}</span>
              <span>
                {song.name}
                {song.info && <span className="text-dim"> · {song.info}</span>}
              </span>
            </li>
          ))}
        </ol>
        {concert.setlistfm_id && (
          <a
            href={`https://www.setlist.fm/setlist/${concert.setlistfm_id}.html`}
            target="_blank"
            rel="noreferrer"
            className="eyebrow mt-8 inline-block underline decoration-edge underline-offset-4 hover:text-chalk"
          >
            Ver en setlist.fm
          </a>
        )}
      </section>
    )
  }

  if (unavailable) {
    return (
      <p className="border-t border-edge pt-6 text-sm text-dim">
        No hay setlist de este show en setlist.fm.
      </p>
    )
  }

  return (
    <div className="border-t border-edge pt-6">
      <button
        onClick={loadSetlist}
        disabled={loading}
        className="rounded-sm border border-chalk px-5 py-2.5 text-sm transition-colors hover:bg-chalk hover:text-night disabled:opacity-40"
      >
        {loading ? 'Buscando…' : 'Ver las canciones que se tocaron ese día'}
      </button>
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
    </div>
  )
}
