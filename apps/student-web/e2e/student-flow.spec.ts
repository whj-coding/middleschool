import { expect, test } from "@playwright/test";

test("student completes the linear-function learning slice", async ({ page }) => {
  const errors: string[] = [];
  const interactionActions: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.route("**/api/student/interactions", async (route) => {
    const payload = route.request().postDataJSON() as { action: string };
    interactionActions.push(payload.action);
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: "interaction-e2e", studentId: "student-demo" }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "选择 110+ 并开始诊断" }).click();
  await page.getByRole("button", { name: "完成诊断" }).click();
  await page.getByRole("button", { name: "开始今日任务" }).click();
  await expect(page.getByText("理解 k 和 b 的意义")).toBeVisible();
  await page.getByRole("button", { name: "进入练习" }).click();
  await page.getByRole("button", { name: "提交答案" }).click();
  await expect(page.getByText("审题与建模错误")).toBeVisible();
  await page.getByRole("button", { name: "生成学情报告" }).click();
  await expect(page.getByText("下一步任务")).toBeVisible();
  expect(interactionActions).toContain("submit_answer");
  expect(errors).toEqual([]);
});
