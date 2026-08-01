---
title: 02 Console Panel
---

# Chrome DevTools — Console Panel

A complete reference from first log message to advanced scripting, instrumentation, and live debugging.

---

## What the Console Is

The Console Panel is a JavaScript REPL (Read-Eval-Print Loop) embedded directly in the browser. It serves three distinct roles simultaneously:

1. **Log viewer** — every `console.*` call from your page, service workers, and extensions appears here in real time.
2. **Interactive shell** — you can evaluate arbitrary JavaScript against the live page, mutate the DOM, call your own functions, and inspect variables without touching source files.
3. **Diagnostic surface** — network errors, CSP violations, deprecation warnings, and uncaught exceptions all land here with source links and full stack traces.

Because it runs inside the page's JavaScript environment, code you type in the Console has the same access to `window`, `document`, and every global variable as your application code does.

---

## Opening the Console

### As the primary panel

- **Menu** → More Tools → Developer Tools → Console tab
- `Cmd+Option+J` (macOS) / `Ctrl+Shift+J` (Windows/Linux) — opens DevTools and lands directly on the Console panel

### As the Console Drawer

The Drawer lets the Console share the screen with any other panel (Sources, Elements, Network, etc.).

- `Escape` — toggles the Drawer open/closed while any other panel is active
- When the Drawer is open, the Console tab appears at the bottom of the DevTools window; all functionality is identical to the full-panel view

### From the Elements panel

Right-click any DOM node → **Inspect** → then press `Escape` to open the Drawer; `$0` in the Console will already reference the node you inspected.

---

## UI Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Elements  Console  Sources  Network  Performance  Memory  Application   │
├──────────────────────────────────────────────────────────────────────────┤
│  🚫  ⬇  ⚙  │  Filter                    │  Default levels ▼  │ top ▼   │
│  (clear)    │  (text / regex search box) │  (log level menu)  │(context)│
├─────────────────────────────────────────────────────────────────────────-│
│                                                                          │
│   LOG AREA                                                               │
│                                                                          │
│   ▶ Object {name: "Alice", age: 30}               VM42:1                │
│   [Error] Uncaught TypeError: x is not a function  app.js:17            │
│   [Warning] Deprecated API usage                   vendor.js:204        │
│   Hello, world!                                    app.js:3             │
│                                                                          │
│   (messages scroll upward, newest at bottom)                            │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  >  PROMPT (interactive JavaScript input)                                │
└──────────────────────────────────────────────────────────────────────────┘
```

**Toolbar elements (left to right):**

| Control | Purpose |
|---|---|
| Clear (🚫) | Clears visible log area (equivalent to `console.clear()`) |
| Preserve log checkbox | Keep messages across page navigations |
| Live Expressions (eye icon) | Pin a JS expression that auto-evaluates |
| Filter input | Text or `/regex/` search across log text |
| Log level dropdown | Show/hide by severity (Default, Verbose, Info, Warnings, Errors) |
| Context selector | Switch JS execution context (top frame, iframes, workers) |

---

## All Console Methods

### `console.log` — general output

The most common method. Accepts any number of arguments of any type. Objects are printed as interactive expandable trees.

```javascript
console.log('Hello, world!');
// Hello, world!

console.log('User:', { name: 'Alice', role: 'admin' });
// User: ▶ {name: "Alice", role: "admin"}

// Multiple values on one line
console.log(1, 'two', true, null, undefined, [3, 4]);
// 1 "two" true null undefined ▶ [3, 4]

// Template literal (no special Console support needed)
const count = 42;
console.log(`There are ${count} items.`);
// There are 42 items.
```

:::caution
Objects are passed by reference. If you log a mutable object and then modify it, expanding the log entry later shows the mutated state. Spread or JSON-serialize to capture a snapshot:
```javascript
const state = { count: 0 };
console.log({ ...state });   // snapshot — safe
state.count = 99;
```
:::

---

### `console.info` — informational messages

Identical to `console.log` in Chrome; shown with a blue (i) icon in some browsers. Filtered by the "Info" level selector.

```javascript
console.info('Server responded in 120ms');
console.info('Feature flag "dark_mode" is enabled for this user');
```

---

### `console.warn` — warnings

Prints with a yellow background and a ⚠ icon. Filtered by the "Warnings" level.

```javascript
console.warn('localStorage is nearly full (%d / %d bytes used)', 4800000, 5000000);
console.warn('Deprecated: use newApi() instead of oldApi()');

// Useful for surfacing non-fatal problems during development
function divide(a, b) {
  if (b === 0) {
    console.warn('divide() called with b=0, returning Infinity');
  }
  return a / b;
}
```

---

### `console.error` — errors

Prints with a red background and a ✖ icon. Always includes a stack trace. Filtered by the "Errors" level.

```javascript
console.error('Failed to load user profile');
console.error(new Error('Network timeout after 5000ms'));

// Log an error object with extra context
try {
  JSON.parse('not json');
} catch (err) {
  console.error('JSON parse failed:', err);
}
```

---

### `console.debug` — debug-level output

Identical to `console.log` but hidden by the "Default" log level filter. Only visible when the level is set to "Verbose". Useful for high-frequency diagnostic logs you don't want cluttering the default view.

```javascript
function processChunk(chunk, index) {
  console.debug('[processChunk] index=%d, size=%d', index, chunk.byteLength);
}
```

---

### `console.trace` — stack trace at call site

Prints the current call stack without throwing an error. Invaluable for tracing which code path triggered a function.

```javascript
function c() { console.trace('Where was c() called?'); }
function b() { c(); }
function a() { b(); }
a();

// Output:
// Where was c() called?
//   c   @ VM1:1
//   b   @ VM1:2
//   a   @ VM1:3
//   (anonymous) @ VM1:4
```

```javascript
// Real-world use: find unexpected re-renders
function render() {
  console.trace('render triggered');
  // ... render logic
}
```

---

### `console.assert` — conditional logging

Logs only when the first argument is falsy. Does nothing when the condition is truthy. Prints as an error (red) when triggered.

```javascript
console.assert(1 === 1, 'Math is broken');        // nothing logged
console.assert(1 === 2, 'One does not equal two'); // Assertion failed: One does not equal two

// Practical: validate assumptions without throwing
const MAX = 100;
function setProgress(value) {
  console.assert(value >= 0 && value <= MAX, 'setProgress: value out of range', value);
  // ... proceed
}
setProgress(150); // Assertion failed: setProgress: value out of range 150
```

```javascript
// Assert with object context
const user = { id: 7, name: 'Bob' };
console.assert(user.id > 0, 'Expected positive user.id', { user });
```

---

### `console.table` — tabular display

Renders arrays or objects as formatted tables. Optional second argument is an array of column names to display.

```javascript
// Array of primitives
console.table(['alpha', 'beta', 'gamma']);
// ┌─────────┬──────────┐
// │ (index) │  Values  │
// ├─────────┼──────────┤
// │    0    │  "alpha" │
// │    1    │  "beta"  │
// │    2    │  "gamma" │
// └─────────┴──────────┘

// Array of objects — each key becomes a column
const users = [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob',   role: 'editor' },
  { id: 3, name: 'Carol', role: 'viewer' },
];
console.table(users);

// Show only selected columns
console.table(users, ['name', 'role']);
// ┌─────────┬─────────┬──────────┐
// │ (index) │  name   │   role   │
// ├─────────┼─────────┼──────────┤
// │    0    │ "Alice" │ "admin"  │
// │    1    │  "Bob"  │ "editor" │
// │    2    │ "Carol" │ "viewer" │
// └─────────┴─────────┴──────────┘

// Object keyed by string — keys become the index column
const inventory = { apples: 5, bananas: 12, oranges: 3 };
console.table(inventory);
```

---

### `console.group` / `console.groupCollapsed` / `console.groupEnd` — nested log groups

Visually groups related log messages under a collapsible heading. `groupCollapsed` starts collapsed; `group` starts expanded.

```javascript
console.group('User Authentication Flow');
  console.log('1. Validating credentials...');
  console.log('2. Fetching user record...');
  console.group('Token Generation');
    console.log('2a. Creating access token (expires 1h)');
    console.log('2b. Creating refresh token (expires 30d)');
  console.groupEnd();  // closes Token Generation
  console.log('3. Setting session cookie');
console.groupEnd();    // closes User Authentication Flow
```

```javascript
// Collapsed by default — useful for verbose but rarely-needed info
async function fetchAll(urls) {
  const results = [];
  for (const url of urls) {
    console.groupCollapsed(`Fetching: ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', data);
    console.groupEnd();
    results.push(data);
  }
  return results;
}
```

```javascript
// Nested groups for hierarchical data
function logTree(node, depth = 0) {
  console.group(node.name);
  if (node.children) {
    node.children.forEach(child => logTree(child, depth + 1));
  }
  console.groupEnd();
}
```

---

### `console.time` / `console.timeEnd` / `console.timeLog` — timing

Measures wall-clock elapsed time between calls. Labels are strings that pair calls together.

```javascript
// Basic timing
console.time('data-load');
const response = await fetch('/api/data');
const data = await response.json();
console.timeEnd('data-load');
// data-load: 243.7ms

// Intermediate checkpoints with timeLog
console.time('pipeline');
const raw = await loadRawData();
console.timeLog('pipeline', 'raw data loaded');   // pipeline: 120ms raw data loaded
const parsed = parseData(raw);
console.timeLog('pipeline', 'data parsed');        // pipeline: 185ms data parsed
const rendered = render(parsed);
console.timeEnd('pipeline');                        // pipeline: 210ms
```

```javascript
// Multiple independent timers run concurrently
console.time('alpha');
console.time('beta');
// ... do work ...
console.timeEnd('beta');  // beta: 50ms
// ... more work ...
console.timeEnd('alpha'); // alpha: 130ms
```

---

### `console.count` / `console.countReset` — call counter

Counts how many times a labeled counter has been incremented.

```javascript
function handleClick(eventType) {
  console.count(eventType);
  // ... handle event
}

handleClick('click');   // click: 1
handleClick('click');   // click: 2
handleClick('keydown'); // keydown: 1
handleClick('click');   // click: 3

console.countReset('click');
handleClick('click');   // click: 1  (reset)
```

```javascript
// Default label is "default"
for (let i = 0; i < 5; i++) {
  console.count();
}
// default: 1
// default: 2
// default: 3
// default: 4
// default: 5
```

---

### `console.dir` / `console.dirxml` — structured object view

`console.dir` forces object display as a JS property tree, even for DOM nodes (instead of showing HTML markup). `console.dirxml` displays DOM/XML nodes as markup trees.

```javascript
const btn = document.querySelector('button');

console.log(btn);    // shows the element as rendered HTML: <button id="submit">
console.dir(btn);    // shows as JS object tree: ▶ HTMLButtonElement {accessKey: "", ...}

// Useful when you want programmatic properties rather than HTML
console.dir(document.body);
console.dir(window.location);
```

```javascript
// dirxml renders XML/HTML structure
const xml = new DOMParser().parseFromString('<root><child id="1"/></root>', 'text/xml');
console.dirxml(xml);  // displays the XML tree visually
```

---

### `console.clear` — clear the log

```javascript
console.clear();
// Clears all visible messages
// Prints: "Console was cleared" (so you know it happened)
```

Note: if "Preserve log" is checked, `console.clear()` is silently ignored.

---

### `console.profile` / `console.profileEnd` — CPU profiling

Programmatically start and stop a CPU profile, which then appears in the Performance panel. The label identifies the recording.

```javascript
console.profile('sorting-algorithm');

const largeArray = Array.from({ length: 100000 }, () => Math.random());
largeArray.sort((a, b) => a - b);

console.profileEnd('sorting-algorithm');
// Profile saved. Open Performance panel > Profiles to view it.
```

:::caution
These methods are non-standard and only work in Chrome/DevTools. Remove them before shipping to production.
:::

---

### Formatting with `%s`, `%d`, `%i`, `%f`, `%o`, `%O`, `%c`

Console methods support `printf`-style substitution in the first string argument.

| Specifier | Substitution type |
|---|---|
| `%s` | String |
| `%d` / `%i` | Integer |
| `%f` | Floating-point number |
| `%o` | Object (expandable, respects DevTools formatting) |
| `%O` | Object (generic JS object view) |
| `%c` | Apply CSS styles to subsequent text |

```javascript
// %s — string substitution
console.log('Hello, %s! You have %d messages.', 'Alice', 5);
// Hello, Alice! You have 5 messages.

// %d — integer
console.log('Page %d of %d', 3, 10);
// Page 3 of 10

// %f — float (useful for precise rounding display)
console.log('Pi is approximately %f', Math.PI);
// Pi is approximately 3.141592653589793

// %o — optimal object representation
const el = document.body;
console.log('Element: %o', el);   // shows as DOM node with HTML preview
console.log('Element: %O', el);   // shows as plain JS property tree

// %c — styled output
console.log(
  '%cSUCCESS%c User logged in',
  'background:#22c55e; color:#fff; padding:2px 6px; border-radius:3px; font-weight:bold;',
  'color: inherit;'  // reset style for the rest of the message
);

console.log(
  '%cERROR%c Failed to save',
  'background:#ef4444; color:#fff; padding:2px 6px; border-radius:3px; font-weight:bold;',
  ''
);
```

```javascript
// Multiple %c blocks — each needs its own CSS argument
console.log(
  '%cinfo%c %cdebug%c message body',
  'color:blue; font-weight:bold;',  // styles "info"
  '',                                // reset
  'color:gray; font-style:italic;', // styles "debug"
  ''                                 // reset
);
```

---

## Filtering Logs

### Log level filter

The **Default levels** dropdown controls which message types are visible:

| Level | What is shown |
|---|---|
| Default | `log`, `info`, `warn`, `error` (not `debug`) |
| Verbose | All levels including `debug` |
| Info | Only `info` messages |
| Warnings | Only `warn` messages |
| Errors | Only `error` messages |

Tip: during development, keep it on "Default". Switch to "Verbose" only when debugging low-level diagnostics, because `debug()` calls in libraries can be extremely noisy.

### Text search and regex filter

The filter input box in the toolbar searches across the text content of all log messages:

- **Plain text** — case-insensitive substring match: `user` matches `User data loaded`
- **Regex** — wrap in slashes: `/fetch.*timeout/i` matches messages where "fetch" appears before "timeout" (case-insensitive)
- **Negate** — prefix with `-`: `-[Violation]` hides all violation messages

```
Filter examples:
  "api"            → show only messages containing "api"
  "/^Error:/i"     → messages starting with "Error:"
  "-favicon"       → hide favicon-related noise
  "/\d{3}ms/"      → messages that mention a millisecond duration like 120ms
```

### Sidebar

Click the **Show Console Sidebar** icon (three stacked lines, left of the filter input) to open a categorized sidebar:

- **All messages** — total count
- **User messages** — only calls from your own code (not browser-generated)
- **Errors** — count badge; click to filter to errors only
- **Warnings** — same
- **Info**
- **Verbose**

### Hide network / Hide violations

Inside the **⚙ Console Settings** gear:

- **Hide network** — suppresses failed-fetch and CORS error messages that the browser logs automatically (reduces noise when you're already watching the Network panel)
- **Hide violations** — hides `[Violation]` messages such as "Added non-passive event listener" and "Forced reflow" that originate from the browser's performance heuristics

---

## Console Settings

Access via the **⚙ gear icon** in the Console toolbar.

| Setting | What it does |
|---|---|
| **Preserve log** | Keeps existing messages when the page navigates or reloads. Essential when debugging redirect flows. |
| **Show timestamps** | Prepends each message with a HH:MM:SS.mmm timestamp. |
| **Eager evaluation** | Shows a live preview of the expression you are typing before you press Enter, including return values and side-effect warnings. |
| **Autocomplete from history** | Suggests previously typed expressions as you type. |
| **Group similar messages** | Collapses repeated identical messages into a single entry with a badge count instead of flooding the log. |
| **Show CORS errors in console** | Toggle CORS-related error messages (default: on). |

---

## Console Utilities API (DevTools-only)

These are convenience functions injected by DevTools into the Console environment. They are **not available in your page code** and will throw `ReferenceError` if called from a script file. Use them only in the interactive Console prompt or Live Expressions.

---

### `$()` and `$$()` — querySelector shortcuts

```javascript
// $() is document.querySelector
const header = $('h1');
console.log(header.textContent);

// Optional second argument scopes to a subtree
const nav = $('nav');
const firstLink = $('a', nav);  // first <a> inside <nav>

// $$() is document.querySelectorAll, but returns a real Array (not NodeList)
const allLinks = $$('a[href^="https"]');
allLinks.forEach(link => console.log(link.href));

// Because it returns an Array you can chain
$$('input[type="checkbox"]')
  .filter(cb => cb.checked)
  .map(cb => cb.value);
```

---

### `$x()` — XPath queries

Returns an array of nodes matching the XPath expression.

```javascript
// All paragraph elements — equivalent to $$('p')
$x('//p');

// Paragraphs that contain the text "deprecated"
$x('//p[contains(text(), "deprecated")]');

// All links whose href starts with "https"
$x('//a[starts-with(@href, "https")]');

// Immediate children of a specific element
const section = $('section#intro');
$x('./h2', section);   // h2 elements inside #intro (note leading dot = relative)
```

---

### `$0`–`$4` — last inspected elements

DevTools tracks the last five elements you selected in the Elements panel.

```javascript
$0  // the currently selected element
$1  // the previously selected element
$2, $3, $4  // older selections

// Typical workflow:
// 1. Click an element in the Elements panel
// 2. Switch to Console (or open Drawer with Escape)
$0.style.outline = '2px solid red';          // highlight it
console.log($0.getBoundingClientRect());     // inspect dimensions
$0.dispatchEvent(new Event('click'));         // trigger events on it
```

---

### `$_` — last evaluated result

Holds the return value of the most recently evaluated expression.

```javascript
2 + 2
// 4
$_
// 4
$_ * 10
// 40
$_
// 40

// Useful when you forgot to assign a result:
document.querySelectorAll('.card')
// NodeList(12) [...]
$_.length
// 12
```

---

### `copy(value)` — copy to clipboard

Serializes a value and copies it to the system clipboard. Works with strings, objects, DOM nodes, and arrays.

```javascript
// Copy a JS object as JSON
copy({ name: 'Alice', scores: [95, 87, 91] });
// Clipboard now contains: {"name":"Alice","scores":[95,87,91]}

// Copy all href values from the page as JSON array
copy($$('a').map(a => a.href));

// Copy the outerHTML of an element
copy($0.outerHTML);

// Copy local storage
copy(Object.fromEntries(Object.entries(localStorage)));
```

---

### `inspect(element)` — navigate to Elements panel

```javascript
// Jump to an element in the Elements panel
inspect($('main'));
inspect(document.getElementById('app'));

// Also works with functions — jumps to Sources panel at the function definition
inspect(Array.prototype.map);
```

---

### `getEventListeners(element)` — list attached event listeners

Returns an object keyed by event type, each value being an array of listener descriptors.

```javascript
getEventListeners(document);
// {
//   click: [{listener: f, useCapture: false, passive: false, once: false}, ...],
//   keydown: [{...}],
//   ...
// }

// Check a specific element
const btn = $('button#submit');
getEventListeners(btn);

// How many click listeners does this button have?
(getEventListeners(btn).click || []).length;

// List all listener functions attached to the window
Object.entries(getEventListeners(window))
  .forEach(([event, listeners]) =>
    console.log(event, listeners.length, listeners.map(l => l.listener.name))
  );
```

---

### `monitorEvents(element, events)` / `unmonitorEvents` — log DOM events

Logs every matching event dispatched on an element to the Console.

```javascript
// Monitor all events on the body
monitorEvents(document.body);
// [mousemove] MouseEvent {x: 340, y: 210, ...}
// [click]     MouseEvent {x: 100, y: 50, ...}

// Monitor specific event(s)
monitorEvents(window, 'resize');
monitorEvents($('form'), ['submit', 'reset']);

// Monitor a category of events (DevTools defines: mouse, key, touch, control)
monitorEvents($('input'), 'key');
// logs keydown, keyup, keypress as you type

// Stop monitoring
unmonitorEvents(document.body);
unmonitorEvents(window, 'resize');
```

---

### `monitor(fn)` / `unmonitor(fn)` — log every function call

Wraps a function so that every invocation is logged with the arguments passed.

```javascript
function greet(name, greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

monitor(greet);

greet('Alice');
// function greet called with arguments: "Alice"

greet('Bob', 'Hi');
// function greet called with arguments: "Bob", "Hi"

unmonitor(greet);
greet('Carol');  // no log
```

```javascript
// Monitor a method on a class instance
monitor(myComponent.render);
// Each render call will be logged
```

---

### `queryObjects(Constructor)` — find all live instances

Returns all objects currently on the heap that were created with the given constructor. Extremely useful for finding memory leaks.

```javascript
// Find all Arrays currently in memory
queryObjects(Array);

// Find all instances of a custom class
class EventEmitter { }
const e1 = new EventEmitter();
const e2 = new EventEmitter();
queryObjects(EventEmitter);
// [EventEmitter, EventEmitter]

// Find all Promises that haven't been GC'd
queryObjects(Promise);

// Find all HTMLDivElement instances
queryObjects(HTMLDivElement);
```

---

### `keys(obj)` / `values(obj)` — shorthand for Object methods

```javascript
const config = { host: 'localhost', port: 3000, debug: true };

keys(config);
// ["host", "port", "debug"]

values(config);
// ["localhost", 3000, true]

// Equivalent to (but shorter than):
Object.keys(config);
Object.values(config);
```

---

### `debug(fn)` / `undebug(fn)` — breakpoint on function call

Sets a breakpoint that fires in the Sources panel the next time the function is called, without modifying the source code.

```javascript
// Break whenever validateForm() is called
debug(validateForm);
// Now submit the form — DevTools pauses execution inside validateForm
// and opens the Sources panel at that line.

undebug(validateForm);  // remove the breakpoint

// Works on built-ins and prototype methods too:
debug(XMLHttpRequest.prototype.open);
// Pauses on every XHR open call
```

---

## Live Expressions

Live Expressions are JavaScript expressions pinned to the Console toolbar that re-evaluate automatically at ~250ms intervals and display their current value in real time.

### Creating a Live Expression

1. Click the **eye icon** (Create live expression) in the Console toolbar.
2. Type any JavaScript expression in the input that appears.
3. Click outside the box or press `Enter` — the expression is now pinned and updating.

### Use cases

```javascript
// Monitor frames per second
// Paste this expression into the Live Expression box:
// (Requires a requestAnimationFrame loop running on the page)
window.__fps || 'FPS not tracked'

// Track document scroll position
document.documentElement.scrollTop

// Watch a React component's state (if exposed as a global)
window.__DEBUG_STATE__?.user?.name

// Monitor WebSocket readyState
window.mySocket?.readyState

// Count DOM nodes (watch for memory leaks)
document.querySelectorAll('*').length

// Watch a specific element's class list
$0?.className

// Monitor audio playback time
document.querySelector('audio')?.currentTime
```

Multiple Live Expressions can be active simultaneously. Delete one by clicking the **✕** next to it.

---

## Async/Await in Console

The DevTools Console supports **top-level `await`** — you do not need to wrap async code in an async IIFE.

```javascript
// Fetch data directly
const res = await fetch('https://jsonplaceholder.typicode.com/users/1');
const user = await res.json();
console.table(user);

// Chain multiple awaits
const [posts, comments] = await Promise.all([
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/comments').then(r => r.json()),
]);
console.log('Posts:', posts.length, 'Comments:', comments.length);

// Use async utility functions inline
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
console.log('start');
await delay(2000);
console.log('2 seconds later');

// Dynamic import — load any ES module from the Console
const _ = await import('https://cdn.skypack.dev/lodash-es');
_.chunk([1, 2, 3, 4, 5], 2);
// [[1,2],[3,4],[5]]

// Import a local module (requires the module to be on the same origin)
const { formatDate } = await import('/src/utils/date.js');
formatDate(new Date());
```

:::note
Top-level await in the Console is always available regardless of the page's own module setup.
:::

---

## Context Switching

By default the Console runs in the **top** frame context (the main document). Pages that embed iframes or run service workers create additional JavaScript contexts.

### Selecting a context

Use the **context dropdown** (shows "top" by default) in the Console toolbar to switch:

- **top** — the main page window
- Named iframes — e.g., `frame[name="payment-widget"]` or a URL-based label
- Service workers — listed when active
- Extension content scripts — if DevTools extensions inject them

```javascript
// After switching context to an iframe, these refer to the iframe's document:
document.title
window.location.href
$('h1').textContent

// Access an iframe's window from the top context without switching:
const frame = document.querySelector('iframe#checkout');
const frameWin = frame.contentWindow;
// Note: only works if the iframe is same-origin
frameWin.document.querySelector('form');
```

### Programmatic cross-frame access (same-origin only)

```javascript
// From the top context
const iframe = document.querySelector('iframe');
const iDoc = iframe.contentDocument;
const iWin = iframe.contentWindow;

iWin.someGlobalFunction();
iDoc.querySelector('#submit-btn').click();
```

---

## Cross-Origin and Console

When a page loads cross-origin iframes or scripts, DevTools enforces browser security boundaries:

- `console.log` calls inside a cross-origin iframe **do not appear** in the parent page's Console — you must switch context to the iframe to see them.
- Cross-origin errors caught by `window.onerror` appear as `"Script error."` with no stack trace — this is the browser's CORS protection for error details.
- To get full cross-origin error details, the response must include `Access-Control-Allow-Origin: *` (or the requesting origin) **and** the `<script>` tag must carry the `crossorigin` attribute:

```html
<script src="https://cdn.example.com/app.js" crossorigin="anonymous"></script>
```

```javascript
// With crossorigin set and correct CORS headers, window.onerror receives:
window.onerror = function(message, source, lineno, colno, error) {
  console.log({ message, source, lineno, colno, error });
};
```

---

## Reading Stack Traces

Every `console.error()` call and every uncaught exception prints a stack trace. Understanding the format speeds up debugging significantly.

```
Uncaught TypeError: Cannot read properties of undefined (reading 'name')
    at getUserName    (app.js:42:18)
    at renderProfile  (profile.js:15:22)
    at handleRoute    (router.js:88:5)
    at (anonymous)    (index.js:3:1)
```

Reading a trace:

- **Top line** — the error type and message. `TypeError`, `ReferenceError`, `SyntaxError`, `RangeError`, etc.
- **Each subsequent line** — one stack frame: `at FunctionName (file:line:column)`
- **Top frame** = where the exception was thrown.
- **Bottom frame** = the entry point (often an event handler, setTimeout callback, or module load).
- Click any `file:line:column` link to jump directly to that line in the Sources panel.
- Anonymous functions show as `(anonymous)`. Assign functions to named variables or use named function expressions to improve readability:

```javascript
// Anonymous — hard to trace
setTimeout(function() { doWork(); }, 100);

// Named — appears in stack trace
setTimeout(function doWorkAfterDelay() { doWork(); }, 100);

// Arrow with variable name — name inferred
const doWorkAfterDelay = () => { doWork(); };
setTimeout(doWorkAfterDelay, 100);
```

### Source maps

When DevTools has source maps loaded, the trace shows your original TypeScript/JSX source lines instead of the compiled bundle output. Verify source maps are loading via the Sources panel — if you see `.ts` / `.tsx` file names in the trace, source maps are working.

---

## Advanced

### Console as a scratchpad

The Console is a full JavaScript environment. Use it as a quick scratchpad without opening a file:

```javascript
// Test a regex without writing test code
const re = /^(\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
[
  '(555) 867-5309',
  '555.867.5309',
  '5558675309',
  '867-5309',
].map(n => `${n}: ${re.test(n)}`);

// Manipulate page content directly
$$('.price')
  .map(el => parseFloat(el.textContent.replace('$', '')))
  .reduce((sum, n) => sum + n, 0)
  .toFixed(2);
// "1247.50"

// Build and download a file from page data
const data = $$('table tr').slice(1).map(row =>
  Array.from(row.querySelectorAll('td')).map(td => td.textContent).join(',')
).join('\n');

const blob = new Blob([data], { type: 'text/csv' });
const a = Object.assign(document.createElement('a'), {
  href: URL.createObjectURL(blob),
  download: 'export.csv',
});
a.click();
```

### Overriding `console` methods (production instrumentation)

You can replace `console.log` and friends with a custom implementation to add timestamps, remote logging, or filtering:

```javascript
// Save originals
const _log   = console.log.bind(console);
const _warn  = console.warn.bind(console);
const _error = console.error.bind(console);

// Remote log buffer
const remoteBuffer = [];

function sendToRemote(level, args) {
  remoteBuffer.push({ level, time: Date.now(), args: args.map(String) });
  if (remoteBuffer.length >= 10) {
    navigator.sendBeacon('/log', JSON.stringify(remoteBuffer.splice(0)));
  }
}

// Override
console.log = (...args) => {
  _log('[LOG]', ...args);
  sendToRemote('log', args);
};

console.error = (...args) => {
  _error('[ERR]', ...args);
  sendToRemote('error', args);
};

// Restore
console.log   = _log;
console.error = _error;
```

### `%c` styled logs — building a custom logger

```javascript
const logger = {
  _tag(label, bg, fg = '#fff') {
    return [
      `%c ${label} %c`,
      `background:${bg}; color:${fg}; padding:1px 6px; border-radius:3px; font-weight:600; font-size:11px;`,
      'color:inherit; font-weight:normal;',
    ];
  },
  info(...args)    { console.log(...this._tag('INFO',    '#3b82f6'), ...args); },
  success(...args) { console.log(...this._tag('OK',      '#22c55e'), ...args); },
  warn(...args)    { console.warn(...this._tag('WARN',   '#f59e0b'), ...args); },
  error(...args)   { console.error(...this._tag('ERROR', '#ef4444'), ...args); },
  debug(...args)   { console.debug(...this._tag('DEBUG', '#6b7280'), ...args); },
};

logger.info('Server started on port 3000');
logger.success('User Alice logged in');
logger.warn('Token expires in 5 minutes');
logger.error('Failed to write to database', new Error('Connection refused'));
logger.debug('Cache hit for key user:42');
```

### Detecting DevTools open state

```javascript
// One common (imprecise) heuristic: timing a debugger statement
let devtoolsOpen = false;

const threshold = 160;

setInterval(() => {
  const start = performance.now();
  // eslint-disable-next-line no-debugger
  debugger;
  const elapsed = performance.now() - start;
  devtoolsOpen = elapsed > threshold;
}, 500);
```

:::caution
This is a heuristic, not a reliable detection method. Use it only for analytics or UX hints, never for security enforcement.
:::

### Persisting Console output

The Console only keeps messages in memory. To capture output across a session:

1. **Right-click any message** → "Save as..." to export the current log as a text file.
2. Wrap `console.log` to write to `localStorage`:

```javascript
const _log = console.log.bind(console);
const STORAGE_KEY = 'console_log';
const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

console.log = (...args) => {
  _log(...args);
  stored.push({ t: new Date().toISOString(), msg: args.map(a => JSON.stringify(a)).join(' ') });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(-500))); // keep last 500
};

// To view stored logs later:
JSON.parse(localStorage.getItem('console_log')).forEach(e => _log(e.t, e.msg));
```

---

[← Web Devtools](/coding/web-devtools/)
