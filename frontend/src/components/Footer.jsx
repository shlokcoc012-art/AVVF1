import { useState } from 'react'
import { useCart } from '../context/CartContext'
import LegalModal from './LegalModal'

export default function Footer({ onBooking }) {
  const { setIsOpen } = useCart()
  const [legalDoc, setLegalDoc] = useState(null)
  // Every footer service/solution link just opens the cart so users can review what's
  // in it and proceed to book — service & concern are auto-derived from cart contents.
  const openCart = () => setIsOpen(true)

  const legalLinks = [
    { key: 'privacy',    label: 'Privacy Policy' },
    { key: 'terms',      label: 'Terms of Service' },
    { key: 'refund',     label: 'Refund Policy' },
    { key: 'disclaimer', label: 'Disclaimer' },
  ]

  const footerServices = [
    'Vedic Astrology', 'Parashari Astrology', 'Nadi Jyotish', 'KP Astrology',
    'Lal Kitab', 'Prashn Kundali', 'Hasth Rekha',
    'Numerology', 'Energy Analysis',
  ]

  const footerSolutions = [
    'Career & Profession', 'Marriage & Relationships', 'Health & Longevity',
    'Wealth & Finance', 'Children & Progeny', 'Foreign Settlement',
    'Grah Dosh Relief', 'Shubh Muhurt', 'Raj Yoga Analysis', 'Property & Business',
  ]

  return (
    <footer id="footer" className="bg-amber-950 diamond-pattern">

      {/* CTA Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 py-14 px-4">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize:'20px 20px'}} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4 animate-bounce inline-block">🌟</div>
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-3">
            Ready to Discover Your Cosmic Blueprint?
          </h2>
          <p className="text-amber-800 text-lg mb-2">
            Book your personalized consultation with <strong>Pt. N.R. Pathak</strong> today
          </p>
          <p className="text-amber-700 text-sm mb-7">
            <a href="mailto:support@astrovedicvani.com" className="hover:text-amber-600 transition-colors">✉️ support@astrovedicvani.com</a>
            &nbsp;·&nbsp;
            <a href="tel:+919199191902" className="hover:text-amber-600 transition-colors">📞 +91 91991 91902</a>
          </p>
          <button onClick={() => onBooking()}
            className="bg-amber-900 hover:bg-amber-800 text-yellow-300 font-bold px-10 py-4 rounded-full text-lg transition-all duration-300 shadow-xl hover:scale-105 inline-flex items-center gap-2">
            📅 Book Your Consultation Now
          </button>
        </div>
      </div>

      {/* Footer Content */}
      <div className="py-14 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl">🔮</span>
              <div>
                <div className="text-yellow-300 font-bold text-xl leading-tight">AstroVedicVani</div>
                <div className="text-amber-400 text-xs tracking-wide">Pt. N.R. Pathak · ज्योतिषाचार्य</div>
              </div>
            </div>
            <p className="text-amber-400 text-sm leading-relaxed mb-4">
              Your trusted guide to cosmic wisdom. Authentic Vedic astrology with 20+ years of experience and 5000+ happy clients worldwide.
            </p>
            <div className="text-amber-600 text-sm italic mb-5">ॐ ज्योतिषमेतत् परमम्</div>
            <div className="flex gap-3">
              {[
                { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/919199191902' },
                { icon: '📸', label: 'Instagram', href: '#' },
                { icon: '📘', label: 'Facebook', href: '#' },
                { icon: '▶️', label: 'YouTube', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} title={s.label}
                  className="w-9 h-9 bg-amber-800/60 hover:bg-amber-700 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-yellow-300 font-bold mb-4 text-sm uppercase tracking-wider border-b border-amber-800/50 pb-2">Our Services</h4>
            <ul className="space-y-2 text-amber-400 text-sm">
              {footerServices.map(s => (
                <li key={s}
                  onClick={openCart}
                  className="hover:text-yellow-300 transition-colors cursor-pointer flex items-center gap-2 group">
                  <span className="text-amber-700 group-hover:text-yellow-400 text-xs transition-colors">✦</span> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-yellow-300 font-bold mb-4 text-sm uppercase tracking-wider border-b border-amber-800/50 pb-2">Life Solutions</h4>
            <ul className="space-y-2 text-amber-400 text-sm">
              {footerSolutions.map(s => (
                <li key={s}
                  onClick={openCart}
                  className="hover:text-yellow-300 transition-colors cursor-pointer flex items-center gap-2 group">
                  <span className="text-amber-700 group-hover:text-yellow-400 text-xs transition-colors">✦</span> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-yellow-300 font-bold mb-4 text-sm uppercase tracking-wider border-b border-amber-800/50 pb-2">Contact Us</h4>
            <div className="space-y-4 text-amber-400 text-sm">
              <a href="tel:+919199191902" className="flex items-start gap-3 hover:text-yellow-300 transition-colors group">
                <span className="text-xl mt-0.5 group-hover:scale-110 transition-transform inline-block">📞</span>
                <div>
                  <div className="text-amber-300 font-semibold">Phone</div>
                  <div>+91 91991 91902</div>
                </div>
              </a>
              <a href="https://wa.me/919199191902" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-yellow-300 transition-colors group">
                <span className="mt-0.5 group-hover:scale-110 transition-transform inline-block flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </span>
                <div>
                  <div className="text-amber-300 font-semibold">WhatsApp</div>
                  <div>+91 91991 91902</div>
                </div>
              </a>
              <a href="mailto:support@astrovedicvani.com" className="flex items-start gap-3 hover:text-yellow-300 transition-colors group">
                <span className="text-xl mt-0.5 group-hover:scale-110 transition-transform inline-block">✉️</span>
                <div>
                  <div className="text-amber-300 font-semibold">Email</div>
                  <div>support@astrovedicvani.com</div>
                </div>
              </a>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">⏰</span>
                <div>
                  <div className="text-amber-300 font-semibold">Consultation Hours</div>
                  <div>Mon – Sat: 9 AM – 8 PM IST</div>
                  <div>Sunday: 10 AM – 5 PM IST</div>
                </div>
              </div>
              <div className="bg-amber-900/50 rounded-xl p-3 border border-amber-800/40 mt-2">
                <div className="flex items-center gap-2 text-green-400 text-xs font-semibold mb-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Available Now
                </div>
                <div className="text-amber-300 text-xs">Book a same-day consultation</div>
                <button onClick={() => onBooking()}
                  className="mt-2 w-full bg-yellow-400 hover:bg-yellow-300 text-amber-900 font-bold py-2 rounded-lg text-xs transition-colors">
                  📅 Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-amber-800/40 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-amber-500 text-xs mb-4">
            {legalLinks.map((item, i, arr) => (
              <span key={item.key} className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setLegalDoc(item.key)}
                  data-testid={`legal-link-${item.key}`}
                  className="hover:text-amber-300 cursor-pointer transition-colors bg-transparent border-0 p-0 text-xs font-inherit"
                >
                  {item.label}
                </button>
                {i < arr.length - 1 && <span className="text-amber-800">·</span>}
              </span>
            ))}
          </div>
          <p className="text-amber-600 text-xs">
            © {new Date().getFullYear()} AstroVedicVani — Pt. N.R. Pathak · ज्योतिषाचार्य. All rights reserved.
          </p>
          <p className="text-amber-700 text-xs mt-1">
            🌟 Astrology for guidance purposes only. Results may vary based on individual karma.
          </p>
        </div>
      </div>
      {legalDoc && <LegalModal docKey={legalDoc} onClose={() => setLegalDoc(null)} />}
    </footer>
  )
}
