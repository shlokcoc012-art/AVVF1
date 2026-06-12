import { useEffect, useState, useCallback } from 'react'
import { AuthContext } from './authContextObject'

const TOKEN_KEY = 'avv_admin_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'authed' | 'guest'

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setStatus('guest')
  }, [])

  // Validate token whenever it changes
  useEffect(() => {
    let cancelled = false
    async function check() {
      if (!token) { setUser(null); setStatus('guest'); return }
      setStatus('loading')
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return
        if (!res.ok) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null); setUser(null); setStatus('guest')
          return
        }
        const data = await res.json()
        setUser(data); setStatus('authed')
      } catch {
        if (!cancelled) { setStatus('guest') }
      }
    }
    check()
    return () => { cancelled = true }
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = (Array.isArray(data?.detail) && data.detail.map(d => d.msg).join(', ')) ||
                  data?.detail || `Login failed (${res.status})`
      throw new Error(typeof msg === 'string' ? msg : 'Login failed')
    }
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    setStatus('authed')
    return data.user
  }, [])

  // Authenticated fetch helper
  const authFetch = useCallback(async (input, init = {}) => {
    const headers = new Headers(init.headers || {})
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const res = await fetch(input, { ...init, headers })
    if (res.status === 401) {
      logout()
    }
    return res
  }, [token, logout])

  return (
    <AuthContext.Provider value={{ token, user, status, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}
