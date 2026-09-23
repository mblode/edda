import { expect, test } from "@playwright/test";

test("/app rewrites into the dashboard auth flow", async ({ page }) => {
  await page.goto("/app");

  // Both `/app` and `%2Fapp` decode to the same value, and the callback reads
  // the decoded param, so assert on that rather than one encoding.
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === "/oauth/consent" &&
      url.searchParams.get("redirect_to") === "/app"
  );
  await expect(
    page.getByRole("button", { name: "Continue with GitHub" })
  ).toBeVisible();
});
