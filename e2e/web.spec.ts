import { expect, test } from "@playwright/test";

test("landing page renders primary CTA", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("Docs that match the code you shipped.").first()
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Start shipping" }).first()
  ).toHaveAttribute("href", "/oauth/consent");
  await expect(
    page.getByRole("link", { name: "Read the docs" })
  ).toHaveAttribute("href", "/docs");
  await expect(
    page.getByRole("heading", { name: "The merge is the deploy" })
  ).toBeVisible();
});
