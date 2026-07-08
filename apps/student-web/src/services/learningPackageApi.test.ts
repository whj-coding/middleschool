import { describe, expect, it, vi } from "vitest";
import { fetchLearningPackage } from "./learningPackageApi";

describe("learningPackageApi", () => {
  it("fetches approved student learning package through the API proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        units: [
          {
            id: "unit-linear-kb-concept",
            chunkType: "concept",
            contentMarkdown: "k 表示单位变化量，b 表示初始量。",
            knowledgeTags: ["一次函数", "k/b意义"],
            difficulty: "基础",
            ability: "概念",
            errorTypes: ["概念理解错误"],
            reviewStatus: "approved",
          },
        ],
      }),
    });

    const result = await fetchLearningPackage(
      {
        knowledgeTag: "k/b意义",
        difficulty: "基础",
        ability: "概念",
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/student/learning-package?knowledgeTag=k%2Fb%E6%84%8F%E4%B9%89&difficulty=%E5%9F%BA%E7%A1%80&ability=%E6%A6%82%E5%BF%B5",
    );
    expect(result.units[0].reviewStatus).toBe("approved");
  });
});
