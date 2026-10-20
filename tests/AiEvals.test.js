// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { ROOT } from '../scripts/eval-lib.mjs'
import { loadSuite, validateEvaluation } from '../scripts/eval-lib.mjs'

function validArtifact() {
  const suite = loadSuite()
  return {
    schemaVersion: 1,
    evaluatedAt: new Date().toISOString(),
    provenance: {
      method: 'codex-agent-review', evaluator: 'Synthetic validator test fixture; not a semantic review', model: null,
      limitations: ['Fixture tests validation only; the stored judgment is reviewed separately.'],
    },
    sourceHashes: suite.sourceHashes,
    results: suite.cases.map((item) => {
      const counterpart = suite.cases.find((c) => c.type === item.type && c.locale !== item.locale)
      const neighbor = suite.cases.find((c) => c.type !== item.type && c.locale === item.locale)
      const evidence = (c) => ({ caseId: c.id, path: 'report.sections.0.text', quote: c.report.sections[0].text.slice(0, 50) })
      return {
        id: item.id, reportHash: item.reportHash,
        criteria: Object.fromEntries(Object.keys(suite.rubric.criteria).map((key) => [key, {
          score: 4,
          rationale: `Validator fixture for ${item.id} ${key}; semantic judgment is deliberately not inferred here.`,
          evidence: [evidence(item), ...(key === 'bilingualFidelity' ? [evidence(counterpart)] : key === 'typeDifferentiation' ? [evidence(neighbor)] : [])],
        }])),
        criticalFlags: [], findings: [],
      }
    }),
  }
}

function rejects(change, message) {
  const artifact = validArtifact()
  change(artifact)
  const verdict = validateEvaluation(artifact)
  expect(verdict.passed).toBe(false)
  expect(verdict.errors.join('\n')).toMatch(message)
}

describe('stored AI judgment gate', () => {
  it('accepts complete current supported evidence without pretending to judge semantics', () => {
    expect(validateEvaluation(validArtifact())).toMatchObject({ passed: true, errors: [] })
  })
  it('requires all 32 unique type and language cases', () => {
    rejects((a) => a.results.pop(), /32|missing/i)
    rejects((a) => { a.results[1] = structuredClone(a.results[0]) }, /duplicate|missing/i)
  })
  it('rejects stale sources, case snapshots and rubric hashes', () => {
    rejects((a) => { a.sourceHashes['src/data/reportContent.js'] = '0'.repeat(64) }, /stale.*source/i)
    rejects((a) => { a.sourceHashes['evals/rubric.json'] = '0'.repeat(64) }, /stale.*source/i)
    rejects((a) => { a.results[0].reportHash = '0'.repeat(64) }, /stale.*report/i)
  })
  it('cannot average away a low score or any critical flag', () => {
    rejects((a) => { a.results[0].criteria.editorialSafety.score = 3 }, /below|threshold/i)
    rejects((a) => { a.results[0].criticalFlags = ['unsafe_advice'] }, /critical/i)
  })
  it('rejects missing, fabricated and irrelevant evidence', () => {
    rejects((a) => { a.results[0].criteria.actionability.evidence = [] }, /evidence|minItems/i)
    rejects((a) => { a.results[0].criteria.editorialSafety.evidence[0].quote = 'A fabricated quote absent from the source.' }, /quote/i)
    rejects((a) => { a.results[0].criteria.editorialSafety.evidence[0].path = '__proto__.x' }, /path/i)
    rejects((a) => { a.results[0].criteria.bilingualFidelity.evidence.pop() }, /other language|counterpart/i)
    rejects((a) => { a.results[0].criteria.typeDifferentiation.evidence.pop() }, /other type|comparison/i)
  })
  it('fails closed on malformed and unexplained judgments', () => {
    for (const value of [null, {}, [], { results: null }]) expect(validateEvaluation(value).passed).toBe(false)
    rejects((a) => { a.results[0].criteria.actionability.rationale = 'Good' }, /rationale|minLength/i)
    rejects((a) => { a.results[0].criteria.actionability.score = 4.5 }, /integer/i)
    rejects((a) => { a.results[0].criteria.extra = {} }, /unexpected/i)
    rejects((a) => { delete a.provenance }, /provenance|required/i)
    rejects((a) => { a.evaluatedAt = 'yesterday' }, /date/i)
    rejects((a) => { a.sourceHashes.extra = '0'.repeat(64) }, /unexpected/i)
  })
})

it('keeps the CLI response schema within the supported structured output subset', () => {
  const schema = JSON.parse(readFileSync(`${ROOT}/evals/response.schema.json`, 'utf8'))
  expect(JSON.stringify(schema)).not.toContain('uniqueItems')
  const result = schema.properties.results.items
  expect(result.additionalProperties).toBe(false)
  expect(result.required).toEqual(Object.keys(result.properties))
})

it('preserves the last accepted judgment when CLI is missing, exits unsuccessfully or returns malformed JSON', async () => {
  const { mkdtempSync, cpSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { spawnSync } = await import('node:child_process')
  const directory = mkdtempSync(join(tmpdir(), 'mbti-eval-runner-test-'))
  try {
    cpSync(`${ROOT}/evals`, `${directory}/evals`, { recursive: true })
    cpSync(`${ROOT}/src`, `${directory}/src`, { recursive: true })
    cpSync(`${ROOT}/package.json`, `${directory}/package.json`)
    mkdirSync(`${directory}/scripts`)
    for (const name of ['eval-ai.mjs', 'eval-lib.mjs']) cpSync(`${ROOT}/scripts/${name}`, `${directory}/scripts/${name}`)
    const artifactPath = `${directory}/evals/latest.judgment.json`
    const previous = '{"previousAcceptedJudgment":"must survive"}\n'
    writeFileSync(artifactPath, previous)
    const bin = `${directory}/bin`
    mkdirSync(bin)
    const run = () => spawnSync(process.execPath, [`${directory}/scripts/eval-ai.mjs`], {
      encoding: 'utf8', env: { ...process.env, PATH: bin }, timeout: 10000,
    })
    let result = run()
    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/ENOENT/)
    expect(readFileSync(artifactPath, 'utf8')).toBe(previous)
    writeFileSync(`${bin}/codex`, `#!${process.execPath}\nprocess.stdin.resume();process.stderr.write('fixture authentication failure');process.exitCode=7;`, { mode: 0o755 })
    result = run()
    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/exited 7/)
    expect(readFileSync(artifactPath, 'utf8')).toBe(previous)
    writeFileSync(`${bin}/codex`, `#!${process.execPath}\nimport fs from 'node:fs';process.stdin.resume();fs.writeFileSync(process.argv[process.argv.indexOf('--output-last-message')+1],'{invalid');`, { mode: 0o755 })
    result = run()
    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/FAILED/)
    expect(readFileSync(artifactPath, 'utf8')).toBe(previous)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

it('runs four eight-case judges concurrently and accepts only complete independently supported results', async () => {
  const { mkdtempSync, cpSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { spawnSync } = await import('node:child_process')
  const directory = mkdtempSync(join(tmpdir(), 'mbti-eval-batch-test-'))
  try {
    cpSync(`${ROOT}/evals`, `${directory}/evals`, { recursive: true })
    cpSync(`${ROOT}/src`, `${directory}/src`, { recursive: true })
    cpSync(`${ROOT}/package.json`, `${directory}/package.json`)
    mkdirSync(`${directory}/scripts`)
    for (const name of ['eval-ai.mjs', 'eval-lib.mjs']) cpSync(`${ROOT}/scripts/${name}`, `${directory}/scripts/${name}`)
    const bin = `${directory}/bin`
    mkdirSync(bin)
    // A deliberately synthetic judge fixture, only inside this disposable repo.
    // Synchronous start logs + delayed completion prove overlapping processes.
    writeFileSync(`${bin}/codex`, `#!${process.execPath}
import fs from 'node:fs';let input='';process.stdin.on('data',c=>input+=c);process.stdin.on('end',()=>{
const cases=JSON.parse(input.split('CASES:\\n')[1]);
const ids=cases.map(c=>c.id);fs.appendFileSync('calls.jsonl',JSON.stringify({event:'start',ids,run:process.env.FIXTURE_MODE})+'\\n');
const barrier=setInterval(()=>{
const starts=fs.readFileSync('calls.jsonl','utf8').trim().split('\\n').map(JSON.parse).filter(c=>c.event==='start'&&c.run===process.env.FIXTURE_MODE);
if(starts.length<4)return;clearInterval(barrier);
const ev=c=>({caseId:c.id,path:'report.sections.0.text',quote:c.report.sections[0].text.slice(0,50)});
const results=cases.map(c=>({id:c.id,criticalFlags:[],findings:[],criteria:Object.fromEntries(['editorialSafety','bilingualFidelity','typeDifferentiation','actionability'].map(k=>[k,{score:process.env.FIXTURE_MODE==='low'&&c.id==='INTJ.zh'&&k==='actionability'?3:4,rationale:'Synthetic runner fixture checks case aggregation and evidence; it is not an actual editorial assessment.',evidence:[ev(c),...(k==='bilingualFidelity'?[ev(cases.find(p=>p.type===c.type&&p.locale!==c.locale))]:k==='typeDifferentiation'?[ev(cases.find(p=>p.type!==c.type&&p.locale===c.locale))]:[])]}]))}));
if(process.env.FIXTURE_MODE==='missing'&&ids.includes('INTJ.zh'))results.pop();
fs.writeFileSync(process.argv[process.argv.indexOf('--output-last-message')+1],JSON.stringify({evaluator:'Synthetic fixture, never a real semantic review',model:null,limitations:['Synthetic subprocess integration fixture only.'],results}));
fs.appendFileSync('calls.jsonl',JSON.stringify({event:'end',ids})+'\\n');
},10);});`, { mode: 0o755 })
    const artifactPath = `${directory}/evals/latest.judgment.json`
    const run = (mode) => spawnSync(process.execPath, [`${directory}/scripts/eval-ai.mjs`], {
      encoding: 'utf8', env: { ...process.env, PATH: bin, FIXTURE_MODE: mode }, timeout: 10000,
    })
    const success = run('pass')
    expect(success.status, success.stderr).toBe(0)
    const calls = readFileSync(`${directory}/calls.jsonl`, 'utf8').trim().split('\n').map(JSON.parse)
    expect(calls.slice(0, 4).every((c) => c.event === 'start')).toBe(true)
    expect(calls.filter((c) => c.event === 'start').map((c) => c.ids.length)).toEqual([8, 8, 8, 8])
    const accepted = readFileSync(artifactPath, 'utf8')
    const artifact = JSON.parse(accepted)
    expect(artifact.results).toHaveLength(32)
    expect(new Set(artifact.results.map((r) => r.id)).size).toBe(32)
    expect(artifact.provenance.evaluator).toMatch(/four|4/i)
    expect(artifact.provenance.limitations.filter((s) => /Batch \d/.test(s))).toHaveLength(4)
    const missing = run('missing')
    expect(missing.status).toBe(1)
    expect(missing.stderr).toMatch(/8|missing|coverage/i)
    expect(readFileSync(artifactPath, 'utf8')).toBe(accepted)
    const low = run('low')
    expect(low.status).toBe(1)
    expect(low.stderr).toMatch(/threshold/)
    expect(readFileSync(artifactPath, 'utf8')).toBe(accepted)
    expect(JSON.parse(readFileSync(`${directory}/evals/failed.judgment.json`, 'utf8')).results).toHaveLength(32)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
