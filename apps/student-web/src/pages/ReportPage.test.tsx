import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportPage } from "./ReportPage";

describe("ReportPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows latest report data and retry practice candidates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
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
                  evidence: "混淆固定费用。",
                },
              ],
              activeTask: { studentId: "student-demo", taskId: "task-linear-kb", status: "completed" },
              summary: "本次正确率 50%。下一步重点放在「从打印费理解固定费用和变化费用」。",
              recommendationReasons: ["应用建模 · 需加强", "审题与建模错误 · 优先复盘"],
              nextTask: { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" },
            }),
          });
        }

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
      }),
    );

    const onRetryPractice = vi.fn();
    const onStartNextTask = vi.fn();

    render(<ReportPage onRetryPractice={onRetryPractice} onStartNextTask={onStartNextTask} />);

    expect(await screen.findByText(/任务状态：已完成/)).toBeInTheDocument();
    expect(screen.getByText(/本次正确率 50%/)).toBeInTheDocument();
    expect(screen.getByText("审题与建模错误 · 优先复盘")).toBeInTheDocument();
    expect(screen.getByText("从打印费理解固定费用和变化费用")).toBeInTheDocument();
    expect(await screen.findByText("错题复练候选")).toBeInTheDocument();
    expect(screen.getByText("practice-printing-fee")).toBeInTheDocument();
    expect(screen.getByText("上次答案：y = 3x + 0.4")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "开始复练" }));

    expect(onRetryPractice).toHaveBeenCalledWith("practice-printing-fee", "task-linear-kb");

    await userEvent.click(screen.getByRole("button", { name: "开始推荐练习" }));

    expect(onStartNextTask).toHaveBeenCalledWith({
      id: "task-linear-modeling",
      title: "从打印费理解固定费用和变化费用",
    });
  });

  it("does not show an in-progress task state when the latest report is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.startsWith("/api/reports/latest")) {
          return Promise.resolve({ ok: false, json: async () => ({ error: "report_not_ready" }) });
        }

        return Promise.resolve({ ok: true, json: async () => ({ items: [] }) });
      }),
    );

    render(<ReportPage />);

    expect((await screen.findAllByText(/任务状态：暂无任务状态/)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/任务状态：进行中/)).not.toBeInTheDocument();
  });

  it("does not show an in-progress task state when the latest report has no active task", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.startsWith("/api/reports/latest")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              studentId: "student-demo",
              progress: "能说出 k 影响直线方向，但建模时还需要先分清固定量。",
              weakPoints: ["应用建模"],
              mistakes: [],
              activeTask: null,
              summary: "继续巩固应用建模。",
              recommendationReasons: ["应用建模 · 需加强"],
              nextTask: { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" },
            }),
          });
        }

        return Promise.resolve({ ok: true, json: async () => ({ items: [] }) });
      }),
    );

    render(<ReportPage />);

    expect((await screen.findAllByText(/任务状态：暂无任务状态/)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/任务状态：进行中/)).not.toBeInTheDocument();
  });
});
