export type GoalScore = "80" | "100" | "110+" | "full-score";
export type PageId = "goal" | "diagnostic" | "today" | "task" | "practice" | "mistake" | "report";

export type LearningState = {
  currentPage: PageId;
  goalScore: GoalScore | null;
  activeTaskId: string | null;
  practiceAnswer: string | null;
  mistakes: Array<{ questionId: string; reason: string; evidence: string }>;
  nextTaskId: string | null;
};

export type LearningAction =
  | { type: "setGoal"; goalScore: GoalScore }
  | { type: "finishInitialDiagnostic" }
  | { type: "startTask"; taskId: string }
  | { type: "enterPractice" }
  | { type: "submitPracticeAnswer"; answer: string }
  | { type: "openMistakeReview" }
  | { type: "finishReport" };

export function createInitialLearningState(): LearningState {
  return {
    currentPage: "goal",
    goalScore: null,
    activeTaskId: null,
    practiceAnswer: null,
    mistakes: [],
    nextTaskId: null,
  };
}

export function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case "setGoal":
      return { ...state, goalScore: action.goalScore, currentPage: "diagnostic" };
    case "finishInitialDiagnostic":
      return { ...state, currentPage: "today" };
    case "startTask":
      return { ...state, activeTaskId: action.taskId, currentPage: "task" };
    case "enterPractice":
      return { ...state, currentPage: "practice" };
    case "submitPracticeAnswer":
      return {
        ...state,
        practiceAnswer: action.answer,
        currentPage: "mistake",
        mistakes: [
          {
            questionId: "practice-printing-fee",
            reason: "审题与建模错误",
            evidence: "把基础服务费和每页费用混在一起，没有先区分固定费用和变化费用。",
          },
        ],
      };
    case "openMistakeReview":
      return { ...state, currentPage: "mistake" };
    case "finishReport":
      return { ...state, currentPage: "report", nextTaskId: "task-linear-modeling" };
    default:
      return state;
  }
}
