type PracticeMistake = {
  questionId: string;
  reason: string;
  evidence: string;
};

type CompletedPracticeTask = {
  studentId: string;
  taskId: string;
  status: "completed";
};

type PracticeSubmissionBase = {
  answer: string;
  activeTask: CompletedPracticeTask | null;
};

export type PracticeSubmissionResult =
  | (PracticeSubmissionBase & { correct: true; mistake?: never })
  | (PracticeSubmissionBase & { correct: false; mistake: PracticeMistake });

function isMistake(value: unknown): value is PracticeMistake {
  if (!value || typeof value !== "object") return false;
  const mistake = value as Record<string, unknown>;
  return (
    typeof mistake.questionId === "string" &&
    typeof mistake.reason === "string" &&
    typeof mistake.evidence === "string"
  );
}

function parsePracticeSubmissionResult(value: unknown): PracticeSubmissionResult {
  if (!value || typeof value !== "object") throw new Error("Invalid practice submission result");
  const result = value as Record<string, unknown>;
  if (typeof result.answer !== "string") throw new Error("Invalid practice submission result");

  if (result.correct === true && !("mistake" in result)) return result as PracticeSubmissionResult;
  if (result.correct === false && isMistake(result.mistake)) return result as PracticeSubmissionResult;
  throw new Error("Invalid practice submission result");
}

export async function submitPracticeAnswer(
  input: { sessionId: string; studentId: string; taskId: string; questionId: string; answer: string },
  fetcher: typeof fetch = fetch,
): Promise<PracticeSubmissionResult> {
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
  return parsePracticeSubmissionResult(await response.json());
}
