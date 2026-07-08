import { describe, expect, it, vi } from "vitest";
import { fetchTodayTask } from "./todayTaskApi";

describe("todayTaskApi", () => {
  it("fetches today task with learning package query", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "task-linear-kb",
        title: "理解 k 和 b 的意义",
        reason: "诊断显示你对斜率和截距的图像意义不够稳定。",
        taskContent: "完成 1 个图像探索、1 道即时练习和 1 次错因复盘。",
        estimatedMinutes: 20,
        durationOptions: [10, 20, 40],
        completion: "完成 1 个图像探索、1 道即时练习和 1 次错因复盘。",
        completionStandard: "能说清 k 表示单位变化量、b 表示初始量，并能把生活场景写成 y = kx + b。",
        learningPackageQuery: {
          knowledgeTag: "k/b意义",
          difficulty: "基础",
          ability: "概念",
        },
      }),
    });

    const task = await fetchTodayTask("student-demo", fetchMock);

    expect(fetchMock).toHaveBeenCalledWith("/api/tasks/today?studentId=student-demo");
    expect(task.learningPackageQuery.knowledgeTag).toBe("k/b意义");
    expect(task.completionStandard).toContain("单位变化量");
  });
});
