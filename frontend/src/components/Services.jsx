import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import { useCart } from '../context/CartContext'

const services = [
  {
    id: 'svc-rajyoga', icon: '👑', title: 'Raj Yoga Analysis', subtitle: 'राज योग विश्लेषण', price: 2501, wasPrice: 3999, discount: '37% Off',
    color: 'bg-gradient-to-br from-yellow-500 to-amber-600',
    featured: true,
    desc: 'Identify the royal combinations, leadership positions, authority and power encoded in your chart — and the precise Dasha years that activate them.',
    detail: 'Maps all Kendra-Trikona Raj Yogas in your natal chart, assesses their strength via dignity and aspects, and pinpoints the exact Dasha years when they fire.',
    points: ['Kendra-Trikona Raj Yogas', 'Vipreet Raj Yoga', 'Dhana Yoga Mapping', 'Activation Dasha Timing', 'Leadership & Authority Markers', 'Strengthening Remedies'],
  },
  {
    id: 'svc-dhanyoga', icon: '💎', title: 'Dhan Yog Analysis', subtitle: 'धन योग विश्लेषण', price: 2501, wasPrice: 3999, discount: '37% Off',
    color: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    featured: true,
    desc: 'Unlock the wealth-bestowing combinations in your chart — Lakshmi Yoga, Dhana Yoga and money-attracting Dashas that reveal your financial peaks.',
    detail: 'Analyses 2nd, 5th, 9th and 11th house lords, their conjunctions, and active Dasha periods to pinpoint exactly when wealth will flow and from which source.',
    points: ['Lakshmi & Kubera Yogas', '2nd–11th House Synthesis', 'Active Dhana Dasha Periods', 'Sudden Wealth Indicators', 'Investment Timing Windows', 'Wealth-attracting Remedies'],
  },
  {
    id: 'svc-pastlife', icon: '🪷', title: 'Past Life & Karma Analysis', subtitle: 'पूर्व जन्म व कर्म विश्लेषण', price: 2501, wasPrice: 3999, discount: '37% Off',
    color: 'bg-gradient-to-br from-purple-600 via-fuchsia-600 to-amber-600',
    featured: true,
    desc: 'A profound deep-dive into your planetary positions to unlock the secrets of your past life deeds (Sanchita Karma) and discover your true soul purpose and karmic lessons for this current life.',
    detail: 'Decodes Sanchita and Prarabdha karma through Atmakaraka, the Navamsa (D9) and Shastiamsha (D60) charts to reveal exactly which karmic threads are active in this lifetime and how to resolve them.',
    points: ['Past Life Regression via D9 & D60 Charts', 'Pending Karmic Debts (Rinanubandhana)', 'Present Life Soul Purpose (Atmakaraka)', 'Precise Remedial Measures for Karmic Relief'],
  },
  {
    id: 'svc-grah', icon: '🛡️', title: 'Grah Dosh Relief', subtitle: 'ग्रह दोष निवारण', price: 2599, wasPrice: 3999, discount: '35% Off',
    color: 'bg-gradient-to-br from-red-500 to-amber-600',
    desc: 'Identify and neutralize Mangal Dosh, Kaal Sarp, Sade Sati, Pitra Dosh and Nazar Dosh with personalized mantras, gemstones and yantras.',
    detail: 'Identifies the exact nature and affected life areas of each dosha and prescribes precise, tailored upay — not generic solutions — for lasting relief.',
    points: ['Mangal Dosh Nivaran', 'Kaal Sarp Dosh Relief', 'Shani Sade Sati Upay', 'Pitra Dosh Shanti', 'Nazar Dosh Removal', 'Gemstone Recommendations', 'Rudraksha & Yantra Upay', 'Dosha Nivaran Puja Guidance'],
  },
  {
    id: 'svc-muhurt', icon: '🕐', title: 'Shubh Muhurt', subtitle: 'शुभ मुहूर्त', price: 2599, wasPrice: 3999, discount: '35% Off',
    color: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
    desc: 'Auspicious timing for all important life events — marriage, business launch, property purchase, travel and more — to maximise planetary blessings.',
    detail: 'Selects the most auspicious moment using Tithi, Nakshatra, Vara, and your personal Lagna — a powerful Muhurt can carry even modest efforts to great success.',
    points: ['Marriage Muhurt', 'Business Launch Timing', 'Property & Vehicle Purchase', 'Grih Pravesh Puja', 'Travel & Journey', 'Medical Procedure Timing', 'Job Joining Date', 'Investment Timing'],
  },
  {
    id: 'svc-kundali', icon: '💍', title: 'Kundali & Marriage', subtitle: 'कुण्डली मिलान', price: 2199, wasPrice: 3499, discount: '37% Off',
    color: 'bg-gradient-to-br from-rose-500 to-amber-500',
    desc: 'Detailed Kundali matching for marriage compatibility — 36-point Ashtakoot analysis, Mangal Dosh check, Navamsa reading and spouse prediction.',
    detail: 'Goes beyond 36-point Guna Milan — covers Navamsa chart, Mangal Dosh, Upapada Lagna, Darakaraka, and Dasha timing to fully assess compatibility.',
    points: ['36-Point Guna Milan', 'Mangal Dosh Matching', 'Navamsa Chart Reading', 'Spouse Prediction', 'Marriage Timing (Dasha)', 'Post-Marriage Harmony', 'Love vs Arranged Analysis', 'Divorce Yoga Check'],
  },
  {
    id: 'svc-career', icon: '🏆', title: 'Career & Future', subtitle: 'करियर विश्लेषण', price: 2199, wasPrice: 3499, discount: '37% Off',
    color: 'bg-gradient-to-br from-emerald-500 to-amber-600',
    desc: 'In-depth career chart reading — best profession, Raj Yoga identification, business vs job, promotion timing, and 5-year future roadmap.',
    detail: 'Uses the 10th house, D10 chart, and Raj Yoga analysis to map your next 5 years of career trajectory.',
    points: ['10th House Deep Analysis', 'Raj Yoga Identification', 'Business vs Job Guidance', 'Promotion & Rise Timing', 'Dashamsa (D10) Reading', '5-Year Career Roadmap', 'Overseas Career Prospects', 'Best Field & Industry'],
  },
]

function PriceTag({ price, inView }) {
  return (
    <div className={`transition-all duration-700 delay-300 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
      <div className="relative inline-flex items-baseline gap-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5">
        <span className="text-white/70 text-xs">₹</span>
        <span className="text-white font-black text-xl leading-none">{price.toLocaleString('en-IN')}</span>
        <div className="absolute -inset-px rounded-xl bg-white/10 animate-pulse pointer-events-none" />
      </div>
    </div>
  )
}

function ServiceCard({ s, i, onSwap }) {
  const [ref, inView] = useInView()
  const { addItem, removeItem, hasItem, sectionItems } = useCart()
  const inCart = hasItem(s.id)

  function toggle() {
    if (inCart) {
      removeItem(s.id)
      return
    }
    const existing = sectionItems('Services')
    if (existing.length > 0) {
      // Swap: remove existing, add new, notify parent
      existing.forEach(item => removeItem(item.id))
      addItem({ id: s.id, section: 'Services', title: s.title, icon: s.icon, unitPrice: s.price, wasPrice: s.wasPrice, discount: s.discount }, true)
      onSwap(existing[0].title, s.title)
    } else {
      addItem({ id: s.id, section: 'Services', title: s.title, icon: s.icon, unitPrice: s.price, wasPrice: s.wasPrice, discount: s.discount }, true)
    }
  }

  const otherInCart = !inCart && sectionItems('Services').length > 0

  return (
    <div
      ref={ref}
      id={s.id}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-xl border transition-all duration-700 hover:shadow-2xl hover:shadow-amber-200/50
        ${inCart ? 'border-green-400 ring-2 ring-green-300' : s.featured ? 'border-yellow-400 featured-glow' : 'border-amber-100'}
        ${s.featured && !inCart ? 'hover:scale-[1.015]' : ''}
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-14'}`}
      style={{ transitionDelay: `${i * 120}ms` }}
    >
      {/* Featured shimmer + "Premium" ribbon — only for highlighted cards */}
      {s.featured && (
        <>
          <div className="featured-shimmer z-[5]" aria-hidden />
          <div className="absolute top-3 right-3 z-20 featured-badge pointer-events-none">
            <div className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-amber-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg border border-yellow-200 flex items-center gap-1">
              <span className="text-amber-700">★</span> Premium
            </div>
          </div>
        </>
      )}
      <div className={`${s.color} p-5 flex items-center gap-4 relative overflow-hidden`}>
        <div className="absolute inset-0 shimmer-sweep opacity-0 group-hover:opacity-100" />
        <div className={`text-5xl relative z-10 group-hover:scale-110 transition-transform duration-300 ${s.featured ? 'star-pop' : ''}`}>{s.icon}</div>
        <div className="relative z-10 flex-1">
          <h3 className="text-2xl font-bold text-white">{s.title}</h3>
          <div className="text-white/80 text-sm">{s.subtitle}</div>
        </div>
        <div className={`relative z-10 flex-shrink-0 ${s.featured ? 'mr-20' : ''}`}>
          <PriceTag price={s.price} inView={inView} />
        </div>
      </div>
      <div className="p-6">
        <p className="text-amber-700 text-sm leading-relaxed mb-4">{s.desc}</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {s.points.map((p, j) => (
            <div key={j} className="flex items-center gap-2 text-xs text-amber-800">
              <span className="text-yellow-500 text-base flex-shrink-0">✦</span> {p}
            </div>
          ))}
        </div>
        <button
          onClick={toggle}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
            inCart
              ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
              : otherInCart
              ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-md hover:shadow-amber-300/40'
              : 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-md hover:shadow-amber-300/40'
          }`}>
          {inCart
            ? <><span>✓</span> Added to Cart</>
            : otherInCart
            ? <><span>🔄</span> Switch to This Service</>
            : <><span>🛒</span> Add to Cart — ₹{s.price.toLocaleString('en-IN')}</>}
        </button>
        {otherInCart && (
          <p className="text-center text-amber-500 text-[10px] mt-1.5">
            Only 1 specialized service per consultation
          </p>
        )}
      </div>
    </div>
  )
}

export default function Services() {
  const [titleRef, titleInView] = useInView()
  const [toast, setToast] = useState(null)

  function handleSwap(removed, added) {
    setToast({ removed, added })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-amber-50 to-yellow-100 diamond-pattern-light relative">
      <div className="max-w-7xl mx-auto px-4">
        <div ref={titleRef} className={`text-center mb-14 transition-all duration-700 ${titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-3">Core Services</div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            Our <span className="text-amber-600">Specialized Services</span>
          </h2>
          <p className="text-amber-700 text-lg max-w-2xl mx-auto">Comprehensive cosmic guidance for every aspect of your life</p>

          {/* One-per-consultation notice */}
          <div className="mt-5 inline-flex items-center gap-2 bg-amber-100 border border-amber-300 rounded-full px-5 py-2 text-amber-700 text-xs font-semibold">
            <span>⚠️</span> Only 1 specialized service can be booked per consultation
          </div>

          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((s, i) => <ServiceCard key={s.id} s={s} i={i} onSwap={handleSwap} />)}
        </div>
      </div>

      {/* Swap toast */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 pointer-events-none ${
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {toast && (
          <div className="bg-amber-900 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3 text-sm font-semibold whitespace-nowrap">
            <span className="text-xl">🔄</span>
            <span>
              <span className="text-amber-300">{toast.removed}</span>
              {' '}replaced with{' '}
              <span className="text-yellow-300">{toast.added}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
