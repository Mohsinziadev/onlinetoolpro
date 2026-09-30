# Backend archive

The site currently deploys as a **100% static, client-side** build (see the main README). This folder
keeps the server code it used before, so it can be restored when a backend is added again. Nothing here
is built, type-checked, linted or deployed.

| Path | What it was |
|---|---|
| `src/app/api/` | Next.js route handlers: YouTube Data API proxy (channel, video, video-details, comments, videos), channel audit, tracker, competitor comparison, content gap, daily snapshot cron |
| `src/lib/youtube/{client,channels,videos,playlists,comments,mock}.ts` | Server-only YouTube Data API client and development mock data |
| `src/lib/{api,rate-limit,visitor,tracked,snapshots,db}.ts` | API response helpers, rate limiting, anonymous visitor cookie, tracked-channel storage, snapshot job, Prisma client |
| `prisma/`, `prisma.config.ts`, `src/generated/prisma/` | PostgreSQL schema, migrations and generated client |

## Restoring

1. Move the folders back to the same paths under the project root.
2. Reinstall `@prisma/client`, `@prisma/adapter-pg`, `pg`, `server-only`, `prisma`, `@types/pg`, `dotenv`.
3. Remove `output: "export"` from `next.config.ts` and restore the `build`/`postinstall` scripts
   (`prisma generate && next build`).
4. Set `YOUTUBE_API_KEY` and `DATABASE_URL`, then switch the YouTube tools that need them from
   `status: "coming-soon"` back to `"live"` in `src/lib/catalog/tools/youtube.ts`.
