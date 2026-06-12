import { useState } from 'react'
import { useInView } from '../hooks/useInView'

const learnings = [
  {
    icon: '🌟', title: 'Vedic Astrology', subtitle: 'वैदिक ज्योतिष', color: 'from-yellow-500 to-amber-600',
    desc: 'The ancient science of light based on sacred Vedic texts, revealing the cosmic blueprint of your life through planetary positions at birth.',
    detail: 'Uses the sidereal zodiac, 27 Nakshatras, 9 Grahas, and 12 Bhavas with Dasha timing systems to map all life areas with remarkable precision.',
  },
  {
    icon: '📜', title: 'Parashari Astrology', subtitle: 'पाराशरी ज्योतिष', color: 'from-amber-500 to-orange-600',
    desc: 'Based on Brihat Parashara Hora Shastra, the foundational system of Vedic astrology authored by Sage Parashara for life predictions.',
    detail: 'Employs yogas, varga (divisional) charts, Vimshottari Dasha, and Ashtakavarga for deep, layered analysis of every life department.',
  },
  {
    icon: '🌊', title: 'Nadi Jyotish', subtitle: 'नाड़ी ज्योतिष', color: 'from-yellow-600 to-amber-700',
    desc: 'Ancient Tamil astrology system based on thumb impressions, revealing past, present and future as recorded by ancient Siddha sages.',
    detail: 'Palm-leaf manuscripts by sages like Agastya contain pre-recorded life readings identified by your thumb impression — uniquely personal among all systems.',
  },
  {
    icon: '🔭', title: 'KP Astrology', subtitle: 'KP ज्योतिष', color: 'from-orange-500 to-amber-600',
    desc: 'Krishnamurti Paddhati — a highly accurate predictive system developed by Prof. K.S. Krishnamurti using sub-division of Nakshatra.',
    detail: 'The Sub-Lord theory gives razor-sharp event timing for marriage, career changes, and legal outcomes — widely respected for its precision.',
  },
  {
    icon: '📖', title: 'Lal Kitab', subtitle: 'लाल किताब', color: 'from-red-600 to-amber-600',
    desc: 'A unique Urdu astrology system with simple yet highly effective remedies based on planetary positions in different houses.',
    detail: 'Prescribes inexpensive, practical remedies that often show results within 11–40 days, targeting "sleeping" planets and ancestral debts blocking life progress.',
  },
  {
    icon: '🌸', title: 'Brighu Samhita', subtitle: 'भृगु संहिता', color: 'from-pink-500 to-amber-500',
    desc: 'One of the oldest astrological scriptures compiled by Sage Brighu, containing pre-written life readings for specific Lagna combinations.',
    detail: 'Remarkably accurate for long-term destiny, past-life karma, and identifying major turning points — based on ancient manuscripts matching your exact chart.',
  },
  {
    icon: '🔯', title: 'Jaimini Astrology', subtitle: 'जैमिनी ज्योतिष', color: 'from-indigo-500 to-amber-600',
    desc: 'A powerful system by Sage Jaimini using Karakas, Chara Dashas and Padas for precise predictions about life status and destiny.',
    detail: 'Especially powerful for career status, political success, and understanding the soul\'s core purpose through Atmakaraka and Arudha Pada analysis.',
  },
]

function LearningCard({ item, delay }) {
  const [expanded, setExpanded] = useState(false)
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`group bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-100 transition-all duration-700 hover:shadow-2xl hover:shadow-amber-200/60 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onTouchStart={() => setExpanded(e => !e)}
    >
      <div className={`h-1.5 bg-gradient-to-r ${item.color} transition-all duration-300 ${expanded ? 'h-2' : 'group-hover:h-2'}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 inline-block">{item.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-amber-900 leading-tight">{item.title}</h3>
              <div className="text-amber-500 text-sm font-medium">{item.subtitle}</div>
            </div>
          </div>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 pointer-events-none ${expanded ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-600'}`}>
            {expanded ? '✕' : '+'}
          </div>
        </div>
        <p className="text-amber-700 text-sm leading-relaxed">{item.desc}</p>
        {/* Smooth expand */}
        <div
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: expanded ? '120px' : '0px', opacity: expanded ? 1 : 0 }}
        >
          <div className="mt-4 pt-4 border-t border-amber-100">
            <p className="text-amber-800 text-sm leading-relaxed">{item.detail}</p>
          </div>
        </div>
        <div className={`mt-4 h-0.5 w-0 bg-gradient-to-r ${item.color} rounded-full transition-all duration-500 group-hover:w-full`} />
      </div>
    </div>
  )
}

export default function Learnings() {
  const [titleRef, titleInView] = useInView()
  return (
    <section id="learnings" className="py-20 bg-amber-50 overflow-hidden diamond-pattern-light">
      <div className="max-w-7xl mx-auto px-4">
        <div ref={titleRef} className={`text-center mb-14 transition-all duration-700 ${titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-3">Our Expertise</div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            Branches of <span className="text-amber-600">Jyotish Vidya</span>
          </h2>
          <div className="text-amber-700 text-lg max-w-2xl mx-auto">
            With 20+ years of in-depth study across all major systems of Vedic and Modern Astrology
          </div>
          <div className="mt-2 text-amber-500 text-sm">🖱️ Hover a card to expand details &nbsp;·&nbsp; 📱 Tap on mobile</div>
          <div className="mt-3 h-1 w-24 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {learnings.map((item, i) => <LearningCard key={item.title} item={item} delay={i * 80} />)}
        </div>
      </div>
    </section>
  )
}
