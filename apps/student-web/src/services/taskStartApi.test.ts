import { describe, expect, it, vi } from "vitest";
import { startTask } from "./taskStartApi";

describe("taskStartApi", () => {
  it("records task start through the API proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ studentId: "student-demo", taskId: "task-linear-kb", status: "started" }),
    });

    const result = await startTask("task-linear-kb", "student-demo", fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tasks/task-linear-kb/start",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: "student-demo" }),
      }),
    );
    expect(result.status).toBe("started");
  });
});
