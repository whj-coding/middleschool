import { expect, test } from "@playwright/test";

test("student completes the linear-function learning slice", async ({ page }) => {
  const errors: string[] = [];
  const interactionPayloads: Array<{ action: string; taskId: string | null }> = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.route("**/api/student/interactions", async (route) => {
    const payload = route.request().postDataJSON() as { action: string; taskId: string | null };
    interactionPayloads.push(payload);
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: "interaction-e2e", studentId: "student-demo" }),
    });
  });
  await page.route("**/api/practice/practice-1/answers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        correct: false,
        mistake: {
          questionId: "practice-printing-fee",
          reason: "审题与建模错误",
          evidence: "学生答案 y = 3x + 0.4 混淆了固定费用和单位变化费用。",
        },
        activeTask: { studentId: "student-demo", taskId: "task-linear-kb", status: "completed" },
      }),
    });
  });
  await page.route("**/api/tasks/today**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "task-linear-kb",
        title: "理解 k 和 b 的意义",
        reason: "诊断显示你对斜率和截距的图像意义不够稳定。",
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
      }),
    });
  });
  await page.route("**/api/tasks/task-linear-kb/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ studentId: "student-demo", taskId: "task-linear-kb", status: "started" }),
    });
  });
  await page.route("**/api/tasks/task-linear-modeling/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ studentId: "student-demo", taskId: "task-linear-modeling", status: "started" }),
    });
  });
  await page.route("**/api/student/learning-package**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        units: [
          {
            id: "unit-linear-kb-concept",
            chunkType: "concept",
            contentMarkdown: "k 表示单位变化量，b 表示初始量。",
            knowledgeTags: ["一次函数", "k/b意义"],
            difficulty: "基础",
            ability: "概念",
            errorTypes: ["概念理解错误"],
            reviewStatus: "approved",
          },
        ],
      }),
    });
  });
  await page.route("**/api/student/retry-list**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            questionId: "practice-printing-fee",
            taskId: "task-linear-kb",
            studentAnswer: "y = 3x + 0.4",
            hintLevel: 1,
            createdAt: "2026-07-07T00:00:00.000Z",
          },
        ],
      }),
    });
  });
  await page.route("**/api/reports/latest**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        studentId: "student-demo",
        progress: "能说出 k 影响直线方向，但建模时还需要先分清固定量。",
        weakPoints: ["应用建模"],
        mistakes: [
          {
            questionId: "practice-printing-fee",
            reason: "审题与建模错误",
            evidence: "学生答案 y = 3x + 0.4 混淆了固定费用和单位变化费用。",
          },
        ],
        activeTask: { studentId: "student-demo", taskId: "task-linear-kb", status: "completed" },
        summary: "本次正确率 50%。下一步重点放在「从打印费理解固定费用和变化费用」。",
        recommendationReasons: ["应用建模 · 需加强", "审题与建模错误 · 优先复盘"],
        nextTask: { id: "task-linear-modeling", title: "从打印费理解固定费用和变化费用" },
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "选择 110+ 并开始诊断" }).click();
  await page.getByRole("button", { name: "完成诊断" }).click();
  await expect(page.getByText("预计时间：20 分钟")).toBeVisible();
  await page.getByRole("button", { name: "开始今日任务" }).click();
  await expect(page.getByText("理解 k 和 b 的意义")).toBeVisible();
  await expect(page.getByText("已审核学习材料")).toBeVisible();
  await page.getByRole("button", { name: "进入练习" }).click();
  await page.getByRole("button", { name: "提交答案" }).click();
  await expect(page.getByText("审题与建模错误")).toBeVisible();
  await page.getByRole("button", { name: "生成学情报告" }).click();
  await expect(page.getByText("下一步任务")).toBeVisible();
  await expect(page.getByText(/任务状态：已完成/)).toBeVisible();
  await expect(page.getByText(/本次正确率 50%/)).toBeVisible();
  await expect(page.getByText("错题复练候选")).toBeVisible();
  await expect(page.getByText("practice-printing-fee")).toBeVisible();
  await page.getByRole("button", { name: "开始推荐练习" }).click();
  await expect(page.getByRole("heading", { name: "从打印费理解固定费用和变化费用" })).toBeVisible();
  await page.getByRole("button", { name: "进入练习" }).click();
  await expect(page.getByText("打印费建模")).toBeVisible();

  await page.getByRole("button", { name: "提交答案" }).click();
  await page.getByRole("button", { name: "生成学情报告" }).click();
  await page.getByRole("button", { name: "开始复练" }).click();
  await expect(page.getByText("打印费建模")).toBeVisible();
  expect(interactionPayloads.map((payload) => payload.action)).toContain("submit_answer");
  expect(interactionPayloads[0].taskId).toBe("task-linear-kb");
  expect(interactionPayloads[1].taskId).toBe("task-linear-modeling");
  expect(errors).toEqual([]);
});
