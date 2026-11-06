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

const suites = [
  {
    file: "index.html",
    tests: async (page) => {
      const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
      const btn = await page
        .locator(".hero-v6__btn--primary")
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      return [
        ["body background-color", body, EXPECT.bg],
        ['"See my work" button bg', btn, EXPECT.primary],
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
    file: "pos-app.html",
    tests: async (page) => {
      const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
      const phase = await page
        .locator(".cs-v2-phase-label", { hasText: "Introduction" })
        .first()
        .evaluate((el) => getComputedStyle(el).color);
      return [
        ["body background-color", body, EXPECT.bg],
        ['phase label "Introduction" color', phase, EXPECT.accent2],
      ];
    },
  },
  {
    file: "backoffice.html",
    tests: async (page) => {
      const body = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
      const phase = await page
        .locator(".cs-v2-phase-label", { hasText: "Introduction" })
        .first()
        .evaluate((el) => getComputedStyle(el).color);
      return [
        ["body background-color", body, EXPECT.bg],
        ['phase label "Introduction" color', phase, EXPECT.accent2],
      ];
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
