# Data Pipeline And Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first data-pipeline foundation for source documents, content units, knowledge points, interaction logs, and review-safe learning package composition.

**Architecture:** Extend the existing Fastify API and SQL schema without replacing the current MVP flow. Keep PDF/OCR/vector providers behind mockable interfaces first, use Markdown samples for the first deliverable, and preserve the existing student/admin tests.

**Tech Stack:** Node.js, TypeScript, Fastify, SQL schema files, Vitest, React + Vite for admin/student surfaces.

## Global Constraints

- MVP remains scoped to math and the linear-function learning loop.
- Published student content must come from approved content only.
- Markdown remains the intermediate review format.
- Obsidian is optional review tooling, not primary storage.
- Do not introduce real Docling, Mathpix, pgvector, MinIO, BullMQ, or OpenAI embedding calls in the first implementation pass.
- Preserve existing E2E flow selectors unless a test is explicitly updated in the same task.

---

## File Structure

- Create: `services/api/src/db/data-pipeline-schema.sql`
  - Owns new SQL tables for `source_documents`, `content_units`, `knowledge_points`, `knowledge_edges`, `interaction_logs`, and `prompt_templates`.
- Modify: `services/api/src/db/migrate.ts`
  - Applies the new schema file after the current core and content schemas.
- Create: `services/api/src/modules/data-pipeline/types.ts`
  - Defines TypeScript types shared by repository, service, and routes.
- Create: `services/api/src/modules/data-pipeline/repository.ts`
  - Stores in-memory records until a real DB adapter is introduced.
- Create: `services/api/src/modules/data-pipeline/service.ts`
  - Validates review rules and composes learning package candidates.
- Create: `services/api/src/modules/data-pipeline/routes.ts`
  - Exposes admin content-unit endpoints and student interaction-log write endpoints.
- Create: `services/api/src/modules/data-pipeline/service.test.ts`
  - Tests approved-content filtering, log recording, and package composition.
- Create: `services/api/src/modules/data-pipeline/routes.test.ts`
  - Tests HTTP contract and status behavior.
- Modify: `services/api/src/server.ts`
  - Registers the data-pipeline routes under `/admin/data-pipeline` and `/student/interactions`.
- Modify: `apps/admin-web/src/pages/QuestionReviewPage.tsx`
  - Adds a compact content-unit review section fed by mock API data.
- Modify: `apps/admin-web/src/services/contentApi.ts`
  - Adds client methods for content units.
- Modify: `apps/admin-web/src/services/contentApi.test.ts`
  - Covers the new client methods.
- Modify: `apps/student-web/src/pages/PracticePage.tsx`
  - Emits or displays the interaction-log payload shape without requiring a real backend call in the prototype.
- Modify: `docs/testing/mvp-verification-checklist.md`
  - Adds data-pipeline verification items.

## Task 1: Add Data Pipeline Schema

**Files:**
- Create: `services/api/src/db/data-pipeline-schema.sql`
- Modify: `services/api/src/db/migrate.ts`

**Interfaces:**
- Produces SQL table names used by later tasks:
  - `source_documents`
  - `content_units`
  - `knowledge_points`
  - `knowledge_edges`
  - `interaction_logs`
  - `prompt_templates`

- [x] **Step 1: Create schema file**

Create `services/api/src/db/data-pipeline-schema.sql` with:

```sql
CREATE TABLE source_documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  title TEXT,
  subject TEXT NOT NULL DEFAULT '数学',
  grade TEXT,
  module TEXT,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'pending',
    'parsing',
    'parsed',
    'parse_failed',
    'reviewing',
    'archived'
  )),
  page_count INTEGER,
  uploaded_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE content_units (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES source_documents(id),
  question_id TEXT REFERENCES questions(id),
  chunk_type TEXT NOT NULL CHECK (chunk_type IN (
    'concept',
    'example',
    'problem',
    'scenario',
    'explanation'
  )),
  content_markdown TEXT NOT NULL,
  knowledge_tags_json TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('基础', '提升', '冲刺')),
  ability TEXT CHECK (ability IN ('概念', '表达式', '图像', '应用', '综合')),
  error_types_json TEXT NOT NULL,
  review_status TEXT NOT NULL CHECK (review_status IN (
    'pending_review',
    'needs_revision',
    'approved',
    'rejected'
  )),
  quality_score REAL NOT NULL DEFAULT 1.0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE knowledge_points (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  description TEXT NOT NULL,
  parent_id TEXT REFERENCES knowledge_points(id)
);

CREATE TABLE knowledge_edges (
  source_id TEXT NOT NULL REFERENCES knowledge_points(id),
  target_id TEXT NOT NULL REFERENCES knowledge_points(id),
  relation_type TEXT NOT NULL CHECK (relation_type IN (
    'prerequisite',
    'related',
    'contrasted'
  )),
  strength REAL NOT NULL DEFAULT 1.0,
  PRIMARY KEY (source_id, target_id, relation_type)
);

CREATE TABLE interaction_logs (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  task_id TEXT REFERENCES learning_tasks(id),
  question_id TEXT,
  content_unit_id TEXT REFERENCES content_units(id),
  action TEXT NOT NULL CHECK (action IN (
    'view_content',
    'submit_answer',
    'request_hint',
    'view_explanation',
    'view_full_answer',
    'voice_input',
    'rate_ai_response'
  )),
  student_answer TEXT,
  hint_level INTEGER NOT NULL DEFAULT 0,
  time_to_answer_ms INTEGER,
  correct INTEGER CHECK (correct IN (0, 1)),
  ai_response TEXT,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  created_at TEXT NOT NULL
);

CREATE TABLE prompt_templates (
  id TEXT PRIMARY KEY,
  scenario TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  template TEXT NOT NULL,
  is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL
);
```

- [x] **Step 2: Update migration entry**

Modify `services/api/src/db/migrate.ts` so the schema application order is:

```ts
const schemaFiles = ["schema.sql", "content-schema.sql", "data-pipeline-schema.sql"];
```

Use the existing file-reading pattern in `migrate.ts`.

- [x] **Step 3: Verify schema file is included**

Run:

```bash
npm run build
```

from `services/api`.

Expected: TypeScript build exits with code 0.

- [x] **Step 4: Commit**

```bash
git add services/api/src/db/data-pipeline-schema.sql services/api/src/db/migrate.ts
git commit -m "feat(api): add data pipeline schema"
```

## Task 2: Add Data Pipeline Domain Service

**Files:**
- Create: `services/api/src/modules/data-pipeline/types.ts`
- Create: `services/api/src/modules/data-pipeline/repository.ts`
- Create: `services/api/src/modules/data-pipeline/service.ts`
- Create: `services/api/src/modules/data-pipeline/service.test.ts`

**Interfaces:**
- Produces:
  - `ContentUnit`
  - `InteractionLog`
  - `createDataPipelineRepository()`
  - `createDataPipelineService(repository)`
  - `service.composeLearningPackage(input)`
  - `service.recordInteraction(input)`

- [x] **Step 1: Write failing service tests**

Create `services/api/src/modules/data-pipeline/service.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createDataPipelineRepository } from "./repository.js";
import { createDataPipelineService } from "./service.js";

describe("data pipeline service", () => {
  it("composes learning package from approved content only", () => {
    const repository = createDataPipelineRepository();
    repository.saveContentUnit({
      id: "unit-approved-kb",
      chunkType: "concept",
      contentMarkdown: "k 表示单位变化量，b 表示初始量。",
      knowledgeTags: ["一次函数", "k/b意义"],
      difficulty: "基础",
      ability: "概念",
      errorTypes: ["概念理解错误"],
      reviewStatus: "approved",
      qualityScore: 0.9,
      usageCount: 0,
    });
    repository.saveContentUnit({
      id: "unit-draft-kb",
      chunkType: "concept",
      contentMarkdown: "未审核内容",
      knowledgeTags: ["一次函数", "k/b意义"],
      difficulty: "基础",
      ability: "概念",
      errorTypes: [],
      reviewStatus: "pending_review",
      qualityScore: 1,
      usageCount: 0,
    });

    const service = createDataPipelineService(repository);
    const result = service.composeLearningPackage({
      knowledgeTag: "k/b意义",
      difficulty: "基础",
      ability: "概念",
    });

    expect(result.units.map((unit) => unit.id)).toEqual(["unit-approved-kb"]);
  });

  it("records student interaction logs", () => {
    const repository = createDataPipelineRepository();
    const service = createDataPipelineService(repository);

    const log = service.recordInteraction({
      studentId: "student-1",
      taskId: "task-linear-kb",
      questionId: "practice-printing-fee",
      action: "request_hint",
      hintLevel: 1,
      correct: null,
    });

    expect(log.id).toMatch(/^interaction-/);
    expect(repository.listInteractionLogs("student-1")).toHaveLength(1);
  });
});
```

- [x] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test -- src/modules/data-pipeline/service.test.ts
```

from `services/api`.

Expected: FAIL because `repository.js` and `service.js` do not exist.

- [x] **Step 3: Add types**

Create `services/api/src/modules/data-pipeline/types.ts`:

```ts
export type ChunkType = "concept" | "example" | "problem" | "scenario" | "explanation";
export type Difficulty = "基础" | "提升" | "冲刺";
export type Ability = "概念" | "表达式" | "图像" | "应用" | "综合";
export type ReviewStatus = "pending_review" | "needs_revision" | "approved" | "rejected";
export type InteractionAction =
  | "view_content"
  | "submit_answer"
  | "request_hint"
  | "view_explanation"
  | "view_full_answer"
  | "voice_input"
  | "rate_ai_response";

export type ContentUnit = {
  id: string;
  chunkType: ChunkType;
  contentMarkdown: string;
  knowledgeTags: string[];
  difficulty: Difficulty | null;
  ability: Ability | null;
  errorTypes: string[];
  reviewStatus: ReviewStatus;
  qualityScore: number;
  usageCount: number;
};

export type InteractionLog = {
  id: string;
  studentId: string;
  taskId: string | null;
  questionId: string | null;
  contentUnitId: string | null;
  action: InteractionAction;
  studentAnswer: string | null;
  hintLevel: number;
  timeToAnswerMs: number | null;
  correct: boolean | null;
  aiResponse: string | null;
  feedbackRating: number | null;
  createdAt: string;
};

export type ComposeLearningPackageInput = {
  knowledgeTag: string;
  difficulty: Difficulty;
  ability: Ability;
};
```

- [x] **Step 4: Add repository**

Create `services/api/src/modules/data-pipeline/repository.ts`:

```ts
import type { ContentUnit, InteractionLog } from "./types.js";

export function createDataPipelineRepository() {
  const contentUnits: ContentUnit[] = [];
  const interactionLogs: InteractionLog[] = [];

  return {
    saveContentUnit(unit: ContentUnit) {
      contentUnits.push(unit);
      return unit;
    },
    listContentUnits() {
      return [...contentUnits];
    },
    saveInteractionLog(log: InteractionLog) {
      interactionLogs.push(log);
      return log;
    },
    listInteractionLogs(studentId: string) {
      return interactionLogs.filter((log) => log.studentId === studentId);
    },
  };
}
```

- [x] **Step 5: Add service**

Create `services/api/src/modules/data-pipeline/service.ts`:

```ts
import type { ComposeLearningPackageInput, InteractionAction, InteractionLog } from "./types.js";
import type { createDataPipelineRepository } from "./repository.js";

type Repository = ReturnType<typeof createDataPipelineRepository>;

type RecordInteractionInput = {
  studentId: string;
  taskId?: string | null;
  questionId?: string | null;
  contentUnitId?: string | null;
  action: InteractionAction;
  studentAnswer?: string | null;
  hintLevel?: number;
  timeToAnswerMs?: number | null;
  correct?: boolean | null;
  aiResponse?: string | null;
  feedbackRating?: number | null;
};

export function createDataPipelineService(repository: Repository) {
  return {
    composeLearningPackage(input: ComposeLearningPackageInput) {
      const units = repository
        .listContentUnits()
        .filter((unit) => unit.reviewStatus === "approved")
        .filter((unit) => unit.knowledgeTags.includes(input.knowledgeTag))
        .filter((unit) => unit.difficulty === input.difficulty || unit.difficulty === "基础")
        .filter((unit) => unit.ability === input.ability)
        .sort((a, b) => b.qualityScore - a.qualityScore || a.usageCount - b.usageCount);

      return { units };
    },
    recordInteraction(input: RecordInteractionInput): InteractionLog {
      const log: InteractionLog = {
        id: `interaction-${Date.now()}`,
        studentId: input.studentId,
        taskId: input.taskId ?? null,
        questionId: input.questionId ?? null,
        contentUnitId: input.contentUnitId ?? null,
        action: input.action,
        studentAnswer: input.studentAnswer ?? null,
        hintLevel: input.hintLevel ?? 0,
        timeToAnswerMs: input.timeToAnswerMs ?? null,
        correct: input.correct ?? null,
        aiResponse: input.aiResponse ?? null,
        feedbackRating: input.feedbackRating ?? null,
        createdAt: new Date().toISOString(),
      };

      return repository.saveInteractionLog(log);
    },
  };
}
```

- [x] **Step 6: Run service tests**

Run:

```bash
npm run test -- src/modules/data-pipeline/service.test.ts
```

Expected: PASS, 2 tests.

- [x] **Step 7: Commit**

```bash
git add services/api/src/modules/data-pipeline
git commit -m "feat(api): add data pipeline domain service"
```

## Task 3: Add HTTP Routes

**Files:**
- Create: `services/api/src/modules/data-pipeline/routes.ts`
- Create: `services/api/src/modules/data-pipeline/routes.test.ts`
- Modify: `services/api/src/server.ts`

**Interfaces:**
- Produces:
  - `GET /admin/data-pipeline/content-units/package`
  - `POST /student/interactions`

- [x] **Step 1: Write failing route tests**

Create `services/api/src/modules/data-pipeline/routes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildServer } from "../../server.js";

describe("data pipeline routes", () => {
  it("records student interaction", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/student/interactions",
      payload: {
        studentId: "student-1",
        taskId: "task-linear-kb",
        questionId: "practice-printing-fee",
        action: "request_hint",
        hintLevel: 1,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().studentId).toBe("student-1");
  });

  it("returns approved package candidates", async () => {
    const app = buildServer();

    const response = await app.inject({
      method: "GET",
      url: "/admin/data-pipeline/content-units/package?knowledgeTag=k%2Fb%E6%84%8F%E4%B9%89&difficulty=%E5%9F%BA%E7%A1%80&ability=%E6%A6%82%E5%BF%B5",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("units");
  });
});
```

- [x] **Step 2: Run route tests to verify failure**

Run:

```bash
npm run test -- src/modules/data-pipeline/routes.test.ts
```

Expected: FAIL with 404 for new routes.

- [x] **Step 3: Add routes**

Create `services/api/src/modules/data-pipeline/routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import { createDataPipelineRepository } from "./repository.js";
import { createDataPipelineService } from "./service.js";

export async function registerDataPipelineRoutes(app: FastifyInstance) {
  const repository = createDataPipelineRepository();
  repository.saveContentUnit({
    id: "unit-linear-kb-concept",
    chunkType: "concept",
    contentMarkdown: "k 表示单位变化量，b 表示初始量。",
    knowledgeTags: ["一次函数", "k/b意义"],
    difficulty: "基础",
    ability: "概念",
    errorTypes: ["概念理解错误"],
    reviewStatus: "approved",
    qualityScore: 0.95,
    usageCount: 0,
  });

  const service = createDataPipelineService(repository);

  app.get("/admin/data-pipeline/content-units/package", async (request) => {
    const query = request.query as { knowledgeTag?: string; difficulty?: "基础" | "提升" | "冲刺"; ability?: "概念" | "表达式" | "图像" | "应用" | "综合" };

    return service.composeLearningPackage({
      knowledgeTag: query.knowledgeTag ?? "k/b意义",
      difficulty: query.difficulty ?? "基础",
      ability: query.ability ?? "概念",
    });
  });

  app.post("/student/interactions", async (request, reply) => {
    const body = request.body as {
      studentId: string;
      taskId?: string;
      questionId?: string;
      action: "view_content" | "submit_answer" | "request_hint" | "view_explanation" | "view_full_answer" | "voice_input" | "rate_ai_response";
      hintLevel?: number;
    };

    const log = service.recordInteraction(body);
    return reply.code(201).send(log);
  });
}
```

- [x] **Step 4: Register routes**

Modify `services/api/src/server.ts`:

```ts
import { registerDataPipelineRoutes } from "./modules/data-pipeline/routes.js";
```

Inside `buildServer()` after existing route registration:

```ts
void app.register(registerDataPipelineRoutes);
```

- [x] **Step 5: Run route tests**

Run:

```bash
npm run test -- src/modules/data-pipeline/routes.test.ts
```

Expected: PASS, 2 tests.

- [x] **Step 6: Run API test suite**

Run:

```bash
npm run test
```

from `services/api`.

Expected: all tests pass.

- [x] **Step 7: Commit**

```bash
git add services/api/src/modules/data-pipeline services/api/src/server.ts
git commit -m "feat(api): expose data pipeline routes"
```

## Task 4: Surface Content Units In Admin Review

**Files:**
- Modify: `apps/admin-web/src/services/contentApi.ts`
- Modify: `apps/admin-web/src/services/contentApi.test.ts`
- Modify: `apps/admin-web/src/pages/QuestionReviewPage.tsx`

**Interfaces:**
- Consumes: `GET /admin/data-pipeline/content-units/package`
- Produces: `fetchContentUnitPackage()`

- [x] **Step 1: Write failing client test**

Modify `apps/admin-web/src/services/contentApi.test.ts`:

```ts
it("fetches content unit package candidates", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ units: [{ id: "unit-linear-kb-concept", contentMarkdown: "k 表示单位变化量" }] }),
  });

  const result = await fetchContentUnitPackage(fetchMock);

  expect(fetchMock).toHaveBeenCalledWith("/api/admin/data-pipeline/content-units/package?knowledgeTag=k%2Fb%E6%84%8F%E4%B9%89&difficulty=%E5%9F%BA%E7%A1%80&ability=%E6%A6%82%E5%BF%B5");
  expect(result.units[0].id).toBe("unit-linear-kb-concept");
});
```

Import `fetchContentUnitPackage` from `./contentApi`.

- [x] **Step 2: Run test to verify failure**

Run:

```bash
npm run test -- src/services/contentApi.test.ts
```

from `apps/admin-web`.

Expected: FAIL because `fetchContentUnitPackage` is not exported.

- [x] **Step 3: Add client method**

Modify `apps/admin-web/src/services/contentApi.ts`:

```ts
export type ContentUnitPackage = {
  units: Array<{ id: string; contentMarkdown: string }>;
};

export async function fetchContentUnitPackage(fetcher: typeof fetch = fetch): Promise<ContentUnitPackage> {
  const response = await fetcher(
    "/api/admin/data-pipeline/content-units/package?knowledgeTag=k%2Fb%E6%84%8F%E4%B9%89&difficulty=%E5%9F%BA%E7%A1%80&ability=%E6%A6%82%E5%BF%B5",
  );
  if (!response.ok) throw new Error("Failed to fetch content unit package");
  return response.json() as Promise<ContentUnitPackage>;
}
```

- [x] **Step 4: Add admin page section**

Modify `apps/admin-web/src/pages/QuestionReviewPage.tsx` to include a static review block near the existing question fields:

```tsx
<div className="review-block">
  <h3>内容单元候选</h3>
  <p className="note">已审核内容单元可进入学习包编排；待审核内容不会出现在学生端。</p>
  <div className="tag-row">
    <span>unit-linear-kb-concept</span>
    <span>k/b意义</span>
    <span>基础</span>
  </div>
</div>
```

- [x] **Step 5: Run admin tests**

Run:

```bash
npm run test
npm run build
```

from `apps/admin-web`.

Expected: tests and build pass.

- [x] **Step 6: Commit**

```bash
git add apps/admin-web/src/services/contentApi.ts apps/admin-web/src/services/contentApi.test.ts apps/admin-web/src/pages/QuestionReviewPage.tsx
git commit -m "feat(admin): show content unit review context"
```

## Task 5: Record Student Interaction Intent In Prototype

**Files:**
- Modify: `apps/student-web/src/pages/PracticePage.tsx`
- Modify: `apps/student-web/src/App.test.tsx`
- Modify: `docs/testing/mvp-verification-checklist.md`

**Interfaces:**
- Consumes interaction payload shape from Task 3.
- Produces visible prototype evidence that the practice submit action is loggable.

- [x] **Step 1: Add failing UI test assertion**

Modify `apps/student-web/src/App.test.tsx` after navigating to the practice page and before clicking submit:

```ts
expect(screen.getByText("将记录：submit_answer")).toBeInTheDocument();
```

- [x] **Step 2: Run test to verify failure**

Run:

```bash
npm run test -- src/App.test.tsx
```

from `apps/student-web`.

Expected: FAIL because the text is not rendered.

- [x] **Step 3: Add visible interaction payload evidence**

Modify `apps/student-web/src/pages/PracticePage.tsx` inside the practice main panel:

```tsx
<div className="sync-status">
  将记录：submit_answer · questionId=practice-printing-fee · hintLevel=1
</div>
```

Place it above the submit button row.

- [x] **Step 4: Update verification checklist**

Add to `docs/testing/mvp-verification-checklist.md`:

```md
- [ ] 练习提交页展示可记录的交互日志意图：`submit_answer`、题目 ID、提示层级。
```

- [x] **Step 5: Run student tests**

Run:

```bash
npm run test
npm run build
npm run test:e2e
```

from `apps/student-web`.

Expected: all tests pass.

- [x] **Step 6: Commit**

```bash
git add apps/student-web/src/pages/PracticePage.tsx apps/student-web/src/App.test.tsx docs/testing/mvp-verification-checklist.md
git commit -m "feat(student): surface interaction logging intent"
```

## Task 6: Add Documentation Cross-References

**Files:**
- Modify: `docs/technical/2026-06-30-mvp-technical-architecture.md`
- Modify: `docs/testing/mvp-verification-checklist.md`

**Interfaces:**
- Consumes: `docs/technical/2026-07-07-data-pipeline-and-evolution.md`

- [x] **Step 1: Add architecture reference**

Append to `docs/technical/2026-06-30-mvp-technical-architecture.md` under `## 11. 下一步`:

```md
6. 数据管线、PDF 资料管理、内容单元、交互日志和系统进化机制见 `docs/technical/2026-07-07-data-pipeline-and-evolution.md`。
```

- [x] **Step 2: Add checklist reference**

Append to `docs/testing/mvp-verification-checklist.md`:

```md
## 数据管线补充检查

- [ ] 未审核内容单元不会出现在学生端学习包。
- [ ] 学生提交答案和请求提示会生成交互日志。
- [ ] 内容单元审核状态变化后，后台和学习包编排结果一致。
```

- [x] **Step 3: Verify documentation contains no placeholders**

Run a repository text search over `docs/technical/2026-07-07-data-pipeline-and-evolution.md` and `docs/superpowers/plans/2026-07-07-data-pipeline-and-evolution.md` for placeholder markers before committing.

Expected: no placeholder marker output.

- [x] **Step 4: Commit**

```bash
git add docs/technical/2026-06-30-mvp-technical-architecture.md docs/testing/mvp-verification-checklist.md
git commit -m "docs: link data pipeline architecture plan"
```

## Self-Review

Spec coverage:

- PostgreSQL + pgvector + object storage is covered in the technical design and Task 1 schema foundation.
- PDF parsing is documented as a staged pipeline and deliberately kept out of first implementation code.
- Dynamic composition is covered in Task 2 service and Task 3 API route.
- Interaction logs are covered in Tasks 1, 2, 3, and 5.
- Obsidian is documented as optional review tooling and excluded from the first implementation pass.

Placeholder scan:

- The plan intentionally avoids placeholder markers and vague implementation steps.
- External provider integration is explicitly excluded from the first implementation pass.

Type consistency:

- `ContentUnit`, `InteractionLog`, `createDataPipelineRepository`, `createDataPipelineService`, `composeLearningPackage`, and `recordInteraction` are defined before route/admin/student tasks consume them.
