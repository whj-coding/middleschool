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
  return {
    id: readField(markdown, "# 题目ID"),
    subject: "数学",
    module: "函数",
    knowledgePoint: readField(markdown, "知识点"),
    questionType: readField(markdown, "题型") as Question["questionType"],
    difficulty: readField(markdown, "难度") as Question["difficulty"],
    ability: readField(markdown, "能力类型") as Question["ability"],
    answer: readField(markdown, "答案"),
    stem: readSection(markdown, "题干"),
    explanation: readSection(markdown, "解析"),
    reviewStatus: "pending_review",
  };
}
