import { describe, expect, it } from "vitest";
import { approveQuestion, canExposeFigureRecognition, canPublishQuestion, rejectQuestion, requestQuestionChanges } from "./reviewService.js";
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

  it("requires and stores a trimmed reason when requesting changes", () => {
    expect(() => requestQuestionChanges(question, "   ")).toThrow("review_reason_required");
    expect(requestQuestionChanges(question, "  解析缺少关键步骤  ")).toEqual({
      ...question,
      reviewStatus: "needs_revision",
      reviewReason: "解析缺少关键步骤",
    });
  });

  it("requires and stores a trimmed reason when rejecting a question", () => {
    expect(() => rejectQuestion(question, "\n\t")).toThrow("review_reason_required");
    expect(rejectQuestion(question, "  题目条件错误  ")).toEqual({
      ...question,
      reviewStatus: "rejected",
      reviewReason: "题目条件错误",
    });
  });

  it("rejects review transitions from terminal states", () => {
    for (const reviewStatus of ["approved", "published", "rejected"] as const) {
      expect(() => requestQuestionChanges({ ...question, reviewStatus }, "需修改")).toThrow("invalid_review_transition");
      expect(() => rejectQuestion({ ...question, reviewStatus }, "拒绝")).toThrow("invalid_review_transition");
    }
  });

  it("clears the previous review reason when approving a revision", () => {
    expect(approveQuestion({ ...question, reviewStatus: "needs_revision", reviewReason: "旧原因" })).toEqual({
      ...question,
      reviewStatus: "approved",
    });
  });
});
