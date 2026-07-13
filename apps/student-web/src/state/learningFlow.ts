import type { TodayTask } from "../services/todayTaskApi";
import type { PracticeSubmissionResult } from "../services/practiceApi";

export type GoalScore = "80" | "100" | "110+" | "full-score";
export type PageId = "goal" | "diagnostic" | "today" | "task" | "practice" | "mistake" | "report";

export type LearningState = {
  currentPage: PageId;
  goalScore: GoalScore | null;
  activeTaskId: string | null;
  activeTask: TodayTask | null;
  practiceTaskId: string | null;
  practiceAnswer: string | null;
  mistakes: Array<{ questionId: string; reason: string; evidence: string }>;
  nextTaskId: string | null;
  retryQuestionId: string | null;
};

export type LearningAction =
  | { type: "setGoal"; goalScore: GoalScore }
  | { type: "finishInitialDiagnostic" }
  | { type: "startTask"; task: TodayTask }
  | { type: "enterPractice" }
  | { type: "submitPracticeAnswer"; result: PracticeSubmissionResult }
  | { type: "openMistakeReview" }
  | { type: "finishReport" }
  | { type: "startRetryPractice"; questionId: string; taskId: string | null };

export function createInitialLearningState(): LearningState {
  return {
    currentPage: "goal",
    goalScore: null,
    activeTaskId: null,
    activeTask: null,
    practiceTaskId: null,
    practiceAnswer: null,
    mistakes: [],
    nextTaskId: null,
    retryQuestionId: null,
  };
}

export function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case "setGoal":
      return { ...state, goalScore: action.goalScore, currentPage: "diagnostic" };
    case "finishInitialDiagnostic":
      return { ...state, currentPage: "today" };
    case "startTask":
      return {
        ...state,
        activeTaskId: action.task.id,
        activeTask: action.task,
        practiceTaskId: action.task.id,
        retryQuestionId: null,
        currentPage: "task",
      };
    case "enterPractice":
      return { ...state, practiceTaskId: state.activeTaskId, currentPage: "practice" };
    case "submitPracticeAnswer":
      return {
        ...state,
        practiceAnswer: action.result.answer,
        currentPage: action.result.correct ? "report" : "mistake",
        mistakes: action.result.correct ? state.mistakes : [...state.mistakes, action.result.mistake],
      };
    case "openMistakeReview":
      return { ...state, currentPage: "mistake" };
    case "finishReport":
      return { ...state, currentPage: "report", nextTaskId: "task-linear-modeling" };
    case "startRetryPractice":
      return {
        ...state,
        currentPage: "practice",
        retryQuestionId: action.questionId,
        practiceTaskId: action.taskId ?? state.activeTaskId,
      };
    default:
      return state;
  }
}
