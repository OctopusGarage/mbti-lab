# MBTI Lab

> A professional, bilingual (Chinese/English) MBTI personality test — beautifully designed, accurate, and shareable.

🔗 **[octopusgarage.github.io/mbti-lab](https://octopusgarage.github.io/mbti-lab/)**

---

## Features

- **Bilingual** — full Chinese/English toggle across all questions, results, and UI
- **Two versions** — Short (60 questions, ~10 min) or Full (93 questions, ~20 min)
- **Rich results** — type reveal animation, personality description, strengths, careers, famous people, best matches
- **Data visualization** — four-dimension score bars + five-axis radar chart
- **Share card** — one-tap export to image, unique gradient design per type
- **16-type appendix** — browse any personality type's full profile at any time
- **PWA** — add to home screen on iOS/Android; runs as a standalone app
- **Local history** — last result saved in browser, accessible on next visit

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 + Vite |
| Routing | Vue Router 4 |
| i18n | vue-i18n 9 |
| Charts | ECharts (radar chart) |
| Image export | html2canvas |
| Deployment | GitHub Actions → GitHub Pages |

---

## Getting Started

```bash
git clone https://github.com/OctopusGarage/mbti-lab.git
cd mbti-lab
npm install
npm run dev
```

Open `http://localhost:5173/mbti-lab/`

---

## Project Structure

```
src/
├── views/          # HomeView · TestView · ResultView · TypesView
├── components/     # QuestionCard · ProgressBar · DimensionBars
│                   # RadarChart · ResultCard · ShareCard · LangToggle
├── composables/    # useTest (scoring logic) · useHistory (localStorage)
├── data/           # questions.js (93 questions) · types.js (16 types)
├── locales/        # zh.json · en.json
└── i18n/           # vue-i18n setup
```

---

## Scoring

Four dimensions (E/I · N/S · F/T · J/P) are scored independently. Each question has a `dimension` and `direction` field. Choosing A or B increments the corresponding letter's count. Final type is determined by the dominant side of each dimension.

---

## Deployment

Push to `main` — GitHub Actions builds and deploys via the official `actions/deploy-pages` action.

---

## License

MIT
