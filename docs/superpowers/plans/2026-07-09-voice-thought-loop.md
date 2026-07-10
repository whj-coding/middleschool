# Voice Thought Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the PracticePage mock voice-thought loop so a student can request STT transcription, edit the transcript, and submit it as current-question evidence.

**Architecture:** Keep the slice frontend-first and mock-backed. Add a small `voiceApi` service for `/api/voice/stt`, then make `PracticePage` own local answer, step, voice transcript, loading, and fallback state. Reuse the existing `recordInteraction.studentAnswer` field to carry structured evidence instead of changing backend schemas.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Playwright, existing Fastify mock voice routes.

## Global Constraints

- MVP remains scoped to math and the linear-function learning loop.
- Do not introduce real microphone capture, real STT/TTS providers, OpenAI calls, OCR, or complex figure recognition.
- API unavailable must not block the local prototype learning flow.
- Use TDD: write a failing test, run it red, implement minimally, run it green.
- Keep changes small and avoid unrelated refactors on `codex/controlled-content-rendering`.

---

## File Structure

- Create: `apps/student-web/src/services/voiceApi.ts`
  - Owns the student-web client call to `/api/voice/stt`.
- Create: `apps/student-web/src/services/voiceApi.test.ts`
  - Verifies request contract, success parsing, and failure behavior.
- Modify: `apps/student-web/src/pages/PracticePage.tsx`
  - Adds voice transcript state, STT trigger, editable transcript field, and structured submission evidence.
- Modify: `apps/student-web/src/pages/PracticePage.test.tsx`
  - Verifies voice transcription display/editing and submit payload evidence.
- Modify: `apps/student-web/e2e/student-flow.spec.ts`
  - Mocks `/api/voice/stt` and verifies the end-to-end payload includes transcript evidence.
- Modify: `STATE.md`
  - Records the completed voice-thought loop slice and verification evidence.

## Task 1: Add Student Voice API Service

**Files:**
- Create: `apps/student-web/src/services/voiceApi.test.ts`
- Create: `apps/student-web/src/services/voiceApi.ts`

**Interfaces:**
- Produces:

```ts
export type VoiceTranscript = {
  transcript: string;
  confidence: number;
};

export async function transcribeVoiceThought(fetcher?: typeof fetch): Promise<VoiceTranscript>;
```

- Consumes backend proxy route:

```http
POST /api/voice/stt
Content-Type: application/json

{ "audioBase64": "bW9jay12b2ljZS10aG91Z2h0" }
```

- [ ] **Step 1: Write the failing service test**

Create `apps/student-web/src/services/voiceApi.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { transcribeVoiceThought } from "./voiceApi";

describe("voiceApi", () => {
  it("transcribes a mock voice thought through the API proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        transcript: "我觉得 3 元是固定费用，0.4 元才是每页变化费用。",
        confidence: 0.92,
      }),
    });

    const result = await transcribeVoiceThought(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/voice/stt",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: "bW9jay12b2ljZS10aG91Z2h0" }),
      }),
    );
    expect(result.transcript).toBe("我觉得 3 元是固定费用，0.4 元才是每页变化费用。");
    expect(result.confidence).toBe(0.92);
  });

  it("throws when voice transcription fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(transcribeVoiceThought(fetchMock)).rejects.toThrow("Failed to transcribe voice thought");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `apps/student-web`:

```powershell
npm test -- src/services/voiceApi.test.ts
```

Expected: FAIL because `./voiceApi` does not exist.

- [ ] **Step 3: Add the service implementation**

Create `apps/student-web/src/services/voiceApi.ts`:

```ts
export type VoiceTranscript = {
  transcript: string;
  confidence: number;
};

const MOCK_VOICE_THOUGHT_AUDIO_BASE64 = "bW9jay12b2ljZS10aG91Z2h0";

export async function transcribeVoiceThought(fetcher: typeof fetch = fetch): Promise<VoiceTranscript> {
  const response = await fetcher("/api/voice/stt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64: MOCK_VOICE_THOUGHT_AUDIO_BASE64 }),
  });

  if (!response.ok) throw new Error("Failed to transcribe voice thought");

  return response.json() as Promise<VoiceTranscript>;
}
```

- [ ] **Step 4: Run service test to verify it passes**

Run from `apps/student-web`:

```powershell
npm test -- src/services/voiceApi.test.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```powershell
git add apps/student-web/src/services/voiceApi.ts apps/student-web/src/services/voiceApi.test.ts
git commit -m "feat(student): add voice thought api client"
```

## Task 2: Integrate Voice Transcript Into PracticePage

**Files:**
- Modify: `apps/student-web/src/pages/PracticePage.test.tsx`
- Modify: `apps/student-web/src/pages/PracticePage.tsx`

**Interfaces:**
- Consumes `transcribeVoiceThought()` from `../services/voiceApi`.
- Produces structured submission evidence in `recordInteraction({ studentAnswer })`:

```text
最终答案：...
我的步骤：...
语音转写：...
```

- [ ] **Step 1: Write failing PracticePage tests**

Replace `apps/student-web/src/pages/PracticePage.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PracticePage } from "./PracticePage";

describe("PracticePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("records practice submissions against the current task", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PracticePage taskId="task-linear-modeling" onSubmit={() => undefined} />);

    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));

    const interactionCall = fetchMock.mock.calls.find(([url]) => url === "/api/student/interactions");
    const practiceCall = fetchMock.mock.calls.find(([url]) => url === "/api/practice/practice-1/answers");
    const interactionPayload = JSON.parse(interactionCall?.[1]?.body as string);

    expect(interactionPayload.taskId).toBe("task-linear-modeling");
    expect(interactionPayload.studentAnswer).toContain("最终答案：y = 3x + 0.4");
    expect(interactionPayload.studentAnswer).toContain("我的步骤：我把每页费用写成了固定部分，可能没有分清 x 表示页数。");
    expect(interactionPayload.studentAnswer).toContain("语音转写：我觉得 3 元是固定费用，0.4 元才是每增加 1 页变化的费用。");
    expect(JSON.parse(practiceCall?.[1]?.body as string).taskId).toBe("task-linear-modeling");
  });

  it("transcribes and edits voice thought before submitting evidence", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/voice/stt") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            transcript: "语音识别：3 元固定，0.4 元随页数变化。",
            confidence: 0.91,
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PracticePage taskId="task-linear-modeling" onSubmit={() => undefined} />);

    await userEvent.click(screen.getByRole("button", { name: "重新录入" }));
    const transcriptBox = await screen.findByLabelText("语音转写");
    expect(transcriptBox).toHaveValue("语音识别：3 元固定，0.4 元随页数变化。");

    await userEvent.clear(transcriptBox);
    await userEvent.type(transcriptBox, "我确认 3 元是 b，0.4 是 k。");
    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));

    const interactionCall = fetchMock.mock.calls.find(([url]) => url === "/api/student/interactions");
    const interactionPayload = JSON.parse(interactionCall?.[1]?.body as string);
    expect(interactionPayload.studentAnswer).toContain("语音转写：我确认 3 元是 b，0.4 是 k。");
  });

  it("keeps the practice flow usable when voice transcription fails", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/voice/stt") {
        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const onSubmit = vi.fn();

    render(<PracticePage taskId="task-linear-modeling" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: "重新录入" }));
    expect(await screen.findByText("语音转写暂不可用，可继续手动输入思路。")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `apps/student-web`:

```powershell
npm test -- src/pages/PracticePage.test.tsx
```

Expected: FAIL because `PracticePage` has no editable `语音转写` field, does not call `/api/voice/stt`, and does not structure `studentAnswer`.

- [ ] **Step 3: Implement PracticePage voice state and structured evidence**

Replace `apps/student-web/src/pages/PracticePage.tsx` with:

```tsx
import { useState } from "react";
import { recordInteraction } from "../services/interactionApi";
import { submitPracticeAnswer } from "../services/practiceApi";
import { transcribeVoiceThought } from "../services/voiceApi";

type Props = {
  onSubmit: () => void;
  taskId: string;
  questionId?: string;
};

const DEFAULT_ANSWER = "y = 3x + 0.4";
const DEFAULT_STEPS = "我把每页费用写成了固定部分，可能没有分清 x 表示页数。";
const VOICE_TRANSCRIPT_EXAMPLE = "例如：我觉得 3 元是固定费用，0.4 元才是每增加 1 页变化的费用。";

function buildStudentAnswerEvidence(answer: string, steps: string, voiceTranscript: string) {
  const evidence = [`最终答案：${answer}`, `我的步骤：${steps}`];
  if (voiceTranscript.trim()) evidence.push(`语音转写：${voiceTranscript.trim()}`);
  return evidence.join("\n");
}

export function PracticePage({ onSubmit, taskId, questionId = "practice-printing-fee" }: Props) {
  const [answer, setAnswer] = useState(DEFAULT_ANSWER);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "transcribing" | "failed">("idle");

  async function handleVoiceRetry() {
    setVoiceStatus("transcribing");
    try {
      const result = await transcribeVoiceThought();
      setVoiceTranscript(result.transcript);
      setVoiceStatus("idle");
    } catch {
      setVoiceStatus("failed");
    }
  }

  async function handleSubmit() {
    const studentAnswer = buildStudentAnswerEvidence(answer, steps, voiceTranscript);

    try {
      await recordInteraction({
        studentId: "student-demo",
        taskId,
        questionId,
        action: "submit_answer",
        studentAnswer,
        hintLevel: 1,
        correct: false,
      });
    } catch {
      // Prototype continues the local learning flow when the API is unavailable.
    }
    try {
      await submitPracticeAnswer({
        sessionId: "practice-1",
        studentId: "student-demo",
        taskId,
        questionId,
        answer,
      });
    } catch {
      // Prototype continues the local learning flow when the API is unavailable.
    }
    onSubmit();
  }

  return (
    <section className="flow-stage practice-stage">
      <div className="stage-main">
        <p className="eyebrow">即时练习 · 建模题</p>
        <h1>打印费建模</h1>
        <p className="stage-copy">某打印店收取 3 元基础服务费，每打印 1 页加 0.4 元。请写出总费用 y 与页数 x 的关系式。</p>

        <div className="question-meta">
          <span>难度：基础</span>
          <span>能力：应用建模</span>
          <span>错因关注：固定费用和变化费用</span>
        </div>

        <div className="answer-workspace">
          <label>
            <span>最终答案</span>
            <input aria-label="最终答案" value={answer} onChange={(event) => setAnswer(event.target.value)} />
          </label>
          <label>
            <span>我的步骤</span>
            <textarea aria-label="我的步骤" value={steps} onChange={(event) => setSteps(event.target.value)} />
          </label>
        </div>

        <div className="voice-strip">
          <label>
            <strong>语音说思路</strong>
            <span>语音转写</span>
            <textarea
              aria-label="语音转写"
              value={voiceTranscript}
              placeholder={VOICE_TRANSCRIPT_EXAMPLE}
              onChange={(event) => setVoiceTranscript(event.target.value)}
            />
          </label>
          <button onClick={() => void handleVoiceRetry()} disabled={voiceStatus === "transcribing"}>
            {voiceStatus === "transcribing" ? "转写中..." : "重新录入"}
          </button>
        </div>
        {voiceStatus === "failed" && <p className="sync-status">语音转写暂不可用，可继续手动输入思路。</p>}

        <div className="sync-status">
          <span>将记录：submit_answer</span> · questionId={questionId} · hintLevel=1
        </div>

        <div className="answer-actions full">
          <button>保存思路</button>
          <button className="primary" onClick={() => void handleSubmit()}>
            提交答案
          </button>
        </div>
      </div>

      <aside className="stage-coach">
        <h2>AI 提示模式</h2>
        <div className="chat-card">
          <p>先不直接给答案。你先找两个信息：固定不变的费用是多少？每增加 1 页，费用增加多少？</p>
        </div>
        <div className="coach-checklist">
          <strong>作答前检查</strong>
          <span>变量 x 是否表示页数</span>
          <span>b 是否是固定服务费</span>
          <span>k 是否是每页增加费用</span>
        </div>
        <div className="mode-tabs compact">
          <button className="active">提示</button>
          <button>讲解</button>
          <button disabled>答案</button>
        </div>
      </aside>
    </section>
  );
}
```

- [ ] **Step 4: Run PracticePage tests to verify they pass**

Run from `apps/student-web`:

```powershell
npm test -- src/pages/PracticePage.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Run service and page tests together**

Run from `apps/student-web`:

```powershell
npm test -- src/services/voiceApi.test.ts src/pages/PracticePage.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```powershell
git add apps/student-web/src/pages/PracticePage.tsx apps/student-web/src/pages/PracticePage.test.tsx
git commit -m "feat(student): capture voice thought evidence"
```

## Task 3: Add E2E Coverage And Record Completion State

**Files:**
- Modify: `apps/student-web/e2e/student-flow.spec.ts`
- Modify: `STATE.md`

**Interfaces:**
- Consumes PracticePage voice behavior from Task 2.
- Produces E2E evidence that `submit_answer` payload includes current task, question, and edited voice transcript.

- [ ] **Step 1: Write failing E2E assertions**

Modify `apps/student-web/e2e/student-flow.spec.ts`:

1. Change the payload capture type near the top:

```ts
const interactionPayloads: Array<{ action: string; taskId: string | null; questionId?: string; studentAnswer?: string }> = [];
```

2. Change the route payload cast:

```ts
const payload = route.request().postDataJSON() as {
  action: string;
  taskId: string | null;
  questionId?: string;
  studentAnswer?: string;
};
```

3. Add the voice STT route before `await page.goto("/")`:

```ts
await page.route("**/api/voice/stt", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      transcript: "我确认 3 元是固定费用，0.4 元是每页变化费用。",
      confidence: 0.93,
    }),
  });
});
```

4. After the first `await expect(page.getByText("打印费建模")).toBeVisible();`, before the first practice submit, add:

```ts
await page.getByRole("button", { name: "重新录入" }).click();
await expect(page.getByLabel("语音转写")).toHaveValue("我确认 3 元是固定费用，0.4 元是每页变化费用。");
await page.getByLabel("语音转写").fill("我确认 3 元是 b，0.4 是 k。");
```

5. Near the final assertions, add:

```ts
expect(interactionPayloads[0].questionId).toBe("practice-printing-fee");
expect(interactionPayloads[0].studentAnswer).toContain("语音转写：我确认 3 元是 b，0.4 是 k。");
```

- [ ] **Step 2: Run E2E to verify it fails**

Run from `apps/student-web`:

```powershell
npm run test:e2e
```

Expected: FAIL before Task 2 implementation, or PASS if Task 2 has already been completed.

- [ ] **Step 3: Update STATE.md**

Modify `STATE.md` under `## Watch List` by adding:

```md
- Voice thought loop completed: PracticePage can call mock STT, show editable transcript, and include transcript evidence in `submit_answer` interaction payload.
- Verification passed after voice thought loop: `apps/student-web npm test`, `apps/student-web npm run lint`, `apps/student-web npm run build`, `apps/student-web npm run test:e2e`, `services/api npm test`, and `services/api npm run build`.
```

- [ ] **Step 4: Run full verification**

Run:

```powershell
cd apps/student-web
npm test
npm run lint
npm run build
npm run test:e2e
cd ..\..\services\api
npm test
npm run build
cd ..\..
```

Expected:

- student-web unit tests pass.
- student-web lint exits 0.
- student-web build exits 0.
- student-web Playwright e2e passes.
- API unit tests pass.
- API build exits 0.

- [ ] **Step 5: Commit**

```powershell
git add apps/student-web/e2e/student-flow.spec.ts STATE.md
git commit -m "test(student): verify voice thought loop"
```

## Self-Review

**Spec coverage:**

- Mock STT request is covered by Task 1.
- Editable transcript and fallback behavior are covered by Task 2.
- Transcript evidence in `submit_answer` payload is covered by Task 2 and Task 3.
- Full verification commands from the design are covered by Task 3.

**未完成标记扫描:**

- No unfinished markers or vague “handle later” steps remain.
- Every code-changing step includes exact file paths, code, commands, and expected output.

**Type consistency:**

- `transcribeVoiceThought()` returns `VoiceTranscript`.
- `PracticePage` imports `transcribeVoiceThought` from `../services/voiceApi`.
- `recordInteraction.studentAnswer` remains a string and carries structured evidence without backend schema changes.
