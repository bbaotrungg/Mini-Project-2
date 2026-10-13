const { chromium, expect } = require('../../study-room/node_modules/@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const output = path.resolve(__dirname, '../screenshots');
fs.mkdirSync(output, { recursive: true });
async function capture(page, filename) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({ path: path.join(output, filename), animations: 'disabled' });
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:8083');
    await page.getByRole('textbox', { name: 'Student name' }).fill('Nguyen Ngoc Bao Trung');
    await page.getByRole('button', { name: 'Find my study space' }).click();
    await expect(page.getByText('Find your focus.', { exact: true })).toBeVisible();
    await page.waitForFunction(() => Array.from(document.images).some(img => img.src.includes('quiet') && img.complete && img.naturalWidth > 0));
    await capture(page, '01-discover-browser.png');
    await page.getByRole('button', { name: /The Quiet Corner, .*4 students/ }).click();
    await page.getByRole('button', { name: /\w{3} \d{1,2} \w{3}/ }).nth(1).click();
    await page.getByRole('button', { name: /07:30–09:30 Available/ }).click();
    await page.getByRole('button', { name: 'Reserve room' }).click();
    await expect(page.getByText('VKU · YOUR BOOKING PASS')).toBeVisible();
    await capture(page, '03-qr-pass-browser.png');
    await page.getByRole('button', { name: 'Close pass' }).click();
    await page.getByRole('button', { name: /07:30–09:30 Booked/ }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: /07:30–09:30 Booked/ })).toBeDisabled();
    await capture(page, '02-slots-browser.png');
    await page.goto('http://localhost:8083/bookings');
    await expect(page.getByRole('button', { name: 'Open booking pass' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Open booking pass' })).toBeVisible();
    await capture(page, '04-bookings-browser.png');
    if (errors.length) throw new Error(errors.join('\n'));
    fs.writeFileSync(path.resolve(__dirname, '../evidence/browser-capture.json'), JSON.stringify({ environment: 'Google Chrome desktop, 390 × 844 CSS pixels; browser preview, not Android/iOS emulator', capturedAt: new Date().toISOString(), student: 'Nguyen Ngoc Bao Trung', screenshots: fs.readdirSync(output), assertions: ['session entry', 'loaded room photo', 'reservation', 'QR pass', 'disabled booked slot', 'reservation persists after reload'], pageErrors: errors }, null, 2));
    console.log('Captured four browser-preview screenshots; no runtime page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
