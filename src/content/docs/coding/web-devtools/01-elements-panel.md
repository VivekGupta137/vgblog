---
title: 01 Elements Panel
---

# Chrome DevTools: Elements Panel

A beginner-to-advanced reference for inspecting and manipulating the DOM and CSS live in the browser.

---

## What the Elements Panel Does

The Elements panel gives you a live, editable view of the page's Document Object Model (DOM) and all CSS applied to any node. Every change you make is reflected instantly in the browser viewport — without touching your source files. This makes it the fastest way to:

- Understand how a page is structured
- Debug layout and styling problems
- Prototype CSS changes before writing them in code
- Inspect accessibility attributes and ARIA roles
- Set breakpoints that pause JavaScript when the DOM changes
- Audit event listeners attached to any element

Changes made in the Elements panel are **not saved**. A page refresh discards everything. Use it for exploration and prototyping; copy what you want back into your editor.

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  DevTools Window                                                    │
│                                                                     │
│  Elements  Console  Sources  Network  Performance  ...              │
├──────────────────────────────┬──────────────────────────────────────┤
│                              │  Styles  Computed  Layout  ...       │
│  DOM Tree                    ├──────────────────────────────────────┤
│                              │  Filter                              │
│  ▼ <html lang="en">          │                                      │
│    ▼ <head>                  │  element.style { }                   │
│        <title>               │                                      │
│        <link rel="stylesheet">│  .card {                            │
│      </head>                 │    padding: 16px;   styles.css:42    │
│    ▼ <body>                  │    color: #333;     styles.css:43    │
│      ▼ <main class="page">   │  }                                   │
│        ▼ <section>           │                                      │
│          ▼ <div class="card">│  .container > div {                  │
│  ==>       <h2>Title</h2>    │    display: flex;   base.css:10     │
│            <p>Body…</p>      │  }                                   │
│          </div>              │                                      │
│        </section>            │  Inherited from <body>               │
│      </main>                 │    font-family: sans-serif;          │
│  </body>                     │                                      │
│                              ├──────────────────────────────────────┤
├──────────────────────────────┤  Box Model (Computed pane)           │
│  <html> <body> <main> <div>  │                                      │
│  (breadcrumb trail)          │  margin: 8px                        │
└──────────────────────────────┴──────────────────────────────────────┘
```

**Left panel** — the DOM tree. Clicking any node selects it and highlights it in the viewport.

**Right panel** — tabbed panes: Styles, Computed, Layout, Event Listeners, DOM Breakpoints, Properties, Accessibility.

**Bottom strip** — breadcrumb trail showing the ancestor chain of the currently selected node.

---

## Inspecting Elements

### Right-click > Inspect

The fastest way to reach any element: right-click it on the page and choose **Inspect**. DevTools opens (or focuses) and jumps straight to that node in the DOM tree.

### Hover highlighting

With DevTools open, click the cursor icon in the top-left toolbar (or press `Ctrl+Shift+C` / `Cmd+Shift+C` on Mac) to enter **inspect mode**. Move the mouse over the page; a colored overlay shows the element's box model:

| Color   | Region         |
|---------|----------------|
| Blue    | Content area   |
| Green   | Padding        |
| Orange  | Margin         |
| Yellow  | Border         |

Click any element to select it and exit inspect mode.

### Breadcrumb trail

At the very bottom of the Elements panel is a breadcrumb bar showing the full ancestor path from `<html>` down to the selected node, for example:

```
<html> › <body> › <main.page> › <section> › <div.card> › <h2>
```

Clicking any crumb jumps the DOM tree to that ancestor, which is handy for navigating up without collapsing the tree manually.

### $0 in the Console

Whatever node is currently selected in the Elements panel is automatically available as `$0` in the Console. `$1` is the previously selected node, `$2` the one before that, up to `$4`. This lets you run JavaScript against a specific element without writing a selector:

```js
$0.textContent = "Hello from the console";
$0.style.outline = "2px solid red";
getComputedStyle($0).fontSize;   // "16px"
```

---

## DOM Tree Navigation

### Expand and collapse

- Click the triangle next to a tag to expand or collapse its children.
- Press `Alt+click` (Mac: `Option+click`) on the triangle to expand **all** descendants at once — useful for deeply nested trees.

### Search within the DOM (`Ctrl+F` / `Cmd+F`)

Press `Ctrl+F` inside the DOM tree to open a search bar. You can search by:

- **Plain text** — matches tag names, attribute names, attribute values, and text content
- **CSS selector** — e.g., `.card > h2`
- **XPath** — e.g., `//div[@class="card"]`

Use the arrow buttons or `Enter` / `Shift+Enter` to cycle through matches.

### Keyboard navigation

Once the DOM tree is focused (click any node first):

| Key              | Action                                      |
|------------------|---------------------------------------------|
| Arrow Up/Down    | Move to previous/next node (same level)     |
| Arrow Right      | Expand node / move into first child         |
| Arrow Left       | Collapse node / move to parent              |
| Enter            | Toggle expand/collapse                      |
| F2               | Edit the selected node's tag in place       |
| Delete / Backspace | Delete the selected node                  |
| H                | Hide the node (adds `visibility: hidden`)   |

### Edit as HTML

Right-click any node and choose **Edit as HTML** (or press `F2` on a selected node) to open a raw-text editor for that entire subtree. You can rewrite tags, attributes, and content freely. Press `Ctrl+Enter` to commit.

```html
<!-- Before edit -->
<div class="card">
  <h2>Old Title</h2>
</div>

<!-- After editing: changed class and heading level -->
<article class="card card--featured">
  <h3>New Title</h3>
</article>
```

### Double-click to edit attributes

Double-click any attribute name or value directly in the DOM tree to edit it inline. Press `Tab` to advance to the next attribute, `Shift+Tab` to go back, and `Enter` or `Escape` to commit or cancel.

### Drag-and-drop nodes

Click and hold a node, then drag it to a new position in the tree. A blue insertion line shows where the node will land. This is a quick way to reorder siblings or reparent an element.

### Delete a node

Select a node and press `Delete` or `Backspace`. You can undo with `Ctrl+Z` / `Cmd+Z`.

### Hide a node (H key)

Press `H` on a selected node to toggle `visibility: hidden` on it. The element still occupies space in the layout (unlike `display: none`) but becomes invisible. This is useful for isolating visual stacking issues.

### Copy options

Right-click any node to access the **Copy** submenu:

| Option              | What you get                                                  |
|---------------------|---------------------------------------------------------------|
| Copy outerHTML      | The full HTML of the element and all its children             |
| Copy selector       | A short CSS selector, e.g., `#app > .card:nth-child(2)`       |
| Copy JS path        | A JavaScript expression, e.g., `document.querySelector(...)` |
| Copy styles         | All computed CSS declarations for the element                 |
| Copy XPath          | A short XPath, e.g., `//*[@id="app"]/div[2]`                  |
| Copy full XPath     | An absolute XPath from root, e.g., `/html/body/main/div[2]`   |

**JS path** is particularly useful: paste it straight into the Console to get a reference you can act on:

```js
// Copied JS path:
document.querySelector("#root > main > section:nth-child(1) > div.card")
```

---

## Styles Pane

The Styles pane lists every CSS rule that applies to the selected element, from most-specific to least-specific (top to bottom). Overridden declarations are shown with a strikethrough.

### Cascade order and specificity

Rules at the top of the list win. DevTools shows the source file and line number to the right of each rule so you can jump to the original source instantly.

```
element.style { }                    ← inline style, always wins

.card.active { ... }                 ← specificity: 0,2,0
  color: tomato;

.card { ... }                        ← specificity: 0,1,0
  ~~color: steelblue;~~              ← overridden, shown with strikethrough
  padding: 16px;

div { ... }                          ← specificity: 0,0,1
  ~~padding: 8px;~~

Inherited from <body>
  font-family: sans-serif;
```

### Inherited styles

Styles that flow down from ancestor elements (like `font-family`, `color`, `line-height`) appear in a collapsible **Inherited from `<tagname>`** section at the bottom of the Styles pane, rendered in gray. They apply to the element but are not directly set on it.

### Pseudo-class toggles

Click the `:hov` button in the Styles pane to pin pseudo-class states onto the element. This forces the browser to render the element as if that state is active, without you needing to trigger it:

| Pseudo-class      | When to use it                                               |
|-------------------|--------------------------------------------------------------|
| `:hover`          | Debug hover styles without holding the mouse perfectly still |
| `:focus`          | Inspect focus ring styling for keyboard accessibility        |
| `:active`         | Check pressed/active button styles                          |
| `:visited`        | Preview visited-link colors                                  |
| `:focus-within`   | Debug styles applied to a parent when a child is focused     |
| `:focus-visible`  | Inspect focus rings that only appear during keyboard nav      |

Multiple pseudo-classes can be active at the same time.

### Adding new CSS rules and properties

**Add a property to an existing rule:** Click anywhere in the whitespace inside a rule's braces. A text cursor appears; type the property name, press `Tab` to move to the value, type the value, and press `Enter`.

**Add a brand-new rule:** Click the `+` icon in the Styles pane toolbar. DevTools creates a new rule whose selector targets the currently selected element and places your cursor in it.

**Add an inline style:** Click inside the `element.style { }` block at the very top.

```css
/* Example: added via element.style block */
element.style {
  background: lightyellow;
  border: 1px dashed gray;
}
```

### Incrementing numeric values

With the cursor inside a numeric CSS value, use keyboard shortcuts to nudge the number:

| Key combination     | Change    |
|---------------------|-----------|
| Up / Down arrow     | +1 / -1   |
| Shift + Up/Down     | +10 / -10 |
| Alt + Up/Down       | +0.1 / -0.1 |
| Page Up / Page Down | +100 / -100 |

This works on any numeric value including unitless numbers, pixels, percentages, and decimals.

### Color picker

Click any color swatch in the Styles pane to open the color picker:

- **Top gradient** — drag to change hue and lightness/saturation
- **Hue slider** — change the base hue
- **Opacity slider** — change alpha
- **Color mode button** — cycles between HEX, RGB, HSL, and HWB representations
- **Eyedropper tool** — click anywhere on screen to sample a color from the page
- **Contrast ratio** — when the selected element contains text, the picker shows the contrast ratio between the text color and background color and indicates whether it passes WCAG AA (3:1 / 4.5:1) and AAA (7:1) thresholds

```
Color picker: HEX mode
┌──────────────────────┐
│   Saturation/Value   │
│         gradient     │
│             ●        │
├──────────────────────┤
│ ───────●──────────── │  Hue
├──────────────────────┤
│ ──────────────────●  │  Opacity
├──────────────────────┤
│ # 1a73e8   [HEX]     │
│ Contrast: 4.7 ✓ AA   │
│              ✗ AAA   │
└──────────────────────┘
```

---

## Computed Pane

The Computed pane shows the **final resolved value** of every CSS property after the cascade, inheritance, and browser defaults have all been applied. Unlike the Styles pane (which shows rules), the Computed pane shows what the element actually ends up with.

### Box Model diagram

At the top of the Computed pane is an interactive box model diagram:

```
┌──────────────────────────────────────────┐
│                 margin                   │
│    ┌──────────────────────────────┐      │
│    │            border            │      │
│    │   ┌──────────────────────┐   │      │
│    │   │       padding        │   │      │
│    │   │  ┌────────────────┐  │   │      │
│    │   │  │                │  │   │      │
│    │   │  │    content     │  │   │      │
│    │   │  │  320 × 48 px   │  │   │      │
│    │   │  │                │  │   │      │
│    │   │  └────────────────┘  │   │      │
│    │   │     16px  16px       │   │      │  ← padding top/bottom
│    │   └──────────────────────┘   │      │
│    │       1px   1px              │      │  ← border top/bottom
│    └──────────────────────────────┘      │
│           8px   8px                      │  ← margin top/bottom
└──────────────────────────────────────────┘
```

Each region (margin, border, padding, content) is clickable. Clicking a value lets you edit it live. The content dimensions display the rendered width × height in pixels.

### Filtering computed styles

Type in the filter box at the top of the Computed pane to narrow the list to matching property names. For example, typing `grid` shows only grid-related computed properties; `font` shows all font-related ones.

Enable the **Show all** checkbox to include properties that are set to their browser-default values (they are hidden by default to reduce noise).

### Tracing which rule set a property

Click the triangle next to any computed property to expand it. DevTools reveals every CSS rule that contributed a value for that property, in cascade order, with source file and line number. Clicking the link jumps to that line in the Sources panel.

```
color                             tomato
  ▼
    .card.active                  styles.css:88     tomato   ← wins
    ~~.card~~                     styles.css:42     steelblue
    ~~div~~                       user agent stylesheet  black
```

---

## Layout Pane

The Layout pane surfaces visual tools for CSS Grid and Flexbox that overlay the page with rulers, labels, and guides.

### CSS Grid inspector

When the selected element (or any element on the page) has `display: grid`, a badge reading **grid** appears next to it in the DOM tree. Click the badge to toggle an overlay on the page.

The overlay draws:
- Dashed lines along each column and row track
- Numbers on each grid line
- Named area labels (if you used `grid-template-areas`)
- Track size labels (e.g., `1fr`, `200px`, `auto`)

In the Layout pane itself you can configure the overlay:

| Setting                  | Effect                                          |
|--------------------------|-------------------------------------------------|
| Show line numbers        | Labels each grid line with its positive/negative index |
| Show area names          | Displays named grid areas on the overlay        |
| Extend grid lines        | Extends lines to the edges of the viewport      |
| Show track sizes         | Annotates each track with its computed size     |

Multiple grids can have their overlays enabled simultaneously using the checkboxes in the **Grid** section of the Layout pane.

### Flexbox inspector

Elements with `display: flex` or `display: inline-flex` show a **flex** badge. Click it to toggle a flex overlay that draws:

- The main-axis and cross-axis directions with arrows
- The flex container outline
- Outlines around each flex item

The **Flexbox** section of the Layout pane lists all flex containers on the page. Click any to select it and activate the overlay.

---

## Event Listeners Pane

The Event Listeners pane lists every event listener registered on the selected element and its ancestors.

### Reading the pane

Each entry shows:
- The **event type** (e.g., `click`, `keydown`, `submit`)
- The **file and line number** where the listener was registered
- Whether the listener is **passive** or **once**

Click the file link to jump to the listener's source in the Sources panel.

### Filtering options

| Option              | Effect                                                    |
|---------------------|-----------------------------------------------------------|
| All                 | Shows listeners on the element and all ancestors           |
| Selected node only  | Shows only listeners directly on the selected element     |
| Framework listeners | Shows synthetic listeners added by frameworks (React, Vue) |

Enable **Framework listeners** to reveal React's synthetic event system, which registers one top-level listener on the root and dispatches internally — useful when you see no listeners at all on a button.

### Removing a listener

Click the **Remove** button next to any listener to detach it at runtime. This is a debugging technique, not a permanent code change.

---

## DOM Breakpoints

DOM breakpoints pause JavaScript execution when the DOM changes in a specific way, without you needing to know which line of code makes the change.

### Types of DOM breakpoints

| Breakpoint type         | Pauses when...                                                  |
|-------------------------|------------------------------------------------------------------|
| Subtree modifications   | Any child node is added, removed, or reordered within the element |
| Attribute modifications | Any attribute on the element is added, removed, or changed       |
| Node removal            | The element itself is removed from the DOM                       |

### Setting a DOM breakpoint

Right-click any node in the DOM tree, hover **Break on**, and choose one of the three types. A small icon appears on the node to indicate the breakpoint is set.

### When and how to use them

**Subtree modifications** — use when content is being dynamically injected and you want to find the code responsible. Example: a loading spinner that replaces itself with data.

```html
<!-- You see this appear dynamically -->
<ul id="results">
  <li>Item 1</li>
</ul>
```

Right-click `#results`, Break on > Subtree modifications. The next time JavaScript adds a `<li>`, execution pauses in Sources with the call stack showing exactly which function did it.

**Attribute modifications** — use when a class or `data-*` attribute toggles unexpectedly. Example: a `data-state="open"` attribute that changes at the wrong time.

**Node removal** — use when an element disappears and you cannot find where in the codebase it is removed.

DOM breakpoints survive page navigations within the same DevTools session but are not persisted across full reloads unless you have the **Preserve log** option set.

---

## Accessibility Pane

The Accessibility pane exposes how assistive technologies (screen readers, switch controls) see the selected element.

### ARIA role, name, and properties

The pane shows the element's computed accessibility information:

| Field               | Description                                                        |
|---------------------|--------------------------------------------------------------------|
| Role                | The ARIA role (e.g., `button`, `listitem`, `heading`)              |
| Name                | The accessible name (what a screen reader announces)               |
| Description         | The accessible description (from `aria-describedby`)               |
| Properties          | All other ARIA properties (`aria-expanded`, `aria-checked`, etc.)  |
| Contrast ratio      | Text/background contrast (also shown in the color picker)          |

The computed **Name** resolves the full accessible name algorithm — it checks `aria-labelledby`, `aria-label`, the native label element, the element's content, `alt` text, `title`, and placeholder, in priority order.

### Full accessibility tree

Click **Enable full-page accessibility tree** at the top of the pane (or the tree icon in the Elements toolbar) to switch the entire DOM tree panel into an accessibility tree view. This shows only the nodes that are exposed to assistive technology, using their accessible roles and names instead of HTML tag names.

```
WebArea "My App"
  └─ banner
       └─ heading "Welcome" (level 1)
  └─ main
       └─ form "Search"
            └─ searchbox "Search query"
            └─ button "Submit"
```

Toggle back to the regular DOM tree with the same button.

### Common accessibility debugging patterns

```html
<!-- Problem: icon button with no accessible name -->
<button>
  <svg>...</svg>
</button>

<!-- Fix: add aria-label -->
<button aria-label="Close dialog">
  <svg>...</svg>
</button>
```

After adding the `aria-label` in the Elements panel, the Accessibility pane immediately shows the new computed name without a reload.

---

## Properties Pane

The Properties pane exposes the **JavaScript object** that backs the selected DOM node — the actual `HTMLElement` (or subclass) instance with all its IDL attributes, prototype chain, and inherited properties.

This is different from attributes (what you see in the HTML) and CSS (what the Styles pane shows). It lets you inspect live JavaScript property values:

- `id`, `className`, `classList`
- `scrollTop`, `scrollHeight`, `clientHeight`
- `offsetLeft`, `offsetTop`, `offsetWidth`, `offsetHeight`
- `innerHTML`, `textContent`
- `checked`, `value`, `disabled` on form elements
- `href`, `src`, `alt` on relevant elements

Properties are grouped under the element's own properties and its prototype chain (`HTMLDivElement`, `HTMLElement`, `Element`, `Node`, `EventTarget`). Expand each group to see inherited methods and properties.

```js
// What the Properties pane shows for a <div class="card">:
HTMLDivElement
  align: ""
  className: "card"
  id: ""
  innerHTML: "<h2>Title</h2>..."
  offsetHeight: 120
  offsetWidth: 320
  ...
HTMLElement
  hidden: false
  title: ""
  ...
Element
  ...
```

---

## Editing Shadow DOM

Components built with Web Components (custom elements) encapsulate their DOM in a **Shadow DOM** — a sub-tree that is isolated from the main document's CSS and JavaScript. DevTools can inspect it.

Shadow roots appear in the DOM tree as a collapsible `#shadow-root (open)` or `#shadow-root (closed)` node directly inside the host element:

```
▼ <my-card>                    ← custom element host
    ▼ #shadow-root (open)      ← shadow root
        <style>
          :host { display: block; }
        </style>
        ▼ <div class="inner">
            <slot></slot>      ← slotted light DOM content renders here
```

Selecting a node inside the shadow root works exactly like the regular DOM: you can inspect styles, edit HTML, set breakpoints, etc. Shadow DOM CSS (inside `<style>` tags in the shadow root) is shown in the Styles pane with a `user-agent stylesheet` or the component's file as the source.

**Slotted content** — light-DOM children assigned to a `<slot>` are still part of the main DOM tree but render inside the shadow DOM. DevTools shows a dotted outline around slotted nodes in the shadow tree to distinguish them.

---

## Force State

Besides the `:hov` pseudo-class toggles in the Styles pane, you can also force state from the DOM tree itself.

Right-click any element in the DOM tree and choose **Force state** to see all toggleable states for that element type. For a `<a>` tag you will see `:hover`, `:active`, `:focus`, `:focus-visible`, `:focus-within`, and `:visited`. For an `<input>` you additionally see `:checked` and `:enabled` / `:disabled`.

Forced states show as an orange badge on the node in the DOM tree so you always know which elements are in a pinned state:

```
▼ <a href="/about" class="nav-link"> == :hover :focus    ← orange badge
```

To clear all forced states at once, right-click the element and choose **Force state > Clear all forced states**.

---

## Advanced Techniques

### Screenshot a node

Right-click any element in the DOM tree and choose **Capture node screenshot**. DevTools saves a PNG of that element's rendered bounding box — including its children, applied CSS, and box shadow — to your downloads folder. The screenshot does not include anything outside the element's bounds.

This is useful for:
- Exporting a rendered chart or card for a bug report
- Capturing a UI component in isolation at its exact rendered size
- Sharing a specific state of a widget (e.g., an open dropdown)

### Scroll into view

If a node is off-screen (scrolled away or positioned outside the viewport), right-click it and choose **Scroll into view**. The page scrolls to bring the element into the visible area and briefly highlights it.

### Expand recursively

Right-click any collapsed node in the DOM tree and choose **Expand recursively** to open the entire subtree at once. This is faster than pressing `Alt+click` and is useful for reviewing deeply nested structures like table rows or a full navigation tree.

### Store as global variable

Right-click any node and choose **Store as global variable**. DevTools assigns it to a variable in the Console (`temp1`, `temp2`, etc.) so you can interact with it via JavaScript without writing a selector:

```js
// DevTools logged: temp1 = <div class="card">
temp1.getBoundingClientRect();
// {x: 32, y: 120, width: 320, height: 96, ...}

temp1.querySelectorAll('a').length;
// 3
```

### Expand all matching nodes (search trick)

Use `Ctrl+F` / `Cmd+F` to search for a CSS class or attribute. Each match is shown in context with its ancestors already expanded. Combine with **Expand recursively** on the match to fully open that branch.

### Focus mode and element badges

Modern DevTools shows small inline badges next to certain elements:

| Badge       | Meaning                                                    |
|-------------|-------------------------------------------------------------|
| `grid`      | Element is a grid container                                 |
| `flex`      | Element is a flex container                                 |
| `ad`        | Element was identified as an advertisement                  |
| `scroll`    | Element is a scroll container                               |
| `sticky`    | Element uses `position: sticky`                             |

Click a `grid` or `flex` badge to toggle that element's overlay without opening the Layout pane.

### Using $0 with the Performance and Memory panels

`$0` is available in any DevTools panel that has a Console drawer. If you profile performance and want to know why a specific node is expensive, select it in Elements, open the Performance panel, record a trace, then use `$0` in the console drawer to get its layout/paint metrics without writing a long `document.querySelector` call.

```js
// After selecting the animated element in Elements panel:
$0.getAnimations().forEach(a => {
  console.log(a.animationName, a.playState, a.effect.getTiming());
});
```

---

## Quick Reference

| Task                              | How                                                          |
|-----------------------------------|--------------------------------------------------------------|
| Open Elements panel               | F12, then click Elements; or right-click > Inspect          |
| Enter inspect mode                | Ctrl+Shift+C / Cmd+Shift+C                                   |
| Reference selected node in Console | `$0`                                                       |
| Search DOM                        | Ctrl+F / Cmd+F inside DOM tree                               |
| Edit node HTML                    | F2 or right-click > Edit as HTML                             |
| Delete node                       | Select node, press Delete                                    |
| Hide node                         | Select node, press H                                         |
| Force pseudo-class state          | Styles pane :hov button, or right-click > Force state        |
| Expand entire subtree             | Right-click > Expand recursively, or Alt+click triangle      |
| Add CSS rule                      | Click + in Styles pane toolbar                               |
| Nudge CSS value by 0.1            | Alt+Up/Down inside a numeric value                           |
| Capture element screenshot        | Right-click node > Capture node screenshot                   |
| Scroll element into view          | Right-click node > Scroll into view                          |
| Set DOM breakpoint                | Right-click node > Break on > [type]                         |
| Open color picker                 | Click any color swatch in Styles pane                        |
| Check contrast ratio              | Open color picker; ratio shown at bottom                     |
| Inspect shadow DOM                | Expand #shadow-root in DOM tree                              |
| Store element as JS variable      | Right-click node > Store as global variable                  |

---

[← Web Devtools](/coding/web-devtools/)
