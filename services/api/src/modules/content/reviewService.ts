import type { FigureRecognition, Question } from "./types.js";

export function approveQuestion(question: Question): Question {
  return { ...question, reviewStatus: "approved" };
}

export function canPublishQuestion(question: Question) {
  return question.reviewStatus === "approved" && question.answer.length > 0 && question.explanation.length > 0;
}

export function canExposeFigureRecognition(figure: FigureRecognition) {
  return figure.reviewStatus === "approved" && figure.confidence >= 0.8;
}
