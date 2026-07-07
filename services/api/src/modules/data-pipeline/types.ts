export type ChunkType = "concept" | "example" | "problem" | "scenario" | "explanation";
export type Difficulty = "基础" | "提升" | "冲刺";
export type Ability = "概念" | "表达式" | "图像" | "应用" | "综合";
export type ReviewStatus = "pending_review" | "needs_revision" | "approved" | "rejected";
export type InteractionAction =
  | "view_content"
  | "submit_answer"
  | "request_hint"
  | "view_explanation"
  | "view_full_answer"
  | "voice_input"
  | "rate_ai_response";

export type ContentUnit = {
  id: string;
  chunkType: ChunkType;
  contentMarkdown: string;
  knowledgeTags: string[];
  difficulty: Difficulty | null;
  ability: Ability | null;
  errorTypes: string[];
  reviewStatus: ReviewStatus;
  qualityScore: number;
  usageCount: number;
};

export type InteractionLog = {
  id: string;
  studentId: string;
  taskId: string | null;
  questionId: string | null;
  contentUnitId: string | null;
  action: InteractionAction;
  studentAnswer: string | null;
  hintLevel: number;
  timeToAnswerMs: number | null;
  correct: boolean | null;
  aiResponse: string | null;
  feedbackRating: number | null;
  createdAt: string;
};

export type ComposeLearningPackageInput = {
  knowledgeTag: string;
  difficulty: Difficulty;
  ability: Ability;
};
