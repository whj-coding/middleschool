import { afterEach, describe, expect, it, vi } from "vitest";
import {
  approveContentUnit,
  approveQuestion,
  fetchContentUnitPackage,
  fetchContentUnits,
  importMarkdownQuestion,
  publishQuestion,
} from "./contentApi";

describe("contentApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("imports markdown through the content API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "MATH-FUNC-LINEAR-001", reviewStatus: "pending_review" }), { status: 200 }),
    );

    const question = await importMarkdownQuestion("# 题目ID: MATH-FUNC-LINEAR-001");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/content/import/markdown",
      expect.objectContaining({ method: "POST" }),
    );
    expect(question.reviewStatus).toBe("pending_review");
  });

  it("approves and publishes questions through the content API", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "MATH-FUNC-LINEAR-001", reviewStatus: "approved" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "MATH-FUNC-LINEAR-001", reviewStatus: "published" }), { status: 200 }));

    const approved = await approveQuestion("MATH-FUNC-LINEAR-001");
    const published = await publishQuestion("MATH-FUNC-LINEAR-001");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/questions/MATH-FUNC-LINEAR-001/approve", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/questions/MATH-FUNC-LINEAR-001/publish", expect.objectContaining({ method: "POST" }));
    expect(approved.reviewStatus).toBe("approved");
    expect(published.reviewStatus).toBe("published");
  });

  it("fetches content unit package candidates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ units: [{ id: "unit-linear-kb-concept", contentMarkdown: "k 表示单位变化量" }] }),
    });

    const result = await fetchContentUnitPackage(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/data-pipeline/content-units/package?knowledgeTag=k%2Fb%E6%84%8F%E4%B9%89&difficulty=%E5%9F%BA%E7%A1%80&ability=%E6%A6%82%E5%BF%B5");
    expect(result.units[0].id).toBe("unit-linear-kb-concept");
  });

  it("lists and approves content units", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ units: [{ id: "unit-linear-scenario", reviewStatus: "pending_review" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "unit-linear-scenario", reviewStatus: "approved" }),
      });

    const units = await fetchContentUnits(fetchMock);
    const approved = await approveContentUnit("unit-linear-scenario", fetchMock);

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/data-pipeline/content-units");
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/data-pipeline/content-units/unit-linear-scenario/approve", expect.objectContaining({ method: "POST" }));
    expect(units.units[0].reviewStatus).toBe("pending_review");
    expect(approved.reviewStatus).toBe("approved");
  });
});
