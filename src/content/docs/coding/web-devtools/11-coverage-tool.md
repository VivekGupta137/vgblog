---
title: 11 Coverage Tool
---

# Chrome DevTools: Coverage Tool

## What the Coverage Tool Is

The Coverage tool measures which bytes of your CSS and JavaScript files are actually **used** versus **unused** during a page session. It gives you a byte-level breakdown across every loaded resource, letting you see exactly how much dead code you are shipping to your users.

Key insight: unused code still has a real cost. The browser must download it, parse it, and (for JS) compile it — even if it never runs. A large unused JS bundle delays Time to Interactive (TTI). Unused CSS blocks rendering. The Coverage tool tells you where to look first.

What it measures:
- **CSS**: rules that matched at least one element during the session
- **JS**: functions and statements that were executed at least once during the session
- Coverage is **per-session** — a byte is only "used" if it was touched while you were recording

---

## How to Open It

Three ways to reach the Coverage panel:

**Option 1 — More Tools menu**
```
DevTools (F12 or Cmd+Option+I) → ⋮ (three-dot menu, top-right)
  → More tools → Coverage
```

**Option 2 — Command Menu (fastest)**
```
Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows/Linux)
Type: Show Coverage
Press Enter
```

**Option 3 — Drawer shortcut**
```
Press Escape to open the Drawer at the bottom of DevTools
Click the + icon in the Drawer tab bar → Coverage
```

The Coverage panel opens as a tab in the DevTools Drawer by default.

---

## UI Layout (ASCII Diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COVERAGE                                                    [ ✕ close ] │
├──────┬──────────┬──────────────────────────────────────────────────────┤
│  ●   │  ↺       │  Filter by URL...                                     │
│ record reload   │                                                        │
├──────┴──────────┴──────────────────────────────────────────────────────┤
│  Summary bar:  Total  2.3 MB  │  Used  1.1 MB  │  Unused  1.2 MB (52%) │
├──────────────────────────────────────────────────────────────────────────┤
│  URL                              │ Type │ Total  │ Unused  │ Usage      │
│ ─────────────────────────────────────────────────────────────────────── │
│  https://example.com/main.js      │  JS  │ 842 kB │ 421 kB  │ ▓▓▒▒▒▒▒▒ │
│  https://example.com/vendor.js    │  JS  │ 1.1 MB │ 670 kB  │ ▓▓▒▒▒▒▒▒ │
│  https://example.com/styles.css   │ CSS  │ 180 kB │ 154 kB  │ ▓▒▒▒▒▒▒▒ │
│  https://example.com/icons.css    │ CSS  │  92 kB │  88 kB  │ ▓▒▒▒▒▒▒▒ │
│  ...                              │  ... │    ... │     ... │ ...       │
├──────────────────────────────────────────────────────────────────────────┤
│  [ Export as JSON ]                                                      │
└──────────────────────────────────────────────────────────────────────────┘

  Legend for Usage bar:
    ▓  green = used bytes
    ▒  red   = unused bytes
```

Key controls in the toolbar:
- **Circle (record)** — start/stop a coverage recording session
- **Reload arrow** — reload the page and immediately begin recording (best for capturing initial load)
- **Filter box** — filter rows by URL substring
- **Export** — download the full coverage report as JSON

---

## Running Coverage

### Step-by-step workflow

**1. Open Coverage and start recording**

Click the filled circle button (or use the reload button to capture from the very first byte loaded on page start). The button turns red/active when recording.

Tip: use the reload button rather than the record button if you want to capture JavaScript that runs during initial parse and module evaluation — code that executes before you can click "record" is otherwise missed.

**2. Interact with the page**

Navigate through every feature, route, and user flow you care about:
- Click every button and toggle
- Open every modal and drawer
- Navigate to every route
- Scroll to trigger lazy-loaded sections
- Submit forms
- Expand accordions

The more thoroughly you interact, the more accurate the "used" count becomes. Coverage is only as good as your interaction coverage.

**3. Stop recording**

Click the record button again (now a square stop button) to end the session.

**4. Review the results table**

The panel now shows every loaded CSS and JS file with byte counts and a visual usage bar. Sort by "Unused Bytes" descending to find the biggest opportunities first.

---

## Reading the Coverage Report

### Table columns

| Column | Description |
|---|---|
| **URL** | Full URL of the resource |
| **Type** | JS or CSS |
| **Total Bytes** | Uncompressed size of the file as delivered |
| **Unused Bytes** | Bytes not touched during the recording session |
| **Usage Visualization** | Inline bar — green on the left (used), red on the right (unused) |

### Color coding

- **Green** segment: bytes that were parsed/executed during the session
- **Red** segment: bytes that were downloaded but never touched

A file that is 90% red has roughly 90% of its bytes doing nothing during this session.

### Clicking into a file

Click any row in the Coverage table. DevTools opens the file in the **Sources panel** and annotates every line:

```
  1  | (green sidebar) | import React from 'react';
  2  | (green sidebar) | import { useState } from 'react';
  3  |                 |
  4  | (red sidebar)   | export function UnusedComponent() {
  5  | (red sidebar)   |   return <div>Never rendered</div>;
  6  | (red sidebar)   | }
  7  |                 |
  8  | (green sidebar) | export function ActiveComponent() {
  9  | (green sidebar) |   const [n, setN] = useState(0);
 10  | (green sidebar) |   return <button onClick={() => setN(n+1)}>{n}</button>;
 11  | (green sidebar) | }
```

Green lines ran. Red lines never ran. This is your roadmap for dead code removal.

---

## Interpreting Results

### What counts as "used"

**For JavaScript:**
- Any statement that was executed at the bytecode level
- A function declaration counts as "used" only when it is **called**, not just defined
- Module-level code (imports, top-level assignments) counts as executed on parse
- Event handlers count as used when the event fires
- Conditional branches that were never taken stay red

**For CSS:**
- Any rule that matched at least one DOM element during the session
- A selector like `.modal-open .sidebar` is only "used" when `.modal-open` is actually on the DOM
- Keyframe definitions count as used only when an animation using them fires
- Media query blocks count as used only when the query matched

### What it does NOT mean

"Unused" does not always mean "delete it":
- A route you did not navigate to will show as unused, but it is needed
- Error handling code that never triggered during your session is still critical
- Polyfills for browsers you did not test in will appear unused
- CSS for print media will be "unused" in a normal browsing session

---

## Typical Coverage Numbers (What Is Normal vs Alarming)

| Scenario | Unused JS | Unused CSS | Assessment |
|---|---|---|---|
| Small app, few dependencies | 10–25% | 15–30% | Healthy |
| Medium SPA, no code splitting | 40–60% | 50–70% | Worth investigating |
| Large app with full vendor bundle | 60–80% | 60–85% | Alarming — definitely optimize |
| Bootstrap/Tailwind without purging | n/a | 85–99% | Expected but fixable |
| After aggressive optimization | <20% | <20% | Excellent |

**Realistic baselines for a production React app (single bundle, no splitting):**
- `vendor.js` (React, lodash, etc.): commonly 50–75% unused on any given page
- `main.js` (app code): commonly 30–60% unused depending on how many routes exist
- Framework CSS (Bootstrap, MUI): commonly 80–95% unused

If your vendor bundle is over 70% unused, that is the first place to invest optimization effort.

---

## Strategies for Unused CSS

### 1. Critical CSS — inline above-the-fold styles

Extract only the CSS needed to render the visible viewport, inline it in `<head>`, and load the rest asynchronously.

```html
<head>
  <!-- Inlined critical CSS — no network round trip -->
  <style>
    body { margin: 0; font-family: sans-serif; }
    .hero { background: #0a0a0a; color: #fff; padding: 4rem 2rem; }
    .hero h1 { font-size: 3rem; line-height: 1.1; }
  </style>

  <!-- Full stylesheet loads non-blocking -->
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles.css"></noscript>
</head>
```

Tools to automate critical CSS extraction: `critical`, `critters` (used by Angular CLI), `penthouse`.

### 2. PurgeCSS — remove unused rules at build time

PurgeCSS scans your HTML/JS/template files and removes any CSS selectors it does not find.

```js
// postcss.config.js
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgecss({
      content: [
        './src/**/*.html',
        './src/**/*.jsx',
        './src/**/*.tsx',
        './src/**/*.vue',
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      // Safelist selectors that are added dynamically (e.g., JS-added classes)
      safelist: {
        standard: ['active', 'open', 'is-visible'],
        deep: [/^modal/, /^toast/],
        greedy: [/data-/],
      },
    }),
  ],
};
```

### 3. Tailwind CSS — JIT and content scanning

Tailwind's JIT engine only generates classes that appear in your source files:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue}',
    './public/index.html',
  ],
  // No safelist needed for static classes; add dynamic ones explicitly:
  safelist: [
    'bg-red-500',
    { pattern: /bg-(red|green|blue)-(100|200|300)/ },
  ],
  theme: { extend: {} },
  plugins: [],
};
```

### 4. Code-split CSS by route

With Webpack or Vite, CSS imported inside a dynamically loaded chunk is automatically split into its own file and only loaded when that chunk loads:

```js
// React route with CSS scoped to the route
const AdminPanel = React.lazy(() => import('./AdminPanel'));
// AdminPanel.jsx imports './admin.css' — that CSS ships only when AdminPanel loads
```

### 5. CSS-in-JS

Libraries like styled-components, Emotion, and Stitches only insert styles for components that are actually rendered. No dead CSS reaches the page.

```jsx
import styled from 'styled-components';

// This CSS is only injected into the DOM when <Button> renders
const Button = styled.button`
  background: #0070f3;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
`;
```

---

## Strategies for Unused JavaScript

### 1. Tree Shaking with Webpack

Tree shaking eliminates exports that are never imported. Requires ES modules (not CommonJS).

```js
// webpack.config.js
module.exports = {
  mode: 'production', // enables tree shaking automatically in production

  optimization: {
    usedExports: true,       // marks unused exports — Terser then removes them
    sideEffects: true,       // respects package.json "sideEffects" field
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            dead_code: true,   // remove unreachable code
            drop_console: true,
          },
        },
      }),
    ],
  },

  // Ensure you are NOT transpiling ES modules to CommonJS before webpack sees them
  // In babel.config.js:
  // { presets: [['@babel/preset-env', { modules: false }]] }
};
```

In `package.json`, declare which files have side effects so webpack knows it is safe to drop others:

```json
{
  "name": "my-library",
  "sideEffects": [
    "*.css",
    "src/polyfills.js"
  ]
}
```

For a library with zero side effects: `"sideEffects": false`

### 2. Tree Shaking with Vite / Rollup

Vite uses Rollup internally. Tree shaking is on by default in production builds.

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Optional: manual chunk splitting to keep vendor code separate
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group react ecosystem together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Everything else in a general vendor chunk
            return 'vendor';
          }
        },
      },
      // Tree shaking config (Rollup)
      treeshake: {
        moduleSideEffects: false, // treat all modules as side-effect-free
        propertyReadSideEffects: false,
      },
    },
    // Increase the warning threshold or inspect the bundle
    chunkSizeWarningLimit: 1000,
  },
  plugins: [react()],
});
```

### 3. Code Splitting with dynamic import()

The `import()` function splits a module into a separate chunk that is only downloaded when needed.

```js
// Before: static import — always in the bundle
import { heavyChartLibrary } from 'chart-library';

// After: dynamic import — loaded only when the user opens the chart view
async function renderDashboard() {
  const { heavyChartLibrary } = await import('chart-library');
  heavyChartLibrary.init('#chart-container', data);
}

// With error handling and loading state:
async function loadEditor() {
  const loadingSpinner = document.getElementById('spinner');
  loadingSpinner.style.display = 'block';

  try {
    const { MonacoEditor } = await import(
      /* webpackChunkName: "monaco-editor" */
      /* webpackPrefetch: true */          // browser fetches when idle
      '@monaco-editor/react'
    );
    loadingSpinner.style.display = 'none';
    return MonacoEditor;
  } catch (err) {
    console.error('Failed to load editor', err);
    loadingSpinner.style.display = 'none';
  }
}
```

Webpack magic comments:
- `webpackChunkName: "name"` — gives the chunk a readable filename
- `webpackPrefetch: true` — `<link rel="prefetch">`, loads when browser is idle
- `webpackPreload: true` — `<link rel="preload">`, loads in parallel with parent

### 4. Route-based lazy loading

**React**

```jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Each route is a separate chunk — only downloaded when the user navigates there
const Home        = lazy(() => import('./pages/Home'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Settings    = lazy(() => import('./pages/Settings'));
const AdminPanel  = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="page-loader">Loading...</div>}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings"  element={<Settings />} />
          <Route path="/admin"     element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**Vue 3 with Vue Router**

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/dashboard',
    // defineAsyncComponent is for components; for routes just use the arrow function
    component: () => import(
      /* webpackChunkName: "dashboard" */
      '../views/Dashboard.vue'
    ),
  },
  {
    path: '/settings',
    component: () => import('../views/Settings.vue'),
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
```

**Angular — lazy loaded feature modules**

```ts
// app-routing.module.ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AdminGuard],
  },
];
```

### 5. Removing unused npm packages

```bash
# Find packages imported nowhere in your source
npx depcheck

# Audit your bundle to see what takes up space
npx webpack-bundle-analyzer stats.json   # after: webpack --profile --json > stats.json
npx vite-bundle-visualizer               # for Vite projects

# Check if a package has a lighter alternative
# e.g., replace moment.js (300 kB) with date-fns (tree-shakeable, ~15 kB per function)
npm uninstall moment
npm install date-fns

# Use lodash-es instead of lodash for tree shaking
npm uninstall lodash
npm install lodash-es
```

---

## Coverage vs Bundle Analyzer

These are complementary tools that answer different questions.

| Dimension | Coverage Tool (DevTools) | Bundle Analyzer (webpack-bundle-analyzer, source-map-explorer) |
|---|---|---|
| **Data source** | Runtime — what actually ran | Static — what is in the bundle |
| **What it finds** | Code downloaded but not executed in THIS session | Duplicate packages, unexpectedly large dependencies |
| **CSS analysis** | Yes | No |
| **Dead exports** | Indirectly (code never ran) | Directly (unused exports before bundling) |
| **Third-party visibility** | Yes, any loaded script | Yes, inside the bundle |
| **False positives** | High — code you didn't trigger | Low |
| **Requires user interaction** | Yes | No |

**Use both together:**

1. Run Bundle Analyzer first — fix obvious structural problems (duplicate React versions, massive unused libraries)
2. Run Coverage Tool after — find what remains unused at runtime for your critical user flows
3. A file that is large in the bundle analyzer AND mostly red in Coverage is your highest-priority target

---

## Limitations of Coverage

**1. Dynamic classes and selectors**

CSS classes added by JavaScript that were never triggered during your session appear as "unused". A `.is-active` class that only appears when a user clicks a specific toggle will be red unless you click that toggle during recording.

**2. You must simulate all user interactions**

Coverage is only as complete as your walkthrough. Routes you didn't visit, modals you didn't open, and error states you didn't trigger all appear as unused — even though they are needed.

**3. Third-party scripts skew results**

Analytics scripts, chat widgets, and ad tags often load large bundles of code for features that only activate under specific conditions (e.g., a chat window the user never opened). These inflate your "unused" numbers without being actionable.

**4. Minified output is harder to act on**

The line annotations in Sources are on the minified file. You need source maps enabled (or use the unminified dev build) to get meaningful line-level data.

**5. Code that runs before recording starts**

If you click "record" after the page has already loaded, any code that ran during initial parse (module evaluation, top-level code) is already executed and won't be captured. Use the reload button to capture from byte zero.

**6. Web Workers and Service Workers**

Coverage does not capture code executing in workers. Service worker scripts can appear entirely unused even though they handle fetch events.

**7. Coverage does not persist across navigations**

A full-page navigation (not SPA routing) resets the session. Use Puppeteer for multi-page coverage collection.

---

## Exporting Coverage Data

Click the **Export** button (download icon) at the bottom of the Coverage panel to save the current session as a JSON file.

The exported format:

```json
[
  {
    "url": "https://example.com/main.js",
    "ranges": [
      { "start": 0,    "end": 4823  },
      { "start": 9100, "end": 12450 }
    ],
    "text": "... full file source ..."
  },
  {
    "url": "https://example.com/styles.css",
    "ranges": [
      { "start": 0,   "end": 2100 }
    ],
    "text": "... full CSS source ..."
  }
]
```

Each entry has:
- `url` — the resource URL
- `ranges` — byte offset ranges that were **used** (everything outside these ranges is unused)
- `text` — the full text of the file (allows offline analysis)

You can parse this in a script to compute exact unused percentages, diff across builds, or feed into a CI coverage budget check.

---

## Puppeteer Coverage API

Puppeteer exposes the same V8 and CSS coverage engine that DevTools uses, letting you collect coverage programmatically — ideal for CI pipelines and automated audits.

### Basic JS and CSS coverage

```js
const puppeteer = require('puppeteer');

async function collectCoverage(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Start coverage collection BEFORE navigating
  await Promise.all([
    page.coverage.startJSCoverage({
      resetOnNavigation: false,  // keep accumulating across SPA navigations
      includeRawScriptCoverage: false,
    }),
    page.coverage.startCSSCoverage({
      resetOnNavigation: false,
    }),
  ]);

  // Navigate and interact
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Simulate user interactions
  await page.click('#open-menu');
  await page.waitForSelector('.dropdown-menu');
  await page.click('.dropdown-menu a[href="/settings"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Stop and collect
  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage(),
  ]);

  await browser.close();
  return { jsCoverage, cssCoverage };
}

function computeStats(coverageEntries) {
  let totalBytes = 0;
  let usedBytes = 0;

  for (const entry of coverageEntries) {
    totalBytes += entry.text.length;
    for (const range of entry.ranges) {
      usedBytes += range.end - range.start;
    }
  }

  const unusedBytes = totalBytes - usedBytes;
  const unusedPercent = ((unusedBytes / totalBytes) * 100).toFixed(1);

  return { totalBytes, usedBytes, unusedBytes, unusedPercent };
}

(async () => {
  const { jsCoverage, cssCoverage } = await collectCoverage('https://example.com');

  const jsStats  = computeStats(jsCoverage);
  const cssStats = computeStats(cssCoverage);

  console.log('JavaScript coverage:');
  console.log(`  Total:   ${(jsStats.totalBytes / 1024).toFixed(1)} kB`);
  console.log(`  Used:    ${(jsStats.usedBytes / 1024).toFixed(1)} kB`);
  console.log(`  Unused:  ${(jsStats.unusedBytes / 1024).toFixed(1)} kB (${jsStats.unusedPercent}%)`);

  console.log('\nCSS coverage:');
  console.log(`  Total:   ${(cssStats.totalBytes / 1024).toFixed(1)} kB`);
  console.log(`  Used:    ${(cssStats.usedBytes / 1024).toFixed(1)} kB`);
  console.log(`  Unused:  ${(cssStats.unusedBytes / 1024).toFixed(1)} kB (${cssStats.unusedPercent}%)`);
})();
```

### CI integration — fail the build on coverage regression

```js
// scripts/coverage-check.js
const puppeteer = require('puppeteer');

const THRESHOLDS = {
  js:  { maxUnusedPercent: 45 },  // fail if unused JS exceeds 45%
  css: { maxUnusedPercent: 30 },  // fail if unused CSS exceeds 30%
};

async function runCoverageCheck() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await Promise.all([
    page.coverage.startJSCoverage(),
    page.coverage.startCSSCoverage(),
  ]);

  // Load the production build (served locally in CI)
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage(),
  ]);

  await browser.close();

  const results = {
    js:  computeStats(jsCoverage),
    css: computeStats(cssCoverage),
  };

  let failed = false;

  for (const [type, stats] of Object.entries(results)) {
    const threshold = THRESHOLDS[type].maxUnusedPercent;
    const actual    = parseFloat(stats.unusedPercent);

    if (actual > threshold) {
      console.error(
        `FAIL: ${type.toUpperCase()} unused bytes = ${actual}% ` +
        `(threshold: ${threshold}%)`
      );
      failed = true;
    } else {
      console.log(
        `PASS: ${type.toUpperCase()} unused bytes = ${actual}% ` +
        `(threshold: ${threshold}%)`
      );
    }
  }

  process.exit(failed ? 1 : 0);
}

function computeStats(entries) {
  let totalBytes = 0;
  let usedBytes = 0;
  for (const entry of entries) {
    totalBytes += entry.text.length;
    for (const range of entry.ranges) {
      usedBytes += range.end - range.start;
    }
  }
  const unusedBytes   = totalBytes - usedBytes;
  const unusedPercent = ((unusedBytes / totalBytes) * 100).toFixed(1);
  return { totalBytes, usedBytes, unusedBytes, unusedPercent };
}

runCoverageCheck().catch(err => {
  console.error(err);
  process.exit(1);
});
```

Add to your CI pipeline:

```yaml
# .github/workflows/coverage.yml
- name: Start production preview server
  run: npm run build && npx serve -s build -p 3000 &
  
- name: Run coverage check
  run: node scripts/coverage-check.js
```

### Per-file coverage breakdown in CI

```js
// Print the top 10 largest unused files
function reportTopUnused(coverageEntries, label, topN = 10) {
  const files = coverageEntries.map(entry => {
    const totalBytes = entry.text.length;
    const usedBytes  = entry.ranges.reduce((sum, r) => sum + (r.end - r.start), 0);
    const unusedBytes   = totalBytes - usedBytes;
    const unusedPercent = ((unusedBytes / totalBytes) * 100).toFixed(1);
    return { url: entry.url, totalBytes, unusedBytes, unusedPercent };
  });

  files.sort((a, b) => b.unusedBytes - a.unusedBytes);

  console.log(`\nTop ${topN} files by unused ${label} bytes:`);
  for (const f of files.slice(0, topN)) {
    const kb = (f.unusedBytes / 1024).toFixed(1);
    console.log(`  ${f.unusedPercent.padStart(5)}% unused  ${kb.padStart(8)} kB  ${f.url}`);
  }
}
```

---

## Real-World Workflow: Auditing a React App

### Scenario

A React SPA with a `vendor.js` bundle weighing 1.4 MB. Users on the home page are waiting 4+ seconds for TTI on a mid-range Android phone on 4G. The Coverage tool reveals 40% of the vendor bundle is unused on the home page.

### Step 1 — Baseline measurement

Open Coverage, click the reload button, let the home page fully load, do not interact further, stop recording.

```
vendor.js   1.4 MB   840 kB unused (60%)   ░░░░░▓▓▓░░░░░░░░░░░░
main.js     380 kB   152 kB unused (40%)   ▓▓▓▓▓▓░░░░░░░░░░░
```

Clicking `vendor.js` in Sources shows that `react-data-grid`, `recharts`, and `date-fns` (with every locale included) are entirely red.

### Step 2 — Identify the causes

- `react-data-grid` is imported in the `<DataTable>` component — but `<DataTable>` only renders on the `/reports` route
- `recharts` is imported in `<Charts>` — only renders on `/dashboard`
- `date-fns` is imported as `import * as dateFns from 'date-fns'` pulling in all locales

### Step 3 — Apply code splitting

```jsx
// Before — static imports on App.jsx
import DataTable from './components/DataTable';
import Charts    from './components/Charts';

// After — lazy load route-level components
const DataTable = React.lazy(() => import('./components/DataTable'));
const Charts    = React.lazy(() => import('./components/Charts'));
```

Fix `date-fns` import:

```js
// Before — imports everything (500+ kB)
import * as dateFns from 'date-fns';
const formatted = dateFns.format(date, 'yyyy-MM-dd');

// After — import only what you use (tree-shakeable)
import { format } from 'date-fns';
const formatted = format(date, 'yyyy-MM-dd');
```

### Step 4 — Re-measure

```
vendor.js        420 kB   105 kB unused (25%)   ▓▓▓▓▓▓▓▓░░░░░░
main.js          310 kB    93 kB unused (30%)   ▓▓▓▓▓▓▓░░░░░░
dashboard.js     280 kB   (only loads on /dashboard)
reports.js       190 kB   (only loads on /reports)
```

The home page now ships 420 kB instead of 1.78 MB. TTI on the mid-range device drops from 4.2 s to 1.8 s.

### Step 5 — Ongoing monitoring

Add the Puppeteer coverage check to CI with a budget of 30% max unused on the home page. Any PR that regresses the number gets a failing check before it merges.

```
PASS: JS  unused bytes = 25.3% (threshold: 30%)
PASS: CSS unused bytes = 18.7% (threshold: 25%)
```

---

## Quick Reference

| Task | Action |
|---|---|
| Open Coverage | Cmd+Shift+P → "Show Coverage" |
| Capture from page load | Click reload arrow in Coverage toolbar |
| Find biggest wins | Sort table by "Unused Bytes" descending |
| See which lines are unused | Click file row → Sources panel |
| Export data | Click download icon at bottom of panel |
| Automate in CI | `page.coverage.startJSCoverage()` in Puppeteer |
| Remove unused CSS | PurgeCSS, Tailwind JIT, CSS-in-JS |
| Remove unused JS | Tree shaking + dynamic `import()` + route splitting |

---

[← Web Devtools](/coding/web-devtools/)
