import { connection, NextResponse } from "next/server";

// A health check that answers from a prerender is not a health check. The
// timestamp has to be the real clock, so the route says so rather than letting
// the `new Date()` below bail it out implicitly.
export const GET = async () => {
  await connection();
  return NextResponse.json({
    ok: true,
    service: "blodemd-docs",
    timestamp: new Date().toISOString(),
  });
};
