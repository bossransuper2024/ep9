/* ============================================================================
 * build-static.mjs — copies public/ to dist/ (the production static site).
 * The site is already a static site; the only generated artifact is
 * public/assets/js/generated.js (produced by generate-config.mjs).
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'public');
const out = path.join(root, 'dist');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const f = path.join(from, entry.name);
    const t = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(f, t);
    // Overwrite existing files even when a stale handle (e.g. an orphaned
    // dev/preview server) is locking the directory — rmSync would EPERM.
    else fs.copyFileSync(f, t);
  }
}

// Best-effort removal. If a running/orphaned server holds a handle on `dist`
// (Windows EPERM), skip the delete and rely on the copy above to overwrite the
// existing tree in place. This keeps `npm run build` green without needing to
// kill the server first.
if (fs.existsSync(out)) {
  try {
    fs.rmSync(out, { recursive: true, force: true });
  } catch (err) {
    console.warn('[build-static] could not delete dist/ (' + err.code +
      '); overwriting in place instead. Stop any running server to fully clear it.');
  }
}
copyDir(src, out);

// The static site entry is the repo-root index.html (which references
// /assets/...). Copy it into both public/ (for dev) and dist/ (for prod).
const rootIndex = path.join(root, 'index.html');
if (fs.existsSync(rootIndex)) {
  fs.copyFileSync(rootIndex, path.join(src, 'index.html'));
  fs.copyFileSync(rootIndex, path.join(out, 'index.html'));
}

console.log('static build ->', path.relative(root, out));
