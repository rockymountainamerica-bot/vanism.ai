# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint via next lint
```

No test suite is configured.

## Environment

Requires `ANTHROPIC_API_KEY` set in `.env.local` for the AI copilot to function.

## Architecture

Next.js 14 App Router project with two routes:

- `/` — default Next.js scaffold page (`app/page.tsx`)
- `/vanlife` — the main feature: a van life travel assistant chat UI (`app/vanlife/page.jsx`, client component)

**AI backend** — `app/api/copilot/route.js` is a single POST route that calls the Anthropic Messages API directly (`claude-sonnet-4-6`). It accepts `messages` (chat history), a `system` prompt, and an optional `resources` object (water/power/fuel/budget levels). When resources are provided, they are appended as context to the last user message before forwarding to the API.

The frontend sends the full chat history on every turn. There is no streaming — the route waits for the full response and returns `{ reply: string }`.

Styling is done with inline styles on the vanlife page (dark earth-tone palette); Tailwind is available globally but only used on the root page.
