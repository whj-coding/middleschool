import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseMarkdownQuestion } from "./markdownQuestionParser.js";

const samplePath = "../../content-samples/linear-function/MATH-FUNC-LINEAR-001.md";

describe("parseMarkdownQuestion", () => {
  it("parses the first linear-function sample into pending review", () => {
    const markdown = readFileSync(samplePath, "utf8");
    const question = parseMarkdownQuestion(markdown);

    expect(question.id).toBe("MATH-FUNC-LINEAR-001");
    expect(question.answer).toBe("B");
    expect(question.reviewStatus).toBe("pending_review");
    expect(question.ability).toBe("图像");
  });

  it.each([
    ["CRLF", (markdown: string) => markdown.replace(/\n/g, "\r\n")],
    ["CR-only", (markdown: string) => markdown.replace(/\n/g, "\r")],
    [
      "mixed",
      (markdown: string) =>
        markdown
          .split("\n")
          .map((line, index, lines) => (index === lines.length - 1 ? line : `${line}${index % 2 === 0 ? "\r\n" : "\r"}`))
          .join(""),
    ],
  ])("parses %s line endings like LF", (_lineEnding, convertLineEndings) => {
    const lfMarkdown = readFileSync(samplePath, "utf8").replace(/\r\n?/g, "\n");
    const expected = parseMarkdownQuestion(lfMarkdown);

    expect(parseMarkdownQuestion(convertLineEndings(lfMarkdown))).toEqual(expected);
  });
});
