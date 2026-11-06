/**
 * Ember palette verification via Playwright getComputedStyle.
 * Usage: node scripts/verify-theme.mjs
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const EXPECT = {
  bg: "rgb(18, 16, 17)",
  primary: "rgb(255, 138, 101)",
  accent2: "rgb(243, 217, 164)",
};

function pass(got, exp) {
  return got === exp;
}

async function surface1Rgb(page) {
  return page.evaluate(() => {
    const el = document.createElement("div");
    el.style.cssText =
      "position:absolute;left:-9999px;background:var(--surface-1);width:1px;height:1px;";
    document.body.appendChild(el);
    const c = getComputedStyle(el).backgroundColor;
    el.remove();
    return c;
  });
}

async function pseudoBg(page, sel, pseudo) {
  return page.evaluate(
    ({ sel, pseudo }) => {
      const el = document.querySelector(sel);
      if (!el) return "";
      return getComputedStyle(el, pseudo).getPropertyValue("background-color").trim();
    },
    { sel, pseudo },
  );
}

const suites = [
  {
    file: "index.html",
    tests: async (page) => {
      const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
      const btn = await page
        .locator(".hero-v6__btn--primary")
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      const heroLine = await page
        .locator(".hero-v6__headline-line--accent")
        .evaluate((el) => getComputedStyle(el).color);
      const link = await page
        .locator("a.work-card .work-card__link")
        .first()
        .evaluate((el) => getComputedStyle(el).color);
      const navDot = await pseudoBg(page, '.anna-nav__pill a[aria-current="page"]', "::after");
      const surf = await surface1Rgb(page);
      return [
        ["body background-color", body, EXPECT.bg],
        ['"See my work" button bg', btn, EXPECT.primary],
        ['hero "Then I build them." color', heroLine, EXPECT.primary],
        ['"Read case study" link color', link, EXPECT.primary],
        ["nav active ::after dot bg", navDot, EXPECT.primary],
        ["--surface-1 resolved (sample)", surf, null],
      ];
    },
  },
  {
    file: "about.html",
    tests: async (page) => {
      const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
      return [["body background-color", body, EXPECT.bg]];
    },
  },
  {
    file: "simplebooking.html",
    tests: async (page) => {
      const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
      const phase = await page
        .locator(".cs-v2-phase-label")
        .first()
        .evaluate((el) => getComputedStyle(el).color);
      const pct = await page
        .locator(".sb-glance__pct")
        .first()
        .evaluate((el) => getComputedStyle(el).color);
      const card = await page
        .locator(".cs-match-img.sb-tldr.cs-summary.sb-glance")
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      const tokenSurf = await surface1Rgb(page);
      const navDot = await pseudoBg(page, '.anna-nav__pill a[aria-current="page"]', "::after");
      return [
        ["body background-color", body, EXPECT.bg],
        ['phase label (e.g. "Introduction") color', phase, EXPECT.accent2],
        ['result % (.sb-glance__pct) color', pct, EXPECT.accent2],
        ["summary card (.sb-glance) background", card, tokenSurf],
        ["nav active ::after dot bg", navDot, EXPECT.primary],
      ];
    },
  },
  {
    file: "pos-app.html",
    tests: async (page) => {
      const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
      return [["body background-color", body, EXPECT.bg]];
    },
  },
  {
    file: "backoffice.html",
    tests: async (page) => {
      const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
      return [["body background-color", body, EXPECT.bg]];
    },
  },
];

async function main() {
  const browser = await chromium.launch();
  let failed = false;

  for (const suite of suites) {
    const url = `file://${join(root, suite.file)}`;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(url, { waitUntil: "load" });
    console.log(`\n=== ${suite.file} ===`);
    const rows = await suite.tests(page);
    for (const [label, got, exp] of rows) {
      const ok = exp === null || pass(got, exp);
      if (!ok) failed = true;
      const expStr = exp === null ? "(n/a)" : exp;
      console.log(`  ${ok ? "OK" : "FAIL"}  ${label}`);
      console.log(`       got: ${got}`);
      console.log(`       exp: ${expStr}`);
    }
    await page.close();
  }

  await browser.close();
  if (failed) {
    console.error("\nVerification FAILED.");
    process.exit(1);
  }
  console.log("\nVerification PASSED.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
