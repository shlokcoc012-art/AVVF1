import { useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function AdminLogin() {
  const { login, status } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // If already logged in, bounce to dashboard
  if (status === 'authed') {
    const to = loc.state?.from?.pathname || '/admin'
    return <Navigate to={to} replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      nav('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      data-testid="admin-login-page"
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'radial-gradient(ellipse at top, #2a0e4d 0%, #0a0518 60%, #050207 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/30 mb-4 text-3xl">
            🔮
          </div>
          <h1 className="text-3xl font-black tracking-tight text-amber-300">AstroVedicVani</h1>
          <p className="text-amber-100/60 text-sm mt-1 tracking-widest uppercase">Admin Console</p>
        </div>

        <form
          onSubmit={onSubmit}
          data-testid="admin-login-form"
          className="bg-white/5 backdrop-blur-xl border border-amber-300/20 rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-amber-100 text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-amber-100/50 text-sm mb-6">Sign in to manage bookings</p>

          <label className="block text-amber-100/80 text-xs font-semibold mb-1.5 tracking-wide uppercase">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            data-testid="admin-login-email"
            placeholder="admin@astrovedicvani.com"
            className="w-full mb-4 px-4 py-3 bg-black/30 border border-amber-200/20 rounded-xl text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
          />

          <label className="block text-amber-100/80 text-xs font-semibold mb-1.5 tracking-wide uppercase">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            data-testid="admin-login-password"
            placeholder="••••••••"
            className="w-full mb-2 px-4 py-3 bg-black/30 border border-amber-200/20 rounded-xl text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
          />

          {error && (
            <div
              data-testid="admin-login-error"
              className="mt-3 mb-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/30 text-red-200 text-sm"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="admin-login-submit"
            className="w-full mt-5 py-3 rounded-xl font-bold text-amber-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
          >
            {submitting ? 'Signing in…' : 'Sign in →'}
          </button>

          <p className="text-amber-100/40 text-xs text-center mt-5">
            Restricted area · Authorized personnel only
          </p>
        </form>

        <p className="text-center mt-6">
          <a href="/" className="text-amber-300/60 hover:text-amber-200 text-sm">← Back to site</a>
        </p>
      </div>
    </div>
  )
}
