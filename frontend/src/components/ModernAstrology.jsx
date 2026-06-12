import { useState, useRef } from 'react'
import { useInView } from '../hooks/useInView'
import { useCart, SECTION_CONFIG, CROSS_COMBO } from '../context/CartContext'

const modernTopics = [
  { id: 'ma-numerology', icon: '🔢', title: 'Numerology',          desc: 'Hidden power of numbers in your life — Name, Birth, Destiny and Soul numbers.',
    detail: 'Analyses Birth, Life Path, Destiny, and Soul numbers to reveal strengths, best career paths, and powerful years — with business name corrections for financial uplift.' },
  { id: 'ma-energy',     icon: '⚡', title: 'Energy Analysis',     desc: 'Pranic and auric energy reading to identify blockages, vibrations and cosmic imbalances.',
    detail: 'Reads aura layers and chakra imbalances, detects Vastu defects, and prescribes mantras, yantras, crystals, and space-cleansing rituals.' },
  { id: 'ma-sunsign',   icon: '🌙', title: 'Sun Sign Astrology',       desc: 'Western zodiac analysis based on solar positions for personality and life traits.',
    detail: 'Reveals ego, life purpose, and where you\'re meant to shine — covering all 12 signs with their planetary rulers and elemental energies.' },
  { id: 'ma-moonsign',  icon: '⭐', title: 'Moon Sign Reading',        desc: 'Emotional nature, subconscious mind and inner life through lunar analysis.',
    detail: 'The Moon\'s sign and house reveal emotional needs, security patterns, and the root of recurring psychological cycles.' },
  { id: 'ma-transit',   icon: '🪐', title: 'Transit Analysis',         desc: 'Current planetary transits and their real-time impact on your daily and yearly life.',
    detail: 'Maps the next 12 months of planetary transits over your natal chart, highlighting your best windows for career, love, and finance.' },
  { id: 'ma-retrograde',icon: '🔴', title: 'Retrograde Planets',       desc: 'Impact of retrograde Mercury, Venus, Mars and outer planets on your personal life.',
    detail: 'Natal and transiting retrogrades show where past-life lessons resurface — understanding them turns reversals into productive cycles.' },
  { id: 'ma-solar',     icon: '🌟', title: 'Solar Return Chart',       desc: 'Annual birthday chart predicting major themes and events for the year ahead.',
    detail: 'Cast for the exact Sun return moment each year, it reveals the dominant themes and energy focus for the next 12 months.' },
  { id: 'ma-synastry',  icon: '💫', title: 'Synastry (Compatibility)', desc: 'Relationship compatibility between two birth charts for love and business partnerships.',
    detail: 'Overlays two charts to assess chemistry, stability, and long-term compatibility across romance, friendship, and business.' },
  { id: 'ma-progressed',icon: '🌊', title: 'Progressed Chart',         desc: 'Secondary progressions revealing your internal psychological growth and life evolution.',
    detail: 'Each day after birth equals one life year — the Progressed Sun and Moon track inner identity shifts and emotional maturation cycles.' },
  { id: 'ma-composite', icon: '🔮', title: 'Composite Chart',          desc: 'The relationship entity chart — the soul of any partnership or union.',
    detail: 'Midpoint chart of two people that shows the purpose, strengths, and destiny of the relationship itself as a unique third entity.' },
  { id: 'ma-harmonic',  icon: '🌈', title: 'Harmonic Astrology',       desc: 'Advanced resonance patterns revealing hidden talents and deep karmic themes.',
    detail: 'Harmonic charts (H4, H5, H7, H9) uncover layers invisible in the natal chart — especially powerful for identifying exceptional talent.' },
  { id: 'ma-psych',     icon: '♾️', title: 'Psychological Astrology',  desc: 'Depth psychology integrated with astrology for healing, self-awareness and transformation.',
    detail: 'Integrates Jungian archetypes with the natal chart — Chiron reveals the core wound and the path to healing through self-awareness.' },
]

const hasthTopics = [
  { id: 'hr-lifeline',  icon: '🖐️', title: 'Life Line',             desc: 'Vitality, energy levels, major life changes and health timeline.',
    detail: 'Reflects the quality of life energy and marks major transitions — islands indicate low periods, breaks signal turning points.' },
  { id: 'hr-heartline', icon: '✋', title: 'Heart Line',            desc: 'Emotional nature, love life, relationship patterns and heart health.',
    detail: 'Its shape reveals how you experience love — length, curves, and branches show romantic idealism, pragmatism, or emotional complexity.' },
  { id: 'hr-headline',  icon: '🤚', title: 'Head Line',             desc: 'Intellect, career aptitude, mental strength and decision-making ability.',
    detail: 'A long line shows analytical breadth; a sloping line reveals creativity. Breaks indicate periods of mental stress or major decisions.' },
  { id: 'hr-fateline',  icon: '💎', title: 'Fate Line',             desc: 'Career destiny, life purpose, turning points and professional success timing.',
    detail: 'Shows the clarity of life purpose — where it begins reveals the source of success; breaks mark significant career changes.' },
  { id: 'hr-sunline',   icon: '☀️', title: 'Sun Line (Apollo)',     desc: 'Fame, success, creative talents, public recognition and wealth.',
    detail: 'Its presence indicates a gift for self-expression; a star on the Sun Line is among the most auspicious marks for recognition.' },
  { id: 'hr-mercury',   icon: '🌙', title: 'Mercury Line',          desc: 'Communication, business acumen, health indicators and intuitive abilities.',
    detail: 'A clear Mercury Line signals sharp business instincts; breaks or waves can indicate nervous energy or digestive sensitivity.' },
  { id: 'hr-marriage',  icon: '⚡', title: 'Marriage Lines',        desc: 'Relationship timing, number of significant partnerships and partner nature.',
    detail: 'Number, depth, and position of lines on the percussion edge indicate significant relationships and their approximate timing in life.' },
  { id: 'hr-children',  icon: '🌿', title: 'Children Lines',        desc: 'Number of children, their nature, birth timing and parent-child bonds.',
    detail: 'Vertical lines rising from Marriage Lines indicate the likely number of children — strength of line reflects the child\'s vitality.' },
  { id: 'hr-wealth',    icon: '💰', title: 'Wealth Signs',          desc: 'Fish, triangle, star signs indicating prosperity, financial luck and abundance.',
    detail: 'The Fish near the wrist, Stars on Jupiter\'s mount, and the Great Triangle are rare marks strongly associated with wealth and fame.' },
  { id: 'hr-yogas',     icon: '🔯', title: 'Special Yogas & Marks', desc: 'Rare auspicious and inauspicious marks revealing divine blessings and karmic themes.',
    detail: 'The Mystic Cross between Heart and Head lines indicates psychic depth; mounts reveal dominant planetary energies in the personality.' },
]

const MA_SECTION = 'Modern Astrology'
const HR_SECTION = 'Hasth Rekha'

// ── Cross-combo teaser pill (light bg variant) ────────────────────────────────
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
          ? 'border-purple-500 bg-purple-100 scale-105 shadow-lg shadow-purple-200'
          : 'border-purple-300 bg-purple-50 hover:border-purple-500 hover:bg-purple-100 hover:scale-105'}`}>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      <span className="text-xl">🌟</span>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Best Value</span>
        <span className="text-sm font-black leading-tight text-purple-800">
          Tri-Reading Combo — ₹{CROSS_COMBO.price.toLocaleString('en-IN')}
        </span>
        <span className="text-[11px] text-purple-500">1 from each section · Save {CROSS_COMBO.discount}</span>
      </div>
      <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 bg-purple-600 text-white">
        {triComboMode ? '↓ Pick below' : CROSS_COMBO.discount}
      </span>
    </button>
  )
}

// ── Shared price badges component ─────────────────────────────────────────────
function PriceBadges({ section, highlightMode, setHighlightMode, gridRef }) {
  const { sectionItems, hasCombo, hasCrossCombo, triComboMode } = useCart()
  const cfg = SECTION_CONFIG[section]
  const grp = sectionItems(section)
  const combo = hasCombo(section)
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
        <div className="inline-flex items-center gap-2 bg-green-100 border-2 border-green-400 text-green-800 font-bold px-6 py-2.5 rounded-2xl shadow-md">
          🎉 Combo active — {cfg.comboQty} for ₹{cfg.comboPrice.toLocaleString('en-IN')} ✓
        </div>
        {!crossActive && <CrossComboTeaser gridRef={gridRef} />}
      </div>
    )
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-4">
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

      {/* ── Individual pill ── */}
      <button
        onClick={() => { setHighlightMode(m => m === 'individual' ? null : 'individual'); scrollToGrid() }}
        className={`group relative overflow-hidden flex flex-col items-center gap-0.5 px-6 py-3 rounded-2xl border-2 transition-all duration-300
          ${highlightMode === 'individual'
            ? 'border-amber-500 bg-amber-100 scale-105 shadow-lg shadow-amber-200'
            : 'border-amber-300 bg-white hover:border-amber-400 hover:bg-amber-50 hover:scale-105 hover:shadow-md'}`}>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        {/* was price */}
        <span className="text-xs text-gray-400 line-through was-price leading-tight">₹{cfg.wasUnitPrice?.toLocaleString('en-IN')}</span>
        {/* current price */}
        <span className="text-2xl font-black price-color-anim leading-tight">₹{cfg.unitPrice.toLocaleString('en-IN')}</span>
        {/* label + discount */}
        <span className="text-xs text-amber-600 font-semibold">per service</span>
        <span className="mt-1 text-[11px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">✨ {cfg.unitDiscount}</span>
        {/* Buy Now CTA */}
        <span className={`mt-2 text-xs font-bold px-4 py-1 rounded-full transition-all duration-200 ${
          highlightMode === 'individual'
            ? 'bg-amber-600 text-white'
            : 'bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white'
        }`}>
          {highlightMode === 'individual' ? '↓ Pick below' : 'Buy Now →'}
        </span>
      </button>

      {/* Divider */}
      <div className="hidden sm:flex flex-col items-center gap-1 text-amber-300">
        <div className="w-px h-8 bg-amber-200" />
        <span className="text-xs font-bold text-amber-500">OR</span>
        <div className="w-px h-8 bg-amber-200" />
      </div>
      <div className="sm:hidden text-amber-400 text-xs font-bold">— OR —</div>

      {/* ── Combo pill — bigger, more prominent ── */}
      <button
        onClick={() => { setHighlightMode(m => m === 'combo' ? null : 'combo'); scrollToGrid() }}
        className={`group relative overflow-hidden flex flex-col items-center gap-0.5 px-8 py-4 rounded-2xl border-2 transition-all duration-300 combo-badge-glow
          ${highlightMode === 'combo'
            ? 'border-amber-600 bg-gradient-to-b from-amber-500 to-amber-600 text-white scale-110 shadow-xl'
            : 'border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 hover:scale-110 hover:shadow-xl hover:border-amber-500'}`}>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        {/* offer tag */}
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-0.5 ${
          highlightMode === 'combo' ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
        }`}>
          🔥 {cfg.comboOffer}
        </span>
        {/* was combo price */}
        <span className={`text-xs line-through leading-tight ${highlightMode === 'combo' ? 'text-white/60' : 'text-gray-400'}`}>
          ₹{cfg.wasComboPrice?.toLocaleString('en-IN')}
        </span>
        {/* combo price */}
        <span className={`text-3xl font-black leading-tight ${
          highlightMode === 'combo' ? 'text-white' : 'combo-price-anim'
        }`}>
          ₹{cfg.comboPrice.toLocaleString('en-IN')}
        </span>
        {/* qty label */}
        <span className={`text-xs font-semibold ${highlightMode === 'combo' ? 'text-white/80' : 'text-amber-700'}`}>
          any {cfg.comboQty} services
        </span>
        {/* discount badge */}
        <span className={`mt-1 text-[11px] font-black px-3 py-0.5 rounded-full ${
          highlightMode === 'combo' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
        }`}>
          ✨ {cfg.comboDiscount}
        </span>
        {/* counter when active */}
        {highlightMode === 'combo' && count > 0 && (
          <span className="mt-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
            {count}/{cfg.comboQty} picked
          </span>
        )}
        {/* Buy Now CTA */}
        <span className={`mt-2 text-xs font-black px-5 py-1.5 rounded-full transition-all duration-200 ${
          highlightMode === 'combo'
            ? 'bg-white text-amber-700'
            : 'bg-amber-600 text-white group-hover:bg-amber-700'
        }`}>
          {highlightMode === 'combo' ? `↓ Pick ${needed} more` : 'Buy Now →'}
        </span>
      </button>
    </div>
    {!crossActive && <CrossComboTeaser gridRef={gridRef} />}
    </div>
  )
}

// ── Mode instruction banner ────────────────────────────────────────────────────
function ModeBanner({ section, highlightMode, setHighlightMode }) {
  const cfg = SECTION_CONFIG[section]
  const { sectionItems, triComboMode, setTriComboMode, items } = useCart()
  const count = sectionItems(section).length
  const sectionDone = items.some(i => i.section === section)
  const crossProgress = CROSS_COMBO.sections.filter(s => items.some(i => i.section === s)).length

  if (!highlightMode && !triComboMode) return null

  if (triComboMode) {
    return (
      <div className="mt-3 flex justify-center animate-fadeIn">
        <div className="inline-flex items-center gap-3 rounded-2xl px-5 py-2.5 border border-purple-300 bg-purple-50 text-purple-800">
          <span className="text-lg">🌟</span>
          <span className="text-sm font-semibold">
            {sectionDone
              ? `✓ ${SECTION_CONFIG[section]?.label} done · ${crossProgress}/3 sections`
              : `Pick 1 from here · ${crossProgress}/3 sections done`}
          </span>
          <button onClick={() => setTriComboMode(false)} className="text-purple-400 hover:text-purple-900 text-lg leading-none ml-1">✕</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 flex justify-center animate-fadeIn">
      <div className={`inline-flex items-center gap-3 rounded-2xl px-5 py-2.5 border ${
        highlightMode === 'combo' ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-yellow-50 border-amber-300 text-amber-700'
      }`}>
        <span className="text-lg">{highlightMode === 'combo' ? '🎯' : '👇'}</span>
        <span className="text-sm font-semibold">
          {highlightMode === 'combo'
            ? `Pick any 3 → all 3 for ₹${cfg.comboPrice.toLocaleString('en-IN')} · ${count}/${cfg.comboQty} selected`
            : `Add any service individually at ₹${cfg.unitPrice.toLocaleString('en-IN')} each`}
        </span>
        <button onClick={() => setHighlightMode(null)} className="text-amber-500 hover:text-amber-900 text-lg leading-none ml-1">✕</button>
      </div>
    </div>
  )
}

// ── Topic Card ─────────────────────────────────────────────────────────────────
function TopicCard({ t, section, bg, highlightMode }) {
  const [ref, inView] = useInView()
  const { addItem, removeItem, hasItem, sectionItems, setIsOpen, triComboMode, setTriComboMode, items } = useCart()
  const cfg = SECTION_CONFIG[section]
  const inCart = hasItem(t.id)
  const sectionCount = sectionItems(section).length

  function toggle(e) {
    e.stopPropagation()
    if (inCart) { removeItem(t.id); return }

    addItem({ id: t.id, section, title: t.title, icon: t.icon, unitPrice: cfg.unitPrice, wasPrice: cfg.wasUnitPrice, discount: cfg.unitDiscount })

    // Within-section combo completion
    if (sectionCount + 1 >= cfg.comboQty) {
      setTimeout(() => setIsOpen(true), 300)
    }

    // Tri-combo completion
    if (triComboMode) {
      const otherSectionsDone = CROSS_COMBO.sections
        .filter(s => s !== section)
        .every(s => items.some(i => i.section === s))
      if (otherSectionsDone) {
        setTimeout(() => { setIsOpen(true); setTriComboMode(false) }, 300)
      }
    }
  }

  const isComboMode = highlightMode === 'combo'
  const isIndividualMode = highlightMode === 'individual'
  // Tri-combo highlights only if this section hasn't been picked yet
  const isTriMode = triComboMode && !inCart && !items.some(i => i.section === section)

  return (
    <div
      ref={ref}
      className={`group rounded-xl shadow-md border flex flex-col transition-all duration-400 overflow-hidden
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${inCart
          ? 'ring-2 ring-amber-500 ' + bg
          : isTriMode
          ? 'ring-2 ring-purple-400 shadow-purple-200/60 bg-purple-50 border-purple-300 animate-highlight-pulse'
          : isComboMode
          ? 'ring-2 ring-amber-400 shadow-amber-200/60 bg-amber-50 border-amber-300 animate-highlight-pulse'
          : isIndividualMode
          ? 'ring-1 ring-amber-300 ' + bg
          : 'hover:-translate-y-1 hover:shadow-xl ' + bg}`}
    >
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-2">
          <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{t.icon}</div>
          <div className="flex flex-col items-end flex-shrink-0 mt-0.5">
            <span className={`text-[9px] line-through leading-none ${inCart ? 'text-green-400' : 'text-gray-400'}`}>
              ₹{cfg.wasUnitPrice?.toLocaleString('en-IN')}
            </span>
            <span className={`text-sm font-black leading-tight ${
              inCart ? 'text-green-700' : isTriMode ? 'text-purple-600' : isComboMode ? 'combo-price-anim' : 'price-color-anim'
            }`}>
              ₹{cfg.unitPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <h3 className="text-amber-900 font-bold text-sm mb-1">{t.title}</h3>
        <p className="text-amber-600 text-xs leading-relaxed flex-1">{t.desc}</p>

        <button
          onClick={toggle}
          className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 ${
            inCart
              ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
              : isTriMode
              ? 'bg-purple-500 text-white border border-purple-600 hover:bg-purple-600 shadow-sm'
              : isComboMode
              ? 'bg-amber-500 text-white border border-amber-600 hover:bg-amber-600 shadow-sm'
              : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 hover:border-amber-400'
          }`}>
          {inCart
            ? '✓ Added'
            : isTriMode
            ? `🌟 Add to Tri-Combo — ₹${cfg.unitPrice.toLocaleString('en-IN')}`
            : isComboMode
            ? `🛒 Add to Combo — ₹${cfg.unitPrice.toLocaleString('en-IN')}`
            : `+ Add — ₹${cfg.unitPrice.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  )
}

// ── Section header wrapper ─────────────────────────────────────────────────────
function SectionHead({ section, titleContent, highlightMode, setHighlightMode, gridRef, inView, refProp, id }) {
  return (
    <div id={id} ref={refProp} className={`text-center mb-14 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {titleContent}
      <PriceBadges section={section} highlightMode={highlightMode} setHighlightMode={setHighlightMode} gridRef={gridRef} />
      <ModeBanner section={section} highlightMode={highlightMode} setHighlightMode={setHighlightMode} />
      <div className="mt-4 h-1 w-24 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto rounded-full" />
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function ModernAstrology() {
  const [ref1, inView1] = useInView()
  const [ref2, inView2] = useInView()
  const [maMode, setMaMode] = useState(null)
  const [hrMode, setHrMode] = useState(null)
  const maGridRef = useRef(null)
  const hrGridRef = useRef(null)

  return (
    <section id="modern" className="py-20 bg-amber-50 diamond-pattern-light">
      <div className="max-w-7xl mx-auto px-4">

        {/* Modern Astrology */}
        <SectionHead
          section={MA_SECTION}
          refProp={ref1}
          inView={inView1}
          highlightMode={maMode}
          setHighlightMode={setMaMode}
          gridRef={maGridRef}
          titleContent={
            <>
              <div className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-3">Western & Modern</div>
              <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
                Modern <span className="text-amber-600">Astrology</span>
              </h2>
              <p className="text-amber-700 text-lg max-w-2xl mx-auto">
                Blending ancient Vedic wisdom with modern psychological and Western astrological techniques
              </p>
            </>
          }
        />
        <div ref={maGridRef} id="modern-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-20">
          {modernTopics.map((t) => (
            <TopicCard key={t.id} t={t} section={MA_SECTION} bg="bg-white border-amber-100" highlightMode={maMode} />
          ))}
        </div>

        {/* Hasth Rekha */}
        <SectionHead
          id="hasth-rekha"
          section={HR_SECTION}
          refProp={ref2}
          inView={inView2}
          highlightMode={hrMode}
          setHighlightMode={setHrMode}
          gridRef={hrGridRef}
          titleContent={
            <>
              <div className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-3">Palmistry</div>
              <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
                Hasth Rekha <span className="text-amber-600">Vigyan</span>
              </h2>
              <div className="text-amber-700 text-base font-medium mb-2">हस्त रेखा विज्ञान</div>
              <p className="text-amber-700 text-lg max-w-2xl mx-auto">
                Read the map of your destiny etched on your palms — the ancient science of palmistry
              </p>
            </>
          }
        />
        <div ref={hrGridRef} id="hasth-rekha-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {hasthTopics.map((t) => (
            <TopicCard key={t.id} t={t} section={HR_SECTION} bg="bg-gradient-to-b from-yellow-50 to-amber-50 border-amber-200" highlightMode={hrMode} />
          ))}
        </div>
      </div>
    </section>
  )
}
