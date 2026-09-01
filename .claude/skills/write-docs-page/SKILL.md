---
name: write-docs-page
description: Write or edit Starlight docs on this site to match src/content/docs/guides/example.md and neighboring pages. Use when adding or changing markdown in src/content/docs, creating a guide, or the user asks for a new docs page.
---

# Write a docs page

Before writing, **read** `src/content/docs/guides/example.md` and one nearby page in the same folder. Match their frontmatter, heading style, asides, and fences. Do not invent new markdown syntax.

## File

Create `src/content/docs/<section>/<slug>.md` (existing sections: `guides`, `coding`, `high-level-design`, `low-level-design`, `connect`). Frontmatter:

```md
---
title: Page title
description: One-line summary.
---
```

Do not add pages outside `src/content/docs/`. A new top-level folder also needs a sidebar `items: [{ autogenerate: { directory: "…" } }]` in `astro.config.mjs`.

## Structure (from example.md)

1. Short intro paragraph after frontmatter.
2. `##` / `###` headings. Bold / italic / strikethrough as in example.md.
3. Asides: `:::tip`, `:::note[Title]`, plus site blocks `:::success`, `:::warn`, `:::info`.
4. Diagrams:
   - Kroki: fence with the language (`d2`, `plantuml`, `mermaid`, `graphviz`, `diagramsnet`, …).
   - Live HTML/SVG: `` ```renderhtml ``. Normal `` ```html `` stays highlighted **source**.
5. Tabbed markdown: `:::::group-container` + `::::group-item[Title]{active}`. Outer fences use **more colons** than inner ones. Real usage: `src/content/docs/guides/company-apply.md`.
6. Tables: wrap a markdown table in `:::data-table` (optional `{perPage=50}`, `searchable=false`, …).
7. Code: Expressive Code meta on the opening fence. Tabbed code: `:::group` around fences with `title="…"`.

## Cheat sheet

| Need | Syntax |
|------|--------|
| HTML source | `` ```html `` |
| Rendered HTML/SVG | `` ```renderhtml `` |
| Kroki | `` ```plantuml `` / `` ```d2 `` / `` ```mermaid `` / … |
| Tabbed code | `:::group` |
| Tabbed content | `:::::group-container` + `::::group-item[Title]` |
| Sortable table | `:::data-table` |
| Line highlight | `{2-3}` / `mark={…}` / `ins={…}` / `del={…}` |
| Line numbers | `showLineNumbers` / `showLineNumbers=false` |
| Collapse / wrap | `collapse={1-4}` / `wrap` |

## Do not

- Render HTML with an `html` fence or by enabling global raw HTML.
- Use fewer colons on an outer `:::` than on nested directives.
- Restyle or rewrite unrelated pages.
