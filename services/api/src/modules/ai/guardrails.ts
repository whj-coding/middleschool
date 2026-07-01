export function canUseAnswerMode(input: { submitted: boolean; helpCount: number }) {
  return input.submitted || input.helpCount >= 3;
}

export function canUseFigureRecognition(input: { confidence: number; reviewStatus: string }) {
  return input.reviewStatus === "approved" && input.confidence >= 0.8;
}
