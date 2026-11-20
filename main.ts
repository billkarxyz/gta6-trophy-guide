// Leonida Legend — the hand-in program for gta6-trophy-guide-01.
// Node 22, standard library only. It takes this repository's guide
// (app/ plus screenshots/) and lays it out in the output directory the
// grader reads, then writes the dossier the judge reads, using the kit's
// own buildDossier from vendor/makefun-frontend.ts (that file is the
// kit's copy and stays exactly as it is).
//
// Run it the way the grader does, with MAKEFUN_OUTPUT_DIR standing in
// for /output outside the grader's container:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the guide locally while building it with `node serve.ts`,
// then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root: the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader gives us /output; locally MAKEFUN_OUTPUT_DIR stands in.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

function handInGuide(): void {
  mkdirSync(outputDir, { recursive: true });

  // The guide itself: every static file under app/.
  copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));

  // The screenshots, when the repository has them.
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) copyTree(shots, join(outputDir, 'screenshots'));

  // The dossier, built by the kit's library with the scorer's caps:
  // at most 4 screenshots of 256 KiB each, app/ within 993 files and
  // 48 MiB, and the dossier text capped at 160 KiB.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handInGuide();
