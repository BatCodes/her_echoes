import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsapSetup'
import { scrollState } from '../lib/scroll'
import { reduced } from '../lib/prefs'

/* the wayfarer's thread — a hair-thin gold line down the right
   edge with a quill-spark climbing it as she reads. Progress as
   altitude gained on a night ascent, never a scrollbar. */
export default function WayfarerThread() {
  const spark = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reduced) return
    let last = -1
    const fn = () => {
      const s = spark.current
      if (!s) return
      const p = scrollState.progress
      if (Math.abs(p - last) < 0.0004) return
      last = p
      s.style.transform = `translateY(${(p * (innerHeight - 190)).toFixed(1)}px)`
    }
    gsap.ticker.add(fn)
    return () => gsap.ticker.remove(fn)
  }, [])

  return (
    <div className="wthread" aria-hidden="true">
      <span ref={spark} className="wtspark">✦</span>
    </div>
  )
}
