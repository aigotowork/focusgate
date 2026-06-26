import { expect, test } from "@playwright/test";

test("popup entry renders the extension summary", async ({ page }) => {
  await page.goto("/popup.html");
  await expect(page.getByText("晚安边界")).toBeVisible();
  await expect(page.getByText("今晚阻断")).toBeVisible();
  await expect(page.getByText("今晚解锁")).toBeVisible();
  await expect(page.getByRole("button", { name: "加入睡眠阻断列表" })).toBeVisible();
});

test("options entry renders editable settings", async ({ page }) => {
  await page.goto("/options.html");
  await expect(page.getByRole("heading", { name: "完成晚安边界初始设置" })).toBeVisible();
  await expect(page.getByText("睡眠计划")).toBeVisible();
  await expect(page.getByText("网站规则")).toBeVisible();
  await expect(page.getByText("阻断强度")).toBeVisible();
  await expect(page.getByText("数据统计")).toBeVisible();
});

test("block entry renders the bedtime boundary", async ({ page }) => {
  await page.goto("/block.html?site=youtube.com");
  await expect(page.getByRole("heading", { name: "现在是晚安时间" })).toBeVisible();
  await expect(page.getByText("已拦截访问：youtube.com")).toBeVisible();
  await expect(page.getByRole("button", { name: "关掉网页，我去睡了" })).toBeVisible();
  await page.getByRole("button", { name: /临时解锁/ }).click();
  await expect(page.getByText("请深呼吸，冷静一下...")).toBeVisible();
});
