#!/usr/bin/env node
/**
 * Collect unique first computed font-family names from visible text nodes per page.
 */
import { chromium } from 'playwright';

const BASE = process.env.FONT_AUDIT_BASE || 'http://127.0.0.1:8890';
const PAGES = [
  'index.html',
  'about.html',
  'simplebooking.html',
  'healthcare.html',
  'pos-app.html',
  'mobile-app.html',
  'backoffice.html',
  ...Array.from({ length: 12 }, (_, i) => `ui-design-${String(i + 1).padStart(2, '0')}.html`),
];

const collectFonts = `(() => {
  const fonts = new Set();
  const walk = (el) => {
    if (!(el instanceof Element)) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
    const text = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE
      ? el.textContent.trim() : '';
    const hasDirectText = text.length > 0;
    const isTextLeaf = el.children.length === 0 && (el.textContent || '').trim().length > 0;
    if (hasDirectText || isTextLeaf || ['H1','H2','H3','H4','P','A','LI','TD','TH','SPAN','STRONG','CITE','FIGCAPTION','BUTTON','LABEL'].includes(el.tagName)) {
      const t = (el.textContent || '').trim();
      if (t.length > 0) {
        const first = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
        fonts.add(first);
      }
    }
    for (const c of el.children) walk(c);
  };
  walk(document.body);
  return [...fonts].sort();
})()`;

const browser = await chromium.launch({ headless: true });
const results = {};

for (const pagePath of PAGES) {
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE}/${pagePath}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(400);
    results[pagePath] = await page.evaluate(collectFonts);
  } catch (e) {
    results[pagePath] = { error: String(e.message || e) };
  } finally {
    await page.close();
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
