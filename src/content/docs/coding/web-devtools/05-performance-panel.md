---
title: 05 Performance Panel
---

# Chrome DevTools: Performance Panel

A complete guide from first recording to advanced flame-chart triage.

---

## What the Performance Panel Does

The Performance panel is a runtime profiler built into Chrome DevTools. It captures a time-ordered trace of everything the browser does — JavaScript execution, style recalculation, layout, paint, compositing, network requests, and garbage collection — and renders it as an interactive timeline you can zoom, pan, and drill into.

Key capabilities:

- Measure Core Web Vitals (LCP, INP, CLS, FCP) against real or simulated user interactions.
- Pinpoint long tasks that block the main thread and cause jank.
- Visualize the rendering pipeline to find style/layout/paint bottlenecks.
- Track JavaScript call stacks at microsecond granularity via the flame chart.
- Overlay custom User Timing marks so your application events appear inline with browser events.
- Monitor JavaScript heap size and identify garbage-collection pressure.

It differs from the Network panel (which focuses only on resource loading) and the Memory panel (which takes heap snapshots). The Performance panel gives you a unified picture of every CPU cycle from navigation through user interaction.

---

## Core Web Vitals Primer

Google's Core Web Vitals are field and lab metrics that quantify perceived page quality. The Performance panel surfaces most of them directly in the Timings and Interactions tracks.

| Metric | Full Name | What It Measures | Good | Needs Improvement | Poor |
|---|---|---|---|---|---|
| LCP | Largest Contentful Paint | Time until the largest above-the-fold image or text block is rendered | ≤ 2.5 s | 2.5 – 4.0 s | > 4.0 s |
| INP | Interaction to Next Paint | Latency of the slowest interaction across the entire page visit (replaces FID) | ≤ 200 ms | 200 – 500 ms | > 500 ms |
| FID | First Input Delay | Delay between first user input and browser response (deprecated, replaced by INP) | ≤ 100 ms | 100 – 300 ms | > 300 ms |
| CLS | Cumulative Layout Shift | Sum of unexpected layout shift scores during the page's lifetime | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| FCP | First Contentful Paint | Time until the first text or image pixel is painted | ≤ 1.8 s | 1.8 – 3.0 s | > 3.0 s |
| TTFB | Time to First Byte | Time from navigation start until the first byte of the HTML response arrives | ≤ 800 ms | 800 ms – 1.8 s | > 1.8 s |
| Speed Index | Speed Index | How quickly visible page content populates (computed from video frames) | ≤ 3.4 s | 3.4 – 5.8 s | > 5.8 s |
| TTI | Time to Interactive | Time until the page is reliably interactive (main thread quiet for 5 s) | ≤ 3.8 s | 3.8 – 7.3 s | > 7.3 s |
| TBT | Total Blocking Time | Sum of blocking portions of long tasks between FCP and TTI | ≤ 200 ms | 200 – 600 ms | > 600 ms |

Notes:
- INP became a Core Web Vital in March 2024. FID is no longer measured by Google Search ranking.
- CLS is unitless (a score, not a time).
- TBT is a lab-only proxy for INP; it cannot be measured in the field.
- TTFB is a diagnostic metric, not a Core Web Vital, but it is a root cause for poor LCP.

---

## UI Layout

```
+-----------------------------------------------------------------------+
|  TOOLBAR                                                              |
|  [Record] [Stop] [Clear]  Throttle: [4x CPU] Network: [Slow 3G]      |
|  [Screenshots ON] [Memory ON]  [Import] [Export]                      |
+-----------------------------------------------------------------------+
|  TIMELINE OVERVIEW STRIP  (full recording, drag to select range)      |
|  FPS  ||||||||||||  |||  |||||||||||||||||||||||||||||||||||||||||||   |
|  CPU  ████░░░░████████░░░░░████████████████░░░░░░█████████████████    |
|  NET  ─────▄▄▄──────────────────────────────────────────────────      |
|  [screenshots row]  🖼  🖼  🖼  🖼  🖼  🖼  🖼  🖼  🖼  🖼  🖼  🖼       |
+-----------------------------------------------------------------------+
|  MAIN TIMELINE  (zoomed to selected range)                            |
|  Timings    |FCP          |LCP               |DCL      |Load          |
|  Interactions  click(45ms)     scroll(210ms)                          |
|  Frames     [  F1  ][  F2  ][  F3  ][  F4  ][  F5  ]                 |
|  Main       ████ Task ████████████████    ████ Task ██                |
|             ▼ Script  ▼ Layout  ▼ Paint                               |
|             [flame chart — call stacks grow downward]                 |
|  Compositor █ █ █ █ █ █ █ █ █ █                                      |
|  GPU        ███████████████████████████                               |
|  Raster     ████     ████     ████                                    |
|  Network    ▄▄▄▄▄ html  ▄▄ css ▄▄▄▄▄▄▄▄ js                          |
+-----------------------------------------------------------------------+
|  DETAILS PANE  (shows data for selected task or time range)           |
|  [Summary] [Bottom-Up] [Call Tree] [Event Log]                        |
|                                                                       |
|  Summary pie: Scripting 48% | Rendering 22% | Painting 8% | Idle 22%  |
+-----------------------------------------------------------------------+
```

Panel areas:

- **Toolbar** — controls recording, CPU/network throttling, and screenshot capture.
- **Timeline Overview Strip** — a compressed view of the entire recording. Drag to zoom into a range.
- **Main Timeline** — the detailed, zoomable view with all tracks stacked vertically.
- **Details Pane** — context-sensitive data for whatever is selected in the timeline.

---

## Recording a Profile

### Opening the Panel

Press `Ctrl+Shift+I` / `Cmd+Option+I` to open DevTools, then click the **Performance** tab. Alternatively press `Ctrl+Shift+P` / `Cmd+Shift+P` and type "performance".

### Steps for a Clean Recording

1. **Open an Incognito window** — eliminates extension interference.
2. **Navigate to the page** but do not interact with it yet.
3. **Set throttling** in the toolbar:
   - CPU: 4x or 6x slowdown simulates a mid-range mobile device.
   - Network: Slow 3G or Fast 3G for load recordings; no throttling for interaction recordings.
4. **Warm up first** — load the page once and discard that recording. Browser caches and JIT compilation will be in a realistic state for the second run.
5. **Start recording** — click the circle record button or press `Ctrl+E` / `Cmd+E`.
6. **Perform the interaction** you want to measure: scroll, click, type. Keep it focused.
7. **Stop after 3–5 seconds** — shorter recordings are easier to read and have less noise.
8. Wait for the profile to process (large traces can take several seconds).

### Tips

- Disable the "Disable cache" checkbox in the Network panel before a performance recording unless you specifically want a cold-cache load.
- Use "Start profiling and reload page" (the page-reload icon next to Record) to capture the full navigation, including resource loading.
- If you only care about a specific interaction (not load), navigate to the page, let it settle, then record.
- Reduce the number of open tabs; other tabs compete for CPU.

### Import and Export Profiles

Profiles are saved as JSON trace files and can be shared with teammates.

**Export:** After recording, click the download (export) icon in the toolbar. The file is saved as `Trace-<timestamp>.json`.

**Import:** Click the upload (import) icon and select a `.json` trace file. The full recording loads exactly as if you had recorded it yourself.

This is useful for:
- Sharing a hard-to-reproduce performance issue with a colleague.
- Comparing before/after profiles of an optimization.
- Archiving baseline measurements to detect regressions later.

---

## Timeline Overview Strip

The overview strip at the top shows the full recording compressed into a scrollable bar. It has three sub-charts stacked vertically:

### FPS Chart

A green bar chart where height represents frames per second. A smooth 60-fps page shows a tall, unbroken green band.

- **Red bars** at the top of the FPS area indicate dropped frames (jank). The taller the red bar, the worse the drop.
- A sustained drop to 30 fps means the main thread is spending more than 33 ms per frame.
- A complete gap in the green bars means the page was entirely unresponsive.

### CPU Chart

A stacked area chart showing CPU time broken down by category:
- Yellow = JavaScript
- Purple = Rendering (style + layout)
- Green = Painting
- Gray = System / other

A heavily yellow CPU chart means JavaScript is the bottleneck. A heavily purple chart points to layout thrashing.

### NET Chart

Thin bars showing network request timing. Useful for correlating resource loading with CPU spikes.

### Screenshots Timeline

A filmstrip row of thumbnail screenshots captured at each frame. Hovering over any screenshot shows a magnified preview so you can see exactly what the user saw at that moment. This is invaluable for identifying the moment of LCP or a layout shift.

### Selecting a Time Range

Click and drag horizontally in the overview strip to zoom the main timeline into that range. The main timeline will update to show only those milliseconds in detail. You can also drag the handles on the edges of the selection to adjust it. Double-click the overview to reset to the full recording.

---

## All Timeline Tracks Explained

### Main Thread

The most important track. It shows a flame chart of every task the browser ran on the main thread. Tasks are top-level colored blocks. Call stacks grow downward from them.

Color coding:
- **Yellow** — JavaScript execution (script evaluation, event handlers, timers)
- **Purple** — Rendering work (style recalculation, layout)
- **Green** — Painting (paint records, image decoding)
- **Blue** — Loading/parsing (HTML parsing, network callbacks)
- **Gray** — System tasks, idle

Long tasks (over 50 ms) have a **red triangle** in their top-right corner. Everything inside that task — every function call — is rendered as part of the flame chart stack below the task block.

### Compositor Thread

Shows work done by the compositor thread. Compositing moves already-painted layers without requiring main-thread involvement. If your page is slow but the main thread looks idle, check whether the compositor thread is overloaded.

### GPU Thread

Shows GPU process activity. A healthy page has the GPU thread mostly idle during JavaScript-heavy work, with bursts during paint and composite operations.

### Raster Threads

Show tile rasterization. Chrome breaks the page into tiles and rasters them on background threads. Heavy raster activity appears when new content scrolls into view or layers are promoted.

### Network Requests Track

Each network request appears as a horizontal bar. Bar color indicates:
- Blue — HTML
- Purple — CSS
- Yellow — JavaScript
- Green — images
- Gray — other

Hovering a bar shows URL, timing (queue, DNS, connect, TTFB, download), and the initiator.

### Frames Track

Shows each rendered frame as a block. Frame height indicates frame duration — short frames are fast, tall frames are slow. Green frames are on-time; red or yellow frames were dropped or late.

### Timings Track

Displays vertical markers and labeled spans for:
- **FCP** — First Contentful Paint
- **LCP** — Largest Contentful Paint
- **DCL** — DOMContentLoaded event
- **Load** — window load event
- **User Timing API marks** — your own `performance.mark()` and `performance.measure()` calls appear here as custom markers and spans (covered in detail in a later section)

### Interactions Track

Shows pointer and keyboard interactions. Each interaction is a colored block spanning from the input event to the next paint. The width represents the INP latency for that interaction. Interactions exceeding 200 ms are flagged.

### Web Workers

If your page uses `Worker` or `SharedWorker`, each worker gets its own flame chart track below the main thread. Worker tracks are labeled with the worker script URL. You can identify CPU-intensive work running off the main thread and verify it is not also competing with important tasks.

---

## The Flame Chart Deep-Dive

### Axes

```
Time (ms) →
0ms       50ms      100ms     150ms     200ms
│         │         │         │         │
├─────────┤ Task (60ms)                 │
│         ├── evaluateScript            │
│         │   ├── moduleA.init()        │
│         │   │   ├── fetchConfig()     │
│         │   │   └── parseConfig()     │
│         │   └── moduleB.init()        │
│         │       └── buildIndex()      │
│         │           └── sort()        │
│         └── (GC)                      │
│
↓ Call Depth (Y axis — deeper = called by parent above)
```

- **X axis** = wall-clock time. Wider blocks took longer.
- **Y axis** = call stack depth. The topmost block is the entry point (event handler, timer callback, etc.). Each row below is a function called by the one above it.
- A wide block at the bottom of a deep stack is an expensive leaf function — the actual hot path.
- A wide block at the top is an expensive entry point — consider splitting it across frames.

### Color Coding

| Color | Category | Examples |
|---|---|---|
| Yellow | Scripting | JS function calls, event handlers, timers, GC |
| Purple | Rendering | Recalculate Style, Layout, Update Layer Tree |
| Green | Painting | Paint, Composite Layers, Image Decode |
| Blue | Loading | Parse HTML, Send Request, Receive Response |
| Gray | System | System (browser internals), Idle |

### Reading Top-Down vs Bottom-Up

**Top-Down (Call Tree tab / flame chart visual):**
Start at the widest top-level task and follow the tallest child blocks downward. This shows entry points and gives you the "shape" of work. Good for understanding which feature or event triggered slow work.

**Bottom-Up (Bottom-Up tab):**
Shows leaf functions sorted by self time — the time spent in that function excluding its callees. This immediately highlights the hottest individual functions. Good for finding the specific line of code consuming the most CPU.

### Zooming and Panning

| Action | Shortcut |
|---|---|
| Zoom in | Scroll wheel up, or `+` key |
| Zoom out | Scroll wheel down, or `-` key |
| Pan left/right | Hold `Shift` and scroll, or click-drag on the overview |
| Select a range | Click and drag on the main timeline |
| Reset zoom | `0` key (zero) |
| Jump to a specific time | Click in the overview strip |

Double-clicking a task block auto-zooms to fill the timeline with that task.

---

## Long Tasks

### Definition

A **long task** is any main-thread task that takes more than 50 ms. The 50 ms threshold comes from the RAIL model: to guarantee a response within 100 ms of user input, the browser needs at least 50 ms of headroom for its own work. Any task over 50 ms eats into that budget.

In the flame chart, long tasks are identified by a **red triangle in the top-right corner** of the task block.

```
┌─────────────────────────────────────────────────────────────▲
│  Task                                                        ▲  ← red triangle
│  ├── evaluateScript (bundle.js)                             │
│  │   ├── App.render()                                       │
│  │   │   ├── processAllItems() ← 42ms self time            │
│  │   │   │   └── heavyTransform() ← hot loop               │
│  │   │   └── updateDOM()                                    │
└──────────────────────────────────────────────────────────────
```

### Why They Block the Main Thread

JavaScript is single-threaded on the main thread. While a long task runs, the browser cannot:
- Process user input (clicks, keypresses, scroll events)
- Run animations driven by `requestAnimationFrame`
- Respond to the compositor for smooth scrolling

The result is **jank** (dropped frames) and **high INP** (input is queued until the task finishes).

### Impact on INP

INP measures the time from user input to the next paint. If a click handler fires while a 200 ms task is running, the input is queued. INP = 200 ms queue time + handler execution time + rendering time. Even a trivial click handler will produce a 200+ ms INP if it hits a long task.

### Finding Responsible Code

1. In the Interactions track, click the interaction that felt slow (high INP).
2. The Details pane shows the interaction's processing time and the responsible task.
3. Click the task in the Main thread track.
4. In the flame chart, look for the widest yellow block at the deepest level — that is the hot function.
5. Click the function to see its source location in the Details pane. Click the link to open it in the Sources panel.
6. Check the Bottom-Up tab for the same selection to rank functions by self time.

Common culprits:
- Large synchronous `JSON.parse()` or `JSON.stringify()` on the main thread.
- Unvirtualized lists that re-render thousands of DOM nodes.
- Third-party scripts (analytics, tag managers, chat widgets) firing on every page.
- Recursive computations not yielded with `scheduler.yield()` or `setTimeout`.

---

## Details Pane — All Tabs

Select a task, event, or time range in the main timeline to populate the Details pane.

### Summary Tab

Shows a **pie chart** of time spent in each category for the selection:
- Scripting
- Rendering
- Painting
- Loading
- System
- Idle

Also displays:
- Total time of the selection.
- A "Details" section with metadata: task name, source URL, start/end time.
- For network requests: URL, status, timing breakdown (queue, stall, DNS, connect, send, wait, receive).

Use Summary to quickly diagnose whether a slowdown is JS-heavy (scripting) or CSS/layout-heavy (rendering).

### Bottom-Up Tab

Lists every function that ran in the selection, sorted by **self time** descending. Self time is the time spent in the function body, not counting time spent in functions it called.

Columns:
- **Self Time** — CPU time spent in this function's own code.
- **Total Time** — self time plus all descendant call time.
- **Activity** — function name.
- **Source URL** — file and line number.

Use the **Group by** dropdown to aggregate by:
- **No Grouping** — every individual function.
- **URL** — total cost attributed to each script file.
- **Domain** — total cost by origin (great for blaming third parties).
- **Category** — scripting vs rendering vs painting.

This is the most actionable view for finding which exact function to optimize.

### Call Tree Tab

Top-down view of the call hierarchy. Shows total time descending from the task root. Expand nodes to drill into the call chain.

The triangular expand icons let you unfurl the tree. Functions that contributed the most time have the tallest children. Use this to understand the execution path that led to the expensive code — context that Bottom-Up lacks.

### Event Log Tab

A flat, chronological list of every event in the selection. Columns:
- **Start Time** — ms from the recording start.
- **Duration** — how long the event took.
- **Self Time** — duration excluding children.
- **Activity** — event type.

Filter events using the category checkboxes at the top:
- Loading
- Experience
- Scripting
- Rendering
- Painting
- System
- Other

The Event Log is most useful when you want to see the ordering of events — for example, verifying that `DOMContentLoaded` fires before your initialization script, or that a `setInterval` fires at the expected cadence.

---

## Rendering Pipeline

Every visual change on a web page travels through some or all of these stages:

```
JavaScript → Style → Layout → Paint → Composite
```

| Stage | What Happens | Triggered By |
|---|---|---|
| Style | Browser matches CSS rules to DOM elements and computes computed styles | Any CSS class change, inline style, element insertion/removal |
| Layout (Reflow) | Browser calculates position and size of every element in the render tree | Changes to geometry properties (width, height, margin, padding, top, left, font-size) |
| Paint | Browser fills in pixels for each layer — text, colors, images, borders, shadows | Changes to visual properties that don't affect geometry (color, background, box-shadow, outline) |
| Composite | Browser uploads painted layers to the GPU and draws them in order | Changes to transform and opacity on composited layers |

### Which CSS Properties Trigger What

| Property | Style | Layout | Paint | Composite |
|---|---|---|---|---|
| `width`, `height`, `margin`, `padding` | Yes | Yes | Yes | Yes |
| `top`, `left` (positioned) | Yes | Yes | Yes | Yes |
| `font-size`, `line-height` | Yes | Yes | Yes | Yes |
| `color`, `background-color` | Yes | No | Yes | Yes |
| `box-shadow`, `border-radius` | Yes | No | Yes | Yes |
| `transform` (composited layer) | Yes | No | No | Yes |
| `opacity` (composited layer) | Yes | No | No | Yes |
| `will-change: transform` | Yes | No | No | Yes |

Key insight: **`transform` and `opacity` on a promoted layer skip layout and paint entirely.** They are the only properties you can animate without triggering the expensive pipeline stages. This is why CSS animations using `transform: translateX()` are smooth while ones using `left:` are not.

### Spotting Pipeline Stages in the Flame Chart

In the Main thread flame chart:
- A **purple "Recalculate Style"** block followed by a **purple "Layout"** block indicates a style+layout pass.
- A **green "Paint"** block follows if pixels need to be updated.
- A **green "Composite Layers"** block is the final stage.

Consecutive style+layout blocks repeating rapidly indicate layout thrashing.

---

## Identifying Layout Thrashing

Layout thrashing occurs when JavaScript alternately reads and writes DOM geometry properties, forcing the browser to perform synchronous layout multiple times per task instead of once per frame.

### The Problem

```js
// BAD: layout thrashing — reads and writes are interleaved
const boxes = document.querySelectorAll('.box');
boxes.forEach(box => {
  // READ: forces the browser to flush pending style/layout
  const width = box.offsetWidth;
  // WRITE: invalidates layout, so the next read must recalculate
  box.style.width = (width * 1.1) + 'px';
});
// Each iteration triggers a full synchronous layout
// 100 boxes = 100 forced layouts in one task
```

In the flame chart this appears as a rapid alternation of "Recalculate Style" and "Layout" purple blocks inside a single script task, often flagged as "Forced reflow" in the Details pane.

### The Fix

```js
// GOOD: batch all reads first, then all writes
const boxes = document.querySelectorAll('.box');

// Phase 1 — batch reads (no layout invalidation)
const widths = Array.from(boxes).map(box => box.offsetWidth);

// Phase 2 — batch writes (layout is invalidated once,
// recalculated once at the end of the task)
boxes.forEach((box, i) => {
  box.style.width = (widths[i] * 1.1) + 'px';
});
```

Alternative: use `requestAnimationFrame` to defer writes to the next frame, or use the `ResizeObserver` / `IntersectionObserver` APIs which are designed to avoid forced layout.

Libraries like **FastDOM** formalize this pattern by providing `fastdom.measure()` and `fastdom.mutate()` queues that automatically batch reads and writes.

### How to Find It in DevTools

1. Record a profile of the interaction that feels janky.
2. Look for dense clusters of purple blocks in the Main thread track.
3. Click one of the "Layout" blocks.
4. In the Summary tab, check for the label **"Layout Forced"** — this confirms a synchronous forced reflow.
5. The Details pane will show a stack trace pointing to the JS line that triggered the forced layout (the read that followed a write).

---

## Memory Track

Enable the Memory track by checking **Memory** in the toolbar before recording. This adds a continuous line graph above the main timeline showing JavaScript heap size over time.

### Reading the Graph

- **Blue line** — total JavaScript heap size (allocated objects, including live and unreachable).
- Heap size naturally rises as objects are allocated and falls when the garbage collector runs.
- **GC events** appear as sudden vertical drops in the heap line (the GC reclaims unreachable objects).

### What to Look For

| Pattern | Meaning |
|---|---|
| Sawtooth: steady rise, periodic drops | Normal — allocation and GC working as expected |
| Staircase: rises but never fully drops | Memory leak — objects are being retained across GC cycles |
| Flat line with sudden large drop | Delayed GC — many objects accumulated before collection |
| Frequent tiny drops | GC pressure — too many short-lived objects forcing constant collection, which causes minor GC pauses |

A memory leak in the Performance panel manifests as a heap line that trends upward over the course of the recording without returning to baseline after GC events. To investigate the leak itself, use the Memory panel's Heap Snapshot or Allocation instrumentation tools, which give object-level detail. The Performance panel's memory track points you to when the leak begins — cross-reference with the Interactions track to identify which user action triggers the growth.

---

## User Timing API

The User Timing API lets you inject named markers and timed spans into the browser's performance timeline. They appear in the **Timings track** alongside LCP, FCP, and DCL, making it easy to correlate your application events with browser activity.

### API Overview

```js
// Mark a point in time (appears as a vertical line in Timings track)
performance.mark('app:init-start');

// ... do initialization work ...

performance.mark('app:init-end');

// Measure the duration between two marks (appears as a colored span)
performance.measure('app:init', 'app:init-start', 'app:init-end');
```

### Practical Example: Profiling a Data Fetch and Render

```js
async function loadDashboard() {
  performance.mark('dashboard:fetch-start');

  const data = await fetch('/api/dashboard').then(r => r.json());

  performance.mark('dashboard:fetch-end');
  performance.measure('dashboard:fetch', 'dashboard:fetch-start', 'dashboard:fetch-end');

  performance.mark('dashboard:render-start');

  renderCharts(data);

  performance.mark('dashboard:render-end');
  performance.measure('dashboard:render', 'dashboard:render-start', 'dashboard:render-end');

  performance.measure(
    'dashboard:total',
    'dashboard:fetch-start',
    'dashboard:render-end'
  );
}
```

### Accessing Marks Programmatically

```js
// Get all marks
const marks = performance.getEntriesByType('mark');
marks.forEach(m => console.log(m.name, m.startTime));

// Get all measures
const measures = performance.getEntriesByType('measure');
measures.forEach(m => console.log(m.name, m.duration));

// Use PerformanceObserver for real-time monitoring
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.entryType}: ${entry.name} — ${entry.duration?.toFixed(2) ?? entry.startTime.toFixed(2)}ms`);
  }
});
observer.observe({ entryTypes: ['mark', 'measure'] });

// Clean up marks when done
performance.clearMarks('dashboard:fetch-start');
performance.clearMeasures('dashboard:fetch');
```

### How They Appear in DevTools

In the Performance panel Timings track:
- `performance.mark()` calls appear as **labeled vertical lines** with a triangle at the top.
- `performance.measure()` calls appear as **colored horizontal spans** labeled with the measure name.
- Hovering any mark or measure in the Timings track shows its name, start time, and duration in the Details pane.

This makes it trivial to answer questions like "did my render start before or after LCP?" or "how much of my TTI window is consumed by initializing the analytics SDK?"

---

## Complete Profiling Workflow

### Scenario: Page Scroll Feels Janky

This walkthrough demonstrates the end-to-end process of identifying and fixing a real performance problem.

#### Step 1 — Reproduce the Problem

Open the page in an Incognito window. Scroll the page and notice it stutters noticeably. Open DevTools Performance panel.

#### Step 2 — Record

1. Set CPU throttle to 4x.
2. Click Record.
3. Scroll the page continuously for 3 seconds.
4. Click Stop.

#### Step 3 — Find the Jank in the Overview

Look at the FPS chart. You see several red bars clustered together around the 1.2–2.4 second mark. Drag to select that region in the overview strip.

#### Step 4 — Locate the Long Task

Zoom into the selected region. In the Main thread track, you see a task block with a red triangle, spanning approximately 180 ms. This is the long task.

```
0ms          50ms         100ms        150ms        180ms
│                                                    ▲ red triangle
├────────────────────────────────────────────────────┤
│  Task (180ms)                                      │
│  └── scroll (event handler)                        │
│      └── onScroll()                                │
│          ├── getVisibleItems()  — 12ms             │
│          └── renderItems()     — 155ms  ← hot      │
│              └── buildCard()   — 154ms  ← hot      │
│                  └── measureTextWidth() — 150ms    │
│                      └── [Forced Layout ×100]      │
└────────────────────────────────────────────────────┘
```

#### Step 5 — Identify the Root Cause

Click the long task. Open the Bottom-Up tab. The top entry is `measureTextWidth` with 150 ms self time. Click the source link. In the source code you find:

```js
// BEFORE (causes layout thrashing in a loop)
function renderItems(items) {
  items.forEach(item => {
    const card = createCard(item);
    container.appendChild(card);
    // Reading offsetWidth after write forces synchronous layout
    const w = card.offsetWidth;
    card.style.setProperty('--card-width', w + 'px');
  });
}
```

Each iteration appends a node (write), then reads `offsetWidth` (read), forcing a synchronous layout on every card.

#### Step 6 — Fix the Code

```js
// AFTER (batch writes, then batch reads)
function renderItems(items) {
  // Write phase: append all cards first
  const cards = items.map(item => {
    const card = createCard(item);
    container.appendChild(card);
    return card;
  });

  // Read phase: all offsetWidth reads happen after all writes
  // Browser only needs one layout pass
  cards.forEach(card => {
    const w = card.offsetWidth;
    card.style.setProperty('--card-width', w + 'px');
  });
}
```

#### Step 7 — Verify the Fix

Record the scroll interaction again with the fix applied. In the new profile:
- The FPS chart shows no red bars during scroll.
- The long task is gone; scroll event handlers complete in under 10 ms.
- The Bottom-Up tab shows `renderItems` now takes 8 ms total.

#### Step 8 — Add a User Timing Guard

To prevent regressions, add a performance measure around the render call:

```js
function renderItems(items) {
  performance.mark('renderItems:start');

  const cards = items.map(item => {
    const card = createCard(item);
    container.appendChild(card);
    return card;
  });

  cards.forEach(card => {
    const w = card.offsetWidth;
    card.style.setProperty('--card-width', w + 'px');
  });

  performance.mark('renderItems:end');
  performance.measure('renderItems', 'renderItems:start', 'renderItems:end');

  // Warn in development if render exceeds budget
  const [measure] = performance.getEntriesByName('renderItems', 'measure');
  if (measure.duration > 16) {
    console.warn(`renderItems took ${measure.duration.toFixed(1)}ms — exceeds frame budget`);
  }
}
```

Future profiles will show `renderItems` as a named span in the Timings track, making regressions immediately visible without needing to dig through the flame chart.

---

## Quick Reference

### Keyboard Shortcuts (Performance Panel)

| Shortcut | Action |
|---|---|
| `Ctrl+E` / `Cmd+E` | Start/Stop recording |
| `Scroll` | Zoom in/out on timeline |
| `Shift+Scroll` | Pan timeline left/right |
| `W` / `S` | Zoom in / Zoom out |
| `A` / `D` | Pan left / Pan right |
| `0` | Reset zoom to full recording |
| `Esc` | Close Details pane |

### At-a-Glance Diagnosis Guide

| Symptom | Where to Look | Likely Cause |
|---|---|---|
| High INP | Interactions track + Main thread | Long task blocking input processing |
| Slow LCP | Timings track + Network track | Large image, slow server, render-blocking CSS/JS |
| Layout shifts (CLS) | Timings track shows shift markers | Images without dimensions, injected content |
| Jank during scroll | FPS red bars + Main thread long tasks | Layout thrashing, unthrottled scroll handler |
| Slow initial load | Network track + Main thread | Large JS bundles, synchronous scripts in `<head>` |
| Memory growth | Memory track staircase pattern | Event listeners not removed, closures retaining data |
| GC pauses | Memory track drops + Main yellow spikes | Too many short-lived objects (object pooling can help) |

---

[← Web Devtools](/coding/web-devtools/)
