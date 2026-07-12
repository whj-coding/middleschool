# Learning Truth and Review Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make practice outcomes, mistake reasons, review decisions, and report completion displays reflect real API data rather than fixed prototype values.

**Architecture:** The learning service remains the source of truth for grading and mistake diagnosis. Student UI passes its structured result through the existing reducer; admin UI calls narrowly scoped review-transition endpoints; report UI renders an optional API completion rate with a neutral fallback.

**Tech Stack:** TypeScript, React, Fastify, Vitest, Testing Library

## Global Constraints

- Do not change authentication, module diagnostics, graph bounds, vector search, knowledge graphs, Obsidian integration, prompt optimization, or unrelated pages.
- Preserve existing local changes in `STATE.md` and `loop-run-log.md`.
- Write a failing regression test before each production behavior change.
- Keep grading and mistake classification in the API service, not in the reducer.

---

### Task 1: Carry the real grading result through the student flow

**Files:**
- Modify: `services/api/src/modules/learning/service.ts`
- Test: `services/api/src/modules/learning/service.test.ts`
- Modify: `apps/student-web/src/services/practiceApi.ts`
- Test: `apps/student-web/src/services/practiceApi.test.ts`
- Modify: `apps/student-web/src/pages/PracticePage.tsx`
- Test: `apps/student-web/src/pages/PracticePage.test.tsx`
- Modify: `apps/student-web/src/state/learningFlow.ts`
- Test: `apps/student-web/src/state/learningFlow.test.ts`
- Modify: `apps/student-web/src/App.tsx`
- Test: `apps/student-web/src/App.test.tsx`

**Interfaces:**
- Produces: `PracticeSubmissionResult` with `correct`, `answer`, and optional `mistake: { questionId, reason, evidence }`.
- Consumes: existing `POST /practice/:sessionId/answers` response.

- [ ] **Step 1: Add failing service tests for correct and incorrect structured results**

Assert that the known correct expression returns `correct: true` without `mistake`, while an incorrect expression returns `correct: false` with the service-generated reason and evidence.

- [ ] **Step 2: Run the service test and verify RED**

Run: `npm test -- --run src/modules/learning/service.test.ts` in `services/api`.
Expected: FAIL because the current result does not expose the required structured mistake contract.

- [ ] **Step 3: Implement the minimal service result contract**

Return the persisted answer and the existing diagnostic fields as a nested optional `mistake`. Do not add client-side grading rules.

- [ ] **Step 4: Run the service test and verify GREEN**

Run: `npm test -- --run src/modules/learning/service.test.ts` in `services/api`.
Expected: PASS.

- [ ] **Step 5: Add failing student tests for propagation and reducer branching**

Cover these exact behaviors:

```ts
expect(correctState.currentPage).toBe("report");
expect(correctState.mistakes).toEqual([]);
expect(wrongState.currentPage).toBe("mistake");
expect(wrongState.mistakes[0]).toEqual(apiResult.mistake);
```

Also assert that `PracticePage` calls `onSubmit(result)` with the API response and does not call it when the request fails.

- [ ] **Step 6: Run focused student tests and verify RED**

Run: `npm test -- --run src/services/practiceApi.test.ts src/pages/PracticePage.test.tsx src/state/learningFlow.test.ts src/App.test.tsx` in `apps/student-web`.
Expected: FAIL because `onSubmit` currently has no parameter and the reducer accepts a fixed answer.

- [ ] **Step 7: Implement minimal student propagation**

Export `PracticeSubmissionResult` from `practiceApi.ts`; change `PracticePage` to `onSubmit(result)` only after a successful grading request; change the reducer action to carry that result; remove the fixed answer dispatch from `App.tsx`. Preserve student input and display a retry message when grading fails.

- [ ] **Step 8: Run focused student tests and verify GREEN**

Run the command from Step 6.
Expected: PASS.

- [ ] **Step 9: Commit Task 1**

```bash
git add services/api/src/modules/learning apps/student-web/src/services/practiceApi.ts apps/student-web/src/services/practiceApi.test.ts apps/student-web/src/pages/PracticePage.tsx apps/student-web/src/pages/PracticePage.test.tsx apps/student-web/src/state/learningFlow.ts apps/student-web/src/state/learningFlow.test.ts apps/student-web/src/App.tsx apps/student-web/src/App.test.tsx
git commit -m "fix(learning): use real grading results in student flow"
```

### Task 2: Add reasoned needs-revision and rejection transitions

**Files:**
- Modify: `services/api/src/modules/content/reviewService.ts`
- Test: `services/api/src/modules/content/reviewService.test.ts`
- Modify: `services/api/src/modules/content/routes.ts`
- Test: `services/api/src/server.test.ts`
- Modify: `apps/admin-web/src/services/contentApi.ts`
- Test: `apps/admin-web/src/services/contentApi.test.ts`
- Modify: `apps/admin-web/src/pages/QuestionReviewPage.tsx`
- Test: `apps/admin-web/src/pages/QuestionReviewPage.test.tsx`

**Interfaces:**
- Produces: `requestQuestionChanges(question, reason)` and `rejectQuestion(question, reason)` returning the updated question with `reviewStatus` and `reviewReason`.
- Produces endpoints: `POST /admin/questions/:questionId/request-changes` and `POST /admin/questions/:questionId/reject`, JSON `{ reason: string }`.

- [ ] **Step 1: Add failing domain tests**

Assert trimmed non-empty reasons create `needs_revision` or `rejected` results, and blank reasons throw `review_reason_required`.

- [ ] **Step 2: Run the review service test and verify RED**

Run: `npm test -- --run src/modules/content/reviewService.test.ts` in `services/api`.
Expected: FAIL because the transition functions do not exist.

- [ ] **Step 3: Implement the two pure transitions**

Add only the reason validation and status update needed by the tests. Extend the question type with optional `reviewReason` if required.

- [ ] **Step 4: Add failing route and admin-client tests**

Assert both endpoint paths, POST bodies, returned states, and HTTP 400 for blank reasons. Assert the admin client sends JSON `{ reason }`.

- [ ] **Step 5: Run route/client tests and verify RED**

Run API `npm test -- --run src/server.test.ts` and admin `npm test -- --run src/services/contentApi.test.ts`.
Expected: FAIL with missing routes/functions.

- [ ] **Step 6: Implement routes and client functions**

Follow the current approve/publish repository update pattern. On invalid reason return HTTP 400 without mutating the stored question.

- [ ] **Step 7: Add failing review-page interaction tests**

Assert the reviewer can enter a reason and trigger “需修改” or “驳回”; blank input keeps actions disabled; API failure leaves the displayed review state unchanged.

- [ ] **Step 8: Implement the two focused UI actions**

Add one reason input and two buttons to the existing question review area. Do not restructure the page or add content-unit transitions.

- [ ] **Step 9: Run all Task 2 focused tests and verify GREEN**

Run the commands from Steps 2, 5, and 7.
Expected: PASS.

- [ ] **Step 10: Commit Task 2**

```bash
git add services/api/src/modules/content apps/admin-web/src/services/contentApi.ts apps/admin-web/src/services/contentApi.test.ts apps/admin-web/src/pages/QuestionReviewPage.tsx apps/admin-web/src/pages/QuestionReviewPage.test.tsx services/api/src/server.test.ts
git commit -m "feat(review): add reasoned revision and rejection actions"
```

### Task 3: Replace the fabricated report score

**Files:**
- Modify: `services/api/src/modules/learning/service.ts`
- Test: `services/api/src/modules/learning/service.test.ts`
- Modify: `apps/student-web/src/services/reportApi.ts`
- Test: `apps/student-web/src/services/reportApi.test.ts`
- Modify: `apps/student-web/src/pages/ReportPage.tsx`
- Test: `apps/student-web/src/pages/ReportPage.test.tsx`

**Interfaces:**
- Produces: optional `completionRate: number` in `LatestReport`, constrained to `0..100`.

- [ ] **Step 1: Add failing API and UI tests**

Assert a report with available attempt data returns a numeric `completionRate`; assert the page displays `${completionRate}%`; assert a response without it displays `本次已完成` and never `42%`.

- [ ] **Step 2: Run focused tests and verify RED**

Run API `npm test -- --run src/modules/learning/service.test.ts` and student `npm test -- --run src/services/reportApi.test.ts src/pages/ReportPage.test.tsx`.
Expected: FAIL because the field and neutral fallback do not exist.

- [ ] **Step 3: Implement completion rate and fallback**

Compute the rate only from existing persisted attempt/report data. Add the optional client type and render it when present; otherwise render `本次已完成`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the commands from Step 2.
Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add services/api/src/modules/learning/service.ts services/api/src/modules/learning/service.test.ts apps/student-web/src/services/reportApi.ts apps/student-web/src/services/reportApi.test.ts apps/student-web/src/pages/ReportPage.tsx apps/student-web/src/pages/ReportPage.test.tsx
git commit -m "fix(report): render measured completion data"
```

### Task 4: Full verification and independent review

**Files:**
- Verify only; modify only files already in scope if a test or review identifies a defect.

- [ ] **Step 1: Run repository checks**

Run `npm test`, `npm run lint`, and `npm run build` in each of `apps/student-web`, `apps/admin-web`, and `services/api` when the script exists. Record any absent script rather than inventing one.

- [ ] **Step 2: Inspect the final diff**

Run `git diff --check` and `git status --short`. Confirm `STATE.md` and `loop-run-log.md` remain untouched by this implementation.

- [ ] **Step 3: Request independent verification and code review**

One verifier checks behavior and commands; a separate reviewer checks scope, API ownership, failure handling, and test gaps. Address only findings within this plan.

- [ ] **Step 4: Commit bounded review fixes if needed**

Use a narrow commit that names the reviewed defect. Do not amend unrelated commits.
