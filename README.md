# MBTI Lab

A bilingual MBTI personality test with rich results, share cards, and browser-based delivery.

Your latest result and unfinished assessment are saved in the browser when storage is available. The latest-result summary shows the completion time in the browser’s local time zone and whether that result was saved; legacy or invalid timestamps display an unknown time. The home page lets you resume progress, confirm a restart, or revisit the latest report. If storage is blocked or full, the current page session keeps an in-memory fallback and shows a warning; refreshing or closing the page may lose it.

[![Deploy](https://github.com/OctopusGarage/mbti-lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/OctopusGarage/mbti-lab/actions/workflows/deploy.yml)
[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev)
![License](https://img.shields.io/badge/license-MIT-yellow)

**Live:** https://octopusgarage.github.io/mbti-lab/

## Why

Personality tests often hide the useful report behind registration, ads, or a paywall. MBTI Lab keeps the whole flow in the browser: answer, see the result, export a share card, and leave without giving up personal data.

## Features

- **16 personality types** - four-letter type output with bilingual reflection prompts.
- **Two test lengths** - short mode with 60 questions, full mode with 93 questions.
- **Rich report** - three highlights, seven independently expandable chapters, a contents menu, and three practical actions for each type. A fixed Contents / Share bar stays available while reading, with space reserved below the content.
- **Visual results** - dimension bars show close-proportion labels beside the matching values, with one common explanation; expand the optional ECharts radar only when needed.
- **Sharing** - preview and copy a caption with a public type link, or export a PNG with a QR code back to the app. Clipboard denial offers manual copying; failed exports can be retried. Captions and links contain no answers or personal proportions.
- **Resume and restart** - restore answers and progress after reload, with confirmation before replacing an unfinished test. Return home from the assessment without clearing the draft; saved progress is confirmed only after a successful write.
- **Searchable appendix** - search codes or Chinese/English nicknames; type and search links survive reload and browser back. Explore four adjacent types, each differing by one letter, without changing your saved result.
- **Bilingual** - Chinese and English can be switched at any time.
- **Home-screen support** - manifest and icons support adding the app to a home screen. Offline use is not guaranteed; the app does not currently register a service worker.
- **Private by default** - result history stays in local browser storage.

## Quick Start

Use Node.js 24, as declared in `.node-version` and used by CI and deployment.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173/mbti-lab/`.

Production checks:

```bash
npm test -- --run
npm run eval:check
npm run build
npm run test:e2e:install
npm run test:e2e
```

All pull requests and pushes to `main` run unit tests, stored AI-evaluation validation, a dependency audit, a production build, and Chromium/Firefox/WebKit E2E tests through `.github/workflows/checks.yml`. Failure traces and screenshots are uploaded for debugging. The Pages deployment calls the same verification workflow and waits for all gates before building the publication artifact. See [testing and AI evaluation](docs/testing.md) for coverage, fresh model review, and remaining device checks.

## RalphWorks issue and PR workflows

Maintainers can add `ralphworks:run` to an open issue to start a checked implementation run. A successful run opens a draft PR and requests a model review. Other labels handle PRD sub-issues, dependency queues, PR feedback, and branch updates. This repository checks implementation changes with `npm test -- --run && npm run build`; maintainers review and merge the resulting PRs.

See the [RalphWorks issue and PR workflow guide](https://github.com/OctopusGarage/ralphworks/blob/main/docs/ISSUE_WORKFLOWS.md) for setup, labels, and retry steps.

## Product Flow

| Step | What happens |
|---|---|
| Choose mode | Pick short or full assessment based on time available. |
| Answer questions | Answers and cursor are saved locally; feedback blocks duplicate clicks. |
| Reveal type | The app computes the four MBTI dimensions and shows the type profile. |
| Explore report | Read editorial chapters and actions, or search the 16-type appendix. |
| Share | Export an image card without signing in. |

To start an assessment, choose a test length on the home page — short with 60 questions or full with 93 — and the question loop begins at `/test?mode=short` or `/test?mode=full`. An existing draft keeps its original mode until the user confirms a restart.
After the final question, the app opens the result report at `/result` with the four-letter type, per-dimension percentages, and an optional radar chart, and the last result is kept in local browser storage so the home page can link back to it for later viewing.

## Reliability and validation

Question data and scoring are unchanged: the short test has 60 questions and the full test has 93. Each side is rounded independently (a pair may total 101); a leading side at 50% still wins the original tie rule. The type appendix shows editorial reports without fabricated assessment percentages. The inclusive 45–55% range is a display convention for close proportions, not a statistical confidence interval; it never changes type selection. The radar axes show E, N, F and J proportions, with translated dimension labels alongside.

Drafts are versioned and validated before restoration. Invalid drafts are discarded with a notice. Result storage retains the existing session/history keys and payload format, consumes fresh session results once, and falls back to history or memory when storage operations fail. Clipboard denial exposes a selectable link. The share dialog traps focus, isolates the background, restores focus on close, and supports Escape. The language button has translated action labels and a 44px minimum touch target; the document language follows the UI locale. The question progress bar exposes its label, current question and total to assistive technology. Layouts account for narrow screens, safe areas, and reduced motion.

Validation on 2026-10-20:

- `npm test -- --run`: 160 tests passed across 20 files, including both complete questionnaire flows, reload/resume/restart, feedback timers, denied storage, stale history, chart cleanup, clipboard fallback, export retry/language races, report content for all 16 types in both languages, 45/55 boundaries, query-backed appendix navigation, accessible controls, canonical share URLs, clipboard races, fixed report actions, adjacent-type navigation, exit/resume during feedback, result completion dates and persistence state, inline close labels, evaluation freshness/evidence gates, and CLI failure preservation.
- `npm run build`: passed without the former >500 kB chunk warning; the optional radar is in its own chunk.
- `npm run test:e2e`: 58 tests passed with no skips or retries (Chromium 30, Firefox 14, WebKit 14). Each engine completes both 60/93-question assessments and covers recovery, reports, sharing, responsive layouts, and optional loading. Chromium additionally checks all 32 localized PNG downloads, image dimensions, layout fit, and decoded canonical QRs. The strengthened shared-report loading guard also passed a final three-engine targeted run.
- `npm audit --audit-level=high`: 0 vulnerabilities after compatible dependency updates.
- `npm run eval:ai`: four actual parallel Codex CLI reviews passed all 32 bilingual report cases and 128 criterion scores (minimum 4/5, mean 4.41/5; no critical flags). The first review found and rejected two English translation defects in ENTP/INFP actions; those were fixed before the complete reevaluation. `npm run eval:check` then passed current source hashes, evidence and coverage validation. Historical reviews and nonblocking wording observations remain available in `evals/`.
- Local headless Chrome against the production build: no horizontal overflow at 320, 375, 768, and 1280 px; dialog focus and background isolation verified. Search, deep-link refresh, browser back, independent report chapters, and contents focus were checked. The earlier full export pass covered all 16 types in both languages (32 PNGs with decoded QRs). The latest report-action pass verified dock clearance, contents focus, dialog focus return, copy success/fallback, adjacent-type navigation and result isolation at all four widths in both languages, and rechecked two representative 1080×1080 PNGs and canonical QR targets.

The final polish pass also checked the home summary, assessment exit/resume, saved-progress warnings, and inline close labels at 320, 375, 768, and 1280 px in both languages. Legacy timestamps and denied writes were exercised; no completion date was invented and stored results remained unchanged.

Browser verification uses synthetic results. Physical iOS/Android devices, Safari, and WeChat saving/scanning still need manual checks. The verification tooling adds Playwright and a QR decoder as development dependencies; compatible dependency updates address the audit findings. Hosting is unchanged.

## Report content and loading

Reports adapt the reviewed fork’s R2 editorial stories while keeping this project’s type names and colors. Each type has three highlights, seven chapters, and three context/action/example exercises in Chinese and English. The English text is a concise adaptation, not a sentence-for-sentence translation. These examples support self-reflection; they are not individual findings or predictions about relationships, careers, or ability. Unsourced rarity, famous-person, career-prescription, best-match and cognitive-stack claims are no longer rendered in reports, the appendix, or share cards. Legacy type metadata remains in the data file for compatibility.

The four views load on navigation. The homepage does not request the report content, ECharts, or html2canvas. Opening a report still leaves ECharts unloaded until the radar is expanded; image capture loads html2canvas on demand. Exported cards use the report’s concise highlights and reject overflowing text rather than producing a clipped PNG.

In earlier local headless Chrome cold-load checks, before the verification dependency updates, homepage JavaScript transfer dropped from approximately **254 kB to 81 kB (68%)**, including all local script dependencies and response overhead. Decoded JavaScript dropped from **715 kB to 211 kB**. Measurements exclude HTML, CSS, and external analytics; they are a local comparison rather than a prediction of live mobile load time.

Current architecture:

- `src/router/index.js`: four lazy view routes using hash navigation for GitHub Pages.
- `src/composables/useTest.js`: original question selection and scoring; draft/result stores own persistence and fallback behavior.
- `src/utils/dimensions.js`: lightweight shared dimension validation and the existing inclusive close-range rule, independent of report text and scoring.
- `src/utils/report.js` and `src/data/reportContent.js`: editorial report model and bilingual content, loaded through report views.
- `src/components/ReportReader.vue` and `ReportDock.vue`: independent native disclosure sections, focus-aware contents navigation, action examples and fixed reading controls.
- `src/views/TypesView.vue`: query-backed code/nickname search and selected-type state (`/types?q=infj&type=INFJ`, after the URL hash).
- `src/config.js`: the sole canonical share address and validated type-only hash links. Local and preview origins never implicitly replace the public address. Localized copy and X captions interpolate this address; the preview and copied/X text agree. Appendix captions describe a type rather than claiming it as the reader’s result.
- `src/components/ShareCard.vue`: square PNG capture with QR readiness and overflow rejection; `ResultView` owns preview, retry and stale-output cancellation.

## Tech Stack

Vue 3, Vite, Vue Router, Vue I18n, ECharts, html2canvas, QRCode, Vitest.

## Add to Home Screen

MBTI Lab can run as a standalone app:

- **iOS:** open in Safari, tap Share, choose "Add to Home Screen".
- **Android:** open in Chrome, choose "Install app" or "Add to Home screen".
- **Desktop:** open in Chrome or Edge, use the install action in the address bar.

## Related

- [Bracket Guess](https://github.com/OctopusGarage/bracket-guess) - a browser-only bracket picker and poster exporter.
- [OctopusGarage](https://github.com/OctopusGarage) - small tools for AI agents, local automation, and browser-native products.

## License

MIT
