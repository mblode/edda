# Blode.md Docs

Next.js documentation frontend with dynamic tenant routing and MDX rendering.

## Getting Started

```bash
npm run dev
```

`npm run dev` is `portless run next dev`. Open [https://docs.localhost](https://docs.localhost). `npm run dev:e2e` binds `http://127.0.0.1:3001`.

The app reads content from the Blode.md API at runtime. Set `NEXT_PUBLIC_API_URL` in `.env.local` to point at your local API server (`http://localhost:4000`).
