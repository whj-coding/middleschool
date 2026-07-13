import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MathExpression } from "./MathExpression";

describe("MathExpression", () => {
  it("renders trusted KaTeX output for inline and display formulas", () => {
    const { container, rerender } = render(<MathExpression expression="\\frac{1}{2}x + \\sqrt{3}" displayMode={false} />);
    const inline = container.querySelector(".math-inline");
    expect(inline).not.toBeNull();
    expect(inline?.querySelector(".katex")).not.toBeNull();

    rerender(<MathExpression expression="y = x^2" displayMode />);
    const block = container.querySelector(".math-block");
    expect(block).not.toBeNull();
    expect(block?.querySelector(".katex")).not.toBeNull();
  });

  it.each([
    "\\notacommand{",
    "\\href{javascript:alert(1)}{x}",
    "\\def\\shortcut{x}\\shortcut",
    "x".repeat(2001),
  ])(
    "falls back for invalid, untrusted, or oversized formula %s",
    (expression) => {
      const { container } = render(<MathExpression expression={expression} displayMode={false} />);
      const fallback = container.querySelector(".math-fallback");
      expect(fallback).not.toBeNull();
      expect(fallback).toHaveAttribute("aria-label", `公式 ${expression}`);
      expect(screen.getByText(expression).closest(".math-fallback")).toBe(fallback);
      expect(fallback?.querySelector(".sr-only")).toHaveTextContent("公式暂时无法显示");
    },
  );
});
