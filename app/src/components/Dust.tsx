import { useMemo } from 'react'

/* foreground dust motes — the third depth layer.
   fourteen slow embers drifting up through the dark,
   pure CSS animation, opacity never above .12 */
export default function Dust() {
  const motes = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 3.5,
      dur: 22 + Math.random() * 26,
      delay: -Math.random() * 40,
      sway: (Math.random() - 0.5) * 8,
      dim: 0.05 + Math.random() * 0.07,
    })), [])
  return (
    <div className="dustlayer" aria-hidden="true">
      {motes.map((m) => (
        <span
          key={m.id} className="mote"
          style={{
            left: m.left + '%',
            width: m.size, height: m.size,
            opacity: m.dim,
            animationDuration: `${m.dur}s, 3.8s`,
            animationDelay: `${m.delay}s, ${-Math.random() * 3}s`,
            ['--sw' as string]: m.sway + 'vw',
          }}
        />
      ))}
    </div>
  )
}
