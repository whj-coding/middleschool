import { describe, expect, it, vi } from "vitest";
import { submitPracticeAnswer } from "./practiceApi";

describe("practiceApi", () => {
  it("submits a practice answer through the learning workflow API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        correct: false,
        answer: "y = 3x + 0.4",
        mistake: {
          questionId: "practice-printing-fee",
          reason: "审题与建模错误",
          evidence: "学生答案 y = 3x + 0.4 混淆了固定费用和单位变化费用。",
        },
        activeTask: { studentId: "student-demo", taskId: "task-linear-kb", status: "completed" },
      }),
    });

    const result = await submitPracticeAnswer(
      {
        sessionId: "practice-1",
        studentId: "student-demo",
        taskId: "task-linear-kb",
        questionId: "practice-printing-fee",
        answer: "y = 3x + 0.4",
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/practice/practice-1/answers",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          studentId: "student-demo",
          taskId: "task-linear-kb",
          questionId: "practice-printing-fee",
          answer: "y = 3x + 0.4",
        }),
      }),
    );
    expect(result.activeTask?.status).toBe("completed");
    expect(result.answer).toBe("y = 3x + 0.4");
  });

  it("rejects an incorrect grading response without a mistake", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ correct: false, answer: "wrong", activeTask: null }),
    });

    await expect(
      submitPracticeAnswer(
        { sessionId: "practice-1", studentId: "student-demo", taskId: "task-1", questionId: "q-1", answer: "wrong" },
        fetchMock,
      ),
    ).rejects.toThrow("Invalid practice submission result");
  });

  it("rejects a correct grading response containing a mistake", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        correct: true,
        answer: "y = 0.4x + 3",
        mistake: { questionId: "q-1", reason: "unexpected", evidence: "unexpected" },
        activeTask: null,
      }),
    });

    await expect(
      submitPracticeAnswer(
        {
          sessionId: "practice-1",
          studentId: "student-demo",
          taskId: "task-1",
          questionId: "q-1",
          answer: "y = 0.4x + 3",
        },
        fetchMock,
      ),
    ).rejects.toThrow("Invalid practice submission result");
  });
});
