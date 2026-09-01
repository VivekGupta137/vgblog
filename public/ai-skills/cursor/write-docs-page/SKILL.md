---
name: write-docs-page
description: Write or edit Starlight docs for sdeway.com. Use when creating or changing markdown in src/content/docs, adding a guide, or the user asks for a new docs page. Follow lowercase paths, asides, Kroki diagrams, renderhtml, tabs, data-table, KaTeX, and Expressive Code conventions.
---

# Write a sdeway.com docs page

This site is **Astro 7 + Starlight**. Docs live in `src/content/docs/`. The live syntax reference is `src/content/docs/guides/example.md` (on the web: `/guides/example/`). Match that page. Do not invent markdown syntax.

Before writing, read `guides/example.md` and one nearby page in the same folder. The Kroki type catalog is `references/diagrams.md` next to this skill.

## File and URL

Create `src/content/docs/<section>/<slug>.md`.

Existing sections: `guides`, `coding`, `high-level-design`, `low-level-design`, `connect`, `reference`.

Rules:

- **Entire path lowercase**: folders and filename (`my-note.md`, not `My-Note.md`).
- Use hyphens in slugs. Optional numeric prefixes for ordered series: `00-overview.md`.
- Extension `.md` (or `.mdx` only if the page needs MDX).
- Public URL **drops `.md`** and uses a trailing slash: `src/content/docs/coding/linux/text-editors.md` → `/coding/linux/text-editors/`.
- Internal links must use that URL form, never the source filename: `[Text editors](/coding/linux/text-editors/)`.
- Do not add pages outside `src/content/docs/`.
- A **new top-level folder** also needs a sidebar entry in `astro.config.mjs`: `items: [{ autogenerate: { directory: "…" } }]`.

Frontmatter (YAML). `title` is required; `description` is recommended:

```md
---
title: Page title
description: One-line summary.
---
```

Optional sidebar controls:

```md
---
title: System design
sidebar:
  order: 1
  label: Custom label
---
```

Do not use `template: splash` except on the homepage. Start the body with a short intro paragraph (not a duplicate `#` of the title — Starlight already renders `title`).

## Markdown

- Headings: `##` / `###` (page title comes from frontmatter).
- **bold**, _italic_, ~~strikethrough~~.
- Lists, quotes, and normal GFM tables are fine.
- Math (KaTeX): inline `$E=mc^2$`, block `$$ ... $$`.
- Images: standard markdown `![alt](…)` (image zoom is enabled).
- GitHub profile links `https://github.com/<user>` become avatar badges automatically. Repo URLs stay normal links.
- Do **not** enable raw HTML. Do **not** use an `html` fence to render markup.

## Asides (callouts)

Starlight:

```md
:::tip
Tip body.
:::

:::note[Named note]
Custom title.
:::

:::caution
Caution body.
:::
```

Site-specific (`starlight-markdown-blocks`):

```md
:::success
Advantages (`:::success`).
:::

:::warn
Disadvantages (`:::warn`).
:::

:::info
Info (`:::info`).
:::
```

## Diagrams (Kroki)

Fence with the **diagram language**. The site sends these to Kroki at build time. Prefer a dedicated language over wrapping everything in `mermaid` when a better type exists.

Also valid: `kroki type=plantuml` (or any alias below).

Live HTML/SVG (not Kroki): `` ```renderhtml ``. A normal `` ```html `` fence stays highlighted **source**.

Supported fence aliases on this site: `actdiag`, `blockdiag`, `bpmn`, `bytefield`, `c4` / `c4plantuml`, `d2`, `dbml`, `diagramsnet`, `ditaa`, `dot` / `graphviz`, `erd`, `excalidraw`, `goat`, `mermaid`, `nomnoml`, `nwdiag`, `packetdiag`, `pikchr`, `plantuml`, `rackdiag`, `seqdiag`, `structurizr`, `svgbob`, `symbolator`, `tikz`, `umlet`, `vega`, `vegalite`, `wavedrom`, `wireviz`.

### UML

| Diagram | Fence |
|---------|--------|
| Block diagram | `blockdiag` |
| Sequence diagram | `plantuml`, `mermaid`, `seqdiag` |
| Activity diagram | `plantuml`, `mermaid` |
| Network diagram | `nwdiag` |
| Use case diagram | `plantuml` |
| Class diagram | `plantuml`, `mermaid` |
| State diagram | `plantuml`, `mermaid` |
| Object diagram | `plantuml` |
| Deployment diagram | `plantuml` |
| Timing diagram | `plantuml`, `wavedrom` |
| Entity relationship | `erd`, `plantuml`, `mermaid` |

### C4

| Diagram | Fence |
|---------|--------|
| C4 context / container / component | `c4` or `c4plantuml` |
| Software architecture (Structurizr DSL) | `structurizr` |
| System landscape / context / container / component / dynamic / deployment | `structurizr` |

### Other diagrams

| Diagram | Fence |
|---------|--------|
| Object-oriented graph | `graphviz` / `dot`, `d2` |
| Work breakdown structure | `plantuml` |
| Mind map | `plantuml`, `mermaid` |
| Gantt | `mermaid`, `plantuml` |
| Ditaa | `ditaa` |
| Packet diagram | `packetdiag` |
| Rack diagram | `rackdiag` |
| Digital timing (waveform) | `wavedrom` |
| BPMN | `bpmn` |
| Bytefield | `bytefield` |
| HDL component | `symbolator` |
| Excalidraw | `excalidraw` |
| diagrams.net (Draw.io XML) | `diagramsnet` |
| WireViz | `wireviz` |
| GoAT (ASCII) | `goat` |
| Nomnoml / Umlet / Svgbob / Pikchr / TikZ / DBML | matching fence name |

### Visualization (Vega / Vega-Lite)

| Chart | Fence |
|-------|--------|
| Bar, line, area, circular, scatter | `vegalite` or `vega` |
| Distributions, maps, trees, networks | `vegalite` or `vega` |
| Heatmaps, word clouds, beeswarm | `vegalite` or `vega` |

Draw.io: paste uncompressed XML in a `diagramsnet` fence (see `/guides/example/`).

## Tabbed markdown (`group-container`)

For **any** markdown (tables, lists, prose), not just code. **Outer fences use more colons than inner ones.**

```md
:::::group-container

::::group-item[Alpha]{active}

Alpha tab body.

::::

::::group-item[Beta]

Beta tab body.

::::

:::::
```

`{active}` marks the default tab (first item if omitted). Real usage: `src/content/docs/guides/company-apply.md`.

## Interactive tables (`data-table`)

Wrap a GFM table:

```md
:::data-table

| Company | Category |
|---------|----------|
| [Acme](https://example.com) | Product |

:::
```

Attributes: `:::data-table{perPage=50}` · `searchable=false` · `sortable=false` · `paging=false`. Default `perPage` is 25.

Inside content tabs, keep enough colons (`:::::group-container` → `::::group-item` → `:::data-table`).

## Code (Expressive Code)

Meta goes on the opening fence after the language.

Tabbed **code** (not markdown tabs): wrap fences in `:::group` or `:::code-group`. Tab label = `title="file.ts"` or bracket meta `` ```js [abc.js] ``.

| Meta | Effect |
|------|--------|
| `title="file.ts"` | Filename / tab title |
| `frame="terminal"` | Terminal frame |
| `showLineNumbers` / `=false` | Line numbers (on by default for `js,ts,html,java,python`) |
| `startLineNumber=N` | Start numbering at N |
| `{2-3}` or `mark={…}` | Neutral highlight |
| `ins={…}` / `del={…}` | Added / removed lines |
| `ins={"label":4-5}` | Labeled insert/delete |
| `mark="TODO"` | Inline phrase highlight |
| `collapse={1-4,11-13}` | Collapsible ranges |
| `wrap` | Soft-wrap long lines |
| language `diff` | `+` / `-` prefixes |
| language `renderhtml` | **Render** HTML/SVG |
| language `html` | Highlighted HTML **source** |

## Nesting rule

Container directives close at the first matching fence of the same length. Outer = more colons:

```md
:::::outer
::::mid
:::inner
…
:::
::::
:::::
```

## Do not

- Uppercase in file or folder names.
- Link to `….md` URLs (they 404).
- Render HTML with an `html` fence or raw HTML.
- Use fewer colons on an outer `:::` than on nested directives.
- Invent asides, diagram fences, or Expressive Code meta this site does not implement.
- Restyle or rewrite unrelated pages.
