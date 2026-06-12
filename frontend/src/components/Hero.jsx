import { useEffect, useRef } from 'react'

export default function Hero({ onBooking }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const stars = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Regular twinkling stars
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.012 + 0.006,
        dir: Math.random() > 0.5 ? 1 : -1,
        blink: false,
      })
    }
    // Slow-blinking bright stars
    for (let i = 0; i < 30; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        alpha: Math.random(),
        speed: Math.random() * 0.0025 + 0.001,
        dir: Math.random() > 0.5 ? 1 : -1,
        blink: true,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.alpha += s.speed * s.dir
        if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.blink
          ? `rgba(255,255,220,${s.alpha})`
          : `rgba(255,220,120,${s.alpha})`
        ctx.fill()
        // Add cross-sparkle on bright stars at peak alpha
        if (s.blink && s.alpha > 0.8) {
          ctx.strokeStyle = `rgba(255,255,200,${(s.alpha - 0.8) * 3})`
          ctx.lineWidth = 0.5
          ctx.beginPath(); ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3); ctx.stroke()
        }
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">

      {/* New galaxy background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/hero-bg.jpg)' }} />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />

      {/* Animated star canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[1]" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none z-[1] orb-pulse" />
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-[1]" style={{animation:'orbPulse 8s ease-in-out infinite reverse'}} />

      {/* Floating Sanskrit symbols */}
      {['ॐ','☸','✦','⁂','✧','⋆','✵','❋'].map((sym, i) => (
        <div key={i} className="absolute pointer-events-none z-[1] text-yellow-400/20 font-bold select-none"
          style={{
            left: `${8 + i * 12}%`,
            bottom: '5%',
            fontSize: `${14 + (i % 3) * 6}px`,
            animation: `floatUp ${3 + (i * 0.6)}s ease-in infinite`,
            animationDelay: `${i * 0.8}s`,
          }}>
          {sym}
        </div>
      ))}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">

        {/* Sanskrit tagline — pushed slightly lower */}
        <div className="text-yellow-300/90 text-base md:text-lg mb-4 tracking-widest font-extrabold fade-in-up mt-8" style={{animationDelay:'0.25s', textShadow:'0 0 12px rgba(251,191,36,0.45)'}}>
          ॥ ज्योतिषं वेदाङ्गं परमम् ॥
        </div>

        {/* Main Title — flowing gold animation */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-5 md:mb-4 tracking-tight fade-in-up hero-title-flow" style={{animationDelay:'0.4s'}}>
          AstroVedicVani
        </h1>
        <div
          className="text-amber-200/95 mb-8 fade-in-up flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 text-xl sm:text-2xl md:text-[1.7rem]"
          style={{
            animationDelay: '0.55s',
            fontFamily: '"Cinzel", "Cormorant Garamond", serif',
            letterSpacing: '0.18em',
            textShadow: '0 0 18px rgba(251,191,36,0.25)',
            marginTop: '0.25rem',
          }}
        >
          <span className="font-medium whitespace-nowrap">Ancient Wisdom</span>
          <span aria-hidden="true" className="hidden sm:inline text-yellow-400/60 text-sm">✦</span>
          <span className="font-medium whitespace-nowrap">Celestial Guidance</span>
          <span aria-hidden="true" className="hidden sm:inline text-yellow-400/60 text-sm">✦</span>
          <span className="font-medium whitespace-nowrap">Astrological Insights</span>
        </div>

        {/* Tagline */}
        <p
          className="text-yellow-100/90 mb-10 max-w-3xl mx-auto fade-in-up text-xl sm:text-2xl md:text-[1.7rem]"
          style={{
            animationDelay: '0.7s',
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0.01em',
          }}
        >
          Unlock the cosmic secrets of your destiny with
          <span
            className="text-yellow-300"
            style={{ fontStyle: 'italic', fontWeight: 600 }}
          > Authentic Vedic Wisdom</span>
          <span className="text-amber-300/80"> — </span>
          trusted by 5000+ souls worldwide
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center fade-in-up" style={{animationDelay:'0.9s'}}>

          {/* Primary — Book Now */}
          <button onClick={onBooking} className="btn-book group relative overflow-hidden flex items-center gap-3 px-10 py-4 rounded-full font-extrabold text-lg text-white shadow-2xl">
            {/* shimmer sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer pointer-events-none rounded-full" />
            {/* pulse ring */}
            <span className="absolute inset-0 rounded-full btn-book-ring pointer-events-none" />
            <span className="relative z-10 text-xl transition-transform duration-300 group-hover:rotate-12">🔮</span>
            <span className="relative z-10 tracking-wide">Book Your Consultation Now</span>
            <span className="relative z-10 text-xl transition-transform duration-300 group-hover:rotate-12">🌟</span>
          </button>

          {/* Secondary — Explore Services */}
          <a href="#services" className="btn-explore group relative overflow-hidden flex items-center gap-3 px-10 py-4 rounded-full font-extrabold text-lg text-white">
            {/* rotating nebula blob */}
            <span className="absolute w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(167,139,250,0.45) 0%, rgba(56,189,248,0.3) 40%, transparent 70%)',
                top: '-30px', left: '-20px',
                animation: 'galaxyNebula 8s linear infinite',
              }} />
            <span className="absolute w-24 h-24 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(232,121,249,0.35) 0%, rgba(99,102,241,0.25) 50%, transparent 70%)',
                bottom: '-20px', right: '-10px',
                animation: 'galaxyNebula 11s linear infinite reverse',
              }} />
            {/* shimmer sweep */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer pointer-events-none rounded-full" style={{animationDelay:'1.2s'}} />
            <span className="relative z-10 text-xl transition-transform duration-300 group-hover:scale-125">✨</span>
            <span className="relative z-10 tracking-wide text-white font-extrabold" style={{textShadow:'0 0 12px rgba(232,121,249,0.7), 0 0 24px rgba(99,102,241,0.4)'}}>Explore Services</span>
            <span className="relative z-10 text-base text-white font-bold transition-transform duration-300 group-hover:translate-x-1">↓</span>
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm text-amber-200 fade-in-up" style={{animationDelay:'1.1s'}}>
          {[
            { icon: '⭐', text: '20+ Years Experience' },
            { icon: '🙏', text: '5000+ Happy Clients' },
            { icon: '💫', text: 'Guaranteed Remedies' },
            { icon: '📞', text: '+91 91991 91902' },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-2 bg-black/35 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-600/35 hero-badge">
              <span>{b.icon}</span> {b.text}
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-14 animate-bounce text-yellow-400/70 text-2xl">↓</div>
      </div>
    </section>
  )
}
