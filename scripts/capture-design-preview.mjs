import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Local review artifacts are intentionally separate from deployed-site captures.
const baseURL = process.env.MBTI_PREVIEW_URL || 'http://127.0.0.1:4199/mbti-lab/'
const directory = new URL('../docs/images/design/', import.meta.url)
await mkdir(directory, { recursive: true })
const screenshots = []
const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort())
  const response = await page.goto(baseURL, { waitUntil: 'networkidle' })
  expect(response.status()).toBe(200)
  const entry = (await response.text()).match(/src="([^"]+\.js)"/)?.[1]
  expect(entry).toBeTruthy()

  async function capture(file, description, fullPage = false) {
    await page.evaluate(() => document.fonts.ready)
    await page.mouse.move(0, 0)
    await page.screenshot({ path: fileURLToPath(new URL(file, directory)), fullPage, animations: 'disabled' })
    screenshots.push({ file, description, viewport: page.viewportSize(), locale: await page.locator('html').getAttribute('lang'), url: page.url() })
  }

  await expect(page.locator('.cards .start-card')).toHaveCount(2)
  await capture('home-desktop.png', 'Local production build: Chinese desktop home', true)
  await page.setViewportSize({ width: 390, height: 844 })
  await capture('home-mobile.png', 'Local production build: Chinese mobile home', true)
  await page.locator('.lang-toggle').selectOption('en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('.lang-toggle')).toBeEnabled()
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 60_000))
  await page.locator('.cards .start-card').first().click()
  for (let index = 0; index < 60; index++) {
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(index + 1))
    if (index === 6) await capture('assessment-mobile.png', 'Local English assessment, question 7 of 60')
    await page.locator('.option').first().click()
    await page.clock.runFor(300)
  }
  await expect(page.locator('.type-letters')).toHaveText('ENFJ')
  await page.clock.resume()
  // A real pointer interaction clears the programmatically focused heading.
  await page.mouse.click(12, 80)
  await capture('report-mobile.png', 'Local ENFJ report computed from scripted all-A answers')
  await page.locator('.dock-share').click()
  await capture('share-mobile.png', 'Local mobile share sheet')
  await page.locator('[data-action="save-image"]').click()
  const preview = page.locator('.export-preview img')
  await expect(preview).toBeVisible({ timeout: 60_000 })
  const png = await preview.getAttribute('src')
  expect(png).toMatch(/^data:image\/png;base64,/)
  await writeFile(new URL('share-card.png', directory), Buffer.from(png.split(',')[1], 'base64'))
  screenshots.push({ file: 'share-card.png', description: 'Unmodified local PNG export from the scripted assessment', locale: 'en', type: 'ENFJ', url: page.url() })

  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.goto(`${baseURL}#/types?lang=zh`)
  await expect(page.locator('.type-chip')).toHaveCount(16)
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh')
  await capture('library-desktop.png', 'Local Chinese library with all 16 types', true)
  expect(errors, 'uncaught browser errors').toEqual([])
  await writeFile(new URL('capture.json', directory), `${JSON.stringify({
    capturedAt: new Date().toISOString(),
    source: 'Local production preview; not a deployed-site capture',
    baseURL, entry, browser: browser.version(),
    sample: 'All A answers to the 60-question assessment; demonstration only, not a personal assessment.',
    screenshots,
  }, null, 2)}\n`)
  console.log(`Captured ${screenshots.length} local design previews in docs/images/design/ from ${entry}`)
} finally {
  await browser.close()
}
