import { NextResponse } from "next/server";

export const TENANT_NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page not found</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        display: flex;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1.5rem;
      }
      main { max-width: 28rem; }
      h1 { font-size: 2rem; letter-spacing: -0.02em; margin: 0 0 0.75rem; }
      p { margin: 0; opacity: 0.7; line-height: 1.5; }
      a {
        display: inline-block;
        margin-top: 1.25rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        background: CanvasText;
        color: Canvas;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <a href="/">Go home</a>
    </main>
  </body>
</html>`;

const NO_STORE = "private, no-store";

/** Real HTTP 404 owned by the proxy — do not rewrite to a page/route. */
export const tenantNotFoundResponse = () =>
  new NextResponse(TENANT_NOT_FOUND_HTML, {
    headers: {
      "CDN-Cache-Control": NO_STORE,
      "Cache-Control": NO_STORE,
      "Content-Type": "text/html; charset=utf-8",
      "Vercel-CDN-Cache-Control": NO_STORE,
    },
    status: 404,
  });
