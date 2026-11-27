# AGENTS.md

SDEWay (sdeway.com): personal learning notes + portfolio. Astro 7 + Starlight, deployed to Cloudflare Pages. Package manager: **bun** (`bun.lock`).

## Commands
- `bun install`
- `bun run dev` – Astro dev server (no Pages Functions / `/api/*`)
- `bun run build` – static build to `dist/`
- `bun run cf:dev` – build + `wrangler pages dev ./dist` (Functions + `/admin`)
- `bun run cf:deploy` – build + deploy
- No test suite or linter; verify with `bun run build`.

## Layout
- `src/content/docs/` – all content. Sections: `guides`, `coding`, `high-level-design`, `low-level-design`, `connect`, `reference`
- `src/components/` – Starlight overrides (Head, Header, Comments, Pagination, ...)
- `src/lib/` – remark/rehype plugins (kroki, code-group, content-group, data-table, render-html, github badge links)
- `functions/api/` – Cloudflare Pages Functions (`docs.ts`, `upload.ts`) behind the `/admin` publishing UI
- `astro.config.mjs` – Starlight config, sidebar, plugins
- `kroki-local/` – local Kroki diagram server (docker compose)
- `wrangler.jsonc` – plain env vars; secrets via Dashboard

## Content rules
- Use the `write-docs-page` skill (`.agents/skills/write-docs-page/SKILL.md`) for any docs edit. Syntax reference: `src/content/docs/guides/example.md`.
- Paths entirely **lowercase**, hyphenated slugs. Internal links use URL form with trailing slash (`/coding/linux/text-editors/`), never `.md`.
- Frontmatter requires `title`; add `description`.
- A new top-level docs folder needs a sidebar entry in `astro.config.mjs`.

## Environment
- Copy `.env.example` → `.env` (Astro) and `.dev.vars.example` → `.dev.vars` (Functions). Never commit or print secrets (`ADMIN_PASSWORD`, `GITHUB_TOKEN`).
- Building requires `PUBLIC_KROKI_SERVER_URL` (start local Kroki: `docker compose -f kroki-local/docker-compose.yaml up -d`).
- `wrangler.jsonc` vars are not read by Astro.

## Conventions
- Keep changes minimal; don't edit `dist/`, `.astro/`, lockfiles by hand.
- Commits from the admin UI are prefixed `[WEB]`.
- Skills are mirrored in `.claude/`, `.cursor/`, `.gemini/` `skills/`; keep them in sync with `.agents/skills/`.
