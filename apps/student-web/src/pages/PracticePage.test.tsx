import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PracticePage } from "./PracticePage";

describe("PracticePage", () => {
  afterEach(() => {
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

    expect(JSON.parse(interactionCall?.[1]?.body as string).taskId).toBe("task-linear-modeling");
    expect(JSON.parse(practiceCall?.[1]?.body as string).taskId).toBe("task-linear-modeling");
  });
});
