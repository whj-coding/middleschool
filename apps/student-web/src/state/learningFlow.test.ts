import { describe, expect, it } from "vitest";
import { createInitialLearningState, learningReducer } from "./learningFlow";

describe("learningReducer", () => {
  it("moves a new student through goal, diagnostic, task, practice, mistake, and report", () => {
    let state = createInitialLearningState();
    state = learningReducer(state, { type: "setGoal", goalScore: "110+" });
    state = learningReducer(state, { type: "finishInitialDiagnostic" });
    state = learningReducer(state, { type: "startTask", taskId: "task-linear-kb" });
    state = learningReducer(state, { type: "submitPracticeAnswer", answer: "y = 0.4x + 3" });
    state = learningReducer(state, { type: "openMistakeReview" });
    state = learningReducer(state, { type: "finishReport" });

    expect(state.goalScore).toBe("110+");
    expect(state.currentPage).toBe("report");
    expect(state.mistakes[0].reason).toBe("审题与建模错误");
    expect(state.nextTaskId).toBe("task-linear-modeling");
  });
});
