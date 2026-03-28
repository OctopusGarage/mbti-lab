# Sharing Feature Design

**Date:** 2026-03-28
**Status:** Approved

## Overview

Add two distinct sharing scenarios to MBTI Lab:
1. **Share result** — user shares their MBTI type from the result page
2. **Share app** — user recommends the app to friends, accessible from both home page and result page

## Constraints

- Static site (GitHub Pages, no backend) — no WeChat JSSDK
- html2canvas renders the ShareCard; QR code must be rendered client-side (inline canvas/SVG, not an external image URL)

## Feature 1: QR Code in ShareCard Image

Replace the current text URL (`octopusgarage.github.io/mbti-lab`) at the bottom of `ShareCard.vue` with a QR code that encodes the app URL.

**Implementation:**
- Add `qrcode` npm package (client-side, generates canvas or data URL)
- In `ShareCard.vue`, render the QR code as an inline `<canvas>` or data-URL `<img>` in the bottom-right corner
- Keep a short label: "扫码测测你的" next to the QR code
- QR encodes: `https://octopusgarage.github.io/mbti-lab`
- QR code is rendered before `html2canvas` capture so it appears in the saved image

## Feature 2: Share Panel (Bottom Sheet)

A new `SharePanel.vue` component rendered via `<Teleport to="body">`. Slides up from the bottom on mobile; centered modal on desktop.

### Trigger
- Result page: existing "分享" button opens the panel
- Home page: new share icon (↗) in the top-right header area opens a reduced version of the panel (app-only section)

### Panel Layout

**Section A — 分享我的结果** *(result page only)*
- **分享到 X**: opens `https://twitter.com/intent/tweet` with pre-filled text:
  `我的 MBTI 是 {type}！快来测测你的性格 👉 https://octopusgarage.github.io/mbti-lab`
- **保存图片**: calls existing `ShareCard.capture()` (now includes QR code)

**Section B — 推荐给朋友** *(both result page and home page)*
- **分享到 X**: opens X web intent with:
  `推荐一个很有趣的 MBTI 性格测试，快来试试！👉 https://octopusgarage.github.io/mbti-lab`
- **复制链接**: copies `https://octopusgarage.github.io/mbti-lab` to clipboard; button label changes to "已复制 ✓" for 2 seconds

### Dismiss
- Tap backdrop or drag down to close

## Components Affected

| File | Change |
|------|--------|
| `src/components/ShareCard.vue` | Add QR code (bottom-right), remove text URL |
| `src/components/SharePanel.vue` | **New** — bottom sheet with two sections |
| `src/views/ResultView.vue` | Pass `type` + `shareCardRef` to SharePanel; replace `onShare` handler |
| `src/views/HomeView.vue` | Add share icon to header; open SharePanel in app-only mode |

### SharePanel Props

```js
props: {
  type: String,          // MBTI type, e.g. "INFJ" — used for X tweet text; omit on home page
  onSaveImage: Function, // callback that triggers ShareCard.capture(); omit on home page
}
```

When `type` is absent, the panel renders only Section B (推荐给朋友). This is the "app-only mode" used on the home page.

## Dependencies

- Add `qrcode` npm package for client-side QR code generation

## i18n

Add keys to `zh.json` and `en.json`:
- `share.shareResult` — "分享我的结果" / "Share My Result"
- `share.shareApp` — "推荐给朋友" / "Recommend to Friends"
- `share.shareToX` — "分享到 X" / "Share on X"
- `share.saveImage` — "保存图片" / "Save Image"
- `share.copyLink` — "复制链接" / "Copy Link"
- `share.copied` — "已复制 ✓" / "Copied ✓"
- `share.xTextResult` — X tweet text for result sharing
- `share.xTextApp` — X tweet text for app sharing
