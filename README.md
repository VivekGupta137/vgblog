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

## Diagrams (Kroki)

All [Kroki](https://kroki.io) diagram types render at build time via `remark-kroki`.

Use a fence named after the diagram type (or `kroki` with `type=`):

- `` ```plantuml `` … `` ``` ``
- `` ```mermaid `` … `` ``` ``
- `` ```d2 `` … `` ``` ``
- `` ```graphviz `` … `` ``` ``
- `` ```diagramsnet `` … `` ``` `` (Draw.io / diagrams.net XML)
- `` ```kroki type=excalidraw `` … `` ``` ``

Supported aliases include PlantUML, Mermaid, D2, GraphViz, C4, Excalidraw, Diagrams.net, Structurizr, WaveDrom, and the rest of Kroki’s catalog.

For diagrams that only work as HTML/CSS/SVG, use `` ```renderhtml `` (renders in the page). Regular `` ```html `` fences still show highlighted source.

For local builds, use the included Docker Compose stack instead of the rate-limited public service:

```bash
docker compose -f kroki-local/docker-compose.yaml up -d
echo 'PUBLIC_KROKI_SERVER_URL=http://localhost:8000' >> .env  # local only (.env is gitignored)
bun run build
```

The stack includes the Kroki core plus Mermaid, BPMN, and diagrams.net companions; PlantUML runs through the core. Stop it with `docker compose -f kroki-local/docker-compose.yaml down`. Set `PUBLIC_KROKI_SERVER_URL` to your Kroki core for other environments. Diagrams.net requires the `yuzutech/kroki-diagramsnet` companion and `KROKI_DIAGRAMSNET_HOST=diagramsnet` on core.
