const { chromium } = require('../../study-room/node_modules/@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 688, height: 1000 } });
    await page.emulateMedia({ media: 'print' });
    await page.goto(pathToFileURL(path.join(root, 'report.html')).href);
    await page.evaluate(() => Promise.all(Array.from(document.images).map(img => img.decode())));
    const overflow = await page.locator('.page').evaluateAll(pages => pages.map((page, index) => ({ page: index + 1, height: page.clientHeight, content: page.scrollHeight })).filter(page => page.content > page.height + 2));
    if (overflow.length) throw new Error(`Report content exceeds page boundaries: ${JSON.stringify(overflow)}`);
    await page.pdf({ path: path.join(root, 'Mini-Project-2_Technical-Report_Nguyen-Ngoc-Bao-Trung_23IT.B236.pdf'), format: 'A4', preferCSSPageSize: true, printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="width:100%;text-align:center;font:8px Arial;color:#60776d">Mini-Project 2 · Nguyen Ngoc Bao Trung · 23IT.B236 &nbsp; | &nbsp; <span class="pageNumber"></span> / <span class="totalPages"></span></div>' });
    console.log('Created the technical report PDF.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
