export type GoalScore = "80" | "100" | "110+" | "full-score";
import { generateStructuredReport } from "../ai/reportAgent.js";
import { recommendTask } from "../ai/taskRecommendationAgent.js";
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
      const profile = repository.findProfile(studentId);
      const recommendation = recommendTask({
        goalScore: profile?.goalScore ?? "110+",
        weakPoints: ["k/b意义", "应用建模"],
      });

      return {
        id: recommendation.id,
        studentId,
        title: recommendation.title,
        reason: recommendation.reason,
        taskContent: recommendation.taskContent,
        estimatedMinutes: recommendation.durationMinutes,
        durationOptions: [10, 20, 40],
        completion: recommendation.taskContent,
        completionStandard: recommendation.completionStandard,
        learningPackageQuery: {
          knowledgeTag: "k/b意义",
          difficulty: "基础",
          ability: "概念",
        },
      };
    },

    startTask(studentId: string, taskId: string) {
      const task = { studentId, taskId, status: "started" as const };
      repository.saveTask(task);
      return task;
    },

    submitPracticeAnswer(studentId: string, taskId: string, questionId: string, answer: string) {
      const correct = answer.replace(/\s/g, "") === "y=0.4x+3";
      const startedTask = repository.findTask(studentId, taskId);
      const completedTask = startedTask ? { ...startedTask, status: "completed" as const } : null;
      repository.saveAttempt({ studentId, taskId, questionId, answer, correct });
      if (completedTask) repository.saveTask(completedTask);
      if (correct) return { correct, answer, activeTask: completedTask };

      const mistake = {
        questionId,
        reason: "审题与建模错误",
        evidence: `学生答案 ${answer} 混淆了固定费用和单位变化费用。`,
      };
      repository.saveMistake(studentId, mistake);
      return { correct, answer, mistake, activeTask: completedTask };
    },

    getLatestReport(studentId: string) {
      const studentAttempts = repository.listAttempts(studentId);
      if (studentAttempts.length === 0) return null;
      const studentMistakes = repository.listMistakes(studentId);
      const correctAttempts = studentAttempts.filter((attempt) => attempt.correct).length;
      const correctRate = correctAttempts / studentAttempts.length;
      const completionRate = Math.min(100, Math.max(0, Math.round(correctRate * 100)));
      const activeTask = repository.listTasks(studentId).filter((task) => task.status === "completed").at(-1) ?? null;
      const nextTask = { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" };
      const structuredReport = generateStructuredReport({
        correctRate,
        progress: "能说出 k 影响直线方向，但建模时还需要先分清固定量。",
        weakPoints: ["应用建模"],
        mistakeReason: studentMistakes[0]?.reason ?? "审题与建模错误",
        nextTaskTitle: nextTask.title,
      });

      return {
        studentId,
        progress: "能说出 k 影响直线方向，但建模时还需要先分清固定量。",
        weakPoints: ["应用建模"],
        mistakes: studentMistakes,
        activeTask,
        completionRate,
        summary: structuredReport.summary,
        recommendationReasons: structuredReport.recommendationReasons,
        nextTask,
      };
    },
  };
}
