import { test, expect, CANONICAL, language } from './helpers.js'
import sharp from 'sharp'
import jsQR from 'jsqr'
import { readFile } from 'node:fs/promises'

test('app invitation is scannable and downloadable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto('./')
  await language(page, 'en')
  await page.locator('.btn-share-icon').click()
  const image = page.locator('.qr-share img')
  await expect(image).toBeVisible()
  const src = await image.getAttribute('src')
  const png = Buffer.from(src.split(',')[1], 'base64')
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  expect(jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data).toBe(CANONICAL)
  expect(await page.locator('.sp-sheet').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  const download = page.waitForEvent('download')
  await page.locator('.qr-share a[download]').click()
  const file = await download
  expect(await readFile(await file.path())).toEqual(png)
})

test('result opens with a portrait and branded QR before the report', async ({ page }) => {
  const { seedResult } = await import('./helpers.js')
  await page.setViewportSize({ width: 390, height: 844 })
  await seedResult(page)
  const preview = page.locator('.personality-preview')
  await expect(preview).toBeVisible()
  await expect(preview.locator('.sc-qr')).toBeVisible()
  await expect(preview.locator('.sc-portrait')).toHaveJSProperty('naturalWidth', 360)
  const card = await preview.boundingBox(), report = await page.locator('.result-card').boundingBox()
  expect(card.y).toBeLessThan(report.y)
  expect(await preview.textContent()).not.toContain('https://')
  const src = await preview.locator('.sc-qr').getAttribute('src')
  const { data, info } = await sharp(Buffer.from(src.split(',')[1], 'base64')).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  expect(jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data).toBe(CANONICAL)
  // Colored center pixels prove the logo is present, not just an unbranded QR.
  const middle = (Math.floor(info.height / 2) * info.width + Math.floor(info.width / 2)) * 4
  expect(new Set(data.subarray(middle, middle + 3)).size).toBeGreaterThan(1)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await preview.locator('.sc-portrait').evaluate(el => getComputedStyle(el).animationName)).toBe('none')
})
