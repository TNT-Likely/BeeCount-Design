const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const sharp = require('sharp');
const locales = require('./locales.json');

const output = path.join(__dirname, '..', 'build');
const searchSafe = { left: 836, top: 765, right: 3004, bottom: 1795 };
const headerSafe = { left: 1097, top: 493, right: 2743, bottom: 1154 };

function checkSafe(label, bounds, safe) {
  if (bounds.left < safe.left || bounds.top < safe.top ||
      bounds.right > safe.right || bounds.bottom > safe.bottom) {
    throw new Error(label + ' exceeds the Apple safe area: ' + JSON.stringify(bounds));
  }
}

function writePng(image, fileName) {
  return image.removeAlpha().toColourspace('srgb').withIccProfile('srgb')
    .png({ compressionLevel: 9 }).toFile(path.join(output, fileName));
}

async function dataUri(name, mime) {
  const bytes = await fs.readFile(path.join(__dirname, name));
  return 'data:' + mime + ';base64,' + bytes.toString('base64');
}

async function renderHeader() {
  const crop = { left: 320, top: 174, width: 1200, height: 514 };
  // Bounding box of the bee and ledger in the untrimmed master.
  const subject = { left: 678, top: 344, right: 1162, bottom: 517 };
  const scaleX = 3840 / crop.width;
  const scaleY = 1646 / crop.height;
  checkSafe('Header', {
    left: (subject.left - crop.left) * scaleX,
    right: (subject.right - crop.left) * scaleX,
    top: (subject.top - crop.top) * scaleY,
    bottom: (subject.bottom - crop.top) * scaleY
  }, headerSafe);
  const master = sharp(path.join(__dirname, 'art', 'header-scene.png'));
  await writePng(master.extract(crop).resize(3840, 1646, { fit: 'fill', kernel: 'lanczos3' }), 'BeeCount-Header.png');
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  await renderHeader();
  const template = await fs.readFile(path.join(__dirname, 'search.html'), 'utf8');
  const background = await dataUri('art/search-background.png', 'image/png');
  const scale = 4;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 640 }, deviceScaleFactor: scale });
    for (const [locale, copy] of Object.entries(locales)) {
      const inputs = {
        locale, background,
        font: await dataUri(path.join('fonts', copy.titleFont), 'font/ttf'),
        row: await dataUri(path.join('rows', locale + '.png'), 'image/png')
      };
      await page.setContent(template.replace(/{{(\w+)}}/g, (_, key) => inputs[key]), { waitUntil: 'load' });
      const bounds = await page.evaluate(async ({ headline, scale }) => {
        const title = document.querySelector('h1');
        title.textContent = headline;
        await Promise.all([...document.images].map(image => image.decode()));
        await document.fonts.load('800 64px StoreTitle', headline);
        await document.fonts.ready;
        const text = document.createRange();
        text.selectNodeContents(title);
        return [text, document.querySelector('.ticket')].map(item => {
          const box = item.getBoundingClientRect();
          return {
            left: box.left * scale, right: box.right * scale,
            top: box.top * scale, bottom: box.bottom * scale
          };
        });
      }, { headline: copy.headline, scale });
      for (const box of bounds) checkSafe(locale, box, searchSafe);
      const image = await page.screenshot({ type: 'png', animations: 'disabled' });
      await writePng(sharp(image), 'BeeCount-Search-' + locale + '.png');
    }
  } finally {
    await browser.close();
  }
  console.log('PNG exports: ' + output);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
