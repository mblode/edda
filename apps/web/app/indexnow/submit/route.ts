import { NextResponse } from "next/server";

import {
  authorizeIndexNowSubmit,
  INDEXNOW_MAX_URLS,
  submitIndexNow,
} from "@/lib/indexnow";

export const POST = async (request: Request) => {
  const secret = process.env.INDEXNOW_SUBMIT_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "INDEXNOW_SUBMIT_SECRET is not configured" },
      { status: 503 }
    );
  }

  if (!authorizeIndexNowSubmit(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let urlList: string[] | undefined;
  const rawBody = await request.text();
  if (rawBody.trim()) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return NextResponse.json(
        { error: "Body must be a JSON object" },
        { status: 400 }
      );
    }

    if (Object.hasOwn(parsed, "urlList")) {
      const requestedUrls = (parsed as { urlList: unknown }).urlList;
      if (
        !Array.isArray(requestedUrls) ||
        !requestedUrls.every((url) => typeof url === "string")
      ) {
        return NextResponse.json(
          { error: "urlList must be an array of strings" },
          { status: 400 }
        );
      }
      if (requestedUrls.length > INDEXNOW_MAX_URLS) {
        return NextResponse.json(
          {
            error: `urlList exceeds IndexNow limit of ${INDEXNOW_MAX_URLS}`,
          },
          { status: 400 }
        );
      }
      urlList = requestedUrls;
    }
  }

  const result = await submitIndexNow(urlList);

  let status = 200;
  if (!result.ok) {
    status = result.status >= 400 ? result.status : 502;
  }

  return NextResponse.json(result, { status });
};
