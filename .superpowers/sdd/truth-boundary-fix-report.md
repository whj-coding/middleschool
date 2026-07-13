# Truth Boundary Fix Report

## Scope

- `ReportPage` renders `本次未发现明显薄弱点` when the latest report has an empty `weakPoints` array.
- `MistakeRecord` persists `taskId`; latest reports select mistakes by both the selected task and its incorrect question IDs.
- `ReportPage` uses neutral completion copy when the latest report contains no mistakes.

## TDD evidence

- Red: the service regression test received two mistakes for a shared question ID instead of only the latest task's mistake.
- Red: the UI regression test found an empty weak-point paragraph and the fixed `1 次错因复盘` claim.
- Green: focused API learning service tests pass (11/11); focused `ReportPage` tests pass (4/4).

## Verification

- API full tests: 43 passed, 1 known existing CRLF Markdown parser failure (`Missing section: 题干`). This failure was explicitly out of scope and was not modified.
- Student web full tests: 58/58 passed.
- Admin web full tests: 8/8 passed.
- API build: passed.
- Student web lint/build: passed.
- Admin web lint/build: passed.

## Concerns

- Historical mistake records created before `taskId` existed cannot be associated with a task and are intentionally excluded from task-scoped latest reports.
- The authorized CRLF Markdown parser failure remains unchanged.
