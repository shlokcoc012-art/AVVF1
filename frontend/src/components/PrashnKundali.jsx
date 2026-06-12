import { useState, useRef } from 'react'
import { useInView } from '../hooks/useInView'
import { useCart, SECTION_CONFIG, CROSS_COMBO } from '../context/CartContext'

const topics = [
  { id: 'pk-career',       icon: '💼', title: 'Profession & Career',   desc: 'Best career path, job change timing, business success, promotion prospects.',
    detail: 'Uses the 10th house, D10 chart, and active Dasha periods to identify the best career direction and ideal timing for promotions or business launches.' },
  { id: 'pk-wealth',       icon: '💰', title: 'Wealth & Finance',      desc: 'Wealth accumulation periods, financial growth cycles, investments and monetary gains.',
    detail: 'Analyses the 2nd and 11th houses with Dhana Yogas and D2 chart to identify peak financial growth periods and safe investment windows.' },
  { id: 'pk-health',       icon: '🏥', title: 'Health & Longevity',    desc: 'Disease predictions, recovery timing, mental health and overall wellbeing analysis.',
    detail: 'Identifies vulnerable body systems and health risk periods through the 1st, 6th, and 8th houses, with specific protective remedies.' },
  { id: 'pk-married',      icon: '💍', title: 'Married Life',          desc: 'Marriage timing, compatibility, marital harmony, spouse nature and relationship quality.',
    detail: 'Predicts marriage timing via Dasha, spouse nature through the 7th house and Navamsa, and prescribes remedies for lasting marital harmony.' },
  { id: 'pk-children',     icon: '👶', title: 'Children & Progeny',    desc: 'Childbirth timing, child health, education prospects and parent-child relationship.',
    detail: 'Uses the 5th house, Jupiter, and D7 chart to predict the timing of childbirth and identify any Putra Dosha obstructions with remedies.' },
  { id: 'pk-foreign',      icon: '✈️', title: 'Foreign Settlement',    desc: 'Overseas travel, immigration timing, settlement abroad and foreign business prospects.',
    detail: 'Examines the 12th, 9th, and 8th houses to determine if foreign settlement is indicated and the most auspicious Dasha period to apply.' },
  { id: 'pk-relationship', icon: '❤️', title: 'Relationships',         desc: 'Love life, partnerships, family bonds, friendship and emotional connections.',
    detail: 'Analyses love (5th), partnerships (7th), and friendships (11th) to reveal karmic patterns and predict when significant relationships will enter your life.' },
  { id: 'pk-property',     icon: '🏠', title: 'Property & Real Estate', desc: 'Land and property acquisition, home purchase timing, real estate investments.',
    detail: 'Uses the 4th house and D4 chart to predict the best time to buy property and the most favourable direction for your primary residence.' },
  { id: 'pk-education',    icon: '📚', title: 'Education',             desc: 'Academic performance, higher education abroad, competitive exams and learning abilities.',
    detail: 'Uses the D24 chart, 5th and 9th houses to identify the strongest subjects, best exam years, and foreign education prospects.' },
  { id: 'pk-legal',        icon: '⚖️', title: 'Legal Matters',         desc: 'Court cases, legal disputes, favourable outcomes and justice-related predictions.',
    detail: 'Assesses litigation outcomes through the 6th and 8th houses and identifies the most strategic timing for filing or settling legal disputes.' },
  { id: 'pk-spiritual',    icon: '🧘', title: 'Spiritual Growth',      desc: 'Spiritual inclinations, moksha yoga, religious practices and inner transformation.',
    detail: 'Reveals your natural spiritual path, awakening periods, and suitable practices through the 9th, 12th houses and Ketu\'s placement.' },
]

const SECTION = 'Prashn Kundali'
const cfg = SECTION_CONFIG[SECTION]

// ── Cross-combo teaser pill (dark bg) ─────────────────────────────────────────
function CrossComboTeaser({ gridRef }) {
  const { hasCrossCombo, triComboMode, setTriComboMode } = useCart()
  if (hasCrossCombo()) return null
  function activate() {
    setTriComboMode(true)
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  return (
    <button
      onClick={activate}
      className={`group relative overflow-hidden flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border-2 transition-all duration-300
        ${triComboMode
          ? 'border-purple-300 bg-purple-800/60 scale-105 shadow-lg shadow-purple-400/20'
          : 'border-purple-400/50 bg-purple-900/40 hover:border-purple-300 hover:bg-purple-800/50 hover:scale-105'}`}>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      <span className="text-xl">🌟</span>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">Best Value</span>
        <span className="text-sm font-black leading-tight text-purple-200">
          Tri-Reading Combo — ₹{CROSS_COMBO.price.toLocaleString('en-IN')}
        </span>
        <span className="text-[11px] text-purple-400">1 from each section · Save {CROSS_COMBO.discount}</span>
      </div>
      <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 bg-purple-500 text-white">
        {triComboMode ? '↓ Pick below' : CROSS_COMBO.discount}
      </span>
    </button>
  )
}

// ── Price Badges (dark bg variant) ────────────────────────────────────────────
function PriceBadges({ highlightMode, setHighlightMode, gridRef }) {
  const { sectionItems, hasCombo, hasCrossCombo } = useCart()
  const grp = sectionItems(SECTION)
  const combo = hasCombo(SECTION)
  const crossActive = hasCrossCombo()
  const count = grp.length
  const rem = count % cfg.comboQty
  const needed = rem === 0 ? cfg.comboQty : cfg.comboQty - rem

  function scrollToGrid() {
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  if (combo) {
    return (
      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 bg-green-500/20 border-2 border-green-400/60 text-green-300 font-bold px-6 py-2.5 rounded-2xl shadow-md">
          🎉 Combo active — {cfg.comboQty} for ₹{cfg.comboPrice.toLocaleString('en-IN')} ✓
        </div>
        {!crossActive && <CrossComboTeaser gridRef={gridRef} />}
      </div>
    )
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

        {/* ── Individual pill (dark) ── */}
        <button
          onClick={() => { setHighlightMode(m => m === 'individual' ? null : 'individual'); scrollToGrid() }}
          className={`group relative overflow-hidden flex flex-col items-center gap-0.5 px-6 py-3 rounded-2xl border-2 transition-all duration-300
            ${highlightMode === 'individual'
              ? 'border-yellow-400 bg-amber-700/80 scale-105 shadow-lg shadow-yellow-400/20'
              : 'border-yellow-500/50 bg-amber-800/60 hover:border-yellow-400 hover:bg-amber-700/70 hover:scale-105 hover:shadow-md'}`}>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
          <span className="text-xs text-amber-500 line-through leading-tight">₹{cfg.wasUnitPrice?.toLocaleString('en-IN')}</span>
          <span className="text-2xl font-black dark-price-anim leading-tight">₹{cfg.unitPrice.toLocaleString('en-IN')}</span>
          <span className="text-xs text-amber-400 font-semibold">per service</span>
          <span className="mt-1 text-[11px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">✨ {cfg.unitDiscount}</span>
          <span className={`mt-2 text-xs font-bold px-4 py-1 rounded-full transition-all duration-200 ${
            highlightMode === 'individual'
              ? 'bg-yellow-400 text-amber-900'
              : 'bg-amber-700 text-yellow-300 group-hover:bg-yellow-400 group-hover:text-amber-900'
          }`}>
            {highlightMode === 'individual' ? '↓ Pick below' : 'Buy Now →'}
          </span>
        </button>

        {/* Divider */}
        <div className="hidden sm:flex flex-col items-center gap-1 text-amber-600">
          <div className="w-px h-8 bg-amber-700" />
          <span className="text-xs font-bold text-amber-500">OR</span>
          <div className="w-px h-8 bg-amber-700" />
        </div>
        <div className="sm:hidden text-amber-500 text-xs font-bold">— OR —</div>

        {/* ── Combo pill (dark, prominent) ── */}
        <button
          onClick={() => { setHighlightMode(m => m === 'combo' ? null : 'combo'); scrollToGrid() }}
          className={`group relative overflow-hidden flex flex-col items-center gap-0.5 px-8 py-4 rounded-2xl border-2 transition-all duration-300 combo-badge-glow
            ${highlightMode === 'combo'
              ? 'border-yellow-400 bg-gradient-to-b from-amber-600 to-amber-700 scale-110 shadow-2xl shadow-yellow-400/30'
              : 'border-yellow-500/60 bg-gradient-to-b from-amber-800/80 to-amber-900/80 hover:border-yellow-400 hover:scale-110 hover:shadow-xl hover:shadow-yellow-400/20'}`}>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-0.5 bg-red-500 text-white">
            🔥 {cfg.comboOffer}
          </span>
          <span className="text-xs text-amber-500 line-through leading-tight">₹{cfg.wasComboPrice?.toLocaleString('en-IN')}</span>
          <span className={`text-3xl font-black leading-tight ${highlightMode === 'combo' ? 'text-yellow-300' : 'dark-price-anim'}`}>
            ₹{cfg.comboPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-amber-300 font-semibold">any {cfg.comboQty} services</span>
          <span className="mt-1 text-[11px] font-black px-3 py-0.5 rounded-full bg-red-500 text-white">
            ✨ {cfg.comboDiscount}
          </span>
          {highlightMode === 'combo' && count > 0 && (
            <span className="mt-1 text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
              {count}/{cfg.comboQty} picked
            </span>
          )}
          <span className={`mt-2 text-xs font-black px-5 py-1.5 rounded-full transition-all duration-200 ${
            highlightMode === 'combo'
              ? 'bg-yellow-400 text-amber-900'
              : 'bg-yellow-500 text-amber-900 group-hover:bg-yellow-400'
          }`}>
            {highlightMode === 'combo' ? `↓ Pick ${needed} more` : 'Buy Now →'}
          </span>
        </button>
      </div>
      {!crossActive && <CrossComboTeaser gridRef={gridRef} />}
    </div>
  )
}

// ── Mode banner (section combo + tri-combo) ───────────────────────────────────
function ModeBanner({ highlightMode, setHighlightMode }) {
  const { sectionItems, triComboMode, setTriComboMode, items } = useCart()
  const count = sectionItems(SECTION).length
  const sectionDone = items.some(i => i.section === SECTION)
  const crossProgress = CROSS_COMBO.sections.filter(s => items.some(i => i.section === s)).length

  if (!highlightMode && !triComboMode) return null

  if (triComboMode) {
    return (
      <div className="mt-3 flex justify-center animate-fadeIn">
        <div className="inline-flex items-center gap-3 rounded-2xl px-5 py-2.5 border border-purple-400/60 bg-purple-800/40 text-purple-200">
          <span className="text-lg">🌟</span>
          <span className="text-sm font-semibold">
            {sectionDone
              ? `✓ Prashn Kundali done · ${crossProgress}/3 sections`
              : `Pick 1 from here · ${crossProgress}/3 sections done`}
          </span>
          <button onClick={() => setTriComboMode(false)} className="text-purple-400 hover:text-white text-lg leading-none ml-1">✕</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 flex justify-center animate-fadeIn">
      <div className={`inline-flex items-center gap-3 rounded-2xl px-5 py-2.5 border ${
        highlightMode === 'combo'
          ? 'bg-amber-700/50 border-amber-500/60 text-amber-200'
          : 'bg-amber-800/50 border-amber-600/40 text-amber-300'
      }`}>
        <span className="text-lg">{highlightMode === 'combo' ? '🎯' : '👇'}</span>
        <span className="text-sm font-semibold">
          {highlightMode === 'combo'
            ? `Pick any 3 → all 3 for ₹${cfg.comboPrice.toLocaleString('en-IN')} · ${count}/${cfg.comboQty} selected`
            : `Add any service individually at ₹${cfg.unitPrice.toLocaleString('en-IN')} each`}
        </span>
        <button onClick={() => setHighlightMode(null)} className="text-amber-400 hover:text-white text-lg leading-none ml-1">✕</button>
      </div>
    </div>
  )
}

// ── Topic Card ─────────────────────────────────────────────────────────────────
function TopicCard({ t, i, highlightMode }) {
  const [expanded, setExpanded] = useState(false)
  const [ref, inView] = useInView()
  const { addItem, removeItem, hasItem, sectionItems, setIsOpen, triComboMode, setTriComboMode, items } = useCart()
  const inCart = hasItem(t.id)
  const inSection = sectionItems(SECTION)
  const isComboMode = highlightMode === 'combo'
  const isIndividualMode = highlightMode === 'individual'

  function toggle(e) {
    e.stopPropagation()
    if (inCart) { removeItem(t.id); return }

    addItem({ id: t.id, section: SECTION, title: t.title, icon: t.icon, unitPrice: cfg.unitPrice, wasPrice: cfg.wasUnitPrice, discount: cfg.unitDiscount })

    // Within-section combo completion
    if (inSection.length + 1 >= cfg.comboQty) {
      setTimeout(() => setIsOpen(true), 300)
    }

    // Tri-combo completion: check if other 2 sections already have items
    if (triComboMode) {
      const otherSectionsDone = CROSS_COMBO.sections
        .filter(s => s !== SECTION)
        .every(s => items.some(i => i.section === s))
      if (otherSectionsDone) {
        setTimeout(() => { setIsOpen(true); setTriComboMode(false) }, 300)
      }
    }
  }

  const isTriMode = triComboMode && !inCart && !items.some(i => i.section === SECTION)

  return (
    <div
      ref={ref}
      onClick={() => setExpanded(e => !e)}
      className={`group relative rounded-xl backdrop-blur-sm transition-all duration-400 cursor-pointer overflow-hidden flex flex-col
        ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        ${inCart
          ? 'border-2 border-yellow-400/80 bg-amber-700/80 shadow-lg shadow-yellow-500/20'
          : isTriMode
          ? 'border-2 border-purple-400/80 bg-purple-900/50 shadow-md shadow-purple-400/20 animate-highlight-pulse'
          : isComboMode
          ? 'border-2 border-amber-400/70 bg-amber-700/50 shadow-md shadow-amber-400/20 animate-highlight-pulse'
          : isIndividualMode
          ? 'border-2 border-yellow-300/50 bg-amber-800/50'
          : 'border border-yellow-600/30 bg-amber-800/60 hover:-translate-y-1 hover:shadow-xl hover:border-yellow-400/50'
        }`}
      style={{ transitionDelay: `${(i % 4) * 60}ms` }}
    >
      {isTriMode && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-purple-400/40 pointer-events-none animate-pulse" />
      )}
      {isComboMode && !inCart && !isTriMode && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-amber-400/40 pointer-events-none animate-pulse" />
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 inline-block">{t.icon}</div>
          <div className="flex flex-col items-end flex-shrink-0 mt-0.5">
            <span className="text-[9px] text-amber-600 line-through leading-none">₹{cfg.wasUnitPrice?.toLocaleString('en-IN')}</span>
            <span className={`text-sm font-black leading-tight ${
              inCart ? 'text-yellow-300' : isTriMode ? 'text-purple-300' : isComboMode ? 'text-amber-300' : 'dark-price-anim'
            }`}>
              ₹{cfg.unitPrice.toLocaleString('en-IN')}
            </span>
            {inCart && <span className="text-[9px] text-yellow-400 font-bold">✓ added</span>}
          </div>
        </div>

        <h3 className="text-yellow-300 font-bold text-base mb-1">{t.title}</h3>
        <p className="text-amber-300 text-xs leading-relaxed flex-1">{t.desc}</p>

        <div className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: expanded ? '120px' : '0px', opacity: expanded ? 1 : 0 }}>
          <div className="mt-3 pt-3 border-t border-yellow-600/30">
            <p className="text-amber-200 text-xs leading-relaxed">{t.detail}</p>
          </div>
        </div>

        <button
          onClick={toggle}
          className={`mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
            inCart
              ? 'bg-green-500 text-white border border-green-400 hover:bg-red-500 hover:border-red-400 shadow-md shadow-green-500/30'
              : isTriMode
              ? 'bg-purple-500 text-white border border-purple-400 hover:bg-purple-600 shadow-md shadow-purple-500/30'
              : isComboMode
              ? 'bg-amber-500 text-white border border-amber-400 hover:bg-amber-600 shadow-md shadow-amber-500/30'
              : 'bg-yellow-400 text-amber-900 border border-yellow-300 hover:bg-yellow-300 shadow-md shadow-yellow-400/40 hover:scale-[1.02] hover:shadow-yellow-400/60'
          }`}>
          {inCart
            ? '✓ Added — tap to remove'
            : isTriMode
            ? `🌟 Add to Tri-Combo — ₹${cfg.unitPrice.toLocaleString('en-IN')}`
            : isComboMode
            ? `🛒 Add to Combo — ₹${cfg.unitPrice.toLocaleString('en-IN')}`
            : `🛒 Add — ₹${cfg.unitPrice.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  )
}

// ── Section export ─────────────────────────────────────────────────────────────
export default function PrashnKundali() {
  const [titleRef, titleInView] = useInView()
  const [highlightMode, setHighlightMode] = useState(null)
  const gridRef = useRef(null)

  return (
    <section id="prashn" className="py-20 bg-gradient-to-b from-amber-900 to-amber-800 diamond-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div ref={titleRef} className={`text-center mb-14 transition-all duration-700 ${titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-yellow-400 font-semibold text-sm tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <span className="star-pop inline-block">✦</span> Detailed Analysis <span className="star-pop inline-block" style={{animationDelay:'0.7s'}}>✦</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-4">Prashn Kundali</h2>
          <div className="text-amber-400 text-base font-medium mb-2">प्रश्न कुण्डली</div>
          <p className="text-amber-200 text-lg max-w-3xl mx-auto">
            Get precise answers to your burning life questions through the ancient science of Horary Astrology.
          </p>

          <PriceBadges highlightMode={highlightMode} setHighlightMode={setHighlightMode} gridRef={gridRef} />
          <ModeBanner highlightMode={highlightMode} setHighlightMode={setHighlightMode} />
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full" />
        </div>

        <div ref={gridRef} id="prashn-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {topics.map((t, i) => (
            <TopicCard key={t.id} t={t} i={i} highlightMode={highlightMode} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-yellow-400/10 border border-yellow-400/30 rounded-2xl px-8 py-4 hover:bg-yellow-400/20 transition-colors duration-300">
            <p className="text-yellow-300 text-lg font-semibold">
              🌟 Past Life Analysis &bull; Future Predictions &bull; Remedies Included
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
