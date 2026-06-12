import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function ProtectedRoute({ children }) {
  const { status } = useAuth()
  const loc = useLocation()

  if (status === 'idle' || status === 'loading') {
    return (
      <div
        data-testid="admin-loading"
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at top, #2a0e4d 0%, #0a0518 60%, #050207 100%)' }}
      >
        <div className="text-amber-300/80 text-sm tracking-widest uppercase animate-pulse">
          ✦ Verifying session…
        </div>
      </div>
    )
  }
  if (status === 'guest') {
    return <Navigate to="/admin/login" state={{ from: loc }} replace />
  }
  return children
}
