const { test, expect } = require('@playwright/test');
const path = require('path');

const STUDENT_FILE = process.env.STUDENT_FILE;

test.beforeAll(() => {
  if (!STUDENT_FILE)
    throw new Error('STUDENT_FILE 環境変数が設定されていません');
});

function resolveFileUrl() {
  return `file://${path.resolve(__dirname, '..', STUDENT_FILE)}`;
}

// 空白のゆらぎ（余分なスペース等）だけは許容して比較する
function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// CDN（Babel / esm.sh）の読み込みと React の描画を待つ
async function gotoAndWaitRender(page) {
  await page.goto(resolveFileUrl());
  await page.waitForSelector('.weather-btn', { timeout: 30000 });
  await page.waitForSelector('.weather-label', { timeout: 30000 });
}

test('初期表示でボタンと天気表示が描画される', async ({ page }) => {
  await gotoAndWaitRender(page);
  await expect(page.locator('.weather-btn')).toHaveCount(1);
  await expect(page.locator('.weather-label')).toHaveCount(1);
  expect(normalize(await page.locator('.weather-label').textContent())).toBe(
    'いまの天気: sunny',
  );
});

test('ボタンを3回押すと sunny -> cloudy -> rainy -> sunny と切り替わる', async ({
  page,
}) => {
  await gotoAndWaitRender(page);
  const weather = page.locator('.weather-label');
  const button = page.locator('.weather-btn');

  expect(normalize(await weather.textContent())).toBe('いまの天気: sunny');
  await button.click();
  expect(normalize(await weather.textContent())).toBe('いまの天気: cloudy');
  await button.click();
  expect(normalize(await weather.textContent())).toBe('いまの天気: rainy');
  await button.click();
  expect(normalize(await weather.textContent())).toBe('いまの天気: sunny');
});

test('useState を使って実装している', async ({ page }) => {
  await gotoAndWaitRender(page);
  const html = await page.content();
  expect(/useState\s*\(/.test(html)).toBeTruthy();
});
