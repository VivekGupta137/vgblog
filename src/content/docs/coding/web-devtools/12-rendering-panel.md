---
title: 12 Rendering Panel
---

# Chrome DevTools: Rendering Panel

## What the Rendering Panel Is

The Rendering panel is a diagnostic overlay toolkit built into Chrome DevTools. It does not show you source code or network requests — it visualizes what the browser's rendering engine is doing at runtime. Every frame your browser draws involves a pipeline of discrete stages: style calculation, layout, paint, and compositing. The Rendering panel lets you watch those stages in real time, highlight expensive operations, emulate visual accessibility conditions, and catch layout shifts as they happen.

This panel is the primary tool for answering questions like:

- Why does scrolling feel janky?
- Which elements are being repainted on every frame?
- What is causing my Cumulative Layout Shift score to be high?
- How many GPU layers is my page using?
- Does my dark mode implementation actually work correctly?
- Is my site usable by someone with color blindness?

The panel exposes toggles that add visual overlays directly on top of your running page, so you see the effects in context without leaving the browser.

---

## How to Open It

**Method 1 — More Tools menu:**
1. Open DevTools (`F12` or `Cmd+Option+I` on Mac, `Ctrl+Shift+I` on Windows/Linux).
2. Click the three-dot menu (`...`) in the top-right corner of the DevTools panel.
3. Hover over **More tools**.
4. Click **Rendering**.

The Rendering panel appears as a drawer at the bottom of DevTools.

**Method 2 — Command Menu (fastest):**
1. Open DevTools.
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) to open the Command Menu.
3. Type `rendering` and select **Show Rendering**.

**Method 3 — Drawer tab:**
If you have previously opened the Rendering panel, it persists as a tab in the DevTools drawer. Press `Escape` to toggle the drawer, then click the **Rendering** tab.

---

## UI Layout (All Toggles Listed)

When the Rendering panel is open you see a scrollable list of checkboxes and dropdowns. As of Chrome 120+, the full list is:

| Toggle / Control | Type |
|---|---|
| Paint flashing | Checkbox |
| Layout Shift Regions | Checkbox |
| Layer borders | Checkbox |
| Frame Rendering Stats (FPS meter) | Checkbox |
| Scrolling performance issues | Checkbox |
| Highlight ad frames | Checkbox |
| Hit-test borders | Checkbox |
| Core Web Vitals | Checkbox |
| Disable local fonts | Checkbox |
| Emulate a focused page | Checkbox |
| Emulate CSS media feature prefers-color-scheme | Dropdown |
| Emulate CSS media feature prefers-reduced-motion | Dropdown |
| Emulate CSS media feature prefers-reduced-transparency | Dropdown |
| Emulate CSS media feature prefers-contrast | Dropdown |
| Emulate CSS media feature forced-colors | Dropdown |
| Emulate CSS media feature prefers-reduced-data | Dropdown |
| Emulate CSS media feature color-gamut | Dropdown |
| Emulate vision deficiencies | Dropdown |

All toggles are independent. You can enable multiple at once. Overlays are drawn on top of your page content in real time; they do not affect what users see in production.

---

## Paint Flashing (Green Overlay)

**What it shows:** Every time the browser needs to repaint a region of the page, that region flashes green for one frame. A steady green flash on every scroll frame is a warning sign.

### What triggers a repaint

The browser has to repaint any area where pixels need to change. This is triggered by CSS property changes that affect how an element looks but not its position or geometry within the paint stage:

- `color` — text color changed
- `background-color` / `background-image` — background changed
- `box-shadow` — shadow added or animated
- `border-color` — border color changed
- `visibility: hidden` toggled — the space is kept but pixels change
- `outline` changes
- `text-decoration` changes
- Any pseudo-element content that changes (`:hover` state with color transitions)

Repaints are also triggered by layout changes (since layout feeds into paint), but paint flashing specifically highlights the paint stage.

### Reading the overlay

- **Small, infrequent flashes** — acceptable. A button that flashes green when hovered is normal.
- **Large portions of the page flashing on every scroll event** — problematic. It means the browser is repainting large areas 60 times per second during scroll.
- **The entire viewport flashing** — often caused by a fixed-position element with a `background-color` that participates in scrolling recompositing.

### How to reduce repaints

**Use `transform` and `opacity` for animations instead of properties that trigger paint:**

```css
/* Bad — triggers paint on every frame */
.animated-box {
  transition: background-color 300ms ease, left 300ms ease;
}

/* Good — compositor-only, no paint needed */
.animated-box {
  transition: transform 300ms ease, opacity 300ms ease;
}
```

**Avoid changing `background-color` on scroll:**

```javascript
// Bad — causes repaint on every scroll event
window.addEventListener('scroll', () => {
  header.style.backgroundColor = window.scrollY > 100 ? '#fff' : 'transparent';
});

// Better — use a CSS class toggle, and ensure the class change only affects
// compositor-friendly properties, or batch the style change with requestAnimationFrame
window.addEventListener('scroll', () => {
  requestAnimationFrame(() => {
    header.classList.toggle('scrolled', window.scrollY > 100);
  });
}, { passive: true });
```

**Contain paint to smaller areas using `contain: paint`:**

```css
/* Tells the browser this element's paint is independent */
.card {
  contain: paint;
}
```

With `contain: paint`, a repaint inside `.card` does not invalidate paint outside it.

**Promote elements that animate frequently to their own compositor layer:**

```css
.frequently-animated {
  will-change: transform;
}
```

Once on its own layer, that element can be moved by the compositor thread without a paint step. See the Layer Borders and `will-change` sections for full details.

---

## Layout Shift Regions (Blue Overlay)

**What it shows:** Elements that shift their position unexpectedly flash blue. This directly visualizes the browser's CLS (Cumulative Layout Shift) scoring — every blue flash corresponds to a layout shift event that would contribute to your CLS score.

### What CLS measures

CLS is a Core Web Vitals metric. It measures the total visual instability of a page. A score below 0.1 is good, 0.1–0.25 needs improvement, and above 0.25 is poor. Each layout shift event contributes an impact fraction (how much of the viewport moved) multiplied by a distance fraction (how far it moved).

### Finding what elements shift and when

1. Enable **Layout Shift Regions** in the Rendering panel.
2. Load or interact with your page.
3. Watch for blue overlays. The flash is brief, so for content that loads asynchronously you may need to:
   - Throttle the network in the Network panel to slow down resource loading.
   - Use the Performance panel simultaneously to record a timeline and inspect layout shift events in detail.
4. Note which element flashed. Open the Elements panel and inspect it. Common culprits:
   - Images without explicit `width` and `height` attributes.
   - Ads injected by third-party scripts.
   - Web fonts that cause text reflow (FOUT — Flash of Unstyled Text).
   - Dynamic banners or cookie consent bars inserted at the top of the page after initial paint.
   - Embeds (iframes, videos) without reserved dimensions.

### Fixing layout shifts

**Reserve space for images and video with explicit dimensions:**

```html
<!-- Bad — browser does not know height until image loads, everything shifts down -->
<img src="hero.jpg" alt="Hero image">

<!-- Good — browser reserves the exact space before the image loads -->
<img src="hero.jpg" alt="Hero image" width="1200" height="630">
```

For responsive images, use the CSS `aspect-ratio` property:

```css
img {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
}
```

**Reserve space for ads and embeds:**

```css
.ad-slot {
  min-height: 250px; /* reserve the expected ad height */
  width: 300px;
}
```

**Avoid inserting content above existing content:**

```javascript
// Bad — inserts a banner at the top, pushing all content down
document.body.insertBefore(banner, document.body.firstChild);

// Better — use a placeholder that was already in the DOM
const placeholder = document.getElementById('banner-slot');
placeholder.appendChild(banner);
```

**Handle web fonts to prevent reflow:**

```css
/* Use font-display: optional to prevent FOUT-driven shifts */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-display: optional;
}
```

Or preload critical fonts:

```html
<link rel="preload" href="/fonts/myfont.woff2" as="font" type="font/woff2" crossorigin>
```

---

## Layer Borders (Orange/Olive Borders)

**What it shows:** Orange borders highlight GPU compositing layers. Olive/yellow borders highlight tiles (subdivisions within layers used by the compositor). Each distinct bordered region is being composited independently by the GPU.

### GPU compositing layers — what they are

The browser divides the rendered page into layers. Think of them as transparent acetate sheets stacked on top of each other. Each layer is uploaded to the GPU as a texture. When the compositor needs to update the page (for example, during a scroll or a CSS `transform` animation), it can reposition and blend those textures on the GPU without asking the main thread to recalculate anything.

This is why smooth 60fps animations are possible even when JavaScript is busy: the compositor thread on the GPU continues drawing frames independently.

### Why layers matter: compositor thread vs main thread

| Thread | Handles | Can be blocked by |
|---|---|---|
| Main thread | JavaScript, Style, Layout, Paint | Long JS tasks, heavy style recalculation |
| Compositor thread | Compositing, scrolling, transform/opacity animations | Almost nothing — it runs independently |

When an animation only requires compositing (not layout or paint), it runs entirely on the compositor thread. This is the reason `transform` and `opacity` are the gold-standard animation properties.

### What promotes an element to its own compositor layer

The browser decides which elements get their own layer. You can influence this, but the browser may override your hints. Elements that typically get their own layer:

- **`transform` property** — especially 3D transforms like `translateZ(0)` or `translate3d(0,0,0)`.
- **`opacity` less than 1** — if animated or transitioned.
- **`will-change: transform` or `will-change: opacity`** — explicit hint to the browser.
- **`position: fixed`** — fixed elements composite separately from the scroll layer.
- **`<video>` and `<canvas>` elements** — they always get their own layer because their content is managed independently.
- **`<iframe>` elements** — each iframe is its own compositor context.
- **Elements with CSS filters** — `filter: blur(4px)` promotes to its own layer.
- **Elements that overlap a composited layer** — the browser may promote overlapping elements to avoid incorrect z-ordering.

### Layer explosion anti-pattern

Promoting everything to its own layer sounds appealing but causes serious problems:

- Each layer requires GPU memory to store the texture. On mobile devices with limited GPU memory, you can crash the page or cause the browser to de-promote layers mid-animation (causing a janky frame).
- Creating thousands of layers (for example, by applying `will-change: transform` to every list item in a long list) can consume hundreds of megabytes of GPU memory.
- The compositor still has to blend all layers together, which takes time proportional to layer count and size.

**Workflow for checking layer count:**
1. Enable **Layer borders** in the Rendering panel.
2. Scroll through your page. Count the orange-bordered regions.
3. If you see dozens of orange boxes on a static page, look for `will-change` applied too broadly or unnecessary 3D transforms.
4. Use the **Layers panel** (DevTools > More tools > Layers) for a 3D visualization of all layers, including their memory cost.

---

## FPS Meter

**What it shows:** A semi-transparent overlay in the top-right corner of the viewport that displays:

- Current frames per second (FPS) as a live number and a graph.
- GPU memory usage.

### Reading the FPS meter

The graph scrolls from right to left. The Y axis goes from 0 to 60 fps (or higher on 120hz displays).

| Reading | Meaning |
|---|---|
| Solid green bar at 60fps | Smooth, no rendering bottleneck |
| Drops to 30fps during interaction | Possible main thread block; check Performance panel |
| Drops to < 20fps on scroll | Likely layout or paint work on scroll; check Scrolling performance issues |
| GPU memory climbing continuously | Layer explosion or GPU texture leak |
| Erratic spikes and drops | Garbage collection or inconsistent JavaScript work |

### Using the FPS meter

1. Enable **Frame Rendering Stats** (FPS meter) in the Rendering panel.
2. Scroll, interact, and animate on your page.
3. When you see a dip, immediately open the Performance panel and record a trace to identify the exact cause.
4. The FPS meter alone tells you *that* there is a problem; the Performance panel tells you *why*.

The GPU memory readout is useful for tracking layer explosion. If you enable `will-change` on many elements, watch the GPU memory number rise immediately.

---

## Scrolling Performance Issues

**What it shows:** Highlights elements (in teal/cyan) that have scroll event listeners registered without the `passive: true` option.

### Why non-passive scroll listeners hurt performance

When the browser starts a scroll gesture, it checks whether any JavaScript has registered a `wheel` or `touchstart`/`touchmove` listener on the scroll path. If those listeners are not marked `passive`, the browser must wait for the JavaScript to run before it can start scrolling — because the script might call `event.preventDefault()` to cancel the scroll.

This waiting forces scroll to happen on the main thread and blocks the compositor, destroying scroll smoothness. On low-end devices this can cause 200–500ms delays before scrolling begins.

### Fixing non-passive scroll listeners

Add `{ passive: true }` as the third argument to `addEventListener`. This tells the browser: "I promise I will not call `preventDefault()`, you can scroll immediately."

```javascript
// Bad — blocks scrolling until this handler finishes
window.addEventListener('scroll', onScroll);

// Also bad — blocks touch scrolling
element.addEventListener('touchstart', onTouchStart);
element.addEventListener('touchmove', onTouchMove);

// Good — passive listener, browser can scroll without waiting
window.addEventListener('scroll', onScroll, { passive: true });
element.addEventListener('touchstart', onTouchStart, { passive: true });
element.addEventListener('touchmove', onTouchMove, { passive: true });
```

If you genuinely need to call `event.preventDefault()` (for example, to prevent pull-to-refresh), you cannot use `passive: true` for that specific listener. In that case, keep the listener non-passive but ensure it runs as fast as possible.

**Using Intersection Observer instead of scroll listeners:**

For many common use cases — sticky headers, lazy loading, infinite scroll detection — `IntersectionObserver` is a better tool than a scroll listener. It runs off the main thread and is inherently non-blocking:

```javascript
// Instead of a scroll listener that checks getBoundingClientRect on every frame:
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.lazy-item').forEach(el => observer.observe(el));
```

---

## CSS Media Feature Emulation

The Rendering panel lets you override the media features that Chrome reports to CSS, without changing your OS settings. This is invaluable for testing responsive design decisions and accessibility features in isolation.

### prefers-color-scheme: dark / light

```css
/* Your CSS */
body {
  background: white;
  color: black;
}

@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #e0e0e0;
  }
}
```

Set the dropdown to **dark** in the Rendering panel to test the dark mode branch without changing your OS appearance setting. This also works for headless testing workflows.

### prefers-reduced-motion: reduce / no-preference

Users who experience motion sickness or vestibular disorders can enable "Reduce Motion" in their OS accessibility settings. CSS respects this:

```css
.hero-animation {
  animation: slideIn 600ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .hero-animation {
    animation: none;
    /* Or use a subtler fade instead */
    transition: opacity 200ms;
  }
}
```

Set the Rendering panel dropdown to **reduce** to verify that all animations and transitions degrade gracefully.

### prefers-contrast: more / less / forced

Some users (particularly those with low vision) increase system contrast. CSS can respond:

```css
.button {
  background: #6c757d;
  color: white;
}

@media (prefers-contrast: more) {
  .button {
    background: #000;
    color: #fff;
    border: 2px solid #fff;
  }
}
```

### forced-colors: active / none

Windows High Contrast Mode (and its successor "Forced Colors" mode) replaces your CSS color palette with a limited system palette. The browser ignores most color CSS and replaces it with system keywords like `ButtonText`, `Canvas`, `LinkText`. Test this with the **forced-colors: active** emulation to ensure your UI remains usable.

```css
.icon {
  fill: currentColor;
}

@media (forced-colors: active) {
  .icon {
    fill: ButtonText; /* Use the system-defined text color */
  }
}
```

### prefers-reduced-data

A less common but emerging feature. Users on metered connections can signal they want reduced data usage:

```css
@media (prefers-reduced-data: reduce) {
  .hero-image {
    /* Serve a lower-quality or no-image fallback */
    background-image: none;
    background-color: #f0f0f0;
  }
}
```

### color-gamut: srgb / p3 / rec2020

Modern displays (iPhone, iPad, MacBook Pro with Retina) support Display P3, a wider color gamut than sRGB. Use this emulation to test wide-gamut color:

```css
.brand-red {
  color: #e00;
}

@media (color-gamut: p3) {
  .brand-red {
    color: color(display-p3 0.9 0.1 0.1);
  }
}
```

Switching between `srgb` and `p3` in the Rendering panel lets you compare the color rendering without needing a wide-gamut display.

---

## Vision Deficiency Emulation

The Rendering panel can apply CSS filters that simulate how users with various vision conditions experience your page. This does not require any specialized tool, browser extension, or OS accessibility mode — it is built in.

### Available simulations

| Option | What it simulates |
|---|---|
| Blurred vision | Reduced visual acuity — everything appears out of focus |
| Reduced contrast | Low contrast sensitivity — subtle distinctions become invisible |
| Achromatopsia | Complete color blindness — the world is entirely greyscale |
| Protanopia | Red-weak — red appears dark, red-green contrast is lost |
| Deuteranopia | Green-weak — green appears muted, red-green confusion |
| Tritanopia | Blue-yellow deficiency — blue and yellow are confused |

### Why this matters

Approximately 8% of men and 0.5% of women of Northern European descent have some form of color vision deficiency. Deuteranopia and protanopia together account for most cases.

Common problems revealed by vision deficiency emulation:

- **Error states shown only in red** — Protanopia and deuteranopia users cannot distinguish red error text from normal text. Add an icon or underline in addition to color.
- **Charts with red/green encoding** — A pie chart colored red and green looks identical to a deuteranopia user. Use blue/orange or add patterns.
- **Low-contrast placeholder text** — Reduced contrast simulation reveals whether placeholder text in form fields is readable.
- **Green success / red failure** — UI patterns that rely entirely on red vs green cannot be distinguished under achromatopsia.

### Workflow

1. Select a vision deficiency from the dropdown.
2. Navigate through your primary user flows — forms, error states, charts, navigation.
3. Note any elements where the meaning depends entirely on color.
4. Fix by adding text labels, icons, patterns, or sufficient contrast independent of hue.
5. Verify the fix by re-testing with emulation enabled.

The emulation applies a CSS `filter` to the entire page and is removed when you set the dropdown back to **No emulation**.

---

## The Rendering Pipeline (ASCII Diagram)

Every visual change the browser makes goes through some or all of these five stages:

```
+----------------+     +----------------+     +----------------+     +----------------+     +-------------------+
|                |     |                |     |                |     |                |     |                   |
|   JavaScript   | --> |     Style      | --> |     Layout     | --> |     Paint      | --> |    Composite      |
|                |     |                |     |                |     |                |     |                   |
| DOM mutations  |     | Recalculate    |     | Box model,     |     | Fill pixels    |     | GPU assembles     |
| Class changes  |     | computed       |     | geometry,      |     | into layers    |     | layer textures    |
| Animations     |     | styles for     |     | positions,     |     | (rasterize)    |     | and draws to      |
| requestAnim-   |     | affected       |     | sizes          |     |                |     | screen            |
| ationFrame     |     | elements       |     |                |     |                |     |                   |
+----------------+     +----------------+     +----------------+     +----------------+     +-------------------+

     Main thread                                                                               Compositor thread
<----------------------------------------------------------------->  <------------------------->
```

**Key insight:** Stages can be skipped. If only `opacity` changes, the browser skips Style (already computed), Layout (geometry unchanged), and Paint (no new pixels to fill) and goes straight to Composite. This is why `opacity` is so cheap to animate.

If `width` changes, all five stages run. The main thread is occupied for all of them before the compositor can draw a new frame.

### CSS Properties by Rendering Stage

The following table shows which stages each property triggers. "Composite only" is the cheapest. "Layout + Paint + Composite" is the most expensive.

| Property | Layout | Paint | Composite | Notes |
|---|---|---|---|---|
| `transform` | No | No | Yes | Cheapest — compositor only |
| `opacity` | No | No | Yes | Cheapest — compositor only |
| `will-change` | No | No | No | Does not trigger rendering; hints future promotion |
| `color` | No | Yes | Yes | Text color repaints the text layer |
| `background-color` | No | Yes | Yes | Repaints the background layer |
| `background-image` | No | Yes | Yes | Decodes and paints the new image |
| `box-shadow` | No | Yes | Yes | Repaints the shadow region |
| `border-color` | No | Yes | Yes | Repaints the border pixels |
| `outline` | No | Yes | Yes | Repaints outline |
| `text-decoration` | No | Yes | Yes | Repaints text decoration |
| `visibility` | No | Yes | Yes | `hidden` still occupies space, repaints |
| `filter` (static) | No | Yes | Yes | Triggers paint pass |
| `filter` (animated) | No | No | Yes | Animated filters can composite-only if hardware-accelerated |
| `width` | Yes | Yes | Yes | Most expensive — full pipeline |
| `height` | Yes | Yes | Yes | Full pipeline |
| `margin` | Yes | Yes | Yes | Full pipeline |
| `padding` | Yes | Yes | Yes | Full pipeline |
| `top` / `left` (positioned) | Yes | Yes | Yes | Full pipeline — use transform instead |
| `font-size` | Yes | Yes | Yes | Affects text layout |
| `display` | Yes | Yes | Yes | Full pipeline |
| `flex` / `grid` properties | Yes | Yes | Yes | Full pipeline |
| `border-width` | Yes | Yes | Yes | Affects box model |
| `position` | Yes | Yes | Yes | May affect all subsequent elements |

### Composite-only properties

These two are the only CSS properties that, when changed or animated, require only the composite stage. Use these for performance-critical animations:

```css
/* Composite only — runs on GPU compositor thread, never blocks main thread */
.smooth-move {
  transition: transform 300ms ease;
}

.smooth-fade {
  transition: opacity 300ms ease;
}
```

### Paint properties — cheap but not free

These skip layout but still require rasterizing pixels:

```css
/* These skip layout but trigger paint — acceptable for hover states, not for every-frame animations */
.hover-effect:hover {
  color: #0056b3;
  background-color: #e8f0fe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

### Layout properties — most expensive

Changing these forces the browser to recalculate the geometry of the element and potentially every element that follows it in the DOM:

```css
/* Avoid animating these — use transform instead */

/* Bad — animates width, triggers full pipeline on every frame */
.expanding-bad {
  width: 100px;
  transition: width 300ms;
}
.expanding-bad:hover {
  width: 200px;
}

/* Good — animates transform, compositor only */
.expanding-good {
  transform: scaleX(1);
  transform-origin: left center;
  transition: transform 300ms;
}
.expanding-good:hover {
  transform: scaleX(2);
}
```

---

## will-change CSS Property

`will-change` is a CSS hint that tells the browser to prepare for a future change. The browser can use this hint to promote an element to its own compositor layer before the change happens, eliminating the jank that occurs when a new layer must be created mid-animation.

### When to use it

Use `will-change` for elements you know will animate:

```css
/* Tell the browser this element will animate its transform */
.modal {
  will-change: transform;
}

/* Applied just before the animation starts (via JavaScript) */
function openModal() {
  modal.style.willChange = 'transform';
  modal.classList.add('open');
}

/* Remove it after the animation ends */
modal.addEventListener('transitionend', () => {
  modal.style.willChange = 'auto';
});
```

```css
/* For elements that are always animated (carousel, spinner) */
.spinner {
  will-change: transform;
  animation: spin 1s linear infinite;
}
```

### When NOT to use it

**Do not apply `will-change` to everything.** This is the most common mistake.

```css
/* Bad — creates a GPU layer for every card on the page */
.card {
  will-change: transform; /* costs GPU memory for every card */
}

/* Good — only apply to elements that will actually animate */
.card:hover {
  will-change: transform; /* too late — the hint needs to arrive before animation */
}
```

The browser creates a GPU texture for each element with `will-change`. On a page with 100 cards, applying `will-change: transform` to all of them creates 100 GPU textures before any animation starts. On mobile, this can exhaust GPU memory.

**Preferred pattern:** Add `will-change` via JavaScript just before the animation and remove it on `transitionend` or `animationend`. If this is too late (the first frame is still janky), apply it on a parent hover:

```css
/* Add the hint one interaction before the animation */
.card-container:hover .card {
  will-change: transform;
}

/* The actual animation plays on the card itself */
.card.is-open {
  transform: scale(1.05);
  transition: transform 200ms ease;
}
```

### will-change: transform vs will-change: contents

| Value | Meaning | Use case |
|---|---|---|
| `will-change: transform` | Element's position/scale/rotation will change | Translate/scale/rotate animations |
| `will-change: opacity` | Element's opacity will change | Fade in/out animations |
| `will-change: contents` | The children of this element will change | Scrolling containers, canvas elements |
| `will-change: scroll-position` | The element's scroll offset will change | Custom scrolling containers |
| `will-change: auto` | Remove the hint | After animation completes |

```css
/* A scrollable container that does custom scroll animations */
.scroll-container {
  will-change: scroll-position;
  overflow-y: auto;
}

/* An element whose children update frequently (e.g., a live data widget) */
.live-chart {
  will-change: contents;
}
```

---

## Creating Layers for Performance

### The translateZ(0) and translate3d(0,0,0) hack

Before `will-change` was standardized, developers used a trick: applying a 3D transform (even a zero-value one) forced the browser to create a compositor layer:

```css
/* The old hack — forces layer creation on older browsers */
.promote-to-layer {
  transform: translateZ(0);
  /* or equivalently: */
  transform: translate3d(0, 0, 0);
}
```

This still works in all browsers and is useful for supporting older Chrome/Safari versions. In modern code, `will-change: transform` is the preferred approach.

### When layer creation helps

Layer creation helps when:

1. **An element animates frequently and independently** — a modal overlay, a sidebar that slides in, a loading spinner, a parallax background layer.
2. **Scrolling causes the element to move over other content** — fixed headers, floating action buttons.
3. **An element overlaps with other content and has CSS filters or blending modes** — isolating it into its own layer prevents the filter from forcing repainting of overlapping content.

```css
/* Sliding sidebar — benefits from its own layer */
.sidebar {
  will-change: transform;
  transform: translateX(-100%);
  transition: transform 300ms ease;
}

.sidebar.open {
  transform: translateX(0);
}
```

### When it hurts

Layer creation hurts when:

1. **Applied indiscriminately** — hundreds of layers exhaust GPU memory.
2. **The element is large and rarely animates** — a full-screen background image promoted to a layer wastes the memory of storing a full-screen texture.
3. **On memory-constrained devices** — the browser may de-promote layers under memory pressure, causing a janky frame.
4. **When content inside the layer changes frequently** — `will-change: transform` only helps the compositing step. If the layer's pixels are changing (due to DOM mutations inside it), the layer must still be repainted before being composited.

```css
/* Counterproductive — this element never animates; the layer wastes GPU memory */
.static-hero-image {
  will-change: transform; /* don't do this */
}

/* A scrollable list with thousands of items — don't promote each item */
.list-item {
  will-change: transform; /* never do this for long lists */
}
```

---

## Debugging CLS — Workflow Example

This is a step-by-step example of using the Rendering panel to find and fix a CLS issue on a blog page that has a high CLS score in Lighthouse.

**Step 1: Confirm the problem exists**

1. Open the page in a new incognito tab (to avoid cache effects).
2. Open DevTools and go to the Rendering panel.
3. Enable **Layout Shift Regions**.
4. Reload the page with the network throttled to "Slow 3G" in the Network panel.
5. Watch the page load. Note any blue flashes. On a blog, you typically see:
   - Hero image area flashing blue — the image loads and pushes text down.
   - Ad slot flashing blue — an ad injects and shifts article content down.

**Step 2: Identify the shifting elements**

1. With **Layout Shift Regions** still enabled, reload again.
2. When a blue flash appears, immediately pause — note the rough location on the page.
3. Switch to the Elements panel and inspect that region.
4. Look for images without `width`/`height`, or containers without a defined height.

**Step 3: Record a Performance trace for precise attribution**

1. Open the Performance panel.
2. Click Record.
3. Reload the page.
4. Stop recording after the page finishes loading.
5. In the timeline, look for the red "Layout Shift" markers in the Experience row.
6. Click a marker. The bottom panel shows which elements contributed to the shift and their impact score.

**Step 4: Apply fixes**

For a hero image causing a shift:

```html
<!-- Before: browser doesn't know height, shifts on load -->
<img src="/images/hero.jpg" alt="Article hero" class="hero-img">

<!-- After: browser reserves the space -->
<img
  src="/images/hero.jpg"
  alt="Article hero"
  width="1200"
  height="630"
  class="hero-img"
>
```

```css
/* Ensure the reserved dimensions are respected responsively */
.hero-img {
  width: 100%;
  height: auto;
  aspect-ratio: 1200 / 630;
}
```

For an ad slot:

```css
/* Reserve minimum height for the ad slot before it loads */
.ad-banner-slot {
  min-height: 90px; /* standard leaderboard height */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
```

**Step 5: Verify the fix**

1. Save your changes.
2. Reload the page with **Layout Shift Regions** still enabled.
3. Confirm no blue flashes appear where you applied the fix.
4. Run a Lighthouse audit (`Cmd+Shift+P` > "Generate Lighthouse report") to confirm the CLS score improved.
5. Run three audits and average the results, as CLS scores can vary slightly between runs.

**Step 6: Check for regressions**

Walk through the entire page — header, body, sidebar, footer — looking for any remaining blue flashes. CLS bugs often exist in multiple places, and fixing one reveals others. Repeat the fix cycle until the full-page CLS score is below 0.1.

---

[← Web Devtools](/coding/web-devtools/)
