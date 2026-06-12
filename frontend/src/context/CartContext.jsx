import { createContext, useContext, useState, useCallback, useMemo } from 'react'

// ─── Pricing tables ──────────────────────────────────────────────────────────

export const SECTION_CONFIG = {
  'Prashn Kundali': {
    label: 'Prashn Kundali',
    unitPrice: 1299,
    wasUnitPrice: 1999,
    unitDiscount: '35% Off',
    comboQty: 3,
    comboPrice: 2599,
    wasComboPrice: 3999,
    comboDiscount: '35% Off',
    comboOffer: 'Limited Time Offer',
    dark: true,
  },
  'Modern Astrology': {
    label: 'Modern Astrology',
    unitPrice: 1299,
    wasUnitPrice: 1999,
    unitDiscount: '35% Off',
    comboQty: 3,
    comboPrice: 2599,
    wasComboPrice: 3999,
    comboDiscount: '35% Off',
    comboOffer: 'Limited Time Offer',
    dark: false,
  },
  'Hasth Rekha': {
    label: 'Hasth Rekha Vigyan',
    unitPrice: 1199,
    wasUnitPrice: 1999,
    unitDiscount: 'Flat 40% Off',
    comboQty: 3,
    comboPrice: 2499,
    wasComboPrice: 4999,
    comboDiscount: '50% Off',
    comboOffer: 'Limited Time Offer',
    dark: false,
  },
  'Services': {
    label: 'Core Services',
    unitPrice: null,
    comboQty: null,
    comboPrice: null,
    dark: false,
  },
  'Holistic Healing': {
    label: 'Holistic Healing & Energy Alignment',
    unitPrice: 11000,
    comboQty: null,
    comboPrice: null,
    dark: true,
  },
}

// ─── Cross-section "Tri-Combo" ─────────────────────────────────────────────────
// Pick 1 service from each of the 3 main sections → ₹2,699
export const CROSS_COMBO = {
  sections: ['Prashn Kundali', 'Modern Astrology', 'Hasth Rekha'],
  price: 2699,
  wasPrice: 3797, // 1299 + 1299 + 1199 (individual discounted prices)
  label: 'Tri-Reading Combo',
  description: '1 from each section',
  discount: '29% Off',
  offer: 'Best Value',
}

// ─── "5-in-1 Divine Consultation" ─────────────────────────────────────────────
// Any section combo (3 from one section) + 1 from each of the other 2 = 5 services → ₹5,199
// wasPrice = 5 × ₹1,999 = ₹9,995
export const DIVINE_COMBO = {
  sections: ['Prashn Kundali', 'Modern Astrology', 'Hasth Rekha'],
  price: 5100,
  wasPrice: 9995,
  label: '5-in-1 Divine Consultation',
  description: '3 from any section + 1 each from the other two',
  discount: '48% Off',
  offer: 'Ultimate Bundle',
}

export const SERVICE_PRICES = {
  'Numerology': 1199,
  'Energy Analysis': 1199,
  'Grah Dosh Relief': 2199,
  'Shubh Muhurt': 2199,
  'Kundali & Marriage': 2199,
  'Career & Future': 2199,
}

export const MODE_FEES = {
  'Phone Call': 0,
  'WhatsApp': 99,
  'Video Call': 999,
  'In-Person Visit': 9999,
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [mode, setMode] = useState('Phone Call')
  const [isOpen, setIsOpen] = useState(false)
  const [comboPickerSection, setComboPickerSection] = useState(null)
  const [triComboMode, setTriComboMode] = useState(false)

  const addItem = useCallback((item, openCart = false) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev
      return [...prev, item]
    })
    if (openCart) setIsOpen(true)
  }, [setIsOpen])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const hasItem = useCallback((id) => items.some(i => i.id === id), [items])

  const sectionItems = useCallback((section) => items.filter(i => i.section === section), [items])

  // ── Tri-Combo: 1 from each of the 3 sections ─────────────────────────────
  const hasCrossCombo = useCallback(() => {
    return CROSS_COMBO.sections.every(sec => items.some(i => i.section === sec))
  }, [items])

  // ── Divine Combo: one section has ≥3 (section combo) + other 2 have ≥1 each
  const hasDivineCombo = useCallback(() => {
    const secs = DIVINE_COMBO.sections
    const hasAnchor = secs.some(sec => items.filter(i => i.section === sec).length >= 3)
    const allPresent = secs.every(sec => items.some(i => i.section === sec))
    return hasAnchor && allPresent
  }, [items])

  // Which section is the "anchor" (has the section combo of 3+)
  const divineAnchorSection = useCallback(() => {
    return DIVINE_COMBO.sections.find(sec => items.filter(i => i.section === sec).length >= 3) || null
  }, [items])

  // Compute raw section total (used internally for extras)
  const sectionTotal = useCallback((section) => {
    const cfg = SECTION_CONFIG[section]
    const grp = items.filter(i => i.section === section)
    if (!cfg || !cfg.comboQty) {
      return grp.reduce((s, i) => s + i.unitPrice, 0)
    }
    const bundles = Math.floor(grp.length / cfg.comboQty)
    const remaining = grp.length % cfg.comboQty
    return bundles * cfg.comboPrice + remaining * cfg.unitPrice
  }, [items])

  const hasCombo = useCallback((section) => {
    const cfg = SECTION_CONFIG[section]
    if (!cfg || !cfg.comboQty) return false
    return items.filter(i => i.section === section).length >= cfg.comboQty
  }, [items])

  // ── Subtotal — three tiers: divine > cross > normal ──────────────────────
  const subtotal = useCallback(() => {
    const allSections = [...new Set(items.map(i => i.section))]

    // ── TIER 1: Divine Combo ─────────────────────────────────────────────
    const divineActive = (() => {
      const secs = DIVINE_COMBO.sections
      return secs.some(sec => items.filter(i => i.section === sec).length >= 3)
          && secs.every(sec => items.some(i => i.section === sec))
    })()

    if (divineActive) {
      const anchorSec = DIVINE_COMBO.sections.find(sec => items.filter(i => i.section === sec).length >= 3)
      const otherSecs = DIVINE_COMBO.sections.filter(s => s !== anchorSec)

      let total = DIVINE_COMBO.price

      // Anchor section extras beyond the 3 covered by divine
      const anchorItems = items.filter(i => i.section === anchorSec)
      const anchorExtras = anchorItems.slice(3)
      if (anchorExtras.length > 0) {
        const cfg = SECTION_CONFIG[anchorSec]
        const eb = Math.floor(anchorExtras.length / cfg.comboQty)
        const er = anchorExtras.length % cfg.comboQty
        total += eb * cfg.comboPrice + er * cfg.unitPrice
      }

      // Other two sections: first item covered by divine, extras billed normally
      for (const sec of otherSecs) {
        const cfg = SECTION_CONFIG[sec]
        const grp = items.filter(i => i.section === sec)
        const extras = grp.slice(1)
        if (extras.length > 0) {
          const eb = Math.floor(extras.length / cfg.comboQty)
          const er = extras.length % cfg.comboQty
          total += eb * cfg.comboPrice + er * cfg.unitPrice
        }
      }

      // Non-divine sections (e.g. 'Services')
      for (const sec of allSections) {
        if (!DIVINE_COMBO.sections.includes(sec)) {
          total += sectionTotal(sec)
        }
      }

      return total
    }

    // ── TIER 2: Tri-Combo (cross-combo) ──────────────────────────────────
    const crossActive = CROSS_COMBO.sections.every(sec => items.some(i => i.section === sec))

    if (crossActive) {
      let total = CROSS_COMBO.price

      for (const sec of CROSS_COMBO.sections) {
        const cfg = SECTION_CONFIG[sec]
        const grp = items.filter(i => i.section === sec)
        const extras = grp.slice(1)
        if (extras.length > 0) {
          const extraBundles = Math.floor(extras.length / cfg.comboQty)
          const extraRem = extras.length % cfg.comboQty
          total += extraBundles * cfg.comboPrice + extraRem * cfg.unitPrice
        }
      }

      for (const sec of allSections) {
        if (!CROSS_COMBO.sections.includes(sec)) {
          total += sectionTotal(sec)
        }
      }

      return total
    }

    // ── TIER 3: Normal pricing ────────────────────────────────────────────
    return allSections.reduce((s, sec) => s + sectionTotal(sec), 0)
  }, [items, sectionTotal])

  const modeFee = MODE_FEES[mode] || 0
  const total = subtotal() + modeFee

  const ctxValue = useMemo(
    () => ({
      items, addItem, removeItem, hasItem, sectionItems,
      sectionTotal, hasCombo, hasCrossCombo, hasDivineCombo, divineAnchorSection,
      triComboMode, setTriComboMode,
      mode, setMode,
      subtotal, modeFee, total,
      isOpen, setIsOpen,
      comboPickerSection, setComboPickerSection,
    }),
    [
      items, addItem, removeItem, hasItem, sectionItems,
      sectionTotal, hasCombo, hasCrossCombo, hasDivineCombo, divineAnchorSection,
      triComboMode, mode, subtotal, modeFee, total, isOpen,
      comboPickerSection,
    ],
  )

  return (
    <CartCtx.Provider value={ctxValue}>
      {children}
    </CartCtx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
