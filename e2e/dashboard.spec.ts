import { expect, test } from "@playwright/test";

test("/app rewrites into the dashboard auth flow", async ({ page }) => {
  await page.goto("/app");

  await expect(page).toHaveURL(/\/oauth\/consent\?redirect_to=%2Fapp$/);
  await expect(
    page.getByRole("button", { name: "Continue with GitHub" })
  ).toBeVisible();
});
