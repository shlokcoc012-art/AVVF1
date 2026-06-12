import { useEffect, useRef, useState } from 'react'

const stats = [
  { icon: '🏆', value: 20, suffix: '+', label: 'Years of Experience', sub: 'in Jyotish Vidya' },
  { icon: '🙏', value: 5000, suffix: '+', label: 'Happy Clients', sub: 'Across India & Abroad' },
  { icon: '💊', value: 100, suffix: '%', label: 'Instant & Guaranteed', sub: 'Remedy & Solutions' },
  { icon: '⭐', value: 98, suffix: '%', label: 'Client Satisfaction', sub: 'Rate Consistently' },
]

function CountUp({ target, suffix, run }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!run) return
    let start = 0
    const duration = 1800
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [run, target])
  return <span>{count.toLocaleString()}{suffix}</span>
}

// One-time hook — fires once on first intersection, never resets
function useInViewOnce() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        obs.unobserve(el)
      }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

export default function Stats() {
  const [ref, inView] = useInViewOnce()

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 diamond-pattern">
      {/* Animated background rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-yellow-400/10 rounded-full ring-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-yellow-400/10 rounded-full ring-pulse" style={{animationDelay:'0.6s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-yellow-400/15 rounded-full ring-pulse" style={{animationDelay:'1.2s'}} />
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`text-center group transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300 inline-block drop-shadow-lg">
                {s.icon}
              </div>
              <div className="text-yellow-300 font-extrabold text-4xl md:text-5xl tabular-nums drop-shadow">
                <CountUp target={s.value} suffix={s.suffix} run={inView} />
              </div>
              <div className="text-amber-200 font-semibold text-sm mt-2">{s.label}</div>
              <div className="text-amber-400 text-xs mt-1">{s.sub}</div>
              <div className="mt-3 h-0.5 w-10 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full opacity-60 group-hover:w-16 group-hover:opacity-100 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
