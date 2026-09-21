import { expect, test } from "@playwright/test";

test("landing page renders primary CTA", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://blode.co/edda"
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );

  await expect(
    page
      .getByText("Knowledge docs for agents. Git-native MDX. Publish on merge.")
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
