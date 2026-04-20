import { NextResponse } from "next/server";

import { marketingUrl } from "@/lib/marketing-site";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-Web",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
  "CCBot",
];

const aiCrawlerBlock = AI_CRAWLERS.map(
  (agent) => `User-agent: ${agent}\nAllow: /`
).join("\n\n");

const body = `User-agent: *
Allow: /
Content-Signal: ai-train=yes, search=yes, ai-input=yes

${aiCrawlerBlock}

Sitemap: ${marketingUrl("/sitemap.xml")}
`;

export const GET = () =>
  new NextResponse(body, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
