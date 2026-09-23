import type { FaqItem } from "@/lib/structured-data";

/**
 * Home FAQ. Each answer opens with the direct answer in 60 words or fewer.
 * The visible FAQ, the FAQPage JSON-LD and the Markdown mirror
 * (`app/markdown/content/home.md`) all come from or are checked against this
 * array. `links` render under the answer and stay out of the JSON-LD text.
 */
export const HOME_FAQS: readonly FaqItem[] = [
  {
    answer:
      "Edda is a docs platform for teams that keep MDX in git. Every merge publishes an HTML site for people and, for agents, llms.txt, a Markdown copy of every page and WebMCP tools. Hosting is $0 and the source is MIT.",
    question: "What is Edda?",
  },
  {
    answer:
      "Edda is the git path without the web editor or marketplace: the same MDX files, a smaller docs.json and one command to publish. Hosted Edda is $0, and you can self-host the MIT source. Moving over takes a docs.json rewrite, not a content rewrite.",
    links: [
      {
        href: "/docs/guides/migrate-from-mintlify",
        label: "Migrate from Mintlify",
      },
    ],
    question: "How is Edda different from Mintlify?",
  },
  {
    answer:
      "llms.txt and llms-full.txt, a .md twin of every page (also served for Accept: text/markdown), discovery headers on every HTML page, a generated agent skill, and five WebMCP tools for browser agents. All of it is rebuilt from the commit you merged.",
    question: "What do agents get from an Edda site?",
  },
  {
    answer:
      "An agent can draft the change as a pull request like any other code change. Edda publishes what you merge, so a person stays the approver. Edda doesn't include a writing agent of its own.",
    question: "Can an AI agent write my docs?",
  },
  {
    answer:
      "Not in Edda yet. Agents fetch server-side and run no JavaScript, so PostHog counts people only. To count agents today, put a proxy you can log in front of the docs and count .md, llms.txt and AI user-agent requests.",
    links: [
      { href: "/docs/guides/proxy-vercel", label: "Proxy with Vercel" },
      { href: "/docs/guides/proxy-cloudflare", label: "Proxy with Cloudflare" },
      { href: "/docs/guides/proxy-nginx", label: "Proxy with Nginx" },
    ],
    question: "Can I see how much agent traffic my docs get?",
  },
  {
    answer:
      "Hosted Edda is $0 with unlimited projects, pages and seats, including custom domains, search, MDX and API references. You do not get a visual editor, a plugin marketplace, SOC 2, SSO or an SLA, and support is the founder. The CLI and renderer are MIT if you self-host.",
    question: "What does Edda cost?",
  },
];
