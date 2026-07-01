import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { LinearFunctionGraph } from "./LinearFunctionGraph";

afterEach(() => cleanup());

function expectLineInsideGraph(line: HTMLElement) {
  for (const attribute of ["x1", "x2"]) {
    expect(Number(line.getAttribute(attribute))).toBeGreaterThanOrEqual(20);
    expect(Number(line.getAttribute(attribute))).toBeLessThanOrEqual(180);
  }

  for (const attribute of ["y1", "y2"]) {
    expect(Number(line.getAttribute(attribute))).toBeGreaterThanOrEqual(10);
    expect(Number(line.getAttribute(attribute))).toBeLessThanOrEqual(130);
  }
}

describe("LinearFunctionGraph", () => {
  it("updates formula text when k changes", async () => {
    render(<LinearFunctionGraph />);
    await userEvent.clear(screen.getByLabelText("k"));
    await userEvent.type(screen.getByLabelText("k"), "2");
    expect(screen.getByText("y = 2x - 1")).toBeInTheDocument();
  });

  it("updates formula text when b changes", async () => {
    render(<LinearFunctionGraph />);
    await userEvent.clear(screen.getByLabelText("b"));
    await userEvent.type(screen.getByLabelText("b"), "3");
    expect(screen.getByText("y = 1x + 3")).toBeInTheDocument();
  });

  it("clips steep lines to the visible graph area", async () => {
    render(<LinearFunctionGraph />);
    await userEvent.clear(screen.getByLabelText("k"));
    await userEvent.type(screen.getByLabelText("k"), "5");

    const line = screen.getByTestId("function-line");
    expectLineInsideGraph(line);
  });

  it("clips large intercepts to the visible graph area", async () => {
    render(<LinearFunctionGraph />);
    await userEvent.clear(screen.getByLabelText("b"));
    await userEvent.type(screen.getByLabelText("b"), "8");

    const line = screen.getByTestId("function-line");
    expectLineInsideGraph(line);
  });
});
