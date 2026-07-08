import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodayTaskPage } from "./TodayTaskPage";

describe("TodayTaskPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("records task start with the task returned by the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.startsWith("/api/tasks/today")) {
          return Promise.resolve({
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
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({ studentId: "student-demo", taskId: "task-linear-kb", status: "started" }),
        });
      }),
    );
    const onStart = vi.fn();

    render(<TodayTaskPage onStart={onStart} />);

    await userEvent.click(await screen.findByRole("button", { name: "开始今日任务" }));

    expect(screen.getByText("预计时间：20 分钟")).toBeInTheDocument();
    expect(screen.getByText(/完成标准：能说清 k 表示单位变化量/)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/tasks/today?studentId=student-demo");
    expect(fetch).toHaveBeenCalledWith(
      "/api/tasks/task-linear-kb/start",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ studentId: "student-demo" }),
      }),
    );
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "task-linear-kb",
        learningPackageQuery: expect.objectContaining({ knowledgeTag: "k/b意义" }),
      }),
    );
  });
});
