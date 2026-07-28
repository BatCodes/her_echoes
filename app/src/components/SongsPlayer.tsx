import { useEffect, useRef, useState } from 'react'
import { OUR_SONGS, PLAYER_VOLUME } from '../content'
import { keepsake, patch } from '../lib/keepsake'
import { unlock, musicNode, musicLevel, sfxOn, setSfx, chime } from '../lib/audio'
import { soft } from '../lib/haptics'

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii']
const LEVEL = PLAYER_VOLUME / 100

/* ─────────────────────────────────────────────────────────────
   our songs · a glass vinyl in the corner — no video, no ads,
   no strangers' servers. The files live in the kingdom itself.
   · starts on her first touch anywhere (pointer, Enter or Space)
   · WebAudio gain does every fade (iOS ignores element.volume)
   · lock screen shows the song via Media Session
   · reopening the site resumes the exact second she left
   · the little gold bell above the disc silences the small
     sounds — never her music
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
const IBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9.5 C6 6 8.6 3.8 12 3.8 C15.4 3.8 18 6 18 9.5 C18 14 19.6 15.4 20.2 16 H3.8 C4.4 15.4 6 14 6 9.5 Z" />
    <path d="M10.2 19 a2 2 0 0 0 3.6 0" />
  </svg>
)

export default function SongsPlayer() {
  const [open, setOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [idx, setIdx] = useState(() => {
    const k = keepsake().player.idx
    return k >= 0 && k < OUR_SONGS.length ? k : 0
  })
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState(0)
  const [hint, setHint] = useState(false)
  const [bell, setBell] = useState(sfxOn)

  const el = useRef<HTMLAudioElement | null>(null)
  const idxRef = useRef(idx)
  const started_ = useRef(false)
  const wired = useRef(false)

  const persist = () => {
    const a = el.current
    if (a) patch({ player: { idx: idxRef.current, pos: a.currentTime || 0 } })
  }

  const setSession = (i: number) => {
    try {
      if (!('mediaSession' in navigator)) return
      const s = OUR_SONGS[i]
      navigator.mediaSession.metadata = new MediaMetadata({
        title: s.title, artist: s.artist, album: 'her echoes ♥',
        artwork: [{ src: './apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      })
    } catch { /* fine */ }
  }

  const ensureEl = (): HTMLAudioElement => {
    if (el.current) return el.current
    const a = new Audio()
    a.preload = 'none'
    a.addEventListener('playing', () => { setPlaying(true); setNote('') })
    a.addEventListener('pause', () => { setPlaying(false); persist() })
    a.addEventListener('ended', () => next())
    a.addEventListener('timeupdate', () => {
      if (a.duration > 0) setProgress(Math.min(100, (a.currentTime / a.duration) * 100))
    })
    a.addEventListener('error', () => {
      setPlaying(false)
      setNote('this song’s file isn’t in the vault yet ✦')
    })
    el.current = a
    return a
  }

  const load = (i: number, pos = 0, play = true) => {
    idxRef.current = i
    setIdx(i)
    setProgress(0)
    setNote('')
    const a = ensureEl()
    /* the fade lives on the WebAudio bus — dip, swap, swell */
    musicLevel(0, 0.25)
    /* base is './' — a relative src resolves against the page itself */
    a.src = OUR_SONGS[i].src
    if (pos > 0) a.currentTime = pos
    setSession(i)
    persist()
    if (play) {
      const p = a.play()
      if (p) p.then(() => {
        if (!wired.current) wired.current = musicNode(a)
        musicLevel(LEVEL, pos > 0 ? 2.2 : 1.2)
      }).catch(() => { /* not allowed yet — she'll touch again */ })
    }
  }

  const next = () => load((idxRef.current + 1) % OUR_SONGS.length)
  const prev = () => load((idxRef.current - 1 + OUR_SONGS.length) % OUR_SONGS.length)

  const start = () => {
    if (started_.current) return
    started_.current = true
    setStarted(true)
    setHint(false)
    unlock()
    /* the record never stopped spinning — resume her exact second */
    load(idxRef.current, keepsake().player.pos || 0)
    try {
      const ms = navigator.mediaSession
      if (ms) {
        ms.setActionHandler('play', () => { el.current?.play().catch(() => {}) })
        ms.setActionHandler('pause', () => { el.current?.pause() })
        ms.setActionHandler('previoustrack', prev)
        ms.setActionHandler('nexttrack', next)
      }
    } catch { /* fine */ }
  }

  /* her first touch anywhere wakes the music */
  useEffect(() => {
    const onPointer = () => start()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') start() }
    addEventListener('pointerdown', onPointer)
    addEventListener('keydown', onKey)
    const t1 = setTimeout(() => { if (!started_.current) setHint(true) }, 1400)
    const t2 = setTimeout(() => setHint(false), 16000)
    const onHide = () => { if (document.hidden) persist() }
    document.addEventListener('visibilitychange', onHide)
    const saver = setInterval(() => { if (el.current && !el.current.paused) persist() }, 5000)
    return () => {
      removeEventListener('pointerdown', onPointer)
      removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onHide)
      clearTimeout(t1); clearTimeout(t2); clearInterval(saver)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) addEventListener('keydown', onEsc)
    return () => removeEventListener('keydown', onEsc)
  }, [open])

  const toggle = () => {
    const a = el.current
    if (!a) { start(); return }
    if (a.paused) {
      a.play().then(() => musicLevel(LEVEL, 1)).catch(() => {})
    } else {
      musicLevel(0, 0.35)
      setTimeout(() => a.pause(), 380)
    }
  }

  const toggleBell = () => {
    const on = !bell
    setBell(on)
    setSfx(on)
    if (on) chime(12, 0.08)
    soft()
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
        <div className="os-now">
          <div className="os-nowtitle">{song.title}</div>
          <div className="os-nowartist">{song.artist}{note && <> · <i>{note}</i></>}</div>
          {!started && <div className="os-waiting">{'touch anywhere and it begins ♪'}</div>}
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
            <li key={s.src}>
              <button
                className={'os-song' + (i === idx ? ' current' : '')}
                onClick={() => load(i)}
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
        className={'os-bell' + (bell ? ' on' : '')}
        aria-label={bell ? 'Silence the small sounds' : 'Let the small sounds ring'}
        aria-pressed={bell}
        onClick={toggleBell}
      >
        <IBell />
      </button>

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
