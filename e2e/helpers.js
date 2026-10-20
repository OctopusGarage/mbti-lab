import { test as base, expect } from '@playwright/test'

export const TYPES = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
export const CANONICAL = 'https://octopusgarage.github.io/mbti-lab'
export const DRAFT_KEY = 'personality_explorer_draft'
export const sample = { type: 'INFJ', percents: { EI:{E:30,I:70}, NS:{N:65,S:35}, FT:{F:60,T:40}, JP:{J:55,P:45} } }

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('https://static.cloudflareinsights.com/**', route => route.abort())
    await page.addInitScript(() => {
      window.openedURLs = []
      window.open = url => { window.openedURLs.push(url); return null }
    })
    await use(page)
    expect(errors, 'uncaught browser errors').toEqual([])
  },
})
export { expect }

export async function seedResult(page, type = 'INFJ') {
  await page.goto('./')
  await page.evaluate(result => localStorage.setItem('mbti_lab_result', JSON.stringify(result)), { ...sample, type })
  await page.goto('./#/result')
  await expect(page.locator('.result-card')).toBeVisible()
}
export async function language(page, locale) {
  if (await page.locator('html').getAttribute('lang') !== locale) await page.locator('.lang-toggle').selectOption(locale)
  await expect(page.locator('html')).toHaveAttribute('lang', locale)
  await expect(page.locator('.lang-toggle')).toBeEnabled()
}
export async function answer(page, index, choice = 'a') {
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(index + 1))
  await page.locator('.option').nth(choice === 'a' ? 0 : 1).click()
  await page.clock.runFor(300)
}
