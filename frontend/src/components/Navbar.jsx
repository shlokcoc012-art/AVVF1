import { useState, useEffect, useRef } from 'react'

export default function Navbar({ onBooking }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const popularServices = [
    { label: 'Prashn Kundali', sublabel: 'प्रश्न कुण्डली', href: '#prashn', icon: '🪐' },
    { label: 'Raj Yoga Analysis', sublabel: 'राज योग विश्लेषण', href: '#svc-rajyoga', icon: '👑' },
    { label: 'Dhan Yog Analysis', sublabel: 'धन योग विश्लेषण', href: '#svc-dhanyoga', icon: '💎' },
    { label: 'Past Life & Karma', sublabel: 'पूर्व जन्म व कर्म', href: '#svc-pastlife', icon: '🪷' },
    { label: 'Holistic Healing', sublabel: 'समग्र चिकित्सा', href: '#healing', icon: '🧘' },
    { label: 'Vedic Astrology', sublabel: 'वैदिक ज्योतिष', href: '#learnings', icon: '🕉️' },
  ]

  const links = [
    { label: 'Home', href: '#home' },
    { label: 'Learnings', href: '#learnings' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'Contact', href: '#footer' },
  ]

  return (
    <nav className={`fixed top-0 left-0 z-40 transition-all duration-300 navbar-solid ${scrolled ? 'shadow-xl shadow-black/50' : ''}`} style={{ width: '100%', maxWidth: '100vw' }}>
      {/* Gold accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/70 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-[62px] gap-2">

          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <span className="text-3xl drop-shadow-lg">🔮</span>
              <span className="absolute -top-1 -right-1 text-[10px] animate-spin" style={{animationDuration:'4s'}}>✨</span>
            </div>
            <div>
              <div className="nav-title-flow font-extrabold text-xl leading-tight tracking-wide">AstroVedicVani</div>
              <div className="flex flex-col items-start leading-none" style={{textShadow:'0 0 8px rgba(251,191,36,0.4)'}}>
                <span className="text-yellow-200 font-extrabold text-sm tracking-wide uppercase">Pt. N.R. Pathak</span>
                <span className="text-yellow-200/75 font-semibold text-[10px] tracking-widest">· ज्योतिषाचार्य</span>
              </div>
            </div>
          </div>

          {/* Desktop nav tabs */}
          <div className="hidden lg:flex items-center gap-0.5">

            {/* Our Services dropdown */}
            <div ref={servicesRef} className="relative">
              <button
                onClick={() => setServicesOpen(v => !v)}
                className={`text-amber-200 hover:text-yellow-300 hover:bg-white/10 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200 relative group tracking-wide flex items-center gap-1.5 ${servicesOpen ? 'text-yellow-300 bg-white/10' : ''}`}
              >
                <span>⭐ Our Services</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-3/4 rounded-full" />
              </button>

              {/* Dropdown panel */}
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-amber-700/40 z-50"
                  style={{ background: 'linear-gradient(135deg, #1c0a00 0%, #3b1202 40%, #4a1a05 70%, #2d0f00 100%)' }}>

                  {/* Specializations — hero entry */}
                  <a href="#services" onClick={() => setServicesOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 group transition-all duration-150 relative overflow-hidden"
                    style={{ background: 'linear-gradient(90deg, rgba(234,179,8,0.18) 0%, rgba(234,179,8,0.07) 100%)', borderBottom: '1px solid rgba(234,179,8,0.25)' }}>
                    {/* shimmer sweep */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">🛡️</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-300 font-extrabold text-sm tracking-wide group-hover:text-yellow-200 transition-colors">Specializations</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-yellow-400 text-amber-900 px-1.5 py-0.5 rounded-full leading-none">Featured</span>
                      </div>
                      <div className="text-amber-400/80 text-[11px] font-medium mt-0.5">All specialized consultation services</div>
                    </div>
                    <svg className="w-4 h-4 text-yellow-500 ml-auto -translate-x-1 group-hover:translate-x-0 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>

                  {/* Divider label */}
                  <div className="px-4 py-2 border-b border-amber-800/30">
                    <div className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">Most Popular</div>
                  </div>

                  {/* Popular service links */}
                  {popularServices.map((s) => (
                    <a key={s.label} href={s.href}
                      onClick={() => setServicesOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all duration-150 group border-b border-amber-800/20 last:border-0">
                      <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{s.icon}</span>
                      <div>
                        <div className="text-amber-100 font-bold text-sm group-hover:text-yellow-300 transition-colors">{s.label}</div>
                        <div className="text-amber-500/80 text-[11px] font-medium">{s.sublabel}</div>
                      </div>
                      <svg className="w-4 h-4 text-amber-600 ml-auto opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {links.map(l => (
              <a key={l.label} href={l.href}
                className="text-amber-200 hover:text-yellow-300 hover:bg-white/10 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200 relative group tracking-wide">
                {l.label}
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-3/4 rounded-full" />
              </a>
            ))}

            <button onClick={onBooking}
              className="ml-3 bg-yellow-400 hover:bg-yellow-300 text-amber-900 font-extrabold px-5 py-2 rounded-full text-sm transition-all duration-200 shadow-lg shadow-yellow-600/30 hover:shadow-yellow-400/60 hover:scale-105 flex items-center gap-1.5 tracking-wide">
              📅 Book Now
            </button>
          </div>

          {/* Mobile right-side controls — Our Services pill + Hamburger */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <a
              href="#services"
              data-testid="mobile-services-link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-yellow-300 text-xs font-extrabold tracking-wide bg-amber-500/15 border border-yellow-500/50 hover:bg-amber-500/25 transition-all whitespace-nowrap"
              style={{textShadow:'0 0 8px rgba(251,191,36,0.5)'}}
            >
              <span>⭐</span>
              <span>Services</span>
            </a>
            <button
              className="text-yellow-300 text-3xl leading-none p-1.5 hover:text-yellow-200 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              data-testid="mobile-menu-toggle"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-amber-700/60 mt-2 animate-fadeIn">

            {/* Our Services group */}
            <div className="py-2 border-b border-amber-800/30">
              <div className="text-[10px] font-bold tracking-widest text-amber-500 uppercase px-2 mb-1.5">⭐ Our Services</div>

              {/* Specializations — hero entry mobile */}
              <a href="#services" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-2.5 px-2 rounded-xl mb-1 transition-all"
                style={{ background: 'linear-gradient(90deg, rgba(234,179,8,0.15) 0%, transparent 100%)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <span className="text-xl">🛡️</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-300 font-extrabold text-sm">Specializations</span>
                    <span className="text-[9px] font-bold uppercase bg-yellow-400 text-amber-900 px-1.5 py-0.5 rounded-full leading-none">Featured</span>
                  </div>
                  <div className="text-amber-500/80 text-[10px]">All specialized consultation services</div>
                </div>
              </a>

              {popularServices.map(s => (
                <a key={s.label} href={s.href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-2 px-2 text-amber-200 hover:text-yellow-300 text-sm font-medium hover:pl-4 transition-all">
                  <span>{s.icon}</span>
                  <div>
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-amber-500/80 text-[10px]">{s.sublabel}</div>
                  </div>
                </a>
              ))}
            </div>

            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-amber-200 hover:text-yellow-300 text-sm font-medium border-b border-amber-800/30 hover:pl-2 transition-all">
                <span className="text-amber-600 text-xs">✦</span> {l.label}
              </a>
            ))}
            <div className="mt-3 space-y-1.5 text-xs text-amber-400">
              <a href="tel:+919199191902" className="flex items-center gap-2 hover:text-yellow-300">📞 +91 91991 91902</a>
              <a href="mailto:support@astrovedicvani.com" className="flex items-center gap-2 hover:text-yellow-300">✉️ support@astrovedicvani.com</a>
            </div>
            <button onClick={() => { onBooking(); setMenuOpen(false) }}
              className="mt-3 w-full bg-yellow-400 text-amber-900 font-bold py-2.5 rounded-full text-sm hover:bg-yellow-300 transition-colors">
              📅 Book Consultation
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
