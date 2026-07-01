import { afterEach, describe, expect, it, vi } from "vitest";
import { approveQuestion, importMarkdownQuestion, publishQuestion } from "./contentApi";

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
});
