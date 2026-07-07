import { describe, expect, it, vi } from "vitest";
import { recordInteraction } from "./interactionApi";

describe("interactionApi", () => {
  it("records a student interaction through the API proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "interaction-1", studentId: "student-demo" }),
    });

    const result = await recordInteraction(
      {
        studentId: "student-demo",
        taskId: "task-linear-kb",
        questionId: "practice-printing-fee",
        action: "submit_answer",
        studentAnswer: "y = 3x + 0.4",
        hintLevel: 1,
        correct: false,
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/interactions",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "student-demo",
          taskId: "task-linear-kb",
          questionId: "practice-printing-fee",
          action: "submit_answer",
          studentAnswer: "y = 3x + 0.4",
          hintLevel: 1,
          correct: false,
        }),
      }),
    );
    expect(result.id).toBe("interaction-1");
  });
});
