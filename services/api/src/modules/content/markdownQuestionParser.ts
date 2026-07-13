import type { Question } from "./types.js";

function readField(markdown: string, label: string) {
  const match = markdown.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  if (!match) throw new Error(`Missing field: ${label}`);
  return match[1].trim();
}

function readSection(markdown: string, heading: string) {
  const match = markdown.match(new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`));
  if (!match) throw new Error(`Missing section: ${heading}`);
  return match[1].trim();
}

export function parseMarkdownQuestion(markdown: string): Question {
  const normalizedMarkdown = markdown.replace(/\r\n?/g, "\n");

  return {
    id: readField(normalizedMarkdown, "# 题目ID"),
    subject: "数学",
    module: "函数",
    knowledgePoint: readField(normalizedMarkdown, "知识点"),
    questionType: readField(normalizedMarkdown, "题型") as Question["questionType"],
    difficulty: readField(normalizedMarkdown, "难度") as Question["difficulty"],
    ability: readField(normalizedMarkdown, "能力类型") as Question["ability"],
    answer: readField(normalizedMarkdown, "答案"),
    stem: readSection(normalizedMarkdown, "题干"),
    explanation: readSection(normalizedMarkdown, "解析"),
    reviewStatus: "pending_review",
  };
}
