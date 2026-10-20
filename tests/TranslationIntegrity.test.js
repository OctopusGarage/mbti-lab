import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import en from '../src/locales/en.json'
import zh from '../src/locales/zh.json'
import { questions } from '../src/data/questions.js'
import { types } from '../src/data/types.js'
import { LOCALES } from '../src/i18n/locales.js'
import { createLocaleLoader } from '../src/i18n/resources.js'
import { getQuestionText, getTypePresentation } from '../src/data/localizedContent.js'
import { getReport, SECTION_IDS } from '../src/utils/report.js'

const assets = import.meta.glob('../src/data/translations/*.json', { eager: true, import: 'default' })
const messages = import.meta.glob('../src/locales/*.json', { eager: true, import: 'default' })
function leaves(value, path = '') {
  return Object.entries(value).flatMap(([key, item]) => typeof item === 'string'
    ? [[`${path}${key}`, item]]
    : leaves(item, `${path}${key}.`))
}
const tokens = text => [...text.matchAll(/\{([a-zA-Z]+)\}/g)].map(match => match[1]).sort()

describe('complete translation assets', () => {
  for (const { code } of LOCALES) {
    it(`${code} covers every UI key, question pair and complete personality report`, async () => {
      const translated = Object.fromEntries(leaves(messages[`../src/locales/${code}.json`]))
      const source = Object.fromEntries(leaves(en))
      expect(Object.keys(translated).sort()).toEqual(Object.keys(source).sort())
      for (const [key, text] of Object.entries(translated)) {
        expect(text.trim(), key).not.toBe('')
        expect(tokens(text), key).toEqual(tokens(source[key]))
      }
      const composer = createI18n({ legacy: false, locale: 'en', messages: { en, zh } }).global
      const loader = createLocaleLoader(async (locale, kind) => kind === 'messages'
        ? messages[`../src/locales/${locale}.json`]
        : assets[`../src/data/translations/${locale}.${kind}.json`])
      if (!['en', 'zh'].includes(code)) {
        const pairs = assets[`../src/data/translations/${code}.questions.json`]
        expect(pairs.map(pair => pair.id)).toEqual(questions.map(question => question.id))
        for (const pair of pairs) expect(Object.keys(pair).sort()).toEqual(['a', 'b', 'id'])
        for (const kind of ['types', 'reports']) expect(Object.keys(assets[`../src/data/translations/${code}.${kind}.json`]).sort()).toEqual(Object.keys(types).sort())
      }
      await loader.prepare(composer, code, '/test')
      await loader.prepare(composer, code, '/types')
      for (const question of questions) {
        const pair = getQuestionText(question, code)
        expect(Object.keys(pair).sort()).toEqual(['a', 'b'])
        expect(pair.a.trim().length).toBeGreaterThan(1)
        expect(pair.b.trim().length).toBeGreaterThan(1)
        if (!['en', 'zh'].includes(code)) {
          expect(pair.a).not.toBe(question.en.a)
          expect(pair.b).not.toBe(question.en.b)
        }
      }
      for (const type of Object.keys(types)) {
        const presentation = getTypePresentation(type, code)
        expect(presentation.nickname.trim().length).toBeGreaterThan(1)
        expect(presentation.strengths).toHaveLength(5)
        expect(presentation.strengths.every(tag => tag.trim().length > 1)).toBe(true)
        const report = getReport(type, code)
        expect(report.highlights).toHaveLength(3)
        expect(report.sections.map(section => section.id)).toEqual(SECTION_IDS)
        expect(report.actions).toHaveLength(3)
        expect(report.sections.every(section => section.text.trim().length > 50)).toBe(true)
        expect(report.actions.every(action => ['context', 'step', 'phrase'].every(key => action[key].trim().length > 2))).toBe(true)
        if (!['en', 'zh'].includes(code)) {
          const english = getReport(type, 'en')
          report.sections.forEach((section, index) => expect(section.text).not.toBe(english.sections[index].text))
        }
      }
    })
  }
})
