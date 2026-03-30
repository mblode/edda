import { NextResponse } from "next/server";

import { getTenantSearchItems } from "@/lib/docs-runtime";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 300;

interface SearchItem {
  href?: string;
  title: string;
  path: string;
}

export const GET = async (
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ tenant: string }>;
  }
) => {
  const { tenant } = await params;
  const items = ((await getTenantSearchItems(tenant)) ?? []) as SearchItem[];

  return NextResponse.json(
    { items },
    {
      headers: {
        "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Vercel-CDN-Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=900",
      },
    }
  );
};
