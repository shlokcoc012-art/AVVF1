import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { SECTION_CONFIG, CROSS_COMBO, DIVINE_COMBO } from '../context/cartConstants'
import CartBookingFlow from './CartBookingFlow'

const MODES = [
  { key: 'Phone Call',      icon: '📞', fee: 0,    label: 'Free'    },
  { key: 'WhatsApp',        icon: '💬', fee: 99,   label: '+₹99'    },
  { key: 'Video Call',      icon: '🎥', fee: 999,  label: '+₹999'   },
  { key: 'In-Person Visit', icon: '🏠', fee: 9999, label: '+₹9,999' },
]

function fmt(n) {
  return '₹' + n.toLocaleString('en-IN')
}

function itemSaving(item) {
  if (!item.wasPrice) return 0
  return item.wasPrice - item.unitPrice
}

function comboSaving(section, items) {
  const cfg = SECTION_CONFIG[section]
  if (!cfg?.comboQty || items.length < cfg.comboQty) return 0
  const bundles = Math.floor(items.length / cfg.comboQty)
  const individualTotal = items.length * cfg.unitPrice
  const comboTotal = bundles * cfg.comboPrice + (items.length % cfg.comboQty) * cfg.unitPrice
  return individualTotal - comboTotal
}

function SectionGroup({ section, items }) {
  const { removeItem, sectionTotal, hasCombo, hasCrossCombo, hasDivineCombo, divineAnchorSection, setIsOpen } = useCart()
  const config = SECTION_CONFIG[section]
  const combo = hasCombo(section)
  const crossActive = hasCrossCombo()
  const divineActive = hasDivineCombo()
  const anchorSec = divineAnchorSection()
  const grpTotal = sectionTotal(section)
  const count = items.length
  const needed = config?.comboQty ? config.comboQty - (count % config.comboQty) : 0
  const oneAway = config?.comboQty && !combo && needed === 1

  // Divine coverage: anchor section → first 3 covered; other sections → first 1 covered
  const divineCoveredCount = divineActive && DIVINE_COMBO.sections.includes(section)
    ? (section === anchorSec ? 3 : 1)
    : 0

  // Cross-combo (non-divine) coverage: first 1 from each section
  const crossCoveredCount = !divineActive && crossActive && CROSS_COMBO.sections.includes(section) ? 1 : 0

  const coveredCount = divineCoveredCount || crossCoveredCount
  const tag = divineActive && DIVINE_COMBO.sections.includes(section)
    ? { label: '✨ Divine', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
    : (crossActive && CROSS_COMBO.sections.includes(section))
    ? { label: '🌟 Tri-Combo', color: 'bg-purple-100 text-purple-700 border-purple-200' }
    : null

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-amber-700 font-bold text-[11px] uppercase tracking-widest">{config?.label || section}</div>
        <div className="flex items-center gap-1.5">
          {tag && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${tag.color}`}>
              {tag.label}
            </span>
          )}
          {combo && !divineActive && (
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
              🎉 Combo
            </span>
          )}
          {oneAway && !combo && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
              Add 1 more for combo!
            </span>
          )}
        </div>
      </div>

      {items.map((item, idx) => {
        const saving = itemSaving(item)
        const isCovered = idx < coveredCount
        const coverLabel = divineActive && isCovered
          ? (section === anchorSec && idx < 3 ? '✨ Divine Bundle' : '✨ Divine Bundle')
          : (isCovered ? '🌟 Part of Tri-Combo' : null)

        return (
          <div key={item.id} className={`flex items-center gap-2 border rounded-xl px-3 py-2 mb-1.5 ${
            divineActive && isCovered ? 'bg-yellow-50 border-yellow-200'
            : isCovered ? 'bg-purple-50 border-purple-200'
            : 'bg-amber-50 border-amber-100'
          }`}>
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-amber-900 font-semibold text-xs truncate">{item.title}</div>
              {item.wasPrice && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-400 line-through">₹{item.wasPrice.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-green-600 font-bold bg-green-100 px-1 rounded">
                    -{item.discount || fmt(saving) + ' off'}
                  </span>
                </div>
              )}
              {coverLabel && (
                <div className={`text-[10px] font-bold mt-0.5 ${divineActive && isCovered ? 'text-yellow-700' : 'text-purple-600'}`}>
                  {coverLabel}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <div className={`font-bold text-xs ${
                divineActive && isCovered ? 'text-yellow-700'
                : isCovered ? 'text-purple-700'
                : 'text-amber-800'
              }`}>
                {isCovered ? 'in bundle' : fmt(item.unitPrice)}
              </div>
              {saving > 0 && !isCovered && (
                <div className="text-green-600 text-[9px] font-bold">saved {fmt(saving)}</div>
              )}
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-400 hover:text-red-600 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 flex-shrink-0 text-lg leading-none"
              title="Remove">
              ×
            </button>
          </div>
        )
      })}

      <div className="flex justify-between items-center text-xs px-1 mt-1 gap-2">
        {config?.comboQty ? (
          combo && !divineActive ? (
            <span className="text-green-600 font-semibold flex items-center gap-1">
              ✓ {Math.floor(count / config.comboQty)}× combo ({fmt(config.comboPrice)} each)
              {count % config.comboQty > 0 && ` + ${count % config.comboQty}×`}
            </span>
          ) : divineActive ? (
            <span className="text-yellow-700 font-semibold">✨ Part of Divine Bundle</span>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false)
                setTimeout(() => document.getElementById(sectionScrollId(section))?.scrollIntoView({ behavior: 'smooth' }), 150)
              }}
              className="text-amber-500 hover:text-amber-700 underline underline-offset-2 font-medium text-left">
              + Add {needed} more → combo {fmt(config.comboPrice)}
            </button>
          )
        ) : (
          <span className="text-amber-400 text-[10px]">Individual pricing</span>
        )}
        <span className="text-amber-800 font-bold flex-shrink-0">{fmt(grpTotal)}</span>
      </div>
    </div>
  )
}

function sectionScrollId(section) {
  return {
    'Prashn Kundali': 'prashn-grid',
    'Modern Astrology': 'modern-grid',
    'Hasth Rekha': 'hasth-rekha-grid',
    'Services': 'services',
  }[section] || 'services'
}

export default function CartDrawer() {
  const {
    items, mode, setMode,
    subtotal, modeFee, total,
    isOpen, setIsOpen, sectionItems, hasCrossCombo, hasDivineCombo, divineAnchorSection,
  } = useCart()

  // 'cart' = standard cart view, 'booking' = embedded booking form, 'confirmed' = success screen
  const [view, setView] = useState('cart')
  const [confirmation, setConfirmation] = useState(null)

  // Listen to global Book Now triggers from outside the drawer
  useEffect(() => {
    const handler = () => { setIsOpen(true); setView('cart') }
    window.addEventListener('openBooking', handler)
    return () => window.removeEventListener('openBooking', handler)
  }, [setIsOpen])

  // When drawer closes, reset to cart view (next time it opens fresh)
  useEffect(() => {
    if (!isOpen) {
      // small delay so close animation finishes before view reset
      const t = setTimeout(() => { setView('cart'); setConfirmation(null) }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const sections = [...new Set(items.map(i => i.section))]
  const isEmpty = items.length === 0
  const divineActive = hasDivineCombo()
  const crossActive = !divineActive && hasCrossCombo()
  const anchorSec = divineAnchorSection()

  // ── Savings calculations ──────────────────────────────────────────────────
  const unitSavings = items.reduce((s, i) => s + itemSaving(i), 0)

  // Divine combo saving vs paying section combo + tri-combo separately
  // Section combo: anchorSec comboPrice, tri-combo: CROSS_COMBO.price
  // Divine collapses both into DIVINE_COMBO.price
  const divineSaving = divineActive ? (() => {
    const cfg = SECTION_CONFIG[anchorSec]
    const separateCost = (cfg?.comboPrice || 0) + CROSS_COMBO.price
    return separateCost - DIVINE_COMBO.price
  })() : 0

  const crossComboSaving = !divineActive && crossActive
    ? (CROSS_COMBO.wasPrice - CROSS_COMBO.price)
    : 0

  const comboSavings = sections.reduce((s, sec) => {
    if (divineActive && DIVINE_COMBO.sections.includes(sec)) return s // covered by divine
    return s + comboSaving(sec, sectionItems(sec))
  }, 0)

  const grandWas = items.reduce((s, i) => s + (i.wasPrice || i.unitPrice), 0) + modeFee
  const totalSaved = grandWas - total

  const sectionComboSavings = sections.map(sec => ({
    sec,
    saving: comboSaving(sec, sectionItems(sec)),
    label: SECTION_CONFIG[sec]?.label || sec,
  })).filter(x => x.saving > 0 && !(divineActive && DIVINE_COMBO.sections.includes(x.sec)))

  // Nudge logic
  const missingSectionsForCross = CROSS_COMBO.sections.filter(sec => !items.some(i => i.section === sec))
  const showCrossNudge = !crossActive && !divineActive && missingSectionsForCross.length > 0 && missingSectionsForCross.length < 3

  // Divine nudge: cross-combo active but no section has 3 yet
  const divineProgress = divineActive ? null : (() => {
    const anchorCandidate = DIVINE_COMBO.sections
      .map(sec => ({ sec, count: items.filter(i => i.section === sec).length }))
      .sort((a, b) => b.count - a.count)[0]
    const crossDone = CROSS_COMBO.sections.every(sec => items.some(i => i.section === sec))
    if (crossDone && anchorCandidate && anchorCandidate.count < 3) {
      const needed = 3 - anchorCandidate.count
      return { sec: anchorCandidate.sec, needed, label: SECTION_CONFIG[anchorCandidate.sec]?.label }
    }
    return null
  })()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" onClick={() => setIsOpen(false)} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[430px] bg-white z-[120] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {view === 'cart' && (<>

        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between flex-shrink-0 ${
          divineActive
            ? 'bg-gradient-to-r from-[#1c0a00] via-[#4a1a05] to-[#2d0f00]'
            : 'bg-gradient-to-r from-amber-900 to-amber-800'
        }`} style={divineActive ? { borderBottom: '1px solid rgba(234,179,8,0.35)' } : {}}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{divineActive ? '✨' : '🛒'}</span>
            <div>
              <div className="text-yellow-300 font-bold text-base">
                {divineActive ? '5-in-1 Divine Bundle' : 'Your Cart'}
              </div>
              <div className="text-amber-400 text-xs">{items.length} service{items.length !== 1 ? 's' : ''} selected</div>
            </div>
          </div>
          {totalSaved > 0 && !isEmpty && (
            <div className={`border rounded-xl px-3 py-1.5 text-center ${
              divineActive ? 'bg-yellow-400/20 border-yellow-300/50' : 'bg-green-500/20 border-green-400/50'
            }`}>
              <div className={`text-[10px] font-semibold leading-none ${divineActive ? 'text-yellow-200' : 'text-green-300'}`}>You save</div>
              <div className={`font-black text-sm leading-tight ${divineActive ? 'text-yellow-200' : 'text-green-300'}`}>{fmt(totalSaved)}</div>
            </div>
          )}
          <button onClick={() => setIsOpen(false)}
            className="text-amber-300 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-700 transition-all text-xl">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-6xl mb-4 opacity-40">🔮</div>
              <div className="text-amber-700 font-semibold text-base mb-1">Your cart is empty</div>
              <div className="text-amber-400 text-sm">Add services from any section below</div>
              <button onClick={() => setIsOpen(false)}
                className="mt-5 px-6 py-2.5 bg-amber-100 text-amber-700 font-semibold rounded-xl text-sm hover:bg-amber-200 transition-all">
                Browse Services
              </button>
            </div>
          ) : (
            <>
              {/* ── Divine Combo active banner ── */}
              {divineActive && (
                <div className="relative overflow-hidden rounded-2xl mb-4 p-4 text-white shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #1c0a00 0%, #3b1202 35%, #4a1a05 65%, #2d0f00 100%)', border: '1px solid rgba(234,179,8,0.4)' }}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  {/* gold accent line top */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/70 to-transparent" />
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">✨</span>
                    <div className="flex-1">
                      <div className="font-black text-sm leading-tight" style={{ color: '#fcd34d' }}>5-in-1 Divine Consultation Active!</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#d4a574' }}>3 from {SECTION_CONFIG[anchorSec]?.label} + 1 each from the other sections</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] line-through" style={{ color: '#92600a' }}>{fmt(DIVINE_COMBO.wasPrice)}</div>
                      <div className="font-black text-lg" style={{ color: '#fcd34d' }}>{fmt(DIVINE_COMBO.price)}</div>
                    </div>
                  </div>
                  {/* gold accent line bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/70 to-transparent" />
                </div>
              )}

              {/* ── Tri-Combo active banner (non-divine) ── */}
              {crossActive && (
                <div className="relative overflow-hidden rounded-2xl mb-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-4 text-white shadow-lg">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌟</span>
                    <div className="flex-1">
                      <div className="font-black text-sm leading-tight">Tri-Reading Combo Active!</div>
                      <div className="text-purple-200 text-xs mt-0.5">1 from each section — {fmt(CROSS_COMBO.price)} total</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-purple-200 text-[10px] line-through">{fmt(CROSS_COMBO.wasPrice)}</div>
                      <div className="font-black text-base text-yellow-300">{fmt(CROSS_COMBO.price)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Divine nudge (tri-combo done, just need 2 more from one section) ── */}
              {divineProgress && (
                <div className="rounded-2xl mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 p-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">✨</span>
                    <span className="text-yellow-800 font-bold text-xs">Unlock 5-in-1 Divine — {fmt(DIVINE_COMBO.price)}</span>
                    <span className="ml-auto bg-yellow-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{DIVINE_COMBO.discount}</span>
                  </div>
                  <div className="text-yellow-700 text-[11px] leading-snug">
                    Add{' '}
                    <button
                      onClick={() => { setIsOpen(false); setTimeout(() => document.getElementById(sectionScrollId(divineProgress.sec))?.scrollIntoView({ behavior: 'smooth' }), 150) }}
                      className="font-bold underline underline-offset-1 text-yellow-800 hover:text-yellow-900">
                      {divineProgress.needed} more from {divineProgress.label}
                    </button>
                    {' '}to unlock the ultimate 5-in-1 bundle!
                  </div>
                </div>
              )}

              {/* ── Cross-combo nudge (not yet active) ── */}
              {showCrossNudge && (
                <div className="rounded-2xl mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">🌟</span>
                    <span className="text-purple-800 font-bold text-xs">Unlock Tri-Reading Combo — {fmt(CROSS_COMBO.price)}</span>
                    <span className="ml-auto bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{CROSS_COMBO.discount}</span>
                  </div>
                  <div className="text-purple-600 text-[11px] leading-snug">
                    Add 1 service from{' '}
                    {missingSectionsForCross.map((sec, i) => (
                      <span key={sec}>
                        <button
                          onClick={() => { setIsOpen(false); setTimeout(() => document.getElementById(sectionScrollId(sec))?.scrollIntoView({ behavior: 'smooth' }), 150) }}
                          className="font-bold underline underline-offset-1 text-purple-700 hover:text-purple-900">
                          {SECTION_CONFIG[sec]?.label || sec}
                        </button>
                        {i < missingSectionsForCross.length - 1 ? ' and ' : ''}
                      </span>
                    ))}
                    {' '}to get all 3 for just {fmt(CROSS_COMBO.price)}!
                  </div>
                </div>
              )}

              {/* Services grouped */}
              {sections.map(sec => (
                <SectionGroup key={sec} section={sec} items={sectionItems(sec)} />
              ))}

              <div className="border-t border-amber-100 my-4" />

              {/* Consultation Mode */}
              <div className="mb-4">
                <div className="text-amber-800 font-bold text-xs uppercase tracking-widest mb-2">Consultation Mode</div>
                <div className="grid grid-cols-2 gap-2">
                  {MODES.map(m => (
                    <button key={m.key}
                      onClick={() => setMode(m.key)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                        mode === m.key
                          ? 'border-amber-500 bg-amber-100 text-amber-900'
                          : 'border-amber-100 bg-amber-50 text-amber-600 hover:border-amber-300'
                      }`}>
                      <span className="text-lg">{m.icon}</span>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{m.key}</div>
                        <div className={`text-[10px] font-bold ${m.fee === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                          {m.fee === 0 ? 'Free' : m.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-amber-100 my-3" />

              {/* ── Price Breakdown ── */}
              <div className="space-y-1.5 text-sm mb-3">
                <div className="flex justify-between text-gray-400">
                  <span>Original price</span>
                  <span className="line-through">{fmt(grandWas - modeFee)}</span>
                </div>

                {unitSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><span>✨</span> Discount savings</span>
                    <span className="font-semibold">−{fmt(unitSavings)}</span>
                  </div>
                )}

                {divineActive && divineSaving > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-orange-600 font-semibold"><span>✨</span> 5-in-1 Divine Bundle</span>
                    <span className="divine-saving-anim">−{fmt(divineSaving)}</span>
                  </div>
                )}

                {crossActive && crossComboSaving > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span className="flex items-center gap-1"><span>🌟</span> Tri-Reading Combo</span>
                    <span className="font-semibold">−{fmt(crossComboSaving)}</span>
                  </div>
                )}

                {sectionComboSavings.map(({ sec, saving, label }) => (
                  <div key={sec} className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><span>🎉</span> {label} combo</span>
                    <span className="font-semibold">−{fmt(saving)}</span>
                  </div>
                ))}

                <div className="flex justify-between text-amber-700">
                  <span>Services subtotal</span>
                  <span className="font-semibold">{fmt(subtotal())}</span>
                </div>

                <div className="flex justify-between text-amber-700">
                  <span>Consultation ({mode})</span>
                  <span className={`font-semibold ${modeFee === 0 ? 'text-green-600' : ''}`}>
                    {modeFee === 0 ? 'Free' : fmt(modeFee)}
                  </span>
                </div>

                <div className="border-t border-amber-200 pt-2 flex justify-between text-amber-900 font-bold text-base">
                  <span>Total</span>
                  <span className="text-amber-700">{fmt(total)}</span>
                </div>
              </div>

              {/* ── You Save Banner ── */}
              {totalSaved > 0 && (
                <div className={`relative overflow-hidden rounded-2xl p-4 text-white ${
                  !divineActive && crossActive ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 shadow-lg shadow-purple-500/30' : ''
                }`}
                  style={divineActive ? { background: 'linear-gradient(135deg, #1c0a00 0%, #3b1202 40%, #4a1a05 70%, #2d0f00 100%)', border: '1px solid rgba(234,179,8,0.35)' } : !crossActive ? { background: 'linear-gradient(to right, #22c55e, #10b981)' } : {}}>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-lg leading-tight" style={divineActive ? { color: '#fcd34d' } : {}}>
                        {divineActive ? '✨' : crossActive ? '🌟' : '🎊'} You&apos;re saving {fmt(totalSaved)}!
                      </div>
                      <div className={`text-xs mt-0.5 ${divineActive ? '' : crossActive ? 'text-purple-200' : 'text-green-100'}`} style={divineActive ? { color: '#d4a574' } : {}}>
                        {divineActive
                          ? `Includes 5-in-1 Divine bundle savings`
                          : [
                              unitSavings > 0 && `${fmt(unitSavings)} in discounts`,
                              crossComboSaving > 0 && `${fmt(crossComboSaving)} Tri-Combo`,
                              comboSavings > 0 && `${fmt(comboSavings)} from combos`,
                            ].filter(Boolean).join(' + ')
                        }
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs ${divineActive ? '' : crossActive ? 'text-purple-300' : 'text-green-100'}`} style={divineActive ? { color: '#a06020' } : {}}>vs original</div>
                      <div className={`font-black text-base line-through ${divineActive ? '' : crossActive ? 'text-purple-300' : 'text-green-200'}`} style={divineActive ? { color: '#92600a' } : {}}>{fmt(grandWas)}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer CTA */}
        {!isEmpty && (
          <div className="px-4 pb-5 pt-3 flex-shrink-0 border-t border-amber-100 bg-white">
            <button
              onClick={() => setView('booking')}
              data-testid="cart-proceed-to-book"
              style={divineActive ? { background: 'linear-gradient(135deg, #1c0a00, #4a1a05, #3b1202)', border: '1px solid rgba(234,179,8,0.5)', boxShadow: '0 4px 20px rgba(180,100,0,0.35)' } : {}}
              className={`w-full text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                divineActive
                  ? 'hover:opacity-90'
                  : 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 hover:shadow-amber-400/30'
              }`}>
              {divineActive ? '✨' : '🙏'} Proceed to Book — {fmt(total)}
            </button>
            {totalSaved > 0 && (
              <div className={`text-center mt-1.5 text-xs font-semibold ${divineActive ? '' : 'text-green-600'}`} style={divineActive ? { color: '#b45309' } : {}}>
                {divineActive ? '✨' : '🎉'} Saving {fmt(totalSaved)} on this order
              </div>
            )}
            <p className="text-center text-amber-400 text-[10px] mt-1">Prices in INR · No hidden charges</p>
          </div>
        )}

        </>)}

        {view === 'booking' && (
          <CartBookingFlow
            onBack={() => setView('cart')}
            onConfirmed={(data) => { setConfirmation(data); setView('confirmed') }}
          />
        )}

        {view === 'confirmed' && confirmation && (
          <div className="flex flex-col h-full" data-testid="cart-booking-confirmed">
            <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🙏</span>
                <div>
                  <div className="text-yellow-300 font-bold text-base">Booking Confirmed!</div>
                  <div className="text-amber-400 text-xs">We&apos;ll call you within 2–4 hours</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="text-amber-300 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-700 transition-all text-xl">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6 text-center">
              <div className="text-6xl mb-4 animate-bounce">🌟</div>
              <h3 className="text-xl font-bold text-amber-900 mb-1">Thank you, {confirmation.name}!</h3>
              <p className="text-amber-700 text-sm mb-4">We will contact you on <strong>+91 {confirmation.phone}</strong> shortly.</p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 mb-3 space-y-1">
                <div className="flex justify-between"><span className="text-amber-500">Service</span><strong>{confirmation.service}</strong></div>
                <div className="flex justify-between"><span className="text-amber-500">Concern</span><strong>{confirmation.concern}</strong></div>
                <div className="flex justify-between"><span className="text-amber-500">Mode</span><strong>{confirmation.mode}</strong></div>
                <div className="flex justify-between border-t border-amber-200 pt-1 mt-1"><span className="text-amber-500">Total</span><strong className="text-amber-700">{fmt(confirmation.total)}</strong></div>
              </div>

              <p className="text-amber-500 text-xs italic mb-2">ॐ तत् सत् — May the stars bless your journey 🌟</p>
              {confirmation.id && (
                <p className="text-amber-400 text-[11px]">Booking ID: <span className="font-mono">{confirmation.id}</span></p>
              )}
            </div>
            <div className="px-4 py-3 border-t border-amber-100 bg-white flex-shrink-0">
              <button onClick={() => setIsOpen(false)}
                data-testid="cart-booking-close"
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
