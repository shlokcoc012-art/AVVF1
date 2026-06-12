import { useInView } from '../hooks/useInView'

const whyUs = [
  { icon: '📖', title: '20+ Years Experience', desc: 'Two decades of extensive practice in Jyotish Vidya across all major systems' },
  { icon: '🌍', title: '5000+ Clients Served', desc: 'Happy clients from India, USA, UK, Canada, UAE, Australia and across the globe' },
  { icon: '⚡', title: 'Instant Remedies', desc: 'Quick and effective Upay that work — guaranteed results with personalized solutions' },
  { icon: '🔐', title: '100% Confidential', desc: 'Complete privacy and confidentiality for all consultations and personal details' },
  { icon: '📱', title: 'Online & In-Person', desc: 'Consultations available via phone, video call, WhatsApp, and in-person visits' },
  { icon: '🕉️', title: 'Authentic Shastra', desc: 'Solutions rooted in authentic Vedic scriptures, tested methods and time-honored traditions' },
]

const consultationTypes = [
  { icon: '📞', title: 'Phone Consultation', duration: '30-60 mins', desc: 'Detailed reading over phone call' },
  { icon: '📹', title: 'Video Consultation', duration: '45-60 mins', desc: 'Face-to-face via Zoom / Google Meet' },
  { icon: '💬', title: 'WhatsApp Consultation', duration: 'Flexible', desc: 'Detailed written analysis with remedies' },
  { icon: '🏠', title: 'In-Person Visit', duration: '60-90 mins', desc: 'Complete in-depth personal consultation' },
]

function WhyCard({ w, i }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`group flex gap-4 bg-amber-800/50 border border-yellow-600/20 rounded-xl p-5 hover:border-yellow-400/50 hover:bg-amber-800/80 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-400/10 ${inView ? 'opacity-100 translate-x-0' : i % 2 === 0 ? 'opacity-0 -translate-x-8' : 'opacity-0 translate-x-8'}`}
      style={{ transitionDelay: `${(i % 3) * 120}ms` }}
    >
      <div className="text-4xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{w.icon}</div>
      <div>
        <h3 className="text-yellow-300 font-bold text-base mb-1">{w.title}</h3>
        <p className="text-amber-300 text-sm leading-relaxed">{w.desc}</p>
      </div>
    </div>
  )
}

function ConsultCard({ c, i }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`group text-center bg-yellow-400/10 border border-yellow-500/30 rounded-2xl p-6 hover:bg-yellow-400/20 hover:border-yellow-400/70 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-yellow-400/15 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${i * 100}ms` }}
    >
      <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{c.icon}</div>
      <h3 className="text-yellow-300 font-bold text-lg mb-1">{c.title}</h3>
      <div className="text-yellow-400 text-sm font-semibold mb-2">⏱ {c.duration}</div>
      <p className="text-amber-300 text-xs">{c.desc}</p>
    </div>
  )
}

export default function Specialties() {
  const [titleRef, titleInView] = useInView()
  const [modeRef, modeInView] = useInView()

  return (
    <section className="py-20 bg-gradient-to-b from-amber-900 to-amber-800 diamond-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div ref={titleRef} className={`text-center mb-14 transition-all duration-700 ${titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-yellow-400 font-semibold text-sm tracking-widest uppercase mb-3">Why Choose Us</div>
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-4">
            The AstroVedicVani Difference
          </h2>
          <p className="text-amber-200 text-lg max-w-2xl mx-auto">
            Experience authentic, accurate, and life-changing astrological guidance
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {whyUs.map((w, i) => <WhyCard key={w.title} w={w} i={i} />)}
        </div>

        <div ref={modeRef} className={`text-center mb-10 transition-all duration-700 ${modeInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">Consultation Modes</h2>
          <p className="text-amber-300">Choose the mode that suits you best</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {consultationTypes.map((c, i) => <ConsultCard key={c.title} c={c} i={i} />)}
        </div>
      </div>
    </section>
  )
}
