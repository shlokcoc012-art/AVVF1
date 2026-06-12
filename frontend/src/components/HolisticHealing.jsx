import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import { useCart } from '../context/CartContext'

const SECTION = 'Holistic Healing'
const PRICE = 11000

const services = [
  {
    id: 'hh-chronic',  icon: '🌿', title: 'Chronic Disease & Vitality Healing',
    desc: 'Deep distance Reiki and pranic energy channelization aimed at accelerating the body\'s natural recovery from long-term physical ailments and boosting cellular vitality.',
    detail: 'Each session is a 45-minute remote energy transmission focused on diseased tissue, depleted meridians and the immune field — repeated thrice across 7–10 days for compounding effect.',
  },
  {
    id: 'hh-chakra',   icon: '🧘', title: 'Chakra Awakening & Alignment',
    desc: 'A comprehensive scanning, cleansing and balancing of your 7 primary energy centers to remove spiritual blocks and restore absolute emotional harmony.',
    detail: 'Across three sessions we scan each chakra, dissolve blocks at Muladhara to Sahasrara, and seal the field with personalised mantras and crystal recommendations.',
  },
  {
    id: 'hh-trauma',   icon: '💧', title: 'Emotional Trauma & Anxiety Relief',
    desc: 'Targeted distance healing focused on cleansing the aura of past trauma, stress and heavy emotional imprints to bring deep mental peace.',
    detail: 'Combines pranic emotional clearing with a tailored breath-and-mantra sadhana between sessions to rewire the nervous system response to triggers.',
  },
  {
    id: 'hh-aura',     icon: '🛡️', title: 'Aura Cleansing & Shielding',
    desc: 'Removal of negative psychic hooks and external negative energies from your auric field, concluded with a powerful cosmic protective shield.',
    detail: 'Detaches psychic cords from the etheric body, burns away dark imprints in the 2nd auric layer, and anchors a golden Suryadev shield around your field.',
  },
  {
    id: 'hh-karmic',   icon: '🕉️', title: 'Karmic Blockage Dissolution',
    desc: 'High-frequency energy transmission designed to dissolve stubborn energetic blocks in your current life that are stopping your financial or relationship growth.',
    detail: 'Targets Saturn-Rahu karmic knots in the subtle body using Mahamrityunjaya frequency, then anchors a forward-flow current through your 11th house.',
  },
  {
    id: 'hh-awakening', icon: '✂️', title: 'Spiritual Awakening & Cord Cutting',
    desc: 'Energetic cutting of toxic emotional attachments and cords from past relationships, realigning your crown chakra for higher spiritual awareness.',
    detail: 'Sword-of-light cord cutting from named persons, sealing of severed points, and a final crown-chakra activation to elevate your spiritual frequency.',
  },
]

function HealingCard({ s, i }) {
  const [expanded, setExpanded] = useState(false)
  const [ref, inView] = useInView()
  const { addItem, removeItem, hasItem } = useCart()
  const inCart = hasItem(s.id)

  function toggle(e) {
    e.stopPropagation()
    if (inCart) { removeItem(s.id); return }
    addItem(
      { id: s.id, section: SECTION, title: s.title, icon: s.icon, unitPrice: PRICE },
      true,
    )
  }

  return (
    <div
      ref={ref}
      onClick={() => setExpanded(e => !e)}
      className={`group relative rounded-2xl backdrop-blur-sm transition-all duration-500 cursor-pointer overflow-hidden flex flex-col
        ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        ${inCart
          ? 'border-2 border-yellow-400/80 bg-amber-700/80 shadow-lg shadow-yellow-500/20'
          : 'border border-yellow-600/30 bg-amber-800/60 hover:-translate-y-1 hover:shadow-xl hover:border-yellow-400/60 hover:shadow-amber-400/20'
        }`}
      style={{ transitionDelay: `${(i % 3) * 80}ms` }}
    >
      {/* Featured shimmer sweep */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="text-4xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">{s.icon}</div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className={`text-xl font-black leading-tight ${inCart ? 'text-yellow-300' : 'dark-price-anim'}`}>
              ₹{PRICE.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-amber-300/90 tracking-wide uppercase mt-0.5">3 sessions included</span>
            {inCart && <span className="text-[10px] text-yellow-400 font-bold mt-0.5">✓ added</span>}
          </div>
        </div>

        <h3 className="text-yellow-300 font-bold text-lg leading-snug mb-2">{s.title}</h3>
        <p className="text-amber-200/90 text-sm leading-relaxed flex-1">{s.desc}</p>

        <div className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: expanded ? '180px' : '0px', opacity: expanded ? 1 : 0 }}>
          <div className="mt-3 pt-3 border-t border-yellow-600/30">
            <p className="text-amber-100/90 text-xs leading-relaxed">{s.detail}</p>
          </div>
        </div>

        <button
          onClick={toggle}
          data-testid={`healing-${s.id}-toggle`}
          className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
            inCart
              ? 'bg-green-500 text-white border border-green-400 hover:bg-red-500 hover:border-red-400 shadow-md shadow-green-500/30'
              : 'bg-yellow-400 text-amber-900 border border-yellow-300 hover:bg-yellow-300 shadow-md shadow-yellow-400/40 hover:scale-[1.02] hover:shadow-yellow-400/60'
          }`}>
          {inCart
            ? '✓ Added — tap to remove'
            : `🛒 Book — ₹${PRICE.toLocaleString('en-IN')} · 3 sessions`}
        </button>
      </div>
    </div>
  )
}

export default function HolisticHealing() {
  const [titleRef, titleInView] = useInView()

  return (
    <section id="healing" className="py-20 bg-gradient-to-b from-amber-800 to-amber-900 diamond-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div ref={titleRef} className={`text-center mb-14 transition-all duration-700 ${titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-yellow-400 font-semibold text-sm tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <span className="star-pop inline-block">✦</span> Distance Energy Work <span className="star-pop inline-block" style={{animationDelay:'0.7s'}}>✦</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-4">
            Holistic Healing &amp; <span className="text-amber-300">Energy Alignment</span>
          </h2>
          <div className="text-amber-400 text-base font-medium mb-3">समग्र चिकित्सा एवं ऊर्जा संरेखण</div>
          <p className="text-amber-200 text-lg max-w-3xl mx-auto">
            Distance Reiki, pranic healing and chakra realignment performed personally by Pt. N.R. Pathak —
            every booking includes <span className="text-yellow-300 font-bold">3 dedicated sessions</span> spaced for compounding effect.
          </p>

          {/* Flat-price pill */}
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-4 bg-amber-700/60 border-2 border-yellow-500/60 rounded-2xl px-6 py-3 shadow-lg combo-badge-glow">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl sm:text-4xl font-black text-yellow-300 dark-price-anim leading-none">₹{PRICE.toLocaleString('en-IN')}</span>
              <span className="text-amber-100/90 text-sm font-semibold leading-tight self-center">per<br/>booking</span>
            </div>
            <div className="hidden sm:block w-px h-10 bg-yellow-600/50" />
            <div
              className="flex items-center gap-2 text-amber-900 text-sm font-extrabold uppercase tracking-wide bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 px-4 py-1.5 rounded-full shadow-md border border-yellow-200 animate-highlight-pulse"
              data-testid="healing-sessions-highlight"
            >
              <span className="text-amber-700 text-lg leading-none star-pop">✨</span>
              <span>3 Sessions Included</span>
            </div>
          </div>

          <div className="mt-5 h-1 w-24 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full" />
        </div>

        <div id="healing-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => <HealingCard key={s.id} s={s} i={i} />)}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-8 py-4 hover:bg-yellow-400/20 transition-colors duration-300">
            <p className="text-yellow-300 text-base sm:text-lg font-semibold">
              🪔 Remote Energy Work · 🌿 Reiki + Pranic Healing · 🕉️ Mantra-charged Sessions
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
