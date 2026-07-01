import { describe, expect, it } from "vitest";
import { approveQuestion, canExposeFigureRecognition, canPublishQuestion } from "./reviewService.js";
import type { FigureRecognition, Question } from "./types.js";

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
    const figure: FigureRecognition = {
      questionId: question.id,
      figureType: "coordinate_line_graph",
      elements: {},
      confidence: 0.62,
      reviewStatus: "approved",
    };
    expect(canExposeFigureRecognition(figure)).toBe(false);
  });
});
