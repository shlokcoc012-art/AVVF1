import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { deriveServiceConcern } from '../lib/derivedBooking'

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

const INDIA_CITIES_BY_STATE = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur', 'Nellore', 'Kurnool'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'],
  'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Navi Mumbai'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Ghaziabad', 'Noida'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
}

const VALID_COUPONS = {
  FIRST50:  { discount: 50, label: '50% off for first-time clients!' },
  ASTRO20:  { discount: 20, label: '20% off — seasonal offer' },
  DIWALI25: { discount: 25, label: '25% Diwali special discount' },
}

const STEPS = ['Personal', 'Birth', 'Confirm']

// IST business hours, 30-min slots
const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00',
]

function fmtSlot(t) {
  const [hh, mm] = t.split(':').map(Number)
  const period = hh >= 12 ? 'PM' : 'AM'
  const h12 = ((hh + 11) % 12) + 1
  return `${h12}:${mm.toString().padStart(2,'0')} ${period}`
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

function tomorrowIso() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

function fmt(n) {
  return '₹' + (n || 0).toLocaleString('en-IN')
}

export default function CartBookingFlow({ onBack, onConfirmed }) {
  const { items: cartItems, mode, subtotal, modeFee, total } = useCart()
  const derived = deriveServiceConcern(cartItems)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    dob: '', tob: '', state: '', city: '',
    preferredDate: tomorrowIso(), preferredTime: '',
    message: '', coupon: '',
  })
  const [errors, setErrors] = useState({})
  const [couponStatus, setCouponStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => {
      const next = { ...f, [name]: value }
      if (name === 'state') next.city = ''
      return next
    })
    if (errors[name]) setErrors(e => { const n = { ...e }; delete n[name]; return n })
  }

  function validatePhone(v) { return /^\d{10}$/.test((v || '').replace(/\s/g, '')) }
  function validateEmail(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }

  function validateStep(s) {
    const ne = {}
    if (s === 0) {
      if (!form.name.trim()) ne.name = 'Name is required'
      if (!validatePhone(form.phone)) ne.phone = 'Enter a valid 10-digit mobile number'
      if (!validateEmail(form.email)) ne.email = 'Enter a valid email (name@domain.com)'
      if (!form.preferredDate) ne.preferredDate = 'Pick a date'
      else if (form.preferredDate < todayIso()) ne.preferredDate = 'Date must be today or later'
      if (!form.preferredTime) ne.preferredTime = 'Pick a time slot'
      // If chosen today, slot must be ≥ ~2 hours from now (callback SLA)
      if (!ne.preferredTime && form.preferredDate === todayIso()) {
        const now = new Date()
        const [hh, mm] = form.preferredTime.split(':').map(Number)
        const slotMins = hh * 60 + mm
        const minMins = now.getHours() * 60 + now.getMinutes() + 120
        if (slotMins < minMins) ne.preferredTime = 'Pick a slot at least 2 hours from now'
      }
    }
    if (s === 1) {
      if (!form.dob) ne.dob = 'Date of birth is required'
      if (!form.state) ne.state = 'State is required'
      if (!form.city) ne.city = 'City is required'
    }
    setErrors(ne)
    return Object.keys(ne).length === 0
  }

  function applyCoupon() {
    const code = (form.coupon || '').trim().toUpperCase()
    if (VALID_COUPONS[code]) setCouponStatus({ valid: true, code, ...VALID_COUPONS[code] })
    else setCouponStatus({ valid: false })
  }

  async function handleSubmit() {
    setLoading(true)
    setSubmitError(null)
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        dob: form.dob || null,
        tob: form.tob || null,
        state: form.state || null,
        city: form.city || null,
        preferred_date: form.preferredDate || null,
        preferred_time: form.preferredTime || null,
        service: derived.service,
        concern: derived.concern,
        mode,
        message: form.message?.trim() || null,
        coupon: couponStatus?.valid ? couponStatus.code : null,
        fromCart: true,
        cartItems: cartItems.map(i => ({
          id: i.id,
          section: i.section,
          title: i.title,
          icon: i.icon || null,
          unitPrice: i.unitPrice,
          wasPrice: i.wasPrice || null,
          discount: i.discount || null,
        })),
        subtotal: subtotal(),
        modeFee,
        total,
      }
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (Array.isArray(data?.detail) && data.detail.map(d => d.msg).join(', ')) ||
                    data?.detail || data?.message || `Booking failed (${res.status})`
        throw new Error(msg)
      }
      onConfirmed({ id: data.id, ...payload })
    } catch (err) {
      setSubmitError(err.message || 'Could not submit booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cities = form.state ? (INDIA_CITIES_BY_STATE[form.state] || []) : []

  return (
    <div className="flex flex-col h-full" data-testid="cart-booking-flow">
      {/* Sub-header with back button + step indicators */}
      <div className="px-4 pt-3 pb-3 border-b border-amber-100 bg-amber-50 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            onClick={onBack}
            data-testid="cart-booking-back"
            className="flex items-center gap-1 text-amber-700 hover:text-amber-900 text-xs font-bold transition-colors">
            ← Back to cart
          </button>
          <div className="text-amber-600 text-[11px] font-semibold">
            Booking for <span className="text-amber-900 font-bold">{derived.summary}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  i === step ? 'bg-amber-700 text-yellow-300' :
                  i < step ? 'bg-amber-200 text-amber-800 cursor-pointer hover:bg-amber-300' :
                  'bg-amber-100 text-amber-400'
                }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${i <= step ? 'bg-black/10' : ''}`}>
                  {i < step ? '✓' : i + 1}
                </span>
                {s}
              </button>
              {i < STEPS.length - 1 && <div className={`w-3 h-0.5 ${i < step ? 'bg-amber-500' : 'bg-amber-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {step === 0 && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-amber-900 font-bold text-sm flex items-center gap-2 mb-2">
              <span className="bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-amber-700 text-[11px] font-bold">1</span>
              Personal Details
            </h3>

            <div>
              <label className="label">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Your Full Name"
                data-testid="cart-booking-name"
                className={`input ${errors.name ? 'border-red-400' : ''}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label">Phone Number *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-amber-100 border border-r-0 border-amber-200 rounded-l-xl text-amber-700 font-semibold text-sm">+91</span>
                <input
                  name="phone" value={form.phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setForm(f => ({ ...f, phone: val }))
                    if (errors.phone) setErrors(er => { const n = { ...er }; delete n.phone; return n })
                  }}
                  required placeholder="10-digit mobile number" maxLength={10} inputMode="numeric"
                  data-testid="cart-booking-phone"
                  className={`input rounded-l-none flex-1 ${errors.phone ? 'border-red-400' : ''}`} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="label">Email (optional)</label>
              <input name="email" value={form.email} onChange={handleChange}
                placeholder="name@domain.com" data-testid="cart-booking-email"
                className={`input ${errors.email ? 'border-red-400' : ''}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Preferred consultation date + time */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-3 space-y-3">
              <div className="text-amber-800 font-bold text-xs flex items-center gap-1.5">
                📅 Preferred Consultation Slot
                <span className="text-amber-500 font-normal">· IST</span>
              </div>
              <div>
                <label className="label">Date *</label>
                <input
                  type="date" name="preferredDate"
                  value={form.preferredDate} onChange={handleChange}
                  min={todayIso()}
                  data-testid="cart-booking-pref-date"
                  className={`input ${errors.preferredDate ? 'border-red-400' : ''}`} />
                {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>}
              </div>
              <div>
                <label className="label">Time slot *</label>
                <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {TIME_SLOTS.map(t => {
                    const selected = form.preferredTime === t
                    return (
                      <button
                        type="button" key={t}
                        onClick={() => { setForm(f => ({ ...f, preferredTime: t })); if (errors.preferredTime) setErrors(er => { const n = { ...er }; delete n.preferredTime; return n }) }}
                        data-testid={`cart-booking-slot-${t}`}
                        className={`text-[11px] font-semibold py-1.5 px-1 rounded-lg border transition-all ${
                          selected
                            ? 'bg-amber-700 text-yellow-200 border-amber-800 shadow-md scale-105'
                            : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100 hover:border-amber-400'
                        }`}>
                        {fmtSlot(t)}
                      </button>
                    )
                  })}
                </div>
                {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime}</p>}
                {form.preferredTime && (
                  <p className="text-amber-600 text-[11px] mt-1.5">
                    ✓ Selected: <strong>{form.preferredDate}</strong> at <strong>{fmtSlot(form.preferredTime)}</strong> IST
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Your Question / Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={3}
                placeholder="Describe your situation briefly..." className="input resize-none" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-amber-900 font-bold text-sm flex items-center gap-2 mb-2">
              <span className="bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-amber-700 text-[11px] font-bold">2</span>
              Birth Details
              <span className="text-[10px] text-amber-500 font-normal">for accurate Kundali</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date of Birth *</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} required
                  data-testid="cart-booking-dob"
                  className={`input ${errors.dob ? 'border-red-400' : ''}`} />
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
              </div>
              <div>
                <label className="label">Time of Birth</label>
                <input type="time" name="tob" value={form.tob} onChange={handleChange} className="input w-full" />
              </div>
            </div>

            <div>
              <label className="label">State *</label>
              <select name="state" value={form.state} onChange={handleChange} required
                data-testid="cart-booking-state"
                className={`input ${errors.state ? 'border-red-400' : ''}`}>
                <option value="">-- Select State --</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="label">City *</label>
              {cities.length > 0 ? (
                <select name="city" value={form.city} onChange={handleChange} required
                  data-testid="cart-booking-city"
                  className={`input ${errors.city ? 'border-red-400' : ''}`}>
                  <option value="">-- Select City --</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other (specify in message)</option>
                </select>
              ) : form.state ? (
                <input name="city" value={form.city} onChange={handleChange} required
                  data-testid="cart-booking-city"
                  placeholder="Enter your city"
                  className={`input ${errors.city ? 'border-red-400' : ''}`} />
              ) : (
                <input disabled placeholder="Select state first" className="input opacity-50 cursor-not-allowed" />
              )}
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-600">
              💡 Exact birth time improves accuracy. Even approximate time (e.g. morning/evening) helps.
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-amber-900 font-bold text-sm flex items-center gap-2 mb-2">
              <span className="bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-amber-700 text-[11px] font-bold">3</span>
              Review & Confirm
            </h3>

            {/* Auto-derived service & concern */}
            <div className="bg-amber-100/60 border-2 border-amber-300 rounded-2xl p-3 text-xs space-y-1.5" data-testid="cart-booking-derived">
              <div className="text-amber-900 font-bold text-[10px] uppercase tracking-widest">From your cart</div>
              <div className="flex justify-between">
                <span className="text-amber-700">Service Type</span>
                <span className="text-amber-900 font-bold" data-testid="cart-booking-service">{derived.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Main Concern</span>
                <span className="text-amber-900 font-bold" data-testid="cart-booking-concern">{derived.concern}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Consultation Mode</span>
                <span className="text-amber-900 font-bold">{mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Preferred Slot</span>
                <span className="text-amber-900 font-bold" data-testid="cart-booking-pref-slot">{form.preferredDate} · {fmtSlot(form.preferredTime)} IST</span>
              </div>
              <div className="border-t border-amber-300 pt-1.5 mt-1.5 flex justify-between">
                <span className="text-amber-700 font-semibold">Total</span>
                <span className="text-amber-900 font-black" data-testid="cart-booking-total">{fmt(total)}</span>
              </div>
            </div>

            {/* Personal summary */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs space-y-1 text-amber-800">
              <div><span className="text-amber-500">Name:</span> <strong>{form.name}</strong></div>
              <div><span className="text-amber-500">Phone:</span> <strong>+91 {form.phone}</strong></div>
              {form.email && <div><span className="text-amber-500">Email:</span> <strong>{form.email}</strong></div>}
              <div><span className="text-amber-500">DOB:</span> <strong>{form.dob}</strong>{form.tob ? <> · <strong>{form.tob}</strong></> : null}</div>
              <div><span className="text-amber-500">Place:</span> <strong>{form.city}, {form.state}</strong></div>
            </div>

            {/* Cart items list */}
            <div className="bg-white border border-amber-200 rounded-2xl p-3">
              <div className="text-amber-900 font-bold text-[10px] uppercase tracking-widest mb-1.5">
                🛒 Services ({cartItems.length})
              </div>
              <div className="space-y-1">
                {cartItems.map(i => (
                  <div key={i.id} className="flex justify-between text-[11px] text-amber-800">
                    <span className="truncate pr-2">{i.icon} {i.title}</span>
                    <span className="font-semibold whitespace-nowrap">{fmt(i.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-3">
              <div className="text-amber-800 font-bold text-xs mb-1.5">🎟️ Have a Coupon Code?</div>
              <div className="flex gap-2">
                <input name="coupon" value={form.coupon}
                  onChange={e => { handleChange(e); setCouponStatus(null) }}
                  placeholder="e.g. FIRST50" className="input flex-1 uppercase tracking-widest text-xs" />
                <button type="button" onClick={applyCoupon}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 rounded-xl text-xs whitespace-nowrap">
                  Apply
                </button>
              </div>
              {couponStatus && (
                <div className={`mt-1.5 text-[11px] font-semibold ${couponStatus.valid ? 'text-green-700' : 'text-red-500'}`}>
                  {couponStatus.valid ? `🎉 Applied! ${couponStatus.label}` : '❌ Invalid coupon. Try FIRST50 or ASTRO20'}
                </div>
              )}
            </div>

            {submitError && (
              <div data-testid="cart-booking-error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-xs text-center">
                {submitError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="px-4 py-3 border-t border-amber-100 bg-white flex-shrink-0 flex gap-2">
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="px-4 py-2.5 rounded-xl border-2 border-amber-300 text-amber-700 font-bold text-xs hover:bg-amber-50 transition-all">
            ← Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button"
            onClick={() => { if (validateStep(step)) setStep(s => s + 1) }}
            data-testid="cart-booking-continue"
            className="flex-1 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md">
            Continue →
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading}
            data-testid="cart-booking-confirm"
            className="flex-1 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-1.5">
            {loading ? <><span className="animate-spin">⟳</span> Confirming...</> : <>🙏 Confirm Booking — {fmt(total)}</>}
          </button>
        )}
      </div>
    </div>
  )
}
