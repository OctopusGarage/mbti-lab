import { test, expect } from '@playwright/test'

// Desktop engines do not expose physical cutouts. Inject their inset values
// through the same CSS variables used by env(safe-area-inset-*).
for (const device of [
  { name: 'portrait cutout', width: 393, height: 852, top: 59, left: 0, right: 0 },
  { name: 'landscape cutout', width: 852, height: 393, top: 0, left: 59, right: 59 },
  { name: 'ordinary mobile browser', width: 375, height: 812, top: 0, left: 0, right: 0 },
]) {
  test(`${device.name}: all page headers stay inside the safe area`, async ({ page }) => {
    await page.setViewportSize({ width: device.width, height: device.height })
    await page.addInitScript(({ top, left, right }) => {
      document.addEventListener('DOMContentLoaded', () => {
        for (const [edge, value] of Object.entries({ top, left, right })) {
          document.documentElement.style.setProperty(`--safe-area-${edge}`, `${value}px`)
        }
      })
    }, device)
    for (const route of ['/', '/test', '/types', '/result']) {
      await page.goto(`./#${route}`)
      const pageClass = { '/': '.home', '/test': '.test-page', '/types': '.types-page', '/result': '.result-page' }[route]
      await expect(page.locator(`${pageClass} header`)).toBeVisible()
      const controls = page.locator(`${pageClass} header`).locator('select, a, button')
      await expect(controls.first()).toBeVisible()
      for (const control of await controls.all()) {
        const box = await control.boundingBox()
        expect(box.y).toBeGreaterThanOrEqual(device.top)
        expect(box.x).toBeGreaterThanOrEqual(device.left)
        expect(box.x + box.width).toBeLessThanOrEqual(device.width - device.right)
        await control.click({ trial: true })
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(device.width)
    }
  })
}
