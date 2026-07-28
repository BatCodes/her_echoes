import { useState } from 'react'
import { PROMISES, HEADS } from '../content'
import SectionHead from './SectionHead'
import { burst } from '../lib/fx'
import { vibrate } from '../lib/prefs'

export default function Promises() {
  const [n, setN] = useState(0)
  const done = n >= PROMISES.length

  const unroll = () => {
    if (done) return
    const next = n + 1
    setN(next)
    vibrate(6)
    if (next === PROMISES.length) burst(20)
  }

  return (
    <section className="scrollwrap">
      <SectionHead copy={HEADS.promises} />
      <div className="scrollpaper">
        <div className="ptitle">I, Hassan, do solemnly swear&hellip;</div>
        <div className="pcount"><b>{n}</b> / {PROMISES.length} promises sworn</div>
        <div>
          {PROMISES.map((p, i) => (
            <div key={i} className={'promise' + (i < n ? ' on' : '')}>
              <span className="pn">{String(i + 1).padStart(2, '0')}</span>
              <span dangerouslySetInnerHTML={{ __html: p }} />
            </div>
          ))}
        </div>
        <div className={'psworn' + (done ? ' on' : '')}>sworn under our same sky — Hassan</div>
        {!done && <button className="pbtn" onClick={unroll}>unroll the next promise</button>}
      </div>
    </section>
  )
}
