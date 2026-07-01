export function recommendTask(input: { goalScore: string; weakPoints: string[] }) {
  return {
    id: "task-linear-kb",
    title: input.weakPoints.includes("图像理解") ? "理解 k 和 b 的意义" : "从打印费理解一次函数建模",
    reason: `目标 ${input.goalScore} 需要先补稳定的 ${input.weakPoints[0] ?? "基础概念"}。`,
    durationMinutes: 20,
  };
}
