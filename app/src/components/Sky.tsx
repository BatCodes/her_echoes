import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../lib/gsapSetup'
import { scrollState } from '../lib/scroll'
import { tilt } from '../lib/gyro'
import { pointerState } from '../lib/pointer'
import { skyState } from '../lib/skyState'
import { reduced } from '../lib/prefs'

/* ═══════════════════════════════════════════════════════════════
   The living sky — rebuilt against screenshots of the beloved tale.

   Lesson learned the visual way: the shader nebula + bloom washed the
   whole page lavender. So the PROVEN look owns the base — the deep
   body gradient and CSS nebula washes show through a transparent
   canvas — and WebGL adds only what it is uniquely good at:
   · stars as baked-glow sprites (the tale's exact recipe) with true
     depth, parallax and twinkle
   · star condensation while the cover shows
   · the camera pushing through the field when she opens the book
   · comets with real ribbon tails
   Discipline: DPR ≤ 2, pauses off-tab, no per-frame allocations.
   ═══════════════════════════════════════════════════════════════ */

function useSharedUniforms() {
  return useMemo(() => ({
    uTime: { value: 0 },
    uDeep: { value: 0 },
    uForm: { value: reduced ? 1 : 0 },
  }), [])
}
type Shared = ReturnType<typeof useSharedUniforms>

/* baked glow sprites — painted once, tinted per star in the shader */
function makeStarTexture(flare: boolean): THREE.CanvasTexture {
  const size = flare ? 96 : 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const h = size / 2
  const rad = g.createRadialGradient(h, h, 0, h, h, h)
  rad.addColorStop(0, 'rgba(255,255,255,1)')
  rad.addColorStop(0.25, 'rgba(255,255,255,.75)')
  rad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = rad
  g.fillRect(0, 0, size, size)
  if (flare) {
    g.strokeStyle = 'rgba(255,255,255,.8)'
    g.lineWidth = size / 30
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(h, size * 0.04); g.lineTo(h, size * 0.96)
    g.moveTo(size * 0.04, h); g.lineTo(size * 0.96, h)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const STAR_VERT = `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute vec3 aScatter;
  uniform float uTime;
  uniform float uPix;
  uniform float uForm;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    vColor = aColor;
    vTw = 0.62 + 0.38 * sin(uTime * (0.55 + fract(aSeed) * 1.35) + aSeed * 6.283);
    float f = 1.0 - pow(1.0 - uForm, 3.0);
    vec3 pos = mix(aScatter, position, f);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPix * (150.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const STAR_FRAG = `
  precision mediump float;
  varying vec3 vColor;
  varying float vTw;
  uniform float uDeep;
  uniform sampler2D uMap;
  void main() {
    float m = texture2D(uMap, gl_PointCoord).a;
    float a = m * vTw * (0.8 + 0.3 * uDeep);
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`

const PALETTE = [
  new THREE.Color('#f7e3bf'), new THREE.Color('#eec07a'),
  new THREE.Color('#f2a9b4'), new THREE.Color('#c3bce0'), new THREE.Color('#ffffff'),
]
const HERO_PALETTE = [new THREE.Color('#ffd9a0'), new THREE.Color('#fff3e8'), new THREE.Color('#ffc2cc')]

function StarLayer({ shared, tex, count, spread, z, size, drift, hero = false }: {
  shared: Shared
  tex: THREE.CanvasTexture
  count: number; spread: number; z: number; size: number; drift: number
  hero?: boolean
}) {
  const group = useRef<THREE.Points>(null)
  const { gl } = useThree()

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const scat = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    const cols = new Float32Array(count * 3)
    const pal = hero ? HERO_PALETTE : PALETTE
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread
      const y = (Math.random() - 0.5) * spread * 0.72
      const zz = z + (Math.random() - 0.5) * 4
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = zz
      const m = 1.6 + Math.random() * 1.4
      scat[i * 3] = x * m + (Math.random() - 0.5) * 24
      scat[i * 3 + 1] = y * m + (Math.random() - 0.5) * 18
      scat[i * 3 + 2] = zz - 14 - Math.random() * 22
      sizes[i] = size * (0.5 + Math.random())
      seeds[i] = Math.random() * 100
      const c = pal[Math.floor(Math.random() * pal.length)]
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aScatter', new THREE.BufferAttribute(scat, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(cols, 3))
    return g
  }, [count, spread, z, size, hero])
  useEffect(() => () => { geo.dispose() }, [geo])

  const uniforms = useMemo(() => ({
    uTime: shared.uTime,
    uDeep: shared.uDeep,
    uForm: shared.uForm,
    uPix: { value: Math.min(gl.getPixelRatio(), 2) },
    uMap: { value: tex },
  }), [gl, shared, tex])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const px = tilt.on ? tilt.x : pointerState.x
    const py = tilt.on ? tilt.y : pointerState.y
    g.position.x += ((px * drift) - g.position.x) * 0.04
    g.position.y += ((-py * drift * 0.6 + scrollState.progress * drift * 3.4) - g.position.y) * 0.04
  })

  return (
    <points ref={group} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        vertexShader={STAR_VERT}
        fragmentShader={STAR_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ------------------------- comets ------------------------- */
const TRAIL = 26

function Comet() {
  const mesh = useRef<THREE.Mesh>(null)
  const st = useRef({
    phase: 'wait' as 'wait' | 'fly',
    until: 2 + Math.random() * 9,
    t: 0, life: 2,
    x: 0, y: 0, vx: 0, vy: 0,
    hist: new Float32Array(TRAIL * 2),
  })

  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(TRAIL * 2 * 3)
    const aT = new Float32Array(TRAIL * 2)
    const index: number[] = []
    for (let i = 0; i < TRAIL; i++) {
      aT[i * 2] = aT[i * 2 + 1] = i / (TRAIL - 1)
      if (i < TRAIL - 1) {
        const k = i * 2
        index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
      }
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aT', new THREE.BufferAttribute(aT, 1))
    g.setIndex(index)
    const m = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aT;
        varying float vT;
        void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        precision mediump float;
        varying float vT;
        uniform float uEnv;
        void main(){
          float a = pow(1.0 - vT, 1.8) * uEnv;
          if (a < 0.015) discard;
          vec3 head = vec3(1.0, 0.96, 0.86);
          vec3 tail = vec3(0.93, 0.75, 0.48);
          gl_FragColor = vec4(mix(head, tail, vT), a);
        }
      `,
      uniforms: { uEnv: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [])
  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw)
    const s = st.current
    if (s.phase === 'wait') {
      s.until -= dt
      mat.uniforms.uEnv.value = 0
      if (s.until <= 0) {
        s.phase = 'fly'
        s.t = 0
        s.life = 1.6 + Math.random() * 0.7
        s.x = (Math.random() - 0.5) * 44
        s.y = 9 + Math.random() * 8
        const ang = Math.PI * (Math.random() < 0.5 ? 1.12 + Math.random() * 0.18 : -0.12 - Math.random() * 0.18)
        const sp = 17 + Math.random() * 9
        s.vx = Math.cos(ang) * sp
        s.vy = -Math.abs(Math.sin(ang)) * sp * 0.62 - 4
        for (let i = 0; i < TRAIL; i++) { s.hist[i * 2] = s.x; s.hist[i * 2 + 1] = s.y }
      }
      return
    }
    s.t += dt
    s.x += s.vx * dt
    s.y += s.vy * dt
    for (let i = TRAIL - 1; i > 0; i--) {
      s.hist[i * 2] = s.hist[(i - 1) * 2]
      s.hist[i * 2 + 1] = s.hist[(i - 1) * 2 + 1]
    }
    s.hist[0] = s.x; s.hist[1] = s.y

    const frac = s.t / s.life
    mat.uniforms.uEnv.value = Math.sin(Math.PI * Math.min(1, frac)) * 0.85
    if (frac >= 1.15) { s.phase = 'wait'; s.until = 6 + Math.random() * 9 }

    const attr = geo.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    for (let i = 0; i < TRAIL; i++) {
      const hx = s.hist[i * 2], hy = s.hist[i * 2 + 1]
      const px = i < TRAIL - 1 ? s.hist[(i + 1) * 2] : hx
      const py = i < TRAIL - 1 ? s.hist[(i + 1) * 2 + 1] : hy
      let dx = hx - px, dy = hy - py
      const len = Math.hypot(dx, dy) || 1
      dx /= len; dy /= len
      const w = 0.30 * (1 - i / (TRAIL - 1)) + 0.02
      const k = i * 6
      arr[k] = hx - dy * w; arr[k + 1] = hy + dx * w; arr[k + 2] = -12
      arr[k + 3] = hx + dy * w; arr[k + 4] = hy - dx * w; arr[k + 5] = -12
    }
    attr.needsUpdate = true
  })

  return <mesh ref={mesh} geometry={geo} material={mat} frustumCulled={false} />
}

/* --------------------- camera + uniforms rig --------------------- */
const DUR_PUSH = 1.9

function Rig({ shared }: { shared: Shared }) {
  const { camera } = useThree()
  const pushed = useRef(false)

  useEffect(() => {
    if (!reduced) {
      const tw = gsap.to(shared.uForm, { value: 1, duration: 2.6, ease: 'power2.out', delay: 0.2 })
      return () => { tw.kill() }
    }
  }, [shared])

  useFrame(({ clock }) => {
    shared.uTime.value = clock.elapsedTime
    shared.uDeep.value += (scrollState.progress - shared.uDeep.value) * 0.045

    if (skyState.open && !pushed.current) {
      pushed.current = true
      if (reduced) camera.position.z = 14
      else gsap.to(camera.position, { z: 14, duration: DUR_PUSH, ease: 'expo.inOut' })
    }
  })
  return null
}

/* --------------------------- scene --------------------------- */
export default function Sky(_props: { post?: boolean }) {
  const [frozen, setFrozen] = useState(() => typeof document !== 'undefined' && document.hidden)

  useEffect(() => {
    const onVis = () => setFrozen(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <div id="skyroot" aria-hidden="true">
      {/* the tale's proven backdrop: nebula washes over the body gradient */}
      <div className="slneb a" />
      <div className="slneb b" />
      <div className="slneb c" />
      <Canvas
        flat
        dpr={[1, 2]}
        frameloop={frozen ? 'never' : 'always'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 20], fov: 55 }}
      >
        <SceneBody />
      </Canvas>
    </div>
  )
}

function SceneBody() {
  const shared = useSharedUniforms()
  const soft = useMemo(() => makeStarTexture(false), [])
  const flare = useMemo(() => makeStarTexture(true), [])
  useEffect(() => () => { soft.dispose(); flare.dispose() }, [soft, flare])
  return (
    <>
      <Rig shared={shared} />
      <StarLayer shared={shared} tex={soft} count={480} spread={70} z={-16} size={2.0} drift={0.28} />
      <StarLayer shared={shared} tex={soft} count={200} spread={52} z={-8} size={3.2} drift={0.7} />
      <StarLayer shared={shared} tex={soft} count={70} spread={40} z={-3} size={4.6} drift={1.25} />
      {/* the flaring ones live deep in the background — decoration, never mistaken for the page */}
      <StarLayer shared={shared} tex={flare} count={10} spread={64} z={-15} size={7} drift={0.35} hero />
      <Comet />
      <Comet />
    </>
  )
}
