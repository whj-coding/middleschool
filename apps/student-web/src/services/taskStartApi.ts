export type StartedTask = {
  studentId: string;
  taskId: string;
  status: "started";
};

export async function startTask(taskId: string, studentId = "student-demo", fetcher: typeof fetch = fetch): Promise<StartedTask> {
  const response = await fetcher(`/api/tasks/${taskId}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  });
  if (!response.ok) throw new Error("Failed to start task");
  return response.json() as Promise<StartedTask>;
}
