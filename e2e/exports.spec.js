import { test, expect, TYPES, CANONICAL, seedResult, language } from './helpers.js'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import jsQR from 'jsqr'

// Every engine exercises one real export in reports.spec.js. The complete
// 16-type × 8-locale raster/QR matrix runs once to keep local and CI cost bounded.
test.describe('PNG export matrix', () => {
  for (const type of TYPES) {
    test(`${type}: all eight localized PNGs fit the card and contain a scannable canonical QR`, async ({ page }) => {
      test.setTimeout(180_000)
      await page.setViewportSize({ width: 320, height: 800 })
      await seedResult(page, type)
      for (const locale of ['zh','en','es','fr','de','pt','ja','ko']) {
        await language(page, locale)
        await page.locator('.dock-share').click()
        await page.locator('[data-action="save-image"]').click()
        const preview = page.locator('.export-preview img')
        await expect(preview).toBeVisible()
        await expect(page.getByRole('alert')).toHaveCount(0)
        const fits = await page.locator('.share-card').evaluate(card => {
          const body = card.querySelector('.sc-body').getBoundingClientRect()
          return [...card.querySelectorAll('.sc-topbar,.sc-hero,.sc-desc,.sc-strengths,.sc-bottom,.sc-footer')].every(element => {
            const box = element.getBoundingClientRect()
            return box.top >= body.top && box.bottom <= body.bottom && box.right <= body.right
          })
        })
        expect(fits, `${type} ${locale}: export content must fit its canvas`).toBe(true)
        const src = await preview.getAttribute('src')
        expect(src).toMatch(/^data:image\/png;base64,/)
        const png = Buffer.from(src.split(',')[1], 'base64')
        const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
        expect([info.width, info.height]).toEqual([1080,1080])
        expect(jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data).toBe(CANONICAL)
        const download = page.waitForEvent('download')
        await page.locator('.export-preview a').click()
        const file = await download
        expect(file.suggestedFilename()).toBe(`mbti-${type}.png`)
        expect(await readFile(await file.path())).toEqual(png)
      }
    })
  }
})
