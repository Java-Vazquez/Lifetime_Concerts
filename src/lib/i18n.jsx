import { createContext, useContext, useEffect, useState } from 'react'

// Traducciones a mano: son unas sesenta cadenas y dos idiomas, así que una
// librería de i18n pesaría más que el diccionario entero.
// Los valores con datos variables son funciones; el resto, texto plano.
const DICT = {
  es: {
    'nav.stats': 'Estadísticas',
    'nav.add': 'Agregar',
    'nav.login': 'Entrar',
    'nav.logout': 'Salir',
    'footer.credits': 'Setlists de setlist.fm · Imágenes de Deezer',

    'common.loading': 'Cargando…',
    'common.shows': 'shows',
    'common.artists': 'artistas',
    'common.years': 'años',

    'home.error': (m) => `Error cargando conciertos: ${m}`,
    'home.empty': 'Todavía no cargaste ningún concierto.',
    'home.noMatch': 'Ningún show coincide con esa búsqueda.',
    'home.viewMode': 'Modo de vista',
    'home.view.wall': 'Muro',
    'home.view.magazine': 'Revista',
    'home.tagline': 'Una vida en conciertos',

    'filter.placeholder': 'Buscar banda, venue, festival…',
    'filter.label': 'Buscar conciertos',
    'filter.all': 'Todos',
    'filter.results': (n, total) => `${n} de ${total} shows`,
    'filter.clear': 'limpiar',

    'detail.back': '← Todos los shows',
    'detail.notFound': 'No se encontró el concierto.',

    'setlist.title': 'Lo que se tocó',
    'setlist.viewOn': 'Ver en setlist.fm',
    'setlist.unavailable': 'No hay setlist de este show en setlist.fm.',
    'setlist.load': 'Ver las canciones que se tocaron ese día',
    'setlist.loading': 'Buscando…',
    'setlist.error': 'No se pudo cargar el setlist.',

    'stats.title': 'Estadísticas',
    'stats.shows': 'Shows',
    'stats.artists': 'Artistas',
    'stats.years': 'Años',
    'stats.venues': 'Venues',
    'stats.songs': 'Canciones',
    'stats.songsHint': 'tocadas en vivo',
    'stats.unique': 'Distintas',
    'stats.uniqueHint': 'sin repetir',
    'stats.cities': 'Ciudades',
    'stats.festivals': 'Festivales',
    'stats.perYear': 'Shows por año',
    'stats.moments': 'Momentos',
    'stats.first': 'El primero',
    'stats.record': 'Año récord',
    'stats.gap': 'La pausa más larga',
    'stats.longest': 'El setlist más largo',
    'stats.next': 'El próximo',
    'stats.between': (a, b) => `entre ${a} y ${b}`,
    'stats.nYears': (n) => `${n} ${n === 1 ? 'año' : 'años'}`,
    'stats.nSongs': (n) => `${n} ${n === 1 ? 'canción' : 'canciones'}`,
    'stats.nShows': (n) => `${n} ${n === 1 ? 'show' : 'shows'}`,
    'stats.nBands': (n) => `${n} ${n === 1 ? 'banda' : 'bandas'}`,
    'stats.nTimes': (n) => `${n} ${n === 1 ? 'vez' : 'veces'}`,
    'stats.nVenues': (n) => `${n} ${n === 1 ? 'venue' : 'venues'}`,
    'stats.topVenues': 'Venues más visitados',
    'stats.repeatBands': 'Bandas repetidas',
    'stats.repeatSongs': 'Canciones repetidas',

    'login.title': 'Entrar',
    'login.email': 'Email',
    'login.password': 'Contraseña',
    'login.submit': 'Entrar',
    'login.submitting': 'Entrando…',
    'login.note':
      'Solo para el dueño del sitio. El usuario se crea desde el dashboard de Supabase (Authentication → Users).',

    'add.title': 'Agregar concierto',
    'add.intro': 'Buscá el show en setlist.fm y confirmá cuál fue el que viste.',
    'add.artist': 'Artista',
    'add.date': 'Fecha',
    'add.city': 'Ciudad (opcional)',
    'add.cityPlaceholder': 'Ciudad de México',
    'add.search': 'Buscar setlist',
    'add.searching': 'Buscando…',

    'preview.none':
      'No se encontró ningún setlist con esos datos. Probá ajustando el nombre del artista, la fecha o la ciudad.',
    'preview.header': (n) =>
      `${n} ${n === 1 ? 'resultado' : 'resultados'} · elegí el correcto`,
    'preview.save': 'Guardar',
    'preview.saving': 'Guardando…',
  },

  en: {
    'nav.stats': 'Statistics',
    'nav.add': 'Add',
    'nav.login': 'Log in',
    'nav.logout': 'Log out',
    'footer.credits': 'Setlists from setlist.fm · Images from Deezer',

    'common.loading': 'Loading…',
    'common.shows': 'shows',
    'common.artists': 'artists',
    'common.years': 'years',

    'home.error': (m) => `Error loading concerts: ${m}`,
    'home.empty': "You haven't added any concerts yet.",
    'home.noMatch': 'No shows match that search.',
    'home.viewMode': 'View mode',
    'home.view.wall': 'Wall',
    'home.view.magazine': 'Magazine',
    'home.tagline': 'A life in concerts',

    'filter.placeholder': 'Search band, venue, festival…',
    'filter.label': 'Search concerts',
    'filter.all': 'All',
    'filter.results': (n, total) => `${n} of ${total} shows`,
    'filter.clear': 'clear',

    'detail.back': '← All shows',
    'detail.notFound': 'Concert not found.',

    'setlist.title': 'What they played',
    'setlist.viewOn': 'View on setlist.fm',
    'setlist.unavailable': "setlist.fm doesn't have a setlist for this show.",
    'setlist.load': 'See what was played that night',
    'setlist.loading': 'Loading…',
    'setlist.error': "Couldn't load the setlist.",

    'stats.title': 'Statistics',
    'stats.shows': 'Shows',
    'stats.artists': 'Artists',
    'stats.years': 'Years',
    'stats.venues': 'Venues',
    'stats.songs': 'Songs',
    'stats.songsHint': 'played live',
    'stats.unique': 'Unique',
    'stats.uniqueHint': 'no repeats',
    'stats.cities': 'Cities',
    'stats.festivals': 'Festivals',
    'stats.perYear': 'Shows per year',
    'stats.moments': 'Milestones',
    'stats.first': 'The first one',
    'stats.record': 'Record year',
    'stats.gap': 'The longest gap',
    'stats.longest': 'The longest setlist',
    'stats.next': 'Up next',
    'stats.between': (a, b) => `between ${a} and ${b}`,
    'stats.nYears': (n) => `${n} ${n === 1 ? 'year' : 'years'}`,
    'stats.nSongs': (n) => `${n} ${n === 1 ? 'song' : 'songs'}`,
    'stats.nShows': (n) => `${n} ${n === 1 ? 'show' : 'shows'}`,
    'stats.nBands': (n) => `${n} ${n === 1 ? 'band' : 'bands'}`,
    'stats.nTimes': (n) => `${n} ${n === 1 ? 'time' : 'times'}`,
    'stats.nVenues': (n) => `${n} ${n === 1 ? 'venue' : 'venues'}`,
    'stats.topVenues': 'Most visited venues',
    'stats.repeatBands': 'Repeat bands',
    'stats.repeatSongs': 'Repeat songs',

    'login.title': 'Log in',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Log in',
    'login.submitting': 'Logging in…',
    'login.note':
      "Site owner only. The user is created from the Supabase dashboard (Authentication → Users).",

    'add.title': 'Add concert',
    'add.intro': 'Find the show on setlist.fm and confirm which one you saw.',
    'add.artist': 'Artist',
    'add.date': 'Date',
    'add.city': 'City (optional)',
    'add.cityPlaceholder': 'Mexico City',
    'add.search': 'Search setlist',
    'add.searching': 'Searching…',

    'preview.none':
      'No setlist found with those details. Try adjusting the artist name, the date or the city.',
    'preview.header': (n) => `${n} ${n === 1 ? 'result' : 'results'} · pick the right one`,
    'preview.save': 'Save',
    'preview.saving': 'Saving…',
  },
}

export const LOCALES = { es: 'es-MX', en: 'en-US' }

const STORAGE_KEY = 'lifetime-concerts:lang'

// Lo que el visitante eligió antes manda; si no, su navegador; si no, español.
function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && DICT[saved]) return saved
  } catch {
    // localStorage puede fallar en modo privado; se cae al idioma del navegador.
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es'
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function setLang(next) {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Sin persistencia el idioma dura la sesión; no es motivo para romper.
    }
  }

  const t = (key, ...args) => {
    const value = DICT[lang][key] ?? DICT.es[key] ?? key
    return typeof value === 'function' ? value(...args) : value
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, locale: LOCALES[lang] }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n necesita estar dentro de <I18nProvider>')
  return ctx
}
