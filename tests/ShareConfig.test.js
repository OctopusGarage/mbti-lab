import { afterEach, expect, it, vi } from 'vitest'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'
afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})
it('keeps the canonical URL independent of the local host and preview base', async () => {
  vi.stubEnv('BASE_URL', '/preview/')
  const { APP_URL } = await import('../src/config.js')
  expect(APP_URL).toBe('https://octopusgarage.github.io/mbti-lab')
})
it.each([
  ['https://example.org', 'https://example.org/#/types?type=INFJ'],
  [
    'https://example.org/mbti-lab/',
    'https://example.org/mbti-lab/#/types?type=INFJ',
  ],
  [
    'https://example.org/mbti-lab?answers=private#/result',
    'https://example.org/mbti-lab/#/types?type=INFJ',
  ],
])('builds a type-only link with base %s', async (base, expected) => {
  const { typeShareUrl } = await import('../src/config.js')
  expect(typeShareUrl('infj', base)).toBe(expected)
})
it('rejects invalid type values instead of copying arbitrary payloads', async () => {
  const { typeShareUrl } = await import('../src/config.js')
  for (const type of ['', null, 'INFJ&answers=a', ['INFJ'], '__proto__'])
    expect(() => typeShareUrl(type)).toThrow()
})
it('uses the central address through interpolation in both languages', () => {
  for (const messages of [zh, en]) {
    expect(messages.share.xTextResult).toContain('{url}')
    expect(messages.share.xTextApp).toContain('{url}')
    expect(JSON.stringify(messages)).not.toContain('octopusgarage.github.io')
  }
})

it('keeps the selected language in a public type link without leaking URL state', async () => {
  const { typeShareUrl } = await import('../src/config.js')
  expect(typeShareUrl('infj', 'https://example.org/app?answers=secret#/result', 'pt-BR')).toBe('https://example.org/app/#/types?type=INFJ&lang=pt')
  expect(typeShareUrl('infj', 'https://example.org', '../bad')).toBe('https://example.org/#/types?type=INFJ')
})
