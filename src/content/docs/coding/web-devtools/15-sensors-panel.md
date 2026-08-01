---
title: 15 Sensors Panel
---

# Chrome DevTools — Sensors Panel

---

## What the Sensors Panel Is

The Sensors panel is a DevTools drawer tool that lets you **simulate physical device sensors and environmental conditions** inside a browser tab running on your desktop machine. Without the panel you would need a real phone in São Paulo, a device tilted at exactly 45 degrees, or a machine set to Tokyo Standard Time to test every code path in a location-aware, motion-driven, or timezone-sensitive web application. The Sensors panel removes all of those constraints.

Core capabilities at a glance:

| Sensor / Override | What is simulated | Browser API it affects |
|---|---|---|
| Geolocation | GPS coordinates, unavailable, permission-denied | `navigator.geolocation` |
| Device Orientation | Alpha / Beta / Gamma tilt angles | `DeviceOrientationEvent` |
| Device Motion | Acceleration, rotation rate | `DeviceMotionEvent` |
| Touch events | Pointer-style touch on desktop | `TouchEvent`, `PointerEvent` |
| Idle state | Active, idle, locked screen | `IdleDetector` API |
| Timezone | IANA timezone string override | `Intl`, `Date`, `toLocaleString` |
| Locale | `navigator.language` language tag | `navigator.language`, `Intl` |
| Hardware Concurrency | Logical CPU count | `navigator.hardwareConcurrency` |
| Device Memory | RAM size in gigabytes | `navigator.deviceMemory` |
| Prefers-color-scheme | Light / dark / no-preference | CSS media query, JS `matchMedia` |

All overrides are **scoped to the current DevTools session and the current tab**. Closing DevTools or reloading without the panel active restores real values. Nothing is written to disk.

---

## How to Open the Sensors Panel

### Method 1 — More Tools menu (most reliable)

1. Open DevTools with `F12` / `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux).
2. Click the **three-dot kebab menu** ( `⋮` ) in the top-right of DevTools.
3. Hover **More Tools**.
4. Click **Sensors**.

The panel opens as a drawer tab at the bottom.

### Method 2 — Command Menu

1. Open DevTools.
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) to open the Command Menu.
3. Type `sensors` and select **Show Sensors**.

### Method 3 — Drawer tab bar

If you have previously opened the panel, a **Sensors** tab persists in the drawer tab bar at the bottom. Click it directly.

---

## UI Layout — All Sections Explained

The Sensors panel is divided into collapsible sections from top to bottom:

```
┌─────────────────────────────────────────────────┐
│  SENSORS                                        │
├─────────────────────────────────────────────────┤
│  Location          ▾  No override               │
├─────────────────────────────────────────────────┤
│  Orientation       ▾  No override               │
├─────────────────────────────────────────────────┤
│  Touch             ▾  No override               │
├─────────────────────────────────────────────────┤
│  Idle Detection    ▾  No override               │
├─────────────────────────────────────────────────┤
│  Timezone          ▾  No override               │
├─────────────────────────────────────────────────┤
│  Locale            ▾  No override               │
├─────────────────────────────────────────────────┤
│  Hardware Concurrency  ▾  No override           │
├─────────────────────────────────────────────────┤
│  Prefers-color-scheme  ▾  No override           │
├─────────────────────────────────────────────────┤
│  Device Memory     ▾  No override               │
└─────────────────────────────────────────────────┘
```

Each row has a disclosure triangle to expand its controls. "No override" means the browser is reporting real values. The moment you change a field, the tab uses the spoofed value and a blue dot appears next to the section name as a reminder that an override is active.

---

## 1. Location (Geolocation) Simulation

### Why it matters

`navigator.geolocation` returns the machine's real physical position. On a desktop in New York you cannot test what your food-delivery app shows a user in Tokyo without this panel.

### Selecting a Preset Location

1. Expand the **Location** section.
2. Click the **Location** dropdown (default: "No override").
3. Choose from the built-in presets:

| Preset city | Approximate coordinates |
|---|---|
| Berlin | 52.520008, 13.404954 |
| London | 51.509865, -0.118092 |
| Moscow | 55.755826, 37.617300 |
| Mountain View | 37.386052, -122.083851 |
| Mumbai | 19.075984, 72.877656 |
| San Francisco | 37.774929, -122.419416 |
| Shanghai | 31.222222, 121.458056 |
| São Paulo | -23.547501, -46.636391 |
| Tokyo | 35.689487, 139.691706 |

Chrome updates this list; your version may contain additional entries.

### Custom Lat/Long Coordinates

1. In the **Location** dropdown, scroll to the bottom and select **Other…** (or **Manage** depending on your Chrome version).
2. Click **Add location**.
3. Fill in:
   - **Location name** — a human label (e.g., "Test Office NYC").
   - **Latitude** — decimal degrees, range -90 to +90.
   - **Longitude** — decimal degrees, range -180 to +180.
   - **Timezone** — an optional IANA string (e.g., `America/New_York`).
   - **Locale** — optional language tag (e.g., `en-US`).
4. Click **Add**.
5. Your custom location now appears in the preset dropdown for this and future sessions.

### Simulating Location Unavailable

Select **Location unavailable** from the dropdown. `getCurrentPosition` and `watchPosition` will call their `error` callback with `PositionError.code === 2` (POSITION_UNAVAILABLE).

### Simulating Permission Denied

Select **Permission denied** from the dropdown. The Geolocation API calls the error callback with `PositionError.code === 1` (PERMISSION_DENIED) — exactly as if the user had blocked the permission prompt.

### The Geolocation API — Code Reference

```js
// One-time position request
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('Latitude :', position.coords.latitude);
    console.log('Longitude:', position.coords.longitude);
    console.log('Accuracy :', position.coords.accuracy, 'm');
    console.log('Altitude :', position.coords.altitude);      // null if unavailable
    console.log('Speed    :', position.coords.speed);         // null if unavailable
    console.log('Heading  :', position.coords.heading);       // null if unavailable
    console.log('Timestamp:', new Date(position.timestamp));
  },
  (error) => {
    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED:     // 1
        console.error('User denied permission');
        break;
      case GeolocationPositionError.POSITION_UNAVAILABLE: // 2
        console.error('Position unavailable');
        break;
      case GeolocationPositionError.TIMEOUT:              // 3
        console.error('Request timed out');
        break;
    }
  },
  {
    enableHighAccuracy: true,  // requests GPS-quality fix
    timeout: 5000,             // ms before TIMEOUT error
    maximumAge: 0              // always fetch fresh position
  }
);

// Continuous watch (fires on each position change)
const watchId = navigator.geolocation.watchPosition(
  (pos) => console.log('Moved to', pos.coords.latitude, pos.coords.longitude),
  (err) => console.error(err.message)
);

// Stop watching
navigator.geolocation.clearWatch(watchId);
```

### Testing with Google Maps Embed

Open any page that embeds a `<iframe>` map or uses the Maps JS SDK. With a simulated location active, calls like `map.setCenter()` triggered by geolocation callbacks will center on your spoofed coordinates. Useful for verifying that the "My Location" button behaves correctly across different regions.

### Use Cases

- **Food delivery app** — verify restaurant lists, delivery radius, and ETA calculations render correctly for addresses in different cities.
- **Weather widget** — confirm the right city name and forecast unit (metric vs imperial) loads.
- **GDPR / consent banners** — certain banners appear only for EU coordinates; simulate Frankfurt to trigger them.
- **Rate limiting by region** — APIs that throttle or block certain geo-zones can be exercised without a VPN.

---

## 2. Device Orientation (DeviceOrientation / DeviceMotion API)

### What Device Orientation Is

`DeviceOrientationEvent` fires continuously as the device rotates in 3-D space. Three angles describe the orientation:

```
                    Z (up out of screen)
                    |
                    |
     Alpha (yaw)    |_______ X (right edge of phone)
    rotation around Z       \
                              \  Y (top edge of phone)

  ┌─────────────────────────────────────────────────────────┐
  │  Angle  │ Axis of rotation │ Range      │ Intuition     │
  ├─────────┼──────────────────┼────────────┼───────────────┤
  │  Alpha  │ Z — vertical     │ 0° – 360°  │ Compass yaw   │
  │         │ axis (up/down)   │            │ 0° = North    │
  ├─────────┼──────────────────┼────────────┼───────────────┤
  │  Beta   │ X — side-to-side │ -180°–180° │ Front/back    │
  │         │ axis             │            │ tilt. 0° =    │
  │         │                  │            │ flat, 90° =   │
  │         │                  │            │ portrait up   │
  ├─────────┼──────────────────┼────────────┼───────────────┤
  │  Gamma  │ Y — top-to-bottom│ -90° – 90° │ Left/right    │
  │         │ axis             │            │ tilt. 0° =    │
  │         │                  │            │ flat, 90° =   │
  │         │                  │            │ right-side up │
  └─────────┴──────────────────┴────────────┴───────────────┘
```

**Mnemonic:** Alpha = compass heading, Beta = nodding (yes), Gamma = tilting head sideways.

### Orientation Presets

| Preset | Alpha | Beta | Gamma | What it looks like |
|---|---|---|---|---|
| Portrait Primary | 0 | 0 | 0 | Phone lying flat, face up |
| Portrait Upside Down | 0 | -180 | 0 | Phone lying flat, face down |
| Landscape Primary | 0 | 0 | -90 | Phone rotated 90° clockwise |
| Landscape Secondary | 0 | 0 | 90 | Phone rotated 90° counter-clockwise |
| Custom | any | any | any | You control all three sliders |

### Setting Custom Orientation Values

1. Expand the **Orientation** section.
2. Click the dropdown and choose **Custom orientation**.
3. Three number inputs (Alpha, Beta, Gamma) and a 3-D phone diagram appear.
4. Drag the phone model in the diagram or type values directly.
5. Events fire in real time — no need to click Apply.

### The DeviceOrientation API — Code Reference

```js
// Listen for orientation changes
window.addEventListener('deviceorientation', (event) => {
  // event.absolute: true if Alpha is relative to Earth's North
  const { alpha, beta, gamma, absolute } = event;

  console.log(`Alpha (yaw/compass): ${alpha?.toFixed(2)}°`);
  console.log(`Beta  (front/back) : ${beta?.toFixed(2)}°`);
  console.log(`Gamma (left/right) : ${gamma?.toFixed(2)}°`);
  console.log(`Absolute reference : ${absolute}`);
});

// iOS 13+ and some browsers require a permission request
// (DevTools override bypasses this on desktop)
async function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    const state = await DeviceOrientationEvent.requestPermission();
    if (state === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  } else {
    // Android and desktop — no permission needed
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

// Compass heading example (alpha = 0 when pointing North)
function getCompassHeading(alpha) {
  return (360 - alpha) % 360; // convert to clockwise-from-North
}
```

### The DeviceMotion API — Code Reference

`DeviceMotionEvent` reports acceleration and rotation rate — useful for shake detection and step counters.

```js
window.addEventListener('devicemotion', (event) => {
  const accel = event.acceleration;               // excludes gravity
  const accelG = event.accelerationIncludingGravity; // includes gravity
  const rotation = event.rotationRate;

  // All values in m/s² (acceleration) or °/s (rotation)
  console.log('Accel X:', accel?.x);
  console.log('Accel Y:', accel?.y);
  console.log('Accel Z:', accel?.z);

  console.log('Rotation alpha (°/s):', rotation?.alpha); // around Z
  console.log('Rotation beta  (°/s):', rotation?.beta);  // around X
  console.log('Rotation gamma (°/s):', rotation?.gamma); // around Y

  console.log('Interval (ms):', event.interval); // how often events fire
});

// Shake detection
let lastShakeTime = 0;
window.addEventListener('devicemotion', (e) => {
  const a = e.accelerationIncludingGravity;
  if (!a) return;
  const magnitude = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);
  if (magnitude > 25 && Date.now() - lastShakeTime > 1000) {
    lastShakeTime = Date.now();
    console.log('Shake detected!');
  }
});
```

### Use Cases

- **Compass app** — drag Alpha from 0° to 360° in 45° steps to verify the needle rotates correctly.
- **Tilt-controlled game** — set Gamma to +30° then -30° to confirm the game character leans left and right.
- **Parallax backgrounds** — many hero sections shift layers based on deviceorientation; verify the effect looks correct across extreme angles.
- **Rotate-to-reveal UI** — some apps reveal hidden content when the device is flipped; simulate Landscape Secondary to test that code path.

---

## 3. Touch Simulation (from Device Mode)

### What Touch Simulation Does

Desktop browsers do not normally dispatch `TouchEvent` objects. The Touch section in Sensors (and the Device Mode toolbar) instructs Chrome to translate mouse-down events into touch events, enabling testing of touch-only code paths without a mobile device.

### Enabling Touch Events

**Via Device Mode toolbar:**
1. Open DevTools.
2. Click the **Toggle device toolbar** icon ( `Ctrl+Shift+M` / `Cmd+Shift+M` ).
3. Touch simulation activates automatically for any mobile preset.
4. Alternatively, with the toolbar visible, look for the **Touch** dropdown in the top bar and select **Force enabled**.

**Via Sensors panel:**
1. Expand the **Touch** section.
2. Toggle **Force enabled**.

### Single Touch vs Multi-Touch

| Input type | How to simulate in DevTools |
|---|---|
| Single tap | Click anywhere in the viewport |
| Touch + drag | Click and hold, then drag |
| Pinch-to-zoom | Hold `Shift`, then click-drag (zoom in/out) |
| Two-finger rotate | No built-in support; use `Touch.createTouch` in the Console |

### Touch API vs Pointer Events

```js
// Legacy Touch API — fires when touch simulation is active
document.addEventListener('touchstart', (e) => {
  const touch = e.touches[0]; // first touch point
  console.log('Touch at', touch.clientX, touch.clientY);
  console.log('Force    :', touch.force);   // pressure 0–1, 0 when simulated
  console.log('Radius X :', touch.radiusX); // touch area width in CSS pixels
});

document.addEventListener('touchmove',  (e) => e.preventDefault(), { passive: false });
document.addEventListener('touchend',   (e) => console.log('Lifted'));

// Modern Pointer Events — fire regardless of input type (mouse, touch, stylus)
document.addEventListener('pointerdown', (e) => {
  console.log('Pointer type:', e.pointerType); // "touch" when simulated
  console.log('Pressure    :', e.pressure);     // 0.5 for simulated touch
  console.log('isPrimary   :', e.isPrimary);
});

// Testing touch vs click distinction
element.addEventListener('click', (e) => {
  // When touch simulation is active, tap fires both 'touchend' and 'click'
  // 300 ms delay may be present if the page has no <meta name="viewport"> tag
  console.log('click fired', e);
});
```

### Disabling 300 ms Tap Delay

The delay exists when the browser needs to detect double-tap-to-zoom. Eliminating it:

```html
<!-- Add to <head> — tells Chrome the page is already optimised for mobile -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

```css
/* Alternative: opt the element out via CSS */
touch-action: manipulation;
```

---

## 4. Idle Detection Simulation

### What It Is

The [Idle Detection API](https://developer.chrome.com/docs/capabilities/idle-detection) (`IdleDetector`) lets a web app know when the user has not interacted with the device for a threshold period. Common use cases are auto-locking dashboards, expiring sessions, and pausing video calls.

The Sensors panel lets you force any idle state without actually walking away from your computer.

### States Available

| Sensors panel option | `userState` | `screenState` | Meaning |
|---|---|---|---|
| No override | — | — | Real system idle state |
| Active | `"active"` | `"unlocked"` | User is interacting |
| Idle | `"idle"` | `"unlocked"` | User idle, screen on |
| Locked | `"idle"` | `"locked"` | Screen locked / off |

### The IdleDetector API — Code Reference

```js
// Feature check
if (!('IdleDetector' in window)) {
  console.warn('IdleDetector not supported');
}

async function monitorIdle() {
  // 1. Request permission
  const permission = await IdleDetector.requestPermission();
  if (permission !== 'granted') {
    console.error('Idle detection permission denied');
    return;
  }

  // 2. Create detector with a threshold (minimum 60 seconds)
  const detector = new IdleDetector();

  // 3. Listen for state changes
  detector.addEventListener('change', () => {
    const { userState, screenState } = detector;
    console.log(`User  state : ${userState}`);   // "active" | "idle"
    console.log(`Screen state: ${screenState}`); // "locked" | "unlocked"

    if (userState === 'idle') {
      showSessionWarning();
    }
    if (screenState === 'locked') {
      pauseVideoStream();
    }
  });

  // 4. Start watching with a 60-second threshold
  await detector.start({ threshold: 60_000 });
  console.log('Idle detection started. Initial state:', detector.userState);
}

function showSessionWarning() {
  document.querySelector('#session-warning').hidden = false;
}

function pauseVideoStream() {
  videoElement.pause();
}

monitorIdle();
```

### Testing with the Sensors Panel

1. Open the page running the IdleDetector code above.
2. Grant the idle-detection permission (Console: `await IdleDetector.requestPermission()`).
3. In the **Idle Detection** section of the Sensors panel, select **Idle**.
4. The `change` event fires immediately; `userState` becomes `"idle"`.
5. Select **Locked** — `screenState` becomes `"locked"`.
6. Select **No override** — state reverts to real system state.

:::note
`IdleDetector` requires `chrome://flags/#enable-experimental-web-platform-features` or a secure context (HTTPS / localhost). The override works in DevTools regardless of threshold.
:::

---

## 5. Timezone Override

### What It Does

The Timezone override replaces the IANA timezone used by JavaScript's `Date` object, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, and any library (Moment.js, Luxon, date-fns) that reads `Intl` internally. It does **not** change your OS clock.

### How to Set It

1. Expand the **Timezone** section.
2. Start typing in the search box (e.g., "Tokyo") or type the full IANA string (e.g., `Asia/Tokyo`).
3. Select the matching entry.
4. Reload the page — some frameworks cache the timezone at startup, so a reload is required for full effect.

### Common IANA Timezone Strings

| City | IANA string | UTC offset (standard) |
|---|---|---|
| New York | `America/New_York` | UTC-5 |
| Los Angeles | `America/Los_Angeles` | UTC-8 |
| London | `Europe/London` | UTC+0 |
| Paris | `Europe/Paris` | UTC+1 |
| Dubai | `Asia/Dubai` | UTC+4 |
| Kolkata | `Asia/Kolkata` | UTC+5:30 |
| Singapore | `Asia/Singapore` | UTC+8 |
| Tokyo | `Asia/Tokyo` | UTC+9 |
| Sydney | `Australia/Sydney` | UTC+10 |

### Code That Respects the Override

```js
// Date formatting — uses the overridden timezone
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // reads override
  dateStyle: 'full',
  timeStyle: 'long',
});
console.log(formatter.format(new Date()));
// Example output when Tokyo is overridden:
// "Monday, July 28, 2026 at 10:30:00 AM JST"

// Explicit timezone (always uses what you specify, unaffected by override)
const explicit = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' });

// Reading the current timezone programmatically
console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
// Returns "Asia/Tokyo" when the override is active

// Date arithmetic still works in local (overridden) time
const now = new Date();
console.log(now.toLocaleString()); // local string in overridden zone
console.log(now.toISOString());    // always UTC — not affected by override
```

### DST Edge Case Testing

Daylight Saving Time transitions cause midnight-hour bugs (2:00 AM becomes 3:00 AM or vice versa). To test:

1. Set the Timezone override to `America/New_York`.
2. In the Console, construct a Date at a DST boundary:

```js
// Spring forward: 2026-03-08 02:00 AM EST becomes 03:00 AM EDT
const dstEdge = new Date('2026-03-08T07:00:00Z'); // 02:00 EST = 07:00 UTC
console.log(dstEdge.toLocaleString('en-US', { timeZone: 'America/New_York' }));
// Verify your UI handles the "missing hour" gracefully

// Fall back: 2026-11-01 02:00 AM EDT becomes 01:00 AM EST
const fallBack = new Date('2026-11-01T06:00:00Z'); // 02:00 EDT = 06:00 UTC
console.log(fallBack.toLocaleString('en-US', { timeZone: 'America/New_York' }));
```

3. Check that calendars, schedulers, and relative time labels (`"2 hours ago"`, `"tomorrow"`) display correctly.

### Use Cases

- **Scheduling SaaS** — a meeting booked at "3 PM" in New York should display "8 AM" when viewed in Los Angeles.
- **Banking / finance** — market open/close times vary by timezone; verify correct labels.
- **Expiry countdowns** — "Offer expires in 2 hours" must use the correct local time.
- **Date pickers** — calendar widgets that highlight "today" must stay accurate across the International Date Line.

---

## 6. Locale Override

### What It Does

The Locale override changes `navigator.language` and influences how `Intl` APIs format numbers, currencies, dates, and strings for the current tab. It does **not** change the browser's UI language.

### How to Set It

1. Expand the **Locale** section.
2. Type a BCP 47 language tag in the input (e.g., `de-DE`, `ja-JP`, `ar-SA`).
3. Values take effect immediately for new `Intl` object constructions; reload for cached results.

### Common Language Tags

| Language | Tag | Numeric format example |
|---|---|---|
| US English | `en-US` | 1,234,567.89 |
| German | `de-DE` | 1.234.567,89 |
| French | `fr-FR` | 1 234 567,89 |
| Japanese | `ja-JP` | 1,234,567.89 |
| Arabic (Egypt) | `ar-EG` | ١٬٢٣٤٬٥٦٧٫٨٩ |
| Hindi | `hi-IN` | 12,34,567.89 |

### Code That Respects the Override

```js
// navigator.language returns the overridden value
console.log(navigator.language); // e.g., "de-DE" when overridden

// Intl.NumberFormat picks up the navigator.language default
const num = new Intl.NumberFormat().format(1234567.89);
console.log(num); // "1.234.567,89" for de-DE

// Currency formatting
const price = new Intl.NumberFormat(navigator.language, {
  style: 'currency',
  currency: 'EUR',
}).format(9.99);
console.log(price); // "9,99 €" for de-DE vs "€9.99" for en-US

// Date formatting
const date = new Intl.DateTimeFormat(navigator.language, {
  dateStyle: 'full',
}).format(new Date());
console.log(date);
// "Montag, 28. Juli 2026" for de-DE
// "2026年7月28日月曜日" for ja-JP

// Collation (locale-aware string sorting)
const cities = ['Zürich', 'Amsterdam', 'Oslo', 'Ålesund'];
const sorted = cities.sort(new Intl.Collator(navigator.language).compare);
console.log(sorted);
// Correct alphabetical order for the active locale

// Plural rules
const pr = new Intl.PluralRules(navigator.language);
[0, 1, 2, 5, 11].forEach(n => {
  console.log(`${n}: ${pr.select(n)}`); // "one", "other", "few", etc.
});
```

### Use Cases

- **i18n smoke test** — quickly switch between `en-US`, `de-DE`, `ar-SA` without browser reinstall.
- **RTL layout** — Arabic (`ar-SA`) and Hebrew (`he-IL`) trigger right-to-left layouts; confirm your CSS handles `dir="rtl"`.
- **Currency symbol placement** — "€ 9.99" vs "9.99 €" depends on locale; verify your checkout UI.
- **Plural forms** — Russian has four plural forms; Polish has three; testing with `pl-PL` uncovers missing copy.

---

## 7. Hardware Concurrency Override

### What It Is

`navigator.hardwareConcurrency` reports the number of logical CPU cores available. Web workers and compute-heavy apps use it to decide how many parallel threads to spawn. A machine with 16 cores will spawn far more workers than a budget phone with 2 — leading to very different performance characteristics.

### How to Set It

1. Expand the **Hardware Concurrency** section.
2. Use the slider or type a value (1–32).

### Code Reference

```js
// Read the (possibly overridden) value
const cores = navigator.hardwareConcurrency;
console.log(`Spawning ${cores} workers`);

// Typical thread pool pattern
const workerPool = Array.from({ length: cores }, () =>
  new Worker('worker.js')
);

// Adaptive algorithm example
function chunkArray(arr, cores) {
  const chunkSize = Math.ceil(arr.length / cores);
  return Array.from({ length: cores }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
}

const data = Array.from({ length: 1_000_000 }, (_, i) => i);
const chunks = chunkArray(data, navigator.hardwareConcurrency);
```

### Use Cases

- Set to **1** to simulate a single-core device; confirm your app does not hang the main thread.
- Set to **2** to match low-end Android phones.
- Set to **16** or **32** to verify worker pool sizing does not create thousands of threads on powerful machines.

---

## 8. Prefers-color-scheme Override

### What It Is

The `prefers-color-scheme` CSS media query and `window.matchMedia('(prefers-color-scheme: dark)')` JS API reflect the OS-level light/dark preference. The Sensors panel (and also the **Rendering** panel) lets you force either value without changing your OS theme.

### How to Set It

**Via Sensors panel:**
1. Expand the **Prefers-color-scheme** section.
2. Select **Light**, **Dark**, or **No override**.

**Via Rendering panel (alternative, more visibility):**
1. Open the Rendering panel via More Tools > Rendering.
2. Find **Emulate CSS media feature prefers-color-scheme**.
3. Select `prefers-color-scheme: dark` or `light`.

### Code Reference

```js
// JS: read the current effective value
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
console.log('Dark mode:', isDark);

// React to changes dynamically
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (e.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
```

```css
/* CSS: standard media query */
body {
  background: #ffffff;
  color: #000000;
}

@media (prefers-color-scheme: dark) {
  body {
    background: #121212;
    color: #e0e0e0;
  }
}
```

### Use Cases

- Toggle rapidly between light and dark to catch contrast issues.
- Verify that custom `color-scheme` values in CSS custom properties update correctly.
- Test third-party chart or map embeds that may not respect the host page's theme.

---

## 9. Device Memory Override

### What It Is

`navigator.deviceMemory` returns an approximate amount of device RAM in gigabytes, rounded to the nearest power of two (0.25, 0.5, 1, 2, 4, 8). Applications use it to downscale image quality, disable animations, or reduce data loading on low-memory devices.

### How to Set It

1. Expand the **Device Memory** section.
2. Pick a value from the dropdown: 0.25, 0.5, 1, 2, 4, or 8 GB.

### Code Reference

```js
// Read device memory (returns rounded GiB value)
const memoryGiB = navigator.deviceMemory; // e.g., 0.25, 0.5, 1, 2, 4, 8

// Adaptive loading pattern
function getImageQuality() {
  if (navigator.deviceMemory <= 0.5) return 'low';    // 512 MB or less
  if (navigator.deviceMemory <= 2)   return 'medium'; // up to 2 GB
  return 'high';
}

// Disable heavy features on constrained devices
if (navigator.deviceMemory < 1) {
  console.log('Low-memory device: disabling particle effects');
  particleSystem.disable();
}

// React Server Components / adaptive serving pattern
const quality = getImageQuality();
const imgSrc = `/images/hero-${quality}.webp`;
```

### Use Cases

- Set to **0.25** to verify your app degrades gracefully on Android Go devices with 512 MB RAM.
- Confirm lazy-loading thresholds activate at the right breakpoints.
- Validate that your adaptive bitrate video logic picks the correct quality tier.

---

## 10. Practical Use Cases End-to-End

### Use Case 1 — Food Delivery App with Multiple Cities

Goal: Verify that restaurant lists, currency, and language change correctly as users move between cities.

Steps:
1. Open the app.
2. Set **Location** to "São Paulo" — verify Brazilian restaurants appear, price in BRL.
3. Set **Timezone** to `America/Sao_Paulo` — verify delivery time windows use the correct offset.
4. Set **Locale** to `pt-BR` — verify currency symbol (`R$`) and date format (`DD/MM/YYYY`).
5. Switch **Location** to "Tokyo", **Timezone** to `Asia/Tokyo`, **Locale** to `ja-JP` — verify completely different restaurant set, JPY prices, and 24-hour time format.
6. Set **Location** to **Permission denied** — verify the app falls back to a city-selection screen rather than crashing.

### Use Case 2 — Tilt-Controlled Game

Goal: Test that the character moves correctly in all four tilt directions and that extreme angles do not cause bugs.

Steps:
1. Open the game.
2. Enable touch simulation via Device Mode.
3. Set **Orientation** to Custom, Gamma = `+30°` — character should move right.
4. Set Gamma = `-30°` — character should move left.
5. Set Beta = `+30°` — character should accelerate forward.
6. Set Beta = `-30°` — character should brake.
7. Set all angles to `0°` — character should return to neutral.
8. Try extreme values (Gamma = `±90°`) — verify no divide-by-zero or NaN in physics calculations.

### Use Case 3 — i18n Across Timezones

Goal: Ensure a calendar-based scheduling tool shows correct dates and times for every user's locale.

Steps:
1. Create a meeting at `2026-07-28 15:00 UTC`.
2. Set **Timezone** to `America/New_York` — verify it shows "11:00 AM EDT".
3. Set **Timezone** to `Asia/Kolkata` — verify it shows "8:30 PM IST" (half-hour offset).
4. Set **Timezone** to `Pacific/Auckland` — verify it shows "3:00 AM NZST (July 29)" — next calendar day.
5. Set **Locale** to `en-US`, `de-DE`, `ja-JP` in turn — verify date ordering (MM/DD vs DD.MM vs YYYY/MM/DD).
6. Check DST boundary: set `America/New_York`, then construct a date at the spring-forward boundary in the Console.

### Use Case 4 — Idle Timeout Session Security

Goal: Confirm that an authenticated dashboard logs out users who go idle.

Steps:
1. Log in to the application.
2. In the **Idle Detection** section, select **Idle**.
3. Verify that a "Your session is about to expire" warning appears within the timeout threshold.
4. Click the warning's "Keep me logged in" button; the session should reset.
5. Select **Locked** — verify the session terminates and the login page appears.
6. Select **Active** — verify the state is correctly reported as active (no false positives).

---

## 11. Integration with Device Mode for Full Mobile Simulation

The Sensors panel works best in combination with Device Mode for a complete mobile simulation:

| Tool | What it contributes |
|---|---|
| **Device Mode toolbar** | Viewport size, pixel density (DPR), user-agent string |
| **Device Mode network** | Throttled bandwidth (3G, offline) |
| **Sensors — Location** | GPS coordinates |
| **Sensors — Orientation** | Gyroscope / accelerometer data |
| **Sensors — Touch** | Touch event dispatching |
| **Sensors — Timezone** | Local time for the simulated region |
| **Sensors — Locale** | Language and number formatting |
| **Sensors — Device Memory** | RAM-based adaptive loading |
| **Sensors — Hardware Concurrency** | CPU-based worker scaling |

### Full Mobile Simulation Workflow

```
1. Cmd+Shift+M  →  Enable Device Mode
2. Device preset dropdown  →  "iPhone 14 Pro" (or a custom size)
3. Network throttle  →  "Fast 3G"
4. Sensors > Location  →  "Tokyo"
5. Sensors > Timezone  →  "Asia/Tokyo"
6. Sensors > Locale  →  "ja-JP"
7. Sensors > Orientation  →  Custom angles for tilt testing
8. Sensors > Device Memory  →  "2" (GB — matches typical mid-range phone)
9. Sensors > Hardware Concurrency  →  "4"
10. Reload the page
```

With all overrides active, your desktop Chrome behaves as if a Japanese user in Tokyo is accessing your site on a mid-range iPhone on a 3G connection — without needing that device, that location, or that network.

### Persisting a Sensor Profile

DevTools does not have a built-in "save all sensor overrides as a profile" feature, but you can script a setup in the Console and paste it at the start of each session:

```js
// Run in Console to verify all relevant navigator properties
// after applying Sensors panel overrides
(function auditSensorOverrides() {
  const report = {
    geolocation: 'Use getCurrentPosition() to verify',
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    touchPoints: navigator.maxTouchPoints,
  };
  console.table(report);
})();
```

---

## Quick Reference — All Overrides at a Glance

| Section | Key field(s) | No-override default | Reloading required? |
|---|---|---|---|
| Location | Lat, Long, preset | Real GPS / IP | No |
| Orientation | Alpha, Beta, Gamma | Real gyroscope | No |
| Touch | Force enabled | Mouse events only | No |
| Idle Detection | User state, Screen state | Real idle detection | No |
| Timezone | IANA string | OS timezone | Yes (for some apps) |
| Locale | BCP 47 tag | Browser language | Yes (for some apps) |
| Hardware Concurrency | 1–32 | Real CPU core count | Yes (for some apps) |
| Prefers-color-scheme | Light / Dark | OS theme | No |
| Device Memory | 0.25–8 GiB | Real RAM | Yes (for some apps) |

---

## Troubleshooting

**Override does not seem to take effect**
- Reload the page after applying Timezone, Locale, Hardware Concurrency, or Device Memory overrides — some values are read at startup.
- Confirm the blue dot appears next to the section name, indicating an active override.

**`IdleDetector` throws `NotAllowedError`**
- The API requires a user gesture and explicit permission. Run `await IdleDetector.requestPermission()` in the Console first.

**`deviceorientation` events do not fire**
- On HTTPS pages in Chrome 91+, no permission is required on desktop. On localhost, ensure the page is served over `http://localhost` or `https://`.
- Some frameworks strip the listener if `window.DeviceOrientationEvent` is undefined — the DevTools override adds the event but not the constructor; add a guard: `if (window.DeviceOrientationEvent) { ... }`.

**Touch simulation not working after closing Device Mode**
- The "Force enabled" toggle in the Sensors panel is independent of Device Mode. Check that it is still set to **Force enabled** after toggling Device Mode off.

**Geolocation permission prompt appears even with "Permission denied" override**
- The override bypasses permission at the API level, but the browser's permission UI may still appear the first time `getCurrentPosition` is called. The override fires the error callback regardless of what the user clicks.

**Custom location not saving between DevTools sessions**
- Custom locations are saved in Chrome's DevTools settings, which are tied to your Chrome profile. If you use multiple profiles or a fresh Incognito window, you will need to re-add them.

---

[← Web Devtools](/coding/web-devtools/)
