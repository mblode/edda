import type { Context } from "hono";

export const badGateway = (c: Context, message: string) => c.text(message, 502);
export const badRequest = (c: Context, message: string) => c.text(message, 400);
export const notFound = (c: Context) => c.text("Not Found", 404);
export const noContent = () => new Response(null, { status: 204 });
export const unauthorized = (c: Context, message: string) =>
  c.text(message, 401);
