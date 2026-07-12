import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PracticePage } from "./PracticePage";

describe("PracticePage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("records practice submissions against the current task", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PracticePage taskId="task-linear-modeling" onSubmit={() => undefined} />);

    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));

    const interactionCall = fetchMock.mock.calls.find(([url]) => url === "/api/student/interactions");
    const practiceCall = fetchMock.mock.calls.find(([url]) => url === "/api/practice/practice-1/answers");
    const interactionPayload = JSON.parse(interactionCall?.[1]?.body as string);

    expect(interactionPayload.taskId).toBe("task-linear-modeling");
    expect(interactionPayload.studentAnswer).toContain("最终答案：y = 3x + 0.4");
    expect(interactionPayload.studentAnswer).toContain("我的步骤：我把每页费用写成了固定部分，可能没有分清 x 表示页数。");
    expect(interactionPayload.studentAnswer).not.toContain("语音转写：");
    expect(JSON.parse(practiceCall?.[1]?.body as string).taskId).toBe("task-linear-modeling");
  });

  it("transcribes and edits voice thought before submitting evidence", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/voice/stt") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            transcript: "语音识别：3 元固定，0.4 元随页数变化。",
            confidence: 0.91,
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PracticePage taskId="task-linear-modeling" onSubmit={() => undefined} />);

    await userEvent.click(screen.getByRole("button", { name: "重新录入" }));
    const transcriptBox = await screen.findByLabelText("语音转写");
    expect(transcriptBox).toHaveValue("语音识别：3 元固定，0.4 元随页数变化。");

    await userEvent.clear(transcriptBox);
    await userEvent.type(transcriptBox, "我确认 3 元是 b，0.4 是 k。");
    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));

    const interactionCall = fetchMock.mock.calls.find(([url]) => url === "/api/student/interactions");
    const interactionPayload = JSON.parse(interactionCall?.[1]?.body as string);
    expect(interactionPayload.studentAnswer).toContain("语音转写：我确认 3 元是 b，0.4 是 k。");
  });

  it("keeps the practice flow usable when voice transcription fails", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/voice/stt") {
        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const onSubmit = vi.fn();

    render(<PracticePage taskId="task-linear-modeling" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: "重新录入" }));
    expect(await screen.findByText("语音转写暂不可用，可继续手动输入思路。")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(onSubmit).toHaveBeenCalledOnce();

    const interactionCall = fetchMock.mock.calls.find(([url]) => url === "/api/student/interactions");
    const interactionPayload = JSON.parse(interactionCall?.[1]?.body as string);
    expect(interactionPayload.studentAnswer).not.toContain("语音转写：");
  });

  it("records the real grading result and transitions only after grading succeeds", async () => {
    let resolveGrading!: (value: unknown) => void;
    const grading = new Promise((resolve) => { resolveGrading = resolve; });
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/practice/practice-1/answers") return grading;
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    vi.stubGlobal("fetch", fetchMock);
    const onSubmit = vi.fn();
    render(<PracticePage taskId="task-linear-modeling" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/student/interactions")).toBe(false);

    resolveGrading({
      ok: true,
      json: async () => ({
        correct: true,
        answer: "y = 3x + 0.4",
        activeTask: { studentId: "student-demo", taskId: "task-linear-modeling", status: "completed" },
      }),
    });

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ correct: true })));
    const interactionCall = fetchMock.mock.calls.find(([url]) => url === "/api/student/interactions");
    expect(JSON.parse(interactionCall?.[1]?.body as string).correct).toBe(true);
  });

  it("preserves the answer and stays on the page when grading fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    const onSubmit = vi.fn();
    render(<PracticePage taskId="task-linear-modeling" onSubmit={onSubmit} />);
    const answerInput = screen.getByLabelText("最终答案");
    await userEvent.clear(answerInput);
    await userEvent.type(answerInput, "my attempt");

    await userEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(await screen.findByText("提交失败，请重试。你的答案已保留。")).toBeInTheDocument();
    expect(answerInput).toHaveValue("my attempt");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
