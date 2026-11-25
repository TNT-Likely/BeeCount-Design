const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
const deps = createRequire(path.resolve(__dirname, '../../../source/package.json'));
const { chromium } = deps('playwright');
const sharp = deps('sharp');
const root = path.dirname(__dirname);
const output = process.env.BEECOUNT_CPP_OUTPUT ? path.resolve(process.env.BEECOUNT_CPP_OUTPUT) : root;
const copy = require('../copy.json');
const sizes = [[1206, 2622], [1284, 2778]];
const scenes = ['transaction', 'server', 'backup'];

async function uri(file, mime) {
  return 'data:' + mime + ';base64,' + (await fs.readFile(path.join(__dirname, file))).toString('base64');
}

function imageName(scene) {
  return String(scenes.indexOf(scene) + 1).padStart(2, '0') + '-' + scene + '.png';
}

async function contactSheet() {
  const cells = [];
  const width = 240, height = 522, gap = 6;
  for (const [row, locale] of Object.keys(copy.localizations).entries()) {
    for (const [col, scene] of scenes.entries()) {
      const source = path.join(output, 'exports', '1206x2622', locale, imageName(scene));
      const input = await sharp(source).resize(width, height).png().toBuffer();
      cells.push({ input, left: col * (width + gap), top: row * (height + gap) });
    }
  }
  await sharp({ create: { width: width * 3 + gap * 2, height: height * 3 + gap * 2, channels: 3, background: '#ffffff' } })
    .composite(cells).png({ compressionLevel: 9 }).toFile(path.join(output, 'preview.png'));
}

async function main() {
  const template = await fs.readFile(path.join(__dirname, 'poster.html'), 'utf8');
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: process.platform === 'darwin' ? ['--use-angle=metal'] : [] });
  try {
    for (const [width, height] of sizes) {
      const page = await browser.newPage({ viewport: { width: width / 3, height: height / 3 }, deviceScaleFactor: 3 });
      for (const [locale, content] of Object.entries(copy.localizations)) {
        const out = path.join(output, 'exports', width + 'x' + height, locale);
        await fs.mkdir(out, { recursive: true });
        const fonts = {
          titleFont: await uri('fonts/' + locale + '-title.ttf', 'font/ttf'),
          captionFont: await uri('fonts/' + locale + '-caption.ttf', 'font/ttf'),
        };
        for (const scene of scenes) {
          const values = { ...fonts, scene, language: locale, screen: await uri('screens/' + locale + '/' + scene + '.png', 'image/png') };
          await page.setContent(template.replace(/{{(\w+)}}/g, (_, key) => values[key]));
          await page.evaluate(async ({ lines, caption }) => {
            const labels = [...document.querySelectorAll('h1 span')];
            labels.forEach((node, i) => { node.textContent = lines[i]; });
            document.querySelector('p').textContent = caption;
            await Promise.all([document.fonts.load('800 48px PosterTitle', lines.join('')), document.fonts.load('500 14px PosterCaption', caption), document.querySelector('img').decode()]);
            await document.fonts.ready;
            const frame = document.querySelector('.frame').getBoundingClientRect();
            if (document.querySelector('header').getBoundingClientRect().bottom + 7 > frame.top) throw new Error('Headline overlaps the screenshot');
            for (const node of [...labels, document.querySelector('p')]) {
              const range = document.createRange(); range.selectNodeContents(node);
              const box = range.getBoundingClientRect();
              if (box.right > innerWidth - 12 || box.left < 10) throw new Error('Caption exceeds the canvas');
            }
          }, { lines: content.headlines[scene], caption: content.details[scene] });
          const shot = await page.screenshot({ animations: 'disabled' });
          await sharp(shot).removeAlpha().toColourspace('srgb').withIccProfile('srgb')
            .png({ compressionLevel: 9 }).toFile(path.join(out, imageName(scene)));
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  await contactSheet();
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
