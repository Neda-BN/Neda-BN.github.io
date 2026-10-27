#!/usr/bin/env node
/** Add shared cs-* classes to case-study HTML (idempotent). */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const QUOTE_ICON = `<svg class="cs-quote__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>`;

const FILES = [
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

function addClass(html, className, pattern) {
  return html.replace(pattern, (m, pre, existing, post) => {
    if (existing.split(/\s+/).includes(className)) return m;
    return `${pre}${existing} ${className}${post}`;
  });
}

for (const file of FILES) {
  const fp = path.join(ROOT, file);
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');

  html = html.replace(/class="([^"]*\bquote-block\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-quote') ? m : `class="${cls} cs-quote"`,
  );
  html = html.replace(
    /(<div class="[^"]*\bcs-quote\b[^"]*">)\s*(?!<svg class="cs-quote__icon")/g,
    `$1\n        ${QUOTE_ICON}\n        `,
  );

  const summaryPatterns = [
    /\b(sb-tldr|pos-tldr|mob-tldr|bo-tldr|hc-tldr)\b/g,
  ];
  html = html.replace(/class="([^"]*)"/g, (m, cls) => {
    if (!/\b(sb-tldr|pos-tldr|mob-tldr|bo-tldr|hc-tldr)\b/.test(cls)) return m;
    return cls.includes('cs-summary') ? m : `class="${cls} cs-summary"`;
  });

  html = html.replace(/class="([^"]*\baside-note\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-aside') ? m : `class="${cls} cs-aside"`,
  );
  html = html.replace(/class="([^"]*\bsb-legend\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-legend') ? m : `class="${cls} cs-legend"`,
  );
  html = html.replace(/class="([^"]*\b(mob-platform-line|bo-platform-line)\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-platform') ? m : `class="${cls} cs-platform"`,
  );
  html = html.replace(/class="([^"]*\bsb-changes\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-list') ? m : `class="${cls} cs-list"`,
  );
  html = html.replace(/class="([^"]*\brole-list\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-list') ? m : `class="${cls} cs-list"`,
  );
  html = html.replace(/<figcaption(\s|>)/g, '<figcaption class="cs-caption"$1');
  html = html.replace(/class="cs-caption cs-caption"/g, 'class="cs-caption"');
  html = html.replace(/<figcaption class="cs-caption" class="/g, '<figcaption class="cs-caption ');

  html = html.replace(/class="([^"]*\bpain-card\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-card') ? m : `class="${cls} cs-card"`,
  );
  html = html.replace(/class="([^"]*\bfinding-item\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-card') ? m : `class="${cls} cs-card"`,
  );
  html = html.replace(/class="([^"]*\bprocess-step\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-card') ? m : `class="${cls} cs-card"`,
  );
  html = html.replace(/class="([^"]*\bab-card\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-compare') ? m : `class="${cls} cs-compare"`,
  );
  html = html.replace(/class="([^"]*\blesson-item\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-learn') ? m : `class="${cls} cs-learn"`,
  );
  html = html.replace(/class="([^"]*\bsb-principles\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-learn') ? m : `class="${cls} cs-learn"`,
  );

  html = html.replace(
    /class="([^"]*\b(mob-results-grid|results-grid|pain-grid|ab-grid|sb-principles)\b[^"]*)"/g,
    (m, cls) => {
      if (cls.includes('cs-stat-grid') || cls.includes('cs-learn-grid') || cls.includes('cs-card-grid') || cls.includes('cs-compare-grid')) return m;
      if (cls.includes('mob-results-grid') || cls.includes('results-grid')) return `class="${cls} cs-stat-grid"`;
      if (cls.includes('ab-grid')) return `class="${cls} cs-compare-grid"`;
      if (cls.includes('sb-principles')) return `class="${cls} cs-learn-grid"`;
      if (cls.includes('pain-grid')) return `class="${cls} cs-card-grid"`;
      return m;
    },
  );

  html = html.replace(/class="([^"]*\b(mob-result-cell|result-card)\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-stat') ? m : `class="${cls} cs-stat"`,
  );

  html = html.replace(/<table(\s|>)/g, (m, tail) => {
    if (m.includes('cs-table')) return m;
    return `<table class="cs-table"${tail}`;
  });
  html = html.replace(/class="cs-table cs-table"/g, 'class="cs-table"');
  html = html.replace(/<table class="cs-table" class="/g, '<table class="cs-table ');

  html = html.replace(
    /class="([^"]*\b(screen-caption|image-caption|hc-wizard-caption)\b[^"]*)"/g,
    (m, cls) => (cls.includes('cs-caption') ? m : `class="${cls} cs-caption"`),
  );

  html = html.replace(/class="([^"]*\bmeta-strip\b[^"]*)"/g, (m, cls) =>
    cls.includes('cs-meta-strip') ? m : `class="${cls} cs-meta-strip"`,
  );

  fs.writeFileSync(fp, html);
  console.log('tagged', file);
}
