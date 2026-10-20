import { reactive } from 'vue'
import { registerLocaleData } from '../data/localizedContent.js'
import { resolveLocale } from './locales.js'

const messageImports = import.meta.glob('../locales/{es,fr,de,pt,ja,ko}.json')
const contentImports = import.meta.glob('../data/translations/*.json')
async function importResource(code, kind) {
  const path = kind === 'messages' ? `../locales/${code}.json` : `../data/translations/${code}.${kind}.json`
  const importer = (kind === 'messages' ? messageImports : contentImports)[path]
  if (!importer) throw new Error(`Missing language resource: ${code}:${kind}`)
  return (await importer()).default
}

export function createLocaleLoader(importer = importResource) {
  const loaded = new Map(), pending = new Map()
  async function load(code, kind) {
    const key = `${code}:${kind}`
    if (loaded.has(key)) return loaded.get(key)
    if (!pending.has(key)) {
      const promise = Promise.resolve().then(() => importer(code, kind)).then(value => {
        if (!value || typeof value !== 'object' || (kind === 'messages' && typeof value.app?.language !== 'string') || (kind === 'questions' && !Array.isArray(value))) throw new Error(`Invalid language resource: ${key}`)
        if (kind !== 'messages') registerLocaleData(code, kind, value)
        loaded.set(key, value)
        return value
      }).finally(() => pending.delete(key))
      pending.set(key, promise)
    }
    return pending.get(key)
  }
  async function prepare(composer, requested, path = '/') {
    const code = resolveLocale(requested)
    if (!code) throw new Error('Unsupported language')
    if (code === 'en' || code === 'zh') return code
    const kinds = ['messages', 'types']
    if (path === '/test') kinds.push('questions')
    if (path === '/result' || path === '/types') kinds.push('reports')
    const values = await Promise.all(kinds.map(kind => load(code, kind)))
    composer.setLocaleMessage(code, values[0])
    return code
  }
  return { prepare }
}
export const localeLoader = createLocaleLoader()
export const languageNavigation = reactive({ failedRoute: '', revision: 0 })
