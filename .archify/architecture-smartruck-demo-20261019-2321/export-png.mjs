import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const playwrightModule = pathToFileURL(
  "C:/Users/Martín Reimundo/.config/opencode/node_modules/playwright/index.mjs",
).href;
const { chromium } = await import(playwrightModule);
const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error("Usage: node export-png.mjs <diagram.html> <output.png>");
}

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

try {
  const context = await browser.newContext({
    acceptDownloads: true,
    colorScheme: "light",
  });
  const page = await context.newPage();
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto(pathToFileURL(resolve(inputPath)).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts?.ready);
  await page.locator("#btn-export").click();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator('button[data-format="png"]').click(),
  ]);
  await download.saveAs(resolve(outputPath));

  const png = await readFile(resolve(outputPath));
  if (!png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error(`Archify export did not produce a PNG: ${outputPath}`);
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  console.log(JSON.stringify({ output: resolve(outputPath), width, height, bytes: png.length }));
} finally {
  await browser.close();
}
