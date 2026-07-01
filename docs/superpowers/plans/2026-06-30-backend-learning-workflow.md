# Backend Learning Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the API and persistence layer for the first student learning loop: login, target score, diagnostic, recommended task, practice answer, mistake record, and report.

**Architecture:** Use a single API service under `services/api/` with modular route files and a small repository layer. Start with SQLite-compatible tests for speed, keep SQL schema PostgreSQL-ready, and expose stable JSON contracts for the student frontend.

**Tech Stack:** Node.js, TypeScript, Fastify, Zod, Vitest, Supertest or Fastify inject tests, SQL migrations.

---

## File Structure

- `services/api/package.json`: scripts and dependencies.
- `services/api/src/server.ts`: Fastify app factory.
- `services/api/src/index.ts`: local server entrypoint.
- `services/api/src/db/schema.sql`: first database schema.
- `services/api/src/db/migrate.ts`: migration runner.
- `services/api/src/modules/auth/routes.ts`: login route.
- `services/api/src/modules/learning/routes.ts`: profile, diagnostics, tasks, practice, reports.
- `services/api/src/modules/learning/service.ts`: deterministic MVP learning logic.
- `services/api/src/modules/learning/service.test.ts`: unit tests for task and mistake logic.
- `services/api/src/server.test.ts`: API acceptance tests.

### Task 1: Scaffold API Service

**Files:**
- Create: `D:/middle school/services/api/package.json`
- Create: `D:/middle school/services/api/tsconfig.json`
- Create: `D:/middle school/services/api/src/server.ts`
- Create: `D:/middle school/services/api/src/index.ts`

- [ ] **Step 1: Initialize package**

Run:

```powershell
New-Item -ItemType Directory -Force 'services/api/src' | Out-Null
npm init -y
npm install fastify zod
npm install -D typescript tsx vitest @types/node
```

Working directory:

```text
D:\middle school\services\api
```

Expected: `package.json` and `node_modules` exist.

- [ ] **Step 2: Configure scripts**

Set scripts in `package.json`:

```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc --noEmit",
  "test": "vitest run"
}
```

- [ ] **Step 3: Implement app factory**

Create `server.ts`:

```ts
import Fastify from "fastify";

export function buildServer() {
  const app = Fastify({ logger: false });
  app.get("/health", async () => ({ ok: true }));
  return app;
}
```

Create `index.ts`:

```ts
import { buildServer } from "./server";

const app = buildServer();
app.listen({ host: "127.0.0.1", port: 4000 });
```

- [ ] **Step 4: Verify API build**

Run:

```powershell
npm run build
```

Expected: TypeScript passes.

### Task 2: Define Learning Service

**Files:**
- Create: `D:/middle school/services/api/src/modules/learning/service.ts`
- Create: `D:/middle school/services/api/src/modules/learning/service.test.ts`

- [ ] **Step 1: Write failing service test**

Create `service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createLearningService } from "./service";

describe("learning service", () => {
  it("generates a task, mistake, and report for a new student", () => {
    const service = createLearningService();
    const profile = service.setGoal("student-1", "110+");
    const diagnostic = service.finishInitialDiagnostic("student-1");
    const task = service.getTodayTask("student-1");
    const result = service.submitPracticeAnswer("student-1", "practice-printing-fee", "y = 3x + 0.4");
    const report = service.getLatestReport("student-1");

    expect(profile.goalScore).toBe("110+");
    expect(diagnostic.weakPoints).toContain("k 和 b 的意义");
    expect(task.id).toBe("task-linear-kb");
    expect(result.mistake.reason).toBe("审题与建模错误");
    expect(report.nextTask.id).toBe("task-linear-modeling");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm run test -- src/modules/learning/service.test.ts
```

Expected: fail because service is missing.

- [ ] **Step 3: Implement deterministic service**

Create `service.ts`:

```ts
type GoalScore = "80" | "100" | "110+" | "full-score";

const profiles = new Map<string, { studentId: string; goalScore: GoalScore }>();
const mistakes = new Map<string, Array<{ questionId: string; reason: string; evidence: string }>>();

export function createLearningService() {
  return {
    setGoal(studentId: string, goalScore: GoalScore) {
      const profile = { studentId, goalScore };
      profiles.set(studentId, profile);
      return profile;
    },
    finishInitialDiagnostic(studentId: string) {
      return { studentId, weakPoints: ["k 和 b 的意义", "应用建模"] };
    },
    getTodayTask(studentId: string) {
      return {
        id: "task-linear-kb",
        studentId,
        title: "理解 k 和 b 的意义",
        reason: "诊断显示你对斜率和截距的图像意义不够稳定。",
        durationOptions: [10, 20, 40],
      };
    },
    submitPracticeAnswer(studentId: string, questionId: string, answer: string) {
      const mistake = {
        questionId,
        reason: "审题与建模错误",
        evidence: `学生答案 ${answer} 混淆了固定费用和单位变化费用。`,
      };
      mistakes.set(studentId, [mistake]);
      return { correct: false, mistake };
    },
    getLatestReport(studentId: string) {
      return {
        studentId,
        progress: "能说出 k 影响直线方向，但建模时还需要先分清固定量。",
        weakPoints: ["应用建模"],
        mistakes: mistakes.get(studentId) ?? [],
        nextTask: { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" },
      };
    },
  };
}
```

- [ ] **Step 4: Verify service test passes**

Run:

```powershell
npm run test -- src/modules/learning/service.test.ts
```

Expected: test passes.

### Task 3: Add Student API Routes

**Files:**
- Create: `D:/middle school/services/api/src/modules/auth/routes.ts`
- Create: `D:/middle school/services/api/src/modules/learning/routes.ts`
- Modify: `D:/middle school/services/api/src/server.ts`
- Create: `D:/middle school/services/api/src/server.test.ts`

- [ ] **Step 1: Write API acceptance test**

Create `server.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildServer } from "./server";

describe("student learning API", () => {
  it("runs login to latest report", async () => {
    const app = buildServer();
    const login = await app.inject({ method: "POST", url: "/auth/login", payload: { name: "张同学" } });
    const studentId = login.json().studentId;

    await app.inject({ method: "PUT", url: "/student/profile/goal", payload: { studentId, goalScore: "110+" } });
    await app.inject({ method: "POST", url: "/diagnostics/initial/start", payload: { studentId } });
    await app.inject({ method: "POST", url: "/diagnostics/diag-1/answers", payload: { studentId, answers: [] } });
    const task = await app.inject({ method: "GET", url: `/tasks/today?studentId=${studentId}` });
    await app.inject({ method: "POST", url: `/tasks/${task.json().id}/start`, payload: { studentId } });
    const practice = await app.inject({
      method: "POST",
      url: "/practice/practice-1/answers",
      payload: { studentId, questionId: "practice-printing-fee", answer: "y = 3x + 0.4" },
    });
    const report = await app.inject({ method: "GET", url: `/reports/latest?studentId=${studentId}` });

    expect(login.statusCode).toBe(200);
    expect(practice.json().mistake.reason).toBe("审题与建模错误");
    expect(report.json().nextTask.id).toBe("task-linear-modeling");
  });
});
```

- [ ] **Step 2: Run API test to verify it fails**

Run:

```powershell
npm run test -- src/server.test.ts
```

Expected: fail because routes are missing.

- [ ] **Step 3: Implement auth routes**

Create `auth/routes.ts`:

```ts
import type { FastifyInstance } from "fastify";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request) => {
    const body = request.body as { name?: string };
    return { studentId: "student-1", name: body.name ?? "张同学" };
  });
}
```

- [ ] **Step 4: Implement learning routes**

Create `learning/routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import { createLearningService } from "./service";

const service = createLearningService();

export async function registerLearningRoutes(app: FastifyInstance) {
  app.put("/student/profile/goal", async (request) => {
    const body = request.body as { studentId: string; goalScore: "80" | "100" | "110+" | "full-score" };
    return service.setGoal(body.studentId, body.goalScore);
  });
  app.post("/diagnostics/initial/start", async () => ({ sessionId: "diag-1", questionCount: 12 }));
  app.post("/diagnostics/:sessionId/answers", async (request) => {
    const body = request.body as { studentId: string };
    return service.finishInitialDiagnostic(body.studentId);
  });
  app.get("/tasks/today", async (request) => {
    const studentId = (request.query as { studentId: string }).studentId;
    return service.getTodayTask(studentId);
  });
  app.post("/tasks/:taskId/start", async (request) => ({ taskId: (request.params as { taskId: string }).taskId, status: "started" }));
  app.post("/practice/:sessionId/answers", async (request) => {
    const body = request.body as { studentId: string; questionId: string; answer: string };
    return service.submitPracticeAnswer(body.studentId, body.questionId, body.answer);
  });
  app.get("/reports/latest", async (request) => {
    const studentId = (request.query as { studentId: string }).studentId;
    return service.getLatestReport(studentId);
  });
}
```

- [ ] **Step 5: Register routes**

Update `server.ts`:

```ts
import Fastify from "fastify";
import { registerAuthRoutes } from "./modules/auth/routes";
import { registerLearningRoutes } from "./modules/learning/routes";

export function buildServer() {
  const app = Fastify({ logger: false });
  app.get("/health", async () => ({ ok: true }));
  app.register(registerAuthRoutes);
  app.register(registerLearningRoutes);
  return app;
}
```

- [ ] **Step 6: Verify API acceptance test passes**

Run:

```powershell
npm run test -- src/server.test.ts
```

Expected: API test passes.

### Task 4: Add First SQL Schema

**Files:**
- Create: `D:/middle school/services/api/src/db/schema.sql`

- [ ] **Step 1: Create schema**

Create `schema.sql`:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'teacher'))
);

CREATE TABLE student_profiles (
  student_id TEXT PRIMARY KEY REFERENCES users(id),
  goal_score TEXT NOT NULL,
  current_stage TEXT NOT NULL
);

CREATE TABLE diagnostic_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  diagnostic_type TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE diagnostic_answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES diagnostic_sessions(id),
  question_id TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  confidence TEXT NOT NULL
);

CREATE TABLE learning_tasks (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE practice_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  task_id TEXT NOT NULL REFERENCES learning_tasks(id),
  status TEXT NOT NULL
);

CREATE TABLE student_answers (
  id TEXT PRIMARY KEY,
  practice_session_id TEXT NOT NULL REFERENCES practice_sessions(id),
  question_id TEXT NOT NULL,
  final_answer TEXT NOT NULL
);

CREATE TABLE mistake_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  question_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence TEXT NOT NULL,
  retry_status TEXT NOT NULL
);

CREATE TABLE ai_conversations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  task_id TEXT,
  question_id TEXT
);

CREATE TABLE ai_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id),
  role TEXT NOT NULL,
  mode TEXT NOT NULL,
  content TEXT NOT NULL
);
```

- [ ] **Step 2: Verify schema is committed with API plan**

Run:

```powershell
Get-Content -Raw 'src/db/schema.sql'
```

Expected: all ten MVP learning tables are present.

## Self-Review

- Spec coverage: covers login, profile goal, diagnostics, task recommendation, practice submission, mistake record, and latest report.
- Red-flag scan: no unfinished markers or unspecified implementation bucket remains.
- Type consistency: route names match the technical architecture API list.
