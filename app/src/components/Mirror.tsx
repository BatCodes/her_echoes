import { useRef, useState } from 'react'
import { MIRROR_LINES, HEADS } from '../content'
import SectionHead from './SectionHead'
import { sparkleAt } from '../lib/fx'

export default function Mirror() {
  const [i, setI] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)

  const ask = () => {
    setI((i + 1) % MIRROR_LINES.length)
    const el = ref.current
    if (el) {
      el.classList.remove('shine')
      void el.offsetWidth
      el.classList.add('shine')
      sparkleAt(el.getBoundingClientRect())
    }
  }

  const line = i >= 0 ? MIRROR_LINES[i] : null

  return (
    <section id="mirror">
      <SectionHead copy={HEADS.mirror} />
      <div
        ref={ref} className="mirror" role="button" tabIndex={0}
        aria-label="Tap the mirror"
        onClick={ask}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ask() } }}
      >
        <p aria-live="polite">
          {line ? (
            <>
              <span dangerouslySetInnerHTML={{ __html: line.text }} />
              {line.src && <span className="msrc">{line.src}</span>}
            </>
          ) : (
            <span>&ldquo;tap me, your highness&rdquo;</span>
          )}
        </p>
      </div>
      <div className="hintl">tap the mirror · it never runs out</div>
    </section>
  )
}
