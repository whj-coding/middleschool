import { describe, expect, it, vi } from "vitest";
import { fetchRetryList } from "./retryListApi";

describe("retryListApi", () => {
  it("fetches retry practice items through the API proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            questionId: "practice-printing-fee",
            taskId: "task-linear-kb",
            studentAnswer: "y = 3x + 0.4",
            hintLevel: 1,
            createdAt: "2026-07-07T00:00:00.000Z",
          },
        ],
      }),
    });

    const result = await fetchRetryList("student-demo", fetchMock);

    expect(fetchMock).toHaveBeenCalledWith("/api/student/retry-list?studentId=student-demo");
    expect(result.items[0].questionId).toBe("practice-printing-fee");
  });
});
