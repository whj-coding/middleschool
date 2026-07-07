import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionReviewPage } from "./QuestionReviewPage";
import { approveContentUnit, fetchContentUnits } from "../services/contentApi";

vi.mock("../services/contentApi", () => ({
  approveContentUnit: vi.fn(),
  approveQuestion: vi.fn().mockResolvedValue({ id: "MATH-FUNC-LINEAR-001", reviewStatus: "approved" }),
  fetchContentUnits: vi.fn(),
}));

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
});
