---
title: 14 Css Overview
---

# Chrome DevTools — CSS Overview Panel

---

## What the CSS Overview Panel Is

The CSS Overview panel is a **one-shot audit tool** built into Chrome DevTools that takes a complete snapshot of every style rule, color, font, media query, and unused declaration present on the currently loaded page. Unlike the Styles pane (which shows styles for a single selected element) or the Coverage tool (which tracks line-level usage during interaction), CSS Overview scans the entire document at capture time and produces a structured report across five categories.

Think of it as a static "X-ray" of your stylesheet health:

| Category | What it answers |
|---|---|
| Overview Summary | How many elements, stylesheets, and inline styles exist? |
| Colors | Which colors are used? Are any combinations failing contrast? |
| Font Info | Which typefaces, sizes, weights, and line heights appear? |
| Unused Declarations | Which CSS properties are declared but never applied? |
| Media Queries | Which breakpoints and feature queries exist across all sheets? |

CSS Overview is especially valuable before a refactor, during a design system audit, or when preparing an accessibility report — situations where you need a high-level inventory rather than element-by-element investigation.

---

## How to Open the CSS Overview Panel

### Method 1 — More Tools menu (most reliable)

1. Open DevTools with `F12` / `Cmd+Option+I` / `Ctrl+Shift+I`.
2. Click the **vertical ellipsis** (`...`) in the DevTools toolbar (top-right).
3. Hover **More tools**.
4. Click **CSS Overview**.

The panel opens as a new tab inside DevTools.

### Method 2 — Command Menu

1. Open DevTools.
2. Press `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux).
3. Type `CSS Overview` and select **Show CSS Overview**.

### Method 3 — Persistent tab (after first open)

Once opened, the CSS Overview tab persists in the DevTools tab bar for the remainder of the DevTools session. You can click directly on it next time without going through the menu.

---

## UI Layout

The panel has two distinct states: the **welcome screen** (before capture) and the **report view** (after capture).

### Welcome screen

```
+--------------------------------------------------------------+
|  DevTools  [Elements] [Console] [Sources] ... [CSS Overview] |
+--------------------------------------------------------------+
|                                                              |
|   CSS Overview                                               |
|                                                              |
|   Take a snapshot of your page's CSS to identify potential   |
|   CSS improvements.                                          |
|                                                              |
|            [ Capture overview ]                              |
|                                                              |
+--------------------------------------------------------------+
```

### Report view (after capture)

```
+---------------------------------------------------------------+
| CSS Overview                          [ Capture overview ]    |
+---------------------------+-----------------------------------+
|  NAVIGATION SIDEBAR       |  DETAIL PANE                      |
|                           |                                   |
|  > Overview summary       |  (content of selected section)    |
|  > Colors                 |                                   |
|  > Font info              |                                   |
|  > Unused declarations    |                                   |
|  > Media queries          |                                   |
|                           |                                   |
+---------------------------+-----------------------------------+
```

The left sidebar is a fixed navigation list. Clicking any item replaces the right pane with that section's data. The **Capture overview** button in the top-right re-runs the audit without closing the current results — useful for comparing before/after a live edit.

---

## Running a CSS Overview Capture

### What triggers a capture

Clicking **Capture overview** causes DevTools to:

1. Enumerate every `<link rel="stylesheet">` and `<style>` element in the document.
2. Parse all rules from `document.styleSheets` — including cross-origin sheets that have CORS headers, but excluding blocked sheets (see Limitations).
3. Walk the entire DOM (`document.querySelectorAll('*')`) and resolve computed styles for each element.
4. Cross-reference declared properties against computed/resolved values to identify unused declarations.
5. Collect all `@media` rules across every stylesheet.
6. Snapshot all color values (foreground and background) and compute contrast ratios for text nodes.

### What is analyzed

| Analyzed | Not analyzed |
|---|---|
| External stylesheets with CORS headers | Cross-origin sheets without CORS headers |
| Inline `<style>` blocks | Styles injected after capture (e.g., lazy-loaded CSS) |
| `style=""` inline attributes | Styles from Shadow DOM (not pierced) |
| CSS custom properties (as values) | JavaScript-set styles that haven't been applied yet |
| `@media`, `@supports`, `@layer` rules | CSS Houdini Paint Worklet styles |

### Capture timing matters

CSS Overview captures the page state at the moment you click the button. If your page dynamically adds classes (e.g., after a user interaction), those styles may not appear in the unused declarations list even if they are declared in a stylesheet. Always capture after fully loading the page and, if possible, after triggering the most common UI states.

---

## The Five Report Sections

---

### 1. Overview Summary

The summary tab is the landing view immediately after capture. It presents a row of counters:

```
+-------------------------------------------------------+
|  Overview summary                                     |
|                                                       |
|  Elements               1,204                         |
|  Stylesheets                8                         |
|  Inline style elements      3                         |
|  External stylesheets        5                         |
|  Type selectors            42                         |
|  ID selectors               7                         |
|  Class selectors          318                         |
|  Universal selectors         2                         |
|  Attribute selectors        11                         |
|  Non-simple selectors       89                         |
+-------------------------------------------------------+
```

**What each counter means:**

| Counter | Meaning | Red flag threshold |
|---|---|---|
| Elements | Total DOM nodes captured | Very high counts slow style recalculation |
| Stylesheets | Total stylesheet objects (inline + external) | More than ~10-15 warrants consolidation |
| Inline style elements | `<style>` blocks in the HTML | Non-zero in a component app often means un-extracted CSS-in-JS |
| External stylesheets | `<link rel="stylesheet">` count | Each is a render-blocking request |
| ID selectors | Rules using `#id` | Any non-zero count in a component system is a specificity smell |
| Non-simple selectors | Selectors with more than one component | High counts → specificity wars |

**Actionable takeaway:** Use the summary to set a baseline before a refactor and compare after. If external stylesheets drop from 8 to 3 after bundling, the summary proves it.

---

### 2. Colors

The Colors section displays every unique color value found across all stylesheets, organized by type:

- **Background colors** — used as `background`, `background-color`
- **Text colors** — used as `color`
- **Fill colors** — used as SVG `fill`
- **Border colors** — used as `border-color`, `border-top-color`, etc.

Each color appears as a swatch with its CSS value underneath.

#### Contrast ratio warnings

Text/background color pairs that fall below WCAG thresholds are flagged with a warning indicator directly on the swatch:

| WCAG Level | Minimum ratio (normal text) | Minimum ratio (large text >= 18pt or 14pt bold) |
|---|---|---|
| AA | 4.5 : 1 | 3 : 1 |
| AAA | 7 : 1 | 4.5 : 1 |

A warning badge appears on any color swatch that participates in a failing pair. Hovering the badge shows the exact computed ratio and which element triggered it.

#### Clicking a color swatch

Clicking any color swatch switches the detail pane to show a list of every element that uses that color. Each row is an interactive link — clicking a row:

1. Switches to the **Elements** panel.
2. Selects that DOM node.
3. Scrolls the page viewport to reveal the element.

This makes it trivial to audit "which elements are using this off-brand hex?" without writing a single line of JavaScript.

---

### 3. Font Info

The Font Info section builds a complete inventory of every font variation in use. It groups entries by **font family**, and within each family lists every distinct combination of:

- Font size
- Font weight
- Line height

Example layout:

```
Inter
  └── 12px / 400 / 1.5      (used by 34 elements)
  └── 14px / 400 / 1.5      (used by 128 elements)
  └── 14px / 600 / 1.4      (used by 22 elements)
  └── 16px / 400 / 1.6      (used by 19 elements)
  └── 24px / 700 / 1.2      (used by 8 elements)
  └── 32px / 700 / 1.1      (used by 3 elements)

Georgia
  └── 16px / 400 / 1.7      (used by 2 elements)
```

#### Clicking a font variation

Clicking any font variation row (e.g., "14px / 400 / 1.5") shows the list of matching elements in the detail pane — same drill-down behavior as the Colors section.

#### Identifying font inconsistencies

A well-maintained design system typically has:
- 1–2 font families
- A defined scale of sizes (e.g., 12, 14, 16, 20, 24, 32, 48px)
- 2–4 weights
- 1–2 line heights

If the Font Info panel shows 47 distinct size values, 6 font families, or weights like `450` and `550`, those are signals that typography has drifted from a spec and needs consolidation.

---

### 4. Unused Declarations

This section lists CSS property declarations that were found in stylesheets but that did not resolve to any currently rendered element at capture time.

#### Sample output

```
.hero-cta-old { display: flex }          -- no matching element
.modal--v2 { opacity: 0 }               -- no matching element
.sidebar .widget-title { font-size: 11px } -- no matching element
@media print { body { font-size: 10pt } } -- no matching element
```

Each row shows the full selector, the property, and the value.

#### What counts as "unused"

A declaration is flagged as unused when:

1. The CSS selector matches zero elements in the current DOM at the time of capture.
2. OR the selector matches elements but the property is overridden by a higher-specificity rule at every matched element.

#### Common sources of unused declarations

| Source | Example | Action |
|---|---|---|
| Dead code / removed components | `.carousel--legacy { ... }` | Delete if component is gone |
| Responsive styles not triggered | `@media (max-width: 480px) { ... }` at desktop width | Capture again at mobile viewport |
| Print stylesheets | `@media print { ... }` | Evaluate: still needed? |
| A/B test remnants | `.cta-variant-b { ... }` | Delete if experiment concluded |
| JavaScript-controlled classes | `.is-active { ... }` | Requires interaction before capture; see Limitations |

#### Limitations — dynamic classes

CSS Overview takes a single snapshot. If a class like `.dropdown--open` only exists on an element when a dropdown is expanded, and the dropdown was closed at capture time, the rule will appear as "unused" even though it is actively used. Always:

1. Expand all interactive states before capturing for the most accurate unused list.
2. Cross-reference findings with the **Coverage** tool (see section below) for interaction-based usage.

---

### 5. Media Queries

The Media Queries section lists every `@media` rule found across all stylesheets, grouped by type:

- **max-width** breakpoints
- **min-width** breakpoints
- **print** queries
- **prefers-color-scheme**
- **prefers-reduced-motion**
- **orientation**
- **hover / pointer** feature queries
- Custom / other

Each entry shows the full query string and how many declarations are inside it.

#### Example

```
Media Queries (23 found)

  max-width
    @media (max-width: 1280px)   --  42 declarations
    @media (max-width: 1024px)   --  17 declarations
    @media (max-width: 768px)    --  89 declarations
    @media (max-width: 480px)    --  61 declarations
    @media (max-width: 375px)    --   8 declarations

  min-width
    @media (min-width: 768px)    --  34 declarations
    @media (min-width: 1024px)   --  22 declarations

  prefers-color-scheme
    @media (prefers-color-scheme: dark)  --  118 declarations

  prefers-reduced-motion
    @media (prefers-reduced-motion: reduce)  --  12 declarations

  print
    @media print                 --  28 declarations
```

#### Why this view is valuable

Seeing all breakpoints in one list instantly reveals:

- Inconsistent breakpoint values (e.g., `768px` and `769px` both appear — a common copy-paste bug).
- Missing accessibility queries (`prefers-reduced-motion` absent on an animation-heavy page).
- Redundant breakpoints that could be consolidated.
- Whether mobile-first (`min-width`) or desktop-first (`max-width`) patterns are mixed.

---

## Colors Section — Deep Dive

### Accessibility: finding low-contrast text

The primary accessibility use case for CSS Overview is identifying text/background pairs that fail WCAG contrast requirements before a formal accessibility audit.

**Workflow:**

1. Load the page fully (all fonts, images, lazy content).
2. Open CSS Overview and capture.
3. Navigate to **Colors**.
4. Look for swatches with a warning indicator (a small icon or badge).
5. Click the warning to see which element pairs triggered it.
6. Note the exact ratio (e.g., 2.8:1) and the elements involved.
7. Switch to **Elements** panel, select the element, and adjust `color` or `background-color` in the Styles pane until the ratio meets 4.5:1.

**Contrast ratio reference:**

```
Ratio    WCAG AA normal text    WCAG AA large text    WCAG AAA
< 3.0:1  FAIL                   FAIL                  FAIL
3.0:1    FAIL                   PASS                  FAIL
4.5:1    PASS                   PASS                  FAIL
7.0:1    PASS                   PASS                  PASS
```

### Color inventory — spotting off-brand colors

Every serious design system defines a palette (often as CSS custom properties or design tokens). CSS Overview lets you compare the actual colors in use against that palette:

1. Capture the overview.
2. Navigate to **Colors** > **Text colors**.
3. Look for hex values that are not in your design token set.

Example: your brand allows only `#1A1A2E`, `#16213E`, `#0F3460`, `#E94560` as text colors. If the Colors panel shows `#333333`, `#444`, and `#1b1b1b` scattered around, those are off-brand drifts.

**Pro tip:** Copy the full color list by right-clicking a swatch area — some DevTools versions allow copying values. Alternatively, run this in the Console *after* a capture to dump all colors to clipboard-friendly text:

```js
// Not a DevTools API — use the panel's visual list for accuracy
// But you can cross-check with:
[...document.querySelectorAll('*')]
  .map(el => getComputedStyle(el).color)
  .filter((v, i, a) => a.indexOf(v) === i)
  .sort()
  .forEach(c => console.log(c));
```

### Clicking a color to trace element usage

This drill-down feature turns CSS Overview from a passive audit into an interactive investigation tool:

1. In the **Colors** panel, click any color swatch (e.g., a suspicious `rgb(255, 0, 128)`).
2. The detail pane updates to a list of every element using that color.
3. Click any element row to jump directly to it in the **Elements** panel.
4. The page viewport scrolls to reveal the element.
5. The **Styles** pane on the right shows exactly which rule is setting that color.

This is far faster than running `document.querySelectorAll('[style*="color"]')` and manually inspecting each result.

### Identifying color inconsistencies

Signs of color inconsistency in the Colors panel:

| Symptom | Likely cause |
|---|---|
| Multiple near-identical grays (`#333`, `#333333`, `rgb(51,51,51)`) | Different notation for the same color — consolidate to one token |
| Both `rgba(0,0,0,0.87)` and `#212121` in use | Mixed material design / custom styles |
| 20+ distinct blue values | No design token enforcement; every developer guessed |
| Colors from a third-party component library appearing | Vendor CSS leaking into your token set |

---

## Font Section — Deep Dive

### Font inventory methodology

Before a typography refactor, use the Font Info section to build an exact census:

1. Capture the overview on your most representative page.
2. Capture again on 2–3 other key pages (product, checkout, blog post).
3. Compare the font family lists across captures (re-capture after navigating to each page).
4. Document every unique font family found — this becomes your "fonts in use" list.

### Clicking to see which elements use a specific font/size/weight

1. In **Font info**, click a font family name to expand it.
2. Click a specific variation row (e.g., `14px / 400 / 1.5`).
3. The right pane shows every element using that exact combination.
4. Click an element row to select it in **Elements**.

This is the fastest way to answer "which elements are using 13px text?" — a common question when auditing for minimum font size accessibility (WCAG recommends avoiding text below 9px, but many teams enforce a higher floor like 12px or 14px).

### Identifying font inconsistencies — practical thresholds

| Variation type | Healthy count | Warning threshold | Action |
|---|---|---|---|
| Font families | 1–2 | 4+ | Audit for accidental system-font fallbacks, vendor fonts |
| Distinct font sizes | 6–10 | 15+ | Map to a type scale, replace one-offs with nearest token |
| Distinct weights | 2–4 | 6+ | Check if weights are actually loading; some may be browser-synthesized |
| Distinct line heights | 2–4 | 8+ | Consolidate to a ratio-based scale (e.g., 1.2, 1.4, 1.6) |

### Catching synthesized fonts

When a weight like `font-weight: 800` is used but the font file for that weight was never loaded, the browser synthesizes bold by algorithmically thickening the letterforms. This looks noticeably different from a real weight. The Font Info panel shows you which weights are declared — cross-reference against your `@font-face` rules or CDN font load parameters to confirm all declared weights are actually loaded.

---

## Unused Declarations — Deep Dive

### Step-by-step audit workflow

```
1. Deploy / load the page in a production-like state
2. Trigger common interactions (open modals, expand accordions, activate hover states)
3. Open CSS Overview -> Capture overview
4. Navigate to Unused declarations
5. Export / screenshot the list
6. For each declaration, ask:
   a. Is this selector used anywhere in the app? (Search codebase)
   b. Is it only active in a state not triggered at capture? (Dynamic class)
   c. Is it a responsive rule that needs a different viewport? (Capture at that viewport)
   d. Is it vendor-prefixed and redundant? (e.g., -webkit- with unprefixed version)
7. For confirmed dead code, delete from the source stylesheet
8. Re-capture and verify the declaration no longer appears
```

### Vendor prefix bloat

A common source of "unused" declarations is obsolete vendor prefixes:

```css
/* The -webkit- and -moz- versions below will appear as unused on modern Chrome */
.box {
  -webkit-border-radius: 8px;  /* unused — Chrome doesn't need this */
  -moz-border-radius: 8px;     /* unused — Firefox dropped this in v4 */
  border-radius: 8px;          /* used */
}

.flex-container {
  display: -webkit-box;        /* unused */
  display: -ms-flexbox;        /* unused */
  display: flex;               /* used */
}
```

Unused declarations from vendor prefixes are safe to remove if your browser support matrix no longer includes the affected browsers. Check [caniuse.com](https://caniuse.com) for the property's unprefixed support threshold.

### Responsive declarations — capture at multiple viewports

CSS Overview is viewport-aware: rules inside `@media (max-width: 768px)` will appear unused when captured at 1440px. To fully audit responsive styles:

1. Open Chrome DevTools.
2. Toggle Device Toolbar (`Cmd+Shift+M` / `Ctrl+Shift+M`).
3. Set viewport to 375px (mobile).
4. Reload the page.
5. Open CSS Overview and capture.
6. Compare the Unused Declarations list with the desktop capture.
7. Rules that are "used" at mobile but "unused" at desktop are correctly responsive — do not delete them.

### Distinguishing dead code from dynamic classes

| Scenario | Appears unused? | Is it safe to delete? |
|---|---|---|
| `.hero-cta-v1` — old component removed from HTML | Yes | Yes — confirm in codebase search |
| `.modal--open` — class added by JS when modal opens | Yes (if modal closed at capture) | No — verify usage in JS |
| `.theme--dark` — class toggled by user preference | Yes (if not active at capture) | No — trigger the state and recapture |
| `@media print { ... }` — print styles | Yes (screen capture) | Only if print support is explicitly dropped |
| `.sr-only` — screen-reader-only visually hidden text | Maybe (zero dimensions) | No — critical for accessibility |

---

## Media Queries Overview — Deep Dive

### Spotting breakpoint inconsistencies

A clean responsive system has a small, consistent set of breakpoints, usually defined as variables or tokens. CSS Overview's Media Queries section makes inconsistencies obvious:

**Problematic pattern:**
```
@media (max-width: 768px)
@media (max-width: 767px)
@media (max-width: 769px)
@media (min-width: 768px)
@media (min-width: 769px)
```

These five rules all target roughly the same breakpoint with off-by-one values, which creates unpredictable behavior in the 767–769px range. A single source-of-truth breakpoint variable eliminates this.

**Healthy pattern:**
```scss
// Single source of truth
$bp-md: 768px;

// Used consistently
@media (max-width: $bp-md) { ... }
@media (min-width: #{$bp-md + 1px}) { ... }
```

### Checking for accessibility media queries

CSS Overview makes it easy to verify that your stylesheet respects user preferences:

| Query | What it means | Check with CSS Overview |
|---|---|---|
| `prefers-reduced-motion` | User has requested less animation | Should appear if you have any transitions/animations |
| `prefers-color-scheme: dark` | User prefers dark UI | Should appear if you support dark mode |
| `prefers-contrast: high` | User needs higher contrast | Bonus accessibility support |
| `forced-colors` | Windows High Contrast mode | Advanced accessibility support |

If your page has animations but `prefers-reduced-motion` does not appear in the Media Queries list, that is an accessibility gap.

### Mobile-first vs desktop-first audit

Count the `min-width` vs `max-width` entries:

- Mostly `min-width` → mobile-first (generally preferred, better cascade performance)
- Mostly `max-width` → desktop-first (older pattern, more specificity overrides needed)
- Mix of both → fragmented stylesheet from multiple eras of development

---

## Practical Use Cases

### Use case 1: CSS audit before a refactor

**Scenario:** You are about to consolidate three legacy CSS files into a new design-system-backed stylesheet.

**Steps:**
1. Capture CSS Overview on the production site.
2. Record baseline numbers from the Summary tab (elements, stylesheets, selectors).
3. Export/screenshot the Colors and Font Info sections.
4. Note all external stylesheets from the Summary (these should reduce after refactor).
5. Complete the refactor.
6. Capture again on staging.
7. Compare: fewer stylesheets, fewer color values, fewer font variations, fewer unused declarations.

The before/after comparison is your objective proof that the refactor improved CSS health.

---

### Use case 2: Design system enforcement

**Scenario:** Your design system defines 12 colors and 3 font weights. You want to enforce that no page uses colors or weights outside this set.

**Steps:**
1. Capture CSS Overview.
2. Open the Colors section.
3. Look for any color not in your approved palette.
4. Click each off-palette color to identify the element.
5. Navigate to source and replace with the correct design token.
6. Repeat for Font Info → check weights for anything outside 400, 600, 700.

**Automation note:** For continuous enforcement, this manual process can be augmented with a CSS linting rule (e.g., Stylelint's `declaration-property-value-allowed-list`) that rejects non-token values at commit time.

---

### Use case 3: Accessibility audit — finding low-contrast text

**Scenario:** You need to produce a WCAG AA accessibility compliance report for your marketing site.

**Steps:**
1. Load the page with all content visible (no spinner, no lazy states).
2. Capture CSS Overview.
3. Navigate to Colors.
4. Identify all swatches with contrast warnings.
5. For each warning:
   - Note the color pair.
   - Note the elements affected.
   - Calculate the required color adjustment (darken foreground or lighten background).
6. Apply fixes in DevTools Styles pane, screenshot the corrected ratio.
7. Write fixes to the source stylesheet.
8. Re-capture to verify warnings are resolved.

This produces a documented audit trail: original colors, failing ratios, corrected colors, passing ratios.

---

### Use case 4: Identifying CSS bloat

**Scenario:** Your CSS bundle is 420 KB uncompressed. You want to understand what is in it.

**Steps:**
1. Capture CSS Overview.
2. Check the Summary:
   - How many external stylesheets? Each one is overhead.
   - How many selectors? High counts suggest un-purged utility class frameworks (e.g., full Tailwind without PurgeCSS).
3. Check Unused Declarations: a very long list indicates large amounts of dead CSS.
4. Check Media Queries: many redundant breakpoints suggest duplicated responsive code.
5. Use findings to prioritize: remove dead code first (Unused Declarations), then consolidate breakpoints, then remove vendor prefix bloat.

---

## Combining CSS Overview with the Coverage Tool

CSS Overview and the Coverage tool answer different but complementary questions:

| Tool | Question answered | Granularity | Interaction-aware? |
|---|---|---|---|
| CSS Overview | Which declarations match zero elements? | Declaration level | No (snapshot) |
| Coverage | Which CSS lines were applied during a session? | Line level | Yes (records during use) |

### When to use which

- Use **CSS Overview Unused Declarations** for a quick structural audit at page load — it finds orphaned selectors fast.
- Use **Coverage** when you need to account for dynamic states, hover effects, and JavaScript-driven classes — record a full user session.
- Use **both together** for comprehensive analysis: anything flagged by CSS Overview AND uncovered by Coverage is almost certainly dead code.

### Combined workflow

```
1. Open CSS Overview
2. Capture → note Unused Declarations list (call this set A)

3. Open Coverage (DevTools > More tools > Coverage)
4. Click the record button
5. Perform a realistic user session:
   - Navigate all major pages
   - Open all modals and drawers
   - Activate all hover and focus states
   - Switch themes if applicable
6. Stop recording
7. Review Coverage results — lines shown in red are never-executed CSS (call this set B)

8. Intersection of A and B = high-confidence dead CSS
   - Safe to remove without thorough manual review
9. Items in B but not A = CSS that is declared but only triggered by interaction
   - Review carefully before removing
```

### Reading Coverage results alongside CSS Overview

In the Coverage panel, each stylesheet row shows:

```
main.css     124 KB     34% used     82 KB unused
vendor.css    88 KB     12% used     77 KB unused
```

If `vendor.css` is 88% unused, that is a strong signal to either:
- Tree-shake the vendor library (e.g., enable Tailwind's purge/content config).
- Replace the vendor library with hand-written styles covering only the used subset.
- Load it conditionally per page rather than globally.

---

## Advanced: Using CSS Overview Findings to Inform a Design Token Migration

### What is a design token migration?

A design token migration replaces hardcoded CSS values (colors, sizes, fonts) with semantic variable references:

```css
/* Before migration — hardcoded values */
.button-primary {
  background-color: #0F3460;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
}

/* After migration — token references */
.button-primary {
  background-color: var(--color-brand-primary);
  color: var(--color-text-on-brand);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
}
```

### Phase 1: Discovery using CSS Overview

Before writing a single token, use CSS Overview to build an exhaustive inventory.

**Color token discovery:**

1. Capture CSS Overview on all representative pages.
2. Open Colors → Background colors. List every distinct value.
3. Open Colors → Text colors. List every distinct value.
4. Open Colors → Border colors. List every distinct value.
5. Group similar values (e.g., 8 variants of blue → 2–3 semantic token slots).

**Font token discovery:**

1. Open Font info.
2. List every distinct font size → these become your `--font-size-*` scale.
3. List every distinct weight → these become `--font-weight-*` tokens.
4. List every distinct line height → these become `--line-height-*` tokens.
5. Identify the most-used combinations → these become composite typography tokens.

**Sample token map derived from CSS Overview:**

| Observed value | Frequency | Proposed token |
|---|---|---|
| `#0F3460` | 42 uses | `--color-brand-primary` |
| `#E94560` | 18 uses | `--color-brand-accent` |
| `#FFFFFF` | 93 uses | `--color-surface-base` |
| `#F5F5F5` | 27 uses | `--color-surface-subtle` |
| `#1A1A2E` | 61 uses | `--color-text-primary` |
| `14px` | 128 uses | `--font-size-sm` |
| `16px` | 89 uses | `--font-size-base` |
| `24px` | 31 uses | `--font-size-lg` |
| `400` | 204 uses | `--font-weight-regular` |
| `600` | 67 uses | `--font-weight-semibold` |

### Phase 2: Consolidation decisions

CSS Overview's frequency counts guide consolidation:

- Colors appearing only 1–2 times are candidates for elimination (replace with nearest token).
- Font sizes appearing only 1–3 times are one-off deviations to eliminate.
- Weights not in your font file's supported set are synthesized and should be standardized.

### Phase 3: Migration and verification

After replacing hardcoded values with tokens:

1. Re-capture CSS Overview.
2. Colors section: the inventory should now show only a small set of `var(--...)` based values OR the token values themselves used consistently.
3. Font info: the variation count should drop dramatically.
4. Unused Declarations: if you removed one-off styles during the migration, this list should shrink.
5. The Summary's selector count may decrease if you consolidated duplicate rules.

### Phase 4: Ongoing governance

CSS Overview is a point-in-time tool, but the findings drive permanent process improvements:

```
CSS Overview finding          →    Process response
─────────────────────────────────────────────────────────────
Off-brand colors found        →    Stylelint: color-no-invalid-hex + allowed-list
Too many font sizes           →    Stylelint: declaration-property-value-allowed-list
Unused declarations growing   →    PurgeCSS / Tailwind content config + CI check
Breakpoint inconsistencies    →    PostCSS custom media + single breakpoint file
Missing prefers-reduced-motion →    PR checklist item for animation authors
```

---

## Quick Reference Card

### Open CSS Overview
```
DevTools → ... (More tools) → CSS Overview
  OR
Cmd+Shift+P → "CSS Overview"
```

### Capture
```
Click "Capture overview" button (top-right of panel)
Re-capture at any time to refresh
```

### Section cheat sheet

| Section | Primary use | Click behavior |
|---|---|---|
| Overview summary | Baselines, stylesheet count | No drill-down |
| Colors | Contrast audit, off-brand colors | Click swatch → elements using it |
| Font info | Typography audit, scale enforcement | Click variation → elements using it |
| Unused declarations | Dead CSS identification | Click rule → Elements panel |
| Media queries | Breakpoint audit, a11y queries | No drill-down (list only) |

### What CSS Overview does NOT do
- It does not track changes over time (no historical data).
- It does not analyze cross-origin stylesheets without CORS headers.
- It does not reflect styles added after capture (dynamic JS injection).
- It does not pierce Shadow DOM.
- It does not replace the Coverage tool for interaction-driven CSS analysis.

---

## Summary

The CSS Overview panel is the fastest way to get a structural health report on the CSS of any web page. Its five sections address the four most common CSS maintenance problems: color inconsistency, typography drift, dead code, and breakpoint fragmentation. The contrast ratio warnings make it a practical first step in any accessibility audit. The drill-down from any color or font value directly to the element using it turns abstract inventory data into actionable investigation.

For teams managing a design system, running CSS Overview on a regular cadence (before each major release, or as part of a quarterly CSS audit) surfaces drift early — before it compounds into a months-long refactor. Combined with the Coverage tool and a linting setup derived from the token map it helps you build, CSS Overview becomes the foundation of a sustainable CSS quality process.

---

[← Web Devtools](/coding/web-devtools/)
