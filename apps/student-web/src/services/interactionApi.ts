export type InteractionAction =
  | "view_content"
  | "submit_answer"
  | "request_hint"
  | "view_explanation"
  | "view_full_answer"
  | "voice_input"
  | "rate_ai_response";

export type InteractionPayload = {
  studentId: string;
  taskId?: string;
  questionId?: string;
  action: InteractionAction;
  studentAnswer?: string;
  hintLevel?: number;
  correct?: boolean | null;
};

export type InteractionLog = {
  id: string;
  studentId: string;
};

export async function recordInteraction(
  payload: InteractionPayload,
  fetcher: typeof fetch = fetch,
): Promise<InteractionLog> {
  const response = await fetcher("/api/student/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to record interaction");
  return response.json() as Promise<InteractionLog>;
}
