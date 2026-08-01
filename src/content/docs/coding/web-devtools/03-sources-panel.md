---
title: 03 Sources Panel
---

# Chrome DevTools: Sources Panel

The Sources panel is the full-featured debugger built into Chrome. It lets you pause JavaScript mid-execution, inspect every variable in every scope, rewrite files locally without touching your server, and correlate minified production code back to the original source. This guide walks from opening the panel for the first time to advanced techniques used daily in production debugging.

---

## What the Sources Panel Does

The Sources panel serves three distinct purposes that share the same UI:

1. **Debugger** — Pause execution at any line, step through code instruction by instruction, and inspect or mutate program state while paused.
2. **File browser** — Browse every resource the current page has loaded: scripts, stylesheets, HTML, Wasm modules, worker scripts, and more.
3. **Local overrides and workspaces** — Intercept network responses with files on your hard drive, or map a live origin to a local filesystem so edits save directly to your project.

Understanding that these three jobs coexist in one panel prevents confusion about why so many panes and tabs exist.

---

## UI Layout

```
+----------------------------------------------------------------------+
|  [Page] [Overrides] [Content scripts] [Snippets]   << Navigator tabs |
+--------------------+----------------------------------+---------------+
|                    |                                  | >> Debugger   |
|  File Tree         |  Code Editor / Viewer            |               |
|                    |                                  | [Resume F8]   |
|  v origin          |   1  function add(a, b) {        | [Step F10]    |
|    v src/           |   2    const result = a + b; <- | [Into F9]     |
|      app.js        |   3    return result;            | [Out S+F11]   |
|      utils.js      |   4  }                           |               |
|    > node_modules  |   5                              | Watch         |
|                    |   6  add(2, 3);                  |  + expr       |
|                    |                                  |               |
|                    |                                  | Breakpoints   |
|                    |                                  |  [x] app.js:2 |
|                    |                                  |               |
|                    |                                  | Scope         |
|                    |                                  |  Local        |
|                    |                                  |   a: 2        |
|                    |                                  |   b: 3        |
|                    |                                  |  Closure      |
|                    |                                  |  Global       |
|                    |                                  |               |
|                    |                                  | Call Stack    |
|                    |                                  |  add (app.js) |
|                    |                                  |  (anonymous)  |
+--------------------+----------------------------------+---------------+
```

The three columns are resizable. The left navigator column can be collapsed with the arrow icon at its top-right. The right debugger column appears only when the debugger is paused or when you manually open it via the panel icon.

---

## File Navigator

### Tabs

**Page** — All resources loaded by the current page, grouped by origin. Expand an origin to see directories and individual files. Clicking a file opens it in the editor. Script files that were inlined in HTML appear under `(index)`.

**Overrides** — Files you have designated as local replacements for network responses. Once a directory is selected as the overrides folder, modified files appear here with a purple dot in the editor gutter.

**Content scripts** — JavaScript injected by browser extensions. Useful when you suspect an extension is interfering with the page.

**Snippets** — Small scripts you write once and run on any page at any time. They are stored in DevTools, not in any project.

### Keyboard Navigation

| Shortcut | Action |
|---|---|
| `Ctrl+P` / `Cmd+P` | Open file by name (fuzzy search across all loaded resources) |
| `Ctrl+Shift+O` / `Cmd+Shift+O` | Jump to a function or symbol within the current file |
| `Ctrl+G` / `Cmd+G` | Jump to a specific line number in the current file |
| `Ctrl+F` / `Cmd+F` | Search within the current file |
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Search across all files |

`Ctrl+P` is one of the highest-leverage shortcuts in DevTools. In a large app with hundreds of bundled modules, typing a partial file name and pressing Enter is far faster than expanding the tree manually.

---

## All Breakpoint Types

### Line-of-Code Breakpoints

Click the line number in the gutter (the grey number column to the left of code). A blue arrow or badge appears. The debugger will pause before that line executes.

To remove: click the badge again. To disable without removing: right-click the badge and choose "Disable breakpoint." Disabled breakpoints show as grey rather than blue.

### Conditional Breakpoints

Right-click a line number and choose **Add conditional breakpoint**. Enter any JavaScript expression. The debugger pauses on that line only when the expression evaluates to truthy.

```js
// Only pause when processing the third item in a loop
index === 2

// Only pause when a specific user triggers the code path
user.id === 'acct_12345'

// Only pause after the function has been called many times
++window.__callCount > 100
```

Conditional breakpoints are underlined in orange rather than the standard blue. They are especially useful in loops or event handlers that fire hundreds of times — setting an unconditional breakpoint there would require pressing Resume repeatedly.

### Logpoints

Right-click a line number and choose **Add logpoint**. Enter a message or expression. When execution reaches that line, the value is printed to the Console without pausing execution.

```js
// In the logpoint dialog, enter:
`user=${JSON.stringify(user)}, cart total=${cart.total}`
```

Logpoints are displayed as pink diamonds in the gutter. They are equivalent to adding a `console.log` but require no source edits and no redeploy. They survive page navigation for the current DevTools session.

### DOM Breakpoints

Set from the Elements panel: right-click a DOM node and hover "Break on." Choose from:

- **Subtree modifications** — any descendant node added, removed, or reordered
- **Attribute modifications** — any attribute on the node changed
- **Node removal** — the node itself is removed from the DOM

When one of these fires, execution pauses in the Sources panel with the call stack pointing at the JavaScript that caused the mutation. All active DOM breakpoints appear in the **DOM Breakpoints** section of the Sources panel's right column.

### XHR / Fetch Breakpoints

In the right column, expand **XHR/Fetch Breakpoints** and click `+`. Enter a URL substring. Every `XMLHttpRequest` or `fetch()` call whose URL contains that string will pause execution at the point of the call.

Leave the field blank to break on every network request.

```
/api/cart          — pauses on any request to a cart endpoint
checkout           — pauses on any URL containing "checkout"
                   — (blank) pauses on every fetch or XHR
```

### Event Listener Breakpoints

Expand **Event Listener Breakpoints** in the right column. Categories include:

- Animation, Canvas, Clipboard, Control, Device, DOM Mutation
- Drag / drop, Geolocation, Keyboard, Load, Media, Mouse
- Pointer, Script (first statement, script execution), Storage
- Timer (setInterval, setTimeout), Touch, WebAudio, WebGL, Worker

Check any sub-item to pause whenever that event fires anywhere on the page, regardless of how many handlers are registered or whether the handler is inside minified/third-party code.

"Script > Script First Statement" is useful when you cannot identify where your scripts start executing: it pauses at the top of every script block.

### Exception Breakpoints

In the right column, find the **pause on exceptions** button (a hexagon icon with a pause symbol, or the toggle labeled "Pause on exceptions"). Two modes:

- **Pause on all exceptions** — pauses on both caught and uncaught exceptions
- **Pause on uncaught exceptions** — pauses only on exceptions that are not caught by any try/catch

When paused on an exception, the Scope pane shows the thrown value and the call stack shows exactly where it originated — far more useful than reading a stack trace from the Console after the fact.

---

## Debugger Controls

When execution is paused, a toolbar appears at the top of the right column (or as a floating bar):

| Button | Shortcut | Action |
|---|---|---|
| Resume | `F8` | Continue execution until the next breakpoint |
| Step over | `F10` | Execute the current line; if it calls a function, run the entire function without entering it |
| Step into | `F9` | If the current line calls a function, enter that function on its first line |
| Step out | `Shift+F11` | Run until the current function returns, then pause in the caller |
| Step (one instruction) | `F9` while holding | Move one statement at a time including into async frames |

**Restart frame** — Right-click any frame in the Call Stack pane and choose "Restart frame." Execution jumps back to the beginning of that function without reloading the page. This is useful when you overstepped and need to rerun a function to inspect it again. Note: it does not undo side effects (mutations to the DOM, network requests already sent).

**Deactivate all breakpoints** — The breakpoints icon with a slash through it (or `Ctrl+F8`). All breakpoints are ignored until you re-enable. Useful when you want to run the page normally but keep your breakpoints in place for later.

---

## Scope Pane

While paused, the Scope pane shows every variable accessible at the current execution point, organized by scope chain:

**Local** — Variables declared in the current function (var, let, const) plus function arguments.

**Block** — Variables declared with let or const inside the current block (if, for, etc.) that are narrower than the function scope.

**Closure** — Variables captured from enclosing functions. If a callback closes over a variable from its parent, that variable appears here.

**Script** — Variables declared at module or script top level but not on the global object.

**Module** — Exports and imports in ES module files.

**Global** — The window object and everything attached to it.

### Editing Variable Values Live

Double-click any value in the Scope pane to edit it. Press Enter to commit. The change takes effect immediately — the next step or resume uses the new value.

```js
// Example: paused inside a function, original value
let discount = 0.05;

// Double-click 0.05 in Scope pane, type 0.5, press Enter
// Now the rest of the function runs with discount = 0.5
```

This is faster than writing console commands in many scenarios. You can also expand objects and arrays and edit nested properties in the same way.

---

## Call Stack Pane

The call stack shows the sequence of function calls that led to the current paused position. The topmost frame is the current function; the frame below it is the caller, and so on.

Click any frame to jump to that location in the editor and update the Scope pane to reflect that frame's variables. This lets you inspect state at every level of the call chain without setting additional breakpoints.

### Blackboxing Frames

Third-party or framework frames (React, Lodash, webpack runtime) often appear in the call stack and add noise. Right-click any frame and choose **Ignore list** (formerly "Blackbox script"). The script is added to the ignore list:

- Blackboxed frames collapse into a single "N frames hidden" entry
- The debugger does not pause inside blackboxed scripts even when "pause on exceptions" is active
- Step-into skips over blackboxed code

### Restart Frame

Right-click any frame in the call stack and choose **Restart frame** to re-execute from the start of that function. Combine with live editing of variables in the Scope pane to test different inputs without a page reload.

---

## Watch Expressions

The Watch pane (in the right column, above or below Scope depending on DevTools version) evaluates JavaScript expressions every time the debugger pauses.

**Adding an expression:**
Click the `+` icon in the Watch pane header and type any valid JavaScript expression:

```js
user.profile.email
cart.items.length
Date.now() - window.__pageLoadTime
JSON.stringify(state, null, 2)
performance.memory.usedJSHeapSize / 1e6
```

**Behavior:**
- Expressions refresh automatically each time you step or resume-to-breakpoint
- If an expression throws an error (e.g., because a variable is not in scope), it shows `<not available>` or the error message
- Right-click an expression to edit or delete it
- Watch expressions persist across page reloads within the same DevTools session

Watch expressions are more powerful than typing in the Console while paused because they update automatically with every step, letting you see how values change as you move through code.

---

## Breakpoints Pane

The Breakpoints pane lists every line-of-code, conditional, and logpoint you have set across all files. Each entry shows the file name, line number, and (for conditional/log) the expression.

Actions available in the pane:
- **Checkbox** next to each breakpoint — enable or disable without removing
- **Click** the text — navigate the editor to that breakpoint's location
- **Right-click** — remove, disable, edit condition, or remove all breakpoints
- **Deactivate all** button at the top — global pause/resume of all breakpoints

The Breakpoints pane is also where DOM Breakpoints, XHR/Fetch Breakpoints, and Event Listener Breakpoints appear in separate sub-sections, giving you a single place to audit everything that can halt execution.

---

## Blackboxing / Ignore List

The ignore list tells the debugger to treat certain scripts as infrastructure rather than application code. When a script is ignored:

1. The debugger skips it during step-into
2. Pausing on exceptions does not stop inside it
3. Its frames are hidden in the call stack (collapsed with a toggle to expand if needed)
4. It does not count as a "user gesture" for purpose of async task attribution

### Ignoring node_modules and Framework Code

**Method 1 — Right-click a file in the navigator:** right-click any script and choose "Add to ignore list."

**Method 2 — Right-click a call stack frame:** right-click a frame from library code and choose "Ignore list."

**Method 3 — Settings configuration:**

Open DevTools Settings (`F1`), go to **Ignore List**. Add patterns using regular expressions:

```
/node_modules/
/webpack/bootstrap
\.min\.js$
/react-dom/
/@babel/runtime/
/chunk\.\w+\.js$
```

Each line is a separate regex tested against the full script URL. Entries with a checkmark are active.

**Recommended patterns for most projects:**

```
/node_modules/
\.min\.js$
/vendor\.
/runtime\.\w+\.js$
```

After adding these, stepping through your own code will no longer plunge into React internals or utility library source.

---

## Source Maps

### What They Are

Browsers execute JavaScript that has been transformed: minified (whitespace removed, names shortened), bundled (many files concatenated), transpiled (TypeScript or modern JS compiled to ES5), or all three. A source map is a separate file (or an inline data URL) that encodes the mapping between positions in the transformed output and positions in the original source files.

A source map file looks like:

```json
{
  "version": 3,
  "sources": ["src/app.ts", "src/utils.ts"],
  "sourcesContent": ["...original source..."],
  "mappings": "AAAA,SAAS,GAAG..."
}
```

The transformed file links to the map via a comment at the end:

```js
//# sourceMappingURL=bundle.js.map
```

When DevTools loads a script with this comment, it fetches the map, reconstructs the original file tree in the File Navigator, and shows original source in the editor. Breakpoints set in original source automatically translate to the correct offset in the transformed bundle.

### Configuring webpack to Emit Source Maps

```js
// webpack.config.js
module.exports = {
  // Development: fast rebuild, full fidelity
  devtool: 'eval-source-map',

  // Production: separate .map files, not served publicly unless intended
  devtool: 'source-map',

  // Production: inline source maps in the bundle (larger files, always accessible)
  devtool: 'inline-source-map',

  // Production: maps only for error reporting tools, not served to browsers
  devtool: 'hidden-source-map',
};
```

### Configuring Vite to Emit Source Maps

```js
// vite.config.js
export default {
  build: {
    sourcemap: true,         // separate .map files
    sourcemap: 'inline',     // embedded in bundle
    sourcemap: 'hidden',     // generated but no sourceMappingURL comment
  },
};

// For dev server (already on by default):
export default {
  server: {
    sourcemapIgnoreList: (path) => path.includes('node_modules'),
  },
};
```

### Debugging Minified Code Without Source Maps

If source maps are unavailable, use **Pretty Print** (see section below). The debugger can also pause in minified code; the Scope pane will show minified variable names like `a`, `b`, `t` rather than the originals. Map short names back to intent by reading surrounding code and checking what values are in scope.

---

## Overrides

Overrides let you replace any network response — a script, stylesheet, JSON file, or HTML page — with a local file. The browser loads the page normally from the network but DevTools intercepts specific requests and serves your local version instead.

### Setting Up Overrides

1. Open Sources panel, click the **Overrides** tab in the File Navigator.
2. Click **Select folder for overrides** and choose a local directory (e.g., `~/devtools-overrides`). Chrome will ask for filesystem permission — click "Allow."
3. Navigate to any file in the **Page** tab, open it in the editor.
4. Edit the file. A purple dot appears in the gutter. The next page reload serves your version.

Alternatively, right-click any request in the Network panel and choose **Override content** — DevTools creates the local file automatically and opens it for editing.

### How the File Is Matched

DevTools mirrors the URL structure: a file at `https://example.com/static/app.js` is stored locally at `<overrides-dir>/example.com/static/app.js`. You can create these files manually or let DevTools create them via the editor.

### Use Case: Testing a Fix Without Deploying

```js
// Production file loaded from CDN (you cannot edit it directly)
// https://cdn.example.com/checkout/v3/payment.js (minified)

// Steps:
// 1. Network panel > find payment.js > right-click > Override content
// 2. DevTools creates: ~/devtools-overrides/cdn.example.com/checkout/v3/payment.js
// 3. Pretty-print the file, locate the bug, apply the fix
// 4. Reload the page — your local version is served
// 5. Verify the fix works before handing it to the team

// When done: Sources > Overrides > uncheck "Enable Local Overrides"
// to return to normal network behavior
```

Overrides persist across page reloads and DevTools restarts until you remove them. They are scoped to the DevTools profile, not the Chrome profile.

---

## Snippets

Snippets are scripts stored in DevTools that you can run on any page with a single keyboard shortcut. Unlike the Console, snippets support multi-line editing with full syntax highlighting and can be longer and more complex.

### Creating and Running a Snippet

1. Sources panel > **Snippets** tab in File Navigator.
2. Click `+` (New snippet) or right-click > "New snippet."
3. Type a name, write your code in the editor.
4. Run: `Ctrl+Enter` / `Cmd+Enter`, or right-click the snippet name > "Run."

To run a snippet from anywhere in DevTools: open the Command Menu (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type `!` followed by the snippet name.

### 5 Useful Snippets

**1. List all event listeners on the page**

```js
// snippet: list-listeners.js
const elements = document.querySelectorAll('*');
const results = [];

elements.forEach(el => {
  const listeners = getEventListeners(el);
  const types = Object.keys(listeners);
  if (types.length > 0) {
    results.push({ element: el, listeners });
  }
});

console.table(results.map(r => ({
  tag: r.element.tagName,
  id: r.element.id,
  classes: r.element.className,
  events: Object.keys(r.listeners).join(', '),
})));
```

**2. Extract all colors used on the page**

```js
// snippet: extract-colors.js
const colors = new Set();
document.querySelectorAll('*').forEach(el => {
  const style = getComputedStyle(el);
  ['color', 'backgroundColor', 'borderColor', 'outlineColor'].forEach(prop => {
    const value = style[prop];
    if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
      colors.add(value);
    }
  });
});
console.log([...colors].sort().join('\n'));
```

**3. Find all console.log calls in loaded scripts**

```js
// snippet: find-console-logs.js
// Patches console.log to show stack traces for every call
const original = console.log;
console.log = function(...args) {
  original.apply(console, args);
  original.call(console, new Error('console.log called from:').stack);
};
console.warn('console.log is now being traced. Reload page to stop.');
```

**4. Measure time to interactive for a user action**

```js
// snippet: measure-action.js
// Run this, then perform the action on the page
const label = 'my-action';
performance.mark(`${label}-start`);

// Observe when the main thread goes quiet
const observer = new PerformanceObserver(list => {
  const entries = list.getEntries();
  entries.forEach(e => console.log(e.name, e.duration.toFixed(2) + 'ms'));
});
observer.observe({ entryTypes: ['measure'] });

// Call this from the Console after the action completes:
window.endMeasure = () => {
  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);
  observer.disconnect();
};
console.log('Run window.endMeasure() after your action completes.');
```

**5. Dump all localStorage and sessionStorage to the Console**

```js
// snippet: dump-storage.js
const dump = (storage, name) => {
  const data = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    try {
      data[key] = JSON.parse(storage.getItem(key));
    } catch {
      data[key] = storage.getItem(key);
    }
  }
  console.group(name);
  console.table(data);
  console.groupEnd();
};

dump(localStorage, 'localStorage');
dump(sessionStorage, 'sessionStorage');
```

---

## Workspaces

Workspaces map a local directory to a browser origin so that edits you make in DevTools save directly to the files on disk. Unlike Overrides (which intercept network responses), Workspaces require your dev server to serve files from the mapped directory.

### Setting Up a Workspace

1. Open DevTools Settings (`F1`) > **Workspace** tab, or drag a folder into the Sources panel.
2. Click **Add folder** and select your project root.
3. Chrome shows a permission prompt — click "Allow."
4. DevTools attempts to auto-map files by comparing network responses to file contents. Matched files show a green dot in the File Navigator.

### Manual Mapping

If auto-mapping fails (common with build tools that add hashes to filenames):

1. Right-click a file in the **Page** tab.
2. Choose **Map to file system resource**.
3. Navigate to and select the corresponding local file.

### Persisting Edits to Disk

Once mapped:
- Editing a JS file and saving (`Ctrl+S`) writes to disk.
- Editing a CSS file saves instantly on each keystroke (no Ctrl+S needed).
- Changes appear in your editor (VS Code, etc.) and are immediately tracked by git.

### Limitations

- Workspaces work well for CSS and simple JS edits.
- Editing a file that goes through a build step (TypeScript, JSX, SCSS) saves the source file but the browser continues serving the built output until you rebuild.
- HTML edits are not persisted in most setups.
- For build-tool projects, prefer the build tool's HMR (hot module replacement) over Workspaces.

---

## Debugging Async Code

Modern JavaScript is heavily asynchronous. Without special handling, pausing in an async callback would show only the microtask runtime in the call stack — the original caller would be invisible.

### Async Call Stacks

DevTools reconstructs the logical call stack across asynchronous boundaries. When paused inside a setTimeout callback or a resolved Promise, the call stack shows both:

1. The current synchronous frames (the callback itself)
2. Greyed-out "Async" frames showing where the async operation was initiated

```js
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`);  // set breakpoint here
  const data = await res.json();
  return data;
}

async function loadPage() {
  const user = await fetchUser(42);             // shows in async frames
  renderProfile(user);
}

loadPage();
```

When paused on the `fetch` line, the call stack shows:
```
fetchUser (app.js:2)          <- current frame
async (app.js:2)              <- await boundary
loadPage (app.js:8)           <- async initiator
(anonymous) (app.js:11)       <- original caller
```

### Promise Debugging

To debug a rejected promise chain:
1. Enable "Pause on uncaught exceptions" to catch unhandled rejections.
2. Enable "Pause on caught exceptions" temporarily to see where `.catch()` handles the rejection.
3. Use Watch expressions to monitor `promise.status` or intermediate resolved values.

For `.then()` chains, set a breakpoint inside each `.then()` callback to step through the chain one stage at a time.

### Async/Await Step-Through

Step-Into (`F9`) on an `await` expression behaves as follows:
- The first press enters the async function called by `await` if it is your own code.
- Pressing Step-Over (`F10`) advances past the `await` to the next line after it resolves — effectively skipping the waiting and landing where execution continues.

To step through a long async chain efficiently: set breakpoints on the lines after each `await` rather than pressing Step-Over repeatedly.

---

## Debugging Web Workers

Web Workers run JavaScript on a background thread. Each worker gets its own isolated JavaScript environment with no access to the DOM.

### Accessing Worker Scripts

1. In the Sources panel File Navigator under the **Page** tab, expand the origin. Workers appear listed below page scripts, labeled with their script URL.
2. Alternatively, opening a worker's script file directly in the editor makes it debuggable.

### Setting Breakpoints in Workers

Click line numbers in a worker script exactly as you would in a main-thread script. Breakpoints in workers pause only the worker thread; the main thread continues running.

When a worker is paused, a separate call stack appears in the Debugger pane. You can switch between the main thread and each worker thread using the thread selector at the top of the Call Stack section.

### Shared Workers and Service Workers

- Shared Workers appear in the same File Navigator tree.
- Service Workers are accessible from the **Application** panel > Service Workers, and their scripts also appear in Sources.
- Service worker breakpoints persist across page reloads because the worker may outlive the page.

---

## Pretty Print

When a file is minified — all code on one or a few long lines — click the `{}` button at the bottom-left of the editor (tooltip: "Format"). DevTools reformats the code in a read-only pretty-printed view.

```js
// Before pretty print (minified):
function add(a,b){return a+b}function mul(a,b){return a*b}const PI=3.14159;

// After pretty print (formatted):
function add(a, b) {
  return a + b;
}

function mul(a, b) {
  return a * b;
}

const PI = 3.14159;
```

You can set breakpoints in the pretty-printed view. DevTools maps them back to the original minified positions. Pretty print is temporary — it does not modify the actual network response or save to disk.

For TypeScript or JSX compiled output, pretty print is often sufficient to understand what is happening even without source maps.

---

## Complete Debugging Walkthrough

This walkthrough demonstrates the full cycle from observing a bug to confirming a fix using only the Sources panel.

### The Bug

Users report that adding a promo code to the shopping cart doubles the discount instead of applying it once. No error appears in the Console.

```js
// cart.js (simplified)
class Cart {
  constructor() {
    this.items = [];
    this.discount = 0;
  }

  applyPromoCode(code) {
    const promos = {
      SAVE10: 0.10,
      SAVE20: 0.20,
    };

    if (promos[code]) {
      this.discount += promos[code];  // bug: += instead of =
    }
  }

  getTotal() {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    return subtotal - (subtotal * this.discount);
  }
}
```

### Step 1 — Reproduce the Bug

1. Open the page in Chrome. Open DevTools (`F12`).
2. Navigate to the Sources panel.
3. Use `Ctrl+P` and type `cart.js` to open the file.

### Step 2 — Identify the Suspect Code

Reading `applyPromoCode`, the `+=` operator accumulates discount on repeated calls. This means clicking "Apply" twice applies the promo twice.

### Step 3 — Set a Breakpoint

Click the gutter on the line `this.discount += promos[code];`. A blue badge appears.

### Step 4 — Reproduce with Debugger Active

Go to the page, enter a promo code, and click "Apply." The debugger pauses on the breakpoint.

### Step 5 — Inspect Scope

The Scope pane shows:
```
Local:
  code: "SAVE10"
  this: Cart
    discount: 0        <- first application, correct so far
    items: Array(3)
```

Press Resume (`F8`). Click "Apply" again with the same code. The debugger pauses again.

Scope now shows:
```
Local:
  code: "SAVE10"
  this: Cart
    discount: 0.10     <- already has 0.10 from first call
    items: Array(3)
```

After resuming, `discount` becomes `0.20` — the promo has been applied twice.

### Step 6 — Confirm the Root Cause

The bug is `+=`. Each call to `applyPromoCode` adds to the existing discount. It should set `=` to replace any existing value, or check whether a promo has already been applied.

### Step 7 — Test a Fix Without Redeploying

1. In Sources, right-click the file tab and choose **Override content** (or use the Overrides tab).
2. DevTools creates a local copy. Edit the line:

```js
// Change this:
this.discount += promos[code];

// To this:
this.discount = promos[code];
```

3. Press `Ctrl+S` to save the override.
4. Reload the page. The override is served.
5. Apply the promo code twice. Verify `discount` stays at `0.10`.

### Step 8 — Validate the Call Stack

With the fix in place, set a logpoint on the fixed line:

```js
// Logpoint expression:
`applyPromoCode called with ${code}, discount set to ${promos[code]}`
```

Apply the promo twice. The Console shows the message twice, confirming the function runs twice, but the discount value is correctly set each time (not accumulated).

### Step 9 — Hand Off

Remove the override, apply the one-line fix in the actual source file, and commit. The debugging session confirmed the exact line, confirmed the fix works, and validated it against the real call pattern — all without modifying the production codebase until the fix was verified.

---

## Quick Reference Card

| Task | How |
|---|---|
| Open file | `Ctrl+P`, type filename |
| Jump to function | `Ctrl+Shift+O` |
| Jump to line | `Ctrl+G` |
| Add breakpoint | Click line number |
| Add conditional breakpoint | Right-click line number |
| Add logpoint | Right-click line number |
| Resume | `F8` |
| Step over | `F10` |
| Step into | `F9` |
| Step out | `Shift+F11` |
| Edit variable | Double-click value in Scope |
| Ignore library code | Right-click frame > Ignore list |
| Pretty print | `{}` button (bottom-left of editor) |
| Run snippet | `Ctrl+Enter` in snippet editor |
| Open command menu | `Ctrl+Shift+P` |
| Disable all breakpoints | `Ctrl+F8` |
| Override a file | Right-click in editor > Override content |

---

[← Web Devtools](/coding/web-devtools/)
