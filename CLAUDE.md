# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server at http://localhost:5173/mbti-lab/
npm run build    # Production build → dist/
npm run preview  # Preview built output
npm run test     # Run Vitest tests
```

No linting/formatting toolchain is configured.

## Architecture

**MBTI Lab** is a bilingual (Chinese/English) Vue 3 SPA for personality testing, deployed to GitHub Pages at `https://octopusgarage.github.io/mbti-lab/`.

### Routing (4 routes)
- `/` → `HomeView` — test version selection (short 60Q / full 93Q)
- `/test` → `TestView` — question loop
- `/result` → `ResultView` — scoring display + share card
- `/types` → `TypesView` — 16-type profile appendix

### Data Flow
`HomeView` (select mode) → `TestView` (questions) → on completion, writes result to `sessionStorage` and navigates to `ResultView` → saves to `localStorage` via `useHistory`.

### Core Logic
- **`src/composables/useTest.js`** — scoring engine. Each question in `src/data/questions.js` has `dimension` (E/I, N/S, F/T, J/P), `direction` (which letter A or B scores), and optional `short` flag for the 60Q version. Final MBTI type is determined by whichever side exceeds 50% on each dimension.
- **`src/composables/useHistory.js`** — localStorage persistence for the last test result.

### Internationalization
vue-i18n 9 (Composition API mode, `legacy: false`), Chinese default with English fallback. Questions and type profiles each carry `zh`/`en` fields directly in the data objects. UI strings live in `src/locales/zh.json` and `src/locales/en.json`. `LangToggle.vue` switches `i18n.global.locale`.

### Visualization & Export
- `RadarChart.vue` — ECharts 5 radar chart across all 4 dimensions
- `DimensionBars.vue` — per-dimension percentage bars
- `ShareCard.vue` — styled export card with type-specific gradients; uses `html2canvas` to export PNG

### Deployment
Push to `main` → `.github/workflows/deploy.yml` runs `npm ci && npm run build` on Node 20, then deploys `dist/` via `actions/deploy-pages`. The Vite `base` is `/mbti-lab/`.
