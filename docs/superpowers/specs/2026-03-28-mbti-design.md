# MBTI Lab — Design Spec

**Date:** 2026-03-28
**Project:** mbti-lab
**Deployment:** GitHub Pages

---

## Overview

A professional, bilingual (Chinese/English) MBTI personality test web app. Targets both casual users and professionals. Emphasizes accuracy, visual richness, and social shareability.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 + Vite |
| Routing | Vue Router |
| i18n | vue-i18n |
| Chart | ECharts (radar chart) |
| Image export | html2canvas |
| Deployment | GitHub Actions → GitHub Pages |

---

## Pages & Routing

| Route | Page | Purpose |
|---|---|---|
| `/` | HomeView | Language toggle, version selection, start test |
| `/test` | TestView | One-question-per-page test flow |
| `/result` | ResultView | Type reveal, scores, descriptions, sharing |

---

## Component Structure

```
src/
├── views/
│   ├── HomeView.vue        首页
│   ├── TestView.vue        测试页
│   └── ResultView.vue      结果页
│
├── components/
│   ├── QuestionCard.vue    单题卡片（题目 + A/B 选项）
│   ├── ProgressBar.vue     顶部进度条
│   ├── DimensionBars.vue   四维得分条
│   ├── RadarChart.vue      雷达图（ECharts 封装）
│   ├── ResultCard.vue      结果卡片主体
│   ├── ShareCard.vue       分享图片专用隐藏卡片
│   └── LangToggle.vue      中/EN 切换按钮
│
├── data/
│   ├── questions.js        93 道题（含短版标记）
│   └── types.js            16 种人格数据
│
├── composables/
│   ├── useTest.js          测试流程逻辑与评分
│   └── useHistory.js       localStorage 历史记录
│
└── locales/
    ├── zh.json             中文界面文案
    └── en.json             英文界面文案
```

---

## Question Data Model

```js
{
  id: 1,
  dimension: "EI",      // EI | NS | FT | JP
  direction: "I",       // 选 A 倾向哪侧
  short: true,          // 是否收录进精简版（60题）
  zh: {
    a: "在社交聚会后，你通常感到精力充沛。",
    b: "在社交聚会后，你通常需要独处来恢复精力。"
  },
  en: {
    a: "After social gatherings, you usually feel energized.",
    b: "After social gatherings, you usually need alone time to recharge."
  }
}
```

**题库规模：** 完整版 93 题，精简版 60 题（由 `short: true` 标记）
**每维度题数：** 约 20–25 题（完整版），确保四维均衡覆盖

---

## Scoring Logic

- 四个维度独立计分：E/I、N/S、F/T、J/P
- 每题选 A 或 B，根据 `direction` 字段累加对应侧得分
- 维度得分 = 某侧答题数 / 该维度总题数 × 100%
- 超过 50% 的一侧决定字母，四字母组合成 16 种类型之一

---

## Personality Type Data Model

```js
{
  INFJ: {
    nickname: { zh: "倡导者", en: "The Advocate" },
    rarity: "1.5%",
    description: { zh: "...", en: "..." },
    strengths: { zh: ["洞察力强", "富有同理心", ...], en: [...] },
    careers: { zh: ["心理咨询师", "作家", ...], en: [...] },
    famous: ["Martin Luther King", "Taylor Swift"],
    bestMatch: ["ENTP", "ENFP"],
    cognitiveStack: "Ni Fe Ti Se"
  }
}
```

---

## UI / UX Details

### 首页
- 右上角语言切换（中 / EN）
- 居中展示 App 名称与简介
- 两个入口按钮：「精简版 60题」「完整版 93题」
- 若 localStorage 存有历史，底部显示「查看上次结果」

### 测试页
- 顶部进度条，显示「第 N / 60 题」
- 每题淡入过渡动画
- A/B 选项卡片，点击即选中并**自动进入下一题**（无需确认）
- 左下角「上一题」按钮，支持返回修改

### 结果页（融合 B + D + E 风格）
1. **第一屏**：类型字母依次动画揭晓（I·N·F·J）+ 昵称 + 稀有度百分比
2. **段落描述**：奶油色背景，衬线字体，段落式人格解读（中英可切换）
3. **数据可视化**：四维得分条（DimensionBars）+ 雷达图（RadarChart）并排
4. **人格详情**：优势列表、适合职业、著名同类型人物、最佳匹配类型、认知功能栈
5. **分享区**：「生成分享图片」按钮，html2canvas 截取 ShareCard，弹出图片供保存

### 分享卡片（ShareCard）
- 平时 `position: absolute; left: -9999px` 隐藏
- 固定尺寸，适合社交媒体（如 1080×1080 或 1080×1350）
- 包含：类型大字、昵称、稀有度、一句话描述、网站 URL

---

## Data Persistence

- 测试完成后，将结果（类型、四维分数、完成时间、版本）存入 `localStorage`
- 首页检测到历史记录时显示「查看上次结果」快捷入口
- 仅保存最近一次结果（不做历史列表，保持简单）

---

## Deployment

- `main` 分支推送后，GitHub Actions 自动执行 `vite build`
- 构建产物 `dist/` 发布到 `gh-pages` 分支
- 访问地址：`https://<username>.github.io/mbti-lab/`
- `vite.config.js` 需设置 `base: '/mbti-lab/'`

---

## Out of Scope

- 用户账号 / 登录
- 多次历史记录列表
- 后端 API
- 管理后台
