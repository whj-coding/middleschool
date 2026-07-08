export type RetryPracticeItem = {
  questionId: string;
  taskId: string | null;
  studentAnswer: string | null;
  hintLevel: number;
  createdAt: string;
};

export type RetryList = {
  items: RetryPracticeItem[];
};

export async function fetchRetryList(studentId: string, fetcher: typeof fetch = fetch): Promise<RetryList> {
  const params = new URLSearchParams({ studentId });
  const response = await fetcher(`/api/student/retry-list?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch retry list");
  return response.json() as Promise<RetryList>;
}
