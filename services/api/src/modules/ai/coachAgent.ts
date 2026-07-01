import { canUseAnswerMode } from "./guardrails.js";
import type { CoachContext, HelpMode } from "./types.js";

export function generateCoachReply(context: CoachContext): { mode: HelpMode; text: string } {
  if (context.requestedMode === "answer" && !canUseAnswerMode(context)) {
    return {
      mode: "hint",
      text: "先不直接给完整答案。你先找两个量：固定不变的起点费用是多少，每增加 1 个单位会增加多少。",
    };
  }

  if (context.requestedMode === "explanation" && context.submitted) {
    return {
      mode: "explanation",
      text: "这题的主要错因是审题与建模错误。先区分固定费用 3 元和每页变化费用 0.4 元，再写成 y = 0.4x + 3。",
    };
  }

  if (context.requestedMode === "answer") {
    return {
      mode: "answer",
      text: "完整答案：y = 0.4x + 3，其中 3 是固定费用，0.4 是每打印 1 页增加的费用。",
    };
  }

  return {
    mode: "hint",
    text: "先不要急着写式子。请先说出哪个量固定不变，哪个量会随着页数变化。",
  };
}
