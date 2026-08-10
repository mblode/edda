import { NextResponse } from "next/server";

import { getIndexNowKey } from "@/lib/indexnow";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ key: string }> }
) => {
  const { key } = await context.params;
  const indexNowKey = getIndexNowKey();

  if (!indexNowKey || key !== indexNowKey) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(indexNowKey, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
