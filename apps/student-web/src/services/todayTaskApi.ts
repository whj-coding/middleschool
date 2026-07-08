import type { LearningPackageQuery } from "./learningPackageApi";

export type TodayTask = {
  id: string;
  title: string;
  reason: string;
  taskContent: string;
  estimatedMinutes: number;
  durationOptions: number[];
  completion: string;
  completionStandard: string;
  learningPackageQuery: LearningPackageQuery;
};

export async function fetchTodayTask(studentId: string, fetcher: typeof fetch = fetch): Promise<TodayTask> {
  const params = new URLSearchParams({ studentId });
  const response = await fetcher(`/api/tasks/today?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch today task");
  return response.json() as Promise<TodayTask>;
}
