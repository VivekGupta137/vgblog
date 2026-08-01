---
title: 06 Memory Panel
---

# Chrome DevTools — Memory Panel

---

## What the Memory Panel Does

The Memory panel lets you inspect the JavaScript heap — the region of memory where all JS objects, strings, arrays, closures, and DOM nodes live. With it you can:

- Take point-in-time snapshots of every object currently allocated.
- Record which code paths are responsible for allocations over time.
- Compare two snapshots to find objects that survived a "suspect action" and were never freed.
- Follow the chain of references keeping an object alive (the *retention path*) to pinpoint the root cause of a leak.

Without the Memory panel, a leak is invisible: the tab's memory number in Task Manager climbs, pages get sluggish, and you have no idea why. The Memory panel turns that invisible problem into a named constructor and a file/line number.

---

## Memory Concepts You Must Understand

### Heap Memory: Shallow Size vs Retained Size

Every object on the heap has two sizes:

**Shallow size** — the memory occupied by the object itself: its property slots, the array buffer, the string characters. It does *not* include anything the object points to.

**Retained size** — the shallow size of the object PLUS the shallow size of every other object that would be freed if *this* object were freed. In other words: "how much memory would GC reclaim if I deleted this reference?"

```
        objA (shallow: 32 B)
        /       \
    objB         objC
(shallow: 64 B) (shallow: 128 B)
```

Retained size of `objA` = 32 + 64 + 128 = 224 B, assuming `objB` and `objC` are not referenced by anything else.

Retained size is the number you care about when hunting leaks. A tiny wrapper object can retain 50 MB if it holds a reference chain to a large buffer.

### Garbage Collection: Mark-and-Sweep and V8's Generational GC

JavaScript uses automatic memory management. The engine (V8 in Chrome) periodically runs the **garbage collector (GC)**, which:

1. Starts from a set of **GC roots** (more below).
2. **Marks** every object reachable from those roots.
3. **Sweeps** (frees) everything that was not marked.

V8 uses a **generational** strategy because most objects die young:

- **Young generation (Scavenger / Minor GC)**: small, fast collections on a semi-space. Newly created objects live here. Most die immediately.
- **Old generation (Major GC / Mark-Compact)**: objects that survived one or more scavenges are promoted here. Major GC is slower but runs less often.

Implication for profiling: if you take a snapshot right after a lot of allocation, minor GC may not have run yet. Always **force GC before snapshotting** (see the dedicated section).

### Memory Leak

A **memory leak** is an object that is no longer needed by the application but cannot be freed because at least one live reference still points to it. The GC is not broken — it is doing exactly what it should. The bug is the unintended reference keeping the object reachable.

Leaks accumulate over time: every user action appends to the leaked set, memory grows monotonically, and eventually the tab crashes or is killed by the OS.

### GC Roots

GC roots are the starting points of the mark phase. Any object reachable from a root is considered live. The main roots are:

- `window` and all its properties (global variables).
- The `document` object and the live DOM tree.
- Active call stacks (local variables in running functions).
- V8 internal structures (built-in objects, compiled code).

If an object is reachable from any root — directly or through any number of intermediate references — it will not be collected. Leaks are always a matter of an unintended path from a root to the object.

### Detached DOM Nodes

A **detached DOM node** is a DOM element that has been removed from the live document tree (`removeChild`, `innerHTML = ''`, etc.) but is still referenced by a JavaScript variable, closure, or data structure. The element is gone from the page but alive in the heap.

This is one of the most common and easiest-to-overlook leak patterns. A list item removed from the UI may still be held by an event handler, a cache object, or a stale React ref.

---

## UI Layout (ASCII Diagram)

```
+---------------------------------------------------------------+
|  DevTools                                                     |
|  [Elements][Console][Sources][Network][Performance][ Memory ] |
+---------------------------------------------------------------+
|                                                               |
|  SELECT PROFILING TYPE                                        |
|  ( ) Heap snapshot                                            |
|  ( ) Allocation instrumentation on timeline                   |
|  ( ) Allocation sampling                                      |
|                                                               |
|  [  Take snapshot  ]   Profiles:                              |
|                        Snapshot 1  (12.4 MB)                  |
|                        Snapshot 2  (14.1 MB)                  |
+-----------------------------+---------------------------------+
|  VIEW:  Summary | Comparison | Containment | Statistics       |
+-----------------------------+---------------------------------+
|  Filter: [________________] |                                 |
|                             |  RETAINERS                      |
|  Constructor        # Count |  --------------------------------|
|  > (array)          1,240   |  cache @Object                  |
|  > (closure)          840   |    handlers @Object             |
|  > HTMLDivElement     312   |      window / Global handles    |
|  > MyComponent         48   |                                 |
|  > DetachedHTMLDivEl    6   |                                 |
+-----------------------------+---------------------------------+
|  Shallow Size  |  Retained Size  |  Distance from GC root     |
+---------------------------------------------------------------+
```

**Key areas:**

- Top bar: choose the profiling type and start/stop recording.
- Left sidebar: saved profiles (snapshots or recordings) with their sizes.
- View switcher: Summary, Comparison, Containment, Statistics.
- Filter box: search by class/constructor name.
- Main table: constructor groups, counts, and sizes.
- Retainers pane (bottom right): the path from a selected object back to a GC root.

---

## Three Profiling Tools — When to Use Each

### Heap Snapshot

Takes a complete picture of everything currently allocated on the heap. Freezes JS execution briefly while it serializes all objects.

**Best for:** identifying *what* is leaking — which object types are accumulating. Standard workflow: take baseline, do the action, take second snapshot, compare.

**Cost:** can take several seconds and produce a large file for pages with many allocations. Not suitable for continuous monitoring.

### Allocation Instrumentation on Timeline

Records allocations continuously while you interact with the page. Shows a bar chart over time; each bar represents allocations in that time window. Blue bars are objects still alive; gray bars are objects that have since been collected.

**Best for:** finding *which user action or time window* causes allocations that are never freed. You can click a bar and see exactly what was allocated in that slice.

**Cost:** moderate overhead — expect a 10–30% slowdown. Not for profiling performance, only allocations.

### Allocation Sampling

Uses statistical sampling (similar to the CPU profiler) to attribute allocations to call stacks. Very low overhead.

**Best for:** long-running pages or production-like conditions where you cannot afford to slow the page down. Gives you a call-tree view of allocation hot spots. Less precise than the timeline tool but much cheaper.

**Cost:** low — typically under 5% overhead. Does not tell you whether objects are still alive; only where memory was allocated.

| Tool                    | Overhead | Shows retention | Shows call site | Use when                          |
|-------------------------|----------|-----------------|-----------------|-----------------------------------|
| Heap Snapshot           | High     | Yes             | No              | Hunting leaks (what is leaking)   |
| Allocation Timeline     | Medium   | Yes (blue/gray) | Yes             | Finding when/what allocates       |
| Allocation Sampling     | Low      | No              | Yes             | Long sessions, production-like    |

---

## Heap Snapshot Deep-Dive

### Taking a Snapshot (Force GC First!)

Before clicking "Take snapshot", click the garbage-can icon in the Memory panel toolbar (or press the button in DevTools command palette: `Ctrl+Shift+P` → "Collect garbage"). This forces a major GC, clearing short-lived objects so they do not clutter the snapshot.

```
Memory panel toolbar:
  [ Take snapshot ]   [  GC (trash icon)  ]   [ Clear all profiles ]
```

After forcing GC, click "Take snapshot". V8 pauses JS, serializes all live objects, and loads them into the panel. Large pages can take 5–15 seconds.

### Summary View

The default view. Objects are grouped by their **constructor** (the function that created them).

Columns:
- **Constructor** — the class/function name, e.g. `Array`, `Object`, `MyComponent`, `HTMLDivElement`.
- **Distance** — shortest path (in reference hops) from a GC root to this object. A high distance number is normal; a very *unexpected* constructor at distance 1 or 2 can be a clue.
- **Shallow Size** — total shallow bytes for all objects in this group.
- **Retained Size** — total retained bytes; the important column for leaks.

Click the triangle next to a constructor to expand individual instances. Click an instance to see its properties in the lower pane, and the retention path in the Retainers pane.

### Comparison View

The most important view for leak hunting. Select it from the view switcher *after* taking at least two snapshots. Choose the baseline snapshot in the "Compare to" dropdown.

Columns added in Comparison view:
- **# New** — objects that exist in the new snapshot but not the baseline.
- **# Deleted** — objects freed between snapshots.
- **# Delta** — `New - Deleted`.
- **Alloc. Size** — total bytes allocated for new objects.
- **Freed Size** — total bytes freed.
- **Size Delta** — net change.

Sort by **# New** or **Size Delta** (descending) to surface the constructors accumulating the most objects. Anything that should have been freed but shows a large positive delta is a suspect.

### Containment View

Shows the object graph top-down, starting from GC roots:

```
> GC roots
  > window
    > myCache (Object)
      > entries (Array)
        > [0] (MyComponent)
        > [1] (MyComponent)
```

Useful for exploring what a particular root is holding onto. Less common in day-to-day leak hunting but helpful when you know *which* root to investigate.

### Retainers Pane

Appears at the bottom when you click any object in the main table. Shows the **retention chain** — the path of references from the selected object back to a GC root.

```
  MyComponent @224816
    < handlers (Object) @218432
      < _listeners (Map) @204120
        < EventBus @196040
          < window (global)
```

Read it bottom-up: `window` holds `EventBus`, which holds a `Map` called `_listeners`, which holds the `handlers` object, which holds your `MyComponent`. If `MyComponent` should have been freed, the `_listeners` Map is where the leak lives.

The `@` number is the object's **heap address** — a stable identifier within a snapshot session.

### Statistics View

A pie chart breaking down heap usage by category:

- Code (compiled scripts)
- Strings
- JS arrays
- Typed arrays
- System objects
- Other

Useful for a quick sanity check: if "Strings" is 80% of your heap, you have a string accumulation issue, not a DOM node issue.

### Filtering by Class Name

Type in the Filter box above the constructor list to narrow results. Partial matches work.

Examples:
- `Detached` — shows all detached DOM nodes.
- `MyComponent` — shows your custom class.
- `closure` — shows all closures (useful for finding capturing leaks).
- `HTMLDivElement` — all div nodes.

### Distance from GC Root

The Distance column shows the minimum number of reference hops from any GC root to the object. Objects at distance 1 are directly on a root (e.g., a global variable). Objects at larger distances are deep in the graph.

When comparing snapshots, look for leaked objects at *unexpectedly small* distances — they are being held tightly by something close to the root.

---

## Step-by-Step Memory Leak Hunt

1. **Open the Memory panel.** Navigate to the page under test. Let it fully load and idle briefly.

2. **Force GC.** Click the trash-can icon in the Memory panel toolbar.

3. **Take baseline snapshot.** Click "Take snapshot". Label it mentally as "Snapshot 1 — baseline".

4. **Perform the suspect action N times.** For example: open a modal and close it 5 times, navigate to a route and back 5 times, or click a button that should create and destroy objects. Repeating N times amplifies the leak, making it easier to spot.

5. **Force GC again.** This ensures short-lived objects from the last action are collected before you snapshot.

6. **Take second snapshot.** This is "Snapshot 2 — after action".

7. **Switch to Comparison view.** In the view switcher, select "Comparison". In the "Compare to" dropdown, select Snapshot 1.

8. **Sort by "# New" descending.** The constructors with the most new surviving objects float to the top.

9. **Identify the leaking constructor.** Look for a constructor whose # New matches the number of times you performed the action (e.g., 5 new `MyModal` instances if you opened the modal 5 times and it should clean up on close).

10. **Click an instance to inspect it.** Expand the object in the main pane to see its properties.

11. **Read the Retainers pane.** Follow the chain from the object back to a GC root. Each step is a reference that is keeping the object alive. Find the step that should not exist.

12. **Fix the retention** (see leak patterns below) and repeat from step 1 to verify.

```
Baseline                        After 5x action
Snapshot 1                      Snapshot 2
    |                               |
    |---- take ------------------> [GC forced] --> [take]
                                         |
                                    Comparison view
                                    Sort by # New
                                         |
                                    MyModal: +5 new
                                         |
                                    Retainers: window > eventBus > listener > MyModal
                                         |
                                    Fix: remove listener on modal close
```

---

## Allocation Timeline

### Starting and Stopping Recording

1. Select "Allocation instrumentation on timeline".
2. Click "Start".
3. Interact with the page (perform the action you want to profile).
4. Click "Stop".

The panel shows a vertical bar chart over time. Each bar represents a time slice (roughly 50 ms intervals).

### Blue Bars vs Gray Bars

```
Timeline bar chart:

Time -->  0s        1s        2s        3s
          |         |         |         |
Height    |  [blue] |[blue]   |         |[blue]
          | [gray]  |         |[gray]   |
```

- **Blue bar** — objects allocated in that time slice that are **still alive** when recording stopped.
- **Gray bar** — objects allocated in that slice that have since been **collected** (normal, healthy).

You want blue bars only at times when the page is legitimately creating lasting objects. Blue bars that appear during actions that should be "clean" (e.g., closing a dialog) indicate leaks.

### Selecting a Bar to See Allocations

Click any bar (or drag to select a range) to filter the object list below to only objects allocated in that window. This shows exactly what was created and is still alive from that slice. Combine with the Retainers pane to trace why those objects survived.

---

## Allocation Sampling

### How It Differs from the Timeline Tool

Allocation instrumentation on timeline **instruments every allocation** — it records every `new` and every array push, which is accurate but expensive.

Allocation sampling uses a **statistical sampler**: it periodically pauses execution and records which function is currently allocating. The result is a **call tree** annotated with how much memory was allocated by each function (Self size) and everything it called (Total size).

It does **not** tell you whether those objects are still alive. It only tells you where bytes were allocated — like a CPU flame chart, but for memory.

### Using Allocation Sampling

1. Select "Allocation sampling".
2. Click "Start".
3. Use the page normally for 30 seconds to several minutes.
4. Click "Stop".
5. Inspect the call tree: functions with high "Self Size" are allocating heavily without delegating to sub-functions. High "Total Size" means the allocation happens somewhere in that subtree.

**When to use:** when you cannot reproduce a leak in a short session, or when you need to profile a page under realistic load without the overhead of full instrumentation. Common in CI/load-test environments where you attach DevTools remotely.

---

## Common Memory Leak Patterns

### 1. Accidental Global Variables

Variables assigned without `var`, `let`, or `const` inside a function become properties of `window` — a GC root — and never get collected.

**Bug:**
```js
function processData(data) {
  // Missing 'let' — this creates window.result
  result = data.map(x => x * 2);
  return result;
}

// Call it 1000 times: window.result grows unbounded,
// and each call's array leaks (window holds the last one,
// but the real danger is if this pattern is used for accumulation).
```

**Fix:**
```js
function processData(data) {
  const result = data.map(x => x * 2); // scoped, collected after return
  return result;
}
```

**How to spot in DevTools:** In a heap snapshot Summary view, look for `(string)` or `Array` objects at Distance 1 with unexpectedly high retained sizes. In Containment view, expand `window` to see all direct properties.

---

### 2. Forgotten setInterval / setTimeout

`setInterval` keeps its callback (and everything the callback closes over) alive forever unless `clearInterval` is called. This is one of the most common production leaks.

**Bug:**
```js
class LiveDashboard {
  constructor(elementId) {
    this.el = document.getElementById(elementId);
    this.data = new Array(100_000).fill(0); // large payload

    // interval holds a reference to 'this' via closure
    this.intervalId = setInterval(() => {
      this.render(); // 'this' is captured — LiveDashboard never freed
    }, 1000);
  }

  render() {
    this.el.textContent = this.data[0];
  }

  // destroy() exists but nobody calls clearInterval
  destroy() {
    // forgot: clearInterval(this.intervalId);
    this.el = null;
  }
}

// In a SPA: new LiveDashboard('dashboard') on every route visit,
// destroy() called on leave — but interval keeps firing and retains instance.
```

**Fix:**
```js
destroy() {
  clearInterval(this.intervalId); // stop the interval
  this.intervalId = null;
  this.el = null;
}
```

**How to spot:** In Comparison view after navigating to/from the route N times, `LiveDashboard` (or the constructor of whatever the closure retains) shows N new surviving instances. Retainers pane shows: `window > setInterval callback > (closure) > LiveDashboard`.

---

### 3. Closures Capturing Large Objects

A closure keeps the entire scope chain alive, not just the variables it actually uses. If a closure is stored somewhere persistent, all variables in its enclosing scope — including large ones — are retained.

**Bug:**
```js
function attachHandler(largeDataSet) {
  // largeDataSet: 10 MB array
  const summary = largeDataSet[0]; // we only need this one value

  document.getElementById('btn').addEventListener('click', () => {
    // Only 'summary' is used, but V8 must keep the entire 'largeDataSet'
    // in scope because the closure shares the scope with it.
    console.log(summary);
  });
}

attachHandler(hugeArray); // hugeArray never freed as long as button exists
```

**Fix:**
```js
function attachHandler(largeDataSet) {
  const summary = largeDataSet[0];
  largeDataSet = null; // sever the reference before creating the closure

  document.getElementById('btn').addEventListener('click', () => {
    console.log(summary); // closure now only retains 'summary'
  });
}
```

**Note:** V8 has gotten smarter about optimizing closures in some cases, but the safe pattern is always to explicitly null out large references before creating a closure that outlives the function.

**How to spot:** In heap snapshot, look for `(closure)` entries with large retained sizes. Click one and inspect its context variables in the properties pane.

---

### 4. Detached DOM Nodes

DOM nodes removed from the document but still referenced in JS accumulate silently.

**Bug:**
```js
let detachedList = [];

function addItem(text) {
  const li = document.createElement('li');
  li.textContent = text;
  document.getElementById('list').appendChild(li);
  detachedList.push(li); // keep reference for "future use"
}

function clearList() {
  document.getElementById('list').innerHTML = ''; // removes from DOM
  // detachedList still holds references to all li elements!
}
```

**Fix:**
```js
function clearList() {
  document.getElementById('list').innerHTML = '';
  detachedList = []; // release the JS references too
}
```

**How to spot:** In the heap snapshot filter box, type `Detached`. All entries matching `Detached HTMLLIElement`, `Detached HTMLDivElement`, etc. are detached nodes. Click one, read the Retainers pane to find which JS object is holding it.

---

### 5. Event Listeners Not Removed

`addEventListener` creates a strong reference from the DOM node (or EventTarget) to the listener function, and through the closure, to anything the listener captures. If you never call `removeEventListener`, the listener — and everything it holds — lives as long as the target element.

**Bug:**
```js
class SearchWidget {
  constructor() {
    this.results = new Array(50_000).fill('result'); // large

    // New anonymous function on every construction — cannot be removed
    window.addEventListener('resize', () => {
      this.layout(); // captures 'this'
    });
  }

  layout() { /* ... */ }

  destroy() {
    // Cannot call removeEventListener because we lost the function reference
  }
}

// Every time SearchWidget is created, another resize listener is added.
// After 10 navigations: 10 listeners, 10 SearchWidget instances, 500k 'result' strings.
```

**Fix:**
```js
class SearchWidget {
  constructor() {
    this.results = new Array(50_000).fill('result');

    // Store reference so we can remove it
    this._onResize = () => this.layout();
    window.addEventListener('resize', this._onResize);
  }

  layout() { /* ... */ }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    this._onResize = null;
    this.results = null;
  }
}
```

**Alternative — AbortController (modern pattern):**
```js
class SearchWidget {
  constructor() {
    this.results = new Array(50_000).fill('result');
    this._controller = new AbortController();

    window.addEventListener('resize', () => this.layout(), {
      signal: this._controller.signal
    });
  }

  layout() { /* ... */ }

  destroy() {
    this._controller.abort(); // removes ALL listeners registered with this signal
    this.results = null;
  }
}
```

**How to spot:** Comparison view shows growing `SearchWidget` count. Retainers shows: `window > EventListener list > (closure) > SearchWidget`.

---

### 6. Cache Without Eviction

An in-memory cache that grows without bound is a "soft leak" — the objects are intentionally retained, but there is no budget or eviction, so memory grows monotonically.

**Bug:**
```js
const cache = {}; // module-level, lives forever

async function fetchUser(id) {
  if (cache[id]) return cache[id];

  const user = await api.getUser(id);
  cache[id] = user; // stored forever
  return user;
}

// After fetching 10,000 unique users: 10,000 objects in cache, never freed.
```

**Fix — LRU cache with a size limit:**
```js
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.map = new Map(); // Map preserves insertion order
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    // Move to end (most recently used)
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.maxSize) {
      // Delete oldest (first) entry
      this.map.delete(this.map.keys().next().value);
    }
  }
}

const userCache = new LRUCache(500); // max 500 users

async function fetchUser(id) {
  const cached = userCache.get(id);
  if (cached) return cached;
  const user = await api.getUser(id);
  userCache.set(id, user);
  return user;
}
```

**How to spot:** In heap snapshots over time, the cache's backing data structure (`Object`, `Map`, `Array`) shows a steadily growing retained size with each snapshot.

---

## Finding Detached DOM Nodes

Detached DOM nodes deserve their own workflow because they are so common in SPAs.

**Step-by-step:**

1. Load the page and perform the action that creates and removes DOM elements (open/close a dialog, render/unmount a component, clear a list).
2. Force GC.
3. Take a heap snapshot.
4. In the Filter box, type `Detached`.
5. The constructor list now shows only detached element types: `Detached HTMLDivElement`, `Detached HTMLLIElement`, etc.
6. Expand a constructor group and click an instance.
7. In the Retainers pane, follow the chain to the GC root.

```
Filter: [Detached]

Constructor                   Count  Shallow  Retained
Detached HTMLDivElement          12   3,840    91,200
  > div @0x2a4f10              (select this)
  > div @0x2a4f88
  ...

Retainers:
  div @0x2a4f10
    < [3] (Array) @0x1c3200         <- index 3 of some array
      < componentCache (Object)
        < MyRouter @0x1b1100
          < window
                                    ^^ window.MyRouter.componentCache holds it
```

The fix is to clear `componentCache[key]` when the component is destroyed.

**React-specific note:** React's reconciler normally handles DOM cleanup, but stale refs (`useRef`) or values captured in event listeners attached outside React (e.g., on `window` or `document`) can cause exactly this pattern.

---

## WeakMap, WeakRef, WeakSet — Memory-Friendly Patterns

Standard `Map`, `Set`, and object properties create **strong references** — the GC cannot collect the value as long as the container exists. `WeakMap`, `WeakRef`, and `WeakSet` create **weak references** — the GC can collect the value even if the container still holds a reference to it.

### WeakMap

Keys must be objects. If the key object is collected, the entry is automatically removed.

**Use case:** associating private data with a DOM node or object without preventing its collection.

```js
// WRONG — Map keeps button alive even after removal from DOM
const handlerMap = new Map();

function attach(button) {
  const handler = () => doSomething(button);
  button.addEventListener('click', handler);
  handlerMap.set(button, handler); // button can never be GC'd while handlerMap lives
}

// RIGHT — WeakMap does not prevent collection
const handlerMap = new WeakMap();

function attach(button) {
  const handler = () => doSomething(button);
  button.addEventListener('click', handler);
  handlerMap.set(button, handler);
}

function detach(button) {
  const handler = handlerMap.get(button);
  if (handler) {
    button.removeEventListener('click', handler);
    // No need to call handlerMap.delete(button) — once button is GC'd,
    // the WeakMap entry disappears automatically.
  }
}
```

**Limitation:** WeakMap keys are not enumerable (you cannot iterate over them). This is intentional — it prevents keeping the key alive just to list it.

### WeakRef

Holds a weak reference to an object. Call `.deref()` to get the value; returns `undefined` if it has been collected.

```js
class DataProcessor {
  constructor(largeBuffer) {
    // Hold weakly — if nothing else references largeBuffer, it can be collected
    this._bufferRef = new WeakRef(largeBuffer);
  }

  process() {
    const buffer = this._bufferRef.deref();
    if (!buffer) {
      // Buffer was collected; fetch it again or bail out
      console.warn('Buffer was GC\'d, re-fetching');
      return;
    }
    // Use buffer...
  }
}
```

**Caution:** WeakRef is a low-level primitive. The spec intentionally does not guarantee *when* collection happens. Do not rely on it for program correctness; use it only for caches where stale-and-refetch is acceptable.

### WeakSet

Like `WeakMap` but stores only keys (no associated values). Useful for tracking whether you have "seen" an object without preventing its collection.

```js
const processed = new WeakSet();

function processOnce(obj) {
  if (processed.has(obj)) return;
  processed.add(obj);
  doExpensiveWork(obj);
  // When obj is no longer referenced elsewhere, processed entry disappears automatically
}
```

### Summary Table

| Type       | Strong? | Iterable? | Use case                                         |
|------------|---------|-----------|--------------------------------------------------|
| Map        | Yes     | Yes       | General key-value with enumeration needed        |
| WeakMap    | No      | No        | Metadata attached to objects; private data       |
| Set        | Yes     | Yes       | General unique-value collection                  |
| WeakSet    | No      | No        | "Seen" / "visited" tracking                      |
| WeakRef    | No      | N/A       | Optional cache; re-fetch-on-miss acceptable      |

---

## Forcing GC Before Taking a Snapshot

V8 runs GC lazily. If you take a snapshot without forcing GC, you will see thousands of short-lived objects that are about to be collected, making it hard to distinguish real leaks from normal churn.

**Methods to force GC:**

1. **Memory panel toolbar** — click the trash-can icon labeled "Collect garbage". This is the most reliable method; it triggers a full major GC.

2. **DevTools command palette** — `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) → type "Collect garbage" → Enter.

3. **Console** — DevTools exposes `gc()` in the console when DevTools is open (this is a DevTools-only API, not available in production):
   ```js
   gc(); // in DevTools console only
   ```

4. **Node.js** — when profiling a Node process, start with `--expose-gc` and call `global.gc()` programmatically.

**Rule:** Always force GC at least once (ideally twice, separated by a second) before every snapshot you intend to compare. A standard ritual:

```
Force GC --> wait 1s --> Force GC again --> Take snapshot
```

The double-GC catches objects that survived the first collection due to V8's generational promotion timing.

---

## Cross-Reference with the Performance Panel Memory Track

The Memory panel and the Performance panel are complementary:

- **Performance panel** shows *when* memory changes happen in relation to frames, scripting, rendering, and painting. It gives you a timeline view of heap size alongside CPU activity.
- **Memory panel** shows *what* is on the heap and *why* it is retained.

**Workflow combining both:**

1. Open the Performance panel.
2. Check "Memory" in the capture settings.
3. Record a session performing the suspect action.
4. Stop recording. The memory track appears as a colored area chart below the flame chart.
5. Identify a time range where heap size climbs without dropping back.
6. Note the timestamp (e.g., "heap spikes at ~4.2 s").
7. Switch to the Memory panel.
8. Take a snapshot at the equivalent moment (load the page fresh, wait ~4 s, force GC, take snapshot).
9. Use Comparison view to find what accumulated.

```
Performance panel timeline:
                                               Heap size
  2.5 MB |                            /-------/
  2.0 MB |                   /-------/
  1.5 MB |          /-------/
  1.0 MB |/--------/
         +--+-------+-------+-------+-------+--> time
            1s      2s      3s      4s      5s
                     ^
                     |
               Each step = one "open dialog" action.
               Heap never drops: leak confirmed.
               Now go to Memory panel to find what's accumulating.
```

**Memory track colors in Performance panel:**

- **Blue** — JS heap size.
- **Green** — number of DOM nodes.
- **Yellow** — number of event listeners.
- **Purple** — number of JS objects.

A rising green line (DOM nodes) combined with a rising yellow line (event listeners) is a classic detached-node + unremoved-listener pattern.

---

## Quick Reference Cheat Sheet

```
GOAL                              TOOL + ACTION
--------------------------------  ------------------------------------------
Is there a leak?                  Performance panel, memory track, watch heap
What is leaking?                  Heap Snapshot x2, Comparison view, # New
When does it allocate?            Allocation Timeline, blue bars
Who allocates it?                 Allocation Sampling, call tree
Why is it alive?                  Heap Snapshot, Retainers pane
Detached DOM?                     Heap Snapshot, filter "Detached"
Before every snapshot             Force GC (trash icon) x2
Fix global leak                   Use const/let; add 'use strict'
Fix interval leak                 clearInterval in destroy/cleanup
Fix closure leak                  Null large refs before creating closure
Fix DOM leak                      Null JS refs when removing from DOM
Fix listener leak                 removeEventListener or AbortController
Fix cache leak                    LRU eviction; consider WeakMap
Memory-safe association           WeakMap instead of Map
Memory-safe collection tracking   WeakSet instead of Set
Optional cache value              WeakRef with deref() null-check
```

---

[← Web Devtools](/coding/web-devtools/)
