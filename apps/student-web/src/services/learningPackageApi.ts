export type LearningPackageUnit = {
  id: string;
  chunkType: "concept" | "example" | "problem" | "scenario" | "explanation";
  contentMarkdown: string;
  knowledgeTags: string[];
  difficulty: "基础" | "提升" | "冲刺" | null;
  ability: "概念" | "表达式" | "图像" | "应用" | "综合" | null;
  errorTypes: string[];
  reviewStatus: "approved";
};

export type LearningPackage = {
  units: LearningPackageUnit[];
};

export type LearningPackageQuery = {
  knowledgeTag: string;
  difficulty: "基础" | "提升" | "冲刺";
  ability: "概念" | "表达式" | "图像" | "应用" | "综合";
};

export async function fetchLearningPackage(
  query: LearningPackageQuery,
  fetcher: typeof fetch = fetch,
): Promise<LearningPackage> {
  const params = new URLSearchParams(query);
  const response = await fetcher(`/api/student/learning-package?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch learning package");
  return response.json() as Promise<LearningPackage>;
}
