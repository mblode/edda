import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { HOME_FAQS } from "./home-faqs";
import {
  HOME_EYEBROW,
  HOME_HEADLINE,
  HOME_SUBHEAD,
  KNOWLEDGE_REPORT_URL,
} from "./marketing-site";
import { DEMO_MARKDOWN, DEMO_SOURCE } from "./mdx-demo";

const here = dirname(fileURLToPath(import.meta.url));
const mirror = readFileSync(
  join(here, "../app/markdown/content/home.md"),
  "utf8"
);
const page = readFileSync(join(here, "../app/page.tsx"), "utf8");

/** Mintlify's figures, exactly as the page and the mirror quote them. */
const REPORT_FIGURES = ["257M", "131M", "83%", "0.11", "2.23"];

describe("home Markdown mirror", () => {
  it("leads with the visible H1 and subhead", () => {
    expect(mirror.startsWith(`# ${HOME_HEADLINE}\n`)).toBe(true);
    expect(mirror).toContain(HOME_SUBHEAD);
    expect(mirror).toContain(HOME_EYEBROW);
  });

  it("cites every Mintlify figure next to the report link", () => {
    expect(mirror).toContain(`(${KNOWLEDGE_REPORT_URL})`);
    expect(page).toContain("href={KNOWLEDGE_REPORT_URL}");
    for (const figure of REPORT_FIGURES) {
      expect(page).toContain(figure);
      expect(mirror).toContain(figure);
    }
  });

  it("carries the demo example and its Markdown output", () => {
    expect(mirror).toContain(DEMO_SOURCE.trim());
    expect(mirror).toContain(DEMO_MARKDOWN);
  });

  it("carries every FAQ question and answer verbatim", () => {
    for (const faq of HOME_FAQS) {
      expect(mirror).toContain(`**${faq.question}**\n${faq.answer}`);
      for (const link of faq.links ?? []) {
        expect(mirror).toContain(
          `[${link.label}](https://blode.co/edda${link.href})`
        );
      }
    }
  });
});

describe("home FAQ", () => {
  it("has 5 to 8 questions with direct answers of 60 words or fewer", () => {
    expect(HOME_FAQS.length).toBeGreaterThanOrEqual(5);
    expect(HOME_FAQS.length).toBeLessThanOrEqual(8);
    for (const faq of HOME_FAQS) {
      expect(faq.answer.split(/\s+/).length).toBeLessThanOrEqual(60);
      expect(faq.answer).not.toMatch(/—/);
    }
  });
});
