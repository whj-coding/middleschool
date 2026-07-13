import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentFigure } from "./ContentFigure";
import { isSafeContentFigureSrc } from "./contentFigurePolicy";

describe("isSafeContentFigureSrc", () => {
  it("accepts only fixed-root raster content figures", () => {
    expect(isSafeContentFigureSrc("/images/content/linear-kb-concept.png")).toBe(true);
    expect(isSafeContentFigureSrc("/images/content/LINEAR_1.WEBP")).toBe(true);
  });

  it.each([
    "images/content/a.png",
    "/other/a.png",
    "/images/content/nested/a.png",
    "/images/content/../a.png",
    "/images/content/a%2epng",
    "/images/content/a.png?v=1",
    "/images/content/a.png#x",
    "/images/content/a.svg",
    "//example.com/a.png",
    "https://example.com/a.png",
    "/images/content/a\\b.png",
  ])("rejects %s", (src) => {
    expect(isSafeContentFigureSrc(src)).toBe(false);
  });
});

describe("ContentFigure", () => {
  it("replaces a failed image with an accessible placeholder", () => {
    render(<ContentFigure alt="一次函数图像" src="/images/content/linear-kb-concept.png" />);

    fireEvent.error(screen.getByRole("img", { name: "一次函数图像" }));

    expect(screen.queryByRole("img", { name: "一次函数图像" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("一次函数图像暂时无法显示");
  });
});
