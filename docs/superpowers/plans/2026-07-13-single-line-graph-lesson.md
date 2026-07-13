# Single-Line Graph Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed once-function illustration with a task-driven, mathematically truthful single-line lesson that teaches `k`, `b`, and point substitution.

**Architecture:** A local `taskId -> LinearFunctionLesson` registry is the temporary content source. The page renders prompt, conditions, goals, and graph from that lesson; the graph delegates clipping and point math to pure functions and owns only the current exploration state.

**Tech Stack:** TypeScript, React, SVG, Vitest, Testing Library, CSS

## Global Constraints

- This slice implements one primary line only.
- Do not add a comparison line, intersection, parallel/coincident logic, hidden dual-line state, backend lesson API, or content schema changes.
- Do not modify authentication, AI mode state, module diagnostics, reports, practice grading, admin review, or the prototype directory.
- Prompt, conditions, points, initial line, viewport, and learning goals must come from one `LinearFunctionLesson`.
- A completely invisible line returns `null`; an invisible intercept is never clamped and presented as real.
- Unknown task IDs show an explicit unavailable state and never borrow another task's conditions.
- Preserve `STATE.md`, `loop-run-log.md`, and `docs/research/` user changes.
- Every production behavior change requires a failing test first.

---

### Task 1: Define the lesson model and local registry

**Files:**
- Create: `apps/student-web/src/lessons/linearFunctionLessons.ts`
- Create: `apps/student-web/src/lessons/linearFunctionLessons.test.ts`

**Interfaces:**
- Produces: `GraphViewport`, `LinearEquation`, `GraphPoint`, `LinearFunctionGraphModel`, `LinearFunctionLesson`.
- Produces: `getLinearFunctionLesson(taskId: string): LinearFunctionLesson | null`.

- [ ] **Step 1: Write the failing registry tests**

Cover the exact current task contract:

```ts
const lesson = getLinearFunctionLesson("task-linear-kb");
expect(lesson?.prompt).toContain("(2, 3)");
expect(lesson?.conditions).toEqual(expect.arrayContaining([expect.stringContaining("(0, -1)")]));
expect(lesson?.graph.initialLine).toEqual({ k: 1, b: -1 });
expect(lesson?.graph.givenPoints).toEqual([
  { id: "point-p", label: "P", x: 2, y: 3, role: "given" },
  { id: "point-y-intercept", label: "Q", x: 0, y: -1, role: "given" },
]);
expect(getLinearFunctionLesson("unknown-task")).toBeNull();
```

Also assert the lesson object has no `comparisonLine`, `intersection`, or second-line field.

- [ ] **Step 2: Run the registry test and verify RED**

Run in `apps/student-web`:

```powershell
npm test -- --run src/lessons/linearFunctionLessons.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the typed local registry**

Create the exported types and one `task-linear-kb` entry. Use a viewport that contains both axes and the two points with equal x/y unit scale; do not include a second line. Return `null` for unknown IDs.

- [ ] **Step 4: Run the registry test and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```powershell
git add apps/student-web/src/lessons/linearFunctionLessons.ts apps/student-web/src/lessons/linearFunctionLessons.test.ts
git commit -m "feat(student): define single-line lesson model"
```

### Task 2: Extract truthful graph geometry

**Files:**
- Create: `apps/student-web/src/components/linearGraphGeometry.ts`
- Create: `apps/student-web/src/components/linearGraphGeometry.test.ts`

**Interfaces:**
- Consumes: `GraphViewport`, `LinearEquation`, `GraphPoint` from Task 1.
- Produces: `clipLineToViewport(line, viewport): LineSegment | null`.
- Produces: `getVisibleYIntercept(line, viewport): GraphPoint | null`.
- Produces: `evaluatePointOnLine(point, line): { onLine: boolean; expectedY: number; difference: number }`.

- [ ] **Step 1: Write failing geometry tests**

Cover:

```ts
expect(clipLineToViewport({ k: 0, b: 9 }, viewport)).toBeNull();
expect(getVisibleYIntercept({ k: 1, b: 9 }, viewport)).toBeNull();
expect(evaluatePointOnLine({ x: 2, y: 3 }, { k: 2, b: -1 })).toMatchObject({ onLine: true, expectedY: 3 });
expect(evaluatePointOnLine({ x: 2, y: 3 }, { k: 1, b: -1 })).toMatchObject({ onLine: false, expectedY: 1, difference: 2 });
```

Add positive, negative, visible horizontal, and corner-touching clipping cases. Every returned endpoint must lie within the provided viewport tolerance.

- [ ] **Step 2: Run the geometry test and verify RED**

```powershell
npm test -- --run src/components/linearGraphGeometry.test.ts
```

Expected: FAIL because the geometry module does not exist.

- [ ] **Step 3: Implement minimal pure geometry**

Compute intersections with all four viewport boundaries, deduplicate corner points using a small epsilon, choose the furthest pair, and return `null` when fewer than two distinct intersections exist. Never return a fabricated fallback segment. Intercept visibility requires `x=0` and `b` inside the viewport. Point evaluation uses the same epsilon for decimal tolerance.

- [ ] **Step 4: Run the geometry test and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```powershell
git add apps/student-web/src/components/linearGraphGeometry.ts apps/student-web/src/components/linearGraphGeometry.test.ts
git commit -m "feat(student): add truthful single-line geometry"
```

### Task 3: Rebuild the graph as a model-driven teaching component

**Files:**
- Modify: `apps/student-web/src/components/LinearFunctionGraph.tsx`
- Modify: `apps/student-web/src/components/LinearFunctionGraph.test.tsx`
- Modify: `apps/student-web/src/styles.css`

**Interfaces:**
- Consumes: `model: LinearFunctionGraphModel`.
- Consumes: pure functions from Task 2.
- Produces: interactive `k/b` exploration, reset, point check, dynamic text alternative, and unavailable-line state.

- [ ] **Step 1: Replace the component tests with failing model-driven behavior tests**

Test one model fixture and assert:

- Given-point labels and coordinates come from the model.
- No fixed `y = -x + 5`, “交点 B”, comparison line, zoom button, or fake x-axis point is present.
- Changing `k` to `2` and `b` to `-1` updates the formula and makes `(2,3)` pass substitution.
- Changing `k` through positive, zero, and negative values updates the text trend.
- A line outside the viewport shows `当前直线超出可视范围` and has no primary SVG line.
- An invisible intercept produces text but no intercept circle.
- Reset restores `model.initialLine` and clears point-check feedback.
- Empty/non-finite input leaves the last valid line rendered and shows an input message.

- [ ] **Step 2: Run the component test and verify RED**

```powershell
npm test -- --run src/components/LinearFunctionGraph.test.tsx
```

Expected: FAIL because the component has no `model` prop and renders fixed comparison semantics.

- [ ] **Step 3: Implement the model-driven component**

Change the public signature to:

```ts
export function LinearFunctionGraph({ model }: { model: LinearFunctionGraphModel })
```

Keep the last valid numeric `k/b` state, derive formula/trend/intercept from it, render model points, and use Task 2 geometry. Add a reset action and a select-or-button point check. Add a concise `aria-live` result and SVG accessible name/description. Remove nonfunctional zoom/grid actions and every fixed second-line/intersection element.

- [ ] **Step 4: Add minimal responsive/accessibility CSS**

Keep existing visual language. Ensure labels and inputs remain usable at 390px, controls wrap, focus is visible, and the graph status does not rely on color alone. Do not restyle unrelated pages.

- [ ] **Step 5: Run focused tests and verify GREEN**

```powershell
npm test -- --run src/components/linearGraphGeometry.test.ts src/components/LinearFunctionGraph.test.tsx
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```powershell
git add apps/student-web/src/components/LinearFunctionGraph.tsx apps/student-web/src/components/LinearFunctionGraph.test.tsx apps/student-web/src/styles.css
git commit -m "feat(student): teach k and b with one truthful line"
```

### Task 4: Drive the task page from the lesson registry

**Files:**
- Modify: `apps/student-web/src/pages/LinearFunctionTaskPage.tsx`
- Modify: `apps/student-web/src/pages/LinearFunctionTaskPage.test.tsx`
- Modify: `apps/student-web/src/App.tsx`
- Modify: `apps/student-web/src/App.test.tsx`

**Interfaces:**
- Consumes: `taskId` and optional display task metadata.
- Consumes: `getLinearFunctionLesson(taskId)` and `LinearFunctionGraph` from earlier tasks.
- Produces: one coherent single-line page or an explicit unavailable state.

- [ ] **Step 1: Write failing page integration tests**

Assert:

- `task-linear-kb` page renders lesson prompt, both conditions, both goals, and the model-driven graph.
- The page contains no “两条直线”, “联立”, “交点 B”, or fixed intersection-error statistics.
- An unknown task ID renders `该任务的交互图尚未配置`, does not render another lesson's points, and provides a return action.
- Starting a different task resets the graph by keying the component to `taskId`.

- [ ] **Step 2: Run page/App tests and verify RED**

```powershell
npm test -- --run src/pages/LinearFunctionTaskPage.test.tsx src/App.test.tsx
```

Expected: FAIL because the page still owns fixed conditions and always renders the zero-prop graph.

- [ ] **Step 3: Implement lesson lookup and page states**

Use `state.activeTaskId`/task metadata to pass an exact task ID. Render prompt, conditions, goals, and graph from the selected lesson. Use `key={lesson.taskId}` for reset. Remove the unrelated two-line coach narrative and replace it with single-line `k/b` guidance derived from the lesson goals. Unknown tasks must not reuse `task-linear-kb` conditions.

- [ ] **Step 4: Run page/App tests and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Run the student package regression suite**

```powershell
npm test
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit Task 4**

```powershell
git add apps/student-web/src/pages/LinearFunctionTaskPage.tsx apps/student-web/src/pages/LinearFunctionTaskPage.test.tsx apps/student-web/src/App.tsx apps/student-web/src/App.test.tsx
git commit -m "feat(student): drive graph lesson from task data"
```

### Task 5: Full verification and independent review

**Files:**
- Verify only; fixes may modify only files named in Tasks 1–4.

- [ ] **Step 1: Run repository checks**

Run existing tests, builds, and lints in `apps/student-web`, `apps/admin-web`, and `services/api`. Run `git diff --check` and inspect changed paths.

- [ ] **Step 2: Run browser-level student flow checks**

Use the existing student Playwright configuration to verify the task page at desktop and 390px. Check that the single-line graph, formula, controls, and status fit without page-level horizontal overflow and that existing learning flow remains usable.

- [ ] **Step 3: Independent review**

A fresh reviewer checks mathematical truth, single-source lesson data, accessibility, task switching, absence of dual-line scope, and regression coverage. Critical and Important findings must be fixed and re-reviewed.

- [ ] **Step 4: Integration handoff**

Keep the branch/worktree isolated until the user chooses merge, PR, keep, or discard. Do not push automatically.
