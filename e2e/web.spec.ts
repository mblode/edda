import { expect, test } from "@playwright/test";

test("landing page renders primary CTA", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Docs agents can navigate",
    })
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Connect GitHub to publish" }).first()
  ).toHaveAttribute("href", "/oauth/consent");
  await expect(
    page.getByRole("link", { name: "Read the docs" }).first()
  ).toHaveAttribute("href", "/docs");
  await expect(
    page.getByRole("heading", { name: "The merge is the deploy" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Agents draft. People merge." })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Mintlify, 2026 State of Knowledge Report" })
  ).toHaveAttribute("href", "https://www.mintlify.com/state-of-knowledge/2026");
});

test("landing MDX demo renders edits as HTML and agent Markdown", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByLabel("MDX in: docs/quickstart.mdx");
  await expect(input).toBeEditable();
  await input.fill("# Hello\n\n<Tip>\nShip it.\n</Tip>");
  await expect(
    page.locator("[data-mdx-preview] h3", { hasText: "Hello" })
  ).toBeVisible();
  await expect(page.locator("[data-mdx-output]")).toHaveText(
    "> ## Documentation Index\n> [HTML page](https://acme.blode.md/quickstart)\n> [Documentation index](https://acme.blode.md/llms.txt)\n> Use the index to discover all available pages before exploring further.\n\n# Hello\n\n> [!TIP]\n> Ship it."
  );
});
