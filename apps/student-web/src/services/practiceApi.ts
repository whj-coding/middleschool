export type PracticeSubmission = {
  correct: boolean;
  mistake: {
    questionId: string;
    reason: string;
    evidence: string;
  };
  activeTask: {
    studentId: string;
    taskId: string;
    status: "completed";
  } | null;
};

export async function submitPracticeAnswer(
  input: { sessionId: string; studentId: string; taskId: string; questionId: string; answer: string },
  fetcher: typeof fetch = fetch,
): Promise<PracticeSubmission> {
  const response = await fetcher(`/api/practice/${input.sessionId}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId: input.studentId,
      taskId: input.taskId,
      questionId: input.questionId,
      answer: input.answer,
    }),
  });
  if (!response.ok) throw new Error("Failed to submit practice answer");
  return response.json() as Promise<PracticeSubmission>;
}
