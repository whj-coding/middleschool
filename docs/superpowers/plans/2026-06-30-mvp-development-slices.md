# AI Middle School Learning MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved one-variable linear-function prototype into a scoped MVP development plan with independently testable frontend, backend, AI, content-review, and verification slices.

**Architecture:** Build one narrow vertical slice first: student profile -> diagnostic -> recommended linear-function task -> practice -> mistake analysis -> report. Keep AI, voice, OCR, and figure recognition behind adapter interfaces so the MVP can run with deterministic mocks before real model integrations are enabled.

**Tech Stack:** React/Vite frontend, Node.js API service, PostgreSQL data model, file storage adapter, AI/STT/TTS/OCR adapters, Markdown question import format, automated API and browser tests.

---

## File Structure

Planned files and responsibilities for the MVP build:

- `apps/student-web/`: production student-facing React app, evolved from `prototype-fresh-study-tool/` after the technical stack is confirmed.
- `apps/admin-web/`: content and question review UI.
- `services/api/`: HTTP API for auth, learning profile, diagnostics, tasks, practice, reports, and admin review.
- `services/api/src/modules/learning/`: student learning workflow domain.
- `services/api/src/modules/content/`: question bank, import jobs, review, publish control.
- `services/api/src/modules/ai/`: AI orchestration and provider adapters.
- `services/api/src/modules/voice/`: STT/TTS adapters and transcript records.
- `services/api/src/db/`: migrations, seeds, and database access.
- `packages/shared/`: shared DTOs, enums, validation schemas, and Markdown question types.
- `docs/technical/2026-06-30-mvp-technical-architecture.md`: current technical architecture reference.
- `docs/testing/mvp-verification-checklist.md`: manual and automated MVP verification checklist.

## Scope Decision

The full MVP spans multiple subsystems. Implement it as five separate plans after this stage document is accepted:

1. Student learning vertical slice.
2. Backend data and task workflow.
3. AI orchestration and voice adapters.
4. Question bank import and review backend.
5. Admin review UI and release verification.

This document is the routing plan for those implementation plans; it intentionally does not merge all subsystems into one oversized task list.

### Task 1: Confirm Repository Shape

**Files:**
- Read: `D:/middle school/AGENTS.md`
- Read: `D:/middle school/docs/superpowers/specs/2026-06-30-ai-middle-school-learning-mvp-design.md`
- Read: `D:/middle school/docs/prototypes/2026-06-30-mvp-wireframe-flow.md`
- Read: `D:/middle school/docs/technical/2026-06-30-mvp-technical-architecture.md`

- [ ] **Step 1: Inspect current project roots**

Run:

```powershell
Get-ChildItem -Force 'D:\middle school'
```

Expected: output includes `docs`, `prototype-fresh-study-tool`, `AGENTS.md`, and `design-qa.md`.

- [ ] **Step 2: Verify prototype still builds**

Run:

```powershell
npm run build
```

Working directory:

```text
D:\middle school\prototype-fresh-study-tool
```

Expected: Vite build completes with `built in` and no errors.

- [ ] **Step 3: Decide app structure before moving code**

Record one decision in the implementation issue or commit body:

```text
Decision: keep prototype-fresh-study-tool as design evidence; create production MVP app under apps/student-web instead of overwriting the prototype.
```

### Task 2: Write Student Learning Vertical Slice Plan

**Files:**
- Create: `D:/middle school/docs/superpowers/plans/2026-06-30-student-learning-vertical-slice.md`
- Reference: `D:/middle school/docs/technical/2026-06-30-mvp-technical-architecture.md`

- [ ] **Step 1: Define the vertical slice goal**

Write this header:

```markdown
# Student Learning Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the student path from goal setup through one linear-function task, practice submission, mistake feedback, and a next-task recommendation.

**Architecture:** Start with deterministic local data and mock AI responses, then connect to API contracts once the backend slice lands. Keep the interactive `y = kx + b` component isolated so it can be reused in tasks and practice review.

**Tech Stack:** React, Vite, TypeScript, CSS, shared DTO schemas, browser tests.

---
```

- [ ] **Step 2: Include required screens**

Add sections for these screens with explicit acceptance checks:

```markdown
- Goal setup: student chooses 80, 100, 110+, or full-score sprint.
- Initial diagnostic: 10-15 question shell with confidence capture.
- Today task: one primary recommendation with reason, duration, and completion standard.
- Linear-function task: life scenario, guided concept, graph exploration, quick practice.
- Practice: answer submission, hint mode before submit, explanation mode after submit.
- Mistake review: mistake reason, evidence, similar question.
- Report: completion, progress point, 1-3 weak points, next task.
```

- [ ] **Step 3: Add verification commands**

Include these commands:

```powershell
npm run build
npm run test
npm run test:e2e
```

Expected: build passes, component tests pass, and the browser test completes the student vertical slice without console errors.

### Task 3: Write Backend Workflow Plan

**Files:**
- Create: `D:/middle school/docs/superpowers/plans/2026-06-30-backend-learning-workflow.md`
- Reference: `D:/middle school/docs/technical/2026-06-30-mvp-technical-architecture.md`

- [ ] **Step 1: Define domain modules**

Write modules exactly as:

```text
auth
student_profiles
diagnostics
learning_tasks
practice
mistakes
reports
content
ai
voice
```

- [ ] **Step 2: Define first migrations**

Include migration coverage for:

```text
users
student_profiles
diagnostic_sessions
diagnostic_answers
learning_tasks
practice_sessions
student_answers
mistake_records
ai_conversations
ai_messages
```

- [ ] **Step 3: Define API acceptance tests**

Add tests for:

```text
POST /auth/login
PUT /student/profile/goal
POST /diagnostics/initial/start
POST /diagnostics/:sessionId/answers
GET /tasks/today
POST /tasks/:taskId/start
POST /practice/:sessionId/answers
GET /reports/latest
```

Expected: tests prove a new student can reach a generated next-task recommendation.

### Task 4: Write AI And Voice Adapter Plan

**Files:**
- Create: `D:/middle school/docs/superpowers/plans/2026-06-30-ai-voice-orchestration.md`
- Reference: `D:/middle school/docs/technical/2026-06-30-mvp-technical-architecture.md`

- [ ] **Step 1: Define adapter interfaces**

Document these interfaces:

```text
CoachAgent.generateReply(context)
DiagnosticAgent.evaluate(session)
TaskRecommendationAgent.recommend(profile)
ReportAgent.generateSummary(reportData)
SpeechToText.transcribe(audio)
TextToSpeech.synthesize(text, voiceOptions)
```

- [ ] **Step 2: Define guardrails**

Include these non-negotiable rules:

```text
Before answer submission, default to hint mode.
After answer submission, explanation mode can give structured solution steps.
Answer mode opens only after submission or repeated help.
Low-confidence figure recognition cannot be used in student explanation.
Every voice answer must have visible text.
AI uncertainty must be explicit.
```

- [ ] **Step 3: Define mock-first tests**

Expected tests:

```text
hint mode does not reveal final answer
explanation mode includes mistake reason and next step
report output includes progress, weak point, mistake reason, next task
voice transcript is stored before entering AI context
```

### Task 5: Write Question Bank And Review Plan

**Files:**
- Create: `D:/middle school/docs/superpowers/plans/2026-06-30-question-bank-review.md`
- Reference: `D:/middle school/docs/technical/2026-06-30-mvp-technical-architecture.md`

- [ ] **Step 1: Start with Markdown import**

Define first supported import source:

```text
Markdown question files using the format in the product design document.
```

Expected: PDF, Word, and scanned images are represented as import job states and adapter interfaces, but the first working parser is Markdown.

- [ ] **Step 2: Define review states**

Use these exact states:

```text
pending_recognition
recognition_failed
pending_review
needs_revision
approved
published
unusable
```

- [ ] **Step 3: Define publish protection tests**

Expected tests:

```text
unreviewed question cannot be published
question without approved answer cannot be published
low-confidence figure recognition cannot be exposed to student explanation
approved question can be published and returned to student task API
```

### Task 6: Write MVP Verification Checklist

**Files:**
- Create: `D:/middle school/docs/testing/mvp-verification-checklist.md`

- [ ] **Step 1: Create checklist sections**

Use these sections:

```markdown
# MVP Verification Checklist

## Student Flow
## AI Behavior
## Voice
## Question Bank
## Figure Recognition
## Admin Review
## Reports
## Mobile And Visual QA
```

- [ ] **Step 2: Add must-pass student checks**

Include:

```text
Student can log in.
Student can set target score.
Student can complete initial diagnostic.
Student can enter linear-function module.
Student can complete module diagnostic.
Student receives a recommended task with reason.
Student can change 10/20/40 minute duration.
Student can interact with k and b graph.
Student can submit practice answer.
Student receives hint before answer mode.
Student receives mistake reason after wrong answer.
Student receives next task after report.
Mistake enters retry list.
```

- [ ] **Step 3: Add admin and content checks**

Include:

```text
Markdown question imports as pending_review.
Reviewer can edit question, answer, explanation, tags, and figure recognition result.
Only approved content can publish.
Published question appears in student practice.
Unusable question stays hidden from student APIs.
```

## Self-Review

- Spec coverage: this routing plan covers the product design requirements by splitting the MVP into student flow, backend workflow, AI/voice, question bank/review, and verification plans.
- Red-flag scan: no unfinished markers or unspecified implementation bucket remains in this plan.
- Type consistency: planned module and adapter names match the technical architecture document.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-30-mvp-development-slices.md`. Two execution options:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Inline Execution - execute tasks in this session using executing-plans, batch execution with checkpoints.

Recommended next choice for this project: Subagent-Driven, because frontend, backend, AI orchestration, question review, and verification have separate write scopes.
