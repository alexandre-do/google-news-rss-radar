import { chromium } from "playwright";

const OUT = "/private/tmp/claude-501/-Users-alexandredo-Desktop-GIT-scraping/0e2a964e-4112-4088-a48c-d29472483531/scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(err.message));

await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForSelector(".article-table");
await page.screenshot({ path: `${OUT}/search-initial.png` });

await page.fill(".search-bar input", "vin");
await page.click(".search-bar button");
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/search-results.png` });

const firstRow = await page.$(".article-table tbody tr");
if (firstRow) {
  await firstRow.click();
  await page.waitForSelector(".detail-panel");
  await page.screenshot({ path: `${OUT}/search-detail.png` });
}

await page.goto("http://localhost:5173/trends", { waitUntil: "networkidle" });
await page.waitForSelector(".article-table");
await page.screenshot({ path: `${OUT}/trends.png` });

console.log("console/page errors:", JSON.stringify(errors));
await browser.close();
