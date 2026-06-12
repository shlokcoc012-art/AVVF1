import { useEffect } from 'react'

// All 4 legal documents — labels and content match what the operator provided.
const LEGAL_DOCS = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'ASTRO VEDIC VANI — COMPREHENSIVE LEGAL, MEDICAL, FINANCIAL, AND SPIRITUAL DISCLAIMER',
    updated: 'Last Updated: June 2026',
    sections: [
      {
        heading: '1. SPIRITUAL, EDUCATIONAL, AND ENTERTAINMENT PURPOSE ONLY',
        body: 'All contents, materials, services, and products available on or through Astro Vedic Vani—including but not limited to Janam Kundli analysis, Prashna Kundali (Instant Question Readings), Past Life & Karma Analysis, Distant Reiki, Chakra Balancing, Aura Cleansing, Energy Healing, and remedial recommendations—are provided strictly for spiritual, educational, and cosmological entertainment purposes.\n\nVedic Astrology (Jyotish) and Energy Healing are ancient, subjective, interpretive disciplines based on cosmic calculations, energetic frequencies, and metaphysical principles. By accessing and using this website, you explicitly acknowledge and agree that absolute mathematical or predictive accuracy, replication of specific results, or tangible physical/metaphysical outcomes cannot be guaranteed, implied, or warranted. Cosmic trends show tendencies and probabilities, not absolute certainties.',
      },
      {
        heading: '2. STALWART NO MEDICAL OR HEALTHCARE ADVICE CLAUSE (AYUR-JYOTISH & ENERGY HEALING)',
        body: 'The distance energy healing, Reiki, pranic transmission, aura cleansing, and health-related astrological insights (such as interpretations of the 6th, 8th, or 12th houses) offered on this platform are absolutely NOT a substitute for professional medical diagnosis, examination, advice, prognosis, or treatment.',
        items: [
          { label: 'A. NO DOCTOR-PATIENT RELATIONSHIP:', text: 'Utilizing, purchasing, or participating in any energy healing session or receiving an astrological health overview does not establish a medical, therapeutic, psychiatric, or clinical relationship of any kind between you and Shlok Pandey (PT. N.R. PATHAK) or Astro Vedic Vani.' },
          { label: 'B. DO NOT DISREGARD MEDICAL ADVICE:', text: 'You must never disregard professional medical advice, delay seeking expert medical evaluation, or terminate any ongoing medical treatments, prescriptions, or therapies because of any information, interpretation, or advice you read on this website or receive during a private consultation.' },
          { label: 'C. EMERGENCY SITUATIONS:', text: 'If you are experiencing acute or chronic physical diseases, severe medical conditions, mental health crises, suicidal ideation, depression, or acute psychological distress, you must seek immediate emergency medical care from a licensed healthcare provider, medical doctor, or hospital. Energy healing is purely a complementary spiritual practice and has no clinical or curative authority over physical or psychological pathology.' },
        ],
      },
      {
        heading: '3. NO FINANCIAL, INVESTMENT, OR LEGAL ADVICE CLAUSE',
        body: 'Any and all insights, timelines, and interpretations provided on this platform regarding "Wealth & Finance," "Property & Real Estate," "Business Success," "Career Pathing," or "Legal Matters" are derived purely from astrological charts, transits, and planetary placements.',
        items: [
          { label: 'A. NOT CERTIFIED COUNSEL:', text: 'Shlok Pandey (PT. N.R. PATHAK) and Astro Vedic Vani are not certified financial planners, chartered accountants, registered investment advisors, or licensed attorneys. No material provided constitutes certified financial planning, legal counsel, or investment advice.' },
          { label: 'B. ASSUMPTION OF RISK:', text: 'Any actions, financial investments, stock/cryptocurrency trading, property acquisitions, business launches, or legal filings you initiate based on consultations or data from this website are done entirely, 100% at your own risk and discretion. Astro Vedic Vani holds zero liability, accountability, or responsibility for monetary losses, business failures, bankruptcy, or legal complications resulting from your interpretations of our readings.' },
        ],
      },
      {
        heading: '4. SEVERABILITY AND CONSUMER ACKNOWLEDGMENT',
        body: 'By clicking "Book Now," completing a transaction, or browsing this site, you confirm that you have read this entire disclaimer, understand its legal implications, and voluntarily assume all risks associated with the subjective nature of the services. If any provision of this disclaimer is found to be unenforceable under applicable consumer protection laws, the remaining provisions will continue in full force and effect.',
      },
    ],
  },

  terms: {
    title: 'Terms of Service',
    subtitle: 'ASTRO VEDIC VANI — MASTER TERMS OF SERVICE AGREEMENT',
    updated: 'Last Updated: June 2026',
    intro: 'PLEASE READ THIS MASTER TERMS OF SERVICE AGREEMENT CAREFULLY. BY ACCESSING THIS WEBSITE, BOOKING AN APPOINTMENT, OR PURCHASING A SERVICE, YOU AGREE TO BE BOUND BY ALL OF THE TERMS AND CONDITIONS SPECIFIED HEREIN.',
    sections: [
      {
        heading: '1. LEGAL ACCEPTANCE AND BINDING CONTRACT',
        body: 'This document constitutes a legally binding agreement between you (the "Client", "User", or "Visitor") and Astro Vedic Vani, managed and operated by Shlok Pandey / PT. N.R. PATHAK (collectively referred to as "the Platform", "We", "Us", or "Our"). If you do not explicitly agree to every single term, condition, and clause outlined in this agreement, you are strictly prohibited from utilizing this website, its infrastructure, and booking any services.',
      },
      {
        heading: '2. AGE MANDATE AND LEGAL CAPACITY',
        body: 'You must be at least eighteen (18) years of age to purchase any service, register an account, or submit payment data on Astro Vedic Vani. By completing a booking, you warrant and represent that you possess the legal adult capacity to enter into a binding contract under the laws of India and your local jurisdiction. If you are ordering an astrological reading or an energy healing session for a minor, you explicitly warrant that you are the legal parent or court-appointed legal guardian of that minor, and you consent to the processing of their data for the consultation.',
      },
      {
        heading: '3. ABSOLUTE ACCURACY OF USER-SUBMITTED DATA',
        body: 'The entire structural integrity, predictive modeling, and energetic targeting of our services—including Janam Kundli, Prashna Kundali, and Distance Energy Healing—are entirely dependent on the specific chronological and geographical information provided by the Client.',
        items: [
          { label: 'A. USER RESPONSIBILITY:', text: 'You are solely responsible for ensuring the absolute accuracy of the Name, Gender, Date of Birth, Exact Time of Birth (including AM/PM configurations), and City/Country of birth submitted.' },
          { label: 'B. WAIVER OF LIABILITY FOR ERROR:', text: 'Astro Vedic Vani holds zero liability for incorrect, delayed, generic, or completely inaccurate readings, chart setups, or healing sessions resulting from typos, chronological errors, or false data submitted during the intake process. No free modifications or re-reads will be provided for user-submitted errors.' },
        ],
      },
      {
        heading: '4. INTELLECTUAL PROPERTY AND USAGE RESTRICTIONS',
        body: 'All code, website architecture, UI designs, graphics, branding, text descriptions, downloadable astrological reports, custom audio/video consultations, and digital media associated with Astro Vedic Vani are the exclusive intellectual property of Shlok Pandey and are protected under international copyright and trademark laws.',
        items: [
          { label: 'A. PERSONAL LICENSE ONLY:', text: 'Upon purchasing a service, you are granted a limited, non-exclusive, non-transferable, revocable license to use the provided digital reports or session information for personal, non-commercial use.' },
          { label: 'B. PROHIBITION OF REPRODUCTION:', text: 'You are strictly forbidden from uploading our custom reports, video readings, or proprietary text to public forums, AI training models, YouTube, social media platforms, or commercial databases without explicit written consent from Shlok Pandey.' },
        ],
      },
      {
        heading: '5. INDEMNIFICATION AND INDEMNITY BOUNDS',
        body: 'You agree to indemnify, defend, and hold harmless Astro Vedic Vani, Shlok Pandey (PT. N.R. PATHAK), its developers, contractors, and affiliates from and against any and all claims, damages, liabilities, costs, losses, or expenses (including reasonable attorneys\' fees) arising out of or related to your breach of this Agreement, your reliance on any material provided by the Platform, or your actions following an astrological or healing consultation.',
      },
      {
        heading: '6. LIQUIDATED DAMAGES AND LIMITATION OF LIABILITY',
        body: 'To the absolute maximum extent permitted by applicable consumer protection laws, the total aggregate liability of Astro Vedic Vani and Shlok Pandey for any claim arising out of or connecting to these terms, whether in contract, tort (including negligence), or statutory breach, shall be strictly limited to the exact amount of money you paid to Us for the specific single service that generated the alleged liability. Under no circumstances shall the Platform be liable for indirect, incidental, punitive, special, or consequential damages, including emotional trauma or perceived loss of luck.',
      },
      {
        heading: '7. GOVERNING LAW, FORUM, AND JURISDICTION',
        body: 'This Agreement, its performance, and any disputes arising directly or indirectly from it shall be governed by, interpreted, and construed exclusively in accordance with the substantive laws of the Republic of India, without regard to conflict of law principles. Any legal actions, lawsuits, arbitration, or judicial proceedings must be initiated and handled exclusively within the competent local courts located in Mumbai, Maharashtra, India.',
      },
    ],
  },

  refund: {
    title: 'Refund Policy',
    subtitle: 'ASTRO VEDIC VANI — REFUND, CANCELLATION, AND RESCHEDULING POLICY',
    updated: 'Last Updated: June 2026',
    sections: [
      {
        heading: '1. FINALITY OF TRANSACTION AND NO-REFUND MANDATE',
        body: 'Astro Vedic Vani operates under a strict, ironclad No-Refund Policy. Due to the digital, personalized, and deeply labor-intensive nature of our services, ALL SALES ARE FINAL. Once a payment is processed and a booking is confirmed, no refunds, returns, or balance rollbacks will be issued for any reason whatsoever outside of the explicit technical exceptions listed in Section 2.',
        items: [
          { label: 'A. ASTROLOGICAL REASONING:', text: 'Custom calculations, planetary alignments, D-chart structuring, and Prashna analysis require manual preparation, calculation, and time allocations by the practitioner before the consultation occurs.' },
          { label: 'B. HEALING REASONING:', text: 'Holistic Healing and Energy Alignment packages (including the 3-session Chakra/Reiki bundles priced at ₹11,000) require advanced calendar blocks, high-frequency energy scheduling, and manual distance attunements. By booking, you buy out that specific time and energetic asset, making it unavailable to other global clients.' },
        ],
      },
      {
        heading: '2. EXCLUSIVE EXCEPTION: TECHNICAL FAILED BOOKINGS',
        body: 'A monetary refund will be initiated and executed ONLY under the following strict technical scenario:',
        items: [
          { label: 'A. DEFINITION OF FAILED BOOKING:', text: 'A severe payment gateway or server integration glitch occurs where the specified fee is successfully debited and captured from your bank account, credit card, or digital wallet, but the core system architecture fails to log the booking, generate an appointment, or assign a slot.' },
          { label: 'B. VERIFICATION PROCESS:', text: 'Once you provide transaction logs, screenshots, and payment IDs showing the money was processed but no booking exists, our accounting team will verify the payment capture via our automated payment processor (e.g., Razorpay).' },
          { label: 'C. TIMELINE:', text: 'Upon validation, the funds will be pushed back via the payment gateway directly to your original payment method. These funds typically reflect in your balance within 5 to 7 business days, strictly dictated by your banking institution\'s standard settlement timelines.' },
        ],
      },
      {
        heading: '3. EXCLUSION OF CLAIMS FOR SUBJECTIVE DISSATISFACTION',
        body: 'Astrology, karmic diagnosis, and distance energy work are subjective, experiential, non-physical spiritual modalities. Consequently:',
        items: [
          { label: 'A. NO RECOVERY FOR PREDICTIONS:', text: 'We do not issue refunds if you do not agree with the astrological findings, if the readings are uncomfortable, or if the future predictions do not manifest within your desired chronological expectations.' },
          { label: 'B. NO RECOVERY FOR SENSATION:', text: 'We do not issue refunds if you do not visually, physically, or emotionally "feel" the transmission of energy during or after a distance Reiki, aura cleansing, or chakra balancing session. You are paying for the execution of the labor, time, and technique, not a guaranteed sensory or physical response.' },
        ],
      },
      {
        heading: '4. CANCELLATION AND RESCHEDULING PROTOCOLS',
        items: [
          { label: 'A. 24-HOUR NOTICE REQUIREMENT:', text: 'If you must reschedule a live consultation or an active energy healing transmission session, you must submit an official email request to shlokqx23@gmail.com at least twenty-four (24) hours before your allocated time slot.' },
          { label: 'B. NO-SHOW FORFEITURE:', text: 'Failure to appear for your scheduled session, or failing to request a modification at least 24 hours in advance, will result in the immediate forfeiture of that slot. No refunds will be provided, and a rescheduling fee may apply to re-book.' },
          { label: 'C. MULTI-SESSION PACKAGES:', text: 'For multi-session bundles (such as the 3-session healing package), if a client misses an individually scheduled sub-session without a 24-hour warning, that specific session is treated as completed and forfeited; it cannot be rolled over or refunded.' },
        ],
      },
    ],
  },

  disclaimer: {
    title: 'Disclaimer',
    subtitle: 'ASTRO VEDIC VANI — DATA PROTECTION AND PRIVACY POLICY',
    updated: 'Last Updated: June 2026',
    intro: 'Astro Vedic Vani is committed to respecting and protecting the confidentiality and privacy of our global users. This comprehensive Privacy Policy governs how we collect, store, encrypt, process, and protect the data you submit while interacting with our platform.',
    sections: [
      {
        heading: '1. CATEGORIES OF DATA WE COLLECT',
        body: 'To build accurate astrological models and target distance energy alignment protocols, we must collect specific items of personal and highly sensitive information which you voluntarily submit during the checkout and intake processes:',
        items: [
          { label: 'A. IDENTIFYING INFORMATION:', text: 'Legal Name, Selected Gender, Email address (primary contact point: support@astrovedicvani.com), and Phone/WhatsApp numbers.' },
          { label: 'B. CHRONOLOGICAL & GEOGRAPHICAL DATA (ASTROLOGICAL TARGETING):', text: 'Exact Calendar Date of Birth, Exact Minute and Hour of Birth (AM/PM specification), and the precise City, State, and Country of birth.' },
          { label: 'C. ENERGY HEALING META-DATA:', text: 'Personal accounts of physical or emotional vulnerabilities, life blockages, psychological stressors, and targeted spiritual intentions provided during your health/chakra onboarding forms.' },
          { label: 'D. AUTOMATED METRICS:', text: 'Anonymized analytics, IP addresses, cookie preferences, browser types, and device configurations collected via standard web monitoring tools.' },
        ],
      },
      {
        heading: '2. EXACT METHODS AND LEGAL GROUNDING FOR DATA USE',
        body: 'We process your personal information strictly to carry out the core spiritual services you explicitly contract us to execute:',
        items: [
          { label: 'A.', text: 'To mathematically map out and analyze your Janam Kundli, Prashna charts, Dashas, and karmic charts.' },
          { label: 'B.', text: 'To accurately direct and program distance Reiki frequencies and chakra alignments to your specific metaphysical signature.' },
          { label: 'C.', text: 'To handle customer support tickets, manage billing, process automated failed booking alerts, and distribute secure access links.' },
        ],
      },
      {
        heading: '3. ENCRYPTED PAYMENT GATEWAYS AND FINANCIAL SECURITY',
        body: 'Astro Vedic Vani maintains an uncompromising standard for transactional security. We do not store, view, log, or maintain any credit card numbers, debit card numbers, UPI PINs, or bank account credentials on our internal servers. All checkout logic is offloaded to PCI-DSS compliant, fully encrypted third-party payment gateways (such as Razorpay). All financial transfers are secured via modern Secure Socket Layer (SSL) and Transport Layer Security (TLS) protocol environments.',
      },
      {
        heading: '4. ABSOLUTE ZERO THIRD-PARTY MARKETING DATA POLICY',
        body: 'Your personal problems, birth metadata, life trauma, and relationship statuses are completely sacred. Astro Vedic Vani will NEVER sell, lease, trade, license, or disclose your personal information, email address, or astrological configurations to third-party data brokers, marketing agencies, or public consumer platforms for commercial monetization.',
      },
      {
        heading: '5. AUTHORIZED EXCEPTIONS FOR DATA ENFORCEMENT',
        body: 'We will only share your data with external entities under these rare, non-negotiable scenarios:',
        items: [
          { label: 'A. COMPLIANCE WITH LAW:', text: 'To comply with an enforceable judicial subpoena, national law enforcement mandate, or standard regulatory requirement issued by the Government of India or competent global authorities.' },
          { label: 'B. FINANCIAL PROTECTION:', text: 'To defend against active chargeback fraud, illegal identity theft attempts, or to resolve verified payment disputes with payment gateway providers.' },
        ],
      },
      {
        heading: '6. DATA ACCESS, CORRECTION, AND DELETION RIGHTS',
        body: 'You possess full structural rights over your personal profile data. At any time, you can submit an official request to our data administrator via support@astrovedicvani.com to request a copy of the personal information we hold on you, update any chronologically incorrect birth details, or request the permanent deletion of your data logs from our ecosystem. Note that deleting active profile data will result in the immediate cancellation of any uncompleted or ongoing multi-session healing packages without a refund.',
      },
      {
        heading: '7. CONTACT PROTOCOLS',
        body: 'For any clarifications, legal issues, or questions regarding this Data Protection Policy, please direct all formal inquiries to:',
        items: [
          { label: 'Operating Platform:', text: 'Astro Vedic Vani' },
          { label: 'Data Protection Officer:', text: 'PT. N.R. PATHAK' },
          { label: 'Primary Compliance Email:', text: 'support@astrovedicvani.com' },
        ],
      },
    ],
  },
}


export default function LegalModal({ docKey, onClose }) {
  const doc = LEGAL_DOCS[docKey]

  // ESC to close + lock body scroll
  useEffect(() => {
    if (!doc) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [doc, onClose])

  if (!doc) return null

  return (
    <div
      data-testid="legal-modal"
      className="fixed inset-0 z-[200] flex items-center justify-center px-3 sm:px-6 py-6 animate-fadeIn"
      style={{ background: 'rgba(20, 7, 0, 0.78)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-amber-300/30"
        style={{ background: 'linear-gradient(180deg, #1c0a00 0%, #2d0f00 100%)' }}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-amber-800/40 bg-gradient-to-r from-amber-900 to-amber-950 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-400 font-semibold">{doc.subtitle}</div>
            <h2 className="text-yellow-200 text-xl sm:text-2xl font-black mt-1 leading-tight">{doc.title}</h2>
            <div className="text-amber-500 text-[11px] mt-1">{doc.updated}</div>
          </div>
          <button
            onClick={onClose}
            data-testid="legal-modal-close"
            aria-label="Close"
            className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-800/50 hover:bg-amber-700/70 text-yellow-200 text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto px-5 sm:px-7 py-5 text-amber-100/95 text-[13px] sm:text-sm leading-relaxed space-y-5"
          style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
        >
          {doc.intro && (
            <p className="text-amber-200 italic">{doc.intro}</p>
          )}
          {doc.sections.map((section, idx) => (
            <section key={idx}>
              <h3 className="text-yellow-300 font-extrabold text-[12px] sm:text-[13px] uppercase tracking-wider mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>
                {section.heading}
              </h3>
              {section.body && (
                <p className="whitespace-pre-wrap text-amber-50/90 mb-2">{section.body}</p>
              )}
              {section.items && (
                <ul className="space-y-2 mt-2">
                  {section.items.map((it, j) => (
                    <li key={j} className="pl-4 border-l-2 border-amber-700/50">
                      <span className="text-yellow-300 font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>{it.label}</span>{' '}
                      <span className="text-amber-50/95">{it.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <div className="pt-4 mt-4 border-t border-amber-800/40 text-center text-amber-500 text-[11px]">
            For questions, write to{' '}
            <a href="mailto:support@astrovedicvani.com" className="text-yellow-300 hover:underline">support@astrovedicvani.com</a>
            {' '}or WhatsApp{' '}
            <a href="https://wa.me/919199191902" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">+91 91991 91902</a>.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3 border-t border-amber-800/40 bg-amber-950/70 flex justify-end">
          <button
            onClick={onClose}
            data-testid="legal-modal-close-bottom"
            className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-amber-900 font-bold text-sm transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}
