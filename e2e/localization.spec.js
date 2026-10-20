import { test, expect, DRAFT_KEY, language, answer } from './helpers.js'
import { readFileSync } from 'node:fs'

for (const locale of ['es', 'fr', 'de', 'pt', 'ja', 'ko']) {
  const questions = JSON.parse(readFileSync(new URL(`../src/data/translations/${locale}.questions.json`, import.meta.url)))
  test(`${locale}: mobile full assessment, unchanged answers, stored preference and shared deep link`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('./#/test?mode=full&lang=en')
    await page.clock.install()
    await page.clock.pauseAt(Date.now() + 60_000)
    await answer(page, 0)
    await answer(page, 1, 'b')
    const before = await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)
    await language(page, locale)
    expect(await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)).toBe(before)
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
    const draft = JSON.parse(before)
    // The translated bank preserves the original ordering and scoring metadata.
    const active = await page.locator('.option').first().textContent()
    expect(questions.some(question => active.includes(question.a))).toBe(true)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(draft.currentIndex + 1))
    for (let index = draft.currentIndex; index < 93; index++) {
      const fits = await page.locator('.option-text').evaluateAll(elements => elements.every(element => {
        const text = element.getBoundingClientRect(), button = element.closest('button').getBoundingClientRect()
        return text.left >= button.left && text.right <= button.right && element.scrollWidth <= element.clientWidth + 1
      }))
      expect(fits, `${locale} question ${index + 1}: options fit their buttons at 320px`).toBe(true)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
      await answer(page, index)
    }
    await expect(page.locator('.type-letters')).toHaveText(/^[EI][NS][FT][JP]$/)
    await expect(page.locator('.report-section')).toHaveCount(7)
    await page.goto(`./#/types?type=INFJ&lang=${locale}`)
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.locator('.type-letters')).toHaveText('INFJ')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await page.goto('./')
    await expect(page.locator('.lang-toggle')).toHaveValue(locale)
  })
}

test('a failed locale download keeps the draft and language, then retry completes', async ({ page }) => {
  await page.goto('./#/test?mode=short&lang=en')
  const before = await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)
  await page.route('**/assets/de.questions-*.js', route => route.abort())
  await page.locator('.lang-toggle').selectOption('de')
  await expect(page.locator('.language-message[role="alert"]')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('.lang-toggle')).toHaveValue('en')
  expect(await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)).toBe(before)
  await page.unroute('**/assets/de.questions-*.js')
  await page.locator('.language-message button').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  expect(await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)).toBe(before)
})

test('a blocked preference write still switches language and explains browser-only persistence', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'mbti_lab_locale') throw new DOMException('blocked', 'SecurityError')
      return original.call(this, key, value)
    }
  })
  await language(page, 'fr')
  await expect(page.locator('.language-message[role="status"]')).toBeVisible()
  await expect(page.locator('.lang-toggle')).toHaveValue('fr')
})

test('a superseded language navigation cannot overwrite the newer language', async ({ page }) => {
  await page.goto('./#/test?mode=short&lang=en')
  let release
  const gate = new Promise(resolve => { release = resolve })
  let requested
  const started = new Promise(resolve => { requested = resolve })
  await page.route('**/assets/de.reports-*.js', async route => { requested(); await gate; await route.continue() })
  await page.evaluate(() => { location.hash = '/types?type=INFJ&lang=de' })
  await started
  await page.evaluate(() => { location.hash = '/?lang=en' })
  await expect(page.locator('.cards .start-card')).toHaveCount(2)
  release()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  expect(await page.evaluate(() => localStorage.getItem('mbti_lab_locale'))).toBe('en')
})

test('report download failure on completion retains the finished draft and offers a successful retry', async ({ page }) => {
  await page.goto('./#/test?mode=short&lang=es')
  await page.clock.install()
  await page.clock.pauseAt(Date.now() + 60_000)
  await page.route('**/assets/es.reports-*.js', route => route.abort())
  for (let index = 0; index < 60; index++) await answer(page, index)
  await expect(page.locator('.test-main [role="alert"]')).toBeVisible()
  const draft = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), DRAFT_KEY)
  expect(draft.answers.every(answer => answer === 'a')).toBe(true)
  await page.unroute('**/assets/es.reports-*.js')
  await page.locator('.test-main [role="alert"] button').click()
  await expect(page.locator('.type-letters')).toHaveText('ENFJ')
  expect(await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)).toBeNull()
})

test('only the chosen language and current page resources download', async ({ page }) => {
  const assets = []
  page.on('request', request => { if (/\/assets\//.test(request.url())) assets.push(request.url()) })
  await page.goto('./', { waitUntil: 'networkidle' })
  await language(page, 'fr')
  expect(assets.some(url => /\/fr-[^/]+\.js/.test(url))).toBe(true)
  expect(assets.some(url => /\/fr\.types-/.test(url))).toBe(true)
  expect(assets.filter(url => /\/(es|de|pt|ja|ko)(\.|-)/.test(url))).toEqual([])
  expect(assets.filter(url => /\/fr\.(questions|reports)-/.test(url))).toEqual([])
  await page.locator('.cards .start-card').first().click()
  await expect(page.locator('.option')).toHaveCount(2)
  expect(assets.some(url => /\/fr\.questions-/.test(url))).toBe(true)
  expect(assets.some(url => /\/fr\.reports-/.test(url))).toBe(false)
  await page.evaluate(() => { location.hash = '/types?type=INFJ' })
  await expect(page.locator('.type-letters')).toHaveText('INFJ')
  expect(assets.some(url => /\/fr\.reports-/.test(url))).toBe(true)
})

test('a shared language overrides a saved preference before loading resources', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mbti_lab_locale', 'de'))
  const assets = []
  page.on('request', request => { if (/\/assets\//.test(request.url())) assets.push(request.url()) })
  await page.goto('./#/types?type=INFJ&lang=en', { waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('.type-letters')).toHaveText('INFJ')
  expect(assets.filter(url => /\/de(\.|-)/.test(url))).toEqual([])
})

test('browser navigation supersedes a pending language selection on the same assessment', async ({ page }) => {
  await page.goto('./#/test?mode=short&lang=en')
  let release, requested
  const gate = new Promise(resolve => { release = resolve })
  const started = new Promise(resolve => { requested = resolve })
  await page.route('**/assets/es.questions-*.js', async route => { requested(); await gate; await route.continue() })
  await page.locator('.lang-toggle').selectOption('es')
  await started
  await page.evaluate(() => { location.hash = '/test?mode=short&lang=de' })
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  release()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(page.locator('.lang-toggle')).toHaveValue('de')
  expect(await page.evaluate(() => localStorage.getItem('mbti_lab_locale'))).toBe('de')
})
