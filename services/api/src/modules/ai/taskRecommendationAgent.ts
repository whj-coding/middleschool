export function recommendTask(input: { goalScore: string; weakPoints: string[] }) {
  const primaryWeakPoint = input.weakPoints[0] ?? "基础概念";
  const isKbTask = input.weakPoints.includes("图像理解") || input.weakPoints.includes("k/b意义");

  return {
    id: "task-linear-kb",
    title: isKbTask ? "理解 k 和 b 的意义" : "从打印费理解一次函数建模",
    reason: `目标 ${input.goalScore} 需要先补稳定的 ${primaryWeakPoint}。`,
    taskContent: "完成 1 个图像探索、1 道即时练习和 1 次错因复盘。",
    durationMinutes: 20,
    completionStandard: "能说清 k 表示单位变化量、b 表示初始量，并能把生活场景写成 y = kx + b。",
  };
}
