export function evaluateDiagnostic(answers: Array<{ ability: string; correct: boolean }>) {
  const weakPoints = answers
    .filter((answer) => !answer.correct)
    .map((answer) => (answer.ability === "图像" ? "图像理解" : "应用建模"));

  return {
    weakPoints: Array.from(new Set(weakPoints)),
    mistakeCandidates: ["图像理解错误", "审题与建模错误"],
  };
}
