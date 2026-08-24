# Ran Online EP9 — Informational Website

A **static, informational-only** website for a RAN Online EP9 private server. It
displays server information, classes, combat modes, roadmap, downloads and
community/social links. It does **not** include any database, backend, API,
login/register, live player counts or live server status — it is a pure
front-end site that renders entirely from a single editable file: **`config.ini`**.

The UI is rendered client-side with **React + ReactDOM (vendored locally in
`public/assets/js/` — no CDN, no runtime fetch)** by
`public/assets/js/site.js`. All content comes from `window.SITE_CONFIG`
(defaults in `assets/js/config.js`, **overridden at build time** by a generated
`assets/js/generated.js` produced from `config.ini`). No framework build step
(Webpack/Vite) is required — the "build" just regenerates that one file and
copies `public/` to `dist/`.

---

## Quick start

```powershell
npm install          # (optional — zero runtime deps; only Node is needed)
npm run dev          # generate config + serve ./public at http://localhost:4173
npm run build        # generate config + copy public/ -> dist/ (production)
npm run preview      # serve the built dist/ site at http://localhost:4173
```

> `npm run dev` / `npm run build` first run `scripts/generate-config.mjs`, which
> reads `config.ini` and writes `public/assets/js/generated.js` (and a mirror at
> `src/config/generated.js`). You never edit `generated.js` by hand.

## Where things live

| Path | Purpose |
|------|---------|
| `config.ini` | **Single source of truth** for all server-specific text/links/images |
| `scripts/generate-config.mjs` | INI parser → `public/assets/js/generated.js` (+ `src/config/generated.js`) |
| `scripts/build-static.mjs` | Copies `public/` → `dist/` (the production static site) |
| `scripts/serve.mjs` | Tiny zero-dependency local static server (`./public` or `./dist`) |
| `scripts/generate-placeholders.mjs` | Regenerates the placeholder PNG art |
| `public/assets/js/config.js` | Default config object (`window.SITE_CONFIG`) |
| `public/assets/js/generated.js` | **`window.SITE_CONFIG` override** built from `config.ini` |
| `public/assets/js/site.js` | The React app (all sections) |
Open `config.ini` in any text editor. Each `[SECTION]` controls a part of the
site. Leave a value empty (e.g. `DiscordUrl=`) to hide that link. Then run
`npm run build`. A list value like `Stat_1=A|B|C` uses the `|` character as a
separator. `[SECTION]` keys such as `Stat_1`, `CLASS_1`, `MODE_1`, `DRIVE_1`,
`MEDIAFIRE_1`, `ROADMAP_1`, `ITEM_1`, `COLUMN_1` are **numbered and extensible**
— add `CLASS_8`, `MODE_5`, `ROADMAP_5`, `DRIVE_3`, `MEDIAFIRE_3`, etc. to add
more items; they will render automatically in order.

### Change the server name
`[SITE]` → `Title=` (also used in the browser tab title, navbar brand and
footer). `Tagline=`, `BrandShort=`, `BrandLong=`, `Logo=`, `Favicon=`,
`Version=`, `Year=` are also here.

### Change the download links
`[DOWNLOAD]` defines mirrors. Each `DRIVE_n` / `MEDIAFIRE_n` entry is
`Label|URL|Note` (e.g. language + client). The Download section renders **every**
mirror you define (the current config shows 4: 2 Google Drive + 2 MediaFire).
Add `DRIVE_3=...` / `MEDIAFIRE_3=...` to add more. `Title=`/`Accent=`/`Intro=`
set the section heading; `DiscordUrl=`/`FacebookUrl=` are optional social links
shown in that section.

```ini
[DOWNLOAD]
Title=GET IN THE
Accent=FIGHT.
Intro=Choose your platform and language.
DRIVE_1=Google Drive (EN)|https://drive.google.com/...|English full client
MEDIAFIRE_1=MediaFire (EN)|https://www.mediafire.com/...|English full client
```

### Change server information
`[SERVER]` → `Intro=` plus numbered `Stat_1=LABEL|VALUE|NOTE` stats and
`Rate_1=LABEL|tier` rate badges (`tier` ∈ `low | lowhalf | mid | highhalf |
high` controls the coloured bar). `[NAV]` → `Items=` is a comma list of section
names shown in the navbar (order matters).

### Change hero content
`[HERO]` → `Title`, `Subtitle`, `Description`, `Background` (image path),
`CtaPlay`, `CtaPlayUrl`, `CtaDownload`.

### Change classes
`[CLASSES]` → numbered `CLASS_n=NAME|ROLE|SPEC|DIFFICULTY(1-5)|IMG|PLAYSTYLE|
PVP_ADVANTAGE|PVP_DISADVANTAGE`.

### Change combat & roadmap
`[COMBAT]` → `Background`, `Intro`, `LiveEventTag/Title/Desc/Schedule`, plus
numbered `MODE_n=NAME|TYPE|CAP|Schedule|HOT(true/false)` and
`RAID_n=NAME|TYPE|LIMIT`.
`[ROADMAP]` → `Background`, `Intro`, `roadprogress=` (1-based current phase),
plus numbered `ROADMAP_n=PHASE|TITLE|STATUS|DONE-point|...`. `STATUS` is shown as
a coloured badge (`IN PROGRESS`, `TBA`, `DONE`, …).

| `public/assets/js/downloads.js` | Fallback download-mirror list (used only if `config.ini` defines none) |
| `public/assets/js/react*.production.min.js` | React + ReactDOM (vendored locally, no CDN) |
| `index.html` | Page shell: CSS theme, fonts, cursors, script load order |
| `public/assets/` | Logos, hero backgrounds, class images, audio, cursors, JS libs |
| `*.csv` (root) | News + Services databases (see below) |
| `public/assets/content/*.txt` | News/tutorial detail bodies |
| `dist/` | Production build output (copy of `public/` + `index.html`) |

---

## Configure the website (all via `config.ini`)
### Change Discord / Facebook / social links
`[COMMUNITY]` → `DiscordUrl`, `FacebookUrl`, `FacebookGroupUrl`,
`Stat_1=VALUE|LABEL`… and `FacebookPage=` (the Facebook page handle used by the
Facebook feed embed). Empty values are hidden automatically (no broken links).
`[FACEBOOK]` → `PageId` (the page handle for the embedded feed),
`Title`, `Accent`, `Background`.

### Change contact / news / services
- **News** (`[NEWS]`): `Title`/`Accent`/`Intro`/`TabAnnouncement`/`TabEvent`/
  `HomeLimit`/`PageSize`, but the actual articles live in **CSV databases**:
  `announcement.csv`, `event.csv` (News/Events) and `tutorial.csv` (Guides),
  each with columns `id,date,title,image,context,hide`. `context` = a `.txt`
  file in `public/assets/content/` used for the detail snippet. Set
  `hide=true` on any row to remove that item from the listing, the Main Page
  preview, the category filter and its generated article page. Empty `hide` =
  visible. Edit the CSVs — no code change needed.
- **Services** (`[SERVICES]`): `Title`/`Accent`/`Intro`/`Background` and
  per-role `ApplyPilots`/`ApplyMiddleman`/`ApplyStreamer` links. The people are
  driven by CSV databases: `pilot.csv`, `middleman.csv`, `streamer.csv`.
- **Footer** (`[FOOTER]`): `Background`, `Tagline`, `Copyright`, and numbered
  `COLUMN_n=TITLE|Label>href|Label2>href2…` link columns.

### Replace images / audio
Drop your own files into `public/assets/` (e.g. `logo.png`, `hero-bg-01.png` …
`hero-bg-10.png`, `class-*.png`, `audio/ranmixed-clean.mp3`) and point the
relevant `config.ini` path at them. SVG/PNG placeholders are included so nothing
renders as a broken image. To regenerate placeholder art:
`npm run genplaceholders`.

### Background music & the "bounce"
`[MUSIC]` → `Enabled`, `Src` (mp3 path), `Title`, `Autoplay`, `Bounce` (master
toggle for the audio-reactive effect), `Aggressive` (extra page bounce driven by
bass/treble), and `LowGain`/`HighGain` multipliers. When music plays, the whole
page content gently pulses to the beat (a real translateY pixel offset + a subtle
scale), and the section glow swings with the bass/treble — the navbar, music
control and trailer stay fixed. Everything collapses to rest when paused.

---

## Test the config workflow (STEP_02 / STEP_05)

Change several values in `config.ini` (e.g. `SITE` → `Title`, `SERVER` →
`Stat_1`, `[DOWNLOAD]` → `DRIVE_1` URL, `[COMMUNITY]` → `DiscordUrl`), then:

```powershell
npm run build
npm run preview
```

Open http://localhost:4173 and confirm the changed values appear (and that empty
social/contact links are hidden). The production build must succeed with no
console errors and no broken assets.

## Deploy / production

`npm run build` outputs a fully static site into `dist/`. Upload the contents of
`dist/` to any static host (Netlify, Vercel, GitHub Pages, Apache, Nginx, etc.).
No server runtime or environment variables are required.

## Requirements checklist

- ✅ No database / SQL Server
- ✅ No RAN game-server connection
- ✅ No API / backend
- ✅ No login / register
- ✅ All server info from `config.ini`
- ✅ Optional empty social/contact links hidden
- ✅ Responsive (desktop, tablet, mobile)
- ✅ Production build succeeds
- ✅ BGM audio-reactivity "bounce" (translateY + glow) working, toggleable in `config.ini`

