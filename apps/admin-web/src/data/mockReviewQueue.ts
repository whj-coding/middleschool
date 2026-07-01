export const reviewQueue = {
  importJob: { id: "import-001", sourceType: "Markdown", status: "pending_review" },
  question: {
    id: "MATH-FUNC-LINEAR-001",
    stem: "直线经过点 A(0, 2) 和 B(4, 0)，则该直线的解析式是？",
    answer: "B",
    explanation: "斜率 k = -0.5，截距 b = 2。",
    tags: ["一次函数图像", "图像", "基础"],
    reviewStatus: "pending_review",
  },
  figure: {
    figureType: "coordinate_line_graph",
    confidence: 0.86,
    elements: ["A(0, 2)", "B(4, 0)", "x 截距 4", "y 截距 2"],
    reviewStatus: "pending_review",
  },
};

export const sampleMarkdownQuestion = `# 题目ID: MATH-FUNC-LINEAR-001
学科: 数学
模块: 函数
知识点: 一次函数图像
题型: 选择题
难度: 基础
能力类型: 图像
答案: B
审核状态: 待审核

## 题干
直线经过点 A(0, 2) 和 B(4, 0)，则该直线的解析式是？

## 选项
A. y = 2x + 4
B. y = -0.5x + 2
C. y = 0.5x + 2
D. y = -2x + 4

## 解析
斜率 k = (0 - 2) / (4 - 0) = -0.5，且与 y 轴交于 2，所以解析式是 y = -0.5x + 2。`;
