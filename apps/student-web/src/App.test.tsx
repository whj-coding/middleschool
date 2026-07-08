import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App learning flow", () => {
  it("walks through goal, diagnostic, task, practice, mistake review, and report", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
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
      if (url.startsWith("/api/tasks/task-linear-kb/start")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ studentId: "student-demo", taskId: "task-linear-kb", status: "started" }),
        });
      }
      if (url.startsWith("/api/tasks/task-linear-modeling/start")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ studentId: "student-demo", taskId: "task-linear-modeling", status: "started" }),
        });
      }
      if (url.startsWith("/api/student/learning-package")) {
        return Promise.resolve({ ok: true, json: async () => ({ units: [] }) });
      }
      if (url.startsWith("/api/student/interactions")) {
        return Promise.resolve({ ok: true, json: async () => ({ id: "interaction-test", studentId: "student-demo" }) });
      }
      if (url.startsWith("/api/practice/practice-1/answers")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            correct: false,
            mistake: {
              questionId: "practice-printing-fee",
              reason: "审题与建模错误",
              evidence: "学生答案 y = 3x + 0.4 混淆了固定费用和单位变化费用。",
            },
            activeTask: { studentId: "student-demo", taskId: "task-linear-kb", status: "completed" },
          }),
        });
      }
      if (url.startsWith("/api/student/retry-list")) {
        return Promise.resolve({
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
      }
      if (url.startsWith("/api/reports/latest")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            studentId: "student-demo",
            progress: "能说出 k 影响直线方向，但建模时还需要先分清固定量。",
            weakPoints: ["应用建模"],
            mistakes: [
              {
                questionId: "practice-printing-fee",
                reason: "审题与建模错误",
                evidence: "学生答案 y = 3x + 0.4 混淆了固定费用和单位变化费用。",
              },
            ],
            activeTask: { studentId: "student-demo", taskId: "task-linear-kb", status: "completed" },
            summary: "本次正确率 50%。下一步重点放在「从打印费理解固定费用和变化费用」。",
            recommendationReasons: ["应用建模 · 需加强", "审题与建模错误 · 优先复盘"],
            nextTask: { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" },
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "选择 110+ 并开始诊断" }));
    await userEvent.click(screen.getByRole("button", { name: "完成诊断" }));
    await userEvent.click(screen.getByRole("button", { name: "开始今日任务" }));

    expect(screen.getByText("理解 k 和 b 的意义")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "进入练习" }));
    expect(screen.getByText("将记录：submit_answer")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(screen.getByText("审题与建模错误")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "生成学情报告" }));

    expect(screen.getByText("下一步任务")).toBeInTheDocument();
    expect(await screen.findByText("错题复练候选")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "开始推荐练习" }));
    expect(screen.getByText("从打印费理解固定费用和变化费用")).toBeInTheDocument();
    expect(screen.getByText(/固定费用和变化费用/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "进入练习" }));
    expect(screen.getByText("打印费建模")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));
    await userEvent.click(screen.getByRole("button", { name: "生成学情报告" }));
    await userEvent.click(screen.getByRole("button", { name: "开始复练" }));
    expect(screen.getByText("打印费建模")).toBeInTheDocument();

    const interactionBodies = fetchMock.mock.calls
      .filter(([url]) => url === "/api/student/interactions")
      .map(([, init]) => JSON.parse((init as RequestInit).body as string));
    expect(interactionBodies[0].taskId).toBe("task-linear-kb");
    expect(interactionBodies[1].taskId).toBe("task-linear-modeling");
  });
});
