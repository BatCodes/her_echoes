# her echoes ✦ v1.6

A little kingdom in **one file**. `index.html` is the whole site — no build,
no framework, nothing to install. Open it anywhere and the tale plays.

## What v1.6 adds (pure addition — nothing removed)

- **Butter** — the enchanted ink is now GPU-composited for body text (the golden
  flash stays on headings and her name, where it reads); long passages write in
  by word; stars draw from pre-baked glow sprites; pixel density adapts to the
  phone. Strictly less work per frame than v1.5.
- **Depth** — three nebula washes drift behind the starfield (indigo mist, faint
  gold, blush) and seven named stars flare and breathe. The night visibly
  deepens as she reads.

## And from v1.5.1

- **Crisp stars** — the sky canvas now renders at the phone's real pixel density
  (it was blurry on every phone before; this was the one true defect).
- **A living sky** — stars drift with her scroll, lean toward her hand on desktop
  and with the phone's tilt on mobile (after her first touch); comets grew real
  glowing tails; the night deepens the further she reads.
- **The unfurl works** — proper OG tags + icons, so sharing the link on WhatsApp
  shows her name under the stars (`og.png`) instead of nothing.
- **The song on a little screen** — the music player now shows the video inside
  the panel (display-only) instead of hiding it.
- **A hum under her thumb** — gentle haptics on the moments that land: evidence
  found, seal broken, meter blown, envelope opened, the letter revealed.

Everything from v1.5 is untouched: the storybook cover, the enchanted ink that
writes every letter onto the page, the stardust, the cream papers, all of it.

## Editing

Open `index.html`. Everything she reads lives in plain arrays near the top of
the main `<script>` — `ITEMS` (eight truths), `MEMS` (star jar), `FIRSTS`,
`CONF`, `PROMISES`, `LINES` (mirror), `DELIV`, `SCENES` (replays), `GRANTS` —
and the songs in `OUR_SONGS` inside the music widget (one line per song:
title, artist, YouTube id, optional backup id).

Change the words → save → upload `index.html` → done. That's the whole pipeline.

## Repo layout

```
index.html           ← the site. the whole site.
og.png               ← the WhatsApp/link preview image
favicon.svg, apple-touch-icon.png, 404.html, robots.txt, .nojekyll
```

GitHub Pages serves the repo root from `main` — upload/commit `index.html`
and it's live in a minute.

## The React experiment

A full Vite/React/WebGL rebuild (v2.1, "the sky finally glows") lives on the
[`v2-react`](../../tree/v2-react) branch — bloom, shader nebula, physics and
all. It taught us the real lesson: this page's magic is the enchanted ink and
the warmth, and one honest file carries them better than a framework.

made under one sky ✦
