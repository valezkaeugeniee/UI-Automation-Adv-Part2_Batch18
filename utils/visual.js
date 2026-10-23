const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const { expect } = require('chai');

const BASELINE_DIR = 'screenshots/baseline';
const ACTUAL_DIR = 'screenshots/actual';
const DIFF_DIR = 'screenshots/diff';

async function stabilizePage(driver) {
  // Matikan animasi/transisi
  await driver.executeScript(`
    const style = document.createElement('style');
    style.innerHTML = '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }';
    document.head.appendChild(style);
  `);

  // Tunggu semua gambar selesai dimuat
  await driver.wait(async () => {
    return driver.executeScript(
      `return Array.from(document.images).every(img => img.complete && img.naturalWidth > 0);`
    );
  }, 10000);

  // Jeda singkat supaya render settle
  await driver.sleep(300);
}

async function assertVisualMatch(driver, name, threshold = 0.02) {
  [BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

  const baselinePath = path.join(BASELINE_DIR, `${name}.png`);
  const actualPath = path.join(ACTUAL_DIR, `${name}.png`);

  await stabilizePage(driver); // <-- ini yang tadi kurang

  const base64 = await driver.takeScreenshot();
  fs.writeFileSync(actualPath, Buffer.from(base64, 'base64'));

  // Baseline dibuat otomatis kalau belum ada atau UPDATE_BASELINE=1
  if (process.env.UPDATE_BASELINE === '1' || !fs.existsSync(baselinePath)) {
    fs.copyFileSync(actualPath, baselinePath);
    return;
  }

  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const actual = PNG.sync.read(fs.readFileSync(actualPath));

  expect(
    { w: actual.width, h: actual.height },
    `Ukuran screenshot '${name}' beda dengan baseline`
  ).to.deep.equal({ w: baseline.width, h: baseline.height });

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const changed = pixelmatch(
    baseline.data, actual.data, diff.data,
    baseline.width, baseline.height,
    { threshold: 0.1 }
  );
  const ratio = changed / (baseline.width * baseline.height);

  if (ratio > threshold) {
    fs.writeFileSync(path.join(DIFF_DIR, `${name}_diff.png`), PNG.sync.write(diff));
  }
  expect(ratio, `Visual regression '${name}': ${(ratio * 100).toFixed(2)}% piksel beda`)
    .to.be.at.most(threshold);
}

module.exports = { assertVisualMatch };