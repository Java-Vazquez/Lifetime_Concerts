// Supabase Edge Function (Deno). Recibe { artistName, date?, city? } y devuelve
// una lista de setlists normalizados. Si no hay SETLISTFM_API_KEY configurada
// (`supabase secrets set SETLISTFM_API_KEY=...`), devuelve datos de ejemplo
// para poder desarrollar el resto de la app sin depender de la key real.

import { sampleSetlists } from './mockData.ts'

const SETLISTFM_BASE = 'https://api.setlist.fm/rest/1.0'

// El navegador llama a esta función desde otro origen (localhost en dev,
// el dominio de GitHub Pages en producción), así que necesita headers CORS
// tanto en el preflight (OPTIONS) como en la respuesta real.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SearchBody {
  artistName: string
  date?: string // YYYY-MM-DD
  city?: string
}

function toSetlistFmDate(isoDate: string): string {
  // setlist.fm espera dd-MM-yyyy
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}

// Deezer usa el hash MD5 del string vacío como foto cuando el artista no tiene.
const BLANK_PICTURE = 'd41d8cd98f00b204e9800998ecf8427e'

// Muchas bandas se escriben estilizadas en Deezer ("KoЯn", "Gho$t", "Mötley Crüe").
// Se llevan a letras latinas simples para poder comparar con el nombre de setlist.fm.
const HOMOGLYPHS: Record<string, string> = {
  'Я': 'r', 'я': 'r', 'Ø': 'o', 'ø': 'o', 'Ð': 'd', 'Æ': 'ae', 'æ': 'ae',
  '$': 's', '¢': 'c', '€': 'e', '@': 'a', 'Ʌ': 'a', '∀': 'a', 'Ǝ': 'e',
}

const norm = (s: string) =>
  s
    .replace(/[ЯяØøÐÆæ$¢€@Ʌ∀Ǝ]/g, (c) => HOMOGLYPHS[c] ?? c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

// Imagen del artista para identificar el concierto en la línea de tiempo.
async function fetchArtistImage(artistName: string): Promise<string | null> {
  const query = artistName.replace(/\s+(featuring|feat\.?|ft\.?|with)\s+.*$/i, '').trim()
  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=10`,
    )
    if (!res.ok) return null
    const results = (await res.json()).data ?? []
    const target = norm(query)
    // Los que no tienen foto se descartan antes de rankear: si no, un homónimo
    // sin imagen puede ganar por nombre exacto y dejar al concierto sin foto.
    const best = results
      .filter((a: any) => a.picture_xl && !a.picture_xl.includes(BLANK_PICTURE))
      .map((a: any) => {
        const n = norm(a.name)
        let s = 0
        if (n === target) s += 1000
        else if (n.startsWith(target) || target.startsWith(n)) s += 300
        else if (n.includes(target)) s += 100
        return { a, s: s + Math.log10((a.nb_fan ?? 0) + 1) * 10 }
      })
      .sort((x: any, y: any) => y.s - x.s)[0]?.a

    return best?.picture_xl ?? null
  } catch {
    return null
  }
}

function normalize(raw: any) {
  return {
    setlistfmId: raw.id,
    artistName: raw.artist?.name ?? '',
    venueName: raw.venue?.name ?? '',
    city: raw.venue?.city?.name ?? '',
    country: raw.venue?.city?.country?.name ?? '',
    eventDate: raw.eventDate?.split('-').reverse().join('-') ?? '', // dd-MM-yyyy -> yyyy-MM-dd
    songs: (raw.sets?.set ?? []).flatMap((set: any, setIndex: number) =>
      (set.song ?? []).map((song: any, i: number) => ({
        position: setIndex * 100 + i + 1,
        name: song.name,
        info: set.encore ? 'encore' : song.info ?? null,
        isTape: Boolean(song.tape),
      })),
    ),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  let body: SearchBody
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  if (!body.artistName) {
    return new Response(JSON.stringify({ error: 'artistName es requerido' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const apiKey = Deno.env.get('SETLISTFM_API_KEY')

  if (!apiKey) {
    const results = sampleSetlists.filter((s) =>
      s.artistName.toLowerCase().includes(body.artistName.toLowerCase()),
    )
    return new Response(JSON.stringify({ results, mock: true }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const params = new URLSearchParams({ artistName: body.artistName })
  if (body.date) params.set('date', toSetlistFmDate(body.date))
  if (body.city) params.set('cityName', body.city)

  const res = await fetch(`${SETLISTFM_BASE}/search/setlists?${params}`, {
    headers: {
      'x-api-key': apiKey,
      Accept: 'application/json',
    },
  })

  if (res.status === 404) {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: `setlist.fm respondió ${res.status}` }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const data = await res.json()
  const results = (data.setlist ?? []).map(normalize)

  // Una búsqueda por artista distinto: setlist.fm mezcla bandas tributo
  // ("Some Kind of Metallica"), así que cada resultado necesita su propia imagen.
  const names = [...new Set(results.map((r: any) => r.artistName).filter(Boolean))]
  const images = new Map(
    await Promise.all(
      names.map(async (name) => [name, await fetchArtistImage(name as string)] as const),
    ),
  )
  for (const r of results) r.imageUrl = images.get(r.artistName) ?? null

  return new Response(JSON.stringify({ results, mock: false }), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
})
