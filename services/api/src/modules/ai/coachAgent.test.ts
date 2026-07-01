import { describe, expect, it } from "vitest";
import { generateCoachReply } from "./coachAgent.js";

describe("generateCoachReply", () => {
  it("does not reveal final answer in hint mode", () => {
    const reply = generateCoachReply({ questionId: "q1", submitted: false, helpCount: 1, requestedMode: "hint" });
    expect(reply.mode).toBe("hint");
    expect(reply.text).not.toContain("y = 0.4x + 3");
  });

  it("gives structured explanation after submission", () => {
    const reply = generateCoachReply({
      questionId: "q1",
      submitted: true,
      helpCount: 1,
      requestedMode: "explanation",
      studentAnswer: "y = 3x + 0.4",
    });
    expect(reply.mode).toBe("explanation");
    expect(reply.text).toContain("审题与建模错误");
    expect(reply.text).toContain("固定费用");
  });
});
