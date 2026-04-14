import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:3000';
const outputArg = process.argv[3] ?? `screenshots/${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
const outputPath = path.resolve(process.cwd(), outputArg);

await fs.mkdir(path.dirname(outputPath), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForSelector('body', { state: 'visible', timeout: 60_000 });
  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`Saved screenshot to ${outputPath}`);
} finally {
  await browser.close();
}
