import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../lib/gsapSetup'
import { scrollState } from '../lib/scroll'
import { tilt } from '../lib/gyro'
import { pointerState } from '../lib/pointer'
import { skyState } from '../lib/skyState'
import { reduced, tier } from '../lib/prefs'
import { keepsake } from '../lib/keepsake'
import { moonNow } from '../lib/moon'

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

function Comet({ summon = false }: { summon?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const st = useRef({
    phase: 'wait' as 'wait' | 'fly',
    /* a summoning comet answers quickly; the others keep their own hours */
    until: summon ? 2.2 : 2 + Math.random() * 9,
    summon,
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
      /* a milestone shower — the sky applauds generously for a while */
      if (performance.now() < skyState.showerUntil && s.until > 0.8) {
        s.until = 0.15 + Math.random() * 0.6
      }
      mat.uniforms.uEnv.value = 0
      if (s.until <= 0) {
        s.phase = 'fly'
        s.t = 0
        if (s.summon && !skyState.open) {
          /* the prologue: one comet descends to the book's clasp */
          s.life = 1.3
          s.x = 8; s.y = 12
          s.vx = (0 - s.x) / s.life
          s.vy = (-4.5 - s.y) / s.life
        } else {
          s.summon = false
          s.life = 1.6 + Math.random() * 0.7
          s.x = (Math.random() - 0.5) * 44
          s.y = 9 + Math.random() * 8
          const ang = Math.PI * (Math.random() < 0.5 ? 1.12 + Math.random() * 0.18 : -0.12 - Math.random() * 0.18)
          const sp = 17 + Math.random() * 9
          s.vx = Math.cos(ang) * sp
          s.vy = -Math.abs(Math.sin(ang)) * sp * 0.62 - 4
        }
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
    if (frac >= 1.15) {
      if (s.summon) {
        s.summon = false
        /* it has landed on the clasp — the cover may light it now */
        window.dispatchEvent(new CustomEvent('echoes:summoned'))
      }
      s.phase = 'wait'; s.until = 6 + Math.random() * 9
    }

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
  const pushing = useRef(false)

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
      if (reduced) camera.position.z = skyState.zTarget
      else {
        pushing.current = true
        gsap.to(camera.position, {
          z: 14, duration: DUR_PUSH, ease: 'expo.inOut',
          onComplete: () => { pushing.current = false },
        })
      }
    }
    /* the journey: chapters call the camera deeper into the field */
    if (skyState.open && !pushing.current) {
      if (reduced) camera.position.z = skyState.zTarget
      else camera.position.z += (skyState.zTarget - camera.position.z) * 0.018
    }
  })
  return null
}

/* ---------------------- the cosmic dust ----------------------
   One draw call. The same particles wear every behaviour:
   ambient curl-drift, thumb-stirred swirls, scroll streamers,
   per-chapter weather tint, exhale bursts, and the finale inhale
   where the whole night gathers toward her held thumb.        */

const DUST_PLANE_Z = -3.5
const BURSTS = 3

const DUST_VERT = `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPix;
  uniform float uDrift;
  uniform vec4 uInhale;
  uniform vec4 uBurst[${BURSTS}];
  varying float vA;
  void main() {
    vec3 pos = position;
    float t = uTime * 0.12 * uDrift + aSeed;
    pos.x += sin(t + position.y * 0.35) * 1.1 + sin(t * 0.63 + position.z) * 0.6;
    pos.y += cos(t * 0.8 + position.x * 0.3) * 0.9 + sin(t * 0.41) * 0.5;
    for (int i = 0; i < ${BURSTS}; i++) {
      vec4 b = uBurst[i];
      if (b.z >= 0.0) {
        vec2 d = pos.xy - b.xy;
        float dist = length(d) + 0.001;
        float w = exp(-dist * dist * 0.02) * exp(-b.z * 2.2);
        pos.xy += (d / dist) * w * 3.5;
      }
    }
    if (uInhale.z > 0.001) {
      vec2 d = uInhale.xy - pos.xy;
      float dist = length(d) + 0.001;
      vec2 n = d / dist;
      vec2 tng = vec2(-n.y, n.x);
      float pull = uInhale.z * smoothstep(20.0, 0.0, dist);
      vec2 goal = uInhale.xy - n * 1.7 + tng * 1.7 * sin(uTime * 2.0 + aSeed);
      pos.xy = mix(pos.xy, goal, pull);
    }
    vA = (0.05 + 0.10 * fract(aSeed * 7.31)) * (0.7 + 0.3 * sin(uTime * (0.4 + fract(aSeed) * 0.8) + aSeed * 6.283));
    vA += uInhale.z * smoothstep(20.0, 0.0, length(uInhale.xy - pos.xy)) * 0.15;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPix * (90.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const DUST_FRAG = `
  precision mediump float;
  uniform sampler2D uMap;
  uniform vec3 uTint;
  uniform float uVel;
  varying float vA;
  void main() {
    vec2 pc = gl_PointCoord - 0.5;
    pc.y /= (1.0 + uVel * 5.0);
    pc.x *= (1.0 + uVel * 1.2);
    float m = texture2D(uMap, clamp(pc + 0.5, 0.0, 1.0)).a;
    float a = m * vA;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uTint, a);
  }
`

/** client px → world point on a given z-plane (no per-frame allocation) */
function makeUnprojector() {
  const v = new THREE.Vector3()
  const out = new THREE.Vector3()
  return (camera: THREE.Camera, cx: number, cy: number, planeZ: number) => {
    v.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1, 0.5).unproject(camera)
    v.sub(camera.position).normalize()
    const t = (planeZ - camera.position.z) / v.z
    return out.copy(camera.position).addScaledVector(v, t)
  }
}

function DustField({ shared, tex, count }: { shared: Shared; tex: THREE.CanvasTexture; count: number }) {
  const { gl, camera } = useThree()
  const unproject = useMemo(makeUnprojector, [])
  const lastProg = useRef(0)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 42
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = DUST_PLANE_Z + (Math.random() - 0.5) * 5
      seeds[i] = Math.random() * 100
      sizes[i] = 0.9 + Math.random() * 1.6
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    return g
  }, [count])
  useEffect(() => () => { geo.dispose() }, [geo])

  const uniforms = useMemo(() => ({
    uTime: shared.uTime,
    uPix: { value: Math.min(gl.getPixelRatio(), 2) },
    uMap: { value: tex },
    uTint: { value: new THREE.Color('#eec07a') },
    uDrift: { value: 1 },
    uVel: { value: 0 },
    uInhale: { value: new THREE.Vector4(0, 0, 0, 0) },
    uBurst: { value: Array.from({ length: BURSTS }, () => new THREE.Vector4(0, 0, -1, 0)) },
  }), [gl, shared, tex])

  useFrame(() => {
    /* weather — the dust changes character as she travels */
    const w = skyState.weather
    const tint = uniforms.uTint.value
    tint.r += (w.r - tint.r) * 0.02
    tint.g += (w.g - tint.g) * 0.02
    tint.b += (w.b - tint.b) * 0.02
    uniforms.uDrift.value += (w.drift - uniforms.uDrift.value) * 0.02

    /* streamers — scroll speed stretches the motes */
    const v = Math.min(1, Math.abs(scrollState.progress - lastProg.current) * 260)
    lastProg.current = scrollState.progress
    uniforms.uVel.value += (v - uniforms.uVel.value) * 0.12

    /* the inhale — her held thumb gathers the night */
    const inh = skyState.inhale
    inh.amt += ((inh.on ? 1 : 0) - inh.amt) * (inh.on ? 0.035 : 0.09)
    const iu = uniforms.uInhale.value
    if (inh.amt > 0.001) {
      const p = unproject(camera, inh.x, inh.y, DUST_PLANE_Z)
      iu.set(p.x, p.y, inh.amt, 0)
    } else iu.z = 0

    /* exhales — one-shot blooms at emotional peaks */
    const now = performance.now()
    for (let i = 0; i < BURSTS; i++) {
      const b = skyState.bursts[skyState.bursts.length - 1 - i]
      const u = uniforms.uBurst.value[i]
      if (b && now - b.t < 2000) {
        const p = unproject(camera, b.x, b.y, DUST_PLANE_Z)
        u.set(p.x, p.y, (now - b.t) / 1000, 0)
      } else u.z = -1
    }
  })

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        vertexShader={DUST_VERT}
        fragmentShader={DUST_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ------------------- the stars she has made -------------------
   WishLayer: a star freed from the jar rises and joins the sky —
   permanently, for this whole night. VisitStars: one warm star
   per visit, seeded so HER stars never move between visits.
   TwoStars: the epilogue's pair, hers and his, side by side.  */

const WISH_MAX = 24

const WISH_VERT = `
  attribute float aBirth;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPix;
  varying float vA;
  void main() {
    vec3 pos = position;
    float age = max(uTime - aBirth, 0.0);
    pos.y += (1.0 - exp(-age * 0.7)) * 3.2;
    float tw = 0.6 + 0.4 * sin(uTime * (0.6 + fract(aSeed)) + aSeed * 6.283);
    vA = aBirth < -0.5 ? 0.0 : min(age * 0.8, 1.0) * tw;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 4.2 * uPix * (150.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const GOLD_FRAG = `
  precision mediump float;
  uniform sampler2D uMap;
  uniform vec3 uColor;
  varying float vA;
  void main() {
    float m = texture2D(uMap, gl_PointCoord).a;
    float a = m * vA;
    if (a < 0.02) discard;
    gl_FragColor = vec4(uColor, a);
  }
`

function WishLayer({ shared, tex }: { shared: Shared; tex: THREE.CanvasTexture }) {
  const { gl, camera } = useThree()
  const unproject = useMemo(makeUnprojector, [])
  const slot = useRef(0)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(WISH_MAX * 3)
    const birth = new Float32Array(WISH_MAX).fill(-1)
    const seeds = new Float32Array(WISH_MAX)
    for (let i = 0; i < WISH_MAX; i++) seeds[i] = Math.random() * 100
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aBirth', new THREE.BufferAttribute(birth, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return g
  }, [])
  useEffect(() => () => { geo.dispose() }, [geo])

  const uniforms = useMemo(() => ({
    uTime: shared.uTime,
    uPix: { value: Math.min(gl.getPixelRatio(), 2) },
    uMap: { value: tex },
    uColor: { value: new THREE.Color('#f7e3bf') },
  }), [gl, shared, tex])

  useFrame(() => {
    while (skyState.wishes.length) {
      const w = skyState.wishes.shift()!
      const p = unproject(camera, w.x, w.y, -8)
      const i = slot.current % WISH_MAX
      slot.current++
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
      const birthAttr = geo.getAttribute('aBirth') as THREE.BufferAttribute
      posAttr.setXYZ(i, p.x, p.y, -8)
      birthAttr.setX(i, shared.uTime.value)
      posAttr.needsUpdate = true
      birthAttr.needsUpdate = true
    }
  })

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={WISH_VERT} fragmentShader={GOLD_FRAG} uniforms={uniforms}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/* deterministic PRNG so her constellation never rearranges itself */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const VISIT_VERT = `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPix;
  varying float vA;
  void main() {
    float tw = 0.55 + 0.45 * sin(uTime * (0.5 + fract(aSeed)) + aSeed * 6.283);
    vA = 0.75 * tw;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 2.6 * uPix * (150.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

function VisitStars({ shared, tex }: { shared: Shared; tex: THREE.CanvasTexture }) {
  const { gl } = useThree()
  const count = Math.min(keepsake().visits, 40)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const rnd = mulberry32(26012026) /* day one, forever the seed */
    const pos = new Float32Array(Math.max(count, 1) * 3)
    const seeds = new Float32Array(Math.max(count, 1))
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 46
      pos[i * 3 + 1] = -4 - rnd() * 7 /* low, near her horizon */
      pos[i * 3 + 2] = -14 - rnd() * 4
      seeds[i] = rnd() * 100
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setDrawRange(0, count)
    return g
  }, [count])
  useEffect(() => () => { geo.dispose() }, [geo])

  const uniforms = useMemo(() => ({
    uTime: shared.uTime,
    uPix: { value: Math.min(gl.getPixelRatio(), 2) },
    uMap: { value: tex },
    uColor: { value: new THREE.Color('#ffd9a0') },
  }), [gl, shared, tex])

  if (count === 0) return null
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={VISIT_VERT} fragmentShader={GOLD_FRAG} uniforms={uniforms}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

const TWO_VERT = `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPix;
  uniform float uOn;
  varying float vA;
  void main() {
    float tw = 0.7 + 0.3 * sin(uTime * (0.7 + fract(aSeed)) + aSeed * 6.283);
    vA = uOn * tw;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPix * (150.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

function TwoStars({ shared, tex }: { shared: Shared; tex: THREE.CanvasTexture }) {
  const { gl } = useThree()
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      -0.7, 6.8, -12, 0.7, 6.8, -12,
    ]), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array([12.7, 61.3]), 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array([7, 6.2]), 1))
    return g
  }, [])
  useEffect(() => () => { geo.dispose() }, [geo])

  const uniforms = useMemo(() => ({
    uTime: shared.uTime,
    uPix: { value: Math.min(gl.getPixelRatio(), 2) },
    uMap: { value: tex },
    uColor: { value: new THREE.Color('#ffe9c9') },
    uOn: { value: 0 },
  }), [gl, shared, tex])

  useFrame(() => {
    uniforms.uOn.value += ((skyState.epilogue ? 1 : 0) - uniforms.uOn.value) * 0.02
  })

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={TWO_VERT} fragmentShader={GOLD_FRAG} uniforms={uniforms}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/* ------------------- the real moon, tonight -------------------
   painted once on a canvas from synodic arithmetic — the sky in
   the book agrees with the sky above her window. */
function makeMoonTexture(): THREE.CanvasTexture {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const { illum, waxing } = moonNow()
  const cx = size / 2, r = size * 0.34
  /* the dark disc — barely there, the way the unlit moon really looks */
  g.fillStyle = 'rgba(195, 188, 224, 0.16)'
  g.beginPath(); g.arc(cx, cx, r, 0, 7); g.fill()
  /* the lit portion: semicircle + terminator ellipse */
  const k = Math.cos(Math.PI * illum) /* 1 = new, -1 = full */
  g.fillStyle = '#f4e7cd'
  g.shadowColor = 'rgba(247, 227, 191, 0.9)'
  g.shadowBlur = size * 0.12
  g.beginPath()
  g.arc(cx, cx, r, -Math.PI / 2, Math.PI / 2, !waxing)
  g.ellipse(cx, cx, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, waxing ? k < 0 : k > 0)
  g.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function MoonSprite() {
  const tex = useMemo(makeMoonTexture, [])
  useEffect(() => () => { tex.dispose() }, [tex])
  return (
    <mesh position={[-9, 8.6, -20]} frustumCulled={false}>
      <planeGeometry args={[3.4, 3.4]} />
      <meshBasicMaterial map={tex} transparent opacity={0.85} depthWrite={false} />
    </mesh>
  )
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
      <MoonSprite />
      <StarLayer shared={shared} tex={soft} count={480} spread={70} z={-16} size={2.0} drift={0.28} />
      <StarLayer shared={shared} tex={soft} count={200} spread={52} z={-8} size={3.2} drift={0.7} />
      <StarLayer shared={shared} tex={soft} count={70} spread={40} z={-3} size={4.6} drift={1.25} />
      {/* the flaring ones live deep in the background — decoration, never mistaken for the page */}
      <StarLayer shared={shared} tex={flare} count={10} spread={64} z={-15} size={7} drift={0.35} hero />
      {/* the cosmic dust — the medium she travels through */}
      <DustField shared={shared} tex={soft} count={tier === 'full' ? 1200 : 600} />
      <WishLayer shared={shared} tex={soft} />
      <VisitStars shared={shared} tex={soft} />
      <TwoStars shared={shared} tex={flare} />
      <Comet summon />
      <Comet />
      <Comet />
    </>
  )
}
