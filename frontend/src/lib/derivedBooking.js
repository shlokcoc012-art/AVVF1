// Maps cart sections + item titles to BookingModal-compatible Service / Concern values

export const SECTION_TO_SERVICE = {
  'Prashn Kundali':    'Prashn Kundali',
  'Modern Astrology':  'Modern Astrology',
  'Hasth Rekha':       'Hasth Rekha (Palmistry)',
  'Holistic Healing':  'Holistic Healing & Energy Alignment',
  // 'Services' section → service IS the item title (Raj Yoga Analysis, Grah Dosh Relief, etc.)
}

export const TITLE_TO_CONCERN = {
  // Prashn Kundali
  'Profession & Career':   'Career & Profession',
  'Wealth & Finance':      'Wealth & Finance',
  'Health & Longevity':    'Health',
  'Married Life':          'Marriage & Relationships',
  'Children & Progeny':    'Children & Progeny',
  'Foreign Settlement':    'Foreign Settlement',
  'Relationships':         'Marriage & Relationships',
  'Property & Real Estate':'Property & Real Estate',
  'Education':             'Education',
  'Legal Matters':         'Legal Matters',
  'Spiritual Growth':      'Spiritual Growth',

  // Modern Astrology
  'Numerology':            'Other',
  'Energy Analysis':       'Other',
  'Sun Sign Astrology':    'Other',
  'Moon Sign Reading':     'Other',
  'Transit Analysis':      'Other',
  'Retrograde Planets':    'Other',
  'Solar Return Chart':    'Other',
  'Synastry (Compatibility)': 'Marriage & Relationships',
  'Progressed Chart':      'Spiritual Growth',
  'Composite Chart':       'Marriage & Relationships',
  'Harmonic Astrology':    'Spiritual Growth',
  'Psychological Astrology':'Spiritual Growth',

  // Hasth Rekha
  'Life Line':       'Health',
  'Heart Line':      'Marriage & Relationships',
  'Head Line':       'Career & Profession',
  'Fate Line':       'Career & Profession',
  'Sun Line (Apollo)':'Career & Profession',
  'Mercury Line':    'Business Guidance',
  'Marriage Lines':  'Marriage & Relationships',
  'Children Lines':  'Children & Progeny',
  'Wealth Signs':    'Wealth & Finance',
  'Special Yogas & Marks': 'Spiritual Growth',

  // Specialized "Services" section
  'Raj Yoga Analysis':          'Raj Yoga & Success',
  'Dhan Yog Analysis':          'Wealth & Finance',
  'Past Life & Karma Analysis': 'Spiritual Growth',
  'Grah Dosh Relief':           'Other',
  'Shubh Muhurt':               'Other',
  'Kundali & Marriage':         'Marriage & Relationships',
  'Career & Future':            'Career & Profession',

  // Holistic Healing & Energy Alignment (all map to Health/Spiritual)
  'Chronic Disease & Vitality Healing':   'Health',
  'Chakra Awakening & Alignment':         'Spiritual Growth',
  'Emotional Trauma & Anxiety Relief':    'Health',
  'Aura Cleansing & Shielding':           'Spiritual Growth',
  'Karmic Blockage Dissolution':          'Spiritual Growth',
  'Spiritual Awakening & Cord Cutting':   'Spiritual Growth',
}

/**
 * Derive the primary Service and Concern from the cart items.
 * Uses the FIRST item in the cart as the primary signal; additional items still
 * travel along in the `cartItems` payload sent to the backend.
 */
export function deriveServiceConcern(items) {
  if (!items || items.length === 0) {
    return { service: '', concern: '', summary: '' }
  }

  const primary = items[0]
  const service = SECTION_TO_SERVICE[primary.section] || primary.title
  const concern = TITLE_TO_CONCERN[primary.title] || 'Other'

  const summary = items.length === 1
    ? `${service} — ${primary.title}`
    : `${service} +${items.length - 1} more`

  return { service, concern, summary, primaryTitle: primary.title }
}
