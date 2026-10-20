import { test, expect, TYPES, sample, seedResult, language } from './helpers.js'

for (const locale of ['zh','en']) {
  test(`all sixteen ${locale} reports render and contents navigate accessibly`, async ({ page }) => {
    for (const type of TYPES) {
      await page.goto(`./#/types?type=${type}`)
      await language(page, locale)
      await expect(page.locator('.type-letters')).toHaveText(type)
      await expect(page.locator('.dim-bars')).toHaveCount(0)
      await expect(page.locator('.report-section')).toHaveCount(7)
      for (const id of ['core','daily','friendship','close','work','blindspots','growth']) {
        await page.locator('[data-section="' + id + '"]').click()
        await expect(page.locator('#report-' + id + ' > p')).not.toBeEmpty()
      }
      await page.locator('[data-section="growth"]').click()
      await expect(page.locator('#report-growth')).toHaveAttribute('open', '')
      await expect(page.locator('#report-growth summary')).toBeFocused()
      await expect(page.locator('.growth-action')).toHaveCount(3)
      await page.locator('.dock-contents').click()
      await expect(page.locator('.report-contents button').first()).toBeFocused()
    }
  })
}

test('search, deep links, invalid types, neighbor links and browser history preserve query and private results', async ({ page }) => {
  await seedResult(page)
  const saved = await page.evaluate(() => localStorage.getItem('mbti_lab_result'))
  await page.goto('./#/types?q=infj')
  await expect(page.locator('.type-chip')).toHaveCount(1)
  await page.locator('.type-chip').click()
  await expect(page).toHaveURL(/q=infj&type=INFJ/)
  await page.reload()
  await expect(page.locator('.type-letters')).toHaveText('INFJ')
  await page.locator('.neighbor-type').first().click()
  await expect(page).toHaveURL(/q=infj&type=ENFJ/)
  await page.goBack()
  await expect(page.locator('.type-letters')).toHaveText('INFJ')
  await page.goBack()
  await expect(page.getByRole('searchbox')).toHaveValue('infj')
  await expect(page.locator('.type-chip')).toBeFocused()
  await page.getByRole('searchbox').fill('倡导者')
  await expect(page.locator('.type-chip')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('searchbox')).toHaveValue('倡导者')
  await page.getByRole('searchbox').fill('no such personality')
  await expect(page.locator('.type-chip')).toHaveCount(0)
  await expect(page.getByRole('status')).toBeVisible()
  await page.goto('./#/types?type=bad')
  await expect(page.locator('.type-chip')).toHaveCount(16)
  await expect(page.getByRole('status')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('mbti_lab_result'))).toBe(saved)
})

for (const width of [320,375,768,1280]) {
  test(`bilingual reports and dialog fit ${width}px viewport with dock clearance`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await seedResult(page)
    for (const locale of ['zh', 'en']) {
      await language(page, locale)
      await page.goto('./')
      await expect(page.locator('.cards .start-card')).toHaveCount(2)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await page.goto('./#/types')
      await expect(page.locator('.type-chip')).toHaveCount(16)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await page.goto('./#/result')
      await expect(page.locator('.result-card')).toBeVisible()
      await page.locator('[data-section="growth"]').click()
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await page.locator('.chart-details summary').click()
      await expect(page.locator('.radar-chart canvas')).toBeVisible()
      for (const selector of ['.dim-bars', '.radar-chart']) {
        const box = await page.locator(selector).boundingBox()
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width)
      }
      await page.locator('.btn-retake').scrollIntoViewIfNeeded()
      const dock = await page.locator('.report-dock').boundingBox()
      const retake = await page.locator('.btn-retake').boundingBox()
      expect(retake.y + retake.height).toBeLessThanOrEqual(dock.y)
      expect(dock.y + dock.height).toBeLessThanOrEqual(800)
      await page.locator('.dock-share').focus()
      await page.locator('.dock-share').press('Enter')
      const sheet = await page.locator('.sp-sheet').boundingBox()
      expect(sheet.width).toBeLessThanOrEqual(width)
      await page.keyboard.press('Escape')
      await expect(page.locator('.dock-share')).toBeFocused()
      await page.locator('.chart-details summary').click()
    }
  })
}

test('production chunks load report, chart and PNG renderer only when requested', async ({ page }) => {
  const chunks = []
  page.on('request', request => { if (/\/assets\/.*\.js/.test(request.url())) chunks.push(request.url()) })
  await page.goto('./', { waitUntil:'networkidle' })
  expect(chunks.filter(url => /ResultView-|ReportDock-|RadarChart-|html2canvas/.test(url))).toEqual([])
  await page.evaluate(result => localStorage.setItem('mbti_lab_result', JSON.stringify(result)), sample)
  await page.goto('./#/result', { waitUntil:'networkidle' })
  await expect(page.locator('.result-card')).toBeVisible()
  expect(chunks.some(url => /ResultView-/.test(url))).toBe(true)
  expect(chunks.filter(url => /RadarChart-|html2canvas/.test(url))).toEqual([])
  await page.locator('.chart-details summary').click()
  await expect(page.locator('.radar-chart canvas')).toBeVisible()
  expect(chunks.some(url => /RadarChart-/.test(url))).toBe(true)
  expect(chunks.some(url => /html2canvas/.test(url))).toBe(false)
  await page.locator('.dock-share').click()
  await page.locator('[data-action="save-image"]').click()
  await expect(page.locator('.export-preview img')).toBeVisible()
  expect(chunks.some(url => /html2canvas/.test(url))).toBe(true)
})
