import { describe, expect, it } from "vitest";
import { createDataPipelineRepository } from "./repository.js";
import { createDataPipelineService } from "./service.js";

describe("data pipeline service", () => {
  it("composes learning package from approved content only", () => {
    const repository = createDataPipelineRepository();
    repository.saveContentUnit({
      id: "unit-approved-kb",
      chunkType: "concept",
      contentMarkdown: "k 表示单位变化量，b 表示初始量。",
      knowledgeTags: ["一次函数", "k/b意义"],
      difficulty: "基础",
      ability: "概念",
      errorTypes: ["概念理解错误"],
      reviewStatus: "approved",
      qualityScore: 0.9,
      usageCount: 0,
    });
    repository.saveContentUnit({
      id: "unit-draft-kb",
      chunkType: "concept",
      contentMarkdown: "未审核内容",
      knowledgeTags: ["一次函数", "k/b意义"],
      difficulty: "基础",
      ability: "概念",
      errorTypes: [],
      reviewStatus: "pending_review",
      qualityScore: 1,
      usageCount: 0,
    });

    const service = createDataPipelineService(repository);
    const result = service.composeLearningPackage({
      knowledgeTag: "k/b意义",
      difficulty: "基础",
      ability: "概念",
    });

    expect(result.units.map((unit) => unit.id)).toEqual(["unit-approved-kb"]);
  });

  it("records student interaction logs", () => {
    const repository = createDataPipelineRepository();
    const service = createDataPipelineService(repository);

    const log = service.recordInteraction({
      studentId: "student-1",
      taskId: "task-linear-kb",
      questionId: "practice-printing-fee",
      action: "request_hint",
      hintLevel: 1,
      correct: null,
    });

    expect(log.id).toMatch(/^interaction-/);
    expect(repository.listInteractionLogs("student-1")).toHaveLength(1);
  });
});
