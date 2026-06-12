import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'

// Fires once on first intersection — never resets
function useInViewOnce() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.unobserve(el) }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

// Animates a number from 0 → target over ~1.8 s
function CountUp({ target, decimals = 0, suffix = '', run }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run) return
    let start = 0
    const duration = 1800
    const steps = Math.round(duration / 16)
    const increment = target / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(start)
    }, 16)
    return () => clearInterval(timer)
  }, [run, target])
  return <span>{decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()}{suffix}</span>
}

function Stars({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span className="text-yellow-400 text-xs tracking-tight">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  )
}

const testimonials = [
  // Row 1 — interleaved Pathak ji + others
  { name: 'Priya Sharma',        location: 'Delhi, Delhi',                  stars: 5,   avatar: '🌸', service: 'Vedic Astrology + Marriage',       text: 'Pathak ji told me things in the first 10 minutes that only I knew. He identified a Shani dosha affecting my 7th house, gave specific remedies, and within 3 months my marriage was back on track and I got a long-awaited promotion. My mother and sister have since consulted him too.' },
  { name: 'Anita Patel',         location: 'Ahmedabad, Gujarat',             stars: 4.5, avatar: '💫', service: 'Kaal Sarp Dosh Remedies',          text: 'Nobody explained my Kaal Sarp Dosh as clearly as Pathak ji. He told me exactly which planets were involved and why life kept stalling. Remedies were practical and changes came within 6–8 weeks. Follow-up call could have been longer, but overall very grateful.' },
  { name: 'Rajesh Gupta',        location: 'Mumbai, Maharashtra',            stars: 5,   avatar: '🙏', service: 'Lal Kitab + Business',             text: 'I was skeptical but Pathak ji described my business losses so accurately it gave me goosebumps. His Lal Kitab remedies cleared two pending payments within 21 days and a new contract followed. I have referred 8 people to him since. He is the real deal.' },
  { name: 'Arjun Krishnamurthy', location: 'Bengaluru, Karnataka',           stars: 4.5, avatar: '💻', service: 'KP Astrology + Career',            text: 'As a data scientist I tracked every prediction. Pathak ji answered specific career questions with exact timeframes — 7 out of 8 came true. The one that didn\'t, I declined myself. KP methodology is impressively systematic. Took me a while to convert, but I am fully now.' },
  { name: 'Meena Reddy',         location: 'Hyderabad, Telangana',           stars: 5,   avatar: '🌺', service: 'Prashn Kundali + Health',          text: 'Pathak ji told me my surgery would have an initial complication but full recovery was certain. He recommended a specific gemstone. Every single thing happened exactly as he described. My surgeon was surprised by how quickly I recovered. I wear that gemstone every day now.' },
  { name: 'Neeraj Saxena',       location: 'Bhopal, Madhya Pradesh',         stars: 4,   avatar: '🌙', service: 'Vedic Astrology + Career',         text: 'Pathak ji confirmed my government-to-private switch was favourable but warned of a tough first 3 months. He was right on both counts. After that things picked up significantly. Only reason for 4 stars is appointment wait time. Still completely worth it and I recommend him to everyone.' },
  { name: 'Suresh Nair',         location: 'Kochi, Kerala',                  stars: 5,   avatar: '⭐', service: 'Shubh Muhurt + Numerology',        text: 'Pathak ji gave me three Muhurt options for my business launch with clear explanations. He also suggested changing one letter in my business name. I was doubtful but did it — first quarter revenue exceeded target by 40%. My accountant calls it luck. I know what it really is.' },
  { name: 'Pooja Iyer',          location: 'Chennai, Tamil Nadu',            stars: 4.5, avatar: '🌼', service: 'Nadi Jyotish + Marriage',          text: 'Pathak ji described my past in specific detail — education, a health issue at 19, a family separation. I was stunned. The compatibility reading was thorough and grounded, not generic. Report took 2 extra days but was comprehensive. Overall a deeply meaningful experience.' },
  { name: 'Vikas Malhotra',      location: 'Chandigarh, Punjab',             stars: 4,   avatar: '🔮', service: 'Hasth Rekha + Vastu',              text: 'My wife booked this as a birthday gift and I showed up very skeptical. Pathak ji correctly identified two career changes and a family dispute just from my palm. The Vastu correction also lightened the atmosphere at home noticeably. Lost one star only for wanting more timeline detail.' },
  { name: 'Sandeep Chatterjee',  location: 'Durgapur, West Bengal',          stars: 4.5, avatar: '💡', service: 'KP Astrology + Job Change',         text: 'I was stuck in the same role for 6 years. Pathak ji using KP sub-lord analysis said my 11th sub-lord would activate in October and a job offer would come unsolicited. On October 14th I received a LinkedIn message from a company I had never applied to — 60% salary hike. The precision was stunning. Minor delay in sending the written report, hence 4.5.' },
  { name: 'Kavita Singh',        location: 'Lucknow, Uttar Pradesh',         stars: 5,   avatar: '🪔', service: 'Kundali Matching + Muhurt',        text: 'Pathak ji ne seedha bataya — match hai, mangal dosha ka nivaran ho jayega. Shaadi usi muhurt mein hui jaise unhone kaha tha. Ek saal baad beti bilkul khush hai. Pathak ji ka dil se shukriya — aap sirf jyotishi nahi, ek marg darshak hain.' },
  { name: 'Amit Verma',          location: 'Patna, Bihar',                   stars: 5,   avatar: '🔯', service: 'Numerology + Name Correction',     text: 'My business had been just surviving for 4 years. Pathak ji suggested adding one letter to my trade name to fix the number vibration. I updated my cards and signboard. Next quarter revenue rose 35% and a government supply contract came in. He changed my life with a single letter.' },
  { name: 'Harpreet Kaur',       location: 'Amritsar, Punjab',               stars: 5,   avatar: '🕯️', service: 'Energy + Spiritual Remedies',      text: 'Our home had a heavy negative energy for 5 years — illness, arguments, business failures. Pathak ji remotely identified a buried item in a specific corner placed with ill intent. After his prescribed puja and rituals, within 2 months everything transformed. Father started recovering. Forever grateful.' },
  { name: 'Aditya Rathore',      location: 'Udaipur, Rajasthan',             stars: 5,   avatar: '🌄', service: 'Business Muhurt + Name Numerology', text: 'I was starting a hospitality business in Udaipur and wanted everything auspicious. Pathak ji not only gave me the perfect Muhurt for registration but also suggested adjusting the business name\'s total numerological value. Two years in, our hotel is ranked in the top 5 on every booking platform in Udaipur. Coincidence? Perhaps. But I attribute it to starting right. Very grateful.' },

  // Row 2 — interleaved Pathak ji + others
  { name: 'Deepak Tiwari',       location: 'Varanasi, Uttar Pradesh',        stars: 5,   avatar: '🏮', service: 'Lal Kitab + Business Remedies',    text: 'Varanasi mein rehte hue bhi maine Pathak ji se online baat ki. Pehle minute mein unhone mera vyapar aur ek khaas insaan jo rok raha tha sab sahi bataya. Teen mahine mein pending case close hua, bada order aaya. Aaj unhe apne parivaar ka hissa samajhta hun.' },
  { name: 'Shalini Dubey',       location: 'Nagpur, Maharashtra',            stars: 4,   avatar: '🌻', service: 'Prashn Kundali + Property',        text: 'Pathak ji said we would win our 3-year property dispute in 7–9 months through an unexpected document. Exactly 8 months later an old deed surfaced and the judge ruled in our favour. 4 stars because a second query felt a bit general. But for the property question — absolutely spot on.' },
  { name: 'Ritu Agarwal',        location: 'Jaipur, Rajasthan',              stars: 5,   avatar: '💍', service: 'Delayed Marriage + Dosh Nivaran',  text: 'At 31, proposals kept falling through and family was losing hope. Pathak ji identified a Mangal-Shukra affliction and said marriage would happen in 6–8 months. Exactly 5 months and 3 weeks later I was engaged. He said "yeh toh hona hi tha." That humility moved me.' },
  { name: 'Tarun Bhattacharya',  location: 'Kolkata, West Bengal',           stars: 5,   avatar: '🏮', service: 'Nadi Jyotish + Career',             text: 'Pathak ji-r kotha shune shuru-te biswas hoyni. Kintu tini amar babar naam, amar jonmotar ekta specific katha sab sothik bolchilen. Amio to ekhon shwikaar korchi je career niye unnar prediction exacto ek bochor 2 maser modhye sotti holo. Ami amaar poribarer sob-ke unnar kache pathiye deoya shuru korechi.' },
  { name: 'Gaurav Pandey',       location: 'Allahabad, Uttar Pradesh',       stars: 5,   avatar: '🌠', service: 'Full Kundali + Raj Yoga',          text: 'I came to Pathak ji after losing my father, completely lost. He spent over an hour with me, identified a strong Raj Yoga forming from age 34, and told me the struggles were just the final clearing. I am 34 now and everything is unfolding exactly as he said. He always remembers me when I call.' },
  { name: 'Rajan Nambiar',       location: 'Thrissur, Kerala',               stars: 4,   avatar: '🔱', service: 'Vastu + Property Dispute',         text: 'We had a bitter 4-year court case over ancestral property. Pathak ji said the case would conclude in our favour in the 8th month with a sudden document discovery. Month 7 an old sale deed surfaced. We won. The Vastu corrections he suggested for our new house have made a noticeable difference in family atmosphere. Four stars because I wished the session had been even longer.' },
  { name: 'Laxmi Devi Sharma',   location: 'Jaipur, Rajasthan',              stars: 5,   avatar: '🌻', service: 'Kaal Sarp + Mangal Dosh Nivaran',   text: 'Mere ghar mein 7 saal se koi shubh kaam nahi ho raha tha. Shadi atkti, business mein ghata, log beemar padte. Pathak ji ne pehle hi session mein Kaal Sarp aur Mangal dono dosh pakad liye. Unki batai puja ke baad usi saal meri beti ki shadi tay hui aur bete ko naukri mili. Bhagwan unhe lambi umar de.' },
  { name: 'Divya Menon',         location: 'Thiruvananthapuram, Kerala',     stars: 4.5, avatar: '🌙', service: 'Health + Foreign Settlement',      text: 'Pathak ji prescribed a gemstone for my unexplained health issue — gastro problems improved in 6 weeks. For my Canada visa he predicted one rejection then success. My first application was rejected, the second approved 4 months later. Calm, never alarmist. Half star off only for session length.' },
  { name: 'Sunita Joshi',        location: 'Pune, Maharashtra',              stars: 5,   avatar: '📚', service: 'Education + Raj Yoga',             text: 'Pathak ji ne kaha "4th attempt mein safalta pakki hai." Humne ek mantra aur upvaas kiya. Char maheene baad Rohit ka naam IIT list mein tha. Main rote rote phone kiya. Unhone kaha "bata diya tha na." Aaj beta IIT Bombay mein hai. Yeh vishwaas ki shakti hai.' },
  { name: 'Vikram Singh Rajput', location: 'Jodhpur, Rajasthan',             stars: 5,   avatar: '⚔️', service: 'Lal Kitab + Debt Removal',         text: 'Hamare vyapar par kaafi karz chadh gaya tha aur rishtedar bhi saath chhodne lage the. Pathak ji ne Lal Kitab ke mutabik kuch upay bataye — goind ki jad aur kuch simple totke. 40 din ke andar ek purana creditor khud forward aaya aur deal ho gayi. 6 mahine mein sara karz saaf. Aaj hamare pass 3 dukaane hain. Pathak ji ka ehsaan kabhi nahi bhulenge.' },
  { name: 'Rohini Kulkarni',     location: 'Kolhapur, Maharashtra',          stars: 5,   avatar: '🌷', service: 'Vedic Astrology + Business Timing',  text: 'My restaurant was about to close after two years of losses. Pathak ji reviewed my chart and told me to wait just 4 more months and not give up. He said a strong Mercury Dasha was coming. Exactly at the 4-month mark a corporate catering contract appeared out of nowhere. The restaurant is now fully profitable and I have expanded to a second location. Pathak ji saved my life\'s work.' },
  { name: 'Yashodha Krishnan',   location: 'Coimbatore, Tamil Nadu',         stars: 5,   avatar: '🌺', service: 'Navamsa Reading + Marriage',        text: 'My horoscope was rejected by many families due to a so-called dosha. Pathak ji spent an hour explaining why the dosha was cancelled in my chart and even wrote a detailed note I could share. Within 6 months I was married to a wonderful man. His prediction about my husband\'s profession, hometown, and nature were all accurate. I recommend Pathak ji to every girl facing kundali rejections.' },
  { name: 'Manasi Bose',         location: 'Siliguri, West Bengal',           stars: 5,   avatar: '🌸', service: 'Progeny + Putra Dosha Nivaran',    text: 'After 5 years of marriage and two failed IVF cycles, we had almost lost hope. Pathak ji identified a Putra Dosha and prescribed specific temple visits and mantras. He said the 5th house would open in a specific month. Our son was born exactly 11 months after we completed the remedies. I named him after the deity Pathak ji recommended. There are no words for this gratitude.' },
  { name: 'Geeta Rani Pandey',   location: 'Gorakhpur, Uttar Pradesh',       stars: 5,   avatar: '🪔', service: 'Full Kundali + Widow Dosha',       text: 'Mera parivaar Pitru Dosha se bahut pareshan tha. Pathak ji ne pehle call pe hi samajh liya. Unhone jo puja batai usse hamare ghar mein shanti aayi. Sabse badi baat — mere bete ki naukri jo 2 saal se atkhi thi woh 3 mahine mein lag gayi. Pathak ji sirf jyotishi nahi hain, woh ek anugrahi hain. Jai ho unki.' },
]

function TrainRow({ items, direction = 'left', speed = 40 }) {
  const doubled = [...items, ...items]
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* marquee track — white-space:nowrap only applies to the flex row itself */}
      <div
        className={direction === 'left' ? 'marquee-left' : 'marquee-right'}
        style={{ '--speed': `${speed}s`, alignItems: 'flex-start' }}
      >
        {doubled.map((t, i) => (
          /* Card: fixed width + white-space:normal so text wraps inside */
          <div
            key={`${t.name}-${i}`}
            style={{
              width: '300px',
              flexShrink: 0,
              whiteSpace: 'normal',
              display: 'inline-flex',
              flexDirection: 'column',
              verticalAlign: 'top',
              margin: '0 12px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #fde68a',
              boxShadow: '0 2px 12px rgba(180,130,20,0.10)',
              padding: '16px',
              gap: '10px',
              boxSizing: 'border-box',
            }}
          >
            {/* Name / location / stars row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{t.avatar}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#78350f', fontSize: '13px', lineHeight: 1.3 }}>{t.name}</div>
                  <div style={{ color: '#d97706', fontSize: '11px', marginTop: '2px' }}>📍 {t.location}</div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Stars rating={t.stars} />
              </div>
            </div>

            {/* Review paragraph — full text, wraps inside the box */}
            <p style={{
              color: '#92400e',
              fontSize: '12px',
              lineHeight: '1.65',
              fontStyle: 'italic',
              margin: 0,
              padding: 0,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }}>
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Service badge */}
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '5px 8px',
              fontSize: '11px',
              color: '#b45309',
              fontWeight: 600,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
            }}>
              🔮 {t.service}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ratingRows = [
  { label: '5 Stars',   pct: 82, delay: 200 },
  { label: '4.5 Stars', pct: 10, delay: 350 },
  { label: '4 Stars',   pct:  5, delay: 500 },
  { label: '3 Stars',   pct:  3, delay: 650 },
]

export default function Testimonials() {
  const [ref, inView] = useInView()
  const [ratingRef, ratingInView] = useInViewOnce()
  const half = Math.ceil(testimonials.length / 2)
  const row1 = testimonials.slice(0, half)
  const row2 = testimonials.slice(half)

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-yellow-50 to-amber-50 overflow-hidden diamond-pattern-light">
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div ref={ref} className={`text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-amber-600 font-semibold text-sm tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <span className="star-pop inline-block">✦</span> Client Stories <span className="star-pop inline-block" style={{animationDelay:'0.5s'}}>✦</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            What Our <span className="text-amber-600">Clients Say</span>
          </h2>
          <p className="text-amber-700 text-lg max-w-2xl mx-auto">5000+ lives guided across India — voices of real transformation</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
            <span className="text-amber-500 star-pop">❋</span>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full" />
            <span className="text-amber-500 star-pop" style={{animationDelay:'1s'}}>❋</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
          </div>
        </div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="mb-4">
        <TrainRow items={row1} direction="left" speed={42} />
      </div>
      {/* Row 2 — scrolls right */}
      <div>
        <TrainRow items={row2} direction="right" speed={38} />
      </div>

      {/* Rating summary — animated on scroll */}
      <div className="max-w-7xl mx-auto px-4 mt-14 text-center">
        <div
          ref={ratingRef}
          className={`inline-flex flex-col sm:flex-row items-center gap-8 bg-amber-900 rounded-2xl px-10 py-8 cosmic-glow transition-all duration-700 ${ratingInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
        >
          {/* Big score */}
          <div className="text-center">
            <div className="text-yellow-300 font-bold text-6xl mb-1 tabular-nums drop-shadow-lg">
              <CountUp target={4.9} decimals={1} run={ratingInView} />
            </div>
            {/* Stars animate in one by one */}
            <div className="text-yellow-400 text-2xl mb-1 flex justify-center gap-0.5">
              {['★','★','★','★','★'].map((s, i) => (
                <span
                  key={i}
                  className={`inline-block transition-all duration-300 ${ratingInView ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                  style={{ transitionDelay: `${400 + i * 120}ms` }}
                >{s}</span>
              ))}
            </div>
            <div className={`text-amber-200 text-sm transition-all duration-500 ${ratingInView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1100ms' }}>
              Based on <CountUp target={5000} suffix="+" run={ratingInView} /> consultations
            </div>
          </div>

          <div className="hidden sm:block w-px h-20 bg-amber-700" />

          {/* Bar rows */}
          <div className="space-y-3 text-sm text-amber-300">
            {ratingRows.map(({ label, pct, delay }) => (
              <div key={label} className={`flex items-center gap-3 transition-all duration-500 ${ratingInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`} style={{ transitionDelay: `${delay}ms` }}>
                <span className="w-16 text-right text-amber-400 text-xs">{label}</span>
                <div className="w-32 h-2 bg-amber-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: ratingInView ? `${pct}%` : '0%',
                      transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
                    }}
                  />
                </div>
                <span className="text-xs tabular-nums">
                  {ratingInView
                    ? <CountUp target={pct} suffix="%" run={ratingInView} />
                    : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
