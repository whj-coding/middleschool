import { describe, expect, it, vi } from "vitest";
import { fetchLatestReport } from "./reportApi";

describe("reportApi", () => {
  it("fetches the latest learning report", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        studentId: "student-demo",
        progress: "能说出 k 影响直线方向。",
        weakPoints: ["应用建模"],
        mistakes: [{ questionId: "practice-printing-fee", reason: "审题与建模错误", evidence: "混淆固定费用。" }],
        activeTask: { studentId: "student-demo", taskId: "task-linear-kb", status: "completed" },
        summary: "本次正确率 50%。下一步重点放在「从打印费理解固定费用和变化费用」。",
        recommendationReasons: ["应用建模 · 需加强", "审题与建模错误 · 优先复盘"],
        nextTask: { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" },
      }),
    });

    const report = await fetchLatestReport("student-demo", fetchMock);

    expect(fetchMock).toHaveBeenCalledWith("/api/reports/latest?studentId=student-demo");
    expect(report.activeTask?.status).toBe("completed");
    expect(report.recommendationReasons).toContain("应用建模 · 需加强");
    expect(report.nextTask.title).toContain("打印费");
  });
});
