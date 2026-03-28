# Project Guidelines

## Project Overview
- This repository is an Astro v5 starter for "Mona Mayhem," a GitHub contribution battle arena.
- The app runs in server mode with the Node adapter (`output: 'server'`, standalone runtime).
- Main implementation lives in `src/pages/` and `src/pages/api/`.
- Treat `workshop/` as learning material, not application source. Ignore it unless the user explicitly asks to edit workshop content.

## Build And Dev Commands
- Install dependencies: `npm install`
- Start local development: `npm run dev`
- Build production output: `npm run build`
- Preview production build locally: `npm run preview`
- Run Astro CLI directly: `npm run astro -- <command>`
- There are currently no lint or test scripts in `package.json`; do not assume they exist.

## Astro Best Practices
- Keep TypeScript strict-compatible (`tsconfig.json` extends `astro/tsconfigs/strict`).
- Follow Astro file-based routing conventions for pages and API endpoints.
- For dynamic/server API routes, export `prerender = false` and type handlers as `APIRoute`.
- Return explicit HTTP status codes and JSON content-type headers for API responses.
- Prefer Astro-first rendering and add client-side JavaScript only when needed.

## Conventions
- Preserve existing formatting style in touched files.
- Keep changes minimal and focused; avoid broad refactors unless requested.
- Link to existing docs instead of duplicating long guidance: see `README.md` and `docs/index.html`.
