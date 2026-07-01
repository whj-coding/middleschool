export type HelpMode = "hint" | "explanation" | "answer";
export type ReviewStatus = "pending_review" | "approved" | "published" | "needs_revision" | "unusable";

export type CoachContext = {
  questionId: string;
  submitted: boolean;
  helpCount: number;
  requestedMode: HelpMode;
  studentAnswer?: string;
};
