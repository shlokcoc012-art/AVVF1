import { useInView } from '../hooks/useInView'
import { useCart } from '../context/CartContext'
import { CROSS_COMBO, DIVINE_COMBO, SECTION_CONFIG } from '../context/cartConstants'

// Progress dots helper
function ProgressDots({ filled, total, color }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < filled ? color : 'bg-white/20'}`} />
      ))}
    </div>
  )
}

export default function TriComboPromo() {
  const [ref, inView] = useInView()
  const { hasCrossCombo, hasDivineCombo, divineAnchorSection, setIsOpen, triComboMode, setTriComboMode, items } = useCart()
  const crossActive = hasCrossCombo()
  const divineActive = hasDivineCombo()
  const anchorSec = divineAnchorSection()

  const sections = CROSS_COMBO.sections
  const coveredSections = sections.filter(sec => items.some(i => i.section === sec))
  const crossProgress = coveredSections.length

  // Divine progress: best anchor candidate + cross coverage
  const anchorCandidate = sections
    .map(sec => ({ sec, count: items.filter(i => i.section === sec).length }))
    .sort((a, b) => b.count - a.count)[0]
  const divineProgress = (crossProgress === 3 && !divineActive)
    ? Math.min(anchorCandidate?.count || 0, 3)
    : 0

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden py-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #2e1065 40%, #1a0533 70%, #0c0a1e 100%)' }}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(1px 1px at 8% 15%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 22% 80%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 50% 10%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 78% 60%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 92% 30%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 35% 45%, rgba(255,255,255,0.2) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 65% 85%, rgba(255,255,255,0.4) 0%, transparent 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)' }} />

      <div className="relative max-w-6xl mx-auto px-4">

        {/* Section label */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-1.5 mb-4">
            <span className="text-white/70 text-xs font-black uppercase tracking-widest">✦ Bundle Offers</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-300">Bigger Savings</span>
          </h2>
          <p className="text-white/50 text-sm mt-2">Combine services across sections for the best value</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── CARD 1: Tri-Reading Combo ─────────────────────────────── */}
          <div className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
            divineActive
              ? 'border-white/10 opacity-60'
              : crossActive
              ? 'border-purple-400 shadow-2xl shadow-purple-500/30 scale-[1.01]'
              : 'border-purple-500/40 hover:border-purple-400/80 hover:shadow-xl hover:shadow-purple-500/20'
          }`}
            style={{ background: 'linear-gradient(135deg, rgba(88,28,135,0.7) 0%, rgba(67,20,110,0.8) 100%)' }}>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

            {/* Top badge */}
            <div className="flex items-center justify-between px-6 pt-6 pb-0">
              <span className="bg-purple-500/40 border border-purple-400/50 text-purple-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Best Value
              </span>
              {crossActive && !divineActive && (
                <span className="bg-green-500/30 border border-green-400/50 text-green-300 text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                  ✓ Active
                </span>
              )}
            </div>

            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-black text-white mb-1">🌟 Tri-Reading Combo</h3>
                  <p className="text-purple-300 text-xs">1 service from each of the 3 sections</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-purple-300 text-xs line-through">{CROSS_COMBO.wasPrice.toLocaleString('en-IN')}</div>
                  <div className="text-2xl font-black text-yellow-300">₹{CROSS_COMBO.price.toLocaleString('en-IN')}</div>
                  <div className="bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mt-0.5 inline-block">{CROSS_COMBO.discount}</div>
                </div>
              </div>

              {/* Section pills */}
              <div className="space-y-2 mb-5">
                {sections.map((sec, i) => {
                  const covered = items.some(item => item.section === sec)
                  return (
                    <div key={sec} className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all ${
                      covered ? 'bg-green-500/15 border-green-400/40' : 'bg-white/5 border-white/10'
                    }`}>
                      <span className="text-base">{covered ? '✓' : ['🔮', '🌙', '🖐️'][i]}</span>
                      <span className={`text-xs font-semibold flex-1 ${covered ? 'text-green-300' : 'text-white/60'}`}>
                        {SECTION_CONFIG[sec]?.label || sec}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${covered ? 'bg-green-500/30 text-green-300' : 'bg-white/10 text-white/40'}`}>
                        {covered ? '1 added' : 'pick 1'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Progress */}
              {crossProgress > 0 && !crossActive && !divineActive && (
                <div className="mb-4">
                  <div className="flex justify-between text-purple-300 text-xs mb-1.5">
                    <span>Progress</span><span>{crossProgress}/3 sections</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500" style={{ width: `${(crossProgress / 3) * 100}%` }} />
                  </div>
                </div>
              )}

              {crossActive && !divineActive ? (
                <button onClick={() => setIsOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black py-3 rounded-xl text-sm transition-all hover:scale-[1.02]">
                  🌟 View in Cart
                </button>
              ) : (
                <button onClick={() => {
                  setTriComboMode(true)
                  document.getElementById('prashn-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                  className={`w-full border font-bold py-3 rounded-xl text-sm transition-all hover:scale-[1.02] ${
                    triComboMode
                      ? 'bg-purple-500/60 border-purple-300 text-white'
                      : 'bg-purple-500/30 hover:bg-purple-500/50 border-purple-400/50 hover:border-purple-300 text-purple-200'
                  }`}>
                  {triComboMode ? '🌟 Picking… scroll to sections ↓' : 'Pick 1 from each section →'}
                </button>
              )}
            </div>
          </div>

          {/* ── CARD 2: 5-in-1 Divine Consultation ───────────────────── */}
          <div className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
            divineActive
              ? 'border-yellow-400 shadow-2xl shadow-yellow-500/40 scale-[1.01]'
              : 'border-yellow-600/40 hover:border-yellow-400/80 hover:shadow-xl hover:shadow-yellow-500/20'
          }`}
            style={{ background: 'linear-gradient(135deg, rgba(120,53,15,0.75) 0%, rgba(92,40,10,0.85) 50%, rgba(55,30,5,0.9) 100%)' }}>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

            {/* "Ultimate" ribbon */}
            <div className="absolute top-4 right-0 bg-gradient-to-l from-yellow-500 to-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-l-full shadow-lg">
              ✦ Ultimate Bundle
            </div>

            <div className="flex items-center justify-between px-6 pt-6 pb-0">
              <span className="bg-yellow-500/30 border border-yellow-400/50 text-yellow-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                {DIVINE_COMBO.discount}
              </span>
              {divineActive && (
                <span className="bg-yellow-400/30 border border-yellow-300/50 text-yellow-200 text-[10px] font-black px-3 py-1 rounded-full animate-pulse mr-24">
                  ✓ Active
                </span>
              )}
            </div>

            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-black text-yellow-200 mb-1">✨ 5-in-1 Divine Consultation</h3>
                  <p className="text-amber-400 text-xs">3 from any section + 1 each from the other two</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-amber-500 text-xs line-through">{DIVINE_COMBO.wasPrice.toLocaleString('en-IN')}</div>
                  <div className="text-2xl font-black text-yellow-300">₹{DIVINE_COMBO.price.toLocaleString('en-IN')}</div>
                  <div className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full mt-0.5 inline-block">{DIVINE_COMBO.discount}</div>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-2 mb-5">
                {sections.map((sec, i) => {
                  const secItems = items.filter(item => item.section === sec)
                  const count = secItems.length
                  const isAnchor = divineActive ? sec === anchorSec : (count >= 3 || (!divineActive && count === Math.max(...sections.map(s => items.filter(i => i.section === s).length))))
                  const needed = isAnchor ? 3 : 1
                  const filled = Math.min(count, needed)
                  return (
                    <div key={sec} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-all ${
                      filled >= needed ? 'bg-yellow-500/15 border-yellow-400/40' : 'bg-white/5 border-white/10'
                    }`}>
                      <span className="text-base">{filled >= needed ? '✓' : ['🔮', '🌙', '🖐️'][i]}</span>
                      <span className={`text-xs font-semibold flex-1 ${filled >= needed ? 'text-yellow-300' : 'text-white/60'}`}>
                        {SECTION_CONFIG[sec]?.label || sec}
                      </span>
                      <ProgressDots filled={filled} total={needed} color="bg-yellow-400" />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 ${filled >= needed ? 'bg-yellow-500/30 text-yellow-300' : 'bg-white/10 text-white/40'}`}>
                        {filled}/{needed}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Divine progress when tri-combo is done */}
              {divineProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-amber-300 text-xs mb-1.5">
                    <span>Add {3 - divineProgress} more from {SECTION_CONFIG[anchorCandidate?.sec]?.label}</span>
                    <span>{divineProgress}/3</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${(divineProgress / 3) * 100}%` }} />
                  </div>
                </div>
              )}

              {divineActive ? (
                <button onClick={() => setIsOpen(true)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-black py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg">
                  ✨ View Divine Bundle in Cart
                </button>
              ) : (
                <button onClick={() => document.getElementById('prashn')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-yellow-600/30 hover:bg-yellow-600/50 border border-yellow-500/50 hover:border-yellow-400 text-yellow-200 font-bold py-3 rounded-xl text-sm transition-all hover:scale-[1.02]">
                  Build My Divine Bundle →
                </button>
              )}

              <p className="text-center text-amber-600 text-[10px] mt-2">
                Pick any 3 from one section + 1 each from the other two
              </p>
            </div>
          </div>

        </div>

        {/* Bottom note */}
        <p className="text-center text-white/30 text-xs mt-8">
          All bundles are auto-applied in your cart · Discounts are shown at checkout
        </p>
      </div>
    </div>
  )
}
