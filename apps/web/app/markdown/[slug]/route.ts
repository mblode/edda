import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

const SLUGS = [
  "home",
  "about",
  "blog",
  "pricing",
  "privacy",
  "security",
  "terms",
] as const;

type Slug = (typeof SLUGS)[number];

const ALLOWED = new Set<string>(SLUGS);

export const generateStaticParams = () => SLUGS.map((slug) => ({ slug }));

export const GET = async (
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await context.params;
  if (!ALLOWED.has(slug)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const file = path.join(
    process.cwd(),
    "app",
    "markdown",
    "content",
    `${slug as Slug}.md`
  );
  const body = await readFile(file, "utf8");
  return new NextResponse(body, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/markdown; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
};
