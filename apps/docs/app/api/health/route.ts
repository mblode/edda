import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 60;

export const GET = () =>
  NextResponse.json({
    ok: true,
    service: "blodemd-docs",
    timestamp: new Date().toISOString(),
  });
