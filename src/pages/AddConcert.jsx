import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import SetlistPreview from '../components/SetlistPreview.jsx'

const inputClass =
  'w-full rounded-sm border border-edge bg-surface px-3 py-2.5 outline-none transition-colors placeholder:text-dim/70 focus:border-chalk'

export default function AddConcert() {
  const [artistName, setArtistName] = useState('')
  const [date, setDate] = useState('')
  const [city, setCity] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSearch(e) {
    e.preventDefault()
    setError(null)
    setResults(null)
    setSearching(true)

    const { data, error } = await supabase.functions.invoke('fetch-setlist', {
      body: { artistName, date: date || undefined, city: city || undefined },
    })

    setSearching(false)
    if (error) {
      setError(error.message)
      return
    }
    setResults(data.results)
  }

  async function handleConfirm(result) {
    setSaving(true)
    setError(null)

    const { data: concert, error: concertError } = await supabase
      .from('concerts')
      .insert({
        artist_name: result.artistName,
        venue_name: result.venueName,
        city: result.city,
        country: result.country,
        event_date: result.eventDate,
        setlistfm_id: result.setlistfmId,
        image_url: result.imageUrl ?? null,
      })
      .select()
      .single()

    if (concertError) {
      setSaving(false)
      setError(concertError.message)
      return
    }

    if (result.songs.length > 0) {
      const { error: songsError } = await supabase.from('songs').insert(
        result.songs.map((song) => ({
          concert_id: concert.id,
          position: song.position,
          name: song.name,
          info: song.info,
          is_tape: song.isTape,
        })),
      )

      if (songsError) {
        setSaving(false)
        setError(songsError.message)
        return
      }
    }

    setSaving(false)
    navigate(`/concierto/${concert.id}`)
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-archivo font-bold uppercase tracking-tight text-4xl leading-tight">Agregar concierto</h1>
      <p className="mt-3 text-dim">
        Buscá el show en setlist.fm y confirmá cuál fue el que viste.
      </p>

      <form onSubmit={handleSearch} className="mt-10 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="eyebrow">Artista</span>
          <input
            type="text"
            placeholder="Radiohead"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            required
            className={inputClass}
          />
        </label>

        <div className="flex flex-col gap-4 sm:flex-row">
          <label className="flex flex-1 flex-col gap-2">
            <span className="eyebrow">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-1 flex-col gap-2">
            <span className="eyebrow">Ciudad (opcional)</span>
            <input
              type="text"
              placeholder="Ciudad de México"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={searching}
          className="mt-2 self-start rounded-sm border border-chalk px-5 py-2.5 text-sm transition-colors hover:bg-chalk hover:text-night disabled:opacity-40"
        >
          {searching ? 'Buscando…' : 'Buscar setlist'}
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-ember">{error}</p>}

      {results !== null && (
        <div className="mt-12">
          <SetlistPreview results={results} onConfirm={handleConfirm} saving={saving} />
        </div>
      )}
    </div>
  )
}
