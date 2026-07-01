export type GoalScore = "80" | "100" | "110+" | "full-score";
import type { LearningRepository } from "./repository.js";

export function createLearningService(repository: LearningRepository) {
  return {
    setGoal(studentId: string, goalScore: GoalScore) {
      const profile = { studentId, goalScore };
      repository.saveProfile(profile);
      return profile;
    },

    finishInitialDiagnostic(studentId: string) {
      return { studentId, weakPoints: ["k 和 b 的意义", "应用建模"] };
    },

    getTodayTask(studentId: string) {
      return {
        id: "task-linear-kb",
        studentId,
        title: "理解 k 和 b 的意义",
        reason: "诊断显示你对斜率和截距的图像意义不够稳定。",
        durationOptions: [10, 20, 40],
      };
    },

    submitPracticeAnswer(studentId: string, questionId: string, answer: string) {
      const mistake = {
        questionId,
        reason: "审题与建模错误",
        evidence: `学生答案 ${answer} 混淆了固定费用和单位变化费用。`,
      };
      repository.saveMistake(studentId, mistake);
      return { correct: false, mistake };
    },

    getLatestReport(studentId: string) {
      const studentMistakes = repository.listMistakes(studentId);
      if (studentMistakes.length === 0) return null;

      return {
        studentId,
        progress: "能说出 k 影响直线方向，但建模时还需要先分清固定量。",
        weakPoints: ["应用建模"],
        mistakes: studentMistakes,
        nextTask: { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" },
      };
    },
  };
}
