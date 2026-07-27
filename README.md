# her echoes ✦ v2

A little kingdom, rebuilt — same words, new sky.

The site is now a **Vite + React + TypeScript** app with a real-time WebGL starfield
(React Three Fiber), inertial scrolling (Lenis), scroll choreography (GSAP +
ScrollTrigger + SplitText), shared-element card morphs (Motion), and a physics
star jar (matter-js). Every quote, timestamp and line of the original is preserved
in one content file.

## Repo layout

```
/                  ← the BUILT site (what GitHub Pages serves — don't edit by hand)
/app               ← the source code (edit here)
/app/src/content.ts  ← every word on the site lives in this one file
/.github/workflows ← optional CI deploy (manual trigger)
```

## Deploying (nothing to change)

GitHub Pages is already set to serve the repo root from `main`. Replace the old
repo contents with this folder, commit, push — done. The built files at the root
are the site.

> Uploading via the GitHub web UI? Hidden files (`.nojekyll`, `.github/`) are
> sometimes skipped by drag-and-drop. `git push` from a clone is the safe route.

## Editing the words

Everything she reads — truths, memories, firsts, confessions, promises, mirror
lines, chat replays, grants, the letter, the songs — is in
**`app/src/content.ts`**. Edit it, then rebuild:

```bash
cd app
npm install        # first time only
npm run dev        # live preview at localhost:5173
npm run release    # build + sync into the repo root → commit & push
```

### Adding a song
Append one entry to `OUR_SONGS` in `content.ts` (YouTube video id + optional
backup id). The player, list and roman numerals update themselves.

## The optional CI route

Prefer not to commit built files? Switch **Settings → Pages → Source** to
**GitHub Actions**, then run the *build & deploy* workflow from the Actions tab.
(Left as manual-trigger so it can't fight the default setup.)

## Quality-of-life notes

- **Privacy** — `noindex` meta + `robots.txt` ask search engines to stay out.
- **Device tiers** — full WebGL sky + physics on capable phones; a calm CSS sky
  and the same content everywhere else; `prefers-reduced-motion` fully honored.
- **Music** — YouTube needs one tap before sound (platform rule); the vinyl hint
  covers it. The mini-player is now visible inside the panel, and audio keeps
  playing when the panel is closed.
- **Images** — the moon/sunset photos stream from Wikimedia/Unsplash with painted
  fallbacks if offline. Moon photo credit (CC BY-SA 3.0, Gregory H. Revera) is in
  the site footer.

made under one sky ✦
