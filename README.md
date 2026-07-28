# her echoes ✦ v3

One link. One kingdom. **https://batcodes.github.io/her_echoes/**

The contemporary remake is now the site: Vite + React + TypeScript,
WebGL starfield with camera push-through and comet trails, Lenis inertial
scroll, GSAP choreography, matter-js jar physics — and the enchanted ink,
the quill, and every word of the tale, carried over whole.

## What lives where

```
/                    ← the BUILT site (what GitHub Pages serves)
/assets              ← ⚠ the site's JS, CSS and fonts — the page is blank without it
/app                 ← the source code (edit here)
/app/src/content.ts  ← every word on the site lives in this one file
/app/src/lib/ink.ts  ← the enchanted ink & travelling quill
/app/src/lib/motion.ts ← the motion language — one hand animates everything
```

## Editing the words

Everything she reads is in **`app/src/content.ts`**. Then:

```bash
cd app
npm install        # first time only
npm run dev        # live preview
npm run release    # og + build + sync into the repo root → commit & push
```

Adding a song = one entry in `OUR_SONGS` (YouTube id + optional backup id).

## The tale (the beloved single-file original)

Preserved forever in git history — last shipped as **v1.8** at commit
`31370f3` (`index.html`, fully self-contained). To resurrect it instantly:

```bash
git show 31370f3:index.html > index.html   # then commit & push
```

## Notes

- **Privacy** — `noindex` meta + `robots.txt`.
- **Tiers** — full WebGL sky + physics on capable devices; calm CSS sky
  elsewhere; `prefers-reduced-motion` honored throughout.
- **Music** — YouTube requires one tap before sound; the vinyl hint covers it.
  The visible mini-player sits in the glass panel; audio keeps playing when closed.
- **Verification** — every visual change gets screenshot-verified (phone
  viewport, real interactions) before it ships. Hard-won rule.
- If the page ever shows *“a piece of the sky is missing”*, the `assets/`
  folder didn't make it up — re-upload it.

made under one sky ✦
