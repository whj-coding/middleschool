import type { createDataPipelineRepository } from "./repository.js";
import type { ComposeLearningPackageInput, InteractionAction, InteractionLog, RetryPracticeItem } from "./types.js";

type Repository = ReturnType<typeof createDataPipelineRepository>;

type RecordInteractionInput = {
  studentId: string;
  taskId?: string | null;
  questionId?: string | null;
  contentUnitId?: string | null;
  action: InteractionAction;
  studentAnswer?: string | null;
  hintLevel?: number;
  timeToAnswerMs?: number | null;
  correct?: boolean | null;
  aiResponse?: string | null;
  feedbackRating?: number | null;
};

export function createDataPipelineService(repository: Repository) {
  return {
    composeLearningPackage(input: ComposeLearningPackageInput) {
      const units = repository
        .listContentUnits()
        .filter((unit) => unit.reviewStatus === "approved")
        .filter((unit) => unit.knowledgeTags.includes(input.knowledgeTag))
        .filter((unit) => unit.difficulty === input.difficulty || unit.difficulty === "基础")
        .filter((unit) => unit.ability === input.ability)
        .sort((a, b) => b.qualityScore - a.qualityScore || a.usageCount - b.usageCount);

      return { units };
    },
    listContentUnits() {
      return { units: repository.listContentUnits() };
    },
    approveContentUnit(unitId: string) {
      const unit = repository.findContentUnit(unitId);
      if (!unit) return null;
      return repository.updateContentUnit({ ...unit, reviewStatus: "approved" });
    },
    listRetryPracticeItems(studentId: string): { items: RetryPracticeItem[] } {
      const items = repository
        .listInteractionLogs(studentId)
        .filter((log) => log.action === "submit_answer" && log.correct === false && log.questionId)
        .map((log) => ({
          questionId: log.questionId as string,
          taskId: log.taskId,
          studentAnswer: log.studentAnswer,
          hintLevel: log.hintLevel,
          createdAt: log.createdAt,
        }));

      return { items };
    },
    recordInteraction(input: RecordInteractionInput): InteractionLog {
      const log: InteractionLog = {
        id: `interaction-${Date.now()}`,
        studentId: input.studentId,
        taskId: input.taskId ?? null,
        questionId: input.questionId ?? null,
        contentUnitId: input.contentUnitId ?? null,
        action: input.action,
        studentAnswer: input.studentAnswer ?? null,
        hintLevel: input.hintLevel ?? 0,
        timeToAnswerMs: input.timeToAnswerMs ?? null,
        correct: input.correct ?? null,
        aiResponse: input.aiResponse ?? null,
        feedbackRating: input.feedbackRating ?? null,
        createdAt: new Date().toISOString(),
      };

      return repository.saveInteractionLog(log);
    },
  };
}
