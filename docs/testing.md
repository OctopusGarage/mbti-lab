# Testing and AI evaluation

Use the Node.js version in `.node-version`, then run `npm ci`.

## Local gates

```sh
npm test -- --run
npm run eval:check
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
npm audit --audit-level=high
```

The browser suite starts a local production preview using the built `dist/`. Rebuild after source changes. Test contexts are isolated, use synthetic questionnaire answers/results, and do not publish social posts. Failure reports and browser traces are generated locally and uploaded by CI on failures. These artifacts may include test screenshots and browser storage, so use synthetic data only.

## Automated browser coverage

The production suite executes 58 tests without intentional skips: 30 Chromium, 14 Firefox, and 14 WebKit. It covers both complete 60/93-question flows with fixed scoring expectations; reload/resume/back/exit/restart; denied and corrupt storage; all 16 types in both languages and seven report chapters; query/search/history navigation; clipboard success/fallback, privacy, keyboard focus and dialog isolation; bilingual layouts at 320/375/768/1280 px; and optional report/chart/renderer loading.

All 32 localized type-card exports run in Chromium. Each verifies a real download against preview bytes, decodes a 1080×1080 PNG, checks content fits, and scans its QR for the canonical public app URL. Firefox and WebKit each exercise a representative real export. The clock is explicitly paused before loading assessment pages and advanced through feedback, so assertions do not depend on machine speed. The preview server is owned by the test run; an occupied port fails rather than attaching to an unknown server.

## Evaluation boundaries

The application does not call an LLM at runtime. AI evaluations assess the authored bilingual personality reports. A model judge evaluates their language, type differentiation, practical advice, and limits on claims. These judgments are subjective content reviews, not scientific validation of MBTI or personalized assessment accuracy.

`npm run eval:check` checks the recorded judge artifact against the current source hashes, rubric, complete case coverage, score thresholds, evidence requirements, and critical flags. It does **not** call a model. A content or rubric change invalidates the stored evaluation until a fresh review succeeds.

`npm run eval:ai` requests four parallel model judgments using the locally installed, authenticated Codex CLI and its configured model. Each batch contains four related types in both languages (eight cases), preserving bilingual and within-family comparisons. All 32 cases must pass before the combined artifact is accepted; cross-family differentiation is outside this batched review. The runner records each batch’s evaluator, timing, model when known, and limitations. Each process has a 15-minute timeout. This command may consume the account's model allowance. It must fail when the CLI, authentication, structured response, or validation fails; it must never substitute fixed scores. No application user answers or saved results are included in the evaluation input. Review generated judgments before including them in a change.

CI runs unit tests, recorded-evaluation validation, the dependency audit, the production build, and browser E2E tests. It does not have a logged-in Codex session and does not perform fresh model inference. Run the model evaluation locally when report content changes, then include its reviewable artifact with the change.

## Manual checks

Playwright's WebKit engine is not a physical iPhone or the installed Safari application. Real iOS/Android behavior, WeChat image saving/scanning, home-screen installation, and live hosting must still be checked on the relevant devices. Automated QR decoding verifies the encoded URL; it does not establish every phone camera's scan behavior.

The CLI response schema uses the supported subset described in the [official OpenAI Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs#supported-schemas). Stricter local validation still enforces coverage, uniqueness, evidence, thresholds, and freshness after inference.

The implementation-session independent agent review is retained in `evals/agent-review.judgment.json` as a historical pre-fix assessment with honest provenance and limitations. Its old hashes intentionally no longer satisfy the freshness gate. It recorded 32 cases and 128 criterion scores (minimum 4/5, mean 4.67/5), with no critical flags. Its nonblocking findings include awkward wording in the ISFP English action, small INFP/INTP translation drift, and broad legacy share-card strength tags. These observations remain visible in the artifact rather than being hidden by the aggregate score. The CI gate uses `evals/latest.judgment.json`; inspect its provenance to distinguish the accepted review from this additional dated assessment.

The first actual CLI review is preserved in `evals/2026-10-20-initial-cli.judgment.json`. It rejected ENTP and INFP in both languages on bilingual fidelity: the ENTP English action omitted asking permission before offering another perspective; the INFP English action substituted self-assessment for processing emotions. The two English actions were corrected to preserve the Chinese recommendations. This failing historical artifact also intentionally fails the current gate.

Final verification on 2026-10-20: 160 unit/component/tooling tests passed across 20 files; the production build and all 58 browser tests passed again after the translation fixes. Four actual CLI judge batches passed 32/32 cases and 128 scores (minimum 4/5, mean 4.41/5), with no critical flags. The accepted artifact is `evals/latest.judgment.json`, evaluated at `2026-10-20T05:50:22.310Z`; its source hashes and literal evidence passed `npm run eval:check`. Dependency audit reported zero vulnerabilities, workflow syntax passed `actionlint`, and `git diff --check` passed. Nonblocking editorial observations are retained in each case’s findings.

Run `npx playwright show-report` to inspect the latest local HTML report. No remote CI execution, deployment, or physical-device validation is claimed by these local results.
