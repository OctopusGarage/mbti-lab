# Verification plan — 2026-10-20

Requested outcome: repeatable production-browser E2E tests and actual AI content evaluations, with CI gates and reviewable evidence.

1. Preserve the original question bank, scoring, and all existing reliability changes.
2. Test the production build in Chromium, Firefox, and WebKit: complete both questionnaires, recovery and navigation, report reading, sharing, keyboard access, responsive layouts, optional loading, and actual PNG/QR exports. Keep expensive exhaustive exports in Chromium; exercise representative exports across engines.
3. Evaluate all 16 editorial reports in both languages using an explicit rubric and an independent AI judge. Record source hashes, evidence, scores, limitations, and judge provenance. Validate coverage and freshness mechanically in CI; provide a separate command for fresh model judgments.
4. Run unit tests, production build, browser tests, stored-evaluation validation, and dependency audit. Investigate failures before adjusting expectations. Apply compatible dependency patches if the audit identifies fixes.
5. Document exact commands, coverage, actual results, and remaining physical-device limitations. Do not commit, publish, or deploy.
