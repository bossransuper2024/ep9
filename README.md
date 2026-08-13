# RAN GS Eternity EP9 — Informational Website

A **static, informational-only** website for a RAN Online EP9 private server. It
displays server information (including the config-driven **Item Drop Rate tier**),
classes, combat modes, roadmap, downloads and community links. It does **not**
include any database, backend, API, login/register, live player counts or live
server status — it is a pure front-end site.

The UI is built with **React (loaded from CDN)** and rendered client-side
(`public/assets/js/site.js`); all content is driven by a single editable file:
**`config.ini`**. Change the config, rebuild, and the whole site updates — no
framework build step required (no Vite/Webpack).

---

## Quick start

```powershell
npm run dev      # generate config + serve at http://localhost:4173
npm run build    # generate config + copy public/ -> dist/ (production)
npm run preview  # serve the built dist/ site at http://localhost:4173
```

> `npm run dev` / `npm run build` first run `scripts/generate-config.mjs`, which
> reads `config.ini` and writes `public/assets/js/generated.js`. You never edit
> `public/assets/js/generated.js` by hand.

## Where things live

| Path | Purpose |
|------|---------|
| `config.ini` | **Single source of truth** for all server-specific text/links/images |
| `scripts/generate-config.mjs` | INI parser → `public/assets/js/generated.js` (+ `src/config/generated.js`) |
| `public/assets/js/config.js` | Default config object (`window.SITE_CONFIG`) |
| `public/assets/js/generated.js` | **Generated** config from `config.ini` — overrides defaults at runtime |
| `public/assets/js/site.js` | The React app (all sections: Nav, Hero, Server, Classes, Combat, Roadmap, Download, Community, Facebook, Footer) |
| `public/assets/js/react*.min.js` | React + ReactDOM from CDN (vendored locally) |
| `index.html` | Page shell: CSS theme, fonts, cursor assets, and script load order |
| `public/assets/` | Logos, hero image, cursors, class images, audio, JS libs |
| `dist/` | Production build output (copy of `public/` + `index.html`) |

## Server Information — Item Drop Rate tier

In `config.ini` under `[SERVER]`:

```ini
DropRateTier=Mid      ; Low | Mid | High  (colored badge in the Server section)
DropRate=5x          ; optional multiplier shown under the badge
```

The tier renders as a colored badge: `Low` (blue), `Mid` (gold), `High` (red glow).


---

## Configure the website (all via `config.ini`)

Open `config.ini` in any text editor. Each section controls a part of the site.
Leave a value empty (e.g. `Discord=`) to hide that link. Then run `npm run build`.

### Change the server name
`[SERVER]` → `Name=` (also shows in navbar, footer and the browser tab title).

### Change the 3 download links
Each download has a `Label` (button text) and URL:
```ini
[DOWNLOAD]
Download1=https://your-link-1
Download1Label=Google Drive
Download2=https://your-link-2
Download2Label=MediaFire
Download3=https://your-link-3
Download3Label=Direct Download
```
Exactly three download cards are always rendered.

### Change server information
`[SERVER_INFO]` → `Type`, `MaxLevel`, `MaxRebirth`, `ExpRate`, `DropRateTier`, `DropRate`.

The **Item Drop Rate** is shown in the Server Information stats as a coloured
**Low / Mid / High** tier badge (with an optional multiplier underneath):
```ini
[SERVER_INFO]
DropRateTier=Mid      ; Low | Mid | High — controls the coloured tier badge
DropRate=5x           ; optional multiplier shown under the tier (optional)
```

### Change hero content
`[HERO]` → `Title`, `Subtitle`, `Description`, `Background` (image path).

### Change Discord / Facebook / social links
`[COMMUNITY]` → `Discord`, `Facebook`, `FacebookGroup`, `Youtube`, `Tiktok`.
Empty values are hidden automatically (no broken links).

### Change contact links
`[CONTACT]` → `Email` (rendered as `mailto:`), `Website`.

### Add a feature
Append a new section with the next number:
```ini
[FEATURE_7]
Title=New System
Description=Describe the new system.
Icon=/assets/images/features/ep9.svg
```
At least 6 are defined; you can keep adding `FEATURE_8`, `FEATURE_9`, …

### Add a news item
```ini
[NEWS_3]
Title=Patch Notes
Date=September 1, 2026
Description=What changed in this patch.
Image=/assets/images/news/news1.svg
Link=#
```

### Replace images
Drop your own files into `public/assets/images/` (e.g. `logo.svg`, `hero.svg`,
`features/*.svg`, `news/*.svg`) and point the relevant `config.ini` path at them.
Use `.svg`, `.png`, `.jpg` or `.webp`. SVG placeholders are included so nothing
renders as a broken image.

---

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
