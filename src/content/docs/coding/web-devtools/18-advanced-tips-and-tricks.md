---
title: 18 Advanced Tips And Tricks
---

# Advanced Chrome DevTools — Tips, Tricks & Power Workflows

:::note
Power-user reference for engineers who already know the basics and want to move faster, debug deeper, and ship with more confidence.
:::

---

## Table of Contents

1. [Command Menu Mastery](#command-menu-mastery)
2. [Master Keyboard Shortcuts](#master-keyboard-shortcuts)
3. [Console Power Tricks](#console-power-tricks)
4. [Elements Panel Power Tricks](#elements-panel-power-tricks)
5. [Network Panel Power Tricks](#network-panel-power-tricks)
6. [Sources Panel Power Tricks](#sources-panel-power-tricks)
7. [10 Useful DevTools Snippets](#10-useful-devtools-snippets)
8. [chrome:// URLs Every Developer Should Know](#chrome-urls-every-developer-should-know)
9. [DevTools Protocol (CDP)](#devtools-protocol-cdp)
10. [Framework-Specific Debugging](#framework-specific-debugging)
11. [Remote Debugging Node.js](#remote-debugging-nodejs)
12. [DevTools Experiments Worth Enabling](#devtools-experiments-worth-enabling)
13. [Performance Quick Wins Checklist](#performance-quick-wins-checklist)

---

## Command Menu Mastery

Open with `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac). This is the fastest way to reach any DevTools feature without hunting through panels.

### Prefix Guide

| Prefix | Scope | Example |
|--------|-------|---------|
| `>` | Run a DevTools command | `> Show Coverage` |
| *(no prefix)* | Open a file by name | `main.js` |
| `:` | Jump to a line in the current file | `:247` |
| `@` | Jump to a symbol (function, class) | `@handleSubmit` |
| `!` | Run a saved snippet | `!audit-links` |

### Top 30 Most Useful Commands

| # | Category | Command | What it does |
|---|----------|---------|--------------|
| 1 | Appearance | `Switch to dark theme` | Toggles dark/light DevTools UI |
| 2 | Appearance | `Dock to bottom / left / right` | Changes DevTools dock position |
| 3 | Panel | `Show Coverage` | Opens JS/CSS coverage panel |
| 4 | Panel | `Show Rendering` | Opens rendering overlays panel |
| 5 | Panel | `Show Layers` | Opens 3D layer composite view |
| 6 | Panel | `Show Animations` | Opens animation inspector |
| 7 | Panel | `Show Changes` | Shows all DevTools-authored changes |
| 8 | Panel | `Show Security` | Opens security/cert panel |
| 9 | Panel | `Show WebAudio` | Opens Web Audio API graph |
| 10 | Panel | `Show Media` | Opens HTML5 media panel |
| 11 | Capture | `Capture screenshot` | Full-page screenshot |
| 12 | Capture | `Capture node screenshot` | Screenshot of selected DOM node |
| 13 | Capture | `Capture full size screenshot` | Captures the entire scrollable page |
| 14 | Network | `Disable cache` | Toggles cache off for network requests |
| 15 | Network | `Enable network throttling` | Applies a speed profile to network |
| 16 | Debugger | `Disable JavaScript` | Turns off JS execution entirely |
| 17 | Debugger | `Resume with all pauses blocked` | Skips all remaining breakpoints |
| 18 | Debugger | `Step into next function call` | Same as F11 in Sources |
| 19 | Sensors | `Set location` | Spoofs GPS coordinates |
| 20 | Sensors | `Show Sensors` | Opens touch/orientation/location panel |
| 21 | Performance | `Start/Stop CPU throttling` | Slows CPU for slow-device simulation |
| 22 | Performance | `Show Performance monitor` | Live CPU/heap/FPS metrics |
| 23 | CSS | `Force CSS state` | Force :hover, :focus, etc. |
| 24 | CSS | `View page source` | Opens raw HTML in a new tab |
| 25 | Accessibility | `Show Accessibility` | Opens the a11y tree panel |
| 26 | Storage | `Clear site data` | Clears cookies, storage, cache at once |
| 27 | Workspace | `Add folder to workspace` | Mounts a local folder for editing |
| 28 | Snippets | `Create new snippet` | New JS snippet in Sources |
| 29 | Settings | `Open Settings` | Opens DevTools settings (F1) |
| 30 | Settings | `Restore default settings` | Resets all DevTools preferences |

---

## Master Keyboard Shortcuts

### General

| Shortcut (Mac) | Shortcut (Win/Linux) | Action |
|----------------|----------------------|--------|
| `Cmd+Shift+P` | `Ctrl+Shift+P` | Open Command Menu |
| `Cmd+]` / `Cmd+[` | `Ctrl+]` / `Ctrl+[` | Move to next/previous panel tab |
| `Cmd+Shift+C` | `Ctrl+Shift+C` | Inspect element (focus Elements panel) |
| `Cmd+Shift+I` | `Ctrl+Shift+I` | Toggle DevTools open/close |
| `Cmd+Shift+J` | `Ctrl+Shift+J` | Open DevTools and focus Console |
| `Cmd+K` | `Ctrl+L` | Clear the Console |
| `Cmd+F` | `Ctrl+F` | Search within current panel |
| `Cmd+G` / `Cmd+Shift+G` | `F3` / `Shift+F3` | Next/previous search result |
| `Esc` | `Esc` | Toggle the Console drawer in any panel |
| `F1` | `F1` | Open DevTools Settings |
| `?` | `?` | Open Settings (within DevTools) |

### Elements Panel

| Shortcut (Mac) | Shortcut (Win/Linux) | Action |
|----------------|----------------------|--------|
| `↑` / `↓` | `↑` / `↓` | Navigate up/down DOM nodes |
| `→` / `←` | `→` / `←` | Expand/collapse node |
| `Enter` | `Enter` | Edit the selected node's attributes |
| `H` | `H` | Toggle visibility (`visibility: hidden`) |
| `Delete` | `Delete` | Remove the selected node from DOM |
| `Cmd+Z` | `Ctrl+Z` | Undo DOM change |
| `Cmd+Shift+M` | `Ctrl+Shift+M` | Toggle device toolbar |
| `Cmd+\`` | `Ctrl+\`` | Toggle between Styles and Computed sub-tabs |
| `Tab` | `Tab` | Cycle through attributes on selected node |
| `F2` | `F2` | Edit node as HTML |

### Console

| Shortcut (Mac) | Shortcut (Win/Linux) | Action |
|----------------|----------------------|--------|
| `↑` / `↓` | `↑` / `↓` | Navigate command history |
| `Shift+Enter` | `Shift+Enter` | Start a new line (multi-line input) |
| `Cmd+Enter` | `Ctrl+Enter` | Execute multi-line code block |
| `Cmd+K` | `Ctrl+L` | Clear console output |
| `Tab` | `Tab` | Accept autocomplete suggestion |
| `Escape` | `Escape` | Close autocomplete dropdown |
| `Cmd+/` | `Ctrl+/` | Toggle comment on selected line |
| `Alt+Click` (expand icon) | `Alt+Click` | Deep-expand an object in the log |

### Sources Panel

| Shortcut (Mac) | Shortcut (Win/Linux) | Action |
|----------------|----------------------|--------|
| `F8` or `Cmd+\` | `F8` or `Ctrl+\` | Resume / Pause execution |
| `F10` or `Cmd+'` | `F10` or `Ctrl+'` | Step over next function call |
| `F11` or `Cmd+;` | `F11` or `Ctrl+;` | Step into next function call |
| `Shift+F11` | `Shift+F11` | Step out of current function |
| `Cmd+B` | `Ctrl+B` | Toggle breakpoint on current line |
| `Cmd+P` | `Ctrl+P` | Go to file |
| `Cmd+Shift+O` | `Ctrl+Shift+O` | Go to function/symbol in file |
| `Cmd+Shift+E` | `Ctrl+Shift+E` | Run snippet |
| `Cmd+S` | `Ctrl+S` | Save changes (if workspace mounted) |
| `Cmd+Alt+F` | `Ctrl+Shift+F` | Search across all sources files |

### Network Panel

| Shortcut (Mac) | Shortcut (Win/Linux) | Action |
|----------------|----------------------|--------|
| `Cmd+R` | `Ctrl+R` | Reload page and start recording |
| `Cmd+Shift+R` | `Ctrl+Shift+R` | Hard reload (bypass cache) |
| `Cmd+E` | `Ctrl+E` | Toggle recording on/off |
| `/` | `/` | Focus filter input |
| `Cmd+F` | `Ctrl+F` | Search across all response bodies |
| `Esc` | `Esc` | Close request detail pane |

### Performance Panel

| Shortcut (Mac) | Shortcut (Win/Linux) | Action |
|----------------|----------------------|--------|
| `Cmd+E` | `Ctrl+E` | Start/stop recording |
| `Cmd+Shift+E` | `Ctrl+Shift+E` | Record and reload page |
| `W` / `S` | `W` / `S` | Zoom in/out on timeline |
| `A` / `D` | `A` / `D` | Pan left/right on timeline |
| `Shift+Click+Drag` | `Shift+Click+Drag` | Select a time range |

---

## Console Power Tricks

### Store as Global Variable

Right-click any logged object in the Console and choose **"Store as global variable"**. DevTools assigns it to `$temp1`, `$temp2`, etc. — temporary references that persist until you clear the console. Useful when you receive a deeply nested object in a callback and want to explore it interactively.

```javascript
// After "Store as global variable" on a response object:
$temp1.data.users.filter(u => u.active)
```

### Copy Utility

The `copy()` function writes any value to your system clipboard as a string.

```javascript
// Copy all href values from the page as a newline-separated list
copy($$('a').map(a => a.href).join('\n'))

// Copy a complex object as formatted JSON
copy(JSON.stringify(someDeepObject, null, 2))

// Copy all CSS class names in use on the page
copy([...new Set([...$$('[class]')].flatMap(el => [...el.classList]))].sort().join('\n'))
```

### $$ and $ Selectors

`$()` is an alias for `document.querySelector()`. `$$()` is an alias for `document.querySelectorAll()` but returns an **Array** (not a NodeList), so array methods work directly.

```javascript
// Find all broken images (not yet loaded or src missing)
$$('img').filter(i => !i.complete)

// All forms with no action attribute
$$('form:not([action])')

// All elements with aria-label
$$('[aria-label]').map(el => ({ tag: el.tagName, label: el.getAttribute('aria-label') }))
```

### $0 — $4: The Inspector History

`$0` refers to the last element you inspected in the Elements panel. `$1` is the one before that, up to `$4`.

```javascript
// Get all computed styles for the currently selected element
getComputedStyle($0)

// Check if the inspected element has any event listeners (Chrome Extension required for full list)
getEventListeners($0)  // Only available in DevTools context

// Measure its bounding box
$0.getBoundingClientRect()
```

### $_: Last Evaluated Expression

`$_` holds the result of the most recently evaluated expression.

```javascript
[1, 2, 3, 4, 5].filter(n => n % 2 === 0)
// [2, 4]
$_.map(n => n * 10)
// [20, 40]
```

### Live Expressions

Click the eye icon (or **Create live expression**) in the Console toolbar to pin an expression that auto-evaluates every 250 ms. This eliminates console.log spam for values you want to monitor continuously.

Good candidates:
- `document.activeElement` — track focus changes
- `window.scrollY` — monitor scroll position
- `performance.memory.usedJSHeapSize` — watch memory grow
- `document.querySelectorAll('.loading').length` — track async loading state

### Multi-line Editing

Press `Shift+Enter` to add a new line without executing. Press `Cmd/Ctrl+Enter` when ready to run. This lets you write multi-statement blocks, define functions, and run async code inline.

```javascript
// Multi-line async IIFE in console
async function fetchUsers() {
  const res = await fetch('/api/users')
  const data = await res.json()
  console.table(data.slice(0, 10))
}
await fetchUsers()
```

### Top-level Await

The DevTools Console supports top-level `await` natively — no wrapper function needed.

```javascript
const res = await fetch('https://api.github.com/users/github')
const user = await res.json()
console.table(user)
```

### console.table for Arrays of Objects

```javascript
// Way more readable than console.log for structured data
console.table(performance.getEntriesByType('resource').map(r => ({
  name: r.name.split('/').pop(),
  type: r.initiatorType,
  duration: Math.round(r.duration) + 'ms',
  size: r.transferSize
})))
```

### console.group for Structured Logs

```javascript
console.group('User Session')
  console.log('ID:', userId)
  console.group('Permissions')
    permissions.forEach(p => console.log('•', p))
  console.groupEnd()
console.groupEnd()
```

### Monkeypatching Built-ins for Debugging

```javascript
// Intercept all fetch calls to log their URLs
const _fetch = window.fetch
window.fetch = function(...args) {
  console.log('[fetch]', args[0])
  return _fetch.apply(this, args)
}
```

---

## Elements Panel Power Tricks

### H — Toggle Visibility Without Removing

With a node selected, press `H` to apply `visibility: hidden` without removing it from the DOM. Layout is preserved but the element becomes invisible. Press `H` again to restore. Useful for isolating layout shifts or checking what lies beneath an element.

### Delete — Remove a Node

Press `Delete` (or `Backspace` on some systems) to remove the selected node entirely. The change is temporary — a page reload restores it. Use `Cmd+Z` to undo within the same DevTools session.

### Expand Recursively

Right-click any collapsed node and choose **Expand recursively** to open the entire subtree at once. Invaluable for exploring deeply nested server-rendered HTML without clicking every caret.

### Capture Node Screenshot

Right-click any element in the Elements panel and choose **Capture node screenshot**. DevTools scrolls to the element, captures a PNG of exactly its rendered bounding box, and saves it. No browser extensions or screen-capture tools needed.

### Force All Pseudo-states Simultaneously

In the Styles sub-panel, click **:hov** to force `:hover`, `:active`, `:focus`, `:focus-within`, `:focus-visible`, and `:visited` — individually or in any combination. This is far faster than trying to mouse-hover an element while reading styles.

### Scroll Into View

Right-click any node in the Elements panel and choose **Scroll into view**. The page scrolls so the element is visible in the viewport. Essential when debugging off-screen elements or sticky/fixed components.

### Copy Full XPath

Right-click any node → **Copy** → **Copy full XPath**. This produces an absolute XPath like `/html/body/div[3]/section/article[2]/h2`. Useful for feeding into Selenium/Playwright locators or browser automation scripts.

### Copy JS Path

Right-click → **Copy** → **Copy JS path** generates a `document.querySelector(...)` call that uniquely selects that node. Paste it into the Console and it returns the element.

### Edit as HTML

Press `F2` or right-click → **Edit as HTML** to get a full, editable HTML textarea for the node and all its children. Commit changes by clicking outside the editor. This is the fastest way to test markup changes without touching your source files.

### DOM Breakpoints

Right-click a node → **Break on** to set a mutation breakpoint:
- **Subtree modifications** — pauses whenever any descendant changes
- **Attribute modifications** — pauses when attributes on this node change
- **Node removal** — pauses when this exact node is removed from the DOM

These pause execution in the Sources panel with a full call stack showing exactly which JavaScript made the change.

---

## Network Panel Power Tricks

### Advanced Filter Syntax

The filter bar accepts plain text (substring match on URL) but also these keywords:

| Filter | Example | What it matches |
|--------|---------|-----------------|
| `domain:` | `domain:api.example.com` | Requests to that domain only |
| `has-response-header:` | `has-response-header:cache-control` | Responses with that header |
| `method:` | `method:POST` | Requests by HTTP method |
| `mime-type:` | `mime-type:application/json` | Responses by MIME type |
| `larger-than:` | `larger-than:100k` | Responses over 100 KB |
| `status-code:` | `status-code:404` | Specific HTTP status code |
| `resource-type:` | `resource-type:fetch` | xhr, fetch, image, script, stylesheet, font, etc. |
| `-` (negate) | `-domain:cdn.example.com` | Exclude matches |
| `is:` | `is:running` | `is:running`, `is:from-cache`, `is:service-worker-intercepted` |

Combine filters: `method:POST -domain:analytics.com status-code:200`

### Block Requests to Test Fallback Behavior

Right-click any request row → **Block request URL** (blocks that exact URL) or **Block request domain** (blocks the entire domain). The request will fail with `net::ERR_BLOCKED_BY_DEVTOOLS`. Use this to test:
- What your app does when a CDN is down
- Fallback behavior when an API endpoint fails
- Whether your error boundaries / error UI actually renders

Manage blocked patterns via **Settings (gear icon) → Blocked URLs** or the **Network request blocking** drawer panel.

### Import and Replay a HAR File

A HAR (HTTP Archive) file records every network request/response. You can drag a `.har` file onto the Network panel to replay the entire session — no live server needed. Perfect for:
- Debugging a bug reported by a user ("send me your HAR file")
- Comparing production vs. staging network behavior
- Performance regression analysis across builds

Export via the download icon in the Network panel toolbar.

### Copy as cURL

Right-click any request → **Copy** → **Copy as cURL**. This produces a shell command that recreates the exact request — method, headers, cookies, request body — that you can paste into a terminal. Invaluable for:
- Reproducing an authenticated API call outside the browser
- Sharing a request with a backend engineer
- Importing into Postman or Insomnia (both accept cURL paste)

```bash
# Example output:
curl 'https://api.example.com/graphql' \
  -H 'authorization: Bearer eyJhbGciOi...' \
  -H 'content-type: application/json' \
  --data-raw '{"query":"{ me { id name } }"}'
```

### Preserve Log Across Navigation

Check **Preserve log** in the Network toolbar to prevent the request list from clearing on navigation. Essential when debugging redirect chains, form submissions, or OAuth flows that involve a redirect back to your app.

### Initiator Column and Call Stack

Click any request and open the **Initiator** tab in the detail pane. For `fetch`/`XHR`, DevTools shows the full JavaScript call stack that triggered the request — click any frame to jump to that source line. This is the fastest way to find "what code made this request."

### Throttle Individual Requests with Override

Use **Local Overrides** (Sources panel → Overrides tab) to serve a custom response for any URL. Enable overrides → right-click a response in Network → **Override content** → edit the response body. The overridden response is served on subsequent requests until you disable it.

---

## Sources Panel Power Tricks

### Logpoints: Logging Without Modifying Code

Right-click the line number gutter → **Add logpoint** and enter any JavaScript expression. On each execution, the expression is evaluated and logged to the Console — no `console.log` statement needed in your source, no rebuild required. Logpoints persist across page reloads within the DevTools session.

```
// In the logpoint dialog, enter:
'User:', user.id, 'Cart total:', cart.items.reduce((s, i) => s + i.price, 0)
```

### Conditional Breakpoints

Right-click the gutter → **Add conditional breakpoint**. Enter a JS expression; execution only pauses when the expression is truthy. This is the single most underused DevTools feature for loops and event handlers.

```javascript
// Only pause when the failing user ID is processed
user.id === 'usr_abc123'

// Only pause when the array is unexpectedly empty
items.length === 0

// Only pause on the 50th iteration
i === 49
```

### Restart Frame

While paused in the debugger, right-click any frame in the **Call Stack** panel and choose **Restart frame**. DevTools re-enters that function from its beginning — all local variables are reset, the DOM and heap state are not. Use this to replay a specific function without reloading the page, which is especially useful when the bug only appears after a long setup sequence.

### Never Pause Here

Right-click the line number of any line inside a library or third-party file and choose **Never pause here**. The debugger will skip that line when evaluating "pause on exception" — no more breaking inside minified React internals when your own code throws.

### Blackboxing Library Scripts

In DevTools Settings → **Ignore List**, add URL patterns (supports wildcards) to blackbox entire files. When a script is blackboxed:
- The debugger steps through it as if it doesn't exist
- Stack traces collapse blackboxed frames
- "Pause on exceptions" skips exceptions thrown inside blackboxed scripts

Default patterns include `node_modules`, `webpack`, and common CDN bundles.

### Local Overrides for Persistent Edits

1. Sources panel → **Overrides** tab → **+ Select folder for overrides**
2. Choose (or create) a local directory
3. Grant DevTools permission to access it
4. Edit any file in the Sources panel and press `Cmd+S`
5. The edit is saved locally and served on every subsequent page load

This lets you test code changes on any production site without a local dev server.

### Auto-attach Node.js Debugging

In the Sources panel, click the Node.js icon (top-left toolbar) to enable **Auto-attach**. Any `node` process started with `--inspect` in a terminal will automatically appear in DevTools — no manual `chrome://inspect` navigation needed.

---

## 10 Useful DevTools Snippets

Save these in Sources → Snippets for instant reuse. Run any snippet with `Cmd+Enter` or via the Command Menu (`!snippet-name`).

### Snippet 1: Find All Broken Images

```javascript
// Finds all <img> elements that failed to load
;(function findBrokenImages() {
  const broken = $$('img').filter(img => {
    // naturalWidth is 0 for broken images and images that haven't loaded
    return img.complete && img.naturalWidth === 0
  })

  if (broken.length === 0) {
    console.log('%c No broken images found.', 'color: green; font-weight: bold')
  } else {
    console.group(`%c ${broken.length} broken image(s) found`, 'color: red; font-weight: bold')
    broken.forEach((img, i) => {
      console.group(`Image ${i + 1}`)
      console.log('src:', img.src)
      console.log('alt:', img.alt || '(none)')
      console.log('element:', img)
      console.groupEnd()
    })
    console.groupEnd()
  }
})()
```

### Snippet 2: List All Event Listeners on Document

```javascript
// Dumps all event listeners registered on document and window
// Note: getEventListeners() is a DevTools-only API
;(function listDocumentListeners() {
  const targets = [
    { name: 'window', el: window },
    { name: 'document', el: document },
    { name: 'document.body', el: document.body },
  ]

  targets.forEach(({ name, el }) => {
    const listeners = getEventListeners(el)
    const types = Object.keys(listeners)
    if (types.length === 0) {
      console.log(`${name}: no listeners`)
      return
    }
    console.group(`${name} (${types.length} event types)`)
    types.forEach(type => {
      console.group(`${type} (${listeners[type].length})`)
      listeners[type].forEach(({ listener, once, passive, capture }) => {
        console.log({ listener, once, passive, capture })
      })
      console.groupEnd()
    })
    console.groupEnd()
  })
})()
```

### Snippet 3: Find All Elements with Inline Styles

```javascript
// Finds every element using inline style attributes — common code-smell
;(function findInlineStyles() {
  const elements = $$('[style]')

  if (elements.length === 0) {
    console.log('%c No inline styles found.', 'color: green')
    return
  }

  console.group(`${elements.length} element(s) with inline styles`)
  const report = elements.map(el => ({
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    class: el.className || null,
    style: el.getAttribute('style'),
    element: el
  }))
  console.table(report.map(r => ({ tag: r.tag, id: r.id, class: r.class, style: r.style })))
  console.groupEnd()
})()
```

### Snippet 4: Find the Largest DOM Elements by Child Count

```javascript
// Reports the top 10 elements with the most DOM descendants
;(function findLargestDOMElements() {
  const all = $$('*')

  const withCounts = all.map(el => ({
    element: el,
    tag: el.tagName.toLowerCase(),
    id: el.id ? `#${el.id}` : '',
    class: el.classList.length ? `.${[...el.classList].join('.')}` : '',
    childCount: el.querySelectorAll('*').length,
    directChildren: el.childElementCount
  }))

  withCounts.sort((a, b) => b.childCount - a.childCount)
  const top10 = withCounts.slice(0, 10)

  console.group('Top 10 DOM elements by total descendant count')
  console.table(top10.map(({ tag, id, class: cls, childCount, directChildren }) => ({
    selector: `${tag}${id}${cls}`,
    'total descendants': childCount,
    'direct children': directChildren
  })))
  top10.forEach(({ element }) => console.log(element))
  console.groupEnd()
})()
```

### Snippet 5: Highlight All Focusable Elements

```javascript
// Overlays a visible highlight on every keyboard-focusable element
;(function highlightFocusableElements() {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'details > summary',
    'audio[controls]',
    'video[controls]'
  ].join(',')

  const focusable = $$(focusableSelectors)
  let count = 0

  focusable.forEach((el, i) => {
    const original = el.style.outline
    el.style.outline = '3px solid deeppink'
    el.style.outlineOffset = '2px'
    el.dataset._focusHighlight = original
    count++
  })

  console.log(`Highlighted ${count} focusable elements. Run clearHighlights() to remove.`)

  window.clearHighlights = function() {
    $$('[data-_focus-highlight]').forEach(el => {
      el.style.outline = el.dataset._focusHighlight
      el.style.outlineOffset = ''
      delete el.dataset._focusHighlight
    })
    console.log('Highlights cleared.')
  }
})()
```

### Snippet 6: List All CSS Custom Properties on :root

```javascript
// Dumps every CSS variable (custom property) defined on :root
;(function listCSSVariables() {
  const rootStyles = getComputedStyle(document.documentElement)
  const variables = []

  for (let i = 0; i < rootStyles.length; i++) {
    const prop = rootStyles[i]
    if (prop.startsWith('--')) {
      variables.push({
        property: prop,
        value: rootStyles.getPropertyValue(prop).trim()
      })
    }
  }

  if (variables.length === 0) {
    console.log('No CSS custom properties found on :root')
    return
  }

  variables.sort((a, b) => a.property.localeCompare(b.property))
  console.group(`${variables.length} CSS custom properties on :root`)
  console.table(variables)
  copy(variables.map(v => `${v.property}: ${v.value};`).join('\n'))
  console.log('(Values copied to clipboard)')
  console.groupEnd()
})()
```

### Snippet 7: Find External Links Missing target="_blank"

```javascript
// Finds external links that open in the same tab (potentially bad UX)
;(function findExternalLinksWithoutTargetBlank() {
  const currentHost = location.hostname

  const external = $$('a[href]').filter(a => {
    try {
      const url = new URL(a.href)
      return (
        url.hostname &&
        url.hostname !== currentHost &&
        a.target !== '_blank'
      )
    } catch {
      return false
    }
  })

  if (external.length === 0) {
    console.log('%c All external links have target="_blank"', 'color: green')
    return
  }

  console.group(`${external.length} external link(s) missing target="_blank"`)
  external.forEach(a => {
    console.log(`href: ${a.href} | text: "${a.textContent.trim().slice(0, 60)}"`, a)
  })
  console.groupEnd()
})()
```

### Snippet 8: Measure Element Paint Time

```javascript
// Uses performance marks to measure how long a re-paint takes
// after mutating an element's style
;(async function measurePaintTime() {
  const selector = prompt('Enter a CSS selector to measure paint time for:', 'body')
  const el = document.querySelector(selector)

  if (!el) {
    console.error('Element not found:', selector)
    return
  }

  const markStart = 'paint-measure-start'
  const markEnd = 'paint-measure-end'

  performance.mark(markStart)

  // Trigger a style recalc + paint
  el.style.opacity = el.style.opacity === '0.99' ? '1' : '0.99'

  // Wait for the next animation frame (after layout) + one more for paint
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  performance.mark(markEnd)
  const measure = performance.measure('paint-duration', markStart, markEnd)

  console.log(`Paint time for "${selector}": ${measure.duration.toFixed(3)} ms`)

  // Restore
  el.style.opacity = ''

  performance.clearMarks(markStart)
  performance.clearMarks(markEnd)
  performance.clearMeasures('paint-duration')
})()
```

### Snippet 9: Dump All localStorage as Formatted JSON

```javascript
// Prints all localStorage entries with pretty-printed JSON values
;(function dumpLocalStorage() {
  const count = localStorage.length

  if (count === 0) {
    console.log('localStorage is empty.')
    return
  }

  const entries = {}
  for (let i = 0; i < count; i++) {
    const key = localStorage.key(i)
    const raw = localStorage.getItem(key)
    try {
      entries[key] = JSON.parse(raw)
    } catch {
      entries[key] = raw  // Not JSON, store as string
    }
  }

  console.group(`localStorage (${count} entries)`)
  Object.entries(entries).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      console.group(key)
      console.log(value)
      console.groupEnd()
    } else {
      console.log(`${key}:`, value)
    }
  })
  console.groupEnd()

  copy(JSON.stringify(entries, null, 2))
  console.log('(Copied to clipboard as JSON)')
})()
```

### Snippet 10: Count Elements Matching Each Selector from a List

```javascript
// Audit which CSS selectors have matches — useful for design system audits,
// deprecation tracking, or verifying component adoption
;(function countSelectorMatches() {
  const selectors = [
    // Modify this list for your audit
    'h1', 'h2', 'h3',
    'button', 'a[href]', 'input', 'select', 'textarea',
    '[role="button"]', '[aria-label]', '[aria-describedby]',
    '.btn', '.btn-primary', '.btn-secondary',
    'img:not([alt])',
    'table', 'form',
    '[data-testid]',
    ':focus-visible',
    'iframe',
    '[onclick]',
    'script[src]',
    'link[rel="stylesheet"]'
  ]

  const results = selectors.map(selector => {
    let count = 0
    let error = null
    try {
      count = document.querySelectorAll(selector).length
    } catch (e) {
      error = e.message
    }
    return { selector, count, error }
  })

  console.group('Selector audit results')
  console.table(results)
  console.groupEnd()

  const nonZero = results.filter(r => r.count > 0)
  console.log(`${nonZero.length} of ${selectors.length} selectors matched at least one element.`)
})()
```

---

## chrome:// URLs Every Developer Should Know

| URL | What It Does | When to Use It |
|-----|-------------|----------------|
| `chrome://inspect` | List all inspectable targets: browser tabs, Node.js processes, extensions, service workers | Remote debugging, Node.js DevTools attach, debugging WebViews |
| `chrome://net-internals/#dns` | View and flush the DNS cache | When DNS changes aren't propagating in-browser; `chrome://net-internals/#dns` → **Clear host cache** |
| `chrome://net-internals/#sockets` | View active socket pools and flush them | Diagnosing connection-reuse issues, forcing new TCP/TLS handshake |
| `chrome://net-internals/#events` | Real-time event log for all network activity | Deep network debugging below the Network panel level |
| `chrome://tracing` | Chromium's own Perfetto-based trace recorder — records compositor, renderer, GPU threads | Diagnosing jank, compositing bugs, or performance issues not visible in the DevTools Performance panel |
| `chrome://flags` | Enable/disable experimental Chrome features | Testing upcoming browser APIs before they ship, enabling DevTools experiments globally |
| `chrome://version` | Full Chrome version, OS, JS engine (V8) version, and command-line flags active | Bug reports, verifying which Chrome channel and V8 version you're on |
| `chrome://extensions` | Extension management page | Disabling extensions during debugging to rule out interference |
| `chrome://quota-internals` | Storage quota usage per origin: IndexedDB, Cache API, Service Worker storage | Diagnosing "storage full" errors; checking what storage each origin has consumed |
| `chrome://dns` | Currently cached DNS entries | See which domains are cached and their TTLs |
| `chrome://net-internals/#hsts` | View and manage HSTS/HPKP policies | Debugging HTTPS redirect loops, clearing stuck HSTS entries for localhost |
| `chrome://serviceworker-internals` | Full list of registered service workers with start/stop/inspect controls | Debugging service worker lifecycle, cache strategies, and push notifications |
| `chrome://webrtc-internals` | Live stats for all active WebRTC peer connections | Debugging video/audio calls, ICE negotiation, and media codec selection |
| `chrome://crashes` | Crash report history | Diagnosing renderer crashes and GPU process crashes |
| `chrome://gpu` | Full GPU feature status, driver versions, compositor mode | Diagnosing hardware acceleration issues, verifying WebGL/WebGPU availability |

---

## DevTools Protocol (CDP)

### What It Is

The Chrome DevTools Protocol (CDP) is the JSON-over-WebSocket API that powers DevTools itself. Every action you take in DevTools — setting a breakpoint, inspecting an element, recording a trace — is a CDP message under the hood. The full spec is at [chromedevtools.github.io/devtools-protocol](https://chromedevtools.github.io/devtools-protocol/).

### How Puppeteer and Playwright Use It

Both automation libraries open a WebSocket connection to Chrome's CDP endpoint and send commands programmatically. Puppeteer wraps CDP almost 1:1 (many methods are thin wrappers). Playwright adds a higher-level abstraction but drops to CDP for low-level operations.

```javascript
// Puppeteer: access the raw CDP session
const page = await browser.newPage()
const client = await page.createCDPSession()

// Enable network domain
await client.send('Network.enable')

// Intercept every request
client.on('Network.requestWillBeSent', event => {
  console.log(event.request.method, event.request.url)
})

// Block all image requests at the CDP level
await client.send('Network.setBlockedURLs', {
  urls: ['*.jpg', '*.png', '*.gif', '*.webp']
})
```

### Accessing CDP via the chrome.debugger Extension API

Browser extensions with the `debugger` permission can attach to any tab and send CDP commands directly.

```javascript
// manifest.json: "permissions": ["debugger"]

// In your extension's background service worker:
const tabId = 123  // target tab

chrome.debugger.attach({ tabId }, '1.3', () => {
  // Enable the Network domain
  chrome.debugger.sendCommand({ tabId }, 'Network.enable', {}, () => {

    // Listen for responses
    chrome.debugger.onEvent.addListener((source, method, params) => {
      if (method === 'Network.responseReceived') {
        console.log('Response:', params.response.status, params.response.url)
      }
    })
  })
})

// Always detach when done
chrome.debugger.detach({ tabId })
```

### Direct CDP Connection (Headless / Remote)

Start Chrome with `--remote-debugging-port=9222`:

```bash
# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug \
  --headless=new
```

Then list available targets:

```bash
curl http://localhost:9222/json
```

Connect with any WebSocket client:

```javascript
import WebSocket from 'ws'

const ws = new WebSocket('ws://localhost:9222/json/version')

ws.on('open', () => {
  // Enable Runtime domain
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }))
})

ws.on('message', data => {
  const msg = JSON.parse(data)
  if (msg.method === 'Runtime.consoleAPICalled') {
    const text = msg.params.args.map(a => a.value).join(' ')
    console.log('[page console]', text)
  }
})
```

---

## Framework-Specific Debugging

### React

**React DevTools extension** adds two panels: **Components** (browse the component tree, inspect props/state/context) and **Profiler** (record renders and measure component render times).

**`$r` global**: After clicking any component in the Components panel, `$r` in the Console refers to that component instance — its props, state, hooks, and `_fiber` internals are accessible.

```javascript
// After selecting a component in React DevTools:
$r.props           // current props
$r.state           // class component state (undefined for function components)

// For function components, hooks are in the fiber:
$r._debugHookTypes    // names of hooks in order

// Force re-render of the selected component (class component):
$r.forceUpdate()
```

**Detecting the React version:**

```javascript
// In Console:
__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers
// Returns a Map of renderer ID → renderer object; renderer.version is the React version
```

**Finding which component owns a DOM element:**

```javascript
// Select a DOM element in Elements panel, then in Console:
const fiber = $0._reactFiber || $0[Object.keys($0).find(k => k.startsWith('__reactFiber'))]
let node = fiber
while (node) {
  if (typeof node.type === 'function') {
    console.log(node.type.displayName || node.type.name)
  }
  node = node.return
}
```

### Vue

**Vue DevTools extension** adds a **Vue** panel with the component tree, props, data, computed values, and a timeline for Vuex/Pinia mutations.

**`$vm0` global**: Selecting a component in Vue DevTools sets `$vm0` in the Console to that component's Vue instance.

```javascript
// After selecting a component in Vue DevTools:
$vm0.$data          // reactive data
$vm0.$props         // props received from parent
$vm0.$el            // root DOM element
$vm0.$emit('click') // programmatically emit an event

// Vue 3: access the internal instance
import { getCurrentInstance } from 'vue'
// In a component setup(), getCurrentInstance() returns the internal instance
```

**Finding a Vue instance from a DOM node:**

```javascript
// Vue 2:
const vnode = $0.__vue__
// Vue 3:
const vnode = $0.__vueParentComponent
```

### Angular

Angular exposes an `ng` global in development mode:

```javascript
// Get the component instance for the currently selected DOM element ($0):
const comp = ng.getComponent($0)
comp                        // the component instance
comp.title                  // read a property
comp.title = 'New Title'    // write a property
ng.applyChanges(comp)       // trigger change detection to update the view

// Get all directives on an element:
ng.getDirectives($0)

// Get the injector:
ng.getInjector($0)

// Access a service from the root injector:
const router = ng.getInjector(document.body).get(ng.coreTokens.Router)
router.navigate(['/home'])

// Manually trigger global change detection:
ng.applyChanges(ng.getRootComponents($0)[0])
```

### General Cross-Framework Tricks

```javascript
// Detect which framework is running on the page:
;(function detectFramework() {
  const checks = {
    React: () => !!(window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.size),
    'React (no devtools)': () => !!document.querySelector('[data-reactroot], [data-reactid]'),
    Vue: () => !!(window.__VUE__ || window.__VUE_DEVTOOLS_GLOBAL_HOOK__),
    Angular: () => typeof window.ng !== 'undefined',
    Svelte: () => !!document.querySelector('[class^="svelte-"]'),
    Ember: () => typeof window.Ember !== 'undefined',
    jQuery: () => typeof window.jQuery !== 'undefined',
    Next: () => !!(window.__NEXT_DATA__),
    Nuxt: () => !!(window.__nuxt__ || window.$nuxt),
  }
  Object.entries(checks).forEach(([name, test]) => {
    if (test()) console.log(`Detected: ${name}`)
  })
})()
```

---

## Remote Debugging Node.js

### Basic: node --inspect

```bash
node --inspect app.js
# Output: Debugger listening on ws://127.0.0.1:9229/...
```

Then open `chrome://inspect` in Chrome. Your Node process appears under **Remote Target**. Click **inspect** to open a DevTools window connected to the Node process — full Sources, Console, Memory, and Profiler panels are available.

### node --inspect-brk: Pause on First Line

```bash
node --inspect-brk app.js
```

The process starts and immediately pauses before executing any user code. The DevTools Sources panel opens at the first line of your entry file. Use this when you need to debug initialization code (DB connection setup, config loading, etc.) that runs before you could otherwise set a breakpoint.

### Connecting to a Remote Process

If the Node process is on a different machine (or inside Docker):

```bash
# On the remote machine:
node --inspect=0.0.0.0:9229 app.js

# On your local machine, forward the port via SSH:
ssh -L 9229:localhost:9229 user@remote-host

# Then open chrome://inspect → Configure → add localhost:9229
```

### VS Code + Chrome DevTools Simultaneously

Both VS Code's debugger and Chrome DevTools can be connected to the same Node process at the same time via CDP — they share the debugger session. Set up a `launch.json` in VS Code:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Node",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

With `"restart": true`, VS Code automatically re-attaches when the process restarts (e.g., with `nodemon`).

### Debugging with nodemon (Auto-restart)

```bash
nodemon --inspect app.js
```

Each time nodemon restarts the process, a new CDP endpoint is created. In `chrome://inspect`, the target will reappear automatically after restart. In VS Code with `"restart": true`, it re-attaches automatically.

### Profiling Node.js CPU

```bash
node --inspect app.js
```

In the connected DevTools, go to the **Profiler** panel → **Start** → run your workload → **Stop**. The flame chart shows CPU time spent in each function, identical to browser profiling. Use this to find hot functions in server-side rendering, API handlers, or data processing pipelines.

---

## DevTools Experiments Worth Enabling

Access via DevTools Settings (`F1`) → **Experiments** tab, or via `chrome://flags` for some options.

| Experiment | Description | Why Enable It |
|------------|-------------|---------------|
| **CSS Grid Editor** | Visual editor for `grid-template` in the Styles pane — click to add/remove rows and columns | Far faster than hand-editing grid syntax; shows a live interactive grid overlay |
| **Local overrides for request headers** | Apply custom response headers from Local Overrides, not just body | Test CORS policies, CSP variations, and caching headers without a proxy |
| **CSS Overview panel** | Analyzes the page and generates a report: color palette, font inventory, unused declarations | One-click CSS audit; great for design system consistency review |
| **Automatic contrast ratio suggestions** | In color picker, automatically suggests WCAG AA/AAA-compliant alternatives | Instant a11y feedback while adjusting colors |
| **Source map scopes** | Shows original variable names in the Scope panel when a source map is available | Makes debugging minified/transpiled code feel like debugging source |
| **Enable network panel with fetch priority** | Adds a Priority column to the Network panel showing browser fetch priority (Highest/High/Medium/Low) | Understand which resources the browser deprioritizes; tune `fetchpriority` attribute |
| **Improved breakpoints UI** | Unified breakpoints sidebar showing logpoints, conditional breakpoints, and DOM breakpoints in one list | Easier management when you have many breakpoints across files |
| **Authored/Deployed** grouping in Sources | Groups the file tree by "Authored" (original source via source maps) vs "Deployed" (actual network files) | Cleaner navigation in projects with build steps — you only see the files you wrote |

---

## Performance Quick Wins Checklist

A prioritized set of 15 actions that reliably improve Core Web Vitals and perceived performance. Run a baseline Lighthouse audit first, then work through these in order.

- [ ] **1. Enable text compression** — Verify responses have `Content-Encoding: gzip` or `br`. In Network panel, compare the Size column (transferred) to the Content column (decompressed). Text assets (JS, CSS, HTML, JSON, SVG) should compress to 60–80% of original size.

- [ ] **2. Remove render-blocking resources** — In Lighthouse, check the "Eliminate render-blocking resources" item. Move non-critical CSS to `<link rel="preload">` or inline critical CSS. Defer all non-critical JavaScript with `async` or `defer`.

- [ ] **3. Audit unused JavaScript** — Open the Coverage panel (Command Menu → "Show Coverage"), reload the page, and look for JS files where >50% of bytes are unused. Code-split or lazy-load those modules.

- [ ] **4. Audit unused CSS** — Same Coverage panel. Remove dead selectors or scope them to the routes that actually use them.

- [ ] **5. Size images correctly** — In the Network panel, filter by `resource-type:image`. Check the Dimensions of each image in its preview. If the rendered size (in Elements) is far smaller than the intrinsic size, add `srcset`/`sizes` or a responsive image pipeline.

- [ ] **6. Serve images in next-gen formats** — PNG/JPG → WebP or AVIF. Check the MIME type column in the Network panel; `image/webp` or `image/avif` should appear for most images.

- [ ] **7. Implement lazy loading** — Add `loading="lazy"` to all `<img>` and `<iframe>` elements that are below the fold. Verify in Network panel that those requests are deferred until scroll.

- [ ] **8. Preload LCP resource** — In the Performance panel, identify the Largest Contentful Paint element. If it is a hero image or web font, add `<link rel="preload" as="image" href="...">` (or `as="font"`) in `<head>`. Verify it appears in the Waterfall with high priority.

- [ ] **9. Reduce main-thread blocking time (TBT/FID)** — In Performance, look for Long Tasks (red triangles). Break up tasks longer than 50 ms using `requestIdleCallback`, `setTimeout(..., 0)`, or the Scheduler API.

- [ ] **10. Avoid layout thrashing** — In Performance, look for Recalculate Style → Layout in rapid sequence (purple + green). This indicates JS is reading layout properties (like `offsetHeight`) and writing styles in alternating loops. Batch reads and writes using `requestAnimationFrame`.

- [ ] **11. Reduce CLS (Cumulative Layout Shift)** — In Performance, look for Layout Shift records. Common causes: images without `width`/`height` attributes, ads injecting content, web fonts causing FOUT. Always set explicit dimensions on media elements.

- [ ] **12. Enable caching for static assets** — In Network panel headers, static assets (JS bundles, images, fonts) should return `Cache-Control: max-age=31536000, immutable`. HTML documents should return `Cache-Control: no-cache` (with ETag for revalidation).

- [ ] **13. Preconnect to critical third-party origins** — Identify critical cross-origin resources (fonts, analytics, API). Add `<link rel="preconnect" href="https://fonts.googleapis.com">`. Verify in the Network waterfall that the DNS+TCP+TLS time for first requests to that origin is eliminated.

- [ ] **14. Minimize third-party impact** — In Lighthouse's "Reduce the impact of third-party code" section, identify blocking third parties. Delay non-critical third-party scripts (analytics, chat widgets) until after the page is interactive using `requestIdleCallback`.

- [ ] **15. Check memory leaks in long sessions** — In the Memory panel, take a heap snapshot, interact with the page for several minutes, take another snapshot, then use the **Comparison** view to find objects that grew unexpectedly. Common culprits: event listeners not removed on component unmount, global caches growing without eviction, retained DOM nodes.

---

*Last updated: 2026-07-28. All shortcuts verified against Chrome 126+. Snippets tested in Chrome DevTools Console.*

---

[← Web Devtools](/coding/web-devtools/)
