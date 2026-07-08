import { describe, expect, it } from "vitest";
import { evaluateDiagnostic } from "./diagnosticAgent.js";
import { generateReportSummary, generateStructuredReport } from "./reportAgent.js";
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
    expect(task.taskContent).toContain("图像探索");
    expect(task.completionStandard).toContain("y = kx + b");
    expect(report).toContain("下一步");
  });

  it("generates structured report copy for student UI", () => {
    const report = generateStructuredReport({
      correctRate: 0.5,
      progress: "能说出 k 影响直线方向。",
      weakPoints: ["应用建模"],
      mistakeReason: "审题与建模错误",
      nextTaskTitle: "从打印费理解固定费用和变化费用",
    });

    expect(report.summary).toContain("从打印费理解固定费用和变化费用");
    expect(report.recommendationReasons).toContain("应用建模 · 需加强");
  });
});
