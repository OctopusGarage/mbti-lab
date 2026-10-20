import { test, expect, DRAFT_KEY, answer, language } from './helpers.js'
import { questions } from '../src/data/questions.js'

// Independent golden expectations for an all-A respondent; no production scorer.
const GOLDENS = {
  short: { type:'ENFJ', percents:{EI:{E:53,I:47},NS:{N:53,S:47},FT:{F:53,T:47},JP:{J:53,P:47}} },
  full: { type:'ENFJ', percents:{EI:{E:52,I:48},NS:{N:50,S:50},FT:{F:52,T:48},JP:{J:52,P:48}} },
}
for (const mode of ['short', 'full']) {
  test(`complete every ${mode === 'short' ? 60 : 93} question and persist exact scoring`, async ({ page }) => {
    test.setTimeout(120_000)
    await page.clock.install({ time: new Date('2026-10-20T00:00:00Z') })
    await page.clock.pauseAt(new Date('2026-10-20T00:01:00Z'))
    await page.goto('./')
    await language(page, 'en')
    await page.locator('.cards .start-card').nth(mode === 'short' ? 0 : 1).click()
    const items = mode === 'short' ? questions.filter(q => q.short) : questions
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', String(items.length))
    for (let i = 0; i < items.length; i++) {
      await expect(page.locator('.option-text').first()).toHaveText(items[i].en.a)
      await answer(page, i)
    }
    await expect(page).toHaveURL(/#\/result$/)
    await expect(page.locator('.type-letters')).toHaveText(GOLDENS[mode].type)
    const saved = await page.evaluate(key => ({ result: JSON.parse(localStorage.getItem('mbti_lab_result')), draft: localStorage.getItem(key), handoff: sessionStorage.getItem('mbti_result') }), DRAFT_KEY)
    expect(saved.result).toMatchObject(GOLDENS[mode])
    expect(saved.result.completedAt).toBeGreaterThan(0)
    expect(saved.draft).toBeNull()
    expect(saved.handoff).toBeNull()
    await page.reload()
    await expect(page.locator('.type-letters')).toHaveText(GOLDENS[mode].type)
    await page.locator('.btn-retake').click()
    await expect(page.locator('.last-type')).toContainText(GOLDENS[mode].type)
    await expect(page.locator('.result-completed time')).toBeVisible()
  })
}

test('feedback locks answers; reload, back, exit and restart preserve the correct draft', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-20T00:00:00Z') })
    await page.clock.pauseAt(new Date('2026-10-20T00:01:00Z'))
  await page.goto('./#/test?mode=short')
  await page.locator('.option').first().click()
  await expect(page.locator('.option').first()).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.option').last()).toBeDisabled()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
  await page.reload()
  await expect(page.locator('.option').first()).toHaveAttribute('aria-pressed', 'true')
  await answer(page, 0, 'b')
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  await page.locator('.btn-prev').click()
  await expect(page.locator('.option').last()).toHaveAttribute('aria-pressed', 'true')
  await answer(page, 0)
  await page.locator('.option').last().click()
  await page.locator('.btn-exit').click()
  await page.clock.runFor(300)
  await expect(page).toHaveURL(/#\/$/)
  await page.locator('.home-main > .start-card').click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  await expect(page.locator('.option').last()).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.btn-exit').click()
  page.once('dialog', dialog => dialog.dismiss())
  await page.locator('.cards .start-card').last().click()
  await expect(page).toHaveURL(/#\/$/)
  page.once('dialog', dialog => dialog.accept())
  await page.locator('.cards .start-card').last().click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '93')
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
})

test('storage denial retains an entire completed assessment in memory with an explicit warning', async ({ page }) => {
  test.setTimeout(120_000)
  await page.addInitScript(() => {
    for (const method of ['getItem','setItem','removeItem']) Storage.prototype[method] = () => { throw new DOMException('denied', 'SecurityError') }
  })
  await page.clock.install({ time: new Date('2026-10-20T00:00:00Z') })
    await page.clock.pauseAt(new Date('2026-10-20T00:01:00Z'))
  await page.goto('./#/test?mode=short')
  await expect(page.getByRole('status')).toBeVisible()
  for (let i = 0; i < 60; i++) await answer(page, i)
  await expect(page).toHaveURL(/result\?unsaved=1/)
  await expect(page.locator('.type-letters')).toHaveText('ENFJ')
  await expect(page.getByRole('status')).toBeVisible()
  await page.locator('.btn-retake').click()
  await expect(page.locator('.last-type')).toContainText('ENFJ')
})

test('corrupt persisted state is rejected and missing results have a recovery link', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(key => { localStorage.setItem(key, '{broken'); localStorage.setItem('mbti_lab_result', JSON.stringify({type:'BAD'})) }, DRAFT_KEY)
  await page.reload()
  await expect(page.getByRole('status')).toBeVisible()
  await expect(page.locator('.home-main > .start-card')).toHaveCount(0)
  await page.goto('./#/result')
  await expect(page.locator('.no-result')).toBeVisible()
  await page.locator('.no-result a').click()
  await expect(page.locator('.cards .start-card')).toHaveCount(2)
})
