import { describe, expect, it } from "vitest";
import { createInMemoryLearningRepository } from "./repository.js";
import { createLearningService } from "./service.js";

describe("learning service", () => {
  it("generates a task, mistake, and report for a new student", () => {
    const service = createLearningService(createInMemoryLearningRepository());
    const profile = service.setGoal("student-1", "110+");
    const diagnostic = service.finishInitialDiagnostic("student-1");
    const task = service.getTodayTask("student-1");
    const startedTask = service.startTask("student-1", task.id);
    const result = service.submitPracticeAnswer("student-1", task.id, "practice-printing-fee", "y = 3x + 0.4");
    const report = service.getLatestReport("student-1");

    expect(profile.goalScore).toBe("110+");
    expect(diagnostic.weakPoints).toContain("k 和 b 的意义");
    expect(task.id).toBe("task-linear-kb");
    expect(task.taskContent).toContain("图像探索");
    expect(task.estimatedMinutes).toBe(20);
    expect(task.completionStandard).toContain("单位变化量");
    expect(task.learningPackageQuery).toEqual({
      knowledgeTag: "k/b意义",
      difficulty: "基础",
      ability: "概念",
    });
    expect(startedTask.status).toBe("started");
    expect(result.mistake.reason).toBe("审题与建模错误");
    expect(result.activeTask?.status).toBe("completed");
    if (!report) throw new Error("expected report after practice submission");
    expect(report.activeTask?.status).toBe("completed");
    expect(report.summary).toContain("从打印费理解固定费用和变化费用");
    expect(report.recommendationReasons).toContain("应用建模 · 需加强");
    expect(report.nextTask.id).toBe("task-linear-modeling");
  });

  it("completes the task attached to the submitted practice answer", () => {
    const repository = createInMemoryLearningRepository();
    const service = createLearningService(repository);

    service.startTask("student-1", "task-old");
    service.startTask("student-1", "task-current");

    const result = service.submitPracticeAnswer(
      "student-1",
      "task-current",
      "practice-printing-fee",
      "y = 3x + 0.4",
    );
    const report = service.getLatestReport("student-1");

    expect(result.activeTask).toEqual({
      studentId: "student-1",
      taskId: "task-current",
      status: "completed",
    });
    expect(repository.findTask("student-1", "task-old")?.status).toBe("started");
    expect(repository.findTask("student-1", "task-current")?.status).toBe("completed");
    expect(report?.activeTask?.taskId).toBe("task-current");
  });

  it("reports the task most recently completed by a practice answer", () => {
    const repository = createInMemoryLearningRepository();
    const service = createLearningService(repository);

    service.startTask("student-1", "task-old");
    service.startTask("student-1", "task-current");

    service.submitPracticeAnswer("student-1", "task-old", "practice-printing-fee", "y = 3x + 0.4");
    const report = service.getLatestReport("student-1");

    expect(report?.activeTask).toEqual({
      studentId: "student-1",
      taskId: "task-old",
      status: "completed",
    });
  });

  it("keeps reporting the latest completed task when a newer task has only started", () => {
    const service = createLearningService(createInMemoryLearningRepository());

    service.startTask("student-1", "task-completed");
    service.submitPracticeAnswer("student-1", "task-completed", "practice-printing-fee", "y = 3x + 0.4");
    service.startTask("student-1", "task-started");

    const report = service.getLatestReport("student-1");

    expect(report?.activeTask).toEqual({
      studentId: "student-1",
      taskId: "task-completed",
      status: "completed",
    });
  });
});
