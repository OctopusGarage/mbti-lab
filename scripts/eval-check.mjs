import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ARTIFACT, ROOT, validateEvaluation } from './eval-lib.mjs'

try {
  const artifact = JSON.parse(readFileSync(resolve(ROOT, process.argv[2] ?? ARTIFACT), 'utf8'))
  const verdict = validateEvaluation(artifact)
  if (!verdict.passed) throw new Error(verdict.errors.join('\n'))
  console.log(`Stored AI judgment valid: ${verdict.summary.cases}/32 cases, ${verdict.summary.criterionScores} scores, minimum ${verdict.summary.minimumScore}/5, mean ${verdict.summary.meanScore}/5.`)
  console.log('Deterministic coverage/evidence/freshness validation only; no fresh model judgment was run.')
} catch (error) {
  console.error(`AI judgment gate FAILED: ${error.message}`)
  process.exitCode = 1
}
