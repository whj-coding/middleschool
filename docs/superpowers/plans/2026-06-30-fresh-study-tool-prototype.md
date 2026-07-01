# Fresh Study Tool Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable desktop-first frontend prototype for the selected “清爽学习工具风” AI middle-school math learning coach.

**Architecture:** Use the Product Design prototype starter as a self-contained Vite app under `prototype-fresh-study-tool/`. Implement a single interactive React screen matching the selected Image Gen direction: left navigation, today task, linear-function graph controls, AI coach, voice controls, and learning progress.

**Tech Stack:** Vite, React, CSS, local mock data, browser verification.

---

### Task 1: Bootstrap Prototype App

**Files:**
- Create: `prototype-fresh-study-tool/`

- [ ] Run Product Design bootstrap script:

```powershell
node C:/Users/Admin/.codex/plugins/cache/openai-curated-remote/product-design/0.1.47/scripts/bootstrap-prototype.mjs --dest "D:/middle school/prototype-fresh-study-tool"
```

- [ ] Install dependencies:

```powershell
npm install
```

Expected: dependencies install successfully and Vite scripts are available.

### Task 2: Implement Selected Visual Direction

**Files:**
- Modify: `prototype-fresh-study-tool/src/App.jsx`
- Modify: `prototype-fresh-study-tool/src/App.css`

- [ ] Replace starter UI with the selected “清爽学习工具风” screen:
  - Left navigation.
  - 今日推荐任务.
  - 10/20/40 minute selector.
  - 一次函数 learning progress.
  - Interactive `y = kx + b` graph preview.
  - AI 学习教练 panel.
  - Voice controls.

- [ ] Add interactions:
  - Duration selector updates selected state.
  - `k` and `b` sliders update formula and graph line.
  - Navigation item selection updates active state.
  - AI coach suggested action buttons update short response text.
  - Voice button toggles listening state.

### Task 3: Run And Verify Prototype

**Files:**
- Create: `design-qa.md`

- [ ] Run build:

```powershell
npm run build
```

Expected: build succeeds.

- [ ] Start dev server:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Expected: app available at `http://127.0.0.1:5173/`.

- [ ] Capture rendered app and compare against selected reference image.

- [ ] Write `design-qa.md` with final result.

Expected: `final result: passed` or clear blocker if browser capture is unavailable.
