import { Link, NavLink } from 'react-router-dom'
import { useSession } from '../lib/useSession.js'
import { supabase } from '../lib/supabaseClient.js'

export default function NavBar() {
  const session = useSession()

  return (
    <header className="border-b border-edge">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
        <Link to="/" className="text-sm uppercase tracking-[0.2em]">
          Lifetime Concerts
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <NavLink
            to="/estadisticas"
            className={({ isActive }) =>
              isActive ? 'text-chalk' : 'text-dim transition-colors hover:text-chalk'
            }
          >
            Estadísticas
          </NavLink>
          {session ? (
            <>
              <NavLink
                to="/agregar"
                className={({ isActive }) =>
                  isActive ? 'text-chalk' : 'text-dim transition-colors hover:text-chalk'
                }
              >
                Agregar
              </NavLink>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-dim transition-colors hover:text-chalk"
              >
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="text-dim transition-colors hover:text-chalk">
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
