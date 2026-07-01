# Student Learning Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the student path from target score setup through one linear-function task, practice submission, mistake feedback, and next-task recommendation.

**Architecture:** Create `apps/student-web/` as the production student app and keep `prototype-fresh-study-tool/` as visual evidence. Start with deterministic local state and mock API data, isolate the `y = kx + b` graph, then replace mock calls with backend contracts when the API slice lands.

**Tech Stack:** React, Vite, TypeScript, CSS, Vitest, Testing Library, Playwright.

---

## File Structure

- `apps/student-web/package.json`: app scripts and dependencies.
- `apps/student-web/src/App.tsx`: route shell and page composition.
- `apps/student-web/src/data/mockLearning.ts`: deterministic student, diagnostic, task, practice, and report data.
- `apps/student-web/src/components/LinearFunctionGraph.tsx`: reusable `y = kx + b` graph and controls.
- `apps/student-web/src/pages/GoalSetupPage.tsx`: target score setup.
- `apps/student-web/src/pages/InitialDiagnosticPage.tsx`: short diagnostic flow.
- `apps/student-web/src/pages/TodayTaskPage.tsx`: recommended task entry.
- `apps/student-web/src/pages/LinearFunctionTaskPage.tsx`: learning task, scenario, graph, AI coach panel.
- `apps/student-web/src/pages/PracticePage.tsx`: practice answer submission and mode gating.
- `apps/student-web/src/pages/MistakeReviewPage.tsx`: mistake reason, evidence, similar question.
- `apps/student-web/src/pages/ReportPage.tsx`: short learning report and next task.
- `apps/student-web/src/state/learningFlow.ts`: reducer and state transitions.
- `apps/student-web/src/state/learningFlow.test.ts`: reducer tests.
- `apps/student-web/src/components/LinearFunctionGraph.test.tsx`: graph behavior tests.
- `apps/student-web/e2e/student-flow.spec.ts`: browser test for the complete student path.

### Task 1: Scaffold Student App

**Files:**
- Create: `D:/middle school/apps/student-web/package.json`
- Create: `D:/middle school/apps/student-web/index.html`
- Create: `D:/middle school/apps/student-web/src/main.tsx`
- Create: `D:/middle school/apps/student-web/src/App.tsx`
- Create: `D:/middle school/apps/student-web/src/styles.css`

- [ ] **Step 1: Create Vite React TypeScript app**

Run:

```powershell
npm create vite@latest apps/student-web -- --template react-ts
```

Working directory:

```text
D:\middle school
```

Expected: `apps/student-web/package.json` exists.

- [ ] **Step 2: Install testing dependencies**

Run:

```powershell
npm install
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom playwright
```

Working directory:

```text
D:\middle school\apps\student-web
```

Expected: dependencies install and `node_modules` exists under `apps/student-web`.

- [ ] **Step 3: Set package scripts**

Replace `scripts` in `apps/student-web/package.json` with:

```json
{
  "dev": "vite --host 127.0.0.1",
  "build": "tsc -b && vite build",
  "test": "vitest run --environment jsdom",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 4: Verify empty app builds**

Run:

```powershell
npm run build
```

Expected: TypeScript and Vite build pass.

### Task 2: Implement Learning Flow State

**Files:**
- Create: `D:/middle school/apps/student-web/src/state/learningFlow.ts`
- Create: `D:/middle school/apps/student-web/src/state/learningFlow.test.ts`

- [ ] **Step 1: Write failing reducer test**

Create `learningFlow.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialLearningState, learningReducer } from "./learningFlow";

describe("learningReducer", () => {
  it("moves a new student through goal, diagnostic, task, practice, mistake, and report", () => {
    let state = createInitialLearningState();
    state = learningReducer(state, { type: "setGoal", goalScore: "110+" });
    state = learningReducer(state, { type: "finishInitialDiagnostic" });
    state = learningReducer(state, { type: "startTask", taskId: "task-linear-kb" });
    state = learningReducer(state, { type: "submitPracticeAnswer", answer: "y = 0.4x + 3" });
    state = learningReducer(state, { type: "openMistakeReview" });
    state = learningReducer(state, { type: "finishReport" });

    expect(state.goalScore).toBe("110+");
    expect(state.currentPage).toBe("report");
    expect(state.mistakes[0].reason).toBe("审题与建模错误");
    expect(state.nextTaskId).toBe("task-linear-modeling");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm run test -- src/state/learningFlow.test.ts
```

Expected: fail because `learningFlow` is not implemented.

- [ ] **Step 3: Implement reducer**

Create `learningFlow.ts`:

```ts
export type GoalScore = "80" | "100" | "110+" | "full-score";
export type PageId = "goal" | "diagnostic" | "today" | "task" | "practice" | "mistake" | "report";

export type LearningState = {
  currentPage: PageId;
  goalScore: GoalScore | null;
  activeTaskId: string | null;
  practiceAnswer: string | null;
  mistakes: Array<{ questionId: string; reason: string; evidence: string }>;
  nextTaskId: string | null;
};

export type LearningAction =
  | { type: "setGoal"; goalScore: GoalScore }
  | { type: "finishInitialDiagnostic" }
  | { type: "startTask"; taskId: string }
  | { type: "submitPracticeAnswer"; answer: string }
  | { type: "openMistakeReview" }
  | { type: "finishReport" };

export function createInitialLearningState(): LearningState {
  return {
    currentPage: "goal",
    goalScore: null,
    activeTaskId: null,
    practiceAnswer: null,
    mistakes: [],
    nextTaskId: null,
  };
}

export function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case "setGoal":
      return { ...state, goalScore: action.goalScore, currentPage: "diagnostic" };
    case "finishInitialDiagnostic":
      return { ...state, currentPage: "today" };
    case "startTask":
      return { ...state, activeTaskId: action.taskId, currentPage: "task" };
    case "submitPracticeAnswer":
      return {
        ...state,
        practiceAnswer: action.answer,
        currentPage: "mistake",
        mistakes: [
          {
            questionId: "practice-printing-fee",
            reason: "审题与建模错误",
            evidence: "把基础服务费和每页费用混在一起，没有先区分固定费用和变化费用。",
          },
        ],
      };
    case "openMistakeReview":
      return { ...state, currentPage: "mistake" };
    case "finishReport":
      return { ...state, currentPage: "report", nextTaskId: "task-linear-modeling" };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Verify reducer test passes**

Run:

```powershell
npm run test -- src/state/learningFlow.test.ts
```

Expected: one passing test.

### Task 3: Build Reusable Linear Function Graph

**Files:**
- Create: `D:/middle school/apps/student-web/src/components/LinearFunctionGraph.tsx`
- Create: `D:/middle school/apps/student-web/src/components/LinearFunctionGraph.test.tsx`

- [ ] **Step 1: Write graph behavior test**

Create `LinearFunctionGraph.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LinearFunctionGraph } from "./LinearFunctionGraph";

describe("LinearFunctionGraph", () => {
  it("updates formula text when k changes", async () => {
    render(<LinearFunctionGraph />);
    await userEvent.clear(screen.getByLabelText("k"));
    await userEvent.type(screen.getByLabelText("k"), "2");
    expect(screen.getByText("y = 2x - 1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm run test -- src/components/LinearFunctionGraph.test.tsx
```

Expected: fail because component is missing.

- [ ] **Step 3: Implement graph component**

Create `LinearFunctionGraph.tsx`:

```tsx
import { useState } from "react";

export function LinearFunctionGraph() {
  const [k, setK] = useState(1);
  const [b, setB] = useState(-1);
  const formula = `y = ${k}x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`;

  return (
    <section aria-label="一次函数图像">
      <h2>图像探索</h2>
      <p>{formula}</p>
      <label>
        k
        <input aria-label="k" type="number" value={k} onChange={(event) => setK(Number(event.target.value))} />
      </label>
      <label>
        b
        <input aria-label="b" type="number" value={b} onChange={(event) => setB(Number(event.target.value))} />
      </label>
      <svg viewBox="0 0 200 140" role="img" aria-label={formula}>
        <line x1="20" y1="70" x2="180" y2="70" stroke="#334155" />
        <line x1="100" y1="10" x2="100" y2="130" stroke="#334155" />
        <line x1="30" y1={110 - k * -3 * 10 - b * 10} x2="170" y2={110 - k * 3 * 10 - b * 10} stroke="#2563eb" strokeWidth="3" />
      </svg>
    </section>
  );
}
```

- [ ] **Step 4: Verify graph test passes**

Run:

```powershell
npm run test -- src/components/LinearFunctionGraph.test.tsx
```

Expected: graph test passes.

### Task 4: Implement Page Flow

**Files:**
- Create: `D:/middle school/apps/student-web/src/data/mockLearning.ts`
- Create: `D:/middle school/apps/student-web/src/pages/GoalSetupPage.tsx`
- Create: `D:/middle school/apps/student-web/src/pages/InitialDiagnosticPage.tsx`
- Create: `D:/middle school/apps/student-web/src/pages/TodayTaskPage.tsx`
- Create: `D:/middle school/apps/student-web/src/pages/LinearFunctionTaskPage.tsx`
- Create: `D:/middle school/apps/student-web/src/pages/PracticePage.tsx`
- Create: `D:/middle school/apps/student-web/src/pages/MistakeReviewPage.tsx`
- Create: `D:/middle school/apps/student-web/src/pages/ReportPage.tsx`
- Modify: `D:/middle school/apps/student-web/src/App.tsx`

- [ ] **Step 1: Add mock content**

Create `mockLearning.ts`:

```ts
export const todayTask = {
  id: "task-linear-kb",
  title: "理解 k 和 b 的意义",
  reason: "你在图像增减性和截距理解上不够稳定。",
  durationOptions: [10, 20, 40],
  completion: "完成 1 个图像探索、1 道即时练习和 1 次错因复盘。",
};
```

- [ ] **Step 2: Implement pages with clear primary buttons**

Each page must expose one primary action:

```tsx
type Props = { onNext: () => void };
export function GoalSetupPage({ onNext }: Props) {
  return <button onClick={onNext}>选择 110+ 并开始诊断</button>;
}
```

Use equivalent simple components for diagnostic, today task, task, practice, mistake review, and report. The task page must include `<LinearFunctionGraph />`.

- [ ] **Step 3: Wire reducer in App**

`App.tsx` should select the current page from `learningReducer` state and dispatch the next action from each primary button.

- [ ] **Step 4: Verify app builds**

Run:

```powershell
npm run build
```

Expected: build passes.

### Task 5: Add Browser E2E Flow

**Files:**
- Create: `D:/middle school/apps/student-web/playwright.config.ts`
- Create: `D:/middle school/apps/student-web/e2e/student-flow.spec.ts`

- [ ] **Step 1: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run dev -- --port 5174",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://127.0.0.1:5174",
  },
});
```

- [ ] **Step 2: Add complete student flow test**

Create `student-flow.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("student completes the linear-function learning slice", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "选择 110+ 并开始诊断" }).click();
  await page.getByRole("button", { name: "完成诊断" }).click();
  await page.getByRole("button", { name: "开始今日任务" }).click();
  await expect(page.getByText("理解 k 和 b 的意义")).toBeVisible();
  await page.getByRole("button", { name: "进入练习" }).click();
  await page.getByRole("button", { name: "提交答案" }).click();
  await expect(page.getByText("审题与建模错误")).toBeVisible();
  await page.getByRole("button", { name: "生成学情报告" }).click();
  await expect(page.getByText("下一步任务")).toBeVisible();
});
```

- [ ] **Step 3: Verify E2E**

Run:

```powershell
npm run test:e2e
```

Expected: the browser flow passes without console errors.

## Self-Review

- Spec coverage: covers target setup, diagnostic, today task, interactive graph, practice, mistake review, report, and next task.
- Red-flag scan: no unfinished markers or unspecified implementation bucket remains.
- Type consistency: page ids, reducer actions, and task ids are consistent across tasks.
