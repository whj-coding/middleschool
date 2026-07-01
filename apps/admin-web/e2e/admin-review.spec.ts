import { expect, test } from "@playwright/test";

test("admin reviews and reaches publish control", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "进入题目审核" }).click();
  await expect(page.getByText("MATH-FUNC-LINEAR-001")).toBeVisible();
  await page.getByRole("button", { name: "题目审核通过" }).click();
  await expect(page.getByText("coordinate_line_graph")).toBeVisible();
  await page.getByRole("button", { name: "图形识别通过" }).click();
  await expect(page.getByText("只有审核通过内容可以发布")).toBeVisible();
  await page.getByRole("button", { name: "发布到学生端" }).click();
  await expect(page.getByText("API 同步：published")).toBeVisible();
});
