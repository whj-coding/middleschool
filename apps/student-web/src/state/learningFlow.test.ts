import { describe, expect, it } from "vitest";
import { todayTask } from "../data/mockLearning";
import { createInitialLearningState, learningReducer } from "./learningFlow";

describe("learningReducer", () => {
  it("moves a new student through goal, diagnostic, task, practice, mistake, and report", () => {
    let state = createInitialLearningState();
    state = learningReducer(state, { type: "setGoal", goalScore: "110+" });
    state = learningReducer(state, { type: "finishInitialDiagnostic" });
    state = learningReducer(state, { type: "startTask", task: todayTask });
    state = learningReducer(state, { type: "submitPracticeAnswer", answer: "y = 0.4x + 3" });
    state = learningReducer(state, { type: "openMistakeReview" });
    state = learningReducer(state, { type: "finishReport" });
    state = learningReducer(state, { type: "startRetryPractice", questionId: "practice-printing-fee", taskId: "task-linear-kb" });

    expect(state.goalScore).toBe("110+");
    expect(state.currentPage).toBe("practice");
    expect(state.activeTaskId).toBe("task-linear-kb");
    expect(state.practiceTaskId).toBe("task-linear-kb");
    expect(state.activeTask?.learningPackageQuery.knowledgeTag).toBe("k/b意义");
    expect(state.retryQuestionId).toBe("practice-printing-fee");
    expect(state.mistakes[0].reason).toBe("审题与建模错误");
    expect(state.nextTaskId).toBe("task-linear-modeling");
  });
});
