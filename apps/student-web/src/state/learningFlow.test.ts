import { describe, expect, it } from "vitest";
import { todayTask } from "../data/mockLearning";
import { createInitialLearningState, learningReducer } from "./learningFlow";
import type { PracticeSubmissionResult } from "../services/practiceApi";

describe("learningReducer", () => {
  it("moves a new student through goal, diagnostic, task, practice, mistake, and report", () => {
    let state = createInitialLearningState();
    state = learningReducer(state, { type: "setGoal", goalScore: "110+" });
    state = learningReducer(state, { type: "finishInitialDiagnostic" });
    state = learningReducer(state, { type: "startTask", task: todayTask });
    const incorrectResult: PracticeSubmissionResult = {
      correct: false,
      answer: "y = 3x + 0.4",
      mistake: { questionId: "practice-printing-fee", reason: "审题与建模错误", evidence: "API evidence" },
      activeTask: null,
    };
    state = learningReducer(state, { type: "submitPracticeAnswer", result: incorrectResult });
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

  it("moves a correct result directly to report without adding a mistake", () => {
    const state = learningReducer(createInitialLearningState(), {
      type: "submitPracticeAnswer",
      result: { correct: true, answer: "y = 0.4x + 3", activeTask: null },
    });

    expect(state.currentPage).toBe("report");
    expect(state.practiceAnswer).toBe("y = 0.4x + 3");
    expect(state.mistakes).toEqual([]);
  });

  it("uses exactly the API mistake for an incorrect result", () => {
    const mistake = { questionId: "q-api", reason: "API reason", evidence: "API evidence" };
    const state = learningReducer(createInitialLearningState(), {
      type: "submitPracticeAnswer",
      result: { correct: false, answer: "wrong", mistake, activeTask: null },
    });

    expect(state.currentPage).toBe("mistake");
    expect(state.mistakes).toEqual([mistake]);
  });
});
