import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ControlledContentRenderer } from "./ControlledContentRenderer";

describe("ControlledContentRenderer", () => {
  it("renders approved markdown, formulas, and safe figure references", () => {
    render(
      <ControlledContentRenderer
        markdown={[
          "## 打印费建模",
          "先看 **固定费用**，再看 `$k$`。",
          "",
          "- 固定费用对应 $b$",
          "- 每页费用对应 $k$",
          "",
          "$$",
          "y = 0.4x + 3",
          "$$",
          "",
          "![一次函数图像](images/linear-printing-fee.png)",
        ].join("\n")}
      />,
    );

    expect(screen.getByRole("heading", { name: "打印费建模" })).toBeInTheDocument();
    expect(screen.getByText("固定费用")).toBeInTheDocument();
    expect(screen.getByLabelText("公式 k")).toBeInTheDocument();
    expect(screen.getByLabelText("公式 b")).toBeInTheDocument();
    expect(screen.getByLabelText("公式 y = 0.4x + 3")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "一次函数图像" })).toHaveAttribute("src", "images/linear-printing-fee.png");
  });

  it("treats html as text and ignores unsafe figure urls", () => {
    const { container } = render(
      <ControlledContentRenderer
        markdown={[
          "这段 <script>window.bad = true</script> 只能当文本。",
          "![外链图](https://example.com/unsafe.png)",
          "![协议相对外链](//example.com/unsafe.png)",
          "![脚本图](javascript:alert(1))",
        ].join("\n")}
      />,
    );

    expect(screen.getByText(/<script>window.bad = true<\/script>/)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "外链图" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "协议相对外链" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "脚本图" })).not.toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });
});
