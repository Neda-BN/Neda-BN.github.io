#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES = [
  'simplebooking.html',
  'healthcare.html',
  'pos-app.html',
  'mobile-app.html',
  'backoffice.html',
  'ui-design-02.html',
  'ui-design-03.html',
  'ui-design-10.html',
  'ui-design-11.html',
  'about.html',
];

const CLASSES = [
  'cs-quote',
  'cs-caption',
  'cs-summary',
  'cs-card',
  'cs-stat',
  'cs-compare',
  'cs-learn',
  'cs-table',
  'cs-list',
  'cs-aside',
  'cs-platform',
  'cs-legend',
  'cs-meta-strip',
];

const PROPS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'color',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRadius',
  'marginTop',
  'marginBottom',
];

function snap(el) {
  const cs = getComputedStyle(el);
  const o = {};
  for (const p of PROPS) o[p] = cs[p];
  return o;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.emulateMedia({ reducedMotion: 'reduce' });

const report = {};
const imageReport = {};

for (const file of PAGES) {
  const url = `http://127.0.0.1:8890/${file}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  report[file] = {};
  imageReport[file] = [];

  for (const cls of CLASSES) {
    const data = await page.evaluate((className) => {
      const el = document.querySelector(`.${className}`);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const pick = (p) => cs[p];
      const props = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'color',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'borderTopWidth',
        'borderRadius',
        'marginTop',
        'marginBottom',
      ];
      const out = {};
      for (const p of props) out[p] = pick(p);
      return out;
    }, cls);
    report[file][cls] = data;
  }

  const imgs = await page.evaluate(() =>
    [...document.querySelectorAll('main img, .content img, .sb-case img, .hero-image img')]
      .slice(0, 3)
      .map((img) => ({
        src: img.getAttribute('src')?.slice(-40),
        w: img.offsetWidth,
        h: img.offsetHeight,
        nw: img.naturalWidth,
        nh: img.naturalHeight,
      })),
  );
  imageReport[file] = imgs;

  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  imageReport[file].overflow = overflow.scrollW <= overflow.clientW + 1;
}

await browser.close();

console.log('\n=== Computed styles per class (first match per page) ===\n');
for (const cls of CLASSES) {
  console.log(`\n## ${cls}`);
  const rows = PAGES.map((f) => ({ page: f, ...(report[f][cls] || { missing: true }) }));
  console.table(rows.map(({ page, missing, ...rest }) => ({ page, ...(missing ? { status: 'missing' } : rest) })));

  const present = rows.filter((r) => !r.missing);
  if (present.length < 2) continue;
  const keys = PROPS;
  let ok = true;
  for (const k of keys) {
    const vals = new Set(present.map((r) => r[k]).filter(Boolean));
    if (vals.size > 1) {
      ok = false;
      console.log(`  MISMATCH ${cls}.${k}:`, [...vals]);
    }
  }
  if (ok) console.log(`  OK: all present pages match for ${cls}`);
}

console.log('\n=== Sample images (first 3 per page) ===');
console.log(JSON.stringify(imageReport, null, 2));

const outPath = path.join(ROOT, 'scripts/.cs-audit-report.json');
fs.writeFileSync(outPath, JSON.stringify({ report, imageReport }, null, 2));
console.log('\nWrote', outPath);
