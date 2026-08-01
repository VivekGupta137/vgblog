---
title: 17 Performance Insights
---

# Chrome DevTools: Performance Insights Panel

## What Performance Insights Is

Performance Insights is a more opinionated, guided version of the Performance panel. Where the classic Performance panel gives you a raw flame chart and expects you to know what to look for, Performance Insights narrows the focus to what users actually experience: **Core Web Vitals**.

It is built around three principles:

1. **Guided analysis** — the panel surfaces specific problems rather than dumping raw data on you.
2. **Actionable recommendations** — each insight comes with a concrete fix, not just a metric number.
3. **Core Web Vitals alignment** — LCP, CLS, and INP are first-class citizens. You see them highlighted in the timeline before you even look at individual events.

Think of it as a Lighthouse report you can generate on any interaction — not just page load — with the timeline precision of the Performance panel underneath.

---

## Performance Panel vs Performance Insights vs Lighthouse

| Dimension | Performance Panel | Performance Insights | Lighthouse |
|---|---|---|---|
| **Primary audience** | Advanced engineers who know flame charts | Developers who want guided diagnostics | Anyone (lab test, CI integration) |
| **Data collection** | Manual recording; you decide start/stop | Manual recording with structured insight detection | Automated run against a fresh page load |
| **Scope** | Everything: JS, layout, paint, network, layers | Core Web Vitals + specific insight categories | Page load only (no custom interactions) |
| **Output** | Raw flame chart + summary metrics | Insight cards with explanations and fixes | Scored audit report with pass/fail items |
| **Interaction support** | Yes — record any user interaction | Yes — designed for interaction recording | No — automated scripted load only |
| **LCP sub-breakdown** | Possible but manual | Built-in, shown automatically | Shown but not interactive |
| **INP analysis** | Possible but requires deep reading | Built-in event breakdown | Not available |
| **CLS element overlay** | Not available | Shows shifted elements with overlay | Reports score only |
| **Best for** | Deep profiling, custom investigation | Diagnosing a specific Core Web Vital problem | CI scoring, quick overall health check |
| **Noise level** | High — you see everything | Low — only insight categories shown | Medium — 60+ audits |

Use Lighthouse first for a score. Use Performance Insights when a Core Web Vital is failing and you need to know exactly why. Use the Performance panel when the Insights panel points you at a function and you need the full call stack.

---

## How to Open It

**Method 1 — More Tools menu:**

1. Open DevTools (`F12` or `Cmd+Option+I` on Mac).
2. Click the three-dot menu in the top-right of DevTools.
3. Hover over **More tools**.
4. Click **Performance insights**.

**Method 2 — Command Menu:**

1. Open DevTools.
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux).
3. Type `performance insights` and select **Show Performance insights**.

**Method 3 — Tab bar (if already pinned):**

If you have used it before, the panel may already appear as a tab next to Console, Sources, etc.

:::note
As of Chrome 112+, Performance Insights is a stable panel. In older versions it may appear under an "Experimental" flag at `chrome://flags/#enable-devtools-new-timeline`.
:::

---

## UI Layout

```
+--------------------------------------------------------------+
|  Performance Insights                          [Record] [...]  |
+--------------------------------------------------------------+
|  CONTROLS BAR                                                  |
|  [Start recording]   CPU: [4x slowdown]  Network: [Fast 3G]   |
+--------------------------------------------------------------+
|  TIMELINE (horizontal time axis)                               |
|  |--0ms-----500ms------1000ms------1500ms------2000ms---------|
|  |                                                             |
|  [Interactions]  [ click ]        [ keypress ]                 |
|  [Network]       |===img===|  |=====script=====|               |
|  [Renderer]      |LCP                  CLS                     |
|  [Core Web Vitals markers shown as vertical dashed lines]      |
|                                                                |
+--------------------------------------------------------------+
|  INSIGHTS PANEL (left sidebar)                                 |
|                                                                |
|  > LCP — 1.2s (Good)          [expand]                        |
|  > CLS — 0.08 (Needs improvement) [expand]                    |
|  > INP — 320ms (Needs improvement) [expand]                   |
|  > Render-blocking requests   [expand]                        |
|  > Forced reflow              [expand]                        |
|  > Long tasks                 [expand]                        |
|  > Document request latency   [expand]                        |
|                                                                |
+--------------------------------------------------------------+
|  DETAIL PANEL (bottom, shown when an insight is expanded)      |
|                                                                |
|  LCP element: <img id="hero" src="/hero.jpg">                  |
|  Sub-parts:                                                    |
|    TTFB:               120ms                                   |
|    Resource load delay: 80ms  <- Opportunity                   |
|    Resource load time: 200ms                                   |
|    Render delay:        40ms                                   |
|  Recommendation: Add <link rel="preload"> for this image.      |
|                                                                |
+--------------------------------------------------------------+
```

The panel is divided into four zones:

- **Controls bar** — start/stop recording, throttling settings.
- **Timeline** — a simplified horizontal view with interaction bars, network requests, and CWV markers.
- **Insights sidebar** — categorized insight cards. Clicking one highlights the relevant range in the timeline.
- **Detail panel** — expands when you select an insight card; shows the specific element, timings, and the fix.

---

## Recording a Session

### Step-by-step

1. Open the page you want to profile.
2. Open Performance Insights.
3. Configure throttling (see below).
4. Click **Start recording** (or press the record circle button).
5. Perform the interaction you want to measure — click a button, scroll, type in a field, navigate.
6. Click **Stop recording**.
7. Wait for the panel to process and render the insight cards.

### Throttling options

Set these before recording to simulate real-world conditions:

| Setting | When to use |
|---|---|
| **CPU: No throttling** | Local JS execution benchmarks |
| **CPU: 4x slowdown** | Simulate mid-range Android phone |
| **CPU: 6x slowdown** | Simulate low-end Android phone |
| **Network: No throttling** | Local asset testing |
| **Network: Fast 3G** | Typical mobile user |
| **Network: Slow 3G** | Worst-case mobile |

:::tip
Best practice: use **4x CPU + Fast 3G** as your default testing profile. Real users rarely have your MacBook Pro.
:::

### What to do during recording

- Interact naturally with the feature you are investigating.
- For LCP analysis: just load the page (the LCP element is auto-detected).
- For INP analysis: click the specific button or UI element that feels slow.
- For CLS analysis: scroll the page, wait for fonts to load, or trigger the layout shift you have observed.
- Keep recordings under 10 seconds where possible. Longer recordings produce more noise.

---

## Timeline View

The timeline in Performance Insights is intentionally stripped down compared to the Performance panel. You will not see the full JS flame chart here — that lives in the Performance panel. What you do see:

### Interaction bars

Horizontal bars showing each user interaction (click, keyboard, pointer event) as a block. The width of the bar represents the time from the start of the interaction to the next paint — this is the INP window. A bar that is very wide indicates a slow interaction.

### Metric markers

Vertical dashed lines mark key moments:

- **FCP** (First Contentful Paint) — when the first text or image appears.
- **LCP** (Largest Contentful Paint) — when the largest content element is painted.
- **CLS events** — annotated with a shift icon at the time the layout shift occurred.

### Network track

Shows individual network requests as horizontal bars. Color coding:

- **Blue** — HTML document requests.
- **Purple** — CSS files.
- **Yellow** — JavaScript files.
- **Green** — Images and media.
- **Gray** — Other (fonts, XHR, fetch).

Hovering over a bar shows the URL, duration, TTFB, and content download time.

### Selecting a range

Click and drag on the timeline to zoom into a specific time range. All insight cards update to reflect only what happened in that range. Use this to isolate a specific interaction from surrounding noise.

---

## Core Web Vitals Insights — Each in Depth

### LCP (Largest Contentful Paint) Insight

**What it shows:**

When you expand the LCP insight card, Performance Insights identifies the exact DOM element that was the LCP candidate. It renders an overlay highlight on the element in the page preview and shows the element's selector.

```
LCP element: <img id="hero-image" src="/images/hero.webp" loading="lazy">
LCP time: 3.4s  (Poor — threshold is 2.5s)
```

**LCP sub-parts breakdown:**

LCP is not a single event — it is the sum of four sequential phases:

```
|-- TTFB --|-- Resource load delay --|-- Resource load time --|-- Render delay --|
0ms       350ms                     800ms                    1600ms            3400ms
```

| Sub-part | What it measures | Typical cause when slow |
|---|---|---|
| **TTFB** | Time from navigation start to first byte of the HTML document | Slow server, CDN miss, redirect chain |
| **Resource load delay** | Gap between TTFB and when the browser starts loading the LCP resource | LCP image discovered late (in CSS, JS, or lazy-loaded); not preloaded |
| **Resource load time** | Time to download the LCP resource itself | Large image file, slow CDN, no compression |
| **Render delay** | Gap between resource load complete and actual paint | Main thread busy, render-blocking CSS, large layout tree |

**Recommendations surfaced by the panel:**

- **Preload the LCP image** — if resource load delay is high, the image was discovered late.
- **Optimize TTFB** — if TTFB dominates, look at server response time and CDN configuration.
- **Reduce render delay** — if render delay is high, the main thread is occupied. Check Long Tasks in the same recording.

**Code fix — preload LCP image:**

```html
<!-- Add in <head> before any stylesheets that reference the image -->
<link rel="preload" as="image" href="/images/hero.webp" fetchpriority="high">

<!-- If responsive, include imagesrcset -->
<link rel="preload" as="image"
  href="/images/hero-800.webp"
  imagesrcset="/images/hero-400.webp 400w, /images/hero-800.webp 800w"
  imagesizes="100vw"
  fetchpriority="high">
```

**Code fix — remove lazy loading from LCP image:**

```html
<!-- Before: lazy loading delays discovery -->
<img src="/images/hero.webp" loading="lazy" alt="Hero">

<!-- After: let it load immediately; only lazy-load below-the-fold images -->
<img src="/images/hero.webp" fetchpriority="high" alt="Hero">
```

---

### CLS (Cumulative Layout Shift) Insight

**What it shows:**

The CLS insight card lists each individual layout shift event with its shift score. When you click a shift, the timeline scrubs to that moment and the detail panel shows:

- The elements that shifted.
- Their **expected position** (where they were before the shift).
- Their **actual position** (where they moved to).
- The individual shift score (impact fraction x distance fraction).

```
Shift at 1.2s — score: 0.05
  Element: <div class="ad-banner">
  Expected: top 120px
  Actual:   top 320px
  Cause: content inserted above it

Shift at 2.8s — score: 0.03
  Element: <p class="intro-text">
  Expected: top 480px
  Actual:   top 520px
  Cause: web font swap (FOUT)
```

**Root causes:**

1. **No dimensions on images or iframes** — browser does not reserve space before the resource loads.
2. **Dynamic content injection** — ads, banners, cookie notices, or lazy-loaded components inserted above existing content.
3. **Font swap (FOUT)** — fallback font renders, then web font loads with different metrics, reflowing text.
4. **Animations that trigger layout** — animating `top`, `left`, `width`, `height` rather than `transform`.

**Fix 1 — always set image dimensions:**

```html
<!-- Before: browser does not know height until image loads -->
<img src="/product.jpg" alt="Product">

<!-- After: browser reserves space immediately -->
<img src="/product.jpg" alt="Product" width="800" height="600">

/* Or with CSS aspect-ratio */
img {
  aspect-ratio: 4 / 3;
  width: 100%;
}
```

**Fix 2 — reserve space for dynamic content:**

```css
/* Reserve a fixed height for ad slots before the ad loads */
.ad-slot {
  min-height: 250px;   /* matches the expected ad unit height */
  contain: layout;
}
```

```javascript
// When injecting content dynamically, append below the fold
// rather than inserting before existing content
function showBanner(content) {
  const banner = document.createElement('div');
  banner.innerHTML = content;
  // Append at the end, not prepend at the top
  document.body.appendChild(banner);
}
```

**Fix 3 — prevent font-swap layout shifts:**

```css
/* Use font-display: optional to avoid FOUT entirely,
   or size-adjust to match fallback metrics */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-display: optional;   /* No swap — uses fallback if font is not cached */
}

/* Alternative: adjust fallback font metrics to match web font */
@font-face {
  font-family: 'MyFontFallback';
  src: local('Arial');
  size-adjust: 105%;
  ascent-override: 90%;
  descent-override: 20%;
}
```

**Fix 4 — use transform instead of layout-triggering properties for animations:**

```javascript
// Before: animating top/left triggers layout recalculation on every frame
element.style.top = newY + 'px';

// After: transform does not trigger layout, uses compositor thread
element.style.transform = `translateY(${newY}px)`;
```

---

### INP (Interaction to Next Paint) Insight

**Background — INP replaces FID:**

As of March 2024, INP replaced First Input Delay (FID) as a Core Web Vital. FID only measured input delay for the very first interaction on the page. INP measures the worst (95th percentile) interaction latency across the entire page visit. This is a far stricter and more representative metric.

| Metric | What it measures | Threshold |
|---|---|---|
| FID (retired) | Input delay of first interaction only | Good: <100ms |
| INP (current) | Full interaction latency: input delay + processing + presentation | Good: <200ms; Poor: >500ms |

**What the panel shows:**

The INP insight card lists every recorded interaction with its total latency. Slow interactions are flagged. Clicking one shows the three-phase breakdown:

```
Interaction: click on #submit-button at 4.2s
Total INP: 480ms  (Needs improvement)

  Input delay:       180ms  <- Main thread was busy
  Processing time:   240ms  <- Event handler work
  Presentation delay: 60ms  <- Layout/paint after handler
```

**The three INP phases:**

| Phase | What it covers | Primary cause when slow |
|---|---|---|
| **Input delay** | Time from user input to when the browser starts running the event handler | Main thread occupied with a long task from previous work |
| **Processing time** | Time spent actually running all event listeners for the interaction | Expensive event handler code — DOM queries, heavy computation, synchronous XHR |
| **Presentation delay** | Time from event handler completing to the frame being painted | Style recalculation, forced reflow, large render tree |

**Finding the slow event handler:**

When you click the interaction in the INP insight card, Performance Insights highlights the relevant time range in the timeline. To get the full call stack, open the **Performance panel** and record the same interaction — then look for the long task that spans the processing time phase. The flame chart will show you exactly which function is consuming the time.

**Fix pattern 1 — yield to the main thread with scheduler.yield():**

The most powerful fix for long processing time. Break up work so the browser can paint between chunks.

```javascript
// Before: one long synchronous handler blocks paint
submitButton.addEventListener('click', async (event) => {
  const data = collectFormData();    // 50ms
  const validated = validateAll(data); // 80ms
  const result = processSubmit(validated); // 120ms
  updateUI(result);                  // 30ms
  // Total: 280ms — user sees nothing until all of this finishes
});

// After: yield between phases so browser can paint sooner
submitButton.addEventListener('click', async (event) => {
  const data = collectFormData();    // 50ms
  
  // Yield: allow browser to paint any pending visual updates
  await scheduler.yield();
  
  const validated = validateAll(data); // 80ms
  
  await scheduler.yield();
  
  const result = processSubmit(validated); // 120ms
  
  await scheduler.yield();
  
  updateUI(result);                  // 30ms — this is what the user is waiting to see
});
```

**Fix pattern 2 — setTimeout chunking for older browsers:**

```javascript
// Polyfill-friendly version using setTimeout(fn, 0)
function yieldToMain() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

submitButton.addEventListener('click', async (event) => {
  const data = collectFormData();
  
  await yieldToMain();
  
  const validated = validateAll(data);
  
  await yieldToMain();
  
  const result = processSubmit(validated);
  await yieldToMain();
  
  updateUI(result);
});
```

**Fix pattern 3 — defer non-critical work:**

Work that does not affect what the user sees immediately should not run in the interaction handler.

```javascript
// Before: analytics, logging, and cache writes block the visible update
button.addEventListener('click', async (event) => {
  updateUIImmediately();     // user-visible work
  sendAnalyticsEvent();      // 40ms — not visible to user
  writeToLocalStorage();     // 20ms — not visible to user
  prefetchNextPage();        // 60ms — not visible to user
});

// After: only run user-visible work in the critical path
button.addEventListener('click', async (event) => {
  updateUIImmediately();     // runs first, fast

  // Schedule non-critical work after the frame is painted
  requestIdleCallback(() => {
    sendAnalyticsEvent();
    writeToLocalStorage();
    prefetchNextPage();
  });
});
```

**Fix pattern 4 — break up long tasks using chunked processing:**

```javascript
// Before: processing a large array blocks the main thread
function processItems(items) {
  items.forEach(item => expensiveProcess(item)); // 600ms if 1000 items
}

// After: process in chunks, yielding between each chunk
async function processItemsInChunks(items, chunkSize = 50) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach(item => expensiveProcess(item));
    
    // Yield after each chunk so the browser can respond to input
    await scheduler.yield();
  }
}
```

**Fix pattern 5 — reduce input delay by avoiding long tasks before interactions:**

If input delay is the dominant phase (not processing time), the issue is a long task that started before the user clicked. Solutions:

```javascript
// Before: loading code runs a large synchronous initialization on page load
// that occupies the main thread for 300ms right when users interact
function init() {
  loadAllModules();       // 100ms
  registerAllHandlers();  // 80ms
  precomputeEverything(); // 120ms
}
document.addEventListener('DOMContentLoaded', init);

// After: defer initialization, prioritize interactivity
async function init() {
  // Only do the minimum needed for immediate interactivity
  registerCriticalHandlers();

  // Defer everything else until the browser is idle
  requestIdleCallback(async () => {
    await loadAllModules();
    await scheduler.yield();
    registerAllHandlers();
    await scheduler.yield();
    precomputeEverything();
  });
}
document.addEventListener('DOMContentLoaded', init);
```

---

### FCP (First Contentful Paint) Insight

**What it shows:**

FCP is the time from navigation start until the first DOM content (text or image) is painted. Performance Insights shows FCP as a marker on the timeline and flags it if it exceeds the Good threshold of 1.8 seconds.

**Common causes of slow FCP:**

- Render-blocking CSS or JavaScript in `<head>`.
- Slow TTFB (server response time).
- Large HTML document that delays parsing.

**Fixes:**

```html
<!-- Move non-critical CSS to be non-blocking -->
<link rel="preload" href="/styles/critical.css" as="style">
<link rel="stylesheet" href="/styles/non-critical.css" media="print" onload="this.media='all'">

<!-- Inline critical CSS directly in <head> -->
<style>
  /* Only the styles needed for above-the-fold content */
  body { margin: 0; font-family: sans-serif; }
  .hero { background: #f0f0f0; height: 60vh; }
</style>
```

---

### TBT / Long Tasks Insight

Total Blocking Time (TBT) is the sum of all time exceeding 50ms for each long task during the page load window (between FCP and TTI). Performance Insights shows individual long tasks in the Long Tasks insight card.

A **long task** is any main thread task that takes more than 50ms. The excess time (beyond 50ms) is the "blocking time" because the browser cannot respond to user input during it.

```
Long tasks detected:
  Task 1: 280ms at 1.2s  (blocking: 230ms)  — evaluate script: bundle.js
  Task 2: 190ms at 2.1s  (blocking: 140ms)  — timer fired: analytics.js
  Task 3: 95ms  at 3.4s  (blocking: 45ms)   — parse stylesheet: theme.css
```

**Fix:** Use code splitting to reduce bundle size, defer non-critical scripts, and chunk expensive initialization as shown in the INP fix patterns above.

---

## Render-Blocking Requests Insight

**What it shows:**

This insight lists every resource that blocked the browser from rendering content — CSS files and synchronous scripts in `<head>` that the parser must fetch and execute before painting anything.

```
Render-blocking resources:
  /styles/main.css      — blocks for 320ms
  /scripts/analytics.js — blocks for 180ms
  /fonts/brand.woff2    — blocks for 140ms (via @font-face preload)
```

**How render-blocking works:**

When the HTML parser encounters a `<link rel="stylesheet">` or a `<script>` without `defer`/`async`, it pauses parsing and waits for the resource to download and (for scripts) execute. Nothing renders until all blocking resources are processed.

**Fix: defer and async scripts:**

```html
<!-- Blocking: parser stops and waits -->
<script src="/js/analytics.js"></script>

<!-- async: downloads in parallel, executes when ready (order not guaranteed) -->
<!-- Good for independent scripts like analytics -->
<script src="/js/analytics.js" async></script>

<!-- defer: downloads in parallel, executes after HTML is parsed (order preserved) -->
<!-- Good for scripts that depend on DOM -->
<script src="/js/app.js" defer></script>
```

**Fix: extract critical CSS and defer the rest:**

```html
<head>
  <!-- Inline only above-the-fold styles — eliminates render-blocking CSS entirely -->
  <style>
    /* Critical path CSS — only what is needed for the initial viewport */
    body { margin: 0; }
    header { background: #fff; padding: 16px; }
    .hero { min-height: 50vh; }
  </style>

  <!-- Load the rest without blocking render -->
  <link rel="preload" href="/styles/full.css" as="style" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/full.css"></noscript>
</head>
```

**Fix: preload critical resources:**

```html
<!-- Preload the LCP image to reduce resource load delay -->
<link rel="preload" href="/images/hero.webp" as="image" fetchpriority="high">

<!-- Preload critical fonts to reduce FOUT -->
<link rel="preload" href="/fonts/brand.woff2" as="font" type="font/woff2" crossorigin>
```

---

## Forced Reflow Insight

**What it shows:**

A forced synchronous layout (also called "forced reflow") occurs when JavaScript reads a layout-dependent property (like `offsetHeight`, `getBoundingClientRect()`, `scrollTop`) immediately after writing to the DOM. The browser has no choice but to synchronously calculate layout before returning the value — this can cause significant jank.

Performance Insights flags these events and shows the call site.

**The pattern that causes it:**

```javascript
// This loop causes a forced reflow on every iteration
const elements = document.querySelectorAll('.item');

elements.forEach(el => {
  // WRITE: invalidates layout
  el.style.width = '100px';
  
  // READ: forces browser to synchronously recalculate layout
  // because the previous write made layout stale
  const height = el.offsetHeight;  // <-- forced reflow here
  
  console.log(height);
});
```

**Fix — batch reads and writes separately:**

```javascript
const elements = document.querySelectorAll('.item');

// PHASE 1: Read all values first (no layout invalidation yet)
const heights = Array.from(elements).map(el => el.offsetHeight);

// PHASE 2: Write all values (layout is only invalidated once at the end)
elements.forEach((el, i) => {
  el.style.width = '100px';
  el.dataset.height = heights[i];
});
```

**Fix — use ResizeObserver instead of reading dimensions in loops:**

```javascript
// Instead of polling dimensions, observe them reactively
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const { width, height } = entry.contentRect;
    // React to size changes without forcing layout
    updateLayout(entry.target, width, height);
  });
});

document.querySelectorAll('.item').forEach(el => observer.observe(el));
```

---

## Document Request Latency

**What it shows:**

This insight measures the time from when the browser initiates the navigation to when it receives the first byte of the HTML document (TTFB). It breaks this down into:

- **Redirect duration** — time spent following HTTP redirects.
- **Service worker startup** — if a service worker intercepts the request, startup overhead.
- **Cache lookup** — if using a service worker cache.
- **Server response time** — actual server processing time.

```
Document request latency: 820ms  (Poor — threshold is 600ms)
  Redirects:              120ms  <- Opportunity
  Server response time:   700ms  <- Primary issue
```

**Fixes:**

- Eliminate redirect chains (especially HTTP to HTTPS redirects that could be handled via HSTS).
- Use a CDN to reduce server response time.
- Enable HTTP/2 or HTTP/3 on your server.
- Cache HTML at the CDN edge for static or semi-static pages.
- Optimize server-side rendering or database query performance.

```html
<!-- Enable HSTS to avoid HTTP->HTTPS redirect on repeat visits -->
<!-- Set this header on your server: -->
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## Long Tasks Insight

**What it shows:**

The Long Tasks insight card lists every task on the main thread that exceeded 50ms during the recording. Each entry shows:

- The start time.
- The total duration.
- The script or activity that caused it.

```
Long tasks (4 found):
  1.2s  280ms  Script evaluation — chunk-vendors.js
  2.4s  150ms  Timer fired — analytics-sdk.js line 234
  3.1s  95ms   Style recalculation
  4.7s  220ms  Script evaluation — feature-module.js
```

**Why 50ms matters:**

The human perceptual threshold for "instant" response is around 100ms. Tasks over 50ms eat into that budget. Any long task that happens while a user is trying to interact causes input delay — the first phase of INP.

**Diagnosing a long task:**

When you see a long task in Performance Insights, switch to the **Performance panel** and record the same scenario. Find the same time window in the flame chart. Expand the task to see the full call stack and identify the specific function that is consuming the time.

**Fix: code splitting to reduce initial bundle evaluation time:**

```javascript
// Before: import everything at module load time
import { HeavyComponent } from './heavy-module';

// After: dynamically import only when needed
async function showHeavyFeature() {
  const { HeavyComponent } = await import('./heavy-module');
  HeavyComponent.render();
}
```

---

## Annotation Support

Performance Insights supports adding custom annotations (labels) directly to the timeline. This is useful for:

- Marking the exact moment a user interaction starts.
- Adding comments before sharing a recording screenshot with teammates.
- Labeling phases in a complex flow ("form opened", "API call started", "results rendered").

**Adding an annotation:**

1. In the timeline, right-click on any point in time.
2. Select **Add annotation**.
3. Type your label text.
4. The label appears as a flag at that timestamp.

**Programmatic annotations:**

You can mark points in your code using the `performance.mark()` API, which also appear in the Performance Insights timeline:

```javascript
// Add marks in your code that appear in the timeline
performance.mark('form:submit-start');
await submitForm(data);
performance.mark('form:submit-end');

// Optional: create a measure to show duration between marks
performance.measure('form:submit-duration', 'form:submit-start', 'form:submit-end');

// These markers appear in the timeline when you record in Performance Insights
// making it easy to correlate code execution with CWV metrics
```

---

## INP Optimization Workflow (Complete End-to-End)

This is a reproducible workflow for diagnosing and fixing a slow INP interaction.

### Step 1 — Record the interaction with Performance Insights

1. Open Performance Insights.
2. Set CPU throttling to 4x slowdown.
3. Set Network to Fast 3G.
4. Click **Start recording**.
5. Perform exactly the interaction that feels slow (one click, one keypress).
6. Click **Stop recording**.

### Step 2 — Identify the slow INP event

Look at the **INP insight card** in the sidebar. It will list interactions with their total latency. Click the slow one.

```
Interaction: click #add-to-cart at 2.1s
Total INP: 640ms  (Poor)
```

The timeline will zoom to that interaction and highlight the event window.

### Step 3 — Break down: input delay / processing / presentation

In the detail panel, read the three-phase breakdown:

```
Input delay:        320ms  <- Main thread was busy
Processing time:    280ms  <- Event handler work
Presentation delay:  40ms
```

In this example, input delay is the biggest problem — the main thread was occupied with a long task when the user clicked. Processing time is also significant.

### Step 4 — Profile the processing in Performance panel

Open the **Performance panel** (separate tab in DevTools). Record the same click. Find the time range identified in step 2. Look at the flame chart:

- Find the long task that caused the input delay.
- Find the event handler that caused the processing time.
- Note the exact function names and file locations.

```
Long task at 1.8s (duration: 350ms):
  evaluate-script (product-list.js)
    renderProductGrid()
      processFilters()          <- 180ms
        applyAllFilters()
          filterByCategory()    <- 90ms
          filterByPrice()       <- 90ms
```

### Step 5 — Defer or split the work

Based on the flame chart analysis, apply the appropriate fix.

**If input delay is high** — a long task is blocking input. Split that task:

```javascript
// Before: renderProductGrid runs synchronously for 350ms on page load,
// blocking all user input during that time
function initProductPage() {
  renderProductGrid(allProducts);  // 350ms long task
  setupFilters();
  setupCart();
}

// After: split into smaller tasks so the page is interactive sooner
async function initProductPage() {
  // Render visible products first
  renderProductGrid(allProducts.slice(0, 20));
  
  await scheduler.yield();
  
  setupFilters();
  
  await scheduler.yield();
  
  setupCart();
  
  await scheduler.yield();
  
  // Render remaining products in background
  renderProductGrid(allProducts.slice(20));
}
```

**If processing time is high** — the click handler does too much:

```javascript
// Before: click handler is synchronous and expensive
addToCartButton.addEventListener('click', async (e) => {
  const product = getCurrentProduct();      // fast
  updateCartInDOM(product);                 // fast — what user wants to see
  recalculateCartTotals();                  // 80ms — can be deferred
  syncWithLocalStorage();                   // 50ms — can be deferred
  sendAnalyticsEvent('add_to_cart');        // 40ms — can be deferred
  updateRecommendations(product);           // 110ms — can definitely be deferred
});

// After: only do the visible update immediately
addToCartButton.addEventListener('click', async (e) => {
  const product = getCurrentProduct();
  updateCartInDOM(product);                 // user sees the cart update instantly

  // Everything else deferred until after paint
  await scheduler.yield();
  recalculateCartTotals();

  requestIdleCallback(() => {
    syncWithLocalStorage();
    sendAnalyticsEvent('add_to_cart');
    updateRecommendations(product);
  });
});
```

### Step 6 — Verify improvement

1. Hard-reload the page to clear any cached state (`Cmd+Shift+R`).
2. Return to Performance Insights.
3. Record the same interaction again with the same throttling settings.
4. Check the INP insight card for the same interaction.
5. Confirm the three phases have improved — especially that processing time has decreased and input delay no longer shows a long preceding task.

```
Before fix:
  INP: 640ms — Input delay: 320ms, Processing: 280ms, Presentation: 40ms

After fix:
  INP: 130ms — Input delay: 20ms, Processing: 80ms, Presentation: 30ms
  Status: Good (< 200ms threshold)
```

If the INP is still above the Good threshold, repeat the workflow — record again, identify the next bottleneck in the breakdown, and apply another fix. Core Web Vital optimization is iterative.

---

## Quick Reference: Common Insights and Fixes

| Insight | What causes it | Primary fix |
|---|---|---|
| Slow LCP | Render-blocking resources, late image discovery, slow TTFB | `rel="preload"` for LCP image, inline critical CSS, CDN |
| High CLS | Images without dimensions, dynamic content above fold, FOUT | Set `width`/`height`, reserve space, `font-display: optional` |
| High INP input delay | Long tasks preceding the interaction | Split long tasks with `scheduler.yield()` |
| High INP processing | Expensive event handler | Defer non-visible work with `requestIdleCallback` |
| Render-blocking request | Synchronous scripts or CSS in `<head>` | `async`/`defer`, inline critical CSS |
| Forced reflow | Reading layout properties after DOM writes | Batch reads before writes |
| Document request latency | Slow server, redirect chains | CDN, HSTS, eliminate redirects |
| Long tasks | Large JS bundles, synchronous initialization | Code splitting, dynamic imports, chunked processing |

---

[← Web Devtools](/coding/web-devtools/)
