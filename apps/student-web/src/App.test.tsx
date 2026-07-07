import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App learning flow", () => {
  it("walks through goal, diagnostic, task, practice, mistake review, and report", async () => {
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
  });
});
