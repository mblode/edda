import { expect, test } from "@playwright/test";

test("landing page renders primary CTA", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("The knowledge layer your AI runs on.").first()
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Get started free" }).first()
  ).toHaveAttribute("href", "/oauth/consent");
  await expect(
    page.getByRole("link", { name: "Read the docs" })
  ).toHaveAttribute("href", "/docs");
  await expect(
    page.getByRole("heading", { name: "Knowledge that ships with the code" })
  ).toBeVisible();
});
