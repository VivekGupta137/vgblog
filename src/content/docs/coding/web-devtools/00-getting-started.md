---
title: 00 Getting Started
---

# Getting Started with Chrome DevTools

Chrome DevTools is a set of web developer tools built directly into Google Chrome. This guide covers everything you need to know to get productive with DevTools, from opening it for the first time to advanced workflows like remote debugging and workspaces.

---

## Table of Contents

1. [What is Chrome DevTools](#what-is-chrome-devtools)
2. [How to Open DevTools](#how-to-open-devtools)
3. [DevTools UI Layout](#devtools-ui-layout)
4. [All Panels Overview](#all-panels-overview)
5. [Docking Options](#docking-options)
6. [Keyboard Shortcuts Reference](#keyboard-shortcuts-reference)
7. [Command Menu](#command-menu)
8. [Settings Panel](#settings-panel)
9. [Device Mode / Responsive Design](#device-mode--responsive-design)
10. [Remote Debugging](#remote-debugging)
11. [Workspaces](#workspaces)
12. [Common Beginner Mistakes to Avoid](#common-beginner-mistakes-to-avoid)

---

## What is Chrome DevTools

Chrome DevTools is a suite of debugging and profiling tools built directly into Google Chrome (and all Chromium-based browsers such as Microsoft Edge, Brave, and Opera). It gives you a live view into everything happening on a web page — the DOM structure, CSS styles, JavaScript execution, network requests, performance metrics, memory consumption, and more.

**Key capabilities at a glance:**

- **Inspect and edit** HTML and CSS in real time, with changes reflected instantly in the browser.
- **Debug JavaScript** with breakpoints, step-through execution, call stacks, and scope inspection.
- **Profile performance** to find rendering bottlenecks, long tasks, and layout thrashing.
- **Audit network traffic** — see every request, its headers, payload, timing, and response.
- **Simulate devices** — emulate any screen size, pixel density, touch input, or slow network.
- **Audit page quality** with Lighthouse, which generates actionable scores for performance, accessibility, SEO, and best practices.
- **Inspect storage** — cookies, localStorage, sessionStorage, IndexedDB, Cache Storage, and service workers.

DevTools is the single most important tool in a front-end developer's toolkit. Learning it well reduces debugging time dramatically and gives you direct visibility into what the browser is actually doing with your code.

---

## How to Open DevTools

There are multiple ways to open DevTools depending on context.

### Via Keyboard Shortcut

| Method | Windows / Linux | Mac |
|---|---|---|
| Open / close DevTools | `F12` or `Ctrl+Shift+I` | `Cmd+Option+I` |
| Open focused on Console | `Ctrl+Shift+J` | `Cmd+Option+J` |
| Open focused on Elements | `Ctrl+Shift+C` | `Cmd+Option+C` |

`F12` is the quickest universal shortcut. `Ctrl+Shift+I` / `Cmd+Option+I` is the more intentional form that toggles the full DevTools window.

### Via Right-Click Menu

Right-click anywhere on a page and choose **Inspect** from the context menu. This opens DevTools with the Elements panel active and the clicked element pre-selected in the DOM tree — the fastest way to jump straight to a specific element.

:::tip
Right-clicking on an image opens DevTools with that `<img>` node highlighted. Right-clicking on text highlights the nearest text-containing element.
:::

### Via Chrome's Three-Dot Menu

1. Click the three-dot menu (⋮) in the top-right corner of Chrome.
2. Navigate to **More Tools**.
3. Click **Developer Tools**.

This method is slower than the shortcuts but useful if you forgot the keyboard shortcut.

### Via the Address Bar (Chrome-Internal Pages)

On `chrome://` pages (like `chrome://settings` or `chrome://flags`), right-click is disabled. Use the keyboard shortcut `F12` or `Ctrl+Shift+I` / `Cmd+Option+I` to open DevTools on these pages.

### Opening DevTools on a Specific Element

Right-clicking a specific element on the page and selecting **Inspect** is the recommended workflow when you want to examine or modify a particular piece of the UI. DevTools will open the Elements panel, scroll the DOM tree to that node, and display its computed styles in the Styles pane.

---

## DevTools UI Layout

DevTools has a consistent layout regardless of which panel is active. Understanding the structural regions makes navigating much faster.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PANEL TABS (top)                                                           │
│  [ Elements ][ Console ][ Sources ][ Network ][ Performance ][ >> ] [ ⚙ ][ ✕ ]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         MAIN PANEL AREA                                     │
│                                                                             │
│  Left sub-pane                    │  Right sub-pane                        │
│  (e.g., DOM tree in Elements)     │  (e.g., Styles/Computed in Elements)   │
│                                   │                                         │
│                                   │                                         │
│                                   │                                         │
│                                   │                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  DRAWER (bottom) — toggled with Escape                                      │
│  [ Console ][ What's New ][ Animations ][ Coverage ][ Network conditions ] │
│                                                                             │
│  > _                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Region Breakdown

| Region | Description |
|---|---|
| **Panel Tabs** | The row of named tabs at the top. Click to switch panels. Overflow panels hide behind the `>>` button. |
| **Main Panel Area** | The primary workspace for the active panel. Often split into sub-panes (left/right or top/bottom). |
| **Drawer** | A secondary panel that runs along the bottom. Toggle it with `Escape`. The Console always lives here as a second instance (useful when you want the Console visible alongside another panel). |
| **Settings Icon (⚙)** | Opens the Settings panel. Equivalent to pressing `F1`. |
| **Three-Dot Menu (⋮)** | Controls docking position, opens more DevTools features, and provides access to additional settings. |
| **Close Button (✕)** | Closes DevTools entirely. |

### Resizing Panes

Drag the divider between sub-panes to resize them. In the Elements panel, you can resize the DOM tree vs. the Styles pane. In Sources, you can resize the file navigator, editor, and debugger sidebar independently.

---

## All Panels Overview

### Elements

The Elements panel displays the live DOM tree of the current page. You can:

- Click any node to select it and see its CSS in the **Styles** sub-pane on the right.
- Double-click a node or attribute to edit it inline.
- Drag nodes to reorder them.
- Right-click a node for options: copy, delete, force state (`:hover`, `:focus`, `:active`), add attribute, scroll into view, and more.
- Switch to the **Computed** sub-pane to see the final resolved CSS values (post-cascade).
- Use the **Layout** sub-pane to visualize Flexbox and Grid overlays.
- Use the **Event Listeners** sub-pane to see all JavaScript listeners attached to a node.

### Console

The Console is both a REPL (Read-Eval-Print Loop) and a log viewer. You can:

- Run any JavaScript expression directly against the live page.
- Access the currently selected Elements panel node via `$0` (most recent), `$1`, `$2`, up to `$4`.
- Use `$()` as shorthand for `document.querySelector()` and `$$()` for `document.querySelectorAll()`.
- Filter log output by level: Verbose, Info, Warnings, Errors.
- Group messages with `console.group()` / `console.groupEnd()`.
- Time operations with `console.time('label')` / `console.timeEnd('label')`.

```javascript
// Useful Console tricks
$0                        // currently selected DOM node in Elements panel
$('input[name="email"]')  // querySelector shorthand
$$('a[href]').length      // count all links on page
copy($$('a').map(a => a.href))  // copy all hrefs to clipboard
```

### Sources

The Sources panel is the full JavaScript debugger. Key features:

- Browse all files loaded by the page in the file navigator on the left.
- Set breakpoints by clicking a line number in the editor.
- Set **conditional breakpoints** (right-click a line number) that only pause when an expression is true.
- Set **logpoints** (right-click > Add logpoint) to log a value without pausing execution — like `console.log` without modifying source code.
- Use **XHR/fetch breakpoints** to pause on any network request matching a URL substring.
- Use **Event Listener Breakpoints** to pause when a specific DOM event fires (e.g., `click`, `submit`).
- The **Snippets** sub-panel lets you save and run JavaScript snippets across any page.
- **Overrides** let you permanently replace any file served by the network with a local version.

### Network

The Network panel records every HTTP request made by the page. Key features:

- Each row is one request. Columns include: Name, Status, Type, Initiator, Size, Time, Waterfall.
- Click a request to see its Headers, Preview, Response, Initiator, Timing, and Cookies tabs.
- Filter by type using the toolbar buttons: XHR/Fetch, JS, CSS, Img, Media, Font, Doc, WS, Wasm, Manifest, Other.
- Use the search bar to filter by URL, status code, or MIME type.
- Throttle network speed using the **No throttling** dropdown.
- Enable **Disable cache** to prevent cached responses from masking load-time issues.
- Right-click a request to copy it as a `curl` command — extremely useful for reproducing requests in a terminal.

### Performance

The Performance panel records a trace of CPU activity, rendering, and scripting over time. Use it to:

- Identify long tasks (tasks blocking the main thread for over 50ms).
- Find layout thrashing (forced synchronous layouts).
- Analyze the rendering pipeline: Scripting, Rendering, Painting, System, Idle.
- Examine the flame chart to see the full call stack at any point in time.
- See Core Web Vitals markers (LCP, CLS, FID/INP) on the timeline.

:::tip
Always record Performance traces in an Incognito window with extensions disabled to avoid noise from browser extensions.
:::

### Memory

The Memory panel lets you take heap snapshots and record allocation timelines to find memory leaks. Three profiling modes:

1. **Heap snapshot** — A point-in-time snapshot of all objects in the V8 heap.
2. **Allocation instrumentation on timeline** — Records allocations over time; shows which objects were not garbage collected.
3. **Allocation sampling** — A low-overhead profiler that samples the call stack during allocations.

### Application

The Application panel gives you access to everything stored by the page:

- **Storage**: localStorage, sessionStorage, IndexedDB, Web SQL, cookies.
- **Cache**: Cache Storage (used by service workers), Back/forward cache status.
- **Service Workers**: Register, unregister, update, and simulate push/sync events.
- **Manifest**: Inspect the Web App Manifest for PWA installability.
- **Background Services**: Background Fetch, Background Sync, Notifications, Payment Handler.

### Security

The Security panel shows the TLS/SSL certificate for the page and all origins it loads resources from. It highlights:

- Whether the connection is secure (HTTPS).
- Certificate details: issuer, validity dates, subject alternative names.
- Mixed content warnings (HTTP resources loaded on an HTTPS page).

### Lighthouse

Lighthouse is an automated auditing tool integrated into DevTools. It generates a report with scores (0–100) across five categories:

- **Performance** — Core Web Vitals (LCP, CLS, INP), TTI, TBT, and other speed metrics.
- **Accessibility** — WCAG compliance checks, ARIA roles, color contrast.
- **Best Practices** — HTTPS, deprecated APIs, browser errors, image aspect ratios.
- **SEO** — Meta tags, robots.txt, crawlability.
- **Progressive Web App (PWA)** — Service worker, manifest, installability.

Run Lighthouse from a clean Incognito window for the most accurate results.

### Recorder

The Recorder panel lets you record, replay, and export user flows:

- Click **Start recording**, interact with the page, then stop.
- Replay the recording to reproduce a bug or test a user journey.
- Export flows as Puppeteer scripts, Playwright scripts, or JSON for use in CI.
- Measure performance of a recorded flow over multiple replays.

### Performance Insights

Performance Insights provides an opinionated, guided view of performance data — simpler than the full Performance panel. It highlights the most impactful issues (render-blocking resources, long tasks, layout shifts) and links directly to documentation on how to fix them.

---

## Docking Options

DevTools can be positioned in four ways:

| Dock Position | Description |
|---|---|
| **Dock to bottom** | DevTools appears below the page. Default for many users. |
| **Dock to left** | DevTools appears to the left of the page. Useful for wide monitors. |
| **Dock to right** | DevTools appears to the right of the page. The most common developer preference. |
| **Undock into separate window** | DevTools opens as a standalone window. Ideal for multi-monitor setups. |

### How to Change Docking

**Via the three-dot menu:**

1. Click the three-dot menu (⋮) in the top-right corner of DevTools.
2. Under **Dock side**, click the desired dock position icon.

**Via keyboard shortcut:**

There is no single keyboard shortcut for cycling through dock positions, but you can use the Command Menu:

1. Open the Command Menu with `Ctrl+Shift+P` / `Cmd+Shift+P`.
2. Type `dock` to see all dock-related commands:
   - `Dock to bottom`
   - `Dock to left`
   - `Dock to right`
   - `Undock into separate window`

:::tip
When DevTools is undocked, you can move it to a second monitor while keeping the page on the primary display — great for debugging layout issues without DevTools obscuring the page.
:::

---

## Keyboard Shortcuts Reference

### Opening and Navigating DevTools

| Action | Windows / Linux | Mac |
|---|---|---|
| Open / close DevTools | `F12` or `Ctrl+Shift+I` | `Cmd+Option+I` |
| Open DevTools focused on Console | `Ctrl+Shift+J` | `Cmd+Option+J` |
| Open DevTools in Inspect Element mode | `Ctrl+Shift+C` | `Cmd+Option+C` |
| Toggle Drawer (Console at bottom) | `Escape` | `Escape` |
| Open Command Menu | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Open Settings | `F1` | `F1` |
| Focus URL bar in DevTools file search | `Ctrl+P` | `Cmd+P` |
| Toggle Device Mode | `Ctrl+Shift+M` | `Cmd+Shift+M` |

### Within the Elements Panel

| Action | Windows / Linux | Mac |
|---|---|---|
| Navigate DOM tree nodes | `Arrow keys` | `Arrow keys` |
| Expand / collapse node | `Right / Left Arrow` | `Right / Left Arrow` |
| Edit selected node as HTML | `F2` | `F2` |
| Hide selected node | `H` | `H` |
| Delete selected node | `Delete` | `Delete` |
| Undo last change | `Ctrl+Z` | `Cmd+Z` |
| Scroll to selected node | `Ctrl+Scroll` | `Cmd+Scroll` |

### Within the Console

| Action | Windows / Linux | Mac |
|---|---|---|
| Clear console output | `Ctrl+L` | `Cmd+K` or `Ctrl+L` |
| Navigate command history | `Up / Down Arrow` | `Up / Down Arrow` |
| Multi-line input | `Shift+Enter` | `Shift+Enter` |
| Accept autocomplete suggestion | `Tab` or `Right Arrow` | `Tab` or `Right Arrow` |

### Within the Sources Panel (Debugger)

| Action | Windows / Linux | Mac |
|---|---|---|
| Pause / resume execution | `F8` or `Ctrl+\` | `F8` or `Cmd+\` |
| Step over next function call | `F10` or `Ctrl+'` | `F10` or `Cmd+'` |
| Step into next function call | `F11` or `Ctrl+;` | `F11` or `Cmd+;` |
| Step out of current function | `Shift+F11` or `Ctrl+Shift+;` | `Shift+F11` or `Cmd+Shift+;` |
| Toggle breakpoint at current line | `Ctrl+B` | `Cmd+B` |
| Deactivate all breakpoints | `Ctrl+F8` | `Cmd+F8` |
| Search in file | `Ctrl+F` | `Cmd+F` |
| Search across all files | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Go to line number | `Ctrl+G` | `Cmd+G` |
| Go to file | `Ctrl+P` | `Cmd+P` |

### Within the Network Panel

| Action | Windows / Linux | Mac |
|---|---|---|
| Start / stop recording | `Ctrl+E` | `Cmd+E` |
| Clear network log | `Ctrl+L` | `Cmd+L` |
| Search requests | `Ctrl+F` | `Cmd+F` |

---

## Command Menu

The Command Menu is the fastest way to access any DevTools feature without navigating menus. It works like a fuzzy-search launcher for all DevTools commands.

### Opening the Command Menu

| Windows / Linux | Mac |
|---|---|
| `Ctrl+Shift+P` | `Cmd+Shift+P` |

### Prefix Meanings

The Command Menu uses prefix characters to switch search modes:

| Prefix | Mode | Example |
|---|---|---|
| `>` (default) | Run a DevTools command | `> Disable JavaScript` |
| *(no prefix)* | Open a file loaded by the page | `app.js` |
| `:` | Go to a specific line in the current file | `:142` |
| `@` | Go to a symbol (function/class) in the current file | `@handleClick` |
| `?` | Show help / all prefix options | `?` |

When you open the Command Menu, it starts in command mode (`>` prefix already entered). Delete the `>` to switch to file-search mode.

### Top 20 Most Useful Commands

| Command | What It Does |
|---|---|
| `Disable JavaScript` | Turns off JS on the current page — useful for testing no-JS fallbacks |
| `Enable JavaScript` | Re-enables JavaScript |
| `Disable cache` | Prevents caching for this DevTools session |
| `Enable cache` | Re-enables caching |
| `Capture screenshot` | Takes a full-page screenshot and downloads it |
| `Capture full size screenshot` | Captures the entire scrollable page, not just the viewport |
| `Capture node screenshot` | Screenshots only the currently selected DOM node |
| `Dock to bottom` | Changes docking to bottom |
| `Dock to right` | Changes docking to right |
| `Undock into separate window` | Opens DevTools in a separate window |
| `Show Coverage` | Opens the Coverage drawer to find unused CSS and JS |
| `Show Animations` | Opens the Animations inspector |
| `Show Network conditions` | Opens Network conditions to throttle speed and spoof user-agent |
| `Show Rendering` | Opens Rendering panel (paint flashing, layout shift regions, FPS meter) |
| `Show Changes` | Highlights all CSS/JS changes made during this session |
| `Show Performance monitor` | Shows a live FPS, CPU, and memory gauge |
| `Emulate CSS prefers-color-scheme: dark` | Forces the page into dark mode |
| `Emulate CSS prefers-reduced-motion: reduce` | Simulates reduced-motion preference |
| `Force light color scheme` | Forces light mode even if system is in dark mode |
| `Run Lighthouse audit` | Starts a Lighthouse performance/accessibility audit |

:::tip
You do not need to type the full command name. Type a few characters and use the arrow keys to select. For example, typing `cov` will surface `Show Coverage`.
:::

---

## Settings Panel

### Opening Settings

- Press `F1` while DevTools is focused.
- Click the gear icon (⚙) in the top-right corner of DevTools.
- Use the Command Menu: `> Show Settings`.

### Preferences Tab

The Preferences tab controls appearance and behavior.

| Setting | Location | What It Does |
|---|---|---|
| **Theme** | Appearance > Theme | Switch between Dark, Light, and System preference themes |
| **Panel layout** | Appearance > Panel layout | `auto`, `vertical`, or `horizontal` — controls how sub-panes are split in Elements/Sources |
| **Show rulers** | Elements > Show rulers | Displays pixel rulers at the top and left of the viewport |
| **Word wrap** | Sources > Default indentation | Wrap long lines in the Sources editor |
| **Enable CSS source maps** | Sources > Enable CSS source maps | Maps minified CSS back to source SCSS/Less files |
| **Enable JavaScript source maps** | Sources > Enable JavaScript source maps | Maps minified JS back to original source files |
| **Auto-open DevTools for popups** | Global > Auto-open DevTools for popups | Automatically opens DevTools when a popup window is created |
| **Search as you type** | Global > Search as you type | Live-filters results while you type in the search bar |

### Disabling JavaScript

To disable JavaScript for the current page:

1. Open Settings (`F1`).
2. Go to **Preferences** > **Debugger**.
3. Check **Disable JavaScript**.

Or use the Command Menu: `> Disable JavaScript`.

Disabling JS is useful for testing server-rendered markup, checking no-JS experiences for accessibility, or isolating a bug to client-side logic.

### Emulate Focus

When debugging focus-related CSS (`:focus`, `:focus-visible`), moving the mouse away from an element often removes focus, making the styles disappear before you can inspect them.

To freeze focus:

1. In the Elements panel, select the element.
2. In the **Styles** pane, click the `:hov` button (Force element state).
3. Check `:focus` or `:focus-visible`.

Or use the Command Menu: `> Emulate a focused page` — this keeps the page focused even when DevTools itself is active.

### Experiments Tab

The Experiments tab (under Settings) contains opt-in features that are not yet stable. Useful experiments to consider enabling:

| Experiment | What It Does |
|---|---|
| **CSS Grid Editor** | Adds a visual grid editor in the Styles pane for editing `grid-template` values |
| **Enable new Font Editor tool** | Visual editor for `font-family`, `font-size`, `line-height` in the Styles pane |
| **Enable Autofill view** | Shows autofill events in the Elements panel |
| **Protocol monitor** | Shows the raw Chrome DevTools Protocol (CDP) messages — useful for building DevTools integrations |
| **Recorder: Show extension view** | Allows Recorder extensions to add export formats |
| **CSS layers badge** | Shows cascade layer info on CSS rules in the Styles pane |

:::note
Experiments may change or be removed between Chrome versions. Check the Experiments tab in your current Chrome version for the latest options.
:::

---

## Device Mode / Responsive Design

Device Mode simulates different screen sizes, pixel densities, touch input, and network conditions without needing a physical device.

### Enabling the Device Toolbar

| Windows / Linux | Mac |
|---|---|
| `Ctrl+Shift+M` | `Cmd+Shift+M` |

Or click the **Toggle device toolbar** icon (a phone/tablet icon) in the top-left corner of DevTools.

When Device Mode is active, the browser viewport shows a frame with controls at the top.

### Preset Devices

Click the **Dimensions** dropdown at the top of the device toolbar to select a preset device. Common presets include:

| Device | Width | Height | DPR |
|---|---|---|---|
| iPhone SE | 375px | 667px | 2 |
| iPhone 14 Pro Max | 430px | 932px | 3 |
| Pixel 7 | 412px | 915px | 2.625 |
| iPad Mini | 768px | 1024px | 2 |
| iPad Air | 820px | 1180px | 2 |
| Surface Pro 7 | 912px | 1368px | 2 |
| Galaxy Fold | 280px (closed) | 653px | 3 |
| Nest Hub | 1024px | 600px | 1 |

### Custom Dimensions

Select **Responsive** from the dimensions dropdown to enter custom width and height values. You can:

- Type exact pixel values in the width/height boxes.
- Drag the blue handles at the edge of the viewport to resize it.
- Click the **rotate** icon to swap width and height (simulate landscape orientation).

### Adding Custom Devices

1. In Device Mode, click the dimensions dropdown.
2. Scroll down and click **Edit...** (or go to Settings > Devices).
3. Click **Add custom device**.
4. Fill in the device name, width, height, device pixel ratio, and user agent string.

### Network Throttling

Use the **Network** dropdown in the device toolbar to simulate slow connections:

| Preset | Download | Upload | Latency |
|---|---|---|---|
| No throttling | Full speed | Full speed | 0ms |
| Fast 3G | 1.5 Mbps | 750 Kbps | 562.5ms |
| Slow 3G | 500 Kbps | 500 Kbps | 2000ms |
| Offline | 0 | 0 | — |

To create a **custom throttle profile**:

1. Click the Network dropdown > **Add...**.
2. Enter a name, download speed (Kbps), upload speed (Kbps), and latency (ms).

:::tip
Use "Slow 3G" when testing pages that will be accessed by users on mobile networks in developing regions. This quickly surfaces unacceptably large assets.
:::

### CPU Throttling

Click the **CPU** dropdown (only visible in the Performance panel or via Network conditions drawer) to simulate slower devices:

| Setting | Slowdown Factor |
|---|---|
| No throttling | 1x |
| 4x slowdown | 4x |
| 6x slowdown | 6x |

CPU throttling does not change the hardware; it slows the JavaScript execution thread by a factor, simulating a budget Android device on your desktop CPU.

### Show Device Frame

For presentations or screenshots, you can display a realistic phone frame around the viewport:

1. In Device Mode, click the three-dot menu (⋮) in the device toolbar.
2. Check **Show device frame**.

The frame only appears for devices that have matching frame artwork (iPhones, Pixels, etc.).

### Media Queries Bar

Click the **Media queries** button (three horizontal lines icon) in the device toolbar to show a visual ruler of all `@media` breakpoints defined in the page's CSS. Clicking a breakpoint region snaps the viewport to that width.

---

## Remote Debugging

Remote debugging lets you use Chrome DevTools on your desktop to debug a browser or Node.js process running elsewhere — on a physical Android device, an emulator, or a server.

### Debugging Android Chrome via USB

**Requirements:** Android device with USB debugging enabled, Chrome on the device, Chrome on your desktop.

**Step 1: Enable USB Debugging on Android**

1. On your Android device, go to **Settings** > **About phone**.
2. Tap **Build number** seven times to enable Developer Options.
3. Go to **Settings** > **Developer Options**.
4. Enable **USB debugging**.

**Step 2: Connect the Device**

1. Connect your Android device to your computer via USB.
2. On the Android device, accept the RSA fingerprint prompt ("Allow USB debugging?").

**Step 3: Open chrome://inspect on Desktop**

1. Open a new tab in desktop Chrome.
2. Navigate to `chrome://inspect#devices`.
3. Check **Discover USB devices**.
4. Your device and any open Chrome tabs will appear in the list.
5. Click **inspect** under the tab you want to debug.

A DevTools window opens on your desktop, but it controls the Chrome instance on your Android device. You can inspect elements, debug JavaScript, and view network traffic exactly as you would locally.

**Port Forwarding for localhost**

If your page is served from `localhost` on your desktop (e.g., `http://localhost:3000`), the Android device cannot reach it by default. Enable port forwarding:

1. On `chrome://inspect#devices`, click **Port forwarding**.
2. Add a rule: Device port `3000`, Desktop address `localhost:3000`.
3. Click **Enable port forwarding** and then **Done**.

Now `http://localhost:3000` on the Android device resolves to your desktop's dev server.

### Debugging Node.js with Chrome DevTools

Node.js (v6.3+) has a built-in inspector that speaks the Chrome DevTools Protocol.

**Step 1: Start Node with the Inspector Flag**

```bash
# Pause on the first line of code (useful for debugging startup issues)
node --inspect-brk server.js

# Start normally, inspector available when a client connects
node --inspect server.js
```

By default, Node listens on `127.0.0.1:9229`.

**Step 2: Connect DevTools**

1. Open `chrome://inspect` in Chrome.
2. Under **Remote Target**, your Node process will appear.
3. Click **inspect**.

A DevTools window opens with a Node-specific layout (no Elements or Application panels, but Console, Sources, Performance, and Memory are available).

**Step 3: Debugging a Running Process (no restart)**

Send `SIGUSR1` to an already-running Node process to activate the inspector:

```bash
kill -USR1 <pid>
```

Then open `chrome://inspect` to connect.

### Debugging with `--inspect-brk` vs `--inspect`

| Flag | Behavior |
|---|---|
| `--inspect` | Starts the inspector; execution proceeds normally until a client connects and sets a breakpoint |
| `--inspect-brk` | Starts the inspector AND pauses execution on the first line, waiting for a debugger to connect |

Use `--inspect-brk` when debugging startup code or import-time side effects.

---

## Workspaces

Workspaces (also called **Filesystem**) let you map a local folder on your computer to the files DevTools serves from the network. When mapped, any CSS or JS change you make in DevTools is automatically saved back to the file on disk — no copy-pasting required.

### When to Use Workspaces

Workspaces are valuable when:

- You want to tweak CSS values in DevTools and have those changes survive a page refresh.
- You are doing iterative UI work and want DevTools to act as a lightweight editor.
- Your build tool outputs source maps — Workspaces can write back to the original `.scss` or `.ts` source files.

### Setting Up a Workspace

**Step 1: Serve your project locally**

Ensure your project is running on a local dev server (e.g., `localhost:3000`).

**Step 2: Add the folder to DevTools**

1. Open DevTools and go to the **Sources** panel.
2. Click the **Filesystem** tab in the left pane.
3. Click **+ Add folder to workspace**.
4. Select the root folder of your project on disk.
5. Chrome will ask for permission to read and write files in that folder — click **Allow**.

**Step 3: Map the network resource to the local file**

If Chrome cannot automatically match network files to local files, you may need to map them manually:

1. In the **Network** or **Sources** panel, right-click on a file.
2. Choose **Map to file system resource...**.
3. Select the corresponding file on disk.

Once mapped, a green dot appears on the file icon in the Sources panel, confirming the mapping is active.

### Verifying the Setup

Make a change to a CSS property in the Elements panel **Styles** pane. If the Workspace is properly configured:

- The change appears immediately in the browser (as always).
- The source `.css` file on disk is updated automatically.
- The change persists after a page refresh.

### Limitations

- Workspaces work best with **static files** (HTML, CSS, vanilla JS). Compiled/bundled output (e.g., webpack bundles) needs source maps to write back to original sources.
- Source maps must correctly point to your local files for the write-back to work.
- Workspaces do not trigger your build tool's hot reload — they write directly to disk, so your file watcher will pick up the change and recompile if configured.

---

## Common Beginner Mistakes to Avoid

### 1. Forgetting to Disable Cache During Development

DevTools does not disable the browser cache by default. If you are testing changes to CSS or JS files, the browser may serve a cached version and your changes will appear to have no effect.

**Fix:** In the Network panel, check **Disable cache**. This only applies while DevTools is open.

### 2. Editing Styles in the Computed Tab

The **Computed** sub-pane (next to Styles in the Elements panel) shows resolved, final values — it does not accept edits. Many beginners click on a value in Computed and wonder why nothing changes.

**Fix:** Make CSS edits in the **Styles** sub-pane, not Computed. Use Computed only for reading final values.

### 3. Not Using Source Maps

Debugging minified production code is nearly impossible. When source maps are missing, the Sources panel shows one-liner bundles with unreadable variable names.

**Fix:** Enable source maps in your build tool (`devtool: 'source-map'` in webpack, `sourceMap: true` in TypeScript). Ensure DevTools has **Enable JavaScript source maps** and **Enable CSS source maps** checked in Settings.

### 4. Losing DevTools Changes on Refresh

By default, all DOM and CSS edits in DevTools are ephemeral — a page refresh resets them.

**Fix:** Use the **Changes** drawer (`Show Changes` from Command Menu) to review what you changed and manually copy changes to your source files. Or set up a **Workspace** to persist changes automatically.

### 5. Using console.log Everywhere Instead of Breakpoints

Sprinkling `console.log` statements across a codebase is slow, requires code changes, and often misses the exact state you need.

**Fix:** Use breakpoints in the Sources panel. Set a breakpoint on the relevant line, reproduce the issue, and inspect all variables in the **Scope** pane on the right — no code changes needed.

### 6. Running Lighthouse Against localhost With Extensions Enabled

Browser extensions inject code, modify network requests, and consume CPU — all of which pollute Lighthouse scores and make results non-reproducible.

**Fix:** Always run Lighthouse audits in an **Incognito window** with extensions disabled (Incognito disables most extensions by default).

### 7. Throttling CPU in the Wrong Place

Some developers look for CPU throttling in Device Mode but cannot find it there. CPU throttling in Device Mode affects simulated device behavior but the main CPU throttling for performance profiling is in the **Performance** panel.

**Fix:** For performance profiling, open the **Performance** panel and click the gear icon (⚙) in the panel toolbar to access CPU throttling. For Device Mode testing, use the **Network conditions** drawer.

### 8. Ignoring the Initiator Column in Network Panel

When debugging unexpected network requests, many developers search through code manually without knowing which file triggered the request.

**Fix:** Click the **Initiator** column value for a request. It shows either the file and line number that made the request (for fetch/XHR) or the call stack. Hover over it for a full stack trace.

### 9. Not Preserving the Network Log Across Navigations

By default, the Network panel clears when you navigate to a new page. This makes it impossible to inspect requests from a form submission that redirects to a new page.

**Fix:** Check **Preserve log** in the Network panel toolbar. The log will accumulate across navigations until you manually clear it or uncheck the option.

### 10. Forgetting the `$0` Shortcut in the Console

Developers often write long `document.querySelector` calls in the Console to target an element they just inspected in the Elements panel.

**Fix:** `$0` in the Console always refers to the most recently selected element in the Elements panel. Use it directly:

```javascript
$0.textContent          // read the text content
$0.style.border = '2px solid red'  // apply a style
$0.getBoundingClientRect()         // get dimensions and position
getComputedStyle($0).fontSize      // read a computed style
```

`$1` through `$4` refer to the four previously selected elements, in reverse order.

---

*This guide covers Chrome DevTools as of Chrome 127+. Some features, panel names, and keyboard shortcuts may vary slightly across Chromium-based browsers (Edge, Brave, Opera) or older Chrome versions.*

---

[← Web Devtools](/coding/web-devtools/)
