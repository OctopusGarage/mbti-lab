# Architecture

MBTI Lab is a Vue application served as static files on GitHub Pages. Assessment scoring, draft storage, report reading, and image generation run in the browser. No assessment backend or runtime LLM is required.

## Routes and loading

Vue Router uses hash navigation under `/mbti-lab/` so direct links work on static hosting. Each view loads on navigation.

| Hash route | Purpose |
| --- | --- |
| `/` | Choose an assessment, resume a draft, or reopen the latest result |
| `/test?mode=short` or `/test?mode=full` | Complete 60 or 93 questions |
| `/result` | Read the latest personal report and export a share card |
| `/types?q=infj&type=INFJ` | Search the type library or open a public type report |

The home page does not load report text, ECharts, or html2canvas. Reports share their content model; ECharts loads only when the radar is expanded, and html2canvas loads on image capture.

## Scoring and persistence

`src/composables/useTest.js` owns question selection and the original scoring rules. Each side of a dimension is rounded independently, so a pair can total 101. A leading-side percentage of 50 still wins the original tie rule. The inclusive 45–55% close range is a display convention, not a confidence interval, and does not change the type.

`useDraftStore.js` validates versioned drafts before restoring answers and the current question. An existing draft determines the mode until a restart is confirmed. Answer feedback blocks duplicate selection; leaving the assessment cancels delayed navigation while preserving the draft.

`useResultStore.js` owns the result handoff, history, and persistence status. It consumes fresh session results once and falls back to history or memory when storage fails. In-memory fallback survives navigation within the current page session, but cannot guarantee recovery after refresh or closure. Missing or invalid completion timestamps remain unknown.

## Reports and reading

`src/utils/report.js` and `src/data/reportContent.js` provide three highlights, seven chapters, and three context/action/example exercises per type in Chinese and English. The content adapts the reference fork's R2 editorial stories while retaining this project's type names and colors. English is a concise adaptation rather than a sentence-for-sentence translation.

Reports present reflection prompts rather than measured personal facts. Unsourced rarity, celebrity, career-prescription, best-match, and cognitive-stack claims are not rendered. Legacy metadata remains in `src/data/types.js` for compatibility.

`ReportReader.vue` uses independent native disclosure sections and focus-aware contents navigation. `ReportDock.vue` keeps Contents and Share available while reading. The type library preserves search and selection in the query and supports browser history. Adjacent-type links flip one letter without changing the saved result. Public type reports do not invent personal proportions.

## Sharing

`src/config.js` owns the canonical public address and validates type-only share links. Captions preview the exact text copied or passed to the X sharing intent, without answers or personal proportions. Clipboard denial exposes selectable text.

`ShareCard.vue` generates a square PNG after fonts, images, and the QR are ready. It rejects overflowing content. `ResultView.vue` owns the preview, retry, and cancellation of stale output when language or navigation changes. The QR points to the public home page.

The share dialog traps focus, isolates background controls, restores prior focus, and supports Escape. Language controls update the document language; layouts account for narrow screens, safe areas, and reduced motion.

See [testing](testing.md) for the checks that protect these behaviors.
