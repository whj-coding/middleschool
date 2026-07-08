import type { GoalScore } from "./service.js";

export type StudentProfile = {
  studentId: string;
  goalScore: GoalScore;
};

export type MistakeRecord = {
  questionId: string;
  reason: string;
  evidence: string;
};

export type LearningTaskRecord = {
  taskId: string;
  studentId: string;
  status: "started" | "completed";
};

export type LearningRepository = {
  saveProfile(profile: StudentProfile): void;
  findProfile(studentId: string): StudentProfile | undefined;
  saveTask(task: LearningTaskRecord): void;
  findTask(studentId: string, taskId: string): LearningTaskRecord | undefined;
  listTasks(studentId: string): LearningTaskRecord[];
  saveMistake(studentId: string, mistake: MistakeRecord): void;
  listMistakes(studentId: string): MistakeRecord[];
};

export function createInMemoryLearningRepository(): LearningRepository {
  const profiles = new Map<string, StudentProfile>();
  const tasks = new Map<string, LearningTaskRecord>();
  const mistakes = new Map<string, MistakeRecord[]>();

  return {
    saveProfile(profile) {
      profiles.set(profile.studentId, profile);
    },
    findProfile(studentId) {
      return profiles.get(studentId);
    },
    saveTask(task) {
      const key = `${task.studentId}:${task.taskId}`;
      tasks.delete(key);
      tasks.set(key, task);
    },
    findTask(studentId, taskId) {
      return tasks.get(`${studentId}:${taskId}`);
    },
    listTasks(studentId) {
      return [...tasks.values()].filter((task) => task.studentId === studentId);
    },
    saveMistake(studentId, mistake) {
      mistakes.set(studentId, [...(mistakes.get(studentId) ?? []), mistake]);
    },
    listMistakes(studentId) {
      return mistakes.get(studentId) ?? [];
    },
  };
}
