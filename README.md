# MBTI Lab

A bilingual MBTI personality test with rich results, share cards, and offline-friendly browser delivery.

Your most recent assessment result is saved in the browser, so you can revisit the full report in the same browser at any time after completing the test.

[![Deploy](https://github.com/OctopusGarage/mbti-lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/OctopusGarage/mbti-lab/actions/workflows/deploy.yml)
[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev)
![License](https://img.shields.io/badge/license-MIT-yellow)

**Live:** https://octopusgarage.github.io/mbti-lab/

## Why

Personality tests often hide the useful report behind registration, ads, or a paywall. MBTI Lab keeps the whole flow in the browser: answer, see the result, export a share card, and leave without giving up personal data.

## Features

- **16 personality types** - complete four-letter type output with descriptions and matches.
- **Two test lengths** - short mode with 60 questions, full mode with 93 questions.
- **Rich report** - strengths, careers, representative people, compatible types, and type appendix.
- **Visual results** - dimension bars and a radar chart powered by ECharts.
- **Share card** - export a designed result image with a QR code back to the app.
- **Bilingual** - Chinese and English can be switched at any time.
- **Offline capable** - works as a PWA after first load.
- **Private by default** - result history stays in local browser storage.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173/mbti-lab/`.

Production checks:

```bash
npm run build
npm test
```

## RalphWorks issue workflow

Maintainers can add the `ralphworks:run` label to an open issue to start a checked RalphWorks run. The workflow uses the issue title and body as the task, runs `npm test -- --run && npm run build`, and opens a draft PR when the task completes and the checks pass. The PR must be reviewed before merging; a failed run posts its Actions link on the issue and removes the trigger label.

The workflow uses repository variable `RALPHWORKS_MODEL`, the selected model provider's secret, variable `RALPHWORKS_ISSUE_CHECK`, and secret `RALPHWORKS_ISSUE_TOKEN` for branch, PR, and issue delivery. The issue run uses at most five iterations, 30 minutes, and $3 of reported model cost. See the [RalphWorks usage guide](https://github.com/OctopusGarage/ralphworks/blob/main/docs/USAGE.md#issue-to-draft-pr-workflow) for setup and retry behavior.

## Product Flow

| Step | What happens |
|---|---|
| Choose mode | Pick short or full assessment based on time available. |
| Answer questions | Progress is tracked locally while the user moves through the test. |
| Reveal type | The app computes the four MBTI dimensions and shows the type profile. |
| Explore report | Users can inspect strengths, careers, matches, and the 16-type appendix. |
| Share | Export an image card without signing in. |

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
