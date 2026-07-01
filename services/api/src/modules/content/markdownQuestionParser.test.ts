import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseMarkdownQuestion } from "./markdownQuestionParser.js";

describe("parseMarkdownQuestion", () => {
  it("parses the first linear-function sample into pending review", () => {
    const markdown = readFileSync("../../content-samples/linear-function/MATH-FUNC-LINEAR-001.md", "utf8");
    const question = parseMarkdownQuestion(markdown);

    expect(question.id).toBe("MATH-FUNC-LINEAR-001");
    expect(question.answer).toBe("B");
    expect(question.reviewStatus).toBe("pending_review");
    expect(question.ability).toBe("图像");
  });
});
