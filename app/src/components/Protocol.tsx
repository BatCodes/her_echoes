import { useRef, useState } from 'react'
import { GRANTS, HEADS } from '../content'
import SectionHead from './SectionHead'
import { burst, sparkleAt } from '../lib/fx'
import { vibrate } from '../lib/prefs'

export default function Protocol() {
  const [gi, setGi] = useState(-1)
  const [gn, setGn] = useState(0)
  const [line, setLine] = useState('press the face to file a request')
  const [dim, setDim] = useState(false)
  const stamp = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)

  const plead = () => {
    const next = (gi + 1) % GRANTS.length
    setGi(next)
    const count = gn + 1
    setGn(count)
    vibrate(10)
    const st = stamp.current
    if (st) { st.classList.remove('go'); void st.offsetWidth; st.classList.add('go') }
    setDim(true)
    setTimeout(() => { setLine(GRANTS[next]); setDim(false) }, 220)
    sparkleAt(btn.current?.getBoundingClientRect())
    if (count === GRANTS.length) burst(14)
  }

  return (
    <section className="pleadwrapper">
      <SectionHead copy={HEADS.protocol} />
      <div className="pleadzone">
        <button ref={btn} className="plead" aria-label="Deploy the pleading face" onClick={plead}>🥺</button>
        <div ref={stamp} className="stamp" aria-hidden="true">GRANTED</div>
      </div>
      <div
        className="grantline" aria-live="polite"
        style={{ opacity: dim ? 0 : 1 }}
        dangerouslySetInnerHTML={{ __html: line }}
      />
      <div className="gcount">
        requests granted: <b>{gn}</b> · denied: <b>0</b>
        <i>the button does not have that setting</i>
      </div>
    </section>
  )
}
