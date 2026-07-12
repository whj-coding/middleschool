export type LatestReport = {
  studentId: string;
  progress: string;
  weakPoints: string[];
  mistakes: Array<{
    questionId: string;
    reason: string;
    evidence: string;
  }>;
  activeTask: {
    studentId: string;
    taskId: string;
    status: "started" | "completed";
  } | null;
  completionRate?: number;
  summary: string;
  recommendationReasons: string[];
  nextTask: {
    id: string;
    title: string;
  };
};

export async function fetchLatestReport(studentId: string, fetcher: typeof fetch = fetch): Promise<LatestReport> {
  const params = new URLSearchParams({ studentId });
  const response = await fetcher(`/api/reports/latest?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch latest report");
  return response.json() as Promise<LatestReport>;
}
