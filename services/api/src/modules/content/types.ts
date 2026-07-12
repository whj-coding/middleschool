export type ReviewStatus =
  | "pending_recognition"
  | "recognition_failed"
  | "pending_review"
  | "needs_revision"
  | "rejected"
  | "approved"
  | "published"
  | "unusable";

export type Question = {
  id: string;
  subject: "数学";
  module: "函数";
  knowledgePoint: string;
  questionType: "选择题" | "填空题" | "解答题";
  difficulty: "基础" | "提升" | "冲刺";
  ability: "概念" | "表达式" | "图像" | "应用" | "综合";
  answer: string;
  stem: string;
  explanation: string;
  reviewStatus: ReviewStatus;
  reviewReason?: string;
};

export type FigureRecognition = {
  questionId: string;
  figureType: string;
  elements: Record<string, unknown>;
  confidence: number;
  reviewStatus: ReviewStatus;
};
