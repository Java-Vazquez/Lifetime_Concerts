import { Link, NavLink } from 'react-router-dom'
import { useSession } from '../lib/useSession.js'
import { supabase } from '../lib/supabaseClient.js'
import { useI18n } from '../lib/i18n.jsx'

const LANGS = [
  { id: 'es', label: 'ES', name: 'Español' },
  { id: 'en', label: 'EN', name: 'English' },
]

function LangToggle() {
  const { lang, setLang } = useI18n()

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className="flex overflow-hidden rounded-full border border-edge"
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          title={l.name}
          className={`px-2.5 py-1 text-[0.68rem] tracking-[0.12em] transition-colors ${
            lang === l.id ? 'bg-chalk text-night' : 'text-dim hover:text-chalk'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

export default function NavBar() {
  const session = useSession()
  const { t } = useI18n()

  const linkClass = ({ isActive }) =>
    isActive ? 'text-chalk' : 'text-dim transition-colors hover:text-chalk'

  return (
    <header className="border-b border-edge">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-5">
        <Link to="/" className="text-sm uppercase tracking-[0.2em]">
          Lifetime Concerts
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <NavLink to="/estadisticas" className={linkClass}>
            {t('nav.stats')}
          </NavLink>
          {session ? (
            <>
              <NavLink to="/agregar" className={linkClass}>
                {t('nav.add')}
              </NavLink>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-dim transition-colors hover:text-chalk"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="text-dim transition-colors hover:text-chalk">
              {t('nav.login')}
            </Link>
          )}
          <LangToggle />
        </div>
      </nav>
    </header>
  )
}
