// Devuelve el setlist de un concierto ya guardado, trayéndolo de setlist.fm
// la primera vez y guardándolo en la base para las visitas siguientes.
// Escribe con service_role porque el visitante que dispara la carga no tiene
// permiso de escritura bajo RLS.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SETLISTFM_BASE = 'https://api.setlist.fm/rest/1.0'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })

function normalizeSongs(raw: any) {
  return (raw.sets?.set ?? []).flatMap((set: any, setIndex: number) =>
    (set.song ?? []).map((song: any, i: number) => ({
      position: setIndex * 100 + i + 1,
      name: song.name,
      info: set.encore ? 'encore' : song.info ?? null,
      is_tape: Boolean(song.tape),
    })),
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let concertId: string
  try {
    concertId = (await req.json()).concertId
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  if (!concertId) return json({ error: 'concertId es requerido' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: concert, error: concertError } = await supabase
    .from('concerts')
    .select('id, setlistfm_id')
    .eq('id', concertId)
    .single()

  if (concertError || !concert) return json({ error: 'Concierto no encontrado' }, 404)

  const { data: cached } = await supabase
    .from('songs')
    .select('*')
    .eq('concert_id', concertId)
    .order('position')

  if (cached && cached.length > 0) {
    return json({ songs: cached, cached: true })
  }

  if (!concert.setlistfm_id) {
    return json({ songs: [], cached: false, unavailable: true })
  }

  const apiKey = Deno.env.get('SETLISTFM_API_KEY')
  if (!apiKey) return json({ error: 'SETLISTFM_API_KEY no configurada' }, 500)

  const res = await fetch(`${SETLISTFM_BASE}/setlist/${concert.setlistfm_id}`, {
    headers: { 'x-api-key': apiKey, Accept: 'application/json' },
  })

  if (!res.ok) {
    return json({ error: `setlist.fm respondió ${res.status}` }, 502)
  }

  const songs = normalizeSongs(await res.json())

  if (songs.length === 0) {
    return json({ songs: [], cached: false, unavailable: true })
  }

  const { data: inserted, error: insertError } = await supabase
    .from('songs')
    .insert(songs.map((s) => ({ ...s, concert_id: concertId })))
    .select()

  if (insertError) return json({ error: insertError.message }, 500)

  return json({ songs: inserted, cached: false })
})
