// Hands in this repo's GTA VI trophy guide for make.fun's gta6-trophy-guide-01.
// The guide itself is plain static files in app/ (index.html, style.css, app.js and
// data/trophies.json) — a desktop browser opens it with no build step and no network,
// and the tracker keeps its ticks in localStorage. This script only packages it:
// it copies app/ and screenshots/ next to this file into the output folder and writes
// dossier.json there, using the vendored make.fun helper. Leave vendor/ alone — the
// judge expects dossier.json to be exactly what that helper produces.
// Run locally with Node 22 like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own limits (from its gate): text_max_bytes is the only one that
// shapes the bytes; the rest refuse an entry the scorer would refuse — more than
// 4 screenshots, one over 256 KiB, more than 993 entries or 48 MiB under app/.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
