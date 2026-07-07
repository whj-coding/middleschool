type ContentQuestion = {
  id: string;
  reviewStatus: "pending_review" | "approved" | "published";
};

export type ContentUnitPackage = {
  units: Array<{ id: string; contentMarkdown: string }>;
};

export type ContentUnitSummary = {
  id: string;
  reviewStatus: "pending_review" | "needs_revision" | "approved" | "rejected";
};

export type ContentUnitList = {
  units: ContentUnitSummary[];
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

export async function fetchContentUnitPackage(fetcher: typeof fetch = fetch): Promise<ContentUnitPackage> {
  const response = await fetcher(
    "/api/admin/data-pipeline/content-units/package?knowledgeTag=k%2Fb%E6%84%8F%E4%B9%89&difficulty=%E5%9F%BA%E7%A1%80&ability=%E6%A6%82%E5%BF%B5",
  );
  if (!response.ok) throw new Error("Failed to fetch content unit package");
  return response.json() as Promise<ContentUnitPackage>;
}

export async function fetchContentUnits(fetcher: typeof fetch = fetch): Promise<ContentUnitList> {
  const response = await fetcher("/api/admin/data-pipeline/content-units");
  if (!response.ok) throw new Error("Failed to fetch content units");
  return response.json() as Promise<ContentUnitList>;
}

export async function approveContentUnit(unitId: string, fetcher: typeof fetch = fetch): Promise<ContentUnitSummary> {
  const response = await fetcher(`/api/admin/data-pipeline/content-units/${unitId}/approve`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to approve content unit");
  return response.json() as Promise<ContentUnitSummary>;
}
