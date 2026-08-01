# SDEWay / VG

Personal learning notes and portfolio site (Astro + Starlight), deployed on Cloudflare Pages.

## Develop (Astro only)

```bash
bun install
bun run dev
```

Astro alone does **not** run Pages Functions (`/api/*`). Use Cloudflare local server for `/admin`.

## Cloudflare local server (Functions + static)

```bash
cp .dev.vars.example .dev.vars
# set ADMIN_PASSWORD and GITHUB_TOKEN in .dev.vars

bun run cf:dev
```

Builds the site, then serves `dist/` with Pages Functions and live-reload.

```bash
bun run cf:dev:astro   # proxy Astro HMR through Wrangler (deprecated CLI, still handy)
bun run cf:preview     # same as cf:dev without emphasizing live-reload
bun run cf:deploy      # build + wrangler pages deploy
```

Open the URL Wrangler prints (usually `http://127.0.0.1:8788`), then go to `/admin`.

## Build

```bash
bun run build
```

Content lives in `src/content/docs/`. Admin publishing UI is at `/admin`.
