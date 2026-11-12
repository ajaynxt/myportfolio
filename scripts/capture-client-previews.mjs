import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const targets = [
  { name: "diamond-home", url: "https://diamondrestaurants.com/" },
  { name: "wedding-shedding-home", url: "https://weddingshedding.in/" },
  { name: "safar-sathi-home", url: "https://safarsathi.in/" },
];

const outDir = path.resolve("assets/client-previews");
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
let successes = 0;

for (const target of targets) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 920 },
    deviceScaleFactor: 1,
  });

  try {
    await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);

    // Dismiss common entry / welcome screens when they block the real homepage.
    const enter = page.getByRole("button", { name: /enter studio|enter website|continue to site|view website/i }).first();
    if (await enter.isVisible({ timeout: 1200 }).catch(() => false)) {
      await enter.click({ timeout: 2500 }).catch(() => {});
      await page.waitForTimeout(1800);
    }

    // Click a visible close / dismiss control in a modal before capturing.
    const close = page.getByRole("button", { name: /close|dismiss|not now|no thanks|skip|×/i }).first();
    if (await close.isVisible({ timeout: 800 }).catch(() => false)) {
      await close.click({ timeout: 1800 }).catch(() => {});
      await page.waitForTimeout(700);
    }

    // Remove only remaining fixed, viewport-covering modal layers; do not alter page content.
    await page.evaluate(() => {
      const candidates = [...document.querySelectorAll("body *")];
      for (const el of candidates) {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const area = r.width * r.height;
        const viewportArea = innerWidth * innerHeight;
        const fixedOverlay =
          (s.position === "fixed" || s.position === "sticky") &&
          Number(s.zIndex || 0) >= 10 &&
          area > viewportArea * 0.18 &&
          (s.backgroundColor !== "rgba(0, 0, 0, 0)" || s.backdropFilter !== "none");
        if (fixedOverlay && el !== document.body && el !== document.documentElement) {
          el.remove();
        }
      }
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(900);
    await page.evaluate(async () => {
      await document.fonts.ready;
      const images = [...document.images].filter(img => img.getBoundingClientRect().top < innerHeight);
      await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 5000);
      })));
    });

    await page.screenshot({
      path: path.join(outDir, target.name + ".webp"),
      type: "webp",
      quality: 82,
      animations: "disabled",
      fullPage: false,
    });
    successes++;
    console.log("Captured clean homepage hero:", target.url);
  } catch (error) {
    console.error("Could not capture", target.url, error.message);
  } finally {
    await page.close();
  }
}

await browser.close();
if (successes === 0) process.exit(1);
