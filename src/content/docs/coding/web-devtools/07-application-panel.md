---
title: 07 Application Panel
---

# Chrome DevTools — Application Panel

A complete beginner-to-advanced reference for inspecting, debugging, and managing everything a web app stores on the client: manifests, service workers, all storage APIs, cookies, caches, background services, and frames.

---

## What the Application Panel Does

The Application panel is your single pane of glass for the client-side infrastructure of a web application. It surfaces every resource the browser persists or manages on behalf of your origin, including:

- The **Web App Manifest** and PWA installability diagnostics
- **Service Worker** registration, lifecycle, and event simulation
- Every **storage API**: Local Storage, Session Storage, IndexedDB, Cookies, Cache Storage
- **Background services**: bfcache, Background Fetch, Background Sync, Push Messaging, Reporting API
- A **Frames** tree listing every document, script, stylesheet, font, and image loaded by each browsing context

Open it with `F12` (or `Cmd+Option+I` on macOS) then click the **Application** tab. In Chrome 114+ some sub-sections were reorganised under collapsible headings; the structure below reflects the current grouping.

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DevTools — Application Panel                                               │
├─────────────────────────┬───────────────────────────────────────────────────┤
│  LEFT NAV TREE          │  MAIN CONTENT AREA                                │
│                         │                                                   │
│  ▼ Application          │  (changes based on selected left-nav item)        │
│      Manifest           │                                                   │
│      Service Workers    │  ┌───────────────────────────────────────────┐   │
│      Storage            │  │  Key / Name       Value / Details         │   │
│                         │  │  ─────────────    ──────────────────────  │   │
│  ▼ Storage              │  │  row 1            value 1                 │   │
│      Local Storage      │  │  row 2            value 2                 │   │
│        ► https://…      │  │  …                …                       │   │
│      Session Storage    │  └───────────────────────────────────────────┘   │
│        ► https://…      │                                                   │
│      IndexedDB          │  Action buttons (clear, refresh, add, delete)     │
│        ► mydb           │  appear in the toolbar above the content area.    │
│      Web SQL (legacy)   │                                                   │
│      Cookies            │                                                   │
│        ► https://…      │                                                   │
│      Cache Storage      │                                                   │
│        ► cache-v1       │                                                   │
│      Private State…     │                                                   │
│      Interest Groups    │                                                   │
│                         │                                                   │
│  ▼ Background Services  │                                                   │
│      Back/Forward Cache │                                                   │
│      Background Fetch   │                                                   │
│      Background Sync    │                                                   │
│      Bounce Tracking…   │                                                   │
│      Notifications      │                                                   │
│      Payment Handler    │                                                   │
│      Periodic BG Sync   │                                                   │
│      Push Messaging     │                                                   │
│      Reporting API      │                                                   │
│      Speculation Rules  │                                                   │
│                         │                                                   │
│  ▼ Frames               │                                                   │
│      top                │                                                   │
│        ► Scripts        │                                                   │
│        ► Stylesheets    │                                                   │
│        ► Fonts          │                                                   │
│        ► Images         │                                                   │
│        ► iframes        │                                                   │
└─────────────────────────┴───────────────────────────────────────────────────┘
```

---

## Application Section

### Web App Manifest

The manifest is a JSON file linked from your HTML with:

```html
<link rel="manifest" href="/manifest.json" />
```

DevTools parses it and shows every field inline along with computed icon previews and a live installability checklist. Click **Manifest** in the left nav.

#### All Manifest Fields

```json
{
  "name": "My Awesome App",
  "short_name": "AwesomeApp",
  "description": "A sample PWA demonstrating all manifest fields.",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/?source=pwa",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1a73e8",
  "background_color": "#ffffff",
  "shortcuts": [
    {
      "name": "New Task",
      "short_name": "New",
      "description": "Create a new task",
      "url": "/new-task?source=pwa",
      "icons": [{ "src": "/icons/new-task.png", "sizes": "96x96" }]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Home screen on desktop"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Home screen on mobile"
    }
  ]
}
```

| Field              | Purpose                                                                              | Notes                                                              |
|--------------------|--------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| `name`             | Full app name shown in splash screens and app stores                                 | Required for install prompt                                        |
| `short_name`       | Truncated name used on home screen icons where space is limited                      | Keep under 12 characters                                           |
| `description`      | App store / OS description                                                            | Optional but improves discoverability                              |
| `icons`            | Array of images at various resolutions                                               | Must include 192x192 and 512x512 for Chrome install               |
| `icons[].purpose`  | `any` = normal use, `maskable` = safe-zone icon, `monochrome` = tinted icon          | At least one maskable icon prevents white boxes on Android         |
| `start_url`        | URL opened when launched from home screen                                             | Add UTM params to track PWA traffic                                |
| `display`          | `fullscreen`, `standalone`, `minimal-ui`, `browser`                                  | `standalone` hides browser chrome, giving native-app feel          |
| `orientation`      | Preferred screen orientation (`any`, `portrait`, `landscape`, etc.)                   | OS may ignore if user has auto-rotate enabled                      |
| `theme_color`      | Colors the browser toolbar and task switcher                                          | Must match `<meta name="theme-color">` in HTML                     |
| `background_color` | Splash screen background before first paint                                           | Should match CSS `background-color` of shell                       |
| `shortcuts`        | Jump to app sub-pages from the OS long-press / right-click menu                       | Up to 10; icon recommended at 96x96                                |
| `screenshots`      | Store listing screenshots (Chrome 111+ for richer install UI)                         | `form_factor`: `wide` = desktop, `narrow` = mobile                |

#### Installability Requirements and Errors

DevTools shows a green checkmark or a red warning for each criterion:

1. Served over **HTTPS** (or `localhost`)
2. A valid **manifest** with `name` or `short_name`, `start_url`, and icons (192x192 + 512x512)
3. A **registered Service Worker** with a fetch event handler
4. The page has not already been installed

Common errors shown in DevTools:

| Error Message                                          | Fix                                                                        |
|--------------------------------------------------------|----------------------------------------------------------------------------|
| "Page is not served from a secure origin"              | Serve over HTTPS or test on localhost                                      |
| "Site cannot be installed: no matching service worker" | Register a service worker with a `fetch` handler                           |
| "Could not download a required resource"               | Check the manifest URL returns 200 with `Content-Type: application/json`   |
| "Icons array is missing a suitable icon"               | Add 192x192 and 512x512 PNG icons                                          |
| "start_url does not respond with a 200 when offline"   | Pre-cache start_url in the service worker install event                    |
| "Manifest does not contain a maskable icon"            | Add a maskable icon to improve Android home screen rendering               |

---

### Service Workers

A service worker is a JavaScript file that runs in a background thread, acting as a programmable network proxy and enabling offline support, push notifications, and background sync.

#### Lifecycle Diagram

```
  navigator.serviceWorker.register('/sw.js')
                │
                ▼
         ┌─────────────┐
         │  installing  │  ← sw.js downloaded, install event fires
         └──────┬──────┘    (pre-cache assets here)
                │  install event resolved
                ▼
         ┌─────────────┐
         │   waiting   │  ← old SW still controlling the page;
         └──────┬──────┘    new SW queued until all tabs close
                │  skipWaiting() called OR all clients released
                ▼
         ┌─────────────┐
         │  activated  │  ← activate event fires (clean up old caches);
         └──────┬──────┘    now controls all pages
                │  new version detected
                ▼
         ┌─────────────┐
         │  redundant  │  ← replaced by newer SW or install/activate failed
         └─────────────┘
```

#### Basic Service Worker Registration

```javascript
// In your main JavaScript bundle
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'           // optional; defaults to directory of sw.js
      });

      console.log('SW registered, scope:', registration.scope);

      // Check if a new SW is waiting
      if (registration.waiting) {
        console.log('New SW waiting — prompt user to update');
      }

      // Listen for future updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          console.log('SW state changed to:', newWorker.state);
        });
      });

    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}
```

```javascript
// sw.js — minimal service worker skeleton
const CACHE_NAME = 'app-v1';
const PRECACHE_URLS = ['/', '/index.html', '/app.js', '/app.css'];

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())  // activate immediately
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // take control of all open pages
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
```

#### DevTools Controls for Service Workers

| Control                  | What it does                                                                          |
|--------------------------|---------------------------------------------------------------------------------------|
| **Offline** checkbox     | Simulates network loss; tests offline fallback routes                                  |
| **Update on reload**     | Forces the browser to bypass the 24-hour HTTP cache check on every page reload        |
| **Bypass for network**   | Makes all fetch requests go directly to the network, skipping the SW fetch handler    |
| **Update** button        | Manually triggers an update check (equivalent to calling `registration.update()`)     |
| **Unregister** link      | Permanently unregisters the service worker for this scope                             |
| **Push** button          | Sends a fake push event to the SW for testing push notification handlers               |
| **Sync** button          | Fires a fake `sync` event to the SW for testing Background Sync logic                 |

#### Debugging Update and Install Issues

1. **SW stuck in "waiting"**: The old SW is still controlling a tab. Enable **Update on reload** or call `self.skipWaiting()` in the install handler. In production, prompt the user: "New version available — click to update."

2. **Install event never fires**: Check the Console for a JavaScript parse error in `sw.js`. Even a trailing comma in older environments blocks registration.

3. **Fetch handler not intercepting requests**: Verify the SW `scope` covers the request URL. A SW at `/app/sw.js` with scope `/app/` will not intercept requests to `/api/`.

4. **Activation blocked**: Remove `self.clients.claim()` temporarily to see if old SW is blocking. Also ensure `activate` `event.waitUntil()` resolves without errors.

5. **HTTP cache stale SW**: Set `Cache-Control: no-cache` on the SW script itself in your server config:
   ```
   Cache-Control: no-cache, no-store, must-revalidate
   ```

#### Push and Sync Events

```javascript
// In sw.js — handling push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-pending-messages') {
    event.waitUntil(sendPendingMessages());
  }
});

async function sendPendingMessages() {
  // Read pending messages from IndexedDB, POST them, then clear
}
```

---

### Storage — Usage Bar and Clear Site Data

The **Storage** sub-item (directly under "Application" heading) shows:

- A horizontal bar chart of storage usage by type (Local Storage, IndexedDB, Cache Storage, Service Workers)
- The **Usage quota** granted by the browser (varies by device, typically 60% of available disk space)
- A **Clear site data** button that wipes Local Storage, Session Storage, IndexedDB, Cache Storage, Cookies, and unregisters service workers in one click

Use **Clear site data** when you want a completely clean slate during development. In production, warn users before wiping storage (e.g., on logout).

---

## Storage Types — Each in Full Detail

### Local Storage

Local Storage stores string key-value pairs that persist indefinitely (until explicitly cleared or the user clears browser data). It is scoped to the **origin** (scheme + host + port).

#### Viewing and Editing in DevTools

1. Expand **Local Storage** in the left nav and click your origin.
2. The main pane shows a two-column table: **Key** and **Value**.
3. To **add** an entry: click the blank row at the bottom, type a key, press Tab, type a value, press Enter.
4. To **edit**: double-click any cell, change the value, press Enter.
5. To **delete**: select a row and press the Delete key, or click the crossed-circle icon.
6. To **clear all**: click the no-entry icon in the toolbar.

#### Key Properties

| Property         | Detail                                                                     |
|------------------|----------------------------------------------------------------------------|
| Capacity         | 5 MB per origin (varies slightly by browser; Chrome enforces ~5 MB)        |
| Persistence      | Survives page refresh, tab close, browser restart                           |
| API type         | Synchronous — blocks the main thread on each call                           |
| Worker access    | Not available in Service Workers or Web Workers                             |
| Serialisation    | Strings only; use `JSON.stringify` / `JSON.parse` for objects               |

```javascript
// Basic API
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');   // 'dark'
localStorage.removeItem('theme');
localStorage.clear();

// Storing objects
localStorage.setItem('user', JSON.stringify({ id: 42, name: 'Alice' }));
const user = JSON.parse(localStorage.getItem('user'));
```

#### Use Cases and Anti-patterns

Good uses: user preferences (theme, language), simple feature flags, non-sensitive caching of small strings.

Anti-patterns:
- Storing sensitive data (tokens, PII) — localStorage is readable by any JS on the page including XSS-injected scripts
- Storing large data — use IndexedDB instead
- Using it as a cross-tab message bus — use `BroadcastChannel` or `storage` events instead
- Synchronous calls in tight loops — will cause jank

---

### Session Storage

Session Storage has an identical API to Local Storage but is **tab-scoped**: each tab gets its own isolated store that is cleared when the tab closes.

```javascript
sessionStorage.setItem('wizardStep', '3');
const step = sessionStorage.getItem('wizardStep');
sessionStorage.removeItem('wizardStep');
sessionStorage.clear();
```

| Difference from localStorage | Detail                                                                   |
|------------------------------|--------------------------------------------------------------------------|
| Scope                        | Per-tab (not shared across tabs of the same origin)                       |
| Persistence                  | Cleared on tab close (not on page refresh)                                |
| Duplication on tab fork      | Opening a tab via `Ctrl+T` from an existing tab copies its sessionStorage |

Good uses: multi-step form wizard state, one-session shopping cart, per-tab view state.

---

### IndexedDB

IndexedDB is a transactional, object-oriented database built into the browser. It supports large amounts of structured data, binary data (Blobs, ArrayBuffers), indexes for efficient querying, and is available in service workers.

#### Structure

```
Database (name + version)
└── Object Store (like a SQL table; has a key path or key generator)
    ├── Record { key: 1, value: { id: 1, title: "Buy milk", done: false } }
    ├── Record { key: 2, value: { id: 2, title: "Walk dog", done: true  } }
    └── Index "by_done" on the "done" property
            └── Enables fast lookups by done value
```

#### Browsing IndexedDB in DevTools

1. Expand **IndexedDB** in the left nav.
2. Expand a database node to see its object stores.
3. Click an object store to see all records in a table view.
4. Click a record row to expand its full value in the preview panel below.
5. To **refresh** (IndexedDB data is not live-updating): click the circular-arrow refresh icon.
6. To **delete a record**: select the row and press Delete.
7. To **delete a database**: right-click the database node and choose "Delete database".

DevTools also shows:
- **Key path**: the property used as the record's primary key
- **Auto increment**: whether keys are generated automatically
- **Indexes**: all secondary indexes with their key paths and uniqueness constraints

#### IndexedDB CRUD API

```javascript
// ── Opening a database ──────────────────────────────────────────────────────
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    // onupgradeneeded fires when creating the DB or bumping the version
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create an object store if it doesn't exist
      if (!db.objectStoreNames.contains('tasks')) {
        const store = db.createObjectStore('tasks', {
          keyPath: 'id',
          autoIncrement: true
        });
        // Create a secondary index on the "done" property
        store.createIndex('by_done', 'done', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror  = (event) => reject(event.target.error);
  });
}

// ── Create ──────────────────────────────────────────────────────────────────
async function addTask(db, task) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const req   = store.add(task);  // { title: 'Buy milk', done: false }
    req.onsuccess = () => resolve(req.result);  // returns generated key
    req.onerror   = () => reject(req.error);
  });
}

// ── Read (single record) ─────────────────────────────────────────────────────
async function getTask(db, id) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const req   = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── Read all records ─────────────────────────────────────────────────────────
async function getAllTasks(db) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const req   = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── Read by index ─────────────────────────────────────────────────────────────
async function getTasksByDone(db, done) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('tasks', 'readonly');
    const index = tx.objectStore('tasks').index('by_done');
    const req   = index.getAll(IDBKeyRange.only(done));
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── Update ──────────────────────────────────────────────────────────────────
async function updateTask(db, task) {  // task must include the key (id)
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const req   = store.put(task);  // put = insert or replace
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── Delete ──────────────────────────────────────────────────────────────────
async function deleteTask(db, id) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const req   = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// ── Usage example ────────────────────────────────────────────────────────────
(async () => {
  const db  = await openDB('todo-app', 1);
  const id  = await addTask(db, { title: 'Buy milk', done: false });
  console.log('Created task with id:', id);

  const task = await getTask(db, id);
  task.done  = true;
  await updateTask(db, task);
  console.log('Marked done:', task);

  const pending = await getTasksByDone(db, false);
  console.log('Pending tasks:', pending);

  await deleteTask(db, id);
  console.log('Deleted task', id);
})();
```

#### Use Cases

| Scenario                         | Reason IndexedDB fits                                               |
|----------------------------------|---------------------------------------------------------------------|
| Offline-first apps               | Persist large datasets; sync when online via Background Sync        |
| Document editors                 | Store revisions, attachments (Blobs), undo history                  |
| Large structured data            | No 5 MB cap; quota determined by available disk space               |
| Worker-accessible storage        | Available in service workers (localStorage is not)                  |
| Complex queries                  | Indexes enable efficient range queries and sorted cursors            |

---

### Cookies — Deep Dive

Cookies are name-value pairs attached to HTTP requests and set via `Set-Cookie` response headers or `document.cookie`. DevTools shows every cookie for the current origin in a rich table.

#### All Cookie Attributes

| Attribute         | Description                                                                                   | Security Impact                                                              |
|-------------------|-----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| **Name**          | Cookie identifier                                                                             | Cookie names starting with `__Secure-` require Secure flag; `__Host-` requires Secure + no Domain + Path=/ |
| **Value**         | Cookie data (URL-encoded string)                                                              | Never store sensitive plaintext; prefer opaque session IDs                   |
| **Domain**        | Hosts to which cookie is sent (e.g. `.example.com` includes all subdomains)                   | Broad domains increase the attack surface; prefer exact-host cookies          |
| **Path**          | URL path prefix required for cookie to be sent                                                | Limiting path reduces unintended transmission to other app sections           |
| **Expires / Max-Age** | Expiry as an absolute date or relative seconds; absent = session cookie                  | Session cookies are deleted on browser close; persistent cookies survive      |
| **Size**          | Total byte count of name + value                                                              | Browsers enforce 4 KB per cookie; large cookies bloat every HTTP request      |
| **HttpOnly**      | `true` = inaccessible via `document.cookie`; only sent over HTTP                              | Prevents JavaScript (including XSS) from reading the cookie                  |
| **Secure**        | `true` = only sent over HTTPS connections                                                     | Prevents credential theft on mixed or HTTP connections                        |
| **SameSite**      | `None` / `Lax` / `Strict` — controls cross-site sending                                       | See table below; `Lax` is now the browser default                            |
| **Priority**      | `Low` / `Medium` / `High` — Chrome hint for which cookies to evict when near limits           | Not a security attribute; affects cookie eviction order                       |
| **Partition Key (CHIPS)** | Origin of the top-level frame for partitioned cookies                                | Enables third-party cookies in iframes without cross-site tracking            |

#### SameSite Values

| Value    | When the cookie is sent                                                                     | Typical use                                    |
|----------|---------------------------------------------------------------------------------------------|------------------------------------------------|
| `Strict` | Only on same-site requests (never cross-site, even for top-level navigation)                | Session cookies for banking or high-security apps |
| `Lax`    | On same-site requests AND cross-site top-level navigation (GET links, redirects)            | Default since Chrome 80; suitable for most apps |
| `None`   | All requests, including cross-site (third-party iframes, XHR, fetch)                        | Must also set `Secure`; required for embed use cases |

```
// Setting cookie attributes via Set-Cookie header
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600

// Setting a partitioned (CHIPS) cookie
Set-Cookie: tracker=xyz; SameSite=None; Secure; Partitioned
```

#### Creating, Editing, and Deleting Cookies in DevTools

1. Navigate to **Cookies** in the left nav and select your origin.
2. **Add** a cookie: click the blank row at the bottom, fill in Name and Value, tab through columns to set Domain/Path/Expires.
3. **Edit** any field: double-click the cell.
4. **Toggle** HttpOnly / Secure / SameSite: double-click the respective cell and type the value.
5. **Delete** a cookie: select the row and press the Delete key or click the crossed-circle.
6. **Filter** cookies: use the search field above the table to filter by name.
7. **Delete all**: click the "Clear all cookies" icon (crossed-circle without a row selected).

#### Third-Party Cookies and SameSite

Chrome is deprecating third-party cookies. Implications:

- Cookies without `SameSite=None; Secure` are not sent in cross-site iframe or fetch contexts.
- DevTools shows a warning icon in the cookie row when a cookie will be blocked.
- Use **CHIPS** (`Partitioned` attribute) to allow cookies in iframes without cross-site tracking.
- Test third-party cookie blocking by enabling "Third-party cookies" blocking in Chrome Settings > Privacy and Security.

---

### Cache Storage

Cache Storage is a key-value store managed by service workers where the keys are `Request` objects and the values are `Response` objects. It enables fine-grained control over what is cached and how.

#### Browsing Cache Storage in DevTools

1. Expand **Cache Storage** in the left nav; each named cache appears as a child node.
2. Click a cache to see a table of cached URLs.
3. Click a URL row to see the **Response Headers** and **Response body** preview in the right pane.
4. To **delete a single entry**: select a row and press Delete.
5. To **delete an entire cache**: right-click the cache node and choose "Delete".

#### Service Worker Cache API

```javascript
// Opening or creating a named cache
const cache = await caches.open('assets-v2');

// Adding individual requests
await cache.add('/app.js');                                // fetch + store
await cache.addAll(['/index.html', '/app.css', '/logo.png']);  // batch

// Storing an arbitrary response (e.g., after a network fetch)
const response = await fetch('/api/config');
await cache.put('/api/config', response);

// Reading from the cache
const cachedResponse = await caches.match('/app.js');  // searches all caches
const specific       = await cache.match('/app.js');   // searches only 'assets-v2'

// Deleting a single entry
await cache.delete('/old-app.js');

// Listing all cache names
const cacheNames = await caches.keys();
// ['assets-v1', 'assets-v2', 'runtime-cache']

// Deleting an entire cache
await caches.delete('assets-v1');
```

---

### Private State Tokens and Interest Groups (Privacy Sandbox)

**Private State Tokens** (formerly Trust Tokens) allow servers to convey trust signals (e.g., "this is a real user") to third-party origins without sharing identifying information. DevTools shows tokens issued by origins and their redemption records.

**Interest Groups** are part of the Protected Audience API (formerly FLEDGE). Advertisers add users to interest groups; these are stored locally and used for on-device ad auctions. DevTools lists all interest groups stored for the current device along with their owner, bidding logic URL, and expiry.

These panels are primarily relevant for ad-tech debugging and Privacy Sandbox API development.

---

## Background Services

Background Services panels let you record events that fire even when DevTools is not open. Click **Start recording** to begin capturing, then reproduce the scenario.

### Back/Forward Cache (bfcache)

The bfcache is a browser optimisation that keeps a full snapshot of a page (including JS heap) in memory when navigating away, enabling instant back/forward navigation.

#### Testing bfcache Eligibility

1. Open DevTools > Application > **Back/Forward Cache**.
2. Click **Test back/forward cache**.
3. Chrome navigates away and back, then reports either:
   - "Successfully served from back/forward cache" (green)
   - A list of **NotRestoredReasons** (red) with explanations

#### Common bfcache Blockers

| Blocker                               | Fix                                                                                  |
|---------------------------------------|--------------------------------------------------------------------------------------|
| `unload` event listener               | Replace with `pagehide` event; `unload` blocks bfcache in all browsers               |
| `Cache-Control: no-store` header      | Avoid `no-store` for navigation responses; use `no-cache` with ETags instead         |
| Open IndexedDB connection             | Close connections in `pagehide` when `event.persisted` is false                      |
| `beforeunload` listener               | Remove if not needed; if needed, add/remove dynamically only when required           |
| WebSocket or WebRTC connection        | Close connections on `pagehide`; re-open on `pageshow` if `event.persisted` is true  |
| `SharedArrayBuffer` in use            | Cannot be bfcached; this is a browser security constraint                            |

```javascript
// Correct pattern: handle bfcache-aware page lifecycle
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) {
    // Page is truly being unloaded (not entering bfcache)
    cleanup();
  }
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was restored from bfcache
    reinitialiseTimers();
    refreshStaleData();
  }
});
```

---

### Background Fetch

Background Fetch allows service workers to download or upload large files even if the user closes the tab. It is resilient to connectivity loss and browser shutdown.

DevTools records Background Fetch events:
- `backgroundfetchsuccess` — all requests completed
- `backgroundfetchfail` — one or more requests failed
- `backgroundfetchabort` — the user or script aborted the fetch
- `backgroundfetchclick` — user clicked the progress UI

```javascript
// Initiating a Background Fetch (in page script)
const registration = await navigator.serviceWorker.ready;
const bgFetch = await registration.backgroundFetch.fetch(
  'my-download-id',
  ['/video/episode-1.mp4'],
  { title: 'Downloading Episode 1', downloadTotal: 150_000_000 }
);

// Handling completion in sw.js
self.addEventListener('backgroundfetchsuccess', async (event) => {
  const cache = await caches.open('downloads');
  await event.updateUI({ title: 'Download complete!' });
  // Store responses in cache
  const records = await event.registration.matchAll();
  for (const record of records) {
    await cache.put(record.request, await record.responseReady);
  }
});
```

---

### Background Sync

Background Sync defers actions until the device has a reliable connection.

Click the **Sync** button in the Service Workers section to fire a fake sync event for testing. DevTools records sync events with their tag and status.

```javascript
// Register a one-time sync (in page script)
const registration = await navigator.serviceWorker.ready;
await registration.sync.register('send-pending-messages');

// Handle in sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-pending-messages') {
    event.waitUntil(
      getMessagesFromIndexedDB()
        .then(messages => Promise.all(messages.map(postToServer)))
        .then(clearSentMessages)
    );
  }
});
```

---

### Push Messaging Testing

The Push Messaging panel records push events received by the service worker even when DevTools was closed at the time.

To send a test push from DevTools: go to **Service Workers** and click the **Push** button next to the registered worker. You can optionally type a JSON payload in the text field before clicking.

```javascript
// sw.js — receiving a push
self.addEventListener('push', (event) => {
  const payload = event.data
    ? event.data.json()
    : { title: 'Test push', body: 'No data sent' };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png'
    })
  );
});
```

DevTools shows each recorded event with timestamp, origin, and payload, letting you verify your handler was invoked even in background sessions.

---

### Reporting API

The Reporting API lets the browser POST structured reports to a collector endpoint. Report types include:

| Report type         | What triggers it                                                     |
|---------------------|----------------------------------------------------------------------|
| `csp-violation`     | Content Security Policy violation                                    |
| `deprecation`       | Use of a deprecated web platform feature                             |
| `intervention`      | Browser blocked an operation (e.g., non-passive scroll listener)     |
| `crash`             | Renderer crash                                                       |
| `network-error`     | NEL (Network Error Logging) event                                    |

Configure reporting endpoints via the `Reporting-Endpoints` header:

```
Reporting-Endpoints: default="https://reports.example.com/csp"
Content-Security-Policy: ...; report-to default
```

DevTools lists pending and sent reports with their type, URL, and body, without requiring a live collector endpoint.

---

## Frames

The **Frames** section shows a tree of every browsing context on the page and all resources each context loaded.

```
▼ top (https://example.com)
    ▼ Documents
        index.html
    ▼ Scripts
        app.js
        vendor.js
        analytics.js     ← click to see its origin, size, and security details
    ▼ Stylesheets
        main.css
    ▼ Fonts
        Inter-Regular.woff2
    ▼ Images
        logo.png
        hero.webp
    ▼ iframes
        ▼ https://ads.example.net (cross-origin)
            ▼ Scripts
                ad.js
```

Click any resource to see:
- Its URL and MIME type
- Security state (is it HTTPS, is the certificate valid)
- Whether it is cross-origin and what CORS / COEP / COOP policies apply
- For iframes: sandboxing attributes and `allow` permissions

This is useful for auditing third-party scripts and verifying that cross-origin isolation (`Cross-Origin-Embedder-Policy: require-corp`) is correctly applied.

---

## PWA Debugging Workflow

Use this checklist when debugging a Progressive Web App installation or offline experience.

### Checklist

```
PWA Debugging Checklist
─────────────────────────────────────────────────────────────
1. HTTPS (or localhost)
   ☐ All navigation responses served over HTTPS
   ☐ No mixed-content warnings in the Security panel

2. Web App Manifest
   ☐ Manifest linked correctly: <link rel="manifest" href="/manifest.json">
   ☐ Manifest returns HTTP 200 with Content-Type: application/manifest+json
   ☐ name or short_name present
   ☐ start_url present and reachable
   ☐ icons array contains 192×192 and 512×512 PNG
   ☐ At least one maskable icon present
   ☐ display set to standalone or fullscreen
   ☐ No manifest errors shown in DevTools Application > Manifest

3. Service Worker
   ☐ SW registered and in "activated" state
   ☐ SW has a fetch event handler
   ☐ No JS errors in sw.js (check Console while on SW file)
   ☐ start_url is pre-cached in the install event
   ☐ Activate handler deletes old caches
   ☐ "Update on reload" enabled during development

4. Offline Functionality
   ☐ Check "Offline" in Service Workers pane, reload page
   ☐ Critical routes return a cached response (not a browser error page)
   ☐ App shows a meaningful offline UI, not a blank screen
   ☐ Forms queue actions via Background Sync when offline

5. Install Prompt
   ☐ beforeinstallprompt event fires (log in console to verify)
   ☐ All installability criteria met (green checkmarks in Manifest pane)
   ☐ Install prompt shown to user at an appropriate moment

6. Performance
   ☐ Lighthouse PWA audit score ≥ 100
   ☐ Time-to-interactive < 3 s on Slow 3G (Network throttling)
   ☐ bfcache eligible (Back/Forward Cache panel shows no blockers)
─────────────────────────────────────────────────────────────
```

### Step-by-Step Debug Session

1. Open DevTools > **Application** > **Manifest**. Fix any red errors before proceeding.
2. Click **Service Workers**. Confirm the SW is "activated". Enable **Update on reload** and **Offline**, then refresh.
3. Check the **Network** panel — requests that are served from the service worker show "ServiceWorker" in the Size column. If a critical resource falls through to the network (or fails), revisit your fetch handler caching strategy.
4. Go to **Cache Storage** and confirm your pre-cached URLs are present after install.
5. Disable **Offline** and test **Background Sync** by clicking the Sync button with a simulated offline state.
6. Use the **Back/Forward Cache** test to ensure navigation performance is not degraded.
7. Run a **Lighthouse** audit (DevTools > Lighthouse tab) with "Progressive Web App" checked for a final automated verification.

---

*Last reviewed against Chrome 127. Panel layouts and feature availability may change in future Chrome releases. Check the Chrome DevTools changelog at https://developer.chrome.com/tags/new-in-devtools for updates.*

---

[← Web Devtools](/coding/web-devtools/)
