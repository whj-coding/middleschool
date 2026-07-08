import type { TodayTask } from "../services/todayTaskApi";

export const todayTask = {
  id: "task-linear-kb",
  title: "理解 k 和 b 的意义",
  reason: "你在图像增减性和截距理解上不够稳定。",
  taskContent: "完成 1 个图像探索、1 道即时练习和 1 次错因复盘。",
  estimatedMinutes: 20,
  durationOptions: [10, 20, 40],
  completion: "完成 1 个图像探索、1 道即时练习和 1 次错因复盘。",
  completionStandard: "能说清 k 表示单位变化量、b 表示初始量，并能把生活场景写成 y = kx + b。",
  learningPackageQuery: {
    knowledgeTag: "k/b意义",
    difficulty: "基础",
    ability: "概念",
  },
} satisfies TodayTask;

export const report = {
  progress: "你已经能看出 k 会影响直线的上升或下降。",
  weakPoint: "应用建模时需要先分清固定费用和变化费用。",
  nextTask: "从打印费理解一次函数建模",
};
