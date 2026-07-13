# P0 Truth Integration and CRLF Parser Plan

## Goal

Make `codex/learning-truth-review` fully green by fixing the cross-platform Markdown newline boundary, independently verify the truthful-learning changes, then fast-forward them into `codex/katex-content-figures` without touching the user's existing worktree changes.

## Phase 0: Documentation and Evidence

### Sources

- `docs/research/2026-07-13-round-2-3-code-review-assessment.md`
- `docs/superpowers/specs/2026-07-12-learning-truth-and-review-actions-design.md`
- `docs/superpowers/plans/2026-07-12-learning-truth-and-review-actions.md`
- `services/api/src/modules/content/markdownQuestionParser.ts`
- `services/api/src/modules/content/markdownQuestionParser.test.ts`
- `apps/student-web/src/components/ControlledContentRenderer.tsx:25-27`

### Allowed APIs and patterns

- Keep `parseMarkdownQuestion(markdown: string): Question` unchanged as the public interface.
- Normalize external text at that public boundary with `markdown.replace(/\r\n?/g, "\n")`.
- Use existing Vitest APIs and the tracked linear-function sample.
- Use existing package scripts only: `npm test`, `npm run build`, and the two frontend `npm run lint` scripts.

### Anti-pattern guards

- Do not change the fixture to LF, Git configuration, or `.gitattributes` to hide the production defect.
- Do not normalize only in the test.
- Do not weaken, skip, or delete tests.
- Do not change truthful-learning behavior, P1 features, `STATE.md`, `loop-run-log.md`, or `docs/research/`.
- Do not push or merge to `master`.

## Phase 1: Cross-platform Markdown parsing

### What to implement

1. Add an explicit test that converts the complete sample to CRLF and asserts the parsed `Question` matches the LF input.
2. Add mixed-line-ending and CR-only coverage if it fits the same parameterized test without changing parser semantics.
3. Observe the new test fail for the known `Missing section: 题干` reason.
4. Normalize line endings once at the `parseMarkdownQuestion` input boundary.

### Verification

- `npm test -- --run src/modules/content/markdownQuestionParser.test.ts`
- `npm test`
- `npm run build`

Expected: all API tests and build pass.

## Phase 2: Independent regression verification

### What to verify

- Student truthful answer, mistake, report, and retry flows remain green.
- Admin approve, request-changes, reject, and publish flows remain green.
- No forbidden paths changed.

### Verification

- Student: `npm test`, `npm run lint`, `npm run build`.
- Admin: `npm test`, `npm run lint`, `npm run build`.
- Repository: `git diff --check`, `git status --short`, and path-scope inspection.
- Independent code review must approve the parser fix and the complete branch.

## Phase 3: Safe integration

### Preconditions

- All three packages are fully green.
- `codex/learning-truth-review` is reviewed.
- `codex/katex-content-figures` remains the merge base and its existing changes are unchanged:
  - `STATE.md`
  - `loop-run-log.md`
  - `docs/research/`

### Integration

1. Commit the verified parser fix and this plan on `codex/learning-truth-review`.
2. Confirm `codex/learning-truth-review` is clean.
3. In `D:\middle school`, run `git merge --ff-only codex/learning-truth-review`.
4. Re-check branch ancestry, status, diff hygiene, and the three protected paths.
5. Do not push.

## Final acceptance

- API full suite has zero failures on the Windows worktree.
- Student and admin full suites, builds, and lints pass.
- Truthful-learning behavior remains independently approved.
- Current branch contains the truthful-learning commits through the parser fix.
- User-owned changes remain present and uncommitted exactly as before integration.
