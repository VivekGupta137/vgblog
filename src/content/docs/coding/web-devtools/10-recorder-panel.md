---
title: 10 Recorder Panel
---

# Chrome DevTools — Recorder Panel

---

## What the Recorder Panel Is

The Recorder panel (introduced in Chrome 97) lets you record, replay, measure, and export user flows directly inside the browser. A "user flow" is a sequence of real interactions — clicks, navigation, form input, scrolling — captured as a structured JSON file that can be replayed on demand, exported to Puppeteer, Playwright, or Selenium, and integrated into CI pipelines.

Unlike manual testing scripts written from scratch, Recorder generates the automation baseline for you. You perform the steps once; the panel captures them with accurate selectors, timing, and assertions. You then refine and reuse that capture as many times as needed.

Key capabilities:

- **Record** — capture any real interaction sequence in the live page
- **Replay** — re-execute the recorded flow inside DevTools
- **Measure** — attach a Lighthouse performance run to a flow and get per-flow LCP, TBT, CLS
- **Export** — emit JSON, Puppeteer, Playwright, or WebDriver (Selenium) scripts
- **Import** — reload a previously exported JSON recording
- **Edit** — add, delete, reorder steps; swap selectors; add assertions

---

## When to Use It

| Scenario | How Recorder Helps |
|---|---|
| **Regression testing** | Record the happy path once; replay before every release to confirm it still works |
| **Performance measurement** | Attach Lighthouse to a flow and compare LCP/CLS across builds |
| **Reproducing bugs** | Record the exact steps that trigger a bug and share the JSON with your team |
| **Automation baseline** | Generate a working Puppeteer or Playwright script without writing boilerplate |
| **Accessibility auditing** | Use ARIA selectors to verify that flows are navigable by screen readers |
| **Onboarding documentation** | A JSON recording is a machine-readable spec of a user journey |

---

## UI Layout (ASCII Diagram)

```
+-------------------------------------------------------+
|  DevTools  [Elements][Console][Sources][Network] ...  |
|                    [Recorder]                         |
+-------------------------------------------------------+
|  RECORDER                              [+ New]  [...]  |
|-------------------------------------------------------|
|  My Flows                                             |
|  > checkout-flow             [Play] [Edit] [Export]   |
|  > login-flow                [Play] [Edit] [Export]   |
|-------------------------------------------------------|
|  RECORDING: checkout-flow                             |
|                                                       |
|  [Stop recording]   [Add step]                        |
|                                                       |
|  1  navigate       https://example.com/cart           |
|  2  click          button#checkout                    |
|  3  change         input[name="email"]   "a@b.com"    |
|  4  change         input[name="card"]    "4111..."    |
|  5  click          button[type="submit"]              |
|  6  waitForElement h1.confirmation                    |
|                                                       |
|  Playback speed:  [Normal 1x v]                       |
|  [Measure performance]  [Export v]  [Import]          |
+-------------------------------------------------------+
```

Panel sections:

- **Flow list (left sidebar)** — all saved recordings; click one to open it
- **Step list (main area)** — ordered list of captured interactions
- **Toolbar** — record, play, export, import, measure performance controls
- **Step detail (inline expand)** — expand any step to edit its selector, value, or timeout

---

## Recording a User Flow — Step by Step

### 1. Open the Recorder Panel

Open DevTools (`Cmd+Option+I` / `F12`), then find the **Recorder** tab. If it is not visible, click the `>>` overflow arrow in the tab bar.

### 2. Start a New Recording

Click the `+` (Create a new recording) button. A dialog asks for a recording name. Use a descriptive name like `checkout-guest-flow` — this becomes the file name when you export.

Click **Start recording**. A red dot appears in the panel header, and a recording badge appears on the DevTools icon. Every interaction you make on the page is now captured.

### 3. Perform Actions

Interact with the page exactly as a user would:

- **Navigate** — type a URL or click links; Recorder captures `navigate` steps automatically
- **Click** — click buttons, links, checkboxes; captured as `click` steps
- **Type** — fill form fields; captured as `change` steps with the final value
- **Scroll** — scroll the viewport or a scrollable element; captured as `scroll` steps
- **Submit** — pressing Enter or clicking a submit button; captured as `click` or `keyDown`
- **Hover** — limited support; see Limitations section

Keep your flow focused. Record one logical journey per file (e.g., "add to cart", not "entire app").

### 4. End the Recording

Click **End recording** (the stop button). The red dot disappears. The panel now shows the full step list.

### 5. Review the Recorded Steps

Scroll through the steps. For each step you can:

- Expand it to see the full selector list and properties
- Delete spurious steps (accidental clicks, extra navigations)
- Check that selectors look stable — prefer ARIA or text selectors over generated class names

---

## The Recording Format (JSON)

Every recording is a plain JSON file. Understanding the schema lets you edit recordings by hand, diff them in version control, and generate them programmatically.

### Complete Example

```json
{
  "title": "checkout-guest-flow",
  "steps": [
    {
      "type": "setViewport",
      "width": 1280,
      "height": 720,
      "deviceScaleFactor": 1,
      "isMobile": false,
      "hasTouch": false,
      "isLandscape": false
    },
    {
      "type": "navigate",
      "url": "https://shop.example.com/",
      "assertedEvents": [
        {
          "type": "navigation",
          "url": "https://shop.example.com/",
          "title": "Example Shop"
        }
      ]
    },
    {
      "type": "click",
      "target": "main",
      "selectors": [
        ["aria/Add to cart[role=\"button\"]"],
        ["#product-42 button.add-to-cart"],
        ["xpath///*[@id='product-42']//button[contains(@class,'add-to-cart')]"]
      ],
      "offsetX": 64,
      "offsetY": 18,
      "assertedEvents": [
        {
          "type": "navigation",
          "url": "https://shop.example.com/cart",
          "title": "Your Cart"
        }
      ]
    },
    {
      "type": "click",
      "target": "main",
      "selectors": [
        ["aria/Proceed to checkout[role=\"link\"]"],
        ["a.checkout-btn"],
        ["pierce/.checkout-btn"]
      ],
      "offsetX": 50,
      "offsetY": 14
    },
    {
      "type": "change",
      "target": "main",
      "selectors": [
        ["aria/Email address"],
        ["input[name=\"email\"]"],
        ["#guest-email"]
      ],
      "value": "test@example.com"
    },
    {
      "type": "change",
      "target": "main",
      "selectors": [
        ["aria/Card number"],
        ["input[name=\"cardNumber\"]"]
      ],
      "value": "4111111111111111"
    },
    {
      "type": "change",
      "target": "main",
      "selectors": [
        ["aria/Expiry date"],
        ["input[name=\"expiry\"]"]
      ],
      "value": "12/28"
    },
    {
      "type": "change",
      "target": "main",
      "selectors": [
        ["aria/CVV"],
        ["input[name=\"cvv\"]"]
      ],
      "value": "123"
    },
    {
      "type": "scroll",
      "target": "main",
      "x": 0,
      "y": 600
    },
    {
      "type": "click",
      "target": "main",
      "selectors": [
        ["aria/Place order[role=\"button\"]"],
        ["button[type=\"submit\"].place-order"]
      ],
      "offsetX": 80,
      "offsetY": 20,
      "assertedEvents": [
        {
          "type": "navigation",
          "url": "https://shop.example.com/confirmation",
          "title": "Order Confirmed"
        }
      ]
    },
    {
      "type": "waitForElement",
      "target": "main",
      "selectors": [
        ["aria/Your order has been placed"],
        ["h1.confirmation-heading"]
      ],
      "operator": ">=",
      "count": 1,
      "timeout": 10000
    }
  ]
}
```

### Step Type Reference

| `type` | What it Does | Key Properties |
|---|---|---|
| `setViewport` | Sets browser viewport size before the flow starts | `width`, `height`, `isMobile` |
| `navigate` | Loads a URL | `url`, `assertedEvents` |
| `click` | Mouse click on an element | `selectors`, `offsetX`, `offsetY`, `button` |
| `change` | Sets an input/select/textarea value | `selectors`, `value` |
| `keyDown` / `keyUp` | Raw keyboard event | `key` (e.g. `"Enter"`, `"Tab"`) |
| `scroll` | Scrolls viewport or element | `x`, `y`, `selectors` (if scrollable element) |
| `waitForElement` | Pauses until selector matches | `selectors`, `operator` (`>=`, `==`), `count`, `timeout` |
| `waitForExpression` | Pauses until JS expression is truthy | `expression`, `timeout` |
| `customStep` | Placeholder for extension-supplied logic | `name`, `parameters` |

### `assertedEvents`

`assertedEvents` on a step defines what must happen after the step fires. The most common assertion is a `navigation` event — if the navigation does not occur within the timeout, replay fails with a clear error. You can add these by hand to any step to make replays more robust.

### `selectors` Array

Each element in `selectors` is itself an array (a selector chain). Recorder tries them in order and uses the first one that resolves to a unique element. Providing multiple selectors of different types makes the recording resilient: if a CSS class changes, the ARIA selector still works.

---

## Selector Types — When Each Is Appropriate

### CSS Selector (default)

```
["#checkout-form button.submit-btn"]
```

Recorder generates these automatically. They are precise and fast. They break when developers rename classes or restructure the DOM. Treat auto-generated CSS selectors as a starting point, not a final answer.

**Use when:** the element has a stable, semantic `id` or data attribute (e.g., `[data-testid="submit"]`).

### XPath

```
["xpath///*[@id='checkout-form']//button[contains(text(),'Place order')]"]
```

Useful for matching by text content or traversing parent-to-child relationships that CSS cannot express.

**Use when:** you need to target an element by its visible text or need to navigate up/across the DOM tree.

### Pierce (Shadow DOM)

```
["pierce/.checkout-widget button.submit"]
```

The `pierce` prefix instructs the selector engine to cross Shadow DOM boundaries. Regular CSS selectors cannot reach into shadow roots.

**Use when:** the target element lives inside a Web Component's shadow tree.

### Text Selector

```
["text/Place order"]
```

Matches the first element whose full text content equals the given string. Highly readable and resilient to structural changes.

**Use when:** button or link text is stable and unique on the page.

### ARIA Selector

```
["aria/Place order[role=\"button\"]"]
```

Matches by accessible name and optional ARIA role — exactly how a screen reader identifies elements. ARIA selectors survive CSS refactors, DOM restructuring, and framework migrations. They also serve as implicit accessibility tests: if the ARIA selector breaks, the element may no longer be accessible.

**Use when:** writing any flow you want to remain stable across refactors. Prefer ARIA selectors whenever the element has a meaningful accessible name.

### Selector Priority Recommendation

```
ARIA  >  data-testid (CSS)  >  text  >  XPath  >  CSS class  >  Pierce
```

---

## Replaying Recordings

### Basic Replay

Open a saved recording and click the **Play** button (triangle icon). Recorder opens a new tab (or reuses the current one for the same origin), executes each step in sequence, and highlights the target element on screen as it acts.

Pass/fail is shown inline per step:
- Green checkmark — step completed successfully
- Red X with message — step failed (element not found, navigation timeout, assertion failed)

### Playback Speed

The speed dropdown offers:

| Setting | Delay Between Steps | Best For |
|---|---|---|
| Normal (1x) | None | Smoke tests, CI |
| Slow (0.25x) | ~4x longer waits | Debugging timing issues, demos |

Slow playback is useful when a step fails intermittently — watching the page at 0.25x often reveals that an animation or lazy-load is still running when the next step fires.

### What Happens During Replay

1. Recorder navigates to the starting URL from the first `navigate` step
2. For each subsequent step it finds the element using the selector list (first match wins)
3. It dispatches the appropriate browser event (click, input, keydown, scroll)
4. If an `assertedEvent` is present, it waits for the event before continuing
5. `waitForElement` steps poll the DOM until the condition is satisfied or timeout is reached

---

## Editing Recordings

Click the **Edit** (pencil) icon next to a recording to enter edit mode. In edit mode every step has controls to modify, reorder, or remove it.

### Add a Step

Click **Add step** (+ icon) above or below an existing step. Choose a step type from the dropdown: `click`, `change`, `navigate`, `keyDown`, `scroll`, `waitForElement`, `waitForExpression`, `customStep`.

Useful scenarios:
- Add a `waitForElement` after a click that triggers an async operation
- Add a `navigate` to reset to a known page before the flow starts
- Add a `keyDown` with key `"Tab"` to test keyboard navigation

### Delete a Step

Click the trash icon on any step. Use this to remove accidental clicks or page visits captured during recording.

### Edit a Selector

Expand a step to reveal its selector list. Click any selector string to edit it inline. You can:
- Replace a fragile auto-generated CSS selector with an ARIA or `data-testid` selector
- Add a new selector to the list as a fallback
- Remove selectors that are known to be unstable

### Add a `waitForElement` Assertion

To assert that an element appears after a step:

1. Click **Add step** after the relevant step
2. Choose `waitForElement`
3. Set the selector to the element you expect (e.g., `["aria/Order confirmed"]`)
4. Set `operator` to `>=` and `count` to `1`
5. Set `timeout` (milliseconds) — 5000 to 10000 is typical for async UI

### Add a `waitForExpression` (Custom Condition)

`waitForExpression` lets you pause until an arbitrary JavaScript expression evaluates to truthy in the page context:

```json
{
  "type": "waitForExpression",
  "expression": "document.querySelector('.spinner') === null",
  "timeout": 8000
}
```

This is the escape hatch for situations where DOM presence alone is not enough — e.g., waiting for a spinner to disappear, waiting for a data attribute to be set, or waiting for a global JS variable.

---

## Measuring Performance with Recordings

Recorder integrates with Lighthouse to give you real-user-flow performance metrics — LCP, TBT, and CLS measured during a specific user journey, not just page load.

### How to Run a Performance Measurement

1. Open the recording you want to measure
2. Click **Measure performance** (speedometer icon) instead of **Play**
3. Recorder runs the flow with Lighthouse instrumentation active
4. A Lighthouse report opens when the flow completes

### Metrics Produced

| Metric | What It Measures |
|---|---|
| **LCP** (Largest Contentful Paint) | When the largest visible element rendered |
| **TBT** (Total Blocking Time) | How long the main thread was blocked (proxy for interactivity) |
| **CLS** (Cumulative Layout Shift) | How much the layout shifted unexpectedly |
| **FCP** (First Contentful Paint) | When the first content appeared |

### Why This Matters

Traditional Lighthouse measures page load in isolation. User-flow Lighthouse measures across navigation boundaries — so you can detect that your checkout page is fast but the post-payment confirmation page causes a large CLS. This is impossible to catch with a single-page Lighthouse audit.

### Comparing Over Time

Export the Lighthouse JSON report alongside your recording JSON. Store both in version control and diff the metric values between releases to detect performance regressions.

---

## Exporting Recordings

Click the **Export** button (arrow icon) in the recording toolbar and choose a format.

### JSON (Re-import Later)

Exports the raw recording schema. Use this to:
- Share flows with teammates
- Store flows in version control
- Re-import and replay in any Chrome instance
- Modify programmatically and re-import

### Puppeteer Export

Exports a self-contained Node.js script using the `puppeteer` and `@puppeteer/replay` libraries.

**Example exported script:**

```js
import puppeteer from 'puppeteer';
import { createRunner } from '@puppeteer/replay';

// Auto-generated by Chrome DevTools Recorder
// Recording: checkout-guest-flow

const flow = {
  title: 'checkout-guest-flow',
  steps: [
    {
      type: 'setViewport',
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
    {
      type: 'navigate',
      url: 'https://shop.example.com/',
      assertedEvents: [
        { type: 'navigation', url: 'https://shop.example.com/', title: 'Example Shop' },
      ],
    },
    {
      type: 'click',
      target: 'main',
      selectors: [
        ['aria/Add to cart[role="button"]'],
        ['#product-42 button.add-to-cart'],
      ],
      offsetX: 64,
      offsetY: 18,
    },
    {
      type: 'click',
      target: 'main',
      selectors: [
        ['aria/Proceed to checkout[role="link"]'],
        ['a.checkout-btn'],
      ],
      offsetX: 50,
      offsetY: 14,
    },
    {
      type: 'change',
      target: 'main',
      selectors: [['aria/Email address'], ['input[name="email"]']],
      value: 'test@example.com',
    },
    {
      type: 'change',
      target: 'main',
      selectors: [['aria/Card number'], ['input[name="cardNumber"]']],
      value: '4111111111111111',
    },
    {
      type: 'click',
      target: 'main',
      selectors: [
        ['aria/Place order[role="button"]'],
        ['button[type="submit"].place-order'],
      ],
      offsetX: 80,
      offsetY: 20,
    },
    {
      type: 'waitForElement',
      target: 'main',
      selectors: [['aria/Your order has been placed'], ['h1.confirmation-heading']],
      operator: '>=',
      count: 1,
      timeout: 10000,
    },
  ],
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const runner = await createRunner(flow, new PuppeteerRunnerExtension(browser, page));

  await runner.run();

  await browser.close();
})();
```

### Playwright Export

Exports a script using the `playwright` library. Playwright's API differs from Puppeteer's; the export handles the translation automatically.

**Example exported Playwright script:**

```js
import { test } from '@playwright/test';
import { createRunner, parse } from '@puppeteer/replay';
import { PlaywrightRunnerExtension } from '@puppeteer/replay/lib/main.js';

// Auto-generated by Chrome DevTools Recorder
// Recording: checkout-guest-flow

const recording = {
  title: 'checkout-guest-flow',
  steps: [
    {
      type: 'setViewport',
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
    {
      type: 'navigate',
      url: 'https://shop.example.com/',
    },
    {
      type: 'click',
      selectors: [['aria/Add to cart[role="button"]'], ['#product-42 button.add-to-cart']],
    },
    {
      type: 'click',
      selectors: [['aria/Proceed to checkout[role="link"]'], ['a.checkout-btn']],
    },
    {
      type: 'change',
      selectors: [['aria/Email address'], ['input[name="email"]']],
      value: 'test@example.com',
    },
    {
      type: 'change',
      selectors: [['aria/Card number'], ['input[name="cardNumber"]']],
      value: '4111111111111111',
    },
    {
      type: 'click',
      selectors: [['aria/Place order[role="button"]'], ['button[type="submit"].place-order']],
    },
    {
      type: 'waitForElement',
      selectors: [['aria/Your order has been placed'], ['h1.confirmation-heading']],
      operator: '>=',
      count: 1,
      timeout: 10000,
    },
  ],
};

test('checkout-guest-flow', async ({ page, browser }) => {
  const runner = await createRunner(
    parse(recording),
    new PlaywrightRunnerExtension(browser, page, { timeout: 15000 }),
  );
  await runner.run();
});
```

Run with:

```bash
npx playwright test checkout-guest-flow.spec.js
```

### WebDriver (Selenium) — Java

Exports a Java class using the Selenium WebDriver API.

```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

public class CheckoutGuestFlow {
  public static void main(String[] args) {
    System.setProperty("webdriver.chrome.driver", "/path/to/chromedriver");
    WebDriver driver = new ChromeDriver();
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

    try {
      driver.manage().window().setSize(new Dimension(1280, 720));
      driver.get("https://shop.example.com/");

      wait.until(ExpectedConditions.elementToBeClickable(
          By.cssSelector("#product-42 button.add-to-cart"))).click();

      wait.until(ExpectedConditions.elementToBeClickable(
          By.cssSelector("a.checkout-btn"))).click();

      WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
          By.cssSelector("input[name=\"email\"]")));
      emailInput.clear();
      emailInput.sendKeys("test@example.com");

      WebElement cardInput = driver.findElement(By.cssSelector("input[name=\"cardNumber\"]"));
      cardInput.clear();
      cardInput.sendKeys("4111111111111111");

      driver.findElement(By.cssSelector("button[type=\"submit\"].place-order")).click();

      wait.until(ExpectedConditions.visibilityOfElementLocated(
          By.cssSelector("h1.confirmation-heading")));

      System.out.println("Flow completed successfully.");
    } finally {
      driver.quit();
    }
  }
}
```

---

## The @puppeteer/replay Library

`@puppeteer/replay` is the official Node.js library that powers Recorder exports. You can use it independently of Chrome DevTools to replay JSON recordings in any Node.js environment.

### Install

```bash
npm install @puppeteer/replay puppeteer
```

### Replay a JSON File in Node.js

```js
import puppeteer from 'puppeteer';
import { createRunner, PuppeteerRunnerExtension, parse } from '@puppeteer/replay';
import { readFileSync } from 'fs';

const json = JSON.parse(readFileSync('./checkout-guest-flow.json', 'utf8'));
const flow = parse(json); // validates and parses the recording schema

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const runner = await createRunner(
    flow,
    new PuppeteerRunnerExtension(browser, page, { timeout: 10000 }),
  );

  await runner.run();
  console.log('Recording replayed successfully.');

  await browser.close();
})();
```

### Custom Replay Extension

A custom extension lets you intercept every step — useful for adding extra assertions, logging, or metrics collection without modifying the JSON file.

```js
import { PuppeteerRunnerExtension } from '@puppeteer/replay';

class AssertingExtension extends PuppeteerRunnerExtension {
  async beforeAllSteps(flow) {
    console.log(`Starting flow: ${flow.title}`);
    await super.beforeAllSteps(flow);
  }

  async afterAllSteps(flow) {
    await super.afterAllSteps(flow);
    console.log(`Flow complete: ${flow.title}`);
  }

  async beforeEachStep(step, flow) {
    await super.beforeEachStep(step, flow);
    console.log(`  > ${step.type}`, step.selectors?.[0]?.[0] ?? step.url ?? '');
  }

  async afterEachStep(step, flow) {
    await super.afterEachStep(step, flow);
    // add custom assertions here — e.g. check console errors
    const errors = await this.page.evaluate(() =>
      window.__errors__ ?? [],
    );
    if (errors.length > 0) {
      throw new Error(`Console errors after step ${step.type}: ${errors.join(', ')}`);
    }
  }
}

// Use it:
const runner = await createRunner(flow, new AssertingExtension(browser, page));
await runner.run();
```

### Available Extension Hooks

| Hook | When It Fires |
|---|---|
| `beforeAllSteps(flow)` | Once, before the first step |
| `afterAllSteps(flow)` | Once, after the last step |
| `beforeEachStep(step, flow)` | Before every individual step |
| `afterEachStep(step, flow)` | After every individual step |
| `runStep(step, flow)` | Override to replace default step execution entirely |

---

## Importing Recordings

To import a previously exported JSON recording:

1. Open the Recorder panel
2. Click the **Import** button (upload icon) in the top toolbar
3. Select the `.json` file from disk
4. The recording appears in the flow list immediately

You can then replay, edit, or re-export it in any format. This makes Recorder recordings portable across machines and shareable via version control.

---

## CI Integration

### GitHub Actions: Replay on Every PR

Store your JSON recording in the repository. Run it on every pull request using Puppeteer.

**File layout:**

```
.
├── recordings/
│   └── checkout-guest-flow.json
├── scripts/
│   └── replay.js
├── package.json
└── .github/
    └── workflows/
        └── recorder.yml
```

**`scripts/replay.js`:**

```js
import puppeteer from 'puppeteer';
import { createRunner, PuppeteerRunnerExtension, parse } from '@puppeteer/replay';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node replay.js <recording.json>');
  process.exit(1);
}

const flow = parse(JSON.parse(readFileSync(resolve(file), 'utf8')));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    const runner = await createRunner(
      flow,
      new PuppeteerRunnerExtension(browser, page, { timeout: 15000 }),
    );
    await runner.run();
    console.log(`PASS: ${flow.title}`);
  } catch (err) {
    console.error(`FAIL: ${flow.title}`);
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
```

**`.github/workflows/recorder.yml`:**

```yaml
name: Recorder Replay

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  replay:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Chrome
        run: npx puppeteer browsers install chrome

      - name: Start application
        run: npm run start:ci &
        env:
          NODE_ENV: test

      - name: Wait for application to be ready
        run: npx wait-on http://localhost:3000 --timeout 30000

      - name: Replay checkout flow
        run: node scripts/replay.js recordings/checkout-guest-flow.json

      - name: Replay login flow
        run: node scripts/replay.js recordings/login-flow.json
```

**`package.json` (relevant section):**

```json
{
  "scripts": {
    "start:ci": "PORT=3000 node server.js"
  },
  "dependencies": {
    "puppeteer": "^22.0.0",
    "@puppeteer/replay": "^2.0.0"
  }
}
```

### Running Against a Staging URL

Pass the base URL as an environment variable and patch the recording at runtime:

```js
const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

// Rewrite all navigate steps to use the target environment
for (const step of flow.steps) {
  if (step.type === 'navigate' && step.url) {
    step.url = step.url.replace('https://shop.example.com', BASE_URL);
    if (step.assertedEvents) {
      for (const ev of step.assertedEvents) {
        if (ev.url) ev.url = ev.url.replace('https://shop.example.com', BASE_URL);
      }
    }
  }
}
```

---

## Real Use Case: Detecting Regressions in the Checkout Flow

### Step 1: Record the Flow

1. Open `https://shop.example.com/` in Chrome
2. Open Recorder, click `+`, name it `checkout-guest-flow`
3. Click Start recording
4. Add a product to cart, proceed to checkout, fill in guest details, submit
5. Stop recording when the confirmation page loads

### Step 2: Strengthen Selectors

In edit mode, review each step:
- Replace any `button.btn-primary` selectors with `aria/Place order[role="button"]`
- Replace `input.field--email` with `aria/Email address`
- Add `waitForElement` after the submit step targeting `aria/Your order has been placed`

### Step 3: Export as Puppeteer

Click Export > Puppeteer. Save as `scripts/checkout.recording.js`.

### Step 4: Add Assertions to the Exported Script

Add these after the final `waitForElement` step in the exported Puppeteer script:

```js
// Assert confirmation number is displayed
const confirmationText = await page.$eval(
  'h1.confirmation-heading',
  el => el.textContent.trim(),
);
console.assert(
  confirmationText.includes('Order Confirmed'),
  `Expected "Order Confirmed", got: "${confirmationText}"`,
);

// Assert no error banners are present
const errorBanners = await page.$$('.error-banner');
console.assert(
  errorBanners.length === 0,
  `Found ${errorBanners.length} unexpected error banners`,
);

// Assert URL contains confirmation
console.assert(
  page.url().includes('/confirmation'),
  `Expected /confirmation URL, got: ${page.url()}`,
);
```

### Step 5: Commit and Add to CI

```bash
git add recordings/checkout-guest-flow.json scripts/replay.js .github/workflows/recorder.yml
git commit -m "Add Recorder-based regression test for checkout flow"
```

Every PR now runs the checkout flow end-to-end. If a developer's change breaks the checkout path, the CI step fails with the exact step that failed and the selector that could not be resolved.

---

## Limitations and Workarounds

### Hover States

Recorder does not capture CSS `:hover` interactions or click-to-reveal menus triggered solely by pointer entry. Steps are only recorded when a click, change, or navigation occurs.

**Workaround:** Add a `customStep` annotation in the JSON to document the hover, then implement it in a custom `runStep` extension:

```js
async runStep(step, flow) {
  if (step.type === 'customStep' && step.name === 'hover') {
    const el = await this.page.$(step.parameters.selector);
    await el.hover();
    await this.page.waitForTimeout(step.parameters.delay ?? 300);
    return;
  }
  return super.runStep(step, flow);
}
```

### Drag and Drop

Native HTML5 `dragstart`/`dragover`/`drop` sequences are not captured by Recorder.

**Workaround:** Use `page.mouse.move` / `page.mouse.down` / `page.mouse.up` manually in the exported Puppeteer script, or use a Playwright `dragTo` call in the exported Playwright script.

### File Upload

`<input type="file">` interactions are not captured because the OS file picker is outside the browser's event system.

**Workaround:** After export, replace the relevant step with a Puppeteer `page.setInputFiles` call:

```js
await page.setInputFiles('input[type="file"]', '/path/to/test-file.pdf');
```

In Playwright:

```js
await page.setInputFiles('input[type="file"]', '/path/to/test-file.pdf');
```

### Canvas and WebGL Interactions

Recorder cannot capture interactions with `<canvas>` elements because canvas events are pixel-coordinate-based and carry no semantic meaning that the DOM can surface.

**Workaround:** Use `page.mouse.click(x, y)` with hardcoded coordinates in the exported script. Document the expected canvas state with a screenshot assertion using `expect(page).toHaveScreenshot()` in Playwright.

### iframes

Cross-origin iframes are blocked from recording. Same-origin iframes work but you must set the `target` property correctly.

**Workaround for cross-origin iframes:** Use `page.frames()` in the exported Puppeteer script to locate the iframe and operate on it directly rather than relying on the recorded step.

### Authentication / Cookies

If your flow requires login, record it starting after authentication or include the login steps at the beginning of the recording. For CI, inject session cookies programmatically before the runner starts:

```js
await page.setCookie({
  name: 'session',
  value: process.env.TEST_SESSION_COOKIE,
  domain: 'shop.example.com',
});
```

### Dynamic Content and Race Conditions

Auto-generated recordings use click events with no delay awareness. If an async operation takes longer than expected, replay fails.

**Workaround:** Add explicit `waitForElement` or `waitForExpression` steps after any step that triggers async work. Prefer these over fixed timeouts. Use slow playback (0.25x) to identify which step is racing.

### Recorder is Chrome-Only

The recording format is Chrome-specific. Playwright and WebDriver exports translate to cross-browser test code, but the recording itself can only be created and replayed inside Chrome/Chromium.

**Workaround:** Use the Playwright export and run it against Firefox or WebKit via Playwright's browser targets to verify cross-browser compatibility.

---

[← Web Devtools](/coding/web-devtools/)
