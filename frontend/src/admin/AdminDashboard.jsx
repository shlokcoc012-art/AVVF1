import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pending',   tone: 'amber'  },
  { value: 'contacted', label: 'Contacted', tone: 'sky'    },
  { value: 'confirmed', label: 'Confirmed', tone: 'indigo' },
  { value: 'completed', label: 'Completed', tone: 'emerald'},
  { value: 'cancelled', label: 'Cancelled', tone: 'rose'   },
]

const TONE_CLASSES = {
  amber:   'bg-amber-400/10   border-amber-300/30   text-amber-200',
  sky:     'bg-sky-400/10     border-sky-300/30     text-sky-200',
  indigo:  'bg-indigo-400/10  border-indigo-300/30  text-indigo-200',
  emerald: 'bg-emerald-400/10 border-emerald-300/30 text-emerald-200',
  rose:    'bg-rose-400/10    border-rose-300/30    text-rose-200',
}

const STATUS_TONE = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s.tone]))

function fmtINR(n) {
  if (n == null || n === '') return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function StatusPill({ status }) {
  const tone = STATUS_TONE[status] || 'amber'
  return (
    <span
      data-testid={`status-pill-${status}`}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${TONE_CLASSES[tone]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  )
}

function StatCard({ label, value, tone = 'amber', testid }) {
  return (
    <div
      data-testid={testid}
      className={`rounded-2xl border ${TONE_CLASSES[tone]} backdrop-blur-sm px-5 py-4 transition-all hover:scale-[1.02]`}
    >
      <div className="text-[10px] uppercase tracking-widest opacity-70 font-semibold">{label}</div>
      <div className="text-3xl font-black mt-1">{value}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout, authFetch, token } = useAuth()

  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, contacted: 0, confirmed: 0, completed: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    if (statusFilter !== 'all') p.set('status', statusFilter)
    if (serviceFilter !== 'all') p.set('service', serviceFilter)
    if (dateFrom) p.set('date_from', dateFrom)
    if (dateTo) p.set('date_to', dateTo)
    if (search.trim()) p.set('search', search.trim())
    return p.toString()
  }, [statusFilter, serviceFilter, dateFrom, dateTo, search])

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(`/api/admin/bookings?${queryString}`)
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = await res.json()
      setBookings(data.items || [])
      setStats(data.stats || stats)
    } catch (e) {
      setError(e.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [authFetch, queryString, stats])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchList() }, [fetchList])

  useEffect(() => {
    const id = setTimeout(() => { fetchList() }, 300)
    return () => clearTimeout(id)
    // fetchList is intentionally omitted — search updates queryString which already triggers fetchList; debounce here only when typing in the search box.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // Services list derived from data for filter dropdown
  const serviceOptions = useMemo(() => {
    const s = new Set(bookings.map(b => b.service).filter(Boolean))
    return ['all', ...Array.from(s).sort()]
  }, [bookings])

  function exportCsv() {
    const url = `/api/admin/bookings/export?${queryString}`
    // Token-protected; fetch + download blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a')
        const u = URL.createObjectURL(blob)
        a.href = u
        a.download = `bookings_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(u)
      })
  }

  function clearFilters() {
    setStatusFilter('all'); setServiceFilter('all')
    setDateFrom(''); setDateTo(''); setSearch('')
  }

  return (
    <div
      data-testid="admin-dashboard"
      className="min-h-screen text-amber-50"
      style={{ background: 'radial-gradient(ellipse at top, #2a0e4d 0%, #0a0518 60%, #050207 100%)' }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/40 border-b border-amber-300/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/30">🔮</div>
            <div>
              <div className="font-black text-amber-200 tracking-tight">AstroVedicVani</div>
              <div className="text-[10px] uppercase tracking-widest text-amber-200/50">Admin Console</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-amber-100 text-sm font-semibold" data-testid="admin-user-name">{user?.name || 'Admin'}</div>
              <div className="text-amber-300/60 text-[11px]">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              data-testid="admin-logout-btn"
              className="px-4 py-2 rounded-xl bg-amber-300/10 border border-amber-300/30 text-amber-200 text-sm font-semibold hover:bg-amber-300/20 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8" data-testid="admin-stats">
          <StatCard label="Total"     value={stats.total}     tone="amber"   testid="stat-total" />
          <StatCard label="Pending"   value={stats.pending}   tone="amber"   testid="stat-pending" />
          <StatCard label="Contacted" value={stats.contacted} tone="sky"     testid="stat-contacted" />
          <StatCard label="Confirmed" value={stats.confirmed} tone="indigo"  testid="stat-confirmed" />
          <StatCard label="Completed" value={stats.completed} tone="emerald" testid="stat-completed" />
          <StatCard label="Cancelled" value={stats.cancelled} tone="rose"    testid="stat-cancelled" />
        </section>

        {/* Filters */}
        <section className="bg-white/[0.03] border border-amber-300/10 rounded-2xl p-4 mb-6" data-testid="admin-filters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, phone, or email…"
              data-testid="filter-search"
              className="lg:col-span-2 px-4 py-2.5 bg-black/30 border border-amber-200/15 rounded-xl text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-400/60 transition-all"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              data-testid="filter-status"
              className="px-3 py-2.5 bg-black/30 border border-amber-200/15 rounded-xl text-amber-50 focus:outline-none focus:border-amber-400/60"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              data-testid="filter-service"
              className="px-3 py-2.5 bg-black/30 border border-amber-200/15 rounded-xl text-amber-50 focus:outline-none focus:border-amber-400/60"
            >
              <option value="all">All services</option>
              {serviceOptions.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              data-testid="filter-date-from"
              className="px-3 py-2.5 bg-black/30 border border-amber-200/15 rounded-xl text-amber-50 focus:outline-none focus:border-amber-400/60"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              data-testid="filter-date-to"
              className="px-3 py-2.5 bg-black/30 border border-amber-200/15 rounded-xl text-amber-50 focus:outline-none focus:border-amber-400/60"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-amber-200/60 text-xs">
              {loading ? 'Loading…' : `${bookings.length} booking${bookings.length === 1 ? '' : 's'}`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                data-testid="filter-clear"
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-amber-200/15 text-amber-200/80 text-xs font-semibold hover:bg-white/10"
              >
                Clear filters
              </button>
              <button
                onClick={exportCsv}
                data-testid="export-csv-btn"
                className="px-3 py-1.5 rounded-lg bg-amber-400/15 border border-amber-300/40 text-amber-100 text-xs font-bold hover:bg-amber-400/25"
              >
                ⬇ Export CSV
              </button>
            </div>
          </div>
        </section>

        {/* List */}
        {error && (
          <div data-testid="admin-error" className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-200 text-sm">
            {error}
          </div>
        )}

        <section className="bg-white/[0.03] border border-amber-300/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm" data-testid="bookings-table">
            <thead className="bg-amber-300/5 text-amber-200/70 text-[11px] uppercase tracking-widest">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Customer</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Service</th>
                <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Mode</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Total</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-amber-200/40" data-testid="no-bookings">
                  No bookings match the current filters.
                </td></tr>
              )}
              {bookings.map(b => (
                <tr
                  key={b.id}
                  data-testid={`booking-row-${b.id}`}
                  onClick={() => setSelectedId(b.id)}
                  className="border-t border-amber-300/5 hover:bg-amber-400/5 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="text-amber-100 font-semibold">{b.name}</div>
                    <div className="text-amber-200/50 text-xs">+91 {b.phone}{b.email ? ` · ${b.email}` : ''}</div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="text-amber-100/90">{b.service}</div>
                    <div className="text-amber-200/40 text-xs truncate max-w-[180px]">{b.concern}</div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-amber-200/80 capitalize">{b.mode}</td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-amber-100/90 font-semibold">{fmtINR(b.total)}</td>
                  <td className="px-5 py-3.5"><StatusPill status={b.status} /></td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-amber-200/60 text-xs">{fmtDate(b.created_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      data-testid={`view-${b.id}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(b.id) }}
                      className="px-3 py-1.5 rounded-lg bg-amber-300/10 border border-amber-300/20 text-amber-200 text-xs font-semibold hover:bg-amber-300/20"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {selectedId && (
        <BookingDetailDrawer
          bookingId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={() => fetchList()}
        />
      )}
    </div>
  )
}

function BookingDetailDrawer({ bookingId, onClose, onUpdated }) {
  const { authFetch } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError(null); setSaved(false)
      try {
        const res = await authFetch(`/api/admin/bookings/${bookingId}`)
        if (!res.ok) throw new Error(`Failed to load (${res.status})`)
        const data = await res.json()
        if (cancelled) return
        setBooking(data); setNotes(data.notes || '')
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load booking')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [bookingId, authFetch])

  async function setStatus(newStatus) {
    setSaving(true)
    try {
      const res = await authFetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
      const data = await res.json()
      setBooking(data)
      onUpdated?.()
    } catch (e) {
      setError(e.message || 'Update failed')
    } finally { setSaving(false) }
  }

  async function saveNotes() {
    setSaving(true); setSaved(false)
    try {
      const res = await authFetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setBooking(data); setSaved(true)
      onUpdated?.()
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
        data-testid="drawer-backdrop"
      />
      <aside
        data-testid="booking-detail-drawer"
        className="fixed top-0 right-0 h-full w-full max-w-2xl z-50 overflow-y-auto shadow-2xl border-l border-amber-300/20"
        style={{ background: 'linear-gradient(180deg, #1c0a3a 0%, #0a0518 70%)' }}
      >
        <div className="sticky top-0 backdrop-blur-xl bg-black/50 border-b border-amber-300/15 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-200/50">Booking</div>
            <div className="text-amber-100 font-bold text-sm font-mono">#{bookingId.slice(-8)}</div>
          </div>
          <button
            onClick={onClose}
            data-testid="drawer-close"
            className="w-9 h-9 rounded-lg bg-white/5 border border-amber-200/20 text-amber-200 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 text-amber-50">
          {loading && <div className="text-amber-200/60 text-sm">Loading booking…</div>}
          {error && <div className="text-rose-300 text-sm">{error}</div>}
          {booking && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-amber-200" data-testid="detail-name">{booking.name}</h2>
                  <div className="text-amber-100/70 text-sm mt-1" data-testid="detail-phone">+91 {booking.phone}{booking.email ? ` · ${booking.email}` : ''}</div>
                </div>
                <StatusPill status={booking.status} />
              </div>

              {/* Status actions */}
              <div className="bg-white/[0.03] border border-amber-300/10 rounded-2xl p-4 mb-5">
                <div className="text-[10px] uppercase tracking-widest text-amber-200/60 font-semibold mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2" data-testid="status-actions">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      disabled={saving || booking.status === s.value}
                      data-testid={`set-status-${s.value}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        booking.status === s.value
                          ? `${TONE_CLASSES[s.tone]} ring-2 ring-current/20 cursor-default`
                          : 'bg-white/5 border-amber-200/15 text-amber-100/70 hover:bg-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking details grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <Field label="Service"  value={booking.service} testid="detail-service" />
                <Field label="Concern"  value={booking.concern} />
                <Field label="Mode"     value={booking.mode} />
                <Field label="Total"    value={fmtINR(booking.total)} testid="detail-total" />
                <Field label="Pref. Date" value={booking.preferred_date || '—'} />
                <Field label="Pref. Time" value={booking.preferred_time || '—'} />
                <Field label="DOB"       value={booking.dob || '—'} />
                <Field label="Time of Birth" value={booking.tob || '—'} />
                <Field label="Place"     value={[booking.city, booking.state].filter(Boolean).join(', ') || '—'} />
                <Field label="Coupon"    value={booking.coupon || '—'} />
                <Field label="From Cart" value={booking.from_cart ? 'Yes' : 'No'} />
                <Field label="Created"   value={fmtDate(booking.created_at)} />
              </div>

              {booking.message && (
                <div className="bg-white/[0.03] border border-amber-300/10 rounded-2xl p-4 mb-5">
                  <div className="text-[10px] uppercase tracking-widest text-amber-200/60 font-semibold mb-2">Customer message</div>
                  <p className="text-amber-100/90 text-sm whitespace-pre-wrap">{booking.message}</p>
                </div>
              )}

              {Array.isArray(booking.cart_items) && booking.cart_items.length > 0 && (
                <div className="bg-white/[0.03] border border-amber-300/10 rounded-2xl p-4 mb-5" data-testid="detail-cart-items">
                  <div className="text-[10px] uppercase tracking-widest text-amber-200/60 font-semibold mb-3">Cart items ({booking.cart_items.length})</div>
                  <div className="space-y-2">
                    {booking.cart_items.map((it, i) => (
                      <div key={i} className="flex justify-between text-sm border-b border-amber-300/5 pb-2 last:border-0">
                        <span className="text-amber-100/90">{it.icon ? `${it.icon} ` : ''}{it.title}</span>
                        <span className="text-amber-200 font-semibold">{fmtINR(it.unit_price)}</span>
                      </div>
                    ))}
                    {booking.subtotal != null && (
                      <div className="flex justify-between text-amber-200/70 text-xs pt-1">
                        <span>Subtotal</span><span>{fmtINR(booking.subtotal)}</span>
                      </div>
                    )}
                    {booking.mode_fee != null && (
                      <div className="flex justify-between text-amber-200/70 text-xs">
                        <span>Mode fee</span><span>{fmtINR(booking.mode_fee)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white/[0.03] border border-amber-300/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] uppercase tracking-widest text-amber-200/60 font-semibold">Internal notes</div>
                  {saved && <span className="text-emerald-300 text-[10px] font-bold">✓ Saved</span>}
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  data-testid="detail-notes-input"
                  placeholder="Add a note (visible only to admins)…"
                  className="w-full px-3 py-2 bg-black/30 border border-amber-200/15 rounded-xl text-amber-50 placeholder-amber-100/30 focus:outline-none focus:border-amber-400/60 resize-none text-sm"
                />
                <button
                  onClick={saveNotes}
                  disabled={saving || notes === (booking.notes || '')}
                  data-testid="detail-notes-save"
                  className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-300 to-amber-500 text-amber-950 font-bold text-xs hover:from-amber-200 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save note'}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

function Field({ label, value, testid }) {
  return (
    <div className="bg-white/[0.03] border border-amber-300/10 rounded-xl px-3 py-2">
      <div className="text-[9px] uppercase tracking-widest text-amber-200/50 font-semibold">{label}</div>
      <div className="text-amber-100 text-sm font-semibold mt-0.5 break-words" data-testid={testid}>{value}</div>
    </div>
  )
}
