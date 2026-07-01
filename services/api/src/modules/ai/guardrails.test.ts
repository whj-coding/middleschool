import { describe, expect, it } from "vitest";
import { canUseAnswerMode, canUseFigureRecognition } from "./guardrails.js";

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
