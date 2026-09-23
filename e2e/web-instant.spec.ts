import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

// Instant navigation guards for apps/web. Inside `instant()` only the static
// shell (page load) or the prefetched App Shell (client navigation) is on
// screen, so each assertion here must hold before any dynamic data streams in.
// The landing route and the legal pages it links to are fully static, so the
// whole page is expected in the shell.

test.describe("landing (/)", () => {
  test("is instant on an initial page load", async ({ baseURL, page }) => {
    await instant(
      page,
      async () => {
        await page.goto("/");
        await expect(
          page.getByRole("heading", {
            level: 1,
            name: "Docs agents can navigate",
          })
        ).toBeVisible();
        await expect(
          page.getByLabel("MDX in: docs/quickstart.mdx")
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { name: "The merge is the deploy" })
        ).toBeVisible();
      },
      { baseURL }
    );
  });

  test("is instant on a client navigation to /privacy", async ({ page }) => {
    await page.goto("/");
    await instant(page, async () => {
      await page
        .getByRole("contentinfo")
        .getByRole("link", { exact: true, name: "Privacy" })
        .click();
      await page.waitForURL((url) => url.pathname === "/privacy");
      await expect(
        page.getByRole("heading", { level: 1, name: "Privacy policy" })
      ).toBeVisible();
    });
  });
});

test("legal pages navigate between each other instantly", async ({ page }) => {
  await page.goto("/privacy");
  await instant(page, async () => {
    await page
      .getByRole("contentinfo")
      .getByRole("link", { exact: true, name: "Terms" })
      .click();
    await page.waitForURL((url) => url.pathname === "/terms");
    await expect(
      page.getByRole("heading", { level: 1, name: "Terms of service" })
    ).toBeVisible();
  });
});
