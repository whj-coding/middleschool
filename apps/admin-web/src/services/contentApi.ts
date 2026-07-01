type ContentQuestion = {
  id: string;
  reviewStatus: "pending_review" | "approved" | "published";
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`Content API failed with ${response.status}`);
  return response.json() as Promise<T>;
}

export async function importMarkdownQuestion(markdown: string) {
  const response = await fetch("/api/admin/content/import/markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown }),
  });
  return readJson<ContentQuestion>(response);
}

export async function approveQuestion(questionId: string) {
  const response = await fetch(`/api/admin/questions/${questionId}/approve`, {
    method: "POST",
  });
  return readJson<ContentQuestion>(response);
}

export async function publishQuestion(questionId: string) {
  const response = await fetch(`/api/admin/questions/${questionId}/publish`, {
    method: "POST",
  });
  return readJson<ContentQuestion>(response);
}
