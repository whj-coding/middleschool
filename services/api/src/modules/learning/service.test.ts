import { describe, expect, it } from "vitest";
import { createInMemoryLearningRepository } from "./repository.js";
import { createLearningService } from "./service.js";

describe("learning service", () => {
  it("generates a task, mistake, and report for a new student", () => {
    const service = createLearningService(createInMemoryLearningRepository());
    const profile = service.setGoal("student-1", "110+");
    const diagnostic = service.finishInitialDiagnostic("student-1");
    const task = service.getTodayTask("student-1");
    const result = service.submitPracticeAnswer("student-1", "practice-printing-fee", "y = 3x + 0.4");
    const report = service.getLatestReport("student-1");

    expect(profile.goalScore).toBe("110+");
    expect(diagnostic.weakPoints).toContain("k 和 b 的意义");
    expect(task.id).toBe("task-linear-kb");
    expect(result.mistake.reason).toBe("审题与建模错误");
    if (!report) throw new Error("expected report after practice submission");
    expect(report.nextTask.id).toBe("task-linear-modeling");
  });
});
