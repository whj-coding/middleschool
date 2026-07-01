# Admin Review And Release Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first admin review UI and release verification checklist for importing, reviewing, approving, publishing, and validating linear-function MVP content.

**Architecture:** Create `apps/admin-web/` as a focused review console. Use mock content-review data first, then connect to content APIs. Keep admin review UI separate from student app so student flows never see unapproved content.

**Tech Stack:** React, Vite, TypeScript, CSS, Vitest, Testing Library, Playwright, Markdown verification checklist.

---

## File Structure

- `apps/admin-web/`: admin review app.
- `apps/admin-web/src/data/mockReviewQueue.ts`: import jobs, questions, figure recognition items.
- `apps/admin-web/src/pages/ImportJobsPage.tsx`: import job queue and status.
- `apps/admin-web/src/pages/QuestionReviewPage.tsx`: question fields, answer, explanation, tags.
- `apps/admin-web/src/pages/FigureReviewPage.tsx`: figure recognition confidence and editable elements.
- `apps/admin-web/src/pages/PublishControlPage.tsx`: publish queue and release state.
- `apps/admin-web/e2e/admin-review.spec.ts`: admin review browser test.
- `docs/testing/mvp-verification-checklist.md`: full manual verification checklist.

### Task 1: Scaffold Admin App

**Files:**
- Create: `D:/middle school/apps/admin-web/package.json`
- Create: `D:/middle school/apps/admin-web/src/App.tsx`
- Create: `D:/middle school/apps/admin-web/src/styles.css`

- [ ] **Step 1: Create Vite React TypeScript app**

Run:

```powershell
npm create vite@latest apps/admin-web -- --template react-ts
```

Working directory:

```text
D:\middle school
```

Expected: `apps/admin-web/package.json` exists.

- [ ] **Step 2: Install test dependencies**

Run:

```powershell
npm install
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom playwright
```

Working directory:

```text
D:\middle school\apps\admin-web
```

Expected: dependencies install.

### Task 2: Implement Review Queue UI

**Files:**
- Create: `D:/middle school/apps/admin-web/src/data/mockReviewQueue.ts`
- Create: `D:/middle school/apps/admin-web/src/pages/ImportJobsPage.tsx`
- Create: `D:/middle school/apps/admin-web/src/pages/QuestionReviewPage.tsx`
- Create: `D:/middle school/apps/admin-web/src/pages/FigureReviewPage.tsx`
- Create: `D:/middle school/apps/admin-web/src/pages/PublishControlPage.tsx`
- Modify: `D:/middle school/apps/admin-web/src/App.tsx`

- [ ] **Step 1: Add mock review queue**

Create `mockReviewQueue.ts`:

```ts
export const reviewQueue = {
  importJob: { id: "import-001", sourceType: "Markdown", status: "pending_review" },
  question: {
    id: "MATH-FUNC-LINEAR-001",
    stem: "直线经过点 A(0, 2) 和 B(4, 0)，则该直线的解析式是？",
    answer: "B",
    explanation: "斜率 k = -0.5，截距 b = 2。",
    tags: ["一次函数图像", "图像", "基础"],
    reviewStatus: "pending_review",
  },
  figure: {
    figureType: "coordinate_line_graph",
    confidence: 0.86,
    elements: ["A(0, 2)", "B(4, 0)", "x 截距 4", "y 截距 2"],
    reviewStatus: "pending_review",
  },
};
```

- [ ] **Step 2: Build pages**

Each page must show the current status and one primary action:

```tsx
export function ImportJobsPage({ onNext }: { onNext: () => void }) {
  return (
    <section>
      <h1>资料导入</h1>
      <p>Markdown 导入任务 import-001：待审核</p>
      <button onClick={onNext}>进入题目审核</button>
    </section>
  );
}
```

Use equivalent simple pages for question review, figure review, and publish control. The publish page must display `只有审核通过内容可以发布`.

- [ ] **Step 3: Wire navigation**

`App.tsx` should move through import jobs -> question review -> figure review -> publish control.

- [ ] **Step 4: Verify build**

Run:

```powershell
npm run build
```

Expected: build passes.

### Task 3: Add Admin Browser Test

**Files:**
- Create: `D:/middle school/apps/admin-web/playwright.config.ts`
- Create: `D:/middle school/apps/admin-web/e2e/admin-review.spec.ts`

- [ ] **Step 1: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run dev -- --port 5175",
    url: "http://127.0.0.1:5175",
    reuseExistingServer: true,
  },
  use: { baseURL: "http://127.0.0.1:5175" },
});
```

- [ ] **Step 2: Add review flow test**

Create `admin-review.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("admin reviews and reaches publish control", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "进入题目审核" }).click();
  await expect(page.getByText("MATH-FUNC-LINEAR-001")).toBeVisible();
  await page.getByRole("button", { name: "题目审核通过" }).click();
  await expect(page.getByText("coordinate_line_graph")).toBeVisible();
  await page.getByRole("button", { name: "图形识别通过" }).click();
  await expect(page.getByText("只有审核通过内容可以发布")).toBeVisible();
});
```

- [ ] **Step 3: Verify admin E2E**

Run:

```powershell
npm run test:e2e
```

Expected: admin review flow passes.

### Task 4: Create MVP Verification Checklist

**Files:**
- Create: `D:/middle school/docs/testing/mvp-verification-checklist.md`

- [ ] **Step 1: Write checklist**

Create `mvp-verification-checklist.md`:

```md
# MVP Verification Checklist

## Student Flow

- [ ] Student can log in.
- [ ] Student can set target score to 80, 100, 110+, or full-score sprint.
- [ ] Student can complete initial diagnostic.
- [ ] Student can enter the linear-function module.
- [ ] Student can complete module diagnostic.
- [ ] Student receives a recommended task with a clear reason.
- [ ] Student can choose 10, 20, or 40 minute duration.
- [ ] Student can interact with k and b graph controls.
- [ ] Student can submit a practice answer.
- [ ] Student receives hint mode before answer mode.
- [ ] Student receives mistake reason after a wrong answer.
- [ ] Student receives a next task after report generation.
- [ ] Mistake enters retry list.

## AI Behavior

- [ ] Hint mode does not reveal final answer before submission.
- [ ] Explanation mode identifies student thought, mistake reason, and next step.
- [ ] Answer mode opens only after submission or repeated help.
- [ ] AI marks uncertainty instead of inventing graph conditions.

## Voice

- [ ] Student voice input is transcribed to visible text.
- [ ] Student can confirm or edit transcript before AI uses it.
- [ ] AI spoken explanation also appears as text.

## Question Bank

- [ ] Markdown question imports as pending_review.
- [ ] Reviewer can edit question, answer, explanation, tags, and figure recognition result.
- [ ] Unreviewed question cannot publish.
- [ ] Unusable question stays hidden from student APIs.

## Figure Recognition

- [ ] Figure result includes type, key elements, confidence, and review status.
- [ ] Low-confidence figure result is blocked from student explanation.
- [ ] Approved figure result can be used in reviewed explanation.

## Admin Review

- [ ] Admin can see import job status.
- [ ] Admin can approve a question.
- [ ] Admin can approve or correct figure recognition.
- [ ] Only approved content can be published.

## Reports

- [ ] Report shows completion, progress point, weak points, mistake reason, and next task.
- [ ] Report avoids exposing excessive backend analytics to student.

## Mobile And Visual QA

- [ ] Student task page has no horizontal overflow at 390 px width.
- [ ] Graph, formula, practice answer, and AI coach text do not overlap.
- [ ] Primary actions remain reachable without hiding voice controls.
```

- [ ] **Step 2: Verify checklist exists**

Run:

```powershell
Get-Content -Raw 'D:\middle school\docs\testing\mvp-verification-checklist.md'
```

Expected: checklist contains all eight sections.

## Self-Review

- Spec coverage: covers admin import, question review, figure review, publish control, and full release verification.
- Red-flag scan: no unfinished markers or unspecified implementation bucket remains.
- Type consistency: statuses and checks match the technical architecture and product acceptance criteria.
