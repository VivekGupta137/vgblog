---
title: 09 Lighthouse Panel
---

# Chrome DevTools — Lighthouse Panel

Lighthouse is an automated auditing tool built into Chrome DevTools. It runs a battery of tests against any URL, scores the page across five categories, and produces a prioritized report of what to fix and why. This guide takes you from opening the panel for the first time to running audits in CI and writing Node.js automation.

---

## What Lighthouse Is

Lighthouse is an open-source automated auditing tool developed by Google. It simulates page load under controlled conditions, collects performance timing data, and checks dozens of rules covering performance, accessibility, best practices, SEO, and Progressive Web App readiness.

Key facts:

- Scores are on a 0–100 scale. 90–100 is green (good), 50–89 is orange (needs improvement), 0–49 is red (poor).
- Performance scores are calculated from a weighted combination of lab metrics captured during the simulated load. They are point-in-time snapshots, not real-user measurements.
- Results vary between runs due to CPU/network variability, background processes, and non-deterministic JavaScript. Running three times and averaging is standard practice.
- Lighthouse is the engine behind PageSpeed Insights and several third-party performance platforms.

---

## How to Run Lighthouse

### From DevTools Panel (Analyze page load button)

1. Open Chrome and navigate to the page you want to audit.
2. Open DevTools: `F12` / `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux).
3. Click the **Lighthouse** tab. If it is not visible, click the `>>` overflow arrow.
4. Choose your categories (Performance, Accessibility, Best Practices, SEO, PWA).
5. Choose **Mobile** or **Desktop** device.
6. Click **Analyze page load**.
7. Wait 30–60 seconds for the report to generate. Do not interact with the page during the run.

Tips:
- Run in an **Incognito window** to disable extensions that inject scripts and inflate TBT.
- Close other browser tabs to reduce CPU contention.
- Use **Desktop** mode first to get a baseline, then **Mobile** to find the toughest issues.

### CLI

```bash
# Install globally
npm install -g lighthouse

# Run and open the HTML report in your default browser
lighthouse https://example.com --view

# Run desktop preset
lighthouse https://example.com --preset=desktop --view

# Output JSON for programmatic use
lighthouse https://example.com --output=json --output-path=./report.json

# Throttle CPU to 4x slowdown (simulates mid-range Android)
lighthouse https://example.com --throttling-method=simulate --throttling.cpuSlowdownMultiplier=4
```

### PageSpeed Insights (Online)

Visit [https://pagespeed.web.dev](https://pagespeed.web.dev) and enter any publicly accessible URL. PageSpeed Insights runs both **Lab data** (Lighthouse) and shows **Field data** (Chrome User Experience Report — real user measurements). Use field data to validate that lab improvements translate to real-world gains.

### Chrome Extension

Install the **Lighthouse** extension from the Chrome Web Store. Click its toolbar icon on any page. The extension gives you a standalone report without opening DevTools. Useful on machines where DevTools is unavailable or when auditing behind authentication without running the CLI.

---

## Configuration: Mobile vs Desktop, Categories, Throttling

### Device Emulation

| Setting | CPU Throttle | Network | Viewport | Use When |
|---------|-------------|---------|----------|----------|
| Mobile  | 4x slowdown | Slow 4G (~150 KB/s down) | 360x640 | Most traffic is mobile; baseline for public-facing sites |
| Desktop | None | None | 1350x940 | Internal tools, desktop-first apps, after fixing mobile issues |

### Categories

Check only the categories you need. Unchecked categories are skipped entirely, which shortens the run time.

| Category | What It Checks |
|----------|---------------|
| Performance | Core Web Vitals, load metrics, resource efficiency |
| Accessibility | WCAG 2.x rules automatable by static analysis (~30–40% of WCAG) |
| Best Practices | HTTPS, console errors, deprecated APIs, image ratios |
| SEO | Crawlability, meta tags, structured data basics |
| Progressive Web App | Service worker, manifest, HTTPS, offline capability |

### Throttling Methods

| Method | Description |
|--------|-------------|
| Simulated (default) | Lighthouse collects unthrottled data and mathematically models what the metrics would be under throttled conditions. Faster but less accurate. |
| Applied (DevTools) | Chrome actually throttles CPU and network during the run. Slower, more accurate, higher variance. |
| No throttling | Raw machine speed. Only useful when comparing two runs on identical hardware. |

---

## Report Structure

A Lighthouse report is organized as follows:

```
Report
├── Scores row          ← Five colored circles, 0-100 each
├── Performance
│   ├── Metrics         ← Six scored metrics with timeline filmstrip
│   ├── Opportunities   ← Estimated savings in seconds, sorted by impact
│   └── Diagnostics     ← Rule violations that do not have a direct time estimate
├── Accessibility       ← Grouped violations, warnings, and passing rules
├── Best Practices      ← Pass/fail checklist
├── SEO                 ← Pass/fail checklist
└── PWA                 ← Pass/fail checklist (with installability sub-category)
```

**Passed Audits** are collapsed at the bottom of each category. Expanding them confirms what is already correct and provides documentation for teammates.

**Opportunities** include an estimated savings value. Lighthouse uses these savings only to rank opportunities in the report; they do not feed into the score calculation.

**Diagnostics** report violations without a savings estimate (e.g., "Minimize main thread work"). They still affect metrics indirectly.

---

## Performance Category — All Metrics

The performance score is a weighted average of six metrics. Each metric converts its raw measurement to a 0–100 score using a log-normal distribution fitted to observed data. The six scores are then blended using these weights:

| Metric | Weight | What It Measures | Good | Needs Improvement | Poor |
|--------|--------|-----------------|------|-------------------|------|
| **FCP** — First Contentful Paint | 10% | Time until the browser renders the first text or image pixel | ≤ 1.8 s | 1.8–3.0 s | > 3.0 s |
| **Speed Index** | 10% | How quickly visible page content is populated (visual progress score) | ≤ 3.4 s | 3.4–5.8 s | > 5.8 s |
| **LCP** — Largest Contentful Paint | 25% | Time until the largest image or text block in the viewport is rendered | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s |
| **TBT** — Total Blocking Time | 30% | Sum of all blocking periods between FCP and TTI (tasks > 50 ms, only the excess over 50 ms is counted) | ≤ 200 ms | 200–600 ms | > 600 ms |
| **CLS** — Cumulative Layout Shift | 15% | Weighted sum of unexpected layout shifts during load (unitless score) | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **TTI** — Time to Interactive | 10% | Time until the main thread is quiet and the page reliably responds to input | ≤ 3.8 s | 3.8–7.3 s | > 7.3 s |

**TBT (30%) and LCP (25%) together account for 55% of the score.** Fix long tasks and slow largest-element renders first.

**Note:** INP (Interaction to Next Paint) replaced FID as a Core Web Vital in March 2024. INP is measured in field data (PageSpeed Insights / CrUX) but is not yet a scored metric inside the Lighthouse lab report. It appears under Diagnostics.

---

## Top Performance Opportunities with Fix Strategies

### Render-Blocking Resources

**Symptom:** Stylesheets and synchronous scripts in `<head>` block HTML parsing. The browser cannot render anything until they are downloaded and executed.

**Diagnosis:** Lighthouse lists each blocking resource with its estimated blocking time.

**Fixes:**

```html
<!-- Defer non-critical JavaScript (executes after HTML parse, before DOMContentLoaded) -->
<script src="analytics.js" defer></script>

<!-- Async JavaScript (executes as soon as downloaded, order not guaranteed) -->
<script src="widget.js" async></script>

<!-- Preload critical resources so the browser discovers them early -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/css/critical.css" as="style">

<!-- Inline critical CSS — the minimum styles needed to render above-the-fold content -->
<style>
  /* extracted critical path CSS here */
</style>
<!-- Load full stylesheet asynchronously -->
<link rel="stylesheet" href="/css/main.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/css/main.css"></noscript>
```

### Unused JavaScript

**Symptom:** Bundles include code that is never executed on the current page. DevTools Coverage tab shows red bars on JS files.

**Fixes:**

```javascript
// Code splitting with dynamic import() — load route components on demand
// React + Webpack / Vite example
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <HeavyChart />
    </Suspense>
  );
}

// Dynamic import for a feature triggered by user action
document.getElementById('export-btn').addEventListener('click', async () => {
  const { exportToPDF } = await import('./lib/pdf-export.js');
  exportToPDF(document.querySelector('#report'));
});
```

Tree shaking (Webpack/Rollup/Vite): ensure you use ES module `import/export` syntax, not CommonJS `require()`. Bundlers cannot statically analyze `require()` for dead code elimination.

```json
// package.json — mark package as side-effect-free to enable full tree shaking
{
  "sideEffects": false
}
```

### Unused CSS

**Fixes:**

- **PurgeCSS / UnCSS:** scan HTML/JS/templates and remove CSS selectors that never appear.

```javascript
// postcss.config.js with PurgeCSS
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.html', './src/**/*.jsx', './src/**/*.tsx'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    })
  ]
};
```

- **CSS Modules / Scoped Styles:** CSS tied to a component is automatically dead-code-eliminated when the component is removed from the bundle.
- **Critical CSS inline:** Extract above-the-fold styles with `critical` npm package and inline them in `<head>`. Defer the rest.

### Unoptimized Images

Images are typically the largest contributors to page weight.

```html
<!-- Use modern formats with fallback -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero image" width="1200" height="600" loading="lazy">
</picture>

<!-- Responsive images with srcset — browser picks the right size -->
<img
  src="photo-800.webp"
  srcset="photo-400.webp 400w, photo-800.webp 800w, photo-1600.webp 1600w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
  alt="Product photo"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
>

<!-- LCP image: do NOT lazy-load it. Add fetchpriority instead -->
<img
  src="above-fold-hero.webp"
  alt="Hero"
  width="1200"
  height="600"
  fetchpriority="high"
>
```

CLI conversion with `sharp` or `squoosh-cli`:

```bash
npx @squoosh/cli --webp '{}' --avif '{}' images/*.jpg
```

### No Text Compression

**Symptom:** HTML, CSS, JS, and JSON responses are served without `Content-Encoding`. Can reduce transfer size by 60–80%.

**Fix — Nginx:**

```nginx
gzip on;
gzip_types text/plain text/css application/javascript application/json image/svg+xml;
gzip_min_length 1024;
gzip_comp_level 6;

# Brotli (requires ngx_brotli module)
brotli on;
brotli_types text/plain text/css application/javascript application/json;
brotli_comp_level 6;
```

**Fix — Express.js:**

```javascript
const compression = require('compression');
const express = require('express');
const app = express();

// Place before all routes
app.use(compression({ level: 6 }));
```

### No Efficient Cache Policy

**Symptom:** Static assets are served without `Cache-Control` headers, or with `max-age=0`. Repeat visitors re-download unchanged files.

**Strategy:** Versioned (content-hashed) filenames can be cached forever. HTML should be short-lived.

```nginx
# Nginx — static assets with content hash in filename (e.g., main.a3f9c2.js)
location ~* \.(js|css|woff2|png|webp|avif|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable, max-age=31536000";
}

# HTML — revalidate frequently
location ~* \.html$ {
    add_header Cache-Control "no-cache, must-revalidate";
}
```

**Express.js:**

```javascript
// Serve static files with aggressive caching (assumes hashed filenames)
app.use('/static', express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true
}));
```

### Large Network Payloads

**Target:** Total page weight under 1.6 MB. Lighthouse flags pages over 5 MB.

Actions:
- Audit and remove unused third-party scripts (chat widgets, A/B testing, analytics with duplicate functionality).
- Load third-party scripts with `async` or `defer`, or move them to the bottom of `<body>`.
- Split vendor bundles from application bundles so unchanged vendor code stays cached.
- Use `rel="preconnect"` for critical third-party origins to reduce DNS/TCP overhead.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### Long Main Thread Work

**Symptom:** TBT is high. The Coverage and Performance panels show long tasks (red triangles in the call stack).

**Actions:**
- Break up long synchronous loops with `scheduler.yield()` or `setTimeout(..., 0)`.
- Move CPU-heavy computation (image processing, crypto, sorting large datasets) to a **Web Worker**.
- Avoid layout thrashing: batch DOM reads before writes.

```javascript
// Web Worker for CPU-intensive work
// worker.js
self.onmessage = function(e) {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};

// main.js
const worker = new Worker('/worker.js');
worker.postMessage(largeDataset);
worker.onmessage = (e) => renderResult(e.data);

// Yield to the browser between chunks to avoid blocking input
async function processInChunks(items) {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i]);
    if (i % 100 === 0) {
      // Yield to allow frame rendering and input handling
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

---

## Accessibility Category

Lighthouse automates roughly 30–40% of WCAG 2.x criteria. Automated tools cannot test keyboard navigation flow, logical reading order, or screen reader announcement quality — manual testing is required for those.

### Contrast Ratio Failures

**Rule:** Normal text needs a contrast ratio of at least 4.5:1 against its background. Large text (18 pt+, or 14 pt bold) needs 3:1.

**Fix:** Use the DevTools color picker. Click a color swatch, then use the contrast ratio row to pick a compliant shade. Tools: [https://webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker)

```css
/* Before — #aaa on white = 2.32:1 (fail) */
color: #aaa;

/* After — #767676 on white = 4.54:1 (pass AA) */
color: #767676;
```

### Missing Alt Text

```html
<!-- Fail -->
<img src="product.jpg">

<!-- Pass — descriptive -->
<img src="product.jpg" alt="Red leather wallet, open to show card slots">

<!-- Pass — decorative image should have empty alt so screen readers skip it -->
<img src="divider.svg" alt="" role="presentation">
```

### Unlabeled Form Controls

```html
<!-- Fail -->
<input type="email" placeholder="Email address">

<!-- Pass — visible label associated via for/id -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email">

<!-- Pass — aria-label for icon-only inputs -->
<input type="search" aria-label="Search products">

<!-- Pass — aria-labelledby pointing to existing text -->
<h2 id="billing-heading">Billing address</h2>
<input type="text" aria-labelledby="billing-heading" name="address">
```

### Missing lang Attribute

```html
<!-- Fail -->
<html>

<!-- Pass -->
<html lang="en">

<!-- For multilingual content, set lang on specific elements -->
<p>The French word for cat is <span lang="fr">chat</span>.</p>
```

### Incorrect ARIA Usage

Common mistakes:

```html
<!-- Fail — adding role="button" to a div but not making it focusable or keyboard-operable -->
<div role="button" onclick="submit()">Submit</div>

<!-- Pass — use the native element instead -->
<button type="submit">Submit</button>

<!-- Fail — aria-hidden on a focusable element traps keyboard users -->
<button aria-hidden="true">Close</button>

<!-- Pass — remove from tab order too, or don't hide it -->
<button aria-hidden="true" tabindex="-1">Close</button>

<!-- Fail — duplicate IDs on aria-labelledby targets -->
<div id="title">Section A</div>
<div id="title">Section B</div>  <!-- duplicate -->

<!-- Pass — unique IDs -->
<div id="section-a-title">Section A</div>
<div id="section-b-title">Section B</div>
```

### Keyboard Trap

**Rule:** Focus must never become stuck inside a component (except intentional modal dialogs).

**Fix for modals:** Implement a focus trap that cycles through focusable children while the modal is open, and returns focus to the trigger element on close.

```javascript
function trapFocus(modalElement) {
  const focusable = modalElement.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modalElement.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  first.focus();
}
```

---

## Best Practices Category

| Audit | What It Checks | Fix |
|-------|---------------|-----|
| HTTPS | All requests (page and subresources) are served over HTTPS | Obtain a TLS cert (Let's Encrypt is free). Redirect all HTTP to HTTPS. |
| No deprecated APIs | `document.write()`, synchronous XHR, old WebRTC APIs, etc. | Replace with modern equivalents documented on MDN. |
| Browser errors in console | JavaScript errors logged to `console.error` during page load | Fix each JS error; they indicate broken functionality. |
| Correct image aspect ratios | Rendered width/height matches intrinsic aspect ratio | Always set `width` and `height` attributes on `<img>` matching the intrinsic size. CSS `aspect-ratio` also works. |
| Secure library versions | Known vulnerable npm packages (via Snyk DB) | `npm audit fix`. Pin exact versions in production builds. |
| Allows users to paste into password fields | `paste` event not blocked on password inputs | Remove `onpaste="return false"` from password fields. |
| No CSP / insecure CSP | Content Security Policy not set or allows `unsafe-inline` | Add a `Content-Security-Policy` response header. Start with `default-src 'self'`. |

---

## SEO Category

| Audit | What It Checks | Fix |
|-------|---------------|-----|
| Meta description | `<meta name="description">` present and between 50–160 chars | Add a unique, descriptive meta description to every page. |
| robots.txt | File is valid and not blocking indexing unintentionally | Validate at `https://search.google.com/search-console/robots-testing-tool`. |
| Canonical links | `<link rel="canonical">` points to the preferred URL | Every page should have a self-referencing canonical or point to the preferred variant. |
| Legible font sizes | Text is at least 12 px on mobile | Do not use font sizes below 12 px. Use responsive typography. |
| Tap target sizes | Touch targets are at least 48x48 px with 8 px clearance | Add `min-height: 48px; min-width: 48px; padding` to interactive elements on mobile. |
| Hreflang | `hreflang` links are valid for international pages | Use correct BCP 47 language tags (`en-US`, not `en_US`). |
| Structured data | JSON-LD schema is valid | Test with Google's Rich Results Test tool. |
| Crawlable links | Links have `href` attributes and are not blocked by JS | Avoid links that only work via JavaScript event handlers with no real `href`. |

---

## PWA Category

| Requirement | Audit | Fix |
|-------------|-------|-----|
| Service Worker | A service worker is registered and controls the page | Register a service worker with `navigator.serviceWorker.register('/sw.js')`. |
| HTTPS | All content served over HTTPS | See Best Practices section above. |
| Web App Manifest | Valid manifest with `name`, `short_name`, `start_url`, `icons` | Create `/manifest.json` and link it: `<link rel="manifest" href="/manifest.json">`. |
| Installability | Manifest + service worker + HTTPS met | Chrome shows the install prompt automatically when all three criteria are met. |
| Offline page | App returns a 200 when offline | Cache a fallback page in your service worker. |
| Icons | 192x192 and 512x512 PNG icons in manifest | Provide both sizes. Use Maskable icons for Android adaptive icons. |

**Minimal manifest.json:**

```json
{
  "name": "My Application",
  "short_name": "MyApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0066cc",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

**Minimal service worker with offline fallback:**

```javascript
// sw.js
const CACHE_NAME = 'v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL, '/', '/css/main.css']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
```

---

## Lighthouse Scoring Algorithm

### Weighted Average

```
Performance Score = 
  FCP_score  * 0.10 +
  SI_score   * 0.10 +
  LCP_score  * 0.25 +
  TBT_score  * 0.30 +
  CLS_score  * 0.15 +
  TTI_score  * 0.10
```

Each raw metric value is converted to a 0–100 score using a **log-normal distribution**. The parameters (median and p10) for each distribution are calibrated against a large corpus of real-world page loads. A metric at the median earns a score of 50; at the 10th percentile (fast) it earns about 90.

### Score Distribution Intuition

- Improving a metric from "poor" to "needs improvement" has a large score impact because you move up the steep part of the curve.
- Moving from 95 to 99 requires near-perfect conditions and yields tiny score gains.
- Because TBT weight is 30%, reducing long tasks is the single highest-leverage change for most sites.

### Why Scores Vary Between Runs

- Background CPU usage from OS and other apps affects TTI and TBT.
- Network variability affects FCP and LCP even with simulated throttling.
- Non-deterministic JavaScript (timers, animations, third-party scripts) can shift metrics.
- Chrome's renderer is multi-process; process startup time varies.

### Tips for Consistent Scores

1. Use **Incognito mode** to disable extensions.
2. Use **simulated throttling** (the default) rather than applied throttling for lower variance.
3. **Close other browser tabs** and quit other applications to free CPU.
4. Run at least **3 times** and take the median score, not the best or worst.
5. Use **Lighthouse CI** or the CLI for automated runs — they are more consistent than the DevTools panel because they launch a dedicated Chrome process.
6. Avoid running on a machine under load (e.g., during a build).

---

## Lighthouse CI

Lighthouse CI (LHCI) integrates Lighthouse into your CI/CD pipeline, stores reports, and can fail a build when scores drop below thresholds.

### Installation

```bash
npm install -g @lhci/cli
# or as a dev dependency
npm install --save-dev @lhci/cli
```

### lighthouserc.js Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      // Pages to audit
      url: ['http://localhost:3000/', 'http://localhost:3000/about'],

      // Number of runs per URL (median is used for assertions)
      numberOfRuns: 3,

      // Start your server before collecting
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Server listening on',
      startServerReadyTimeout: 30000,

      // Lighthouse settings
      settings: {
        preset: 'desktop',
        // Or configure throttling explicitly:
        // throttlingMethod: 'simulate',
        // throttling: {
        //   rttMs: 40,
        //   throughputKbps: 10240,
        //   cpuSlowdownMultiplier: 1,
        // },
      },
    },

    assert: {
      preset: 'lighthouse:recommended', // start with Google's recommended thresholds

      // Override individual assertions
      assertions: {
        // Require a minimum category score
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Require specific metric thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Warn on specific audits
        'uses-optimized-images': ['warn', { maxLength: 0 }],
        'unused-javascript': ['warn', { maxLength: 0 }],

        // Enforce resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 300000 }], // 300 KB JS
        'resource-summary:image:size': ['error', { maxNumericValue: 500000 }],  // 500 KB images
        'resource-summary:total:size': ['error', { maxNumericValue: 1600000 }], // 1.6 MB total
      },
    },

    upload: {
      // Upload reports to LHCI server (self-hosted) or temporary public storage
      target: 'temporary-public-storage',
      // For self-hosted:
      // target: 'lhci',
      // serverBaseUrl: 'https://lhci.your-domain.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};
```

### GitHub Actions Workflow

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Install Lighthouse CI
        run: npm install -g @lhci/cli@0.14.x

      - name: Run Lighthouse CI
        run: lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
          # If uploading to a self-hosted LHCI server:
          # LHCI_TOKEN: ${{ secrets.LHCI_TOKEN }}

      - name: Upload Lighthouse reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-reports
          path: .lighthouseci/
          retention-days: 30
```

### Running LHCI Locally

```bash
# Collect, assert, and upload in one command
lhci autorun

# Or run steps individually
lhci collect --url=http://localhost:3000
lhci assert
lhci upload --target=temporary-public-storage

# Compare against a baseline branch
lhci compare --from-branch=main --to-branch=HEAD
```

---

## Programmatic Lighthouse (Node.js API)

Use the Node API when you need to integrate Lighthouse into custom tooling, generate reports from a script, or post-process raw audit data.

```javascript
// lighthouse-audit.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runAudit(url, options = {}) {
  // Launch a headless Chrome instance
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });

  const defaultOptions = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    // Desktop preset
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const runnerResult = await lighthouse(url, config);

    // Access scores
    const { lhr } = runnerResult;
    console.log(`URL: ${lhr.finalDisplayedUrl}`);
    console.log(`Performance: ${Math.round(lhr.categories.performance.score * 100)}`);
    console.log(`Accessibility: ${Math.round(lhr.categories.accessibility.score * 100)}`);
    console.log(`LCP: ${lhr.audits['largest-contentful-paint'].displayValue}`);
    console.log(`TBT: ${lhr.audits['total-blocking-time'].displayValue}`);
    console.log(`CLS: ${lhr.audits['cumulative-layout-shift'].displayValue}`);

    // List failed audits
    const failedAudits = Object.values(lhr.audits)
      .filter(audit => audit.score !== null && audit.score < 0.9)
      .sort((a, b) => a.score - b.score)
      .map(audit => `  [${Math.round(audit.score * 100)}] ${audit.title}`);

    console.log('\nFailed/Warn audits:');
    failedAudits.forEach(a => console.log(a));

    // Write HTML report
    const htmlReport = runnerResult.report[0];
    fs.writeFileSync('./lighthouse-report.html', htmlReport);

    // Write JSON for further processing
    const jsonReport = runnerResult.report[1];
    fs.writeFileSync('./lighthouse-report.json', jsonReport);

    return lhr;
  } finally {
    await chrome.kill();
  }
}

// Run multiple URLs and compare
async function auditMultiple(urls) {
  const results = [];
  for (const url of urls) {
    console.log(`\nAuditing ${url}...`);
    const lhr = await runAudit(url);
    results.push({
      url,
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      lcp: lhr.audits['largest-contentful-paint'].numericValue,
      tbt: lhr.audits['total-blocking-time'].numericValue,
      cls: lhr.audits['cumulative-layout-shift'].numericValue,
    });
  }

  console.table(results);
  return results;
}

// Usage
runAudit('https://example.com').catch(console.error);
```

---

## Prioritizing Improvements — Impact vs Effort Matrix

Not all Lighthouse fixes are equal. Use this framework to sequence your work.

| Impact | Effort | Examples | Do First? |
|--------|--------|----------|-----------|
| High | Low | Enable gzip/brotli, set Cache-Control headers, add `defer` to non-critical scripts, add `loading="lazy"` to below-fold images, set explicit image dimensions | Yes — quick wins |
| High | Medium | Convert images to WebP/AVIF, implement code splitting, extract and inline critical CSS, fix high-contrast ratio failures, add missing alt text and form labels | Yes — scheduled sprint |
| High | High | Migrate to a CDN, refactor large synchronous JavaScript, redesign render-critical path, implement service worker | Yes — major initiative |
| Low | Low | Add meta description, add `lang` attribute, fix incorrect ARIA roles, add manifest.json | Yes — take 30 minutes |
| Low | Medium | Build a full PWA with offline support, audit third-party scripts for removal | After high-impact work |
| Low | High | Rewrite a legacy module in a lighter library just for a few KB savings | Rarely worth it alone |

### Recommended Sequence for a New Project

1. **Measure first** — run Lighthouse three times, take the median. Record the baseline scores.
2. **Fix accessibility failures** — legal risk, inclusive design, and zero performance cost.
3. **Enable compression and caching** — server config changes, no code changes required.
4. **Optimize images** — largest typical payload; convert format, add dimensions, add lazy loading, use srcset.
5. **Eliminate render-blocking resources** — defer/async scripts, inline critical CSS.
6. **Reduce JavaScript** — code split routes, tree shake, defer feature imports.
7. **Reduce unused CSS** — PurgeCSS or CSS Modules.
8. **Measure again** — confirm improvements and uncover newly exposed bottlenecks.
9. **Automate with Lighthouse CI** — prevent regressions before they reach production.

### Reading Opportunity Savings

Savings shown in Lighthouse Opportunities (e.g., "Savings of 1.2 s") are estimates based on the assumption that the resource is on the critical path. Actual savings depend on your network conditions and what else loads in parallel. Treat them as relative priority signals, not absolute guarantees.

### Field vs Lab Data

Lab data (Lighthouse) shows what happened in a controlled simulation. Field data (CrUX / PageSpeed Insights) shows the distribution of real user experiences. A lab score improvement that does not appear in field data usually means:

- The improvement only helps fast devices/networks (most real users are on slower conditions).
- The fix is behind a feature flag not active for real users.
- The LCP element in the lab is not the LCP element for real users (different viewport, content personalization).

Always validate lab improvements with real-user monitoring (RUM) data before declaring a performance project complete.

---

[← Web Devtools](/coding/web-devtools/)
