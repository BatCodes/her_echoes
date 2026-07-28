import { useMemo } from 'react'

/* the gentle fallback sky: a handful of CSS-twinkling stars */
export default function SkyLite() {
  const stars = useMemo(() =>
    Array.from({ length: 44 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 7 + Math.random() * 8,
      delay: Math.random() * 3,
      dim: Math.random() < 0.4,
    })), [])
  return (
    <div className="skylite" aria-hidden="true">
      {stars.map((s) => (
        <span key={s.id} style={{
          left: s.left + '%', top: s.top + '%', fontSize: s.size,
          animationDelay: s.delay + 's', opacity: s.dim ? 0.35 : undefined,
        }}>✦</span>
      ))}
    </div>
  )
}
