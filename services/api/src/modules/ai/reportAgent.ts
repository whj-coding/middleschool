export function generateReportSummary(input: {
  correctRate: number;
  weakPoints: string[];
  mistakeReason: string;
  nextTaskTitle: string;
}) {
  return `本次正确率 ${Math.round(input.correctRate * 100)}%。进步点是能开始识别变量关系。当前薄弱点是 ${input.weakPoints.join("、")}，主要错因是 ${input.mistakeReason}。下一步建议完成「${input.nextTaskTitle}」。`;
}
