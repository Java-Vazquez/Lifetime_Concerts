import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'

const inputClass =
  'w-full rounded-sm border border-edge bg-surface px-3 py-2.5 outline-none transition-colors placeholder:text-dim/70 focus:border-chalk'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/agregar')
  }

  return (
    <div className="max-w-sm">
      <h1 className="font-archivo font-bold uppercase tracking-tight text-4xl leading-tight">Entrar</h1>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="eyebrow">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="eyebrow">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-ember">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 self-start rounded-sm border border-chalk px-5 py-2.5 text-sm transition-colors hover:bg-chalk hover:text-night disabled:opacity-40"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-8 text-sm text-dim">
        Solo para el dueño del sitio. El usuario se crea desde el dashboard de Supabase
        (Authentication → Users).
      </p>
    </div>
  )
}
