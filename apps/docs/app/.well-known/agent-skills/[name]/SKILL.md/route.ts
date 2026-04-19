import { NextResponse } from "next/server";

import { PLATFORM_SKILLS } from "@/lib/platform-skills";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

export const generateStaticParams = () =>
  PLATFORM_SKILLS.map((skill) => ({ name: skill.name }));

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) => {
  const { name } = await params;
  const skill = PLATFORM_SKILLS.find((item) => item.name === name);
  if (!skill) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(skill.content, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/markdown; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
