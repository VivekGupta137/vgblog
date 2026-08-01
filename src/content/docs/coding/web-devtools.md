---
title: Web Devtools
---
# Chrome DevTools — Complete Guide (Beginner to Advanced)

A structured, end-to-end reference for Google Chrome DevTools covering every panel and tool available in modern Chrome. Each document in this series is self-contained and can be read independently, though the recommended reading paths below will give you the fastest ramp-up depending on your experience level.

This guide is written for web developers, QA engineers, and performance engineers who want to move beyond basic element inspection and fully exploit what DevTools offers — from live CSS editing and JavaScript debugging all the way to memory profiling, security auditing, and automated user-flow recording.

---

## Table of Contents

| File | Description |
|------|-------------|
| 00-getting-started.md | Opening DevTools, UI layout, keyboard shortcuts, device mode, remote debugging |
| 01-elements-panel.md | DOM inspection, live CSS editing, Box Model, accessibility tree, DOM breakpoints |
| 02-console-panel.md | JS REPL, all console methods, console utilities API, live expressions |
| 03-sources-panel.md | Breakpoints (all types), debugger controls, source maps, snippets, workspaces |
| 04-network-panel.md | Request inspection, waterfall timing, throttling, HAR export, WebSocket |
| 05-performance-panel.md | Flame charts, Core Web Vitals, long tasks, Bottom-Up/Call Tree |
| 06-memory-panel.md | Heap snapshots, allocation timeline, memory leak patterns and fixes |
| 07-application-panel.md | Cookies, localStorage, IndexedDB, service workers, PWA manifest |
| 08-security-panel.md | TLS/certificates, mixed content, CSP, CORS, security headers |
| 09-lighthouse-panel.md | Performance/Accessibility/SEO/PWA audits, scoring, CI integration |
| 10-recorder-panel.md | Record user flows, replay, export to Puppeteer/Playwright |
| 11-coverage-tool.md | Unused CSS/JS detection, tree shaking guidance |
| 12-rendering-panel.md | Paint flashing, GPU layers, FPS meter, CSS media emulation |
| 13-animations-panel.md | Animation inspector, cubic-bezier editor, slow-motion replay |
| 14-css-overview.md | Color/font inventory, contrast ratios, unused declarations |
| 15-sensors-panel.md | Geolocation, device orientation, timezone, idle detection simulation |
| 16-changes-panel.md | Track all CSS/JS edits made in DevTools, copy as diff |
| 17-performance-insights.md | Guided LCP/CLS/INP insights, actionable recommendations |
| 18-advanced-tips-and-tricks.md | Command Menu, power snippets, CDP, framework debugging |

---

## Learning Paths

### Beginner Path

If you are new to DevTools, follow this order to build a solid foundation before moving into advanced tooling.

1. **[00-getting-started.md](./00-getting-started.md)** — Get oriented with the UI and essential shortcuts
2. **[01-elements-panel.md](./01-elements-panel.md)** — Learn to inspect and modify the DOM and CSS live
3. **[02-console-panel.md](./02-console-panel.md)** — Use the console for logging, querying, and quick JS experiments
4. **[04-network-panel.md](./04-network-panel.md)** — Understand how your page loads and diagnose request failures
5. **[03-sources-panel.md](./03-sources-panel.md)** — Set breakpoints and step through JavaScript
6. **[07-application-panel.md](./07-application-panel.md)** — Inspect storage, cookies, and service workers
7. **[09-lighthouse-panel.md](./09-lighthouse-panel.md)** — Run your first performance and accessibility audit

### Advanced Path

Once you are comfortable with the basics, these panels will unlock deeper insight into performance, memory, and automation.

1. **[05-performance-panel.md](./05-performance-panel.md)** — Profile runtime performance with flame charts
2. **[17-performance-insights.md](./17-performance-insights.md)** — Interpret Core Web Vital signals and act on them
3. **[06-memory-panel.md](./06-memory-panel.md)** — Hunt and fix memory leaks with heap snapshots
4. **[11-coverage-tool.md](./11-coverage-tool.md)** — Find and eliminate unused code
5. **[12-rendering-panel.md](./12-rendering-panel.md)** — Diagnose paint and compositing issues
6. **[10-recorder-panel.md](./10-recorder-panel.md)** — Automate and replay user flows
7. **[08-security-panel.md](./08-security-panel.md)** — Audit TLS, CSP, and security headers
8. **[18-advanced-tips-and-tricks.md](./18-advanced-tips-and-tricks.md)** — Master the Command Menu, CDP, and framework-specific debugging

---

## Quick Reference — Top 10 Most-Used Shortcuts

| Action | Mac | Windows / Linux |
|--------|-----|-----------------|
| Open / close DevTools | `Cmd + Option + I` | `F12` or `Ctrl + Shift + I` |
| Open Console drawer | `Cmd + Option + J` | `Ctrl + Shift + J` |
| Inspect element (pick mode) | `Cmd + Shift + C` | `Ctrl + Shift + C` |
| Open Command Menu | `Cmd + Shift + P` | `Ctrl + Shift + P` |
| Search across all files | `Cmd + Option + F` | `Ctrl + Shift + F` |
| Toggle device toolbar | `Cmd + Shift + M` | `Ctrl + Shift + M` |
| Hard reload (bypass cache) | `Cmd + Shift + R` | `Ctrl + Shift + R` |
| Step over (debugger) | `F10` | `F10` |
| Step into (debugger) | `F11` | `F11` |
| Resume script execution | `F8` or `Cmd + \` | `F8` or `Ctrl + \` |

> Full shortcut reference: open DevTools, press `?` or navigate to **Settings > Shortcuts**.

---

## How to Use This Guide

**Stand-alone reading.** Each file is written to be useful on its own. If you need to solve a specific problem — debugging a memory leak, inspecting cookies, or profiling animations — jump directly to that document.

**Sequential reading.** Following the Beginner or Advanced path above gives you a progressive build-up where each new topic assumes familiarity with the prior ones.

**As a cheat sheet.** Most files open with a summary table or key-concepts list so you can scan for the specific feature or shortcut you need without reading the full document.

**Practical exercises.** Where noted, examples use `about:blank` or a minimal HTML snippet you can paste directly into the browser. No local server setup is required for most exercises.

**Version note.** This guide targets Chrome stable as of mid-2025. Most content applies equally to any Chromium-based browser (Edge, Brave, Arc). Firefox and Safari DevTools differ in UI layout but share the majority of concepts covered here.
