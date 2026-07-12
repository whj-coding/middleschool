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
        taskId,
        questionId,
        reason: "审题与建模错误",
        evidence: `学生答案 ${answer} 混淆了固定费用和单位变化费用。`,
      };
      repository.saveMistake(studentId, mistake);
      return { correct, answer, mistake, activeTask: completedTask };
    },

    getLatestReport(studentId: string) {
      const allAttempts = repository.listAttempts(studentId);
      if (allAttempts.length === 0) return null;
      const activeTask = repository.listTasks(studentId).filter((task) => task.status === "completed").at(-1) ?? null;
      const reportTaskId = activeTask?.taskId ?? allAttempts.at(-1)!.taskId;
      const taskAttempts = allAttempts.filter((attempt) => attempt.taskId === reportTaskId);
      const incorrectQuestionIds = new Set(taskAttempts.filter((attempt) => !attempt.correct).map((attempt) => attempt.questionId));
      const studentMistakes = repository
        .listMistakes(studentId)
        .filter((mistake) => mistake.taskId === reportTaskId && incorrectQuestionIds.has(mistake.questionId));
      const correctAttempts = taskAttempts.filter((attempt) => attempt.correct).length;
      const correctRate = correctAttempts / taskAttempts.length;
      const completionRate = Math.min(100, Math.max(0, Math.round(correctRate * 100)));
      const nextTask = { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" };
      const hasMistakes = studentMistakes.length > 0;
      const progress = hasMistakes
        ? "能说出 k 影响直线方向，但建模时还需要先分清固定量。"
        : "本次任务全部答对，能够独立完成当前练习。";
      const weakPoints = hasMistakes ? ["应用建模"] : [];
      const structuredReport = generateStructuredReport({
        correctRate,
        progress,
        weakPoints,
        mistakeReason: studentMistakes[0]?.reason ?? "",
        nextTaskTitle: nextTask.title,
      });

      return {
        studentId,
        progress,
        weakPoints,
        mistakes: studentMistakes,
        activeTask,
        completionRate,
        summary: structuredReport.summary,
        recommendationReasons: hasMistakes ? structuredReport.recommendationReasons : [],
        nextTask,
      };
    },
  };
}
