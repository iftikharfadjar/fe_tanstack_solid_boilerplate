# AGENTS.md

## Commands (Bun)
- `bun install`
- `bunx prisma db push && bunx prisma generate` — required after schema changes
- `bun run dev` — dev server on port 3000
- `bun run build` — production build
- `bun run start` — run production build
- `bun run test` — vitest run

## Architecture
- **Router**: `src/router.tsx` exports `getRouter()` via `createTanStackRouter`
- **Routes**: `src/routes/` — file-based routing, `src/routeTree.gen.ts` is auto-generated (DO NOT EDIT)
- **Server functions**: `src/server/serverFn/` — `createServerFn` from `@tanstack/solid-start`
- **Data**: `src/data/` — Prisma/SQLite, repositories, GraphQL/REST clients
- **Presentation**: `src/presentation/components/` — stateful/stateless split

## Vite Config
`tanstackStart()` already handles Solid transformation. Do NOT add `solidPlugin` separately.

Plugin order: `devtools → viteTsConfigPaths → tailwindcss → tanstackStart`

## Database
Prisma + SQLite. `JWT_SECRET` env var for session (dev default: hardcoded key in `src/server/serverFn/session.ts`).

## Notes
- Tailwind v4 via `@tailwindcss/vite`
- `tsconfig.json`: `jsx: "preserve"`, `jsxImportSource: "solid-js"`
- No lint/typecheck scripts defined
- Link component is `Link` from `@tanstack/solid-router`, not `A`
