# Question Bank And Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first question-bank workflow: import reviewed Markdown-style linear-function questions, keep them in review states, approve them, and publish only safe content to student APIs.

**Architecture:** Start with Markdown import and deterministic figure-recognition records. Represent PDF, Word, scanned image, OCR, and vision processing as import job states and adapter interfaces, but do not implement full OCR until the Markdown path is stable.

**Tech Stack:** Node.js, TypeScript, Fastify, Zod, SQL migrations, Vitest.

---

## File Structure

- `services/api/src/modules/content/types.ts`: question, tag, review, figure recognition types.
- `services/api/src/modules/content/markdownQuestionParser.ts`: Markdown question parser.
- `services/api/src/modules/content/reviewService.ts`: review state machine and publish protection.
- `services/api/src/modules/content/routes.ts`: admin import/review/publish routes.
- `services/api/src/modules/content/*.test.ts`: parser and review tests.
- `services/api/src/db/content-schema.sql`: content and review schema.
- `content-samples/linear-function/MATH-FUNC-LINEAR-001.md`: first sample question.

### Task 1: Add Content Types

**Files:**
- Create: `D:/middle school/services/api/src/modules/content/types.ts`

- [ ] **Step 1: Define review states and question type**

Create `types.ts`:

```ts
export type ReviewStatus =
  | "pending_recognition"
  | "recognition_failed"
  | "pending_review"
  | "needs_revision"
  | "approved"
  | "published"
  | "unusable";

export type Question = {
  id: string;
  subject: "数学";
  module: "函数";
  knowledgePoint: string;
  questionType: "选择题" | "填空题" | "解答题";
  difficulty: "基础" | "提升" | "冲刺";
  ability: "概念" | "表达式" | "图像" | "应用" | "综合";
  answer: string;
  stem: string;
  explanation: string;
  reviewStatus: ReviewStatus;
};

export type FigureRecognition = {
  questionId: string;
  figureType: string;
  elements: Record<string, unknown>;
  confidence: number;
  reviewStatus: ReviewStatus;
};
```

- [ ] **Step 2: Verify type file compiles**

Run:

```powershell
npm run build
```

Working directory:

```text
D:\middle school\services\api
```

Expected: TypeScript passes.

### Task 2: Parse Markdown Question

**Files:**
- Create: `D:/middle school/content-samples/linear-function/MATH-FUNC-LINEAR-001.md`
- Create: `D:/middle school/services/api/src/modules/content/markdownQuestionParser.ts`
- Create: `D:/middle school/services/api/src/modules/content/markdownQuestionParser.test.ts`

- [ ] **Step 1: Create sample question**

Create `MATH-FUNC-LINEAR-001.md`:

```md
# 题目ID: MATH-FUNC-LINEAR-001
学科: 数学
模块: 函数
知识点: 一次函数图像
题型: 选择题
难度: 基础
能力类型: 图像
答案: B
审核状态: 待审核

## 题干
直线经过点 A(0, 2) 和 B(4, 0)，则该直线的解析式是？

## 选项
A. y = 2x + 4
B. y = -0.5x + 2
C. y = 0.5x + 2
D. y = -2x + 4

## 解析
斜率 k = (0 - 2) / (4 - 0) = -0.5，且与 y 轴交于 2，所以解析式是 y = -0.5x + 2。
```

- [ ] **Step 2: Write parser test**

Create `markdownQuestionParser.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseMarkdownQuestion } from "./markdownQuestionParser";

describe("parseMarkdownQuestion", () => {
  it("parses the first linear-function sample into pending review", () => {
    const markdown = readFileSync("../../content-samples/linear-function/MATH-FUNC-LINEAR-001.md", "utf8");
    const question = parseMarkdownQuestion(markdown);

    expect(question.id).toBe("MATH-FUNC-LINEAR-001");
    expect(question.answer).toBe("B");
    expect(question.reviewStatus).toBe("pending_review");
    expect(question.ability).toBe("图像");
  });
});
```

- [ ] **Step 3: Implement parser**

Create `markdownQuestionParser.ts`:

```ts
import type { Question } from "./types";

function readField(markdown: string, label: string) {
  const match = markdown.match(new RegExp(`^${label}:\\\\s*(.+)$`, "m"));
  if (!match) throw new Error(`Missing field: ${label}`);
  return match[1].trim();
}

function readSection(markdown: string, heading: string) {
  const match = markdown.match(new RegExp(`## ${heading}\\\\n([\\\\s\\\\S]*?)(?=\\\\n## |$)`));
  if (!match) throw new Error(`Missing section: ${heading}`);
  return match[1].trim();
}

export function parseMarkdownQuestion(markdown: string): Question {
  const id = readField(markdown, "# 题目ID");
  return {
    id,
    subject: "数学",
    module: "函数",
    knowledgePoint: readField(markdown, "知识点"),
    questionType: readField(markdown, "题型") as Question["questionType"],
    difficulty: readField(markdown, "难度") as Question["difficulty"],
    ability: readField(markdown, "能力类型") as Question["ability"],
    answer: readField(markdown, "答案"),
    stem: readSection(markdown, "题干"),
    explanation: readSection(markdown, "解析"),
    reviewStatus: "pending_review",
  };
}
```

- [ ] **Step 4: Verify parser test passes**

Run:

```powershell
npm run test -- src/modules/content/markdownQuestionParser.test.ts
```

Expected: parser test passes.

### Task 3: Implement Review And Publish Protection

**Files:**
- Create: `D:/middle school/services/api/src/modules/content/reviewService.ts`
- Create: `D:/middle school/services/api/src/modules/content/reviewService.test.ts`

- [ ] **Step 1: Write review tests**

Create `reviewService.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { approveQuestion, canPublishQuestion, canExposeFigureRecognition } from "./reviewService";
import type { Question, FigureRecognition } from "./types";

const question: Question = {
  id: "MATH-FUNC-LINEAR-001",
  subject: "数学",
  module: "函数",
  knowledgePoint: "一次函数图像",
  questionType: "选择题",
  difficulty: "基础",
  ability: "图像",
  answer: "B",
  stem: "直线经过两点。",
  explanation: "根据斜率公式。",
  reviewStatus: "pending_review",
};

describe("reviewService", () => {
  it("blocks unreviewed question publishing", () => {
    expect(canPublishQuestion(question)).toBe(false);
    expect(canPublishQuestion(approveQuestion(question))).toBe(true);
  });

  it("blocks low-confidence figure recognition from student explanation", () => {
    const figure: FigureRecognition = { questionId: question.id, figureType: "coordinate_line_graph", elements: {}, confidence: 0.62, reviewStatus: "approved" };
    expect(canExposeFigureRecognition(figure)).toBe(false);
  });
});
```

- [ ] **Step 2: Implement review service**

Create `reviewService.ts`:

```ts
import type { FigureRecognition, Question } from "./types";

export function approveQuestion(question: Question): Question {
  return { ...question, reviewStatus: "approved" };
}

export function canPublishQuestion(question: Question) {
  return question.reviewStatus === "approved" && question.answer.length > 0 && question.explanation.length > 0;
}

export function canExposeFigureRecognition(figure: FigureRecognition) {
  return figure.reviewStatus === "approved" && figure.confidence >= 0.8;
}
```

- [ ] **Step 3: Verify review tests pass**

Run:

```powershell
npm run test -- src/modules/content/reviewService.test.ts
```

Expected: review tests pass.

### Task 4: Add Content Schema

**Files:**
- Create: `D:/middle school/services/api/src/db/content-schema.sql`

- [ ] **Step 1: Create schema**

Create `content-schema.sql`:

```sql
CREATE TABLE import_jobs (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL,
  failure_reason TEXT
);

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  module TEXT NOT NULL,
  knowledge_point TEXT NOT NULL,
  question_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  ability TEXT NOT NULL,
  answer TEXT NOT NULL,
  stem TEXT NOT NULL,
  explanation TEXT NOT NULL,
  review_status TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE question_assets (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  asset_type TEXT NOT NULL,
  path TEXT NOT NULL
);

CREATE TABLE figure_recognitions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  figure_type TEXT NOT NULL,
  elements_json TEXT NOT NULL,
  confidence REAL NOT NULL,
  review_status TEXT NOT NULL
);
```

- [ ] **Step 2: Verify schema contains publish fields**

Run:

```powershell
Select-String -Path 'src/db/content-schema.sql' -Pattern 'review_status|published_at|confidence'
```

Expected: all three fields appear.

## Self-Review

- Spec coverage: covers Markdown import, review states, publish protection, figure confidence protection, and content schema.
- Red-flag scan: no unfinished markers or unspecified implementation bucket remains.
- Type consistency: review states match the technical architecture.
