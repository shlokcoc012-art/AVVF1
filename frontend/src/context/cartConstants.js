// Pure data constants extracted from CartContext.jsx so that Vite's React
// fast-refresh works correctly (refresh only triggers on component changes).

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

// Cross-section "Tri-Combo" — pick 1 from each of the 3 main sections → ₹2,699
export const CROSS_COMBO = {
  sections: ['Prashn Kundali', 'Modern Astrology', 'Hasth Rekha'],
  price: 2699,
  wasPrice: 3797,
  label: 'Tri-Reading Combo',
  description: '1 from each section',
  discount: '29% Off',
  offer: 'Best Value',
}

// "5-in-1 Divine Consultation" — 3 from one section + 1 each from other two
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
