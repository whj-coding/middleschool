import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionReviewPage } from "./QuestionReviewPage";
import { approveContentUnit, fetchContentUnits, rejectQuestion, requestQuestionChanges } from "../services/contentApi";

vi.mock("../services/contentApi", () => ({
  approveContentUnit: vi.fn(),
  approveQuestion: vi.fn().mockResolvedValue({ id: "MATH-FUNC-LINEAR-001", reviewStatus: "approved" }),
  fetchContentUnits: vi.fn(),
  rejectQuestion: vi.fn(),
  requestQuestionChanges: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("QuestionReviewPage", () => {
  it("loads and approves content unit candidates", async () => {
    vi.mocked(fetchContentUnits).mockResolvedValue({
      units: [{ id: "unit-linear-scenario", reviewStatus: "pending_review" }],
    });
    vi.mocked(approveContentUnit).mockResolvedValue({
      id: "unit-linear-scenario",
      reviewStatus: "approved",
    });

    render(<QuestionReviewPage onNext={vi.fn()} />);

    expect(await screen.findByText("unit-linear-scenario")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "审核内容单元 unit-linear-scenario" }));

    await waitFor(() => expect(approveContentUnit).toHaveBeenCalledWith("unit-linear-scenario"));
    expect(screen.getByText("内容单元同步：approved")).toBeInTheDocument();
  });

  it("requires a reason and requests question changes without advancing", async () => {
    vi.mocked(fetchContentUnits).mockResolvedValue({ units: [] });
    vi.mocked(requestQuestionChanges).mockResolvedValue({ id: "MATH-FUNC-LINEAR-001", reviewStatus: "needs_revision" });
    const onNext = vi.fn();
    render(<QuestionReviewPage onNext={onNext} />);

    const revision = screen.getByRole("button", { name: "需修改" });
    const rejection = screen.getByRole("button", { name: "驳回" });
    expect(revision).toBeDisabled();
    expect(rejection).toBeDisabled();

    await userEvent.type(screen.getByLabelText("审核原因"), "解析缺少关键步骤");
    await userEvent.click(revision);

    await waitFor(() => expect(requestQuestionChanges).toHaveBeenCalledWith("MATH-FUNC-LINEAR-001", "解析缺少关键步骤"));
    expect(screen.getByText("API 同步：needs_revision")).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("shows rejection failure and does not advance", async () => {
    vi.mocked(fetchContentUnits).mockResolvedValue({ units: [] });
    vi.mocked(rejectQuestion).mockRejectedValue(new Error("network"));
    const onNext = vi.fn();
    render(<QuestionReviewPage onNext={onNext} />);

    await userEvent.type(screen.getByLabelText("审核原因"), "题目条件错误");
    await userEvent.click(screen.getByRole("button", { name: "驳回" }));

    expect(await screen.findByText("题目审核失败，请重试")).toBeInTheDocument();
    expect(screen.queryByText(/API 同步：rejected/)).not.toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });
});
