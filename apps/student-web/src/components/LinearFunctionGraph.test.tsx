import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LinearFunctionGraph } from "./LinearFunctionGraph";

describe("LinearFunctionGraph", () => {
  it("updates formula text when k changes", async () => {
    render(<LinearFunctionGraph />);
    await userEvent.clear(screen.getByLabelText("k"));
    await userEvent.type(screen.getByLabelText("k"), "2");
    expect(screen.getByText("y = 2x - 1")).toBeInTheDocument();
  });
});
