import type { Question } from "./types.js";

export type ContentRepository = {
  saveQuestion(question: Question): void;
  findQuestion(questionId: string): Question | undefined;
};

export function createInMemoryContentRepository(): ContentRepository {
  const questions = new Map<string, Question>();

  return {
    saveQuestion(question) {
      questions.set(question.id, question);
    },
    findQuestion(questionId) {
      return questions.get(questionId);
    },
  };
}
