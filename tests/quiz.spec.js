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
  await page.waitForSelector('.like-btn', { timeout: 30000 });
  await page.waitForSelector('.count-label', { timeout: 30000 });
}

test('初期表示でボタンとカウントが描画される', async ({ page }) => {
  await gotoAndWaitRender(page);
  await expect(page.locator('.like-btn')).toHaveCount(1);
  await expect(page.locator('.count-label')).toHaveCount(1);
  expect(normalize(await page.locator('.count-label').textContent())).toBe(
    'いいね: 0',
  );
});

test('ボタンを3回押すと 0 -> 1 -> 2 -> 3 と増える', async ({ page }) => {
  await gotoAndWaitRender(page);
  const count = page.locator('.count-label');
  const button = page.locator('.like-btn');

  expect(normalize(await count.textContent())).toBe('いいね: 0');
  await button.click();
  expect(normalize(await count.textContent())).toBe('いいね: 1');
  await button.click();
  expect(normalize(await count.textContent())).toBe('いいね: 2');
  await button.click();
  expect(normalize(await count.textContent())).toBe('いいね: 3');
});

test('useState を使って実装している', async ({ page }) => {
  await gotoAndWaitRender(page);
  const html = await page.content();
  expect(/useState\s*\(/.test(html)).toBeTruthy();
});
