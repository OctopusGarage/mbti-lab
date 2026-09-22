import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import zh from '../src/locales/zh.json'
import en from '../src/locales/en.json'

// Exact strings that previously lived as hardcoded `locale === 'zh' ? ... : ...`
// ternaries in TypesView.vue, HomeView.vue and QuestionCard.vue.
// Values must stay byte-identical to the pre-migration rendered output.
const MIGRATED_KEYS = {
  'types.backHome': { zh: '返回首页', en: 'Home' },
  'types.title': { zh: '16 种人格类型', en: '16 Personality Types' },
  'types.backToList': { zh: '返回列表', en: 'All types' },
  'home.browseTypes': { zh: '📖 查看 16 种人格附录', en: '📖 Browse 16 Types' },
  'test.or': { zh: '或', en: 'or' },
}

function get(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

// Collect all leaf key paths (arrays count as leaves) for structural comparison.
function keyPaths(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keyPaths(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

describe('i18n migration of UI strings', () => {
  for (const [key, expected] of Object.entries(MIGRATED_KEYS)) {
    it(`defines "${key}" in both zh.json and en.json with the exact value`, () => {
      expect(get(zh, key)).toBe(expected.zh)
      expect(get(en, key)).toBe(expected.en)
    })
  }

  it('keeps zh.json and en.json key structures identical', () => {
    expect([...keyPaths(zh)].sort()).toEqual([...keyPaths(en)].sort())
  })

  it('renders the exact previous hardcoded strings through vue-i18n', () => {
    for (const locale of ['zh', 'en']) {
      const i18n = createI18n({ legacy: false, locale, messages: { zh, en } })
      for (const [key, expected] of Object.entries(MIGRATED_KEYS)) {
        expect(i18n.global.t(key)).toBe(expected[locale])
      }
    }
  })
})
