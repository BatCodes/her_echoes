import { useEffect, useRef, useState } from 'react'
import { OUR_SONGS, PLAYER_VOLUME } from '../content'

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii']

/* ─────────────────────────────────────────────────────────────
   our songs · a glass vinyl in the corner
   · starts on her first touch anywhere (pointer, Enter or Space)
   · visible mini-player inside the panel (audio keeps playing
     when the panel is tucked away — close it, keep the song)
   · gold progress ring around the spinning disc
   ───────────────────────────────────────────────────────────── */

const Vinyl = () => (
  <svg className="os-vinyl" viewBox="0 0 54 54" aria-hidden="true">
    <circle cx="27" cy="27" r="26" fill="#171231" stroke="#453C74" strokeWidth="1" />
    <g fill="none" stroke="#2C2356" strokeWidth="1">
      <circle cx="27" cy="27" r="21" /><circle cx="27" cy="27" r="17.5" /><circle cx="27" cy="27" r="14" />
    </g>
    <circle cx="27" cy="27" r="9.5" fill="url(#osLabel)" />
    <circle cx="27" cy="27" r="1.8" fill="#171231" />
    <text x="27" y="24.4" textAnchor="middle" fontSize="5.6" fill="#14102c" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700">H♥H</text>
    <defs>
      <linearGradient id="osLabel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#EEC07A" /><stop offset="1" stopColor="#F2A9B4" />
      </linearGradient>
    </defs>
  </svg>
)

const IPlay = () => <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
const IPause = () => <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
const IPrev = () => <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM20 6l-10 6 10 6z" /></svg>
const INext = () => <svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM4 6l10 6-10 6z" /></svg>

export default function SongsPlayer() {
  const [open, setOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [idx, setIdx] = useState(0)
  const [ready, setReady] = useState(false)
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState(0)
  const [hint, setHint] = useState(false)

  const player = useRef<YTPlayer | null>(null)
  const mount = useRef<HTMLDivElement>(null)
  const idxRef = useRef(0)
  const triedAlt = useRef(false)
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const started_ = useRef(false)

  const fadeIn = () => {
    const p = player.current
    if (!p) return
    if (fadeTimer.current) clearInterval(fadeTimer.current)
    try { p.setVolume(0) } catch { /* ignore */ }
    let v = 0
    fadeTimer.current = setInterval(() => {
      v = Math.min(PLAYER_VOLUME, v + 3)
      try { player.current?.setVolume(v) } catch { /* ignore */ }
      if (v >= PLAYER_VOLUME && fadeTimer.current) clearInterval(fadeTimer.current)
    }, 130)
  }

  const loadIndex = (i: number, viaError = false) => {
    idxRef.current = i
    setIdx(i)
    setNote('')
    setProgress(0)
    if (!viaError) triedAlt.current = false
    const p = player.current
    if (p) {
      try { p.loadVideoById(OUR_SONGS[i].yt); fadeIn() } catch { /* ignore */ }
    }
  }

  const next = () => loadIndex((idxRef.current + 1) % OUR_SONGS.length)
  const prev = () => loadIndex((idxRef.current - 1 + OUR_SONGS.length) % OUR_SONGS.length)

  const createPlayer = () => {
    const YT = window.YT
    if (!YT || !mount.current || player.current) return
    player.current = new YT.Player(mount.current, {
      videoId: OUR_SONGS[idxRef.current].yt,
      playerVars: {
        autoplay: 1, playsinline: 1, controls: 0, rel: 0,
        modestbranding: 1, iv_load_policy: 3, disablekb: 1,
      },
      events: {
        onReady: () => { setReady(true); fadeIn() },
        onStateChange: (e) => {
          const S = window.YT?.PlayerState
          if (!S) return
          if (e.data === S.PLAYING) setPlaying(true)
          else if (e.data === S.PAUSED) setPlaying(false)
          else if (e.data === S.ENDED) next()
        },
        onError: () => {
          const song = OUR_SONGS[idxRef.current]
          if (song.alt && !triedAlt.current) {
            triedAlt.current = true
            try { player.current?.loadVideoById(song.alt) } catch { /* ignore */ }
          } else {
            setNote('this one would not load — try the next ✦')
            setPlaying(false)
          }
        },
      },
    })
  }

  const start = () => {
    if (started_.current) return
    started_.current = true
    setStarted(true)
    setHint(false)
    if (window.YT?.Player) { createPlayer(); return }
    window.onYouTubeIframeAPIReady = createPlayer
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  }

  /* her first touch anywhere wakes the music */
  useEffect(() => {
    const onPointer = () => start()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') start() }
    addEventListener('pointerdown', onPointer, { once: false })
    addEventListener('keydown', onKey)
    const t1 = setTimeout(() => { if (!started_.current) setHint(true) }, 1400)
    const t2 = setTimeout(() => setHint(false), 16000)
    return () => {
      removeEventListener('pointerdown', onPointer)
      removeEventListener('keydown', onKey)
      clearTimeout(t1); clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* remove start listeners' work once started; keep escape-to-close */
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) addEventListener('keydown', onEsc)
    return () => removeEventListener('keydown', onEsc)
  }, [open])

  /* gold ring: poll the player gently while it plays */
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      const p = player.current
      if (!p) return
      try {
        const d = p.getDuration()
        if (d > 0) setProgress(Math.min(100, (p.getCurrentTime() / d) * 100))
      } catch { /* ignore */ }
    }, 500)
    return () => clearInterval(t)
  }, [playing])

  const toggle = () => {
    const p = player.current
    if (!p) { start(); return }
    try { if (playing) p.pauseVideo(); else p.playVideo() } catch { /* ignore */ }
  }

  const song = OUR_SONGS[idx]

  return (
    <div id="ourSongs" className={(open ? 'os-open ' : '') + (playing ? 'os-playing' : '')}>
      <div className="os-panel" role="dialog" aria-label="Our songs" aria-hidden={!open}>
        <div className="os-head">
          <div>
            <div className="os-eyebrow">from him · always</div>
            <div className="os-title">our songs</div>
          </div>
          <button className="os-x" aria-label="Close (the music keeps playing)" onClick={() => setOpen(false)}>×</button>
        </div>
        <svg className="os-swash" viewBox="0 0 130 14" aria-hidden="true">
          <path d="M4 8 C 30 12, 46 4, 65 8 C 84 12, 100 4, 126 8" fill="none" stroke="#EEC07A" strokeWidth="1.2" opacity=".7" />
          <circle cx="65" cy="8" r="1.8" fill="#F2A9B4" />
        </svg>
        <div className="os-video">
          <div ref={mount} />
          {!ready && <div className="os-veil">{started ? 'tuning the strings…' : 'tap play to begin ♪'}</div>}
        </div>
        <div className="os-now">
          <div className="os-nowtitle">{song.title}</div>
          <div className="os-nowartist">{song.artist}{note && <> · <i>{note}</i></>}</div>
        </div>
        <div className="os-ctrls">
          <button className="os-skip" aria-label="Previous song" onClick={prev}><IPrev /></button>
          <button className="os-playbtn" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
            {playing ? <IPause /> : <IPlay />}
          </button>
          <button className="os-skip" aria-label="Next song" onClick={next}><INext /></button>
        </div>
        <ul className="os-list">
          {OUR_SONGS.map((s, i) => (
            <li key={s.yt}>
              <button
                className={'os-song' + (i === idx ? ' current' : '')}
                onClick={() => loadIndex(i)}
              >
                <span className="os-num">{ROMAN[i]}</span>
                <span className="os-meta">
                  <span className="os-st">{s.title}</span>
                  <span className="os-sa">{s.artist}</span>
                </span>
                <span className="os-eq" aria-hidden="true"><i /><i /><i /></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="os-foot">more echoes to be added ✦</div>
      </div>

      <div className={'os-hint' + (hint ? ' show' : '')} aria-hidden="true">
        tap anywhere — our song will play ♪
      </div>

      <button
        className="os-disc"
        aria-label={open ? 'Hide our songs' : 'Open our songs'}
        aria-expanded={open}
        onClick={() => { start(); setOpen(!open) }}
      >
        <Vinyl />
        <span className="os-ring" style={{ '--p': progress } as React.CSSProperties} aria-hidden="true" />
      </button>
    </div>
  )
}
