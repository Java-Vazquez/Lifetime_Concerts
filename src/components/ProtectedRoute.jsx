import { Navigate } from 'react-router-dom'
import { useSession } from '../lib/useSession.js'
import { useI18n } from '../lib/i18n.jsx'

export default function ProtectedRoute({ children }) {
  const session = useSession()
  const { t } = useI18n()

  if (session === undefined) {
    return <p className="text-dim">{t('common.loading')}</p>
  }

  if (session === null) {
    return <Navigate to="/login" replace />
  }

  return children
}
