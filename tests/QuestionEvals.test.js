// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LOCALES, QUESTION_ARTIFACT, ROOT, loadQuestionSuite, selectQuestionCheckpoint, validateQuestionEvaluation, validateQuestionResponse } from '../scripts/eval-questions.mjs'

// Synthetic validator input, deliberately not claimed to be a semantic review.
function fixture(suite = loadQuestionSuite()) {
  return {
    schemaVersion: 1, evaluatedAt: new Date().toISOString(),
    provenance: { method: 'codex-cli', evaluator: 'Synthetic validation fixture only; no linguistic judgment.' },
    sourceHashes: suite.sourceHashes,
    results: LOCALES.map(locale => ({
      locale, evaluator: 'Synthetic validation fixture only', model: null,
      limitations: ['Fixture checks validation behavior; it does not review translations.'],
      reviews: suite.cases[locale].map(q => ({ id: q.id, a: 'pass', b: 'pass', issues: [] })),
    })),
  }
}

function expectInvalid(change, pattern) {
  const artifact = fixture()
  change(artifact)
  const verdict = validateQuestionEvaluation(artifact)
  expect(verdict.passed).toBe(false)
  expect(verdict.errors.join('\n')).toMatch(pattern)
}

describe('question semantic review validation', () => {
  it('requires complete unique coverage of all 93 pairs in all six locales', () => {
    expect(validateQuestionEvaluation(fixture())).toMatchObject({ passed: true, reviewedPairs: 558, errors: [] })
    expectInvalid(a => a.results.pop(), /six|Missing/)
    expectInvalid(a => { a.results[1] = structuredClone(a.results[0]) }, /duplicate|Missing/)
    expectInvalid(a => a.results[0].reviews.pop(), /93/)
    expectInvalid(a => { a.results[0].reviews[1] = structuredClone(a.results[0].reviews[0]) }, /duplicate|missing/)
    expectInvalid(a => { a.results[0].reviews[0].id = 94 }, /unknown|missing/)
  })

  it('rejects stale and incomplete source hashes', () => {
    expectInvalid(a => { a.sourceHashes['src/data/questions.js'] = '0'.repeat(64) }, /Stale/)
    expectInvalid(a => { a.sourceHashes['src/data/translations/ko.questions.json'] = '0'.repeat(64) }, /Stale/)
    expectInvalid(a => { delete a.sourceHashes['evals/questions.rubric.json'] }, /coverage|Stale/)
    expectInvalid(a => { a.sourceHashes.extra = '0'.repeat(64) }, /coverage/)
  })

  it('resumes the first real source-current checkpoint even when it reports an issue', () => {
    const suite = loadQuestionSuite()
    const artifact = fixture(suite)
    const passing = artifact.results[0]
    passing.completedAt = '2026-10-20T10:02:00Z'
    const failing = structuredClone(passing)
    failing.completedAt = '2026-10-20T10:01:00Z'
    const q = suite.cases.es[0]
    failing.reviews[0] = { id: 1, a: 'issue', b: 'pass', issues: [{ option: 'a', kind: 'meaning', sourceQuote: q.source.a, translationQuote: q.translation.a, explanation: 'Synthetic checkpoint finding verifies that failures cannot be replaced by a later pass.', suggestedTranslation: 'Synthetic validator replacement only.' }] }
    const candidates = [passing, failing].map(response => ({ schemaVersion: 1, sourceHashes: suite.sourceHashes, response }))
    expect(selectQuestionCheckpoint('es', suite, candidates)).toBe(failing)
    expect(failing.completedAt).toBe('2026-10-20T10:01:00Z')
    const stale = structuredClone(candidates[1])
    stale.sourceHashes['src/data/translations/es.questions.json'] = '0'.repeat(64)
    expect(selectQuestionCheckpoint('es', suite, [stale])).toBeNull()
    expect(selectQuestionCheckpoint('es', suite, [stale, candidates[0]])).toBe(passing)
  })

  it('requires honest metadata and individual option verdicts', () => {
    expectInvalid(a => { a.provenance.method = 'static-counts' }, /provenance/)
    expectInvalid(a => { a.evaluatedAt = 'not a date' }, /provenance/)
    expectInvalid(a => { a.results[0].limitations = [] }, /metadata/)
    expectInvalid(a => { delete a.results[0].reviews[0].b }, /verdict/)
    expectInvalid(a => { a.results[0].reviews[0].a = 'issue' }, /verdict/)
    const suite = loadQuestionSuite()
    expect(validateQuestionResponse(null, 'es', suite.cases.es)).toEqual(['Invalid es evaluator metadata'])
  })

  it('retains an exact evidence-backed issue as a failing judgment', () => {
    const suite = loadQuestionSuite()
    const artifact = fixture(suite)
    const question = suite.cases.es[0]
    artifact.results[0].reviews[0] = {
      id: 1, a: 'issue', b: 'pass',
      issues: [{ option: 'a', kind: 'meaning', sourceQuote: question.source.a, translationQuote: question.translation.a,
        explanation: 'Synthetic issue used only to test evidence and failure handling.', suggestedTranslation: 'Synthetic replacement used only by this validator fixture.' }],
    }
    const verdict = validateQuestionEvaluation(artifact, suite)
    expect(verdict).toMatchObject({ passed: false, errors: [] })
    expect(verdict.findings).toHaveLength(1)
    expect(verdict.findings[0]).toMatchObject({ locale: 'es', id: 1, option: 'a' })
    artifact.results[0].reviews[0].issues[0].translationQuote = 'Fabricated source quotation'
    expect(validateQuestionEvaluation(artifact, suite).errors.join('\n')).toMatch(/fabricated/)
    artifact.results[0].reviews[0].issues[0].translationQuote = question.translation.a
    artifact.results[0].reviews[0].issues[0].explanation = 'Bad'
    expect(validateQuestionEvaluation(artifact, suite).errors.join('\n')).toMatch(/unexplained/)
  })
})

it('stores actual current linguistic judgments for all 558 question pairs', () => {
  const artifact = JSON.parse(readFileSync(`${ROOT}/${QUESTION_ARTIFACT}`, 'utf8'))
  expect(artifact.provenance.evaluator).toMatch(/Six independent/)
  expect(validateQuestionEvaluation(artifact)).toMatchObject({ passed: true, errors: [], findings: [], reviewedPairs: 558 })
  expect(artifact.results.every(r => Date.parse(r.completedAt) >= Date.parse(r.startedAt))).toBe(true)
})
