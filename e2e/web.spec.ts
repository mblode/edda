import { expect, test } from "@playwright/test";

test("landing page renders primary CTA", async ({ page }) => {
  await page.goto("/");

  await expect(
    page
      .getByText("The answer they read matches the commit you merged.")
      .first()
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Connect GitHub" }).first()
  ).toHaveAttribute("href", "/oauth/consent");
  await expect(
    page.getByRole("link", { name: "Read the docs" }).first()
  ).toHaveAttribute("href", "/docs");
  await expect(
    page.getByRole("heading", { name: "The merge is the deploy" })
  ).toBeVisible();
  await expect(
    page.getByText("No second editor. On purpose.").first()
  ).toBeVisible();
});
