---
title: 13 Animations Panel
---

# Chrome DevTools — Animations Panel

---

## What the Animations Panel Is

The Animations panel is a dedicated DevTools drawer tool that lets you **capture, inspect, replay, slow down, and interactively edit** every CSS transition, CSS `@keyframes` animation, and Web Animations API (WAAPI) animation running on a page — all without touching source code.

Core capabilities at a glance:

| Capability | What you can do |
|---|---|
| Capture | Record every animation that fires after you open the panel |
| Inspect | See which element, which property, duration, delay, iteration count, easing |
| Replay | Re-run any captured animation group with one click |
| Slow-motion | Play at 100 %, 25 %, or 10 % speed |
| Edit delay | Drag an animation bar left/right to shift when it starts |
| Edit duration | Drag the trailing edge of a bar to stretch or shrink total runtime |
| Edit keyframes | Drag diamond handles to reposition individual keyframe stops |
| Edit easing | Open the cubic-bezier editor, reshape the curve, see the result live |
| Jump to source | Click an animated element label to highlight it in the Elements panel |

The panel is non-destructive — edits are in-memory overrides that let you iterate quickly; they do not write back to your CSS files.

---

## How to Open the Animations Panel

### Method 1 — Menu (most reliable)

1. Open DevTools (`F12` / `Cmd+Opt+I` on macOS / `Ctrl+Shift+I` on Windows/Linux).
2. Click the **`...` (More options)** icon in the top-right of the DevTools toolbar.
3. Choose **More tools > Animations**.

The Animations panel opens as a new tab in the **drawer** (the bottom section of DevTools).

### Method 2 — Command Menu (fastest)

1. Open DevTools.
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS).
3. Type `animations` and select **Show Animations**.

### Method 3 — Drawer shortcut

1. DevTools open, press `Esc` to reveal the drawer if it is hidden.
2. Click the **`+`** icon in the drawer tab bar and select **Animations**.

:::note
The panel is empty until animations actually fire. It does not show animations that already finished before you opened the panel.
:::

---

## UI Layout

```
+-----------------------------------------------------------------------+
|  ANIMATIONS PANEL                                                     |
|                                                                       |
|  [|>] [<<] [ 100% v ]      <- Controls bar                           |
|   Play  Replay  Speed                                                 |
+-----------------------------------------------------------------------+
|  Animation Groups pane (left sidebar)                                 |
|  +------------------+                                                 |
|  | Group 1  320ms   |  <- Click to select and inspect                 |
|  | Group 2  800ms   |                                                 |
|  | Group 3  1200ms  |                                                 |
|  +------------------+                                                 |
+-----------------------------------------------------------------------+
|  Timeline (right, expands horizontally = time)                        |
|                                                                       |
|  0ms         200ms         400ms         600ms         800ms          |
|  |------------|------------|------------|------------|                |
|                                                                       |
|  .hero-title   [=============================]  opacity              |
|                     ^delay^  ^---duration---^                         |
|  .hero-title   [         [====]             ]  transform             |
|                          ^keyframe diamonds^                          |
|  .nav-link     [    [================]      ]  transform             |
|  .nav-link     [    [================]      ]  opacity               |
|  .card         [             [========]     ]  box-shadow            |
|                                                                       |
|  <- Scrubber line (drag to seek) ->                                   |
|                                                                       |
+-----------------------------------------------------------------------+
|  Selected animation detail row                                        |
|  Element: .hero-title   Property: opacity   Easing: ease-in-out      |
|  Duration: 600ms   Delay: 0ms   Iterations: 1   Direction: normal     |
+-----------------------------------------------------------------------+
```

### Control bar breakdown

| Control | Icon | Keyboard | Purpose |
|---|---|---|---|
| Pause / Resume | `||` / `|>` | — | Pause all captured animations at their current position |
| Replay | `<<` | — | Restart the selected animation group from time 0 |
| Speed selector | dropdown | — | 100 % (real-time), 25 % (slow), 10 % (very slow) |

### Animation Groups pane

Each row is one **animation group** — a set of animations Chrome determined fired together (within ~1 frame of each other). The group label shows the longest duration in that set. Click a row to load that group into the timeline.

### Timeline

- **X-axis** is time in milliseconds from the start of the group.
- **Each horizontal bar** is one animated property on one element.
- **Bar left edge** = when the delay ends and the animation begins.
- **Bar body** = active animation duration.
- **Diamond handles** inside the bar = individual `@keyframes` stops.
- **Vertical scrubber** = current playhead; drag it to seek.

---

## Capturing Animations

The panel listens passively — any animation that starts while the panel is open is automatically recorded.

### Triggering animations to capture

| Technique | When to use |
|---|---|
| Hover over the element in the browser | CSS `:hover` transitions |
| Click a button / toggle a class | JS-triggered transitions and WAAPI |
| Reload the page with the panel already open | Page-load animations |
| Use the Elements panel to manually add/remove a class | Isolated testing |
| Use the Console to call `element.animate(...)` | WAAPI one-offs |

Each newly captured group appears at the top of the Groups pane and is auto-selected.

### Clearing captured groups

Click the **clear** icon (circle with a line) in the controls bar to discard all captured groups and start fresh. Useful after you have triggered several unrelated animations and the list is cluttered.

---

## Animation Groups — What They Are

Chrome batches concurrent animations into a **group** when they start within approximately one animation frame (~16 ms) of each other. This matches how animations are perceived as a single coordinated choreography by the user.

### Why grouping matters

- A page-load entrance animation that fades in a heading, slides in a nav bar, and scales up a hero image all at `t=0` will appear as a single group.
- An independent tooltip animation triggered three seconds later will be a separate group.
- This means one "group" in the panel = one design intent you can inspect holistically.

### Group duration

The group's displayed duration is the time from the earliest animation start (minus any negative delays) to the last animation's end. All bars in the timeline are scaled relative to this total span.

---

## The Animation Timeline in Depth

### Reading the timeline

```
Time (ms):  0    100   200   300   400   500   600   700   800
            |-----|-----|-----|-----|-----|-----|-----|-----|

.box transform  [--delay--|==============================]
                          ^                              ^
                       t=150ms start               t=750ms end
                       (150ms delay)               (600ms duration)

.box opacity    [=============================]
                ^                             ^
              t=0ms start                 t=500ms end
              (no delay)                 (500ms duration)
```

- The **gap before the bar** is the animation delay.
- The **length of the bar** is the animation duration.
- **Multiple bars on the same element** mean multiple properties are animated simultaneously.

### Identifying animations

Each row in the timeline shows:
- **Element selector** — the CSS selector or element tag Chrome resolves for the animated node.
- **Property name** — e.g., `transform`, `opacity`, `background-color`.
- Hovering a bar shows a tooltip with: element, property, duration, delay, easing function, iteration count, fill mode, direction.

### Duration, delay, and iteration count

| Concept | Where visible | Edit method |
|---|---|---|
| Duration | Length of the bar | Drag the right edge of the bar |
| Delay | Gap between t=0 and bar start | Drag the left edge of the bar |
| Negative delay | Bar starts before t=0 (clipped) | Visible as truncated left edge |
| Iteration count | Multiple consecutive repetitions in bar | Read from tooltip; `Infinity` shows as repeating fill |

---

## Animation Controls

### Pause / Play all

Clicking the pause/play button in the controls bar pauses or resumes **all animations on the page simultaneously** at their current playback position. This is the fastest way to freeze a mid-state you want to inspect in the Elements panel.

### Replay

The replay button (`<<`) resets the selected animation group to `t=0` and plays it again from the beginning. Chrome re-triggers the animations by internally resetting their start times. This is non-destructive — the actual page state is rewound only visually.

### Speed controls

| Speed | Use case |
|---|---|
| 100 % | Normal playback — verify the final feel |
| 25 % | Slow motion — spot timing mismatches between elements |
| 10 % | Very slow — frame-by-frame inspection of easing curves, jank, or overlap |

Speed reduction is applied globally via the Chrome DevTools protocol's animation playback rate API. All animations on the page run at the chosen rate while the panel is open and speed is reduced.

---

## Editing Animations

All edits are live, in-memory, and do not modify source files. They are applied immediately and you can replay to compare.

### Drag animation bars — change delay and duration

```
Before drag:
  [---delay---|=====duration=====]

Drag left edge right — increase delay:
  [--------delay--------|===dur===]

Drag right edge right — increase duration:
  [---delay---|=========duration=========]

Drag body of bar — shift start time (changes delay only):
  [           |=====duration=====]   (moved right = more delay)
```

- **Drag the body** of a bar (not an edge) to reposition when the animation starts relative to the group. This changes the `animation-delay` or `delay` option.
- **Drag the right edge** to lengthen or shorten the `animation-duration`.
- **Drag the left edge** to change the delay without affecting duration.

As you drag, the numeric value updates in real time and Chrome applies the change instantly on the page.

### Drag keyframe diamonds — change timing

Inside a bar you will see one or more **diamond `◆` handles**, one per `@keyframes` percentage stop (or per `offset` in WAAPI). Dragging a diamond horizontally repositions that keyframe's time offset within the total duration.

```
0%         33%         66%         100%
|-----------|-----------|-----------|
      ◆           ◆           ◆
   (drag me)              (drag me)

After dragging first diamond to 50%:
|----------------------|------------|
               ◆              ◆
```

This allows you to quickly experiment with timing without editing CSS source — for example, making the first half of an animation faster and the second half slower.

### Editing easing curves — the cubic-bezier editor

Click the **easing icon** (a small curve symbol) that appears next to an animation bar's row label, or click the curve icon shown in the detail row at the bottom. This opens the **cubic-bezier editor popup**.

---

## Cubic-Bezier Editor — Deep Dive

The cubic-bezier editor is a graphical tool for designing `cubic-bezier(x1, y1, x2, y2)` easing functions.

### What a cubic-bezier is

A CSS timing function maps animation progress (input: 0 to 1) to output progress (0 to 1). A cubic Bezier uses two **control points** — P1 at `(x1, y1)` and P2 at `(x2, y2)` — to define the shape of that mapping curve.

```
Output
  1 |                              *  <- P2 = (x2, y2)
    |                        .....
    |                   .....
    |              .....
    |        .....
    | .....
    |*  <- P1 = (x1, y1)
  0 +--------------------------------> Input
    0                                1
```

- A curve that rises steeply early then flattens = **ease-out** (fast start, slow finish).
- A curve that is shallow early then rises steeply = **ease-in** (slow start, fast finish).
- A curve close to the diagonal = near-**linear**.

### The editor UI

```
+------------------------------------------+
|  cubic-bezier editor                     |
|                                          |
|    Output                                |
|  1 |              * P2 (draggable)       |
|    |          ...'                       |
|    |       ..'                           |
|    |     .'                              |
|    |   .'                                |
|    | .'                                  |
|    |* P1 (draggable)                     |
|  0 +-------------------------> Input     |
|    0                          1          |
|                                          |
|  cubic-bezier(0.25, 0.1, 0.25, 1.0)     |  <- live value
|                                          |
|  [ Preview animation ]                   |  <- animated swatch
|                                          |
|  Presets: ease | ease-in | ease-out |    |
|           ease-in-out | linear           |
+------------------------------------------+
```

### Control points

| Point | Coordinates | Controls |
|---|---|---|
| P1 | `(x1, y1)` | Shape of the curve near the **start** of the animation |
| P2 | `(x2, y2)` | Shape of the curve near the **end** of the animation |

`x` values must be in `[0, 1]`. `y` values can exceed `[0, 1]` to create **overshoot/spring** effects.

### Preset easings in the editor

Clicking a preset name snaps the control points to the canonical positions:

| Preset name | cubic-bezier values | Character |
|---|---|---|
| `linear` | `cubic-bezier(0, 0, 1, 1)` | Constant speed — diagonal line |
| `ease` | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | Starts fast, ends slow — default |
| `ease-in` | `cubic-bezier(0.42, 0, 1.0, 1.0)` | Starts slow, ends fast |
| `ease-out` | `cubic-bezier(0, 0, 0.58, 1.0)` | Starts fast, ends slow |
| `ease-in-out` | `cubic-bezier(0.42, 0, 0.58, 1.0)` | Slow start and end, fast middle |

### Creating a custom curve

1. Drag P1 and P2 to shape the curve visually.
2. The `cubic-bezier(x1, y1, x2, y2)` value updates live in the text field.
3. The preview swatch (a small moving ball or bar) shows your curve applied to a real animation.
4. To create an **overshoot/bounce** effect, drag P2's `y` coordinate above 1.0 — the bar in the preview will fly past the end position then snap back.
5. When satisfied, copy the `cubic-bezier(...)` value from the text field and paste it into your CSS.

### Spring-like overshoot example

```css
/* Overshoot that settles — like a spring */
animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```

In the editor this looks like P2's y-coordinate is 1.56 — above the grid — giving the property value a temporary overshoot before returning to 100%.

---

## Easing Functions Explained

### Visual map of all standard easings

```
Output 1 |         _____    <- ease-out (fast then slow)
         |      __/
         |    _/
         |  _/
         |_/
         0 +-----------> t
         0              1

Output 1 |              /|  <- ease-in (slow then fast)
         |           __/
         |         _/
         |       _/
         |______/
         0 +-----------> t
         0              1

Output 1 |           __/|  <- ease-in-out (slow, fast, slow)
         |         _/
         |        |
         |       /
         |______/
         0 +-----------> t
         0              1

Output 1 |      /        |  <- linear (constant)
         |    /
         |  /
         | /
         |/
         0 +-----------> t
         0              1
```

### Full easing function reference

| Function | CSS syntax | Feel | Best for |
|---|---|---|---|
| `linear` | `animation-timing-function: linear` | Constant velocity — mechanical | Looping spinners, progress bars |
| `ease` | `animation-timing-function: ease` | Quick start, gentle landing | Default for most UI transitions |
| `ease-in` | `animation-timing-function: ease-in` | Slow start, fast end — like falling | Elements leaving the screen |
| `ease-out` | `animation-timing-function: ease-out` | Fast start, slow end — deceleration | Elements entering the screen |
| `ease-in-out` | `animation-timing-function: ease-in-out` | Slow at both ends, fast in middle | Modal open/close, page transitions |
| `cubic-bezier(x1,y1,x2,y2)` | `animation-timing-function: cubic-bezier(0.34,1.56,0.64,1)` | Fully custom | Spring, bounce, overshoot |
| `steps(n, start)` | `animation-timing-function: steps(4, start)` | Discrete jumps — no interpolation | Sprite sheet animation, typewriter |
| `steps(n, end)` | `animation-timing-function: steps(4, end)` | Discrete jumps at end of each step | Tick-by-tick counters |

### `steps()` in depth

`steps(n, direction)` divides the animation into `n` equal discrete steps with no interpolation between them.

```
steps(4, end):

Output
1 |            ____
  |       ____
  |  ____
  |____
0 +---+---+---+---> t
  0  25% 50% 75% 100%

Each "step" snaps instantly at the END of the step interval.
```

Use cases: sprite sheet animations (background-position), typewriter effects (width), digital counters.

---

## Types of Animations Captured

The Animations panel captures all three major animation mechanisms.

### Comparison table

| Animation type | CSS syntax | JS API | Panel behaviour |
|---|---|---|---|
| CSS transition | `transition: property duration easing delay` | `element.style.property = value` triggers it | Appears when the property actually changes |
| CSS `@keyframes` | `animation: name duration easing ...` | — | Captured when the animation starts |
| Web Animations API (WAAPI) | — | `element.animate(keyframes, options)` | Captured identically to `@keyframes` |

### CSS Transitions

A transition animates a property between its current value and a new value, triggered by any state change (class toggle, pseudo-class, JS style write).

```css
/* CSS */
.button {
  background-color: #3b82f6;
  transform: scale(1);
  transition:
    background-color 200ms ease,
    transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.button:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}
```

In the Animations panel you will see two bars under `.button` — one for `background-color` (200 ms) and one for `transform` (150 ms) — grouped together because they fired simultaneously on hover.

### CSS `@keyframes` Animations

Keyframe animations run on their own schedule, independent of state changes. They can repeat, alternate, and hold their final state.

```css
/* CSS */
@keyframes slide-in {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translateY(0);
  }
}

.hero-title {
  animation: slide-in 600ms ease-out 100ms both;
  /*         name     dur    easing  delay fill */
}
```

Panel will show:
- A bar for `.hero-title` / `opacity` — starts at 100 ms (delay), diamond at 60 % of 600 ms.
- A bar for `.hero-title` / `transform` — same delay, no intermediate diamond (only 0% and 100%).

### Web Animations API (WAAPI)

WAAPI animations are authored in JavaScript and are first-class citizens in the panel.

```js
// Basic WAAPI animation
const el = document.querySelector('.card');

const animation = el.animate(
  [
    { opacity: 0, transform: 'translateY(16px)' },   // keyframe at offset 0
    { opacity: 1, transform: 'translateY(0)' }        // keyframe at offset 1
  ],
  {
    duration: 400,          // ms
    delay: 200,             // ms
    easing: 'ease-out',
    fill: 'both',
    iterations: 1
  }
);

// The returned Animation object can be paused/played/cancelled
animation.pause();
animation.play();
animation.cancel();
```

```js
// WAAPI GroupEffect — run animations in parallel
const group = new GroupEffect([
  new KeyframeEffect(title, [{ opacity: 0 }, { opacity: 1 }], 500),
  new KeyframeEffect(subtitle, [{ transform: 'translateY(20px)' }, { transform: 'translateY(0)' }], 500)
]);
document.timeline.play(group);
```

```js
// WAAPI SequenceEffect — run animations one after another
const sequence = new SequenceEffect([
  new KeyframeEffect(el1, [{ opacity: 0 }, { opacity: 1 }], 300),
  new KeyframeEffect(el2, [{ opacity: 0 }, { opacity: 1 }], 300)
]);
document.timeline.play(sequence);
```

:::note
`GroupEffect` and `SequenceEffect` are part of the Web Animations Level 2 spec. Chrome supports them experimentally. The Animations panel will show both as normal animation groups — SequenceEffect animations appear offset in time because el2 starts after el1 ends.
:::

---

## Inspecting Individual Animation Properties

Hovering any animation bar in the timeline shows a tooltip with:

```
Element:    .hero-title
Property:   transform
Duration:   600ms
Delay:      100ms
Iterations: 1
Direction:  normal
Fill:       both
Easing:     ease-out
```

Clicking on the element name label (left side of the bar row) jumps to that element in the **Elements panel** and highlights it in the DOM tree.

Clicking the **easing curve icon** (shown inline in the detail row) opens the cubic-bezier editor for that specific property's timing function.

---

## Integration with the Elements Panel

### Jumping to the element

Clicking the element label on any animation row in the timeline will:
1. Switch focus to the Elements panel.
2. Expand the DOM tree and highlight the exact node.
3. Show the node's computed styles in the Styles pane.

This is useful when you see an unexpected animation on an element you cannot identify by selector alone — click through and inspect its CSS directly.

### Inspecting computed animation properties in Elements

With an element selected in Elements, the **Computed** tab shows the resolved animation and transition values. The **Styles** tab shows the cascade — which rule applied `animation-name`, `animation-duration`, and so on.

### Forcing animation states

In the Elements panel, click the `:hov` button (Force element state) to lock an element in `:hover`, `:focus`, `:active`, or `:visited`. This holds the state that triggers the transition, letting you inspect the intermediate computed style while the animation is frozen.

---

## Common Animation Performance Issues

### The compositor thread vs. the main thread

The browser can run certain animations entirely on the **compositor thread** — bypassing the main JavaScript thread and layout/paint stages — resulting in smooth 60 fps even when the main thread is busy.

Only two properties are compositor-safe:

| Property | Compositor-safe | Notes |
|---|---|---|
| `transform` | Yes | Translate, rotate, scale, skew — all free |
| `opacity` | Yes | Pure alpha change — no repaint |
| `filter` | Partial | Some filters (blur) are GPU-accelerated in recent Chrome |
| `width` | No | Triggers layout (reflow) on every frame |
| `height` | No | Triggers layout on every frame |
| `top` / `left` | No | Triggers layout unless `position: fixed` with containment |
| `margin` | No | Triggers layout |
| `background-color` | No | Triggers repaint |
| `box-shadow` | No | Triggers repaint |

### Spotting layout-triggering animations

In the Animations panel, slow down to 10 % and watch the **Performance panel** simultaneously (record a trace). Layout (purple) and paint (green) blocks appearing on every frame confirm a non-compositor animation.

To fix: replace layout-triggering properties with `transform` equivalents.

```css
/* Bad — triggers layout every frame */
.box {
  animation: move-bad 500ms ease-out;
}
@keyframes move-bad {
  from { left: 0; }
  to   { left: 200px; }
}

/* Good — compositor only */
.box {
  animation: move-good 500ms ease-out;
}
@keyframes move-good {
  from { transform: translateX(0); }
  to   { transform: translateX(200px); }
}
```

### `will-change` and layer promotion

```css
.animated-card {
  will-change: transform, opacity;
  /* Tells Chrome to promote this element to its own compositor layer
     before the animation starts — eliminates the promotion cost mid-animation */
}
```

Overusing `will-change` creates memory pressure (each layer costs GPU memory). Add it only to elements you know will animate imminently, and remove it after the animation completes with JavaScript:

```js
el.addEventListener('animationend', () => {
  el.style.willChange = 'auto';
});
```

### Animation jank identification

**Jank** = frames that take longer than ~16.7 ms to render, causing visible stuttering.

Signs in the Animations panel:
- Scrubbing the timeline manually feels unresponsive.
- Setting speed to 10 % and watching the page — if the animation stutters even at 10 % speed, the issue is on the compositor thread (rare but indicates a GPU issue).
- Smooth at 10 % but janky at 100 % = main-thread congestion.

Workflow to identify jank:
1. Open the Animations panel and slow to 10 %.
2. Open **Performance** panel, click **Record**.
3. Trigger and replay the animation.
4. Stop recording.
5. Look for long tasks (red corners on main thread blocks) coinciding with animation frames.
6. Look for repeated **Layout** (purple) blocks — each one is a forced reflow.

### Long / blocking animations

A CSS animation does not block JS execution — but if the animation triggers layout on every frame, JS that also reads layout (e.g., `getBoundingClientRect()`, `offsetWidth`) causes **layout thrashing**:

```js
// Layout thrashing — forces layout every iteration
elements.forEach(el => {
  const width = el.offsetWidth;      // Read: forces layout
  el.style.width = (width + 1) + 'px'; // Write: invalidates layout
});
```

Fix: batch all reads before all writes (or use `requestAnimationFrame`).

---

## Advanced: Complex Scenarios

### Debugging complex animation sequences

When a page has dozens of staggered animations (e.g., a list where each item slides in 50 ms after the previous one), the Groups pane may show many small groups or one large group depending on how close together the starts are.

Strategy:
1. Set speed to 10 %.
2. Pause immediately after triggering.
3. Use the scrubber to move forward frame by frame.
4. Watch which elements animate at which times — identify out-of-order or missing items.
5. Click through to each element in the Elements panel to check their `animation-delay` values.

Stagger pattern to watch for:

```css
/* Stagger using CSS custom properties */
.list-item:nth-child(1) { --stagger: 0; }
.list-item:nth-child(2) { --stagger: 1; }
.list-item:nth-child(3) { --stagger: 2; }

.list-item {
  animation: fade-up 400ms ease-out calc(var(--stagger) * 60ms) both;
}
```

In the panel, all `fade-up` animations will be grouped together (they all start within the same rendering cycle) with staggered delay bars visible in the timeline.

### Debugging animations in React with transitions

React's `<Transition>` / `<CSSTransition>` (from `react-transition-group`) and `<AnimatePresence>` (from `framer-motion`) apply CSS classes at mount/unmount time. The Animations panel sees the resulting CSS transitions and animations normally.

Debugging tip: the element label in the panel will show the actual DOM node (e.g., `<div class="modal-overlay">`) not the React component name. Use the Elements panel jump to find the component boundary and check which React state toggle is causing the class change.

```jsx
// react-transition-group CSSTransition
<CSSTransition in={isVisible} timeout={300} classNames="fade" unmountOnExit>
  <Modal />
</CSSTransition>
```

```css
/* These transitions will appear in the Animations panel */
.fade-enter        { opacity: 0; }
.fade-enter-active { opacity: 1; transition: opacity 300ms ease; }
.fade-exit         { opacity: 1; }
.fade-exit-active  { opacity: 0; transition: opacity 300ms ease; }
```

### Debugging Framer Motion animations

Framer Motion uses WAAPI internally for most animations in recent versions (v10+). These surface as WAAPI animations in the panel. For spring animations, Framer generates a synthetic cubic-bezier approximation or uses a JS-driven `requestAnimationFrame` loop — JS-driven animations do NOT appear in the Animations panel because they are not CSS or WAAPI.

To inspect Framer Motion spring animations:

1. Open the **Performance** panel.
2. Record and trigger the animation.
3. Look for `requestAnimationFrame` callbacks on the main thread — each one is a spring physics update.
4. The absence of entries in the Animations panel confirms it is JS-driven.

### Debugging GSAP animations

GSAP (GreenSock) animates via `requestAnimationFrame` and direct style manipulation — it does **not** use CSS animations or WAAPI by default. Therefore GSAP animations do **not** appear in the Animations panel.

To debug GSAP:

1. Use the **Performance** panel to record the animation.
2. GSAP's ticker fires on every `rAF` — visible as repeated JS callbacks.
3. Use `gsap.globalTimeline.pause()` in the Console to freeze all GSAP animations mid-state.
4. Use the GSAP DevTools plugin (`GSDevTools`) for a dedicated GUI within your page.

```js
// Temporarily pause GSAP for inspection
gsap.globalTimeline.pause();

// Step forward by 0.1 seconds
gsap.globalTimeline.time(gsap.globalTimeline.time() + 0.1);
```

### Spring physics animations (CSS + WAAPI)

True CSS spring physics require `linear()` easing (CSS Animations Level 5 — available in Chrome 113+), which approximates a spring by sampling the physics equation at many points:

```css
/* Spring easing via linear() — many sample points */
.spring {
  animation: bounce 800ms linear(
    0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%,
    0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121,
    1.149 24.3%, 1.159, 1.163, 1.154, 1.129 32.8%,
    1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%,
    0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1
  ) both;
}
```

In the Animations panel, `linear()` easing is shown as a dotted polyline in the cubic-bezier editor popup (since it cannot be expressed as a single smooth curve). The editor is read-only for `linear()` easings.

### Debugging animations across route transitions (SPAs)

In single-page apps, route changes may trigger entrance/exit animations. The Animations panel captures these, but route navigation can cause many animations to fire simultaneously, filling the Groups pane quickly.

Best approach:
1. Clear the panel (clear icon) before navigating.
2. Perform one navigation.
3. Inspect the single resulting group immediately.

### Using the Console with the Animations panel

The `document.getAnimations()` API returns all currently running Animation objects:

```js
// In the Console
document.getAnimations()
// => [CSSAnimation, CSSTransition, Animation, ...]

// Pause a specific animation by name
document.getAnimations()
  .filter(a => a.animationName === 'slide-in')
  .forEach(a => a.pause());

// Jump all animations to 50% of their duration
document.getAnimations().forEach(a => {
  a.currentTime = a.effect.getTiming().duration * 0.5;
});

// Inspect timing of all animations
document.getAnimations().forEach(a => {
  const t = a.effect.getTiming();
  console.log(a.animationName || 'transition', {
    duration: t.duration,
    delay: t.delay,
    easing: t.easing,
    iterations: t.iterations
  });
});
```

Pausing animations in the Console and then scrubbing the Animations panel timeline simultaneously gives you precise frame-level control not possible with panel controls alone.

---

## Quick Reference — Keyboard Shortcuts in Animations Panel

| Action | Method |
|---|---|
| Open Animations panel | `Ctrl+Shift+P` → type `animations` |
| Pause / resume all | Click `||` / `|>` button |
| Replay selected group | Click `<<` button |
| Slow to 25 % | Speed dropdown → 25 % |
| Slow to 10 % | Speed dropdown → 10 % |
| Seek to time | Drag the vertical scrubber line |
| Jump to element in DOM | Click element label on a bar row |
| Open cubic-bezier editor | Click easing curve icon on a bar row |
| Clear all captured groups | Click clear icon (circle with line) |

---

## Summary

The Animations panel is one of the most focused debugging tools in Chrome DevTools. Its value compounds with complexity — a simple fade transition needs only the timeline for confirmation, but a multi-step entrance sequence with staggered delays and spring physics demands the full workflow: slow-motion playback, bar dragging, keyframe repositioning, and the cubic-bezier editor.

The single most impactful habit is to use it alongside the **Performance panel**: the Animations panel tells you *what* is animating and *how*, while Performance tells you the frame-by-frame cost. Together they give a complete picture of both correctness and performance.

---

[← Web Devtools](/coding/web-devtools/)
