# Testing and AI evaluation

Use the Node.js version in `.node-version`, then run `npm ci`.

## Local gates

```sh
npm test -- --run
npm run eval:check
npm run eval:questions:check
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
npm audit --audit-level=high
```

The browser suite starts a local production preview using the built `dist/`. Rebuild after source changes. Test contexts are isolated, use synthetic questionnaire answers/results, and do not publish social posts. Failure reports and browser traces are generated locally and uploaded by CI on failures. These artifacts may include test screenshots and browser storage, so use synthetic data only.

## Automated browser coverage

The production suite executes 115 tests without intentional skips: 49 Chromium, 33 Firefox, and 33 WebKit. It covers both complete 60/93-question flows with fixed scoring expectations; reload/resume/back/exit/restart; denied and corrupt storage; all 16 types in all eight languages and seven report chapters; query/search/history navigation; clipboard success/fallback, privacy, keyboard focus and dialog isolation; eight-language layouts at 320/375/768/1280 px; and optional report/chart/renderer loading. Every added language also completes the full 93-question assessment at 320 px, checks each option fits its button, preserves answers across language changes, and restores the language and progress after reload.

All 128 localized type-card exports run in Chromium. Each verifies a real download against preview bytes, decodes a 1080×1080 PNG, checks content fits, and scans its QR for the canonical public app URL. Firefox and WebKit each exercise a representative real export. The clock is explicitly paused before loading assessment pages and advanced through feedback, so assertions do not depend on machine speed. The preview server is owned by the test run; an occupied port fails rather than attaching to an unknown server.

## Evaluation boundaries

The application does not call an LLM at runtime. AI evaluations assess the authored multilingual personality reports. A model judge evaluates their language, type differentiation, practical advice, and limits on claims. These judgments are subjective content reviews, not scientific validation of MBTI or personalized assessment accuracy.

`npm run eval:check` checks the recorded judge artifact against the current source hashes, rubric, complete case coverage, score thresholds, evidence requirements, and critical flags. It does **not** call a model. A content or rubric change invalidates the stored evaluation until a fresh review succeeds.

`npm run eval:ai` requests 16 model judgments through the locally installed, authenticated Codex CLI, with at most four concurrent workers. Each judge reads eight same-language target reports plus eight same-type source references: English for other languages, Chinese for English targets. All 128 cases and 512 criterion scores must pass. Every criterion requires literal evidence from the target; fidelity also requires source-language evidence, and type differentiation requires another same-language type. Differentiation is limited to the other seven targets supplied in that batch. Source hashes include all UI, type metadata and report translations as well as the report model, locale registry, rubric and evaluation code.

The runner records each batch's evaluator, timing, model when known, and limitations. Each process has a 15-minute timeout. This command may consume the account's model allowance. It fails when the CLI, authentication, structured response, or validation fails; it never substitutes fixed scores. A rejected aggregate is retained in `evals/failed.judgment.json` without overwriting the last passing artifact. No user answers or saved results are supplied to the judge.

`npm run eval:questions` separately evaluates all 93 English A/B pairs in each added language (558 pairs, 1,116 options), using independent authenticated CLI linguistic reviews with at most two concurrent workers. It reviews changed or missing banks and reuses the first complete, source-current real judgment, including a failing judgment. It never reruns an unchanged bank to seek a better verdict. Individual verdicts cover meaning, unchanged polarity, explicit qualifiers, and context. Findings retain exact full-option quotations and suggested corrections. `npm run eval:questions:check` validates complete coverage, evidence, source freshness, and zero unresolved findings without calling a model. After corrections, the runner can review selected full banks with `--locales=es,fr`; untouched judgments may be reused only when their source hashes still match. Interrupted calls can resume from source-validated checkpoints. Reused locale judgments retain their original start and completion times; the aggregate timestamp records assembly, not new inference. Reviewers are AI models, so this does not establish measurement equivalence across languages or replace native-speaker and psychometric review.

Question-review history is retained in `evals/questions.initial-findings.json` (18 original option findings), `evals/questions.followup-findings.json` (seven later findings), and `evals/questions.infrastructure-history.json`. The last file records capacity failures and response files lost during earlier cleanup, including a Japanese review with four reported findings whose full evidence was lost. Missing responses were never treated as passing reviews; the final artifact contains complete actual judgments for every bank. Corrections triggered new reviews of the entire affected bank, while unchanged source-current judgments retained their original dates.

CI runs unit tests, recorded report and question-evaluation validation, the dependency audit, the production build, and browser E2E tests. It does not have a logged-in Codex session and does not perform fresh model inference. Run the model evaluation locally when report content changes, then include its reviewable artifact with the change.

## Manual checks

Playwright's WebKit engine is not a physical iPhone or the installed Safari application. Real iOS/Android behavior, WeChat image saving/scanning, home-screen installation, and live hosting must still be checked on the relevant devices. Automated QR decoding verifies the encoded URL; it does not establish every phone camera's scan behavior.

The CLI response schema uses the supported subset described in the [official OpenAI Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs#supported-schemas). Stricter local validation still enforces coverage, uniqueness, evidence, thresholds, and freshness after inference.

The implementation-session independent agent review is retained in `evals/agent-review.judgment.json` as a historical pre-fix assessment with honest provenance and limitations. Its old hashes intentionally no longer satisfy the freshness gate. It recorded 32 cases and 128 criterion scores (minimum 4/5, mean 4.67/5), with no critical flags. Its nonblocking findings include awkward wording in the ISFP English action, small INFP/INTP translation drift, and broad legacy share-card strength tags. These observations remain visible in the artifact rather than being hidden by the aggregate score. The CI gate uses `evals/latest.judgment.json`; inspect its provenance to distinguish the accepted review from this additional dated assessment.

The first actual CLI review is preserved in `evals/2026-10-20-initial-cli.judgment.json`. It rejected ENTP and INFP in both languages on bilingual fidelity: the ENTP English action omitted asking permission before offering another perspective; the INFP English action substituted self-assessment for processing emotions. The two English actions were corrected to preserve the Chinese recommendations. This failing historical artifact also intentionally fails the current gate.

Earlier bilingual release verification on 2026-10-20: 160 unit/component/tooling tests passed across 20 files; the production build and all 58 browser tests passed again after the translation fixes. Four actual CLI judge batches passed 32/32 cases and 128 scores (minimum 4/5, mean 4.41/5), with no critical flags. That release's accepted artifact was evaluated at `2026-10-20T05:50:22.310Z`; its source hashes and literal evidence passed `npm run eval:check`. Dependency audit reported zero vulnerabilities, workflow syntax passed `actionlint`, and `git diff --check` passed. Nonblocking editorial observations are retained in each case’s findings.

Multilingual verification on 2026-10-20: all **182 unit/component/tooling tests across 23 files** and **115 browser tests** passed on the final language assets. The browser matrix includes Chromium, Firefox and WebKit, all six added languages completing 93 questions at 320 px, all 128 report variants, and 128 real PNG downloads with QR decoding. The production build, dependency audit (zero vulnerabilities), `actionlint`, and `git diff --check` passed.

The current report artifact, `evals/latest.judgment.json`, was assembled at `2026-10-20T07:14:43.912Z` and passes all 128 cases and 512 scores (minimum **4/5**, mean **4.56/5**), source freshness and literal-evidence checks. The initial 16-call review met score thresholds but failed two Japanese quotations shorter than the eight-character evidence rule; it is preserved in `evals/2026-10-20-multilingual-initial-cli.judgment.json`. One genuine independent eight-case Japanese review replaced that entire batch, with unchanged input/rubric and no prior scores supplied. The replacement response is archived in `evals/2026-10-20-japanese-evidence-recheck.response.json`; the other 120 original case judgments remain unchanged. The accepted artifact records all 17 calls and the format failure explicitly.

The current question artifact, `evals/questions.judgment.json`, covers **558 pairs and 1,116 option verdicts with zero unresolved findings**, current source hashes, and original per-locale review timestamps. Its aggregate timestamp (`2026-10-20T07:12:03.426Z`) records assembly. Both `npm run eval:check` and `npm run eval:questions:check` pass without fresh model inference. These results describe local verification; remote CI and deployment are recorded separately by GitHub Actions.

Run `npx playwright show-report` to inspect the latest local HTML report. No remote CI execution, deployment, or physical-device validation is claimed by these local results.
