# AI And Voice Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mock-first AI and voice adapters that enforce hint, explanation, answer, diagnosis, task recommendation, report, STT, and TTS rules for the linear-function MVP.

**Architecture:** Put all AI and voice behavior behind deterministic adapter interfaces in `services/api/src/modules/ai/` and `services/api/src/modules/voice/`. Real providers can be added later without changing learning routes or frontend contracts.

**Tech Stack:** TypeScript, Fastify route adapters, Vitest, Zod validation for structured outputs.

---

## File Structure

- `services/api/src/modules/ai/types.ts`: shared AI context and output types.
- `services/api/src/modules/ai/coachAgent.ts`: hint, explanation, answer mode responses.
- `services/api/src/modules/ai/diagnosticAgent.ts`: weak point and mistake classification.
- `services/api/src/modules/ai/taskRecommendationAgent.ts`: next task selection.
- `services/api/src/modules/ai/reportAgent.ts`: concise student-facing report.
- `services/api/src/modules/ai/guardrails.ts`: answer gating and figure-confidence checks.
- `services/api/src/modules/ai/*.test.ts`: AI unit tests.
- `services/api/src/modules/voice/types.ts`: STT/TTS interfaces.
- `services/api/src/modules/voice/mockVoiceAdapters.ts`: deterministic transcript and TTS mock.
- `services/api/src/modules/voice/voiceRoutes.ts`: `/voice/stt` and `/voice/tts`.

### Task 1: Define AI Types And Guardrails

**Files:**
- Create: `D:/middle school/services/api/src/modules/ai/types.ts`
- Create: `D:/middle school/services/api/src/modules/ai/guardrails.ts`
- Create: `D:/middle school/services/api/src/modules/ai/guardrails.test.ts`

- [ ] **Step 1: Write guardrail test**

Create `guardrails.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canUseAnswerMode, canUseFigureRecognition } from "./guardrails";

describe("AI guardrails", () => {
  it("blocks answer mode before submission and repeated help", () => {
    expect(canUseAnswerMode({ submitted: false, helpCount: 1 })).toBe(false);
    expect(canUseAnswerMode({ submitted: true, helpCount: 1 })).toBe(true);
    expect(canUseAnswerMode({ submitted: false, helpCount: 3 })).toBe(true);
  });

  it("blocks low confidence figure recognition in student explanation", () => {
    expect(canUseFigureRecognition({ confidence: 0.62, reviewStatus: "approved" })).toBe(false);
    expect(canUseFigureRecognition({ confidence: 0.86, reviewStatus: "approved" })).toBe(true);
  });
});
```

- [ ] **Step 2: Implement types and guardrails**

Create `types.ts`:

```ts
export type HelpMode = "hint" | "explanation" | "answer";
export type ReviewStatus = "pending_review" | "approved" | "published" | "needs_revision" | "unusable";

export type CoachContext = {
  questionId: string;
  submitted: boolean;
  helpCount: number;
  requestedMode: HelpMode;
  studentAnswer?: string;
};
```

Create `guardrails.ts`:

```ts
export function canUseAnswerMode(input: { submitted: boolean; helpCount: number }) {
  return input.submitted || input.helpCount >= 3;
}

export function canUseFigureRecognition(input: { confidence: number; reviewStatus: string }) {
  return input.reviewStatus === "approved" && input.confidence >= 0.8;
}
```

- [ ] **Step 3: Verify guardrails**

Run:

```powershell
npm run test -- src/modules/ai/guardrails.test.ts
```

Expected: tests pass.

### Task 2: Implement Coach Agent

**Files:**
- Create: `D:/middle school/services/api/src/modules/ai/coachAgent.ts`
- Create: `D:/middle school/services/api/src/modules/ai/coachAgent.test.ts`

- [ ] **Step 1: Write coach tests**

Create `coachAgent.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateCoachReply } from "./coachAgent";

describe("generateCoachReply", () => {
  it("does not reveal final answer in hint mode", () => {
    const reply = generateCoachReply({ questionId: "q1", submitted: false, helpCount: 1, requestedMode: "hint" });
    expect(reply.mode).toBe("hint");
    expect(reply.text).not.toContain("y = 0.4x + 3");
  });

  it("gives structured explanation after submission", () => {
    const reply = generateCoachReply({ questionId: "q1", submitted: true, helpCount: 1, requestedMode: "explanation", studentAnswer: "y = 3x + 0.4" });
    expect(reply.mode).toBe("explanation");
    expect(reply.text).toContain("审题与建模错误");
    expect(reply.text).toContain("固定费用");
  });
});
```

- [ ] **Step 2: Implement coach agent**

Create `coachAgent.ts`:

```ts
import type { CoachContext, HelpMode } from "./types";
import { canUseAnswerMode } from "./guardrails";

export function generateCoachReply(context: CoachContext): { mode: HelpMode; text: string } {
  if (context.requestedMode === "answer" && !canUseAnswerMode(context)) {
    return {
      mode: "hint",
      text: "先不直接给完整答案。你先找两个量：固定不变的起点费用是多少，每增加 1 个单位会增加多少。",
    };
  }
  if (context.requestedMode === "explanation" && context.submitted) {
    return {
      mode: "explanation",
      text: "这题的主要错因是审题与建模错误。先区分固定费用 3 元和每页变化费用 0.4 元，再写成 y = 0.4x + 3。",
    };
  }
  if (context.requestedMode === "answer") {
    return { mode: "answer", text: "完整答案：y = 0.4x + 3，其中 3 是固定费用，0.4 是每打印 1 页增加的费用。" };
  }
  return {
    mode: "hint",
    text: "先不要急着写式子。请先说出哪个量固定不变，哪个量会随着页数变化。",
  };
}
```

- [ ] **Step 3: Verify coach tests**

Run:

```powershell
npm run test -- src/modules/ai/coachAgent.test.ts
```

Expected: tests pass.

### Task 3: Implement Diagnostic, Recommendation, And Report Agents

**Files:**
- Create: `D:/middle school/services/api/src/modules/ai/diagnosticAgent.ts`
- Create: `D:/middle school/services/api/src/modules/ai/taskRecommendationAgent.ts`
- Create: `D:/middle school/services/api/src/modules/ai/reportAgent.ts`
- Create: `D:/middle school/services/api/src/modules/ai/learningAgents.test.ts`

- [ ] **Step 1: Write combined agent tests**

Create `learningAgents.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { evaluateDiagnostic } from "./diagnosticAgent";
import { recommendTask } from "./taskRecommendationAgent";
import { generateReportSummary } from "./reportAgent";

describe("learning AI agents", () => {
  it("classifies weak point, recommends task, and summarizes report", () => {
    const diagnostic = evaluateDiagnostic([{ ability: "图像", correct: false }, { ability: "应用", correct: false }]);
    const task = recommendTask({ goalScore: "110+", weakPoints: diagnostic.weakPoints });
    const report = generateReportSummary({ correctRate: 0.5, weakPoints: diagnostic.weakPoints, mistakeReason: "图像理解错误", nextTaskTitle: task.title });

    expect(diagnostic.weakPoints).toContain("图像理解");
    expect(task.title).toBe("理解 k 和 b 的意义");
    expect(report).toContain("下一步");
  });
});
```

- [ ] **Step 2: Implement agents**

Create `diagnosticAgent.ts`:

```ts
export function evaluateDiagnostic(answers: Array<{ ability: string; correct: boolean }>) {
  const weakPoints = answers.filter((answer) => !answer.correct).map((answer) => (answer.ability === "图像" ? "图像理解" : "应用建模"));
  return { weakPoints: Array.from(new Set(weakPoints)), mistakeCandidates: ["图像理解错误", "审题与建模错误"] };
}
```

Create `taskRecommendationAgent.ts`:

```ts
export function recommendTask(input: { goalScore: string; weakPoints: string[] }) {
  return {
    id: "task-linear-kb",
    title: input.weakPoints.includes("图像理解") ? "理解 k 和 b 的意义" : "从打印费理解一次函数建模",
    reason: `目标 ${input.goalScore} 需要先补稳定的 ${input.weakPoints[0] ?? "基础概念"}。`,
    durationMinutes: 20,
  };
}
```

Create `reportAgent.ts`:

```ts
export function generateReportSummary(input: { correctRate: number; weakPoints: string[]; mistakeReason: string; nextTaskTitle: string }) {
  return `本次正确率 ${Math.round(input.correctRate * 100)}%。进步点是能开始识别变量关系。当前薄弱点是 ${input.weakPoints.join("、")}，主要错因是 ${input.mistakeReason}。下一步建议完成「${input.nextTaskTitle}」。`;
}
```

- [ ] **Step 3: Verify agent tests**

Run:

```powershell
npm run test -- src/modules/ai/learningAgents.test.ts
```

Expected: tests pass.

### Task 4: Implement Voice Adapters

**Files:**
- Create: `D:/middle school/services/api/src/modules/voice/types.ts`
- Create: `D:/middle school/services/api/src/modules/voice/mockVoiceAdapters.ts`
- Create: `D:/middle school/services/api/src/modules/voice/mockVoiceAdapters.test.ts`

- [ ] **Step 1: Write voice tests**

Create `mockVoiceAdapters.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mockSpeechToText, mockTextToSpeech } from "./mockVoiceAdapters";

describe("voice adapters", () => {
  it("returns visible transcript and tts url", async () => {
    const transcript = await mockSpeechToText.transcribe(Buffer.from("audio"));
    const audio = await mockTextToSpeech.synthesize("先找固定费用。", { voice: "student-coach", speed: 1 });

    expect(transcript.text).toContain("我觉得固定费用是 3 元");
    expect(audio.text).toBe("先找固定费用。");
    expect(audio.audioUrl).toBe("/mock-audio/student-coach.mp3");
  });
});
```

- [ ] **Step 2: Implement voice interfaces**

Create `types.ts`:

```ts
export type Transcript = { text: string; confidence: number; confirmed: boolean };
export type TtsOutput = { text: string; audioUrl: string; voice: string; speed: number };
```

Create `mockVoiceAdapters.ts`:

```ts
import type { Transcript, TtsOutput } from "./types";

export const mockSpeechToText = {
  async transcribe(_audio: Buffer): Promise<Transcript> {
    return { text: "我觉得固定费用是 3 元，每页增加 0.4 元。", confidence: 0.94, confirmed: false };
  },
};

export const mockTextToSpeech = {
  async synthesize(text: string, options: { voice: string; speed: number }): Promise<TtsOutput> {
    return { text, audioUrl: `/mock-audio/${options.voice}.mp3`, voice: options.voice, speed: options.speed };
  },
};
```

- [ ] **Step 3: Verify voice adapter tests**

Run:

```powershell
npm run test -- src/modules/voice/mockVoiceAdapters.test.ts
```

Expected: tests pass.

## Self-Review

- Spec coverage: covers hint, explanation, answer gating, diagnosis, recommendation, report, STT, and TTS.
- Red-flag scan: no unfinished markers or unspecified implementation bucket remains.
- Type consistency: adapter names match the technical architecture.
