import { Navigate } from 'react-router-dom'
import { useSession } from '../lib/useSession.js'

export default function ProtectedRoute({ children }) {
  const session = useSession()

  if (session === undefined) {
    return <p className="text-dim">Cargando…</p>
  }

  if (session === null) {
    return <Navigate to="/login" replace />
  }

  return children
}
