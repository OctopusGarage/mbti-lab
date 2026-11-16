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
