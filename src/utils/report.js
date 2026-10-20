import { reportContent } from '../data/reportContent.js'

export const SECTION_IDS = [
  'core',
  'daily',
  'friendship',
  'close',
  'work',
  'blindspots',
  'growth',
]
export { interpretDimensions } from './dimensions.js'
import { DIMENSIONS } from './dimensions.js'

export function getReport(type, locale = 'zh') {
  if (typeof type !== 'string' || !Object.hasOwn(reportContent, type))
    return null
  const language = locale === 'en' ? 'en' : 'zh'
  const index = language === 'en' ? 1 : 0
  const content = reportContent[type]
  return {
    highlights: content.highlights[index],
    sections: SECTION_IDS.map((id, i) => ({ id, text: content[language][i] })),
    actions: content.actions[index].map(([context, step, phrase]) => ({
      context,
      step,
      phrase,
    })),
  }
}

export function getNeighbors(type) {
  if (typeof type !== 'string' || !Object.hasOwn(reportContent, type)) return []
  return DIMENSIONS.map(({ key, letters }, index) => ({
    type:
      type.slice(0, index) +
      letters.find((letter) => letter !== type[index]) +
      type.slice(index + 1),
    dimension: key,
  }))
}
