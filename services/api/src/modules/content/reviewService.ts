import type { FigureRecognition, Question } from "./types.js";

export function approveQuestion(question: Question): Question {
  return { ...question, reviewStatus: "approved" };
}

function transitionQuestion(question: Question, reason: string, reviewStatus: "needs_revision" | "rejected"): Question {
  const reviewReason = reason.trim();
  if (!reviewReason) throw new Error("review_reason_required");
  return { ...question, reviewStatus, reviewReason };
}

export function requestQuestionChanges(question: Question, reason: string): Question {
  return transitionQuestion(question, reason, "needs_revision");
}

export function rejectQuestion(question: Question, reason: string): Question {
  return transitionQuestion(question, reason, "rejected");
}

export function canPublishQuestion(question: Question) {
  return question.reviewStatus === "approved" && question.answer.length > 0 && question.explanation.length > 0;
}

export function canExposeFigureRecognition(figure: FigureRecognition) {
  return figure.reviewStatus === "approved" && figure.confidence >= 0.8;
}
