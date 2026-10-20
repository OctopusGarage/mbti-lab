import { createI18n } from 'vue-i18n'
import { describe, expect, it, vi } from 'vitest'
import en from '../src/locales/en.json'
import zh from '../src/locales/zh.json'
import { LOCALES, resolveLocale } from '../src/i18n/locales.js'
import { createLocaleLoader } from '../src/i18n/resources.js'

const composer = () => createI18n({ legacy: false, locale: 'zh', messages: { zh, en } }).global
const fixture = kind => kind === 'messages' ? { app: { language: 'Idioma' } } : kind === 'questions' ? [{ id: 1, a: 'A', b: 'B' }] : { INTJ: {} }

describe('locale resources', () => {
  it('lists eight languages and normalizes supported regional variants safely', () => {
    expect(LOCALES.map(l => l.code)).toEqual(['zh','en','es','fr','de','pt','ja','ko'])
    expect(resolveLocale('pt-BR')).toBe('pt')
    expect(resolveLocale('JA-jp')).toBe('ja')
    for (const input of [null, [], 'ar', '../es', 'constructor']) expect(resolveLocale(input)).toBeUndefined()
  })
  it('loads only UI and metadata on home and deduplicates concurrent imports', async () => {
    const calls = []
    const loader = createLocaleLoader(async (locale, kind) => { calls.push(`${locale}:${kind}`); return fixture(kind) })
    const i18n = composer()
    await Promise.all([loader.prepare(i18n,'es','/'), loader.prepare(i18n,'es','/')])
    expect(calls.sort()).toEqual(['es:messages','es:types'])
    expect(i18n.locale.value).toBe('zh')
    expect(i18n.getLocaleMessage('es').app.language).toBe('Idioma')
    await loader.prepare(i18n,'es','/test')
    expect(calls).toContain('es:questions')
    expect(calls).not.toContain('es:reports')
    await loader.prepare(i18n,'es','/types')
    expect(calls.filter(c => c === 'es:reports')).toHaveLength(1)
  })
  it('keeps the current language on a failed import and permits an explicit retry', async () => {
    let failed = true
    const importer = vi.fn(async (_,kind) => { if(kind === 'questions' && failed) throw Error('offline'); return fixture(kind) })
    const loader = createLocaleLoader(importer), i18n = composer()
    await expect(loader.prepare(i18n,'fr','/test')).rejects.toThrow('offline')
    expect(i18n.locale.value).toBe('zh')
    failed = false
    await loader.prepare(i18n,'fr','/test')
    expect(importer.mock.calls.filter(([,kind])=>kind === 'questions')).toHaveLength(2)
  })
  it('does not import translation payloads for the original two languages', async () => {
    const importer = vi.fn()
    const loader = createLocaleLoader(importer)
    await loader.prepare(composer(),'en','/result')
    expect(importer).not.toHaveBeenCalled()
    await expect(loader.prepare(composer(),'unsupported','/')).rejects.toThrow(/unsupported/i)
  })
})
