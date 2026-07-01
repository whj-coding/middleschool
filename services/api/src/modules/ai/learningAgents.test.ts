import { describe, expect, it } from "vitest";
import { evaluateDiagnostic } from "./diagnosticAgent.js";
import { generateReportSummary } from "./reportAgent.js";
import { recommendTask } from "./taskRecommendationAgent.js";

describe("learning AI agents", () => {
  it("classifies weak point, recommends task, and summarizes report", () => {
    const diagnostic = evaluateDiagnostic([
      { ability: "图像", correct: false },
      { ability: "应用", correct: false },
    ]);
    const task = recommendTask({ goalScore: "110+", weakPoints: diagnostic.weakPoints });
    const report = generateReportSummary({
      correctRate: 0.5,
      weakPoints: diagnostic.weakPoints,
      mistakeReason: "图像理解错误",
      nextTaskTitle: task.title,
    });

    expect(diagnostic.weakPoints).toContain("图像理解");
    expect(task.title).toBe("理解 k 和 b 的意义");
    expect(report).toContain("下一步");
  });
});
