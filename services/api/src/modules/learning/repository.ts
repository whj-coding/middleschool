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

export type LearningRepository = {
  saveProfile(profile: StudentProfile): void;
  findProfile(studentId: string): StudentProfile | undefined;
  saveMistake(studentId: string, mistake: MistakeRecord): void;
  listMistakes(studentId: string): MistakeRecord[];
};

export function createInMemoryLearningRepository(): LearningRepository {
  const profiles = new Map<string, StudentProfile>();
  const mistakes = new Map<string, MistakeRecord[]>();

  return {
    saveProfile(profile) {
      profiles.set(profile.studentId, profile);
    },
    findProfile(studentId) {
      return profiles.get(studentId);
    },
    saveMistake(studentId, mistake) {
      mistakes.set(studentId, [...(mistakes.get(studentId) ?? []), mistake]);
    },
    listMistakes(studentId) {
      return mistakes.get(studentId) ?? [];
    },
  };
}
