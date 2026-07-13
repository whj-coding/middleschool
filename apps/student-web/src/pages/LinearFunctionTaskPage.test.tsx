import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LinearFunctionTaskPage } from "./LinearFunctionTaskPage";

describe("LinearFunctionTaskPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows approved learning package material from the student API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          units: [
            {
              id: "unit-linear-kb-concept",
              chunkType: "concept",
              contentMarkdown: [
                "## k 和 b 怎么看",
                "k 表示单位变化量，b 表示初始量。",
                "$$y = kx + b$$",
                "![一次函数图像](/images/content/linear-kb-concept.png)",
              ].join("\n"),
              knowledgeTags: ["一次函数", "k/b意义"],
              difficulty: "基础",
              ability: "概念",
              errorTypes: ["概念理解错误"],
              reviewStatus: "approved",
            },
          ],
        }),
      }),
    );

    render(<LinearFunctionTaskPage onPractice={() => undefined} />);

    expect(await screen.findByText("已审核学习材料")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "k 和 b 怎么看" })).toBeInTheDocument();
    expect(screen.getByLabelText("公式 y = kx + b").querySelector(".katex")).not.toBeNull();
    expect(screen.getByRole("img", { name: "一次函数图像" })).toHaveAttribute(
      "src",
      "/images/content/linear-kb-concept.png",
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/student/learning-package?knowledgeTag=k%2Fb%E6%84%8F%E4%B9%89&difficulty=%E5%9F%BA%E7%A1%80&ability=%E6%A6%82%E5%BF%B5",
    );
  });
});
