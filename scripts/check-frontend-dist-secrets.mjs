#!/usr/bin/env node
// H06 — reproducible guard: the built frontend bundle must never contain a
// server-only Google Places secret marker. Run after `pnpm --filter
// @bean-stalker/web build` (the `security:frontend` script does both).
//
// The browser Maps JavaScript key and Map ID are EXPECTED in the bundle
// (browser-visible by design, protected Google-side) and are not flagged.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const distDir = path.join(root, 'apps/web/dist');

// Server-only markers that must never appear in a browser bundle.
const FORBIDDEN = [
  'GOOGLE_PLACES_SERVER_KEY',
  'X-Goog-Api-Key',
  'x-goog-api-key',
  'places.googleapis.com', // the server Places endpoint — server code only
];
// Extra sentinels from CI/local secret-leak tests.
const extra = process.env.FRONTEND_SECRET_SENTINELS;
if (extra) FORBIDDEN.push(...extra.split(',').map((s) => s.trim()).filter(Boolean));

if (!fs.existsSync(distDir)) {
  console.error(`frontend-secret-check: ${path.relative(root, distDir)} not found — build first`);
  process.exit(2);
}

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
})(distDir);

const hits = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of FORBIDDEN) {
    if (text.includes(marker)) hits.push(`${path.relative(root, file)} :: ${marker}`);
  }
}

if (hits.length) {
  console.error('frontend-secret-check FAILED — server-only marker in the browser bundle:');
  for (const h of hits) console.error(` - ${h}`);
  process.exit(1);
}

console.log(
  `frontend-secret-check PASSED — scanned ${files.length} file(s) in apps/web/dist, no server-only markers.`,
);
