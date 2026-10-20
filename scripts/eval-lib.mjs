import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { getReport } from '../src/utils/report.js'
import { types } from '../src/data/types.js'
import { LOCALES } from '../src/i18n/locales.js'
import { registerLocaleData, getTypePresentation } from '../src/data/localizedContent.js'

export const ROOT = fileURLToPath(new URL('../', import.meta.url))
export const ARTIFACT = 'evals/latest.judgment.json'
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8')
export const hash = (value) => createHash('sha256').update(value).digest('hex')

export function loadSuite() {
  const rubric = JSON.parse(read('evals/rubric.json'))
  const schema = JSON.parse(read('evals/judgment.schema.json'))
  const manifest = JSON.parse(read('evals/cases.json'))
  const codes = LOCALES.map(({ code }) => code)
  const expected = Object.keys(types).flatMap((type) => codes.map((locale) => `${type}.${locale}`))
  if (expected.length !== 128 || manifest.cases.length !== expected.length || new Set(manifest.cases.map((c) => c.id)).size !== expected.length ||
    manifest.cases.some((c) => !expected.includes(c.id) || c.id !== `${c.type}.${c.locale}`)) {
    throw new Error('Eval manifest must cover exactly all 16 types in all eight supported languages')
  }
  const locales = Object.fromEntries(codes.map((locale) => [locale, JSON.parse(read(`src/locales/${locale}.json`))]))
  for (const locale of codes.filter(code => !['zh', 'en'].includes(code))) {
    for (const kind of ['types', 'reports']) registerLocaleData(locale, kind, JSON.parse(read(`src/data/translations/${locale}.${kind}.json`)))
  }
  const cases = manifest.cases.map(({ id, type, locale }) => {
    const payload = {
      id, type, locale,
      report: getReport(type, locale),
      strengthTags: getTypePresentation(type, locale).strengths.slice(0, 4),
      framing: Object.fromEntries(['editorialNote', 'cardLabel', 'cardNote', 'percentNote', 'closeNote', 'neighborNote'].map((key) => [key, locales[locale].report[key]])),
    }
    return { ...payload, reportHash: hash(JSON.stringify(payload)) }
  })
  const sourceHashes = Object.fromEntries(schema.properties.sourceHashes.required.map((path) => [path, hash(read(path))]))
  return { rubric, schema, sourceHashes, cases }
}

function checkSchema(value, schema, path, errors) {
  const allowed = Array.isArray(schema.type) ? schema.type : [schema.type]
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  if (!allowed.includes(type) && !(allowed.includes('integer') && Number.isInteger(value))) {
    errors.push(`${path}: expected ${allowed.join(' or ')}`)
    return
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: invalid enum value`)
  if (type === 'object') {
    for (const required of schema.required ?? []) if (!Object.hasOwn(value, required)) errors.push(`${path}.${required}: required`)
    for (const key of Object.keys(value)) {
      if (schema.properties?.[key]) checkSchema(value[key], schema.properties[key], `${path}.${key}`, errors)
      else if (schema.additionalProperties === false) errors.push(`${path}.${key}: unexpected property`)
    }
  } else if (type === 'array') {
    if (value.length < (schema.minItems ?? 0)) errors.push(`${path}: minItems ${schema.minItems}`)
    if (value.length > (schema.maxItems ?? Infinity)) errors.push(`${path}: maxItems ${schema.maxItems}`)
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) errors.push(`${path}: duplicate values`)
    value.forEach((item, i) => checkSchema(item, schema.items, `${path}.${i}`, errors))
  } else if (type === 'string') {
    if (value.trim().length < (schema.minLength ?? 0)) errors.push(`${path}: minLength ${schema.minLength}`)
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: invalid pattern`)
    if (schema.format === 'date-time' && (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value)))) errors.push(`${path}: invalid date-time`)
  } else if (type === 'number') {
    if (!Number.isFinite(value) || value < (schema.minimum ?? -Infinity) || value > (schema.maximum ?? Infinity)) errors.push(`${path}: number outside allowed range`)
  }
}

function evidenceText(item, path) {
  if (!/^(report\.(highlights\.\d+|sections\.\d+\.text|actions\.\d+\.(context|step|phrase))|strengthTags\.\d+|framing\.(editorialNote|cardLabel|cardNote|percentNote|closeNote|neighborNote))$/.test(path)) return undefined
  return path.split('.').reduce((value, key) => value != null && Object.hasOwn(value, key) ? value[key] : undefined, item)
}

export function validateEvaluation(artifact, suite = loadSuite()) {
  const errors = []
  checkSchema(artifact, suite.schema, 'judgment', errors)
  if (errors.length) return { passed: false, errors }
  if (Date.parse(artifact.evaluatedAt) > Date.now() + 5 * 60 * 1000) errors.push('evaluatedAt: date cannot be in the future')
  for (const [path, digest] of Object.entries(suite.sourceHashes)) {
    if (artifact.sourceHashes[path] !== digest) errors.push(`Stale source hash: ${path}; run a fresh AI evaluation`)
  }
  const byId = new Map(suite.cases.map((c) => [c.id, c]))
  const seen = new Set()
  for (const result of artifact.results) {
    const item = byId.get(result.id)
    if (!item) { errors.push(`Unknown case ${result.id}`); continue }
    if (seen.has(result.id)) errors.push(`Duplicate case ${result.id}`)
    seen.add(result.id)
    if (item.reportHash !== result.reportHash) errors.push(`Stale report hash: ${item.id}`)
    if (result.criticalFlags.length) errors.push(`${item.id}: critical flags ${result.criticalFlags.join(', ')}`)
    for (const [criterion, judgment] of Object.entries(result.criteria)) {
      if (judgment.score < suite.rubric.minimumScore) errors.push(`${item.id}.${criterion}: below threshold ${suite.rubric.minimumScore}`)
      if (!judgment.evidence.some((e) => e.caseId === item.id)) errors.push(`${item.id}.${criterion}: own-case evidence missing`)
      if (criterion === 'bilingualFidelity' && !judgment.evidence.some((e) => {
        const peer = byId.get(e.caseId)
        return peer && peer.type === item.type && peer.locale === (item.locale === 'en' ? 'zh' : 'en')
      })) errors.push(`${item.id}.${criterion}: English source counterpart missing (Chinese counterpart required for English cases)`)
      if (criterion === 'typeDifferentiation' && !judgment.evidence.some((e) => {
        const peer = byId.get(e.caseId)
        return peer && peer.type !== item.type && peer.locale === item.locale
      })) errors.push(`${item.id}.${criterion}: other type comparison missing`)
      for (const evidence of judgment.evidence) {
        const text = evidenceText(byId.get(evidence.caseId), evidence.path)
        if (typeof text !== 'string') errors.push(`${item.id}.${criterion}: invalid evidence case or path ${evidence.caseId}:${evidence.path}`)
        else if (evidence.quote.trim().length < 8 || !text.includes(evidence.quote)) errors.push(`${item.id}.${criterion}: quote not substantiated by ${evidence.caseId}:${evidence.path}`)
      }
    }
  }
  for (const id of byId.keys()) if (!seen.has(id)) errors.push(`Missing case ${id}`)
  const scores = artifact.results.flatMap((r) => Object.values(r.criteria).map((c) => c.score))
  return { passed: errors.length === 0, errors, summary: { cases: seen.size, criterionScores: scores.length, minimumScore: Math.min(...scores), meanScore: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) } }
}

export function validateJudgeResponse(response, cases, references = []) {
  const errors = []
  checkSchema(response, JSON.parse(read('evals/response.schema.json')), 'batch', errors)
  if (errors.length) return errors
  const expected = new Set(cases.map((item) => item.id))
  const supplied = new Set([...cases, ...references].map(item => item.id))
  const seen = new Set()
  for (const result of response.results) {
    if (!expected.has(result.id)) errors.push(`Batch coverage: unexpected case ${result.id}`)
    if (seen.has(result.id)) errors.push(`Batch coverage: duplicate case ${result.id}`)
    seen.add(result.id)
    for (const judgment of Object.values(result.criteria)) {
      for (const evidence of judgment.evidence) if (!supplied.has(evidence.caseId)) errors.push(`Batch evidence references unsupplied case ${evidence.caseId}`)
    }
  }
  for (const id of expected) if (!seen.has(id)) errors.push(`Batch coverage: missing case ${id}`)
  return errors
}
