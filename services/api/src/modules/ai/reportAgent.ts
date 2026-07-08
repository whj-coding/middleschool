export function generateReportSummary(input: {
  correctRate: number;
  weakPoints: string[];
  mistakeReason: string;
  nextTaskTitle: string;
}) {
  return `本次正确率 ${Math.round(input.correctRate * 100)}%。进步点是能开始识别变量关系。当前薄弱点是 ${input.weakPoints.join("、")}，主要错因是 ${input.mistakeReason}。下一步建议完成「${input.nextTaskTitle}」。`;
}

export function generateStructuredReport(input: {
  correctRate: number;
  progress: string;
  weakPoints: string[];
  mistakeReason: string;
  nextTaskTitle: string;
}) {
  return {
    summary: `本次正确率 ${Math.round(input.correctRate * 100)}%。${input.progress} 下一步重点放在「${input.nextTaskTitle}」。`,
    recommendationReasons: [
      `${input.weakPoints[0] ?? "基础概念"} · 需加强`,
      `${input.mistakeReason} · 优先复盘`,
    ],
  };
}
