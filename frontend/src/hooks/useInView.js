import { useEffect, useRef, useState } from 'react'

export function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Element entered viewport — animate in
        setInView(true)
      } else if (entry.boundingClientRect.top < 0) {
        // Element exited above the viewport (scrolled past going down) — reset so it re-animates on scroll back down
        setInView(false)
      }
      // If element is below viewport (scrolling up), keep inView true — no reset
    }, { threshold: 0.15, ...options })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, inView]
}
