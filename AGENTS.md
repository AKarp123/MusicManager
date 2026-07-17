# MusicManager contributor guide

## Project purpose

MusicManager is a self-hosted music-library manager intended for Navidrome and
other Subsonic-compatible media servers. Its product direction, carried forward
from `main`, is to make it easy to upload music, browse/select library folders,
move files into the library, convert high-resolution FLAC to CD-quality FLAC or
MP3, and calculate ReplayGain. Future work should preserve that workflow and
support asynchronous processing, multi-user use, improved parallelism, MP3 tag
updates, cover art management, and music-tag validation.

## Current architecture

This checkout is the `v2-rewrite`; it intentionally differs from the legacy
`main` implementation (`client/` + `server/`, JavaScript/MongoDB).

- `frontend/`: React 19 + TypeScript + Vite application, using Wouter for
  routing, Tailwind CSS, Better Auth client, and the `@` alias for `src/`.
- `backend/`: Bun + TypeScript service built on Hono, Better Auth, Drizzle, and
  SQLite (`better-sqlite3`). API routes are mounted below `/api`; auth is below
  `/api/auth`.
- The frontend proxies `/api` to `VITE_BACKEND_URL` or `http://backend:3000`.
- Library filesystem access belongs in backend utilities. Keep the configured
  library-root boundary intact; never accept arbitrary filesystem paths from a
  client.

Treat the legacy code on `main` as product/reference material, not as a source
of files to merge wholesale into this rewrite. Port features deliberately into
the current TypeScript architecture.

## Local development

Use Bun within each application directory:

```sh
cd backend && bun install && bun run dev
cd frontend && bun install && bun run dev
```

The backend listens on port 3000. The Vite frontend normally listens on 5173.
Configure `FRONTEND_URL` when the frontend is not at its default origin, and
`VITE_BACKEND_URL` when the frontend must proxy to a different backend address.
Never commit `.env` files or credentials.

## Dependencies and containers

Docker services use their own `node_modules` volumes. When adding, removing, or
updating a package, run the relevant Bun install command from inside the
corresponding Docker container so the container volume is updated. Do not rely
on a host-side install alone; it will not update the dependencies used by the
running container. Commit the appropriate package manifest and lockfile changes.

## Quality checks

Run checks from their respective directories before handing off changes:

```sh
cd backend && bun run lint && bun run format:check
cd frontend && bun run lint && bun run format:check && bun run build
```

The root `package.json` still contains legacy scripts that reference
`client/` and `server/`; do not rely on those scripts for v2 work until they are
updated.

## Code conventions

- TypeScript is used throughout the rewrite. Keep public boundaries typed and
  avoid `any`.
- Prettier uses tabs, single quotes, no semicolons, and an 80-character print
  width. Run the local formatter on every changed source file before handing
  off; do not rely on manual formatting.
- Follow the existing split: page-level UI in `frontend/src/pages`, reusable UI
  in `frontend/src/components`, shared frontend state in `frontend/src/context`,
  routes in `backend/src/routes`, and backend integrations/utilities in
  `backend/src/utils`.
- The frontend ESLint configuration rejects `console.log`; use the toast/error
  UI or `console.warn`/`console.error` as appropriate.
- Preserve authentication on user-facing application routes and avoid exposing
  library paths, credentials, or raw backend errors unnecessarily.

## Working safely

- Check `git status` before editing. This worktree may contain in-progress user
  changes; do not overwrite, revert, or reformat unrelated files.
- Keep migrations and generated auth artifacts deliberate and reviewable.
- For a feature port from `main`, first identify the behavior to retain, then
  implement it in `backend/` and `frontend/` with the current API/auth model.
- Add focused tests when a test setup is introduced; until then, lint, format,
  build, and manually exercise both the authenticated UI and its API path.
