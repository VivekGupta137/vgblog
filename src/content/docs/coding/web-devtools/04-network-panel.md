---
title: 04 Network Panel
---

# Network Panel — Complete Guide

The Network panel is the most used panel in Chrome DevTools for web developers. It records every network request the page makes, shows you exactly what was sent and received, and gives you timing data precise to the millisecond. This guide covers every feature from first principles.

---

## What the Network Panel Does

When you open the Network panel (F12 → Network) and reload a page, DevTools intercepts every HTTP/HTTPS request the browser makes and logs it in a table. For each request you get:

- The full URL, method, and status code
- Every request and response header
- The request body (for POST/PUT/PATCH)
- The raw response body
- Timing broken into DNS lookup, TCP connection, TLS handshake, time to first byte, and download
- A waterfall chart that visualizes how requests overlap in time
- Cookie data sent and received
- The JavaScript stack trace that triggered the request

The panel also lets you throttle the network to simulate slow connections, block specific URLs, replay requests, and export the entire session as a HAR file.

---

## UI Layout

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="border:1px solid var(--d-border-strong);border-radius:8px;overflow:hidden;min-width:560px;"><div data-pop-title="Toolbar" data-pop="Record, clear, import/export and the global switches that change how requests are captured." style="padding:.55rem .75rem;border-bottom:1px solid var(--d-border);background:var(--d-surface);"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">TOOLBAR</div><div style="display:flex;flex-wrap:wrap;align-items:center;row-gap:.3rem;"><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="Record" data-pop="Red circle toggles recording on/off. The panel only records while open, so reload after opening to capture the full page load." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">● Record</span><span data-pop-title="Clear" data-pop="Removes all requests from the table so you can capture a fresh action." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">🚫 Clear</span></div><i style="flex:none;align-self:stretch;width:1px;margin:.1rem .35rem;background:var(--d-border-strong);"></i><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="Filter" data-pop="Show or hide the filter bar (text, regex or property filters such as `status-code:404`)." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Filter</span><span data-pop-title="Search across responses" data-pop="Searches headers and bodies of every captured request (Ctrl+F in the Network panel)." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Search</span></div><i style="flex:none;align-self:stretch;width:1px;margin:.1rem .35rem;background:var(--d-border-strong);"></i><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="Preserve log" data-pop="Keeps requests across page navigations. Without it the table clears on every navigation. Essential when debugging redirects or multi-page flows." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">☐ Preserve log</span><span data-pop-title="Disable cache" data-pop="Bypasses the browser cache so every resource is re-requested. Only active while DevTools is open; like a continuous hard reload." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">☐ Disable cache</span><span data-pop-title="Throttling" data-pop="Simulate slower networks: Slow 3G (400 kbps, 2000 ms latency), Fast 3G (1.6 Mbps, 562 ms), Offline, or add a custom profile. A warning banner reminds you while throttling is on." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">No throttling ▾</span></div><i style="flex:none;align-self:stretch;width:1px;margin:.1rem .35rem;background:var(--d-border-strong);"></i><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="Import HAR" data-pop="Load a previously exported HAR file to inspect another session." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Import</span><span data-pop-title="Export HAR" data-pop="Saves the whole session (URLs, headers, bodies, timings) as a HAR JSON file to share or replay." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Export HAR</span></div><i style="flex:none;align-self:stretch;width:1px;margin:.1rem .35rem;background:var(--d-border-strong);"></i><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="Network settings" data-pop="Big request rows, Group by frame, Show overview and more. Click the gear icon or the kebab menu." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">⚙ Settings</span></div></div></div><div data-pop-title="Filter bar" data-pop="Narrow the table by text, regex, resource type or property filters." style="padding:.55rem .75rem;border-bottom:1px solid var(--d-border);background:var(--d-surface);"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">FILTER BAR</div><div data-pop-title="Filter input" data-pop="Type text or a regex, or use property filters: `method:POST`, `status-code:404`, `domain:api.example.com`, `larger-than:500k`, `-domain:google.com` to exclude, `is:from-cache`. Filters can be combined." style="border:1px solid var(--d-border-strong);border-radius:5px;padding:.2rem .5rem;margin-bottom:.3rem;color:var(--d-muted);font-size:.75rem;">Filter… (text, regex, or <code>status-code:404</code>)</div><span data-pop-title="Invert filter" data-pop="Negates the whole filter: only requests that do NOT match are shown. Example: `domain:example.com` + Invert = third-party requests only." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">☐ Invert</span><span data-pop-title="Hide data URLs" data-pop="Inline base64 resources (`data:image/png;base64,...`) show up as rows though no network call happened. This removes them." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">☐ Hide data URLs</span><br><span data-pop-title="Type filters" data-pop="Filter by resource type: All, Fetch/XHR, JS, CSS, Img, Media, Font, Doc, WS, Manifest. Multi-select with Ctrl/Cmd." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:#1e88e5;color:#fff;font-size:.75rem;">All</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Fetch/XHR</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">JS</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">CSS</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Img</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Media</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Font</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Doc</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">WS</span><span style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Manifest</span></div><div data-pop-title="Request table" data-pop="One row per request. Click a row to open the detail pane, click a header to sort, right-click a header to show/hide columns. Sorting by Time (descending) surfaces the slowest requests." style="padding:.55rem .75rem;border-bottom:1px solid var(--d-border);background:transparent;"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">REQUEST TABLE</div><table style="width:100%;border-collapse:collapse;font-size:.75rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;"><thead><tr style="text-align:left;color:var(--d-muted);"><th style="padding:.2rem .5rem;">Name</th><th>Status</th><th>Type</th><th>Initiator</th><th>Size</th><th>Time</th><th>Waterfall</th></tr></thead><tbody><tr data-pop-title="Document request" data-pop="The HTML page itself, type `doc`, usually the first row. Its Initiator is `Other` because the user typed the URL or clicked a link." style="border-top:1px solid var(--d-border);"><td style="padding:.25rem .5rem;">index.html</td><td style="padding:.25rem .5rem;color:#43a047;font-weight:700;">200</td><td style="padding:.25rem .5rem;">doc</td><td style="padding:.25rem .5rem;">Other</td><td style="padding:.25rem .5rem;">12 kB</td><td style="padding:.25rem .5rem;">45 ms</td><td style="padding:.25rem .5rem;width:30%;"><div style="position:relative;height:.6rem;"><i style="position:absolute;left:0%;width:12%;height:100%;background:#43a047;border-radius:2px;"></i></div></td></tr><tr data-pop-title="Script request" data-pop="A JavaScript file. The Initiator column (`index:12`) shows the line in `index.html` that requested it; click it to jump to Sources." style="border-top:1px solid var(--d-border);"><td style="padding:.25rem .5rem;">main.js</td><td style="padding:.25rem .5rem;color:#43a047;font-weight:700;">200</td><td style="padding:.25rem .5rem;">script</td><td style="padding:.25rem .5rem;">index:12</td><td style="padding:.25rem .5rem;">88 kB</td><td style="padding:.25rem .5rem;">120 ms</td><td style="padding:.25rem .5rem;width:30%;"><div style="position:relative;height:.6rem;"><i style="position:absolute;left:8%;width:32%;height:100%;background:#43a047;border-radius:2px;"></i></div></td></tr><tr data-pop-title="Failed request: 401" data-pop="Red rows are failed requests. 401 means the server did not accept the credentials. Check Payload, Response and the Authorization header (Cookies and Headers tabs). Initiator `app.js:45` is the code that fired it." style="border-top:1px solid var(--d-border);background:color-mix(in srgb,#e53935 14%,transparent);"><td style="padding:.25rem .5rem;">api/user</td><td style="padding:.25rem .5rem;color:#e53935;font-weight:700;">401</td><td style="padding:.25rem .5rem;">fetch</td><td style="padding:.25rem .5rem;">app.js:45</td><td style="padding:.25rem .5rem;">312 B</td><td style="padding:.25rem .5rem;">22 ms</td><td style="padding:.25rem .5rem;width:30%;"><div style="position:relative;height:.6rem;"><i style="position:absolute;left:30%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></td></tr><tr data-pop-title="Image request" data-pop="Type `png`, size 44 kB. The Size column shows transferred size over wire (compressed) vs resource size when Big request rows is enabled." style="border-top:1px solid var(--d-border);"><td style="padding:.25rem .5rem;">logo.png</td><td style="padding:.25rem .5rem;color:#43a047;font-weight:700;">200</td><td style="padding:.25rem .5rem;">png</td><td style="padding:.25rem .5rem;">index:30</td><td style="padding:.25rem .5rem;">44 kB</td><td style="padding:.25rem .5rem;">89 ms</td><td style="padding:.25rem .5rem;width:30%;"><div style="position:relative;height:.6rem;"><i style="position:absolute;left:20%;width:28%;height:100%;background:#43a047;border-radius:2px;"></i></div></td></tr><tr style="border-top:1px solid var(--d-border);color:var(--d-muted);"><td style="padding:.25rem .5rem;">…</td><td colspan="6"></td></tr></tbody></table></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0;"><div data-pop-title="Detail pane" data-pop="Appears when you click a row. Drag the divider to resize, press Escape to close. Tabs below show everything about that one request." style="padding:.55rem .75rem;border-right:1px solid var(--d-border);"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">DETAIL PANE <span style="font-weight:400;">(click a row)</span></div><span data-pop-title="Headers tab" data-pop="Every request and response header plus general info: URL, method, status, remote address, referrer policy." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Headers</span><span data-pop-title="Payload tab" data-pop="The request body or query parameters sent by the browser (POST/PUT/PATCH JSON, form data)." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Payload</span><span data-pop-title="Preview tab" data-pop="Parsed, human-friendly view of the response (JSON tree, rendered HTML, image)." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Preview</span><span data-pop-title="Response tab" data-pop="The raw response body exactly as received." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Response</span><span data-pop-title="Initiator tab" data-pop="The JavaScript call stack that triggered the request. Click a frame to jump to that line in Sources." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Initiator</span><span data-pop-title="Timing tab" data-pop="Per-phase breakdown: queueing, stalled, DNS, connection, SSL, request sent, TTFB and download." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Timing</span><span data-pop-title="Cookies tab" data-pop="Cookies sent with the request and set by the response (domain, path, HttpOnly, Secure, SameSite)." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Cookies</span></div><div data-pop-title="Waterfall column" data-pop="Each request is a bar on a shared time axis: position = start time, width = duration, colour = phase. See The Waterfall Chart section below." style="padding:.55rem .75rem;"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">WATERFALL COLUMN</div><span style="font-size:.75rem;color:var(--d-muted);">Extends across the right; bars show each phase on a shared time axis.</span></div></div><div data-pop-title="Status bar" data-pop="Totals for the session: request count, transferred size (over the wire) vs resource size (decompressed), Finish time, and the DOMContentLoaded and Load milestones." style="padding:.5rem .75rem;border-top:1px solid var(--d-border);background:var(--d-surface);font-size:.75rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">47 requests &nbsp;|&nbsp; 2.1 MB transferred &nbsp;|&nbsp; 8.4 MB resources &nbsp;|&nbsp; Finish: 1.40 s &nbsp;|&nbsp; <span data-pop-title="DOMContentLoaded" data-pop="Fires when the HTML is fully parsed and deferred scripts have run. The DOM is built; images and stylesheets may still load. Shown as a blue line in the waterfall." style="color:#1e88e5;">DOMContentLoaded: 890 ms</span> &nbsp;|&nbsp; <span data-pop-title="Load event" data-pop="Fires when everything the page requested (images, scripts, styles, iframes) has finished. Shown as a red line in the waterfall." style="color:#e53935;">Load: 1.38 s</span></div></div></div>
```

**Key interactions:**

- Click any row to open the detail pane on the right
- Click a column header to sort
- Right-click a column header to show/hide columns
- Drag the divider between the table and detail pane
- Press Escape to close the detail pane
- Click the red circle (Record) to toggle recording on/off
- The panel only records while open — reload after opening to capture the full page load

---

## The Request Table — All Columns

The table is configurable. Right-click any column header to add or remove columns. Default columns are marked with an asterisk.

| Column | What It Shows | Tips |
|--------|--------------|------|
| **Name*** | Filename or last path segment of the URL. Hover for full URL. Click to open detail pane. | The favicon on the left indicates resource type. A red icon means the request failed. |
| **Status*** | HTTP status code and text (e.g., `200 OK`, `404 Not Found`). Greyed-out codes mean the response came from cache. | 304 means "Not Modified" — the browser sent a conditional request and the server said use the cache. |
| **Protocol** | HTTP version: `http/1.1`, `h2` (HTTP/2), `h3` (HTTP/3 / QUIC) | Add this column to verify your server is using HTTP/2 or HTTP/3. |
| **Scheme** | `https` or `http` | Useful when auditing for mixed content. |
| **Domain** | The hostname of the request | Helps identify third-party requests at a glance. |
| **Remote Address** | IP address and port the connection was made to | Useful to confirm CDN vs origin server. |
| **Type*** | MIME type category: document, script, stylesheet, fetch, xhr, image, font, media, websocket, manifest, other | Filter by type using the type buttons in the filter bar. |
| **Initiator*** | What caused the request. Shows the file and line number for script-initiated requests, or "Parser" for HTML-parsed resources. | Click the initiator link to jump to the source line. |
| **Cookies** | Number of cookies sent in the request | Add to audit cookie hygiene. |
| **Set Cookies** | Number of cookies set in the response | |
| **Size*** | Two numbers: `transferred size / resource size`. Transferred is bytes over the wire (compressed). Resource is the decompressed size. | If transferred is much smaller, compression (gzip/brotli) is working. "from cache" appears instead of a size for cached responses. |
| **Time*** | Total duration from request start to last byte received. | Does not include queueing time. See the Timing tab for the full breakdown. |
| **Priority** | Chrome's resource loading priority: Highest, High, Medium, Low, Lowest | Helps debug render-blocking resources or late-loading critical assets. |
| **Connection ID** | Internal connection identifier | Requests with the same ID share a TCP connection (HTTP/1.1 keep-alive or HTTP/2 multiplexing). |
| **Cache-Control** | The `Cache-Control` response header value | Add to audit caching headers quickly. |
| **Content-Encoding** | `gzip`, `br` (Brotli), or blank | Verify compression is applied. |
| **Content-Length** | Response body size in bytes | |
| **Keep-Alive** | Keep-alive header if present | |
| **Vary** | `Vary` response header value | |
| **Waterfall*** | Visual timeline bars showing when each request started and how long each phase took | See the Waterfall Chart section for details. |

**How to add/remove columns:**

Right-click any existing column header. A context menu appears with all available columns. Check or uncheck columns. The table remembers your layout across sessions.

**Sorting:**

Click a column header to sort ascending. Click again to sort descending. Sorting by Time (descending) immediately surfaces your slowest requests.

---

## Request Detail Pane — All Tabs

Click any row in the table to open the detail pane. It slides in on the right (or below, depending on your layout preference). The pane has multiple tabs.

### Headers Tab

Shows every header in both the request and response, plus the general request info.

**Sections:**

**General**
```
Request URL:     https://api.example.com/v2/users/42
Request Method:  GET
Status Code:     200 OK  (click the ? for status code docs)
Remote Address:  104.21.8.1:443
Referrer Policy: strict-origin-when-cross-origin
```

**Response Headers** — what the server sent back:
```
cache-control: max-age=3600, must-revalidate
content-encoding: br
content-type: application/json; charset=utf-8
date: Mon, 28 Jul 2026 10:00:00 GMT
x-request-id: abc-123-def
```

**Request Headers** — what the browser sent:
```
:authority: api.example.com
:method: GET
:path: /v2/users/42
accept: application/json
accept-encoding: gzip, deflate, br
authorization: Bearer eyJhbGc...
cookie: session=xyz; _ga=GA1.1...
user-agent: Mozilla/5.0 ...
```

**Tips:**
- The raw view shows the headers exactly as sent/received. The parsed view groups them.
- Provisional headers (shown with a warning) appear when a request was blocked by the browser's cache or CORS check before being sent. The actual request headers were never sent.
- Look for `x-cache: HIT` or `x-served-by` headers to confirm CDN caching.

### Payload Tab

Appears only for requests with a body: POST, PUT, PATCH, DELETE with body. Shows the request body.

**Sections:**

**Query String Parameters** — key/value pairs parsed from the URL's `?foo=bar&baz=qux` string.

**Form Data** — for `application/x-www-form-urlencoded` requests, parsed as key/value.

**Request Payload** — for JSON or raw bodies:
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "role": "admin"
}
```

Toggle between "view parsed" and "view source" to see the raw bytes vs the pretty-printed version.

### Preview Tab

Renders the response visually:

- **JSON** — rendered as an interactive collapsible tree
- **HTML** — rendered as a webpage preview (not live, no JS execution)
- **Images** — displayed inline
- **Fonts** — shows a character preview
- **JavaScript/CSS** — shows formatted source code

The Preview tab is often faster than the Response tab for understanding what an API returned because the tree view lets you expand/collapse nested objects.

### Response Tab

The raw response body as text. Toggle between pretty-print and raw source. Useful when you need to copy the exact response text or see if the API returned unexpected whitespace/encoding.

For binary responses (images, fonts, wasm), Chrome shows a binary preview or declines to display it.

### Initiator Tab

Shows the full JavaScript call stack that triggered the request, or the HTML parser position.

```
Request call stack
  ▶ fetch  (built-in)
    sendRequest  app.js:245
    loadUser     user-service.js:88
    componentDidMount  UserProfile.jsx:34
    ...
```

Click any frame in the stack to jump directly to that line in the Sources panel. This is invaluable for tracing where in your application code a particular network call originates.

### Timing Tab

The most detailed breakdown of exactly where time was spent for a single request.

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="font-weight:700;margin-bottom:.5rem;">One request, split into phases <span style="font-weight:400;color:var(--d-muted);">(total 229.50 ms — hover a segment)</span></div><div style="display:flex;height:2rem;border-radius:6px;overflow:hidden;min-width:420px;"><div data-pop-title="Queueing" data-pop="The request was held in the browser&#x27;s request queue before being sent. HTTP/1.1 allows max 6 connections per host, so extra requests wait. High values: too many requests to one host. Switch to HTTP/2, which multiplexes." title="Queueing: 2.34 ms" style="width:1.02%;background:#bdbdbd;"></div><div data-pop-title="Stalled" data-pop="Ready to send but blocked waiting for a free connection, a service worker, or a disk-cache check. Similar to Queueing; points to connection saturation." title="Stalled: 0.18 ms" style="width:0.60%;background:#757575;"></div><div data-pop-title="DNS Lookup" data-pop="Time to resolve the hostname to an IP. Only shown for the first connection to a new host. Over 50 ms: add `&lt;link rel=&#x27;dns-prefetch&#x27;&gt;` for third-party domains." title="DNS: 12.45 ms" style="width:5.42%;background:#26a69a;"></div><div data-pop-title="Initial connection (TCP)" data-pop="TCP three-way handshake (SYN, SYN-ACK, ACK), once per host unless keep-alive expired. High for distant servers: use a CDN. Normal range is 10-200 ms depending on distance." title="Connect (TCP): 38.22 ms" style="width:16.65%;background:#fb8c00;"></div><div data-pop-title="SSL / TLS" data-pop="TLS handshake: negotiate cipher suite, exchange certificates, establish the encrypted session. Reduce with TLS session resumption, OCSP stapling and TLS 1.3." title="SSL/TLS: 22.11 ms" style="width:9.63%;background:#8e24aa;"></div><div data-pop-title="Request sent" data-pop="Time to transmit request headers and body. Normally under 1 ms; a high value means a large request body." title="Request sent: 0.09 ms" style="width:0.60%;background:#9ccc65;"></div><div data-pop-title="Waiting (TTFB)" data-pop="Time to First Byte: the server received the request, processed it and sent the first byte. The most actionable metric because it is server-side processing time. Over 200 ms is slow: check database queries, caching and compute." title="Waiting (TTFB): 145.67 ms" style="width:63.47%;background:#43a047;"></div><div data-pop-title="Content Download" data-pop="Time to receive the full response body after the first byte. High value means a large response: use compression, pagination or smaller payloads." title="Download: 8.44 ms" style="width:3.68%;background:#1e88e5;"></div></div><div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--d-muted);margin:.3rem 0 .6rem;min-width:420px;"><span>0 ms</span><span>229 ms</span></div><table style="font-size:.78rem;border-collapse:collapse;"><tbody><tr><td style="padding:.15rem .5rem .15rem 0;"><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:2px;background:#bdbdbd;margin-right:.4rem;"></i>Queueing</td><td style="text-align:right;padding:.15rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">2.34 ms</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;"><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:2px;background:#757575;margin-right:.4rem;"></i>Stalled</td><td style="text-align:right;padding:.15rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">0.18 ms</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;"><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:2px;background:#26a69a;margin-right:.4rem;"></i>DNS</td><td style="text-align:right;padding:.15rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">12.45 ms</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;"><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:2px;background:#fb8c00;margin-right:.4rem;"></i>Connect (TCP)</td><td style="text-align:right;padding:.15rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">38.22 ms</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;"><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:2px;background:#8e24aa;margin-right:.4rem;"></i>SSL/TLS</td><td style="text-align:right;padding:.15rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">22.11 ms</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;"><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:2px;background:#9ccc65;margin-right:.4rem;"></i>Request sent</td><td style="text-align:right;padding:.15rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">0.09 ms</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;"><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:2px;background:#43a047;margin-right:.4rem;"></i>Waiting (TTFB)</td><td style="text-align:right;padding:.15rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">145.67 ms</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;"><i style="display:inline-block;width:.7rem;height:.7rem;border-radius:2px;background:#1e88e5;margin-right:.4rem;"></i>Download</td><td style="text-align:right;padding:.15rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">8.44 ms</td></tr><tr style="border-top:1px solid var(--d-border-strong);font-weight:700;"><td style="padding:.25rem .5rem .15rem 0;">Total</td><td style="text-align:right;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">229.50 ms</td></tr></tbody></table><div data-pop-title="Reading this example" data-pop="Total 229.50 ms of which 145.67 ms (about 63 percent) is Waiting (TTFB): the server is the bottleneck, not the network. Fix backend queries or caching before tuning connections." style="margin-top:.7rem;padding:.5rem .7rem;border-left:3px solid #43a047;background:color-mix(in srgb,#43a047 12%,transparent);font-size:.8rem;"><b>Waiting (TTFB)</b> dominates here — that is server time, the most actionable segment.</div></div>
```

```
Resource Scheduling
  Queueing              2.34 ms

Connection Start
  Stalled               0.18 ms
  DNS Lookup            12.45 ms
  Initial connection    38.22 ms
  SSL                   22.11 ms

Request/Response
  Request sent          0.09 ms
  Waiting (TTFB)        145.67 ms
  Content Download      8.44 ms
                       ----------
  Total                 229.50 ms
```

**Phase-by-phase explanation:**

| Phase | What It Means | High Value Means... |
|-------|--------------|---------------------|
| **Queueing** | The request was held in the browser's request queue before being sent. HTTP/1.1 allows max 6 connections per host. | Too many requests to the same host, or high-priority requests were being served. Switch to HTTP/2 which multiplexes. |
| **Stalled** | The request was ready to send but was blocked waiting for an existing connection to free up, or by service workers, or by disk cache checks. | Similar to Queueing. Indicates connection saturation. |
| **DNS Lookup** | Time to resolve the hostname to an IP address. Only appears for the first connection to a new host. | High DNS time (>50ms): use `<link rel="dns-prefetch">` for third-party domains. |
| **Initial connection** | TCP three-way handshake (SYN, SYN-ACK, ACK). Only on first connection per host (or when keep-alive expired). | High for geographically distant servers. Use a CDN. Normal range: 10–200ms depending on distance. |
| **SSL** | TLS handshake. Negotiates cipher suite, exchanges certificates, establishes encrypted session. | Can be reduced with TLS session resumption and OCSP stapling. |
| **Request sent** | Time to transmit the request headers and body over the wire. | Normally <1ms. High value means large request body. |
| **Waiting (TTFB)** | Time to First Byte. The server received the request, processed it, and sent the first byte of the response. This is the most actionable metric — it represents server-side processing time. | High TTFB (>200ms) means the server is slow. Check database queries, caching, and compute. |
| **Content Download** | Time to receive the full response body after the first byte. | High value means large response. Consider compression, pagination, or reducing payload size. |

**ServiceWorker timing** (appears when a service worker handles the request):
- `Service Worker Initialization` — how long to start the worker
- `Service Worker Respondwith` — how long the worker took to respond

### Cookies Tab

Shows cookies sent with the request and cookies set by the response in a structured table with columns: Name, Value, Domain, Path, Expires, Size, HTTP Only, Secure, SameSite, Priority.

Use this to debug:
- Why a cookie is not being sent (wrong domain/path)
- Whether `HttpOnly` or `Secure` flags are set correctly
- SameSite policy causing cookies to be blocked on cross-site requests

---

## The Waterfall Chart

The waterfall visualizes every request as a horizontal bar positioned on a shared time axis. The position shows when the request started relative to page load start. The width shows total duration. The bar itself is color-coded by phase.

### Example Waterfall (hover a bar for timings)

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="min-width:640px;"><div style="position:relative;margin-left:9rem;height:1.2rem;font-size:.68rem;color:var(--d-muted);"><span style="position:absolute;left:0.0%;transform:translateX(-50%);">0</span><span style="position:absolute;left:12.5%;transform:translateX(-50%);">100</span><span style="position:absolute;left:25.0%;transform:translateX(-50%);">200</span><span style="position:absolute;left:37.5%;transform:translateX(-50%);">300</span><span style="position:absolute;left:50.0%;transform:translateX(-50%);">400</span><span style="position:absolute;left:62.5%;transform:translateX(-50%);">500</span><span style="position:absolute;left:75.0%;transform:translateX(-50%);">600</span><span style="position:absolute;left:87.5%;transform:translateX(-50%);">700</span><span style="position:absolute;left:100.0%;transform:translateX(-50%);">800</span></div><div style="position:relative;"><div style="position:absolute;left:9rem;right:0;top:0;bottom:0;"><i style="position:absolute;left:0.0%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i style="position:absolute;left:12.5%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i style="position:absolute;left:25.0%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i style="position:absolute;left:37.5%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i style="position:absolute;left:50.0%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i style="position:absolute;left:62.5%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i style="position:absolute;left:75.0%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i style="position:absolute;left:87.5%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i style="position:absolute;left:100.0%;top:0;bottom:0;border-left:1px solid var(--d-border);"></i><i data-pop-title="DOMContentLoaded line" data-pop="Blue dashed line: HTML parsed, DOM built, deferred scripts executed. Requests that start after this line are usually loaded by JavaScript; preload critical ones with `&lt;link rel=&#x27;preload&#x27;&gt;`." title="DOMContentLoaded" style="position:absolute;left:65.0%;top:0;bottom:0;border-left:2px dashed #1e88e5;"></i><i data-pop-title="Load line" data-pop="Red dashed line: everything the page requested has finished loading (images, scripts, styles, iframes)." title="load" style="position:absolute;left:87.5%;top:0;bottom:0;border-left:2px dashed #e53935;"></i></div><div style="display:flex;align-items:center;height:1.45rem;position:relative;"><div data-pop-title="index.html" data-pop="The document goes first and pays the full connection cost: DNS, TCP and TLS. Everything else waits for it to be parsed. Long purple (SSL) = expensive TLS: enable session resumption and TLS 1.3." style="width:9rem;flex:none;font-size:.75rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:.5rem;">index.html</div><div style="position:relative;flex:1;height:.7rem;"><i data-pop-title="Queueing (5 ms)" data-pop="The request was held in the browser&#x27;s request queue before being sent. HTTP/1.1 allows max 6 connections per host, so extra requests wait. High values: too many requests to one host. Switch to HTTP/2, which multiplexes." data-pop-tour="0" title="Queueing: 5 ms" style="position:absolute;left:0.0%;width:0.625%;height:100%;background:#bdbdbd;"></i><i data-pop-title="DNS Lookup (30 ms)" data-pop="Time to resolve the hostname to an IP. Only shown for the first connection to a new host. Over 50 ms: add `&lt;link rel=&#x27;dns-prefetch&#x27;&gt;` for third-party domains." data-pop-tour="0" title="DNS: 30 ms" style="position:absolute;left:0.625%;width:3.75%;height:100%;background:#26a69a;"></i><i data-pop-title="Initial connection (TCP) (40 ms)" data-pop="TCP three-way handshake (SYN, SYN-ACK, ACK), once per host unless keep-alive expired. High for distant servers: use a CDN. Normal range is 10-200 ms depending on distance." data-pop-tour="0" title="Connect (TCP): 40 ms" style="position:absolute;left:4.375%;width:5.0%;height:100%;background:#fb8c00;"></i><i data-pop-title="SSL / TLS (40 ms)" data-pop="TLS handshake: negotiate cipher suite, exchange certificates, establish the encrypted session. Reduce with TLS session resumption, OCSP stapling and TLS 1.3." data-pop-tour="0" title="SSL/TLS: 40 ms" style="position:absolute;left:9.375%;width:5.0%;height:100%;background:#8e24aa;"></i><i data-pop-title="Request sent (3 ms)" data-pop="Time to transmit request headers and body. Normally under 1 ms; a high value means a large request body." data-pop-tour="0" title="Request sent: 3 ms" style="position:absolute;left:14.374999999999998%;width:0.375%;height:100%;background:#9ccc65;"></i><i data-pop-title="Waiting (TTFB) (120 ms)" data-pop="Time to First Byte: the server received the request, processed it and sent the first byte. The most actionable metric because it is server-side processing time. Over 200 ms is slow: check database queries, caching and compute." data-pop-tour="0" title="Waiting (TTFB): 120 ms" style="position:absolute;left:14.75%;width:15.0%;height:100%;background:#43a047;"></i><i data-pop-title="Content Download (40 ms)" data-pop="Time to receive the full response body after the first byte. High value means a large response: use compression, pagination or smaller payloads." data-pop-tour="0" title="Download: 40 ms" style="position:absolute;left:29.75%;width:5.0%;height:100%;background:#1e88e5;"></i></div></div><div style="display:flex;align-items:center;height:1.45rem;position:relative;"><div data-pop-title="main.css" data-pop="Discovered while parsing the HTML, so it starts only after index.html finished. Render-blocking CSS delays DOMContentLoaded." style="width:9rem;flex:none;font-size:.75rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:.5rem;">main.css</div><div style="position:relative;flex:1;height:.7rem;"><i data-pop-title="Queueing (8 ms)" data-pop="The request was held in the browser&#x27;s request queue before being sent. HTTP/1.1 allows max 6 connections per host, so extra requests wait. High values: too many requests to one host. Switch to HTTP/2, which multiplexes." data-pop-tour="0" title="Queueing: 8 ms" style="position:absolute;left:35.0%;width:1.0%;height:100%;background:#bdbdbd;"></i><i data-pop-title="Stalled (5 ms)" data-pop="Ready to send but blocked waiting for a free connection, a service worker, or a disk-cache check. Similar to Queueing; points to connection saturation." data-pop-tour="0" title="Stalled: 5 ms" style="position:absolute;left:36.0%;width:0.625%;height:100%;background:#757575;"></i><i data-pop-title="Waiting (TTFB) (60 ms)" data-pop="Time to First Byte: the server received the request, processed it and sent the first byte. The most actionable metric because it is server-side processing time. Over 200 ms is slow: check database queries, caching and compute." data-pop-tour="0" title="Waiting (TTFB): 60 ms" style="position:absolute;left:36.625%;width:7.5%;height:100%;background:#43a047;"></i><i data-pop-title="Content Download (30 ms)" data-pop="Time to receive the full response body after the first byte. High value means a large response: use compression, pagination or smaller payloads." data-pop-tour="0" title="Download: 30 ms" style="position:absolute;left:44.125%;width:3.75%;height:100%;background:#1e88e5;"></i></div></div><div style="display:flex;align-items:center;height:1.45rem;position:relative;"><div data-pop-title="app.js" data-pop="Long green bar = slow server (TTFB); wide blue bar = large file. Compress and split bundles." style="width:9rem;flex:none;font-size:.75rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:.5rem;">app.js</div><div style="position:relative;flex:1;height:.7rem;"><i data-pop-title="Queueing (12 ms)" data-pop="The request was held in the browser&#x27;s request queue before being sent. HTTP/1.1 allows max 6 connections per host, so extra requests wait. High values: too many requests to one host. Switch to HTTP/2, which multiplexes." data-pop-tour="0" title="Queueing: 12 ms" style="position:absolute;left:35.0%;width:1.5%;height:100%;background:#bdbdbd;"></i><i data-pop-title="Stalled (6 ms)" data-pop="Ready to send but blocked waiting for a free connection, a service worker, or a disk-cache check. Similar to Queueing; points to connection saturation." data-pop-tour="0" title="Stalled: 6 ms" style="position:absolute;left:36.5%;width:0.75%;height:100%;background:#757575;"></i><i data-pop-title="Waiting (TTFB) (110 ms)" data-pop="Time to First Byte: the server received the request, processed it and sent the first byte. The most actionable metric because it is server-side processing time. Over 200 ms is slow: check database queries, caching and compute." data-pop-tour="0" title="Waiting (TTFB): 110 ms" style="position:absolute;left:37.25%;width:13.750000000000002%;height:100%;background:#43a047;"></i><i data-pop-title="Content Download (80 ms)" data-pop="Time to receive the full response body after the first byte. High value means a large response: use compression, pagination or smaller payloads." data-pop-tour="0" title="Download: 80 ms" style="position:absolute;left:51.0%;width:10.0%;height:100%;background:#1e88e5;"></i></div></div><div style="display:flex;align-items:center;height:1.45rem;position:relative;"><div data-pop-title="logo.png" data-pop="Different host, so it needs its own DNS and TCP (teal and orange). For third-party hosts add `&lt;link rel=&#x27;dns-prefetch&#x27;&gt;`." style="width:9rem;flex:none;font-size:.75rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:.5rem;">logo.png</div><div style="position:relative;flex:1;height:.7rem;"><i data-pop-title="DNS Lookup (20 ms)" data-pop="Time to resolve the hostname to an IP. Only shown for the first connection to a new host. Over 50 ms: add `&lt;link rel=&#x27;dns-prefetch&#x27;&gt;` for third-party domains." data-pop-tour="0" title="DNS: 20 ms" style="position:absolute;left:41.25%;width:2.5%;height:100%;background:#26a69a;"></i><i data-pop-title="Initial connection (TCP) (35 ms)" data-pop="TCP three-way handshake (SYN, SYN-ACK, ACK), once per host unless keep-alive expired. High for distant servers: use a CDN. Normal range is 10-200 ms depending on distance." data-pop-tour="0" title="Connect (TCP): 35 ms" style="position:absolute;left:43.75%;width:4.375%;height:100%;background:#fb8c00;"></i><i data-pop-title="Waiting (TTFB) (70 ms)" data-pop="Time to First Byte: the server received the request, processed it and sent the first byte. The most actionable metric because it is server-side processing time. Over 200 ms is slow: check database queries, caching and compute." data-pop-tour="0" title="Waiting (TTFB): 70 ms" style="position:absolute;left:48.125%;width:8.75%;height:100%;background:#43a047;"></i><i data-pop-title="Content Download (50 ms)" data-pop="Time to receive the full response body after the first byte. High value means a large response: use compression, pagination or smaller payloads." data-pop-tour="0" title="Download: 50 ms" style="position:absolute;left:56.875%;width:6.25%;height:100%;background:#1e88e5;"></i></div></div><div style="display:flex;align-items:center;height:1.45rem;position:relative;"><div data-pop-title="api/data" data-pop="Starts after DOMContentLoaded: triggered by JavaScript. Long TTFB here means slow backend or database." style="width:9rem;flex:none;font-size:.75rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:.5rem;">api/data</div><div style="position:relative;flex:1;height:.7rem;"><i data-pop-title="Stalled (10 ms)" data-pop="Ready to send but blocked waiting for a free connection, a service worker, or a disk-cache check. Similar to Queueing; points to connection saturation." data-pop-tour="0" title="Stalled: 10 ms" style="position:absolute;left:58.75%;width:1.25%;height:100%;background:#757575;"></i><i data-pop-title="Waiting (TTFB) (150 ms)" data-pop="Time to First Byte: the server received the request, processed it and sent the first byte. The most actionable metric because it is server-side processing time. Over 200 ms is slow: check database queries, caching and compute." data-pop-tour="0" title="Waiting (TTFB): 150 ms" style="position:absolute;left:60.0%;width:18.75%;height:100%;background:#43a047;"></i><i data-pop-title="Content Download (40 ms)" data-pop="Time to receive the full response body after the first byte. High value means a large response: use compression, pagination or smaller payloads." data-pop-tour="0" title="Download: 40 ms" style="position:absolute;left:78.75%;width:5.0%;height:100%;background:#1e88e5;"></i></div></div><div style="display:flex;align-items:center;height:1.45rem;position:relative;"><div data-pop-title="analytics.js" data-pop="Starts with a long grey Queueing bar: it waited for a free connection. The staircase pattern points to the 6-connections-per-host limit of HTTP/1.1." style="width:9rem;flex:none;font-size:.75rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:.5rem;">analytics.js</div><div style="position:relative;flex:1;height:.7rem;"><i data-pop-title="Queueing (100 ms)" data-pop="The request was held in the browser&#x27;s request queue before being sent. HTTP/1.1 allows max 6 connections per host, so extra requests wait. High values: too many requests to one host. Switch to HTTP/2, which multiplexes." data-pop-tour="0" title="Queueing: 100 ms" style="position:absolute;left:47.5%;width:12.5%;height:100%;background:#bdbdbd;"></i><i data-pop-title="Stalled (10 ms)" data-pop="Ready to send but blocked waiting for a free connection, a service worker, or a disk-cache check. Similar to Queueing; points to connection saturation." data-pop-tour="0" title="Stalled: 10 ms" style="position:absolute;left:60.0%;width:1.25%;height:100%;background:#757575;"></i><i data-pop-title="Waiting (TTFB) (70 ms)" data-pop="Time to First Byte: the server received the request, processed it and sent the first byte. The most actionable metric because it is server-side processing time. Over 200 ms is slow: check database queries, caching and compute." data-pop-tour="0" title="Waiting (TTFB): 70 ms" style="position:absolute;left:61.25000000000001%;width:8.75%;height:100%;background:#43a047;"></i><i data-pop-title="Content Download (25 ms)" data-pop="Time to receive the full response body after the first byte. High value means a large response: use compression, pagination or smaller payloads." data-pop-tour="0" title="Download: 25 ms" style="position:absolute;left:70.0%;width:3.125%;height:100%;background:#1e88e5;"></i></div></div></div><div style="display:flex;gap:1.2rem;margin-top:.6rem;font-size:.75rem;"><span style="color:#1e88e5;">┆ DOMContentLoaded</span><span style="color:#e53935;">┆ Load</span></div><div style="display:flex;flex-wrap:wrap;gap:.9rem;margin-top:.8rem;font-size:.75rem;"><span data-pop-title="Queueing" data-pop="The request was held in the browser&#x27;s request queue before being sent. HTTP/1.1 allows max 6 connections per host, so extra requests wait. High values: too many requests to one host. Switch to HTTP/2, which multiplexes." style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#bdbdbd;display:inline-block;"></i>Queueing</span><span data-pop-title="Stalled" data-pop="Ready to send but blocked waiting for a free connection, a service worker, or a disk-cache check. Similar to Queueing; points to connection saturation." style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#757575;display:inline-block;"></i>Stalled</span><span data-pop-title="DNS Lookup" data-pop="Time to resolve the hostname to an IP. Only shown for the first connection to a new host. Over 50 ms: add `&lt;link rel=&#x27;dns-prefetch&#x27;&gt;` for third-party domains." style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#26a69a;display:inline-block;"></i>DNS</span><span data-pop-title="Initial connection (TCP)" data-pop="TCP three-way handshake (SYN, SYN-ACK, ACK), once per host unless keep-alive expired. High for distant servers: use a CDN. Normal range is 10-200 ms depending on distance." style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#fb8c00;display:inline-block;"></i>Connect (TCP)</span><span data-pop-title="SSL / TLS" data-pop="TLS handshake: negotiate cipher suite, exchange certificates, establish the encrypted session. Reduce with TLS session resumption, OCSP stapling and TLS 1.3." style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#8e24aa;display:inline-block;"></i>SSL/TLS</span><span data-pop-title="Request sent" data-pop="Time to transmit request headers and body. Normally under 1 ms; a high value means a large request body." style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#9ccc65;display:inline-block;"></i>Request sent</span><span data-pop-title="Waiting (TTFB)" data-pop="Time to First Byte: the server received the request, processed it and sent the first byte. The most actionable metric because it is server-side processing time. Over 200 ms is slow: check database queries, caching and compute." style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#43a047;display:inline-block;"></i>Waiting (TTFB)</span><span data-pop-title="Content Download" data-pop="Time to receive the full response body after the first byte. High value means a large response: use compression, pagination or smaller payloads." style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#1e88e5;display:inline-block;"></i>Download</span></div></div></div>
```

**Color coding for waterfall bars:**

| Color | Phase |
|-------|-------|
| Light grey (thin left portion) | Queueing |
| Dark grey | Stalled |
| Teal/dark cyan | DNS Lookup |
| Orange | Initial connection (TCP) |
| Purple | SSL negotiation |
| Green (thin) | Request sent |
| Green (main) | Waiting for server (TTFB) |
| Blue | Content download |

**The two vertical event lines:**

- **Blue dashed vertical line** — `DOMContentLoaded` event. The HTML was parsed, the DOM is built, and deferred scripts have run. The page is interactive but images and stylesheets may still be loading.
- **Red dashed vertical line** — `load` event. Everything the page requested (images, scripts, styles) has finished loading.

**Reading the waterfall to find bottlenecks:**

1. **Staircase pattern** — requests start one after another in a staircase shape: you're hitting HTTP/1.1's 6-connection limit or each request depends on the previous one. Fix: switch to HTTP/2, reduce request count, or parallelize.

2. **Long green bars (TTFB)** — the server is slow to respond. Check backend performance, database queries, and caching.

3. **Wide blue bars (content download)** — large response bodies. Compress responses, paginate APIs, reduce image sizes.

4. **Long purple bars (SSL)** — TLS handshake is expensive. Enable TLS session resumption, use OCSP stapling, upgrade to TLS 1.3.

5. **Long orange bars (TCP)** — client is far from the server. Deploy to a CDN or edge location closer to your users.

6. **Teal bars (DNS)** on third-party requests — add `<link rel="dns-prefetch" href="//cdn.example.com">` to resolve DNS early.

7. **Requests starting after DOMContentLoaded** — these resources are probably loaded by JavaScript. If they're critical, preload them with `<link rel="preload">`.

---

## Filtering Requests

### Type Filter Buttons

The row of buttons below the filter input lets you show only certain resource types:

| Button | Shows |
|--------|-------|
| All | Every request |
| Fetch/XHR | `fetch()` calls and XMLHttpRequest — your API calls |
| JS | JavaScript files |
| CSS | Stylesheets |
| Img | Images (PNG, JPEG, WebP, SVG, etc.) |
| Media | Video and audio |
| Font | Web fonts (WOFF, WOFF2, TTF) |
| Doc | HTML documents |
| WS | WebSocket connections |
| Manifest | Web app manifests |
| Other | Anything that doesn't fit the above |

You can hold Cmd (Mac) or Ctrl (Windows) and click multiple buttons to filter by multiple types simultaneously.

### Text Search

Type in the filter input box to filter by URL substring. The filter is case-insensitive by default.

Examples:
- `api` — shows any request whose URL contains "api"
- `user` — shows any request whose URL contains "user"
- `/v2/` — useful for filtering by API version path

Toggle **Regex** mode (the `.*` button next to the filter input) to use regular expressions:
- `\.(js|css)$` — requests ending in `.js` or `.css`
- `api/user/\d+` — requests to a user endpoint with a numeric ID

### Advanced Filter Syntax

The filter box supports a powerful set of keywords. Combine multiple filters with spaces (AND logic).

| Filter Syntax | What It Matches | Example |
|--------------|----------------|---------|
| `domain:hostname` | Requests to that hostname | `domain:api.example.com` |
| `-domain:hostname` | Exclude requests to that hostname | `-domain:google-analytics.com` |
| `method:VERB` | Requests with that HTTP method | `method:POST` |
| `status-code:N` | Requests with that status code | `status-code:404` |
| `status-code:5` | Requests with status codes starting with 5 (500–599) | `status-code:5` |
| `has-response-header:name` | Requests that have that response header | `has-response-header:Cache-Control` |
| `response-header-value:name=val` | Requests where header equals value | `response-header-value:content-type=application/json` |
| `larger-than:size` | Requests with transferred size larger than | `larger-than:100k` or `larger-than:1M` |
| `-larger-than:size` | Requests smaller than size | `-larger-than:50k` |
| `mime-type:type` | Requests with that MIME type | `mime-type:application/json` |
| `scheme:https` | Only HTTPS (or `http`) requests | `scheme:http` |
| `is:running` | Requests still in progress | `is:running` |
| `is:from-cache` | Requests served from browser cache | `is:from-cache` |
| `is:service-worker-initiated` | Requests initiated by a service worker | `is:service-worker-initiated` |
| `set-cookie-domain:` | Responses that set a cookie for that domain | `set-cookie-domain:.example.com` |
| `set-cookie-name:` | Responses that set a cookie with that name | `set-cookie-name:session` |
| `set-cookie-value:` | Responses that set a cookie with that value | `set-cookie-value:true` |
| `cookie-name:` | Requests that send a cookie with that name | `cookie-name:auth_token` |
| `priority:High` | Requests with that loading priority | `priority:Highest` |

**Combined examples:**

```
method:POST status-code:4                          # All failed POST requests
domain:api.example.com has-response-header:X-Cache # API requests with cache header
-domain:google.com -domain:facebook.com            # Hide all Google and Facebook requests
larger-than:500k mime-type:application/json        # Large JSON responses
```

### Invert Filter

Check the **Invert** checkbox to negate the entire filter. The table then shows only requests that do NOT match. Example: type `domain:example.com` and check Invert to see only third-party requests.

### Hide Data URLs

Data URLs (inline base64-encoded resources like `data:image/png;base64,...`) clutter the request table because they appear as requests even though no network call was made. Check **Hide data URLs** to remove them.

---

## Network Settings

Click the gear icon in the toolbar or the kebab menu to access Network settings.

| Setting | What It Does |
|---------|-------------|
| **Preserve log** | Keeps requests in the table across page navigations. Without this, the table clears on every navigation. Essential when debugging redirects or multi-page flows. |
| **Disable cache** | Forces the browser to bypass its cache and re-request all resources. Only active while DevTools is open. Equivalent to Ctrl+Shift+R (hard reload) for every request continuously. |
| **Big request rows** | Doubles the height of each row to show two lines of information (e.g., both transferred and resource size in the Size column). |
| **Group by frame** | Groups requests by the iframe or frame that initiated them. Useful when debugging pages with multiple embedded frames. |
| **Show overview** | Shows/hides the overview timeline graph above the request table that shows bandwidth usage over time. |

---

## Throttling

Network throttling simulates slower connections so you can test how your site performs for users on mobile networks or poor connections.

### Built-in Presets

Click the throttling dropdown in the toolbar (defaults to "No throttling"). Built-in presets:

| Preset | Download | Upload | Latency |
|--------|----------|--------|---------|
| No throttling | Full speed | Full speed | None |
| Slow 3G | 400 kbps | 400 kbps | 2000 ms |
| Fast 3G | 1.6 Mbps | 750 kbps | 562 ms |
| Offline | 0 | 0 | — |

### Custom Throttling Profiles

Click "Add..." at the bottom of the throttling dropdown to create a custom profile:

```
Profile name:  My 4G Simulation
Download:      20000  (kbps)
Upload:        10000  (kbps)
Latency:       80     (ms round-trip added to each request)
```

Save it and it appears in the dropdown for reuse. The download and upload values are in **kilobits per second** (kbps). Convert: 1 Mbps = 1000 kbps.

Common custom profiles to create:

| Scenario | Download kbps | Upload kbps | Latency ms |
|----------|--------------|-------------|------------|
| 4G LTE | 40000 | 10000 | 30 |
| Cable broadband | 50000 | 10000 | 14 |
| DSL | 2000 | 512 | 50 |
| Slow hotel WiFi | 1000 | 256 | 200 |

### CPU Throttling

In the Performance panel (not Network), you can throttle CPU. But in the Network panel, you can combine network throttling with the **Device Mode** (toggle at the top left of DevTools) to simulate both slow network and slower device CPU together for a realistic mobile simulation.

**Important:** Throttling applies only while DevTools is open. A yellow warning banner appears in the toolbar to remind you that throttling is active — do not leave it on accidentally.

---

## Copy Requests

Right-click any request in the table for a rich set of copy options.

| Copy Option | What You Get | Use Case |
|------------|-------------|----------|
| **Copy as cURL (bash)** | A `curl` command that exactly replicates the request including all headers, cookies, and body | Share with backend teammates, run in terminal, use in bug reports |
| **Copy as cURL (cmd)** | Same but with Windows command prompt quoting | Windows users |
| **Copy as fetch** | A JavaScript `fetch()` call with headers and body | Paste into browser console or a test script |
| **Copy as Node.js fetch** | Same but using Node's built-in `fetch` (Node 18+) | Backend testing scripts |
| **Copy as PowerShell** | PowerShell `Invoke-WebRequest` command | Windows PowerShell scripts |
| **Copy as Python Requests** | Python `requests.get/post()` call | Backend Python scripts |
| **Copy as PHP** | PHP cURL code | PHP debugging |
| **Copy link address** | Just the URL | Quick sharing |
| **Copy response** | The raw response body text | Paste elsewhere for analysis |
| **Copy all as HAR** | The entire recorded session as HAR JSON | Share full session with teammates |

**Example cURL output for a POST request:**

```bash
curl 'https://api.example.com/v2/users' \
  -H 'accept: application/json' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiJ9...' \
  -H 'content-type: application/json' \
  -H 'cookie: session=abc123; _ga=GA1.1.123456.789' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; ...) Chrome/126.0 ...' \
  --data-raw '{"username":"alice","email":"alice@example.com"}' \
  --compressed
```

This is one of the most powerful debugging tools — you can take an exact copy of a failing request and run it in your terminal or Postman to isolate whether the issue is the browser, the JavaScript code, or the server.

---

## Import/Export HAR Files

### What Is a HAR File?

HAR (HTTP Archive) is a JSON-based format for recording all network activity. A `.har` file is a snapshot of every request, response, header, body, and timing from a DevTools Network session. It is the standard format for sharing network recordings.

Structure overview:
```json
{
  "log": {
    "version": "1.2",
    "creator": { "name": "Chrome DevTools", "version": "126" },
    "entries": [
      {
        "startedDateTime": "2026-07-28T10:00:00.000Z",
        "time": 229.50,
        "request": {
          "method": "GET",
          "url": "https://api.example.com/v2/users/42",
          "headers": [...],
          "queryString": [...],
          "postData": { "mimeType": "application/json", "text": "{...}" }
        },
        "response": {
          "status": 200,
          "headers": [...],
          "content": { "mimeType": "application/json", "text": "{...}" }
        },
        "timings": {
          "dns": 12.45,
          "connect": 38.22,
          "ssl": 22.11,
          "send": 0.09,
          "wait": 145.67,
          "receive": 8.44
        }
      }
    ]
  }
}
```

### Exporting a HAR File

1. Record the network activity you want to capture
2. Click the **Export HAR** icon (down-arrow icon) in the toolbar, or right-click the table and choose "Save all as HAR with content"
3. A `.har` file downloads

"Save all as HAR with content" includes the response bodies. "Export HAR" may exclude bodies depending on the Chrome version. Use "with content" when sharing with teammates who need to see responses.

### Importing a HAR File

1. Click the **Import HAR** icon (up-arrow icon) in the toolbar
2. Select the `.har` file
3. The requests load into the table exactly as if they had just been recorded

### Use Cases

- **Share a bug** — export a HAR from the browser showing the failing request, attach to a JIRA ticket or GitHub issue. Teammates can import and inspect without reproducing the bug themselves.
- **Performance audit** — export the HAR and analyze it in tools like webpagetest.org's HAR viewer, HAR Analyzer (google-chrome.github.io/devtools-samples/tools/har_analyzer/), or `har-validator`.
- **API documentation** — capture real API calls and use them as examples.
- **Security review** — analyze all requests made by a third-party script.
- **Regression testing** — compare a HAR from before and after a change to spot new requests or changed payloads.

**Security warning:** HAR files contain cookies, authorization tokens, and response bodies including any sensitive data. Scrub them before sharing publicly. The `har-sanitizer` tool can strip sensitive headers.

---

## Replay XHR Requests

Right-click any Fetch/XHR request and choose **Replay XHR**. Chrome immediately re-sends the exact same request (same URL, method, headers, and body) and adds the result as a new row in the table.

**Limitations:**
- Only works for XHR and Fetch requests (not document loads, script loads, etc.)
- Replays with the current cookies and session state, not the state at the time of the original request
- Does not re-run the JavaScript that triggered the request — it's a raw replay

**Use cases:**
- Quickly re-test an API endpoint after changing something server-side without reloading the page
- Verify that a fix resolved a 500 error
- Test rate limiting behavior by replaying the same request rapidly

---

## Request Blocking

Block specific URLs to test how your app behaves when a resource fails to load.

### Blocking a Request

1. Right-click a request in the table
2. Choose **Block request URL** to block that exact URL, or **Block request domain** to block all requests to that hostname
3. The request URL (or a wildcard pattern) is added to the blocked list

When a blocked URL is requested, the request fails immediately with `net::ERR_BLOCKED_BY_DEVTOOLS`. The row appears in the table with a strikethrough.

### Managing Blocked Patterns

Open the **Network request blocking** panel:
- Click the three-dot menu in the toolbar → More tools → Network request blocking
- Or open the Command Menu (Cmd+Shift+P), type "Show Network request blocking"

The panel shows all patterns. You can:
- Add a new pattern manually (supports `*` wildcards, e.g., `*.google-analytics.com/*`)
- Enable/disable individual patterns with the checkbox
- Delete patterns
- Enable/disable the entire blocking feature with the master toggle

**Pattern syntax:**
```
https://cdn.example.com/analytics.js   # Exact URL
*google-analytics*                      # Any URL containing this string
*.doubleclick.net/*                     # All requests to this domain
/api/v1/*                               # All requests matching this path pattern
```

### Use Cases

- **Graceful degradation testing** — block your analytics script and verify the site still works
- **A/B test a CDN** — block requests to one CDN to force fallback to another
- **Remove third-party noise** — block trackers during performance testing so they don't skew measurements
- **Simulate backend failure** — block an API endpoint to test your error handling UI
- **Performance testing without ads** — block ad network scripts

---

## Search Across All Responses

To search across the text content of all responses (headers and bodies):

Press **Ctrl+F** (or Cmd+F on Mac) within the Network panel to search request URLs.

For full-text search across all response bodies and headers, use the Network Search panel:
- Press **Ctrl+Shift+F** (Cmd+Option+F on Mac) within the Network panel
- Or click the magnifying glass icon in the Network toolbar
- Or use the Command Menu: type "Search"

The Search panel opens as a drawer. Type your search term and press Enter. DevTools searches all captured request/response content and returns a list of matches with the request name and the matching line shown in context.

```
Search panel:
[Search query: "access_token"      ] [Match case] [Regex]

Results:
  POST /api/auth/login                     1 result
    {"access_token":"eyJhbGci..."}

  GET /api/users/me                        2 results
    authorization: Bearer eyJhbGci...
    x-refresh-token: eyJhbGci...
```

Click any result to jump to that request and highlight the match in the Response or Headers tab.

**Use cases:**
- Find which API response contains a specific value
- Search for a leaked secret across all responses
- Find where a cookie value appears in responses
- Locate which request sets a specific data value your app is displaying

---

## WebSocket Inspection

WebSocket connections appear in the Network table with type **WS** and a special icon. Unlike HTTP requests, a WebSocket connection is long-lived and carries many messages.

### Opening the WebSocket Inspector

Click a WebSocket entry in the table. The detail pane shows the usual tabs plus a **Messages** tab.

### Messages Tab

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="display:flex;gap:.5rem;margin-bottom:.5rem;"><span data-pop-title="Message filter" data-pop="Filter by direction (All, Send, Receive) and search or regex over message data." style="border:1px solid var(--d-border-strong);border-radius:5px;padding:.1rem .5rem;font-size:.75rem;">All ▾</span><span style="border:1px solid var(--d-border-strong);border-radius:5px;padding:.1rem .5rem;flex:1;color:var(--d-muted);font-size:.75rem;">Enter regex, for example: (web)?socket</span></div><table style="width:100%;border-collapse:collapse;font-size:.76rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;min-width:460px;"><thead><tr style="color:var(--d-muted);text-align:left;"><th style="padding:.2rem .6rem;">Dir</th><th style="padding:.2rem .6rem;">Data</th><th style="padding:.2rem .6rem;text-align:right;">Length</th><th style="padding:.2rem .6rem;text-align:right;">Time</th></tr></thead><tbody><tr data-pop-title="Sent frame" data-pop="Green up-arrow: sent by the browser. Red down-arrow: received from the server. Data is the payload (text or binary), Length is bytes and Time is seconds since the connection opened." style="border-top:1px solid var(--d-border);background:color-mix(in srgb,#43a047 10%,transparent);"><td style="padding:.25rem .6rem;color:#43a047;font-weight:700;">↑</td><td style="padding:.25rem .6rem;">{'type':'ping'}</td><td style="padding:.25rem .6rem;text-align:right;">15</td><td style="padding:.25rem .6rem;text-align:right;">0.1 s</td></tr><tr data-pop-title="Received frame" data-pop="Green up-arrow: sent by the browser. Red down-arrow: received from the server. Data is the payload (text or binary), Length is bytes and Time is seconds since the connection opened." style="border-top:1px solid var(--d-border);background:color-mix(in srgb,#e53935 10%,transparent);"><td style="padding:.25rem .6rem;color:#e53935;font-weight:700;">↓</td><td style="padding:.25rem .6rem;">{'type':'pong'}</td><td style="padding:.25rem .6rem;text-align:right;">15</td><td style="padding:.25rem .6rem;text-align:right;">0.1 s</td></tr><tr style="border-top:1px solid var(--d-border);background:color-mix(in srgb,#43a047 10%,transparent);"><td style="padding:.25rem .6rem;color:#43a047;font-weight:700;">↑</td><td style="padding:.25rem .6rem;">{'type':'subscribe','ch':'prices'}</td><td style="padding:.25rem .6rem;text-align:right;">35</td><td style="padding:.25rem .6rem;text-align:right;">0.5 s</td></tr><tr style="border-top:1px solid var(--d-border);background:color-mix(in srgb,#e53935 10%,transparent);"><td style="padding:.25rem .6rem;color:#e53935;font-weight:700;">↓</td><td style="padding:.25rem .6rem;">{'type':'update','price':42.1}</td><td style="padding:.25rem .6rem;text-align:right;">30</td><td style="padding:.25rem .6rem;text-align:right;">1.2 s</td></tr><tr style="border-top:1px solid var(--d-border);background:color-mix(in srgb,#e53935 10%,transparent);"><td style="padding:.25rem .6rem;color:#e53935;font-weight:700;">↓</td><td style="padding:.25rem .6rem;">{'type':'update','price':42.3}</td><td style="padding:.25rem .6rem;text-align:right;">30</td><td style="padding:.25rem .6rem;text-align:right;">1.3 s</td></tr><tr data-pop-title="Sent frame" data-pop="Green up-arrow: sent by the browser. Red down-arrow: received from the server. Data is the payload (text or binary), Length is bytes and Time is seconds since the connection opened." style="border-top:1px solid var(--d-border);background:color-mix(in srgb,#43a047 10%,transparent);"><td style="padding:.25rem .6rem;color:#43a047;font-weight:700;">↑</td><td style="padding:.25rem .6rem;">[binary frame]</td><td style="padding:.25rem .6rem;text-align:right;">256</td><td style="padding:.25rem .6rem;text-align:right;">2.0 s</td></tr></tbody></table><div style="margin-top:.6rem;font-size:.75rem;"><span style="color:#43a047;">↑ green = sent by browser</span> &nbsp; <span style="color:#e53935;">↓ red = received from server</span></div></div>
```

**Columns:**
- **Direction arrow**: green up-arrow = sent by browser, red down-arrow = received from server
- **Data**: the message payload (text or binary)
- **Length**: message size in bytes
- **Time**: elapsed time since connection opened

### Filtering WebSocket Messages

Above the messages list:
- **All / Send / Receive** dropdown — filter by direction
- Text search box — filter messages containing a string
- Regex toggle

### WebSocket Timing

The Timing tab for a WebSocket connection shows:
- Connection establishment phases (same as HTTP: DNS, TCP, TLS)
- Time the connection has been open

### Binary Frames

Binary frames are shown as `[binary message]` with their size. Click the message to see a hex dump or base64 representation.

### Use Cases

- Debug real-time data feeds (stock prices, live scores, chat)
- Verify message ordering and timing
- Check that reconnection logic fires correctly after server closes connection
- Inspect compression of WebSocket frames

---

## Server-Sent Events (SSE)

Server-Sent Events connections also appear in the Network table, with type **eventsource**. SSE is a one-directional persistent HTTP connection where the server pushes events to the browser using the `text/event-stream` content type.

Click the SSE connection row and open the **EventStream** tab (similar to Messages for WebSockets).

```
+---+--------------------------------------------+------+------+
|   | Data                                       | Size | Time |
+---+--------------------------------------------+------+------+
|   | event: connected                           |   18 |  0ms |
|   | id: 1                                      |      |      |
|   | data: {"userId": 42}                       |      |      |
|   |                                            |      |      |
|   | event: notification                        |   45 |  500 |
|   | id: 2                                      |      |      |
|   | data: {"type":"message","from":"bob"}      |      |      |
+---+--------------------------------------------+------+------+
```

Each SSE message shows its `event` name, `id`, and `data` fields. The EventStream tab parses the raw `text/event-stream` format into readable rows.

**Note:** The raw response in the Response tab shows the full stream as it arrived, which can be useful to see the exact formatting.

---

## Protocol Version

Every request shows its HTTP protocol version. To see it at a glance, add the **Protocol** column to the request table (right-click any column header → Protocol).

| Protocol Value | Meaning |
|---------------|---------|
| `http/1.0` | HTTP/1.0 — very old, no keep-alive by default |
| `http/1.1` | HTTP/1.1 — persistent connections, pipelining, most common for legacy |
| `h2` | HTTP/2 — binary, multiplexed, header compression (HPACK), server push |
| `h3` | HTTP/3 — runs over QUIC (UDP), multiplexed without head-of-line blocking |

**How to verify your server uses HTTP/2:**

1. Add the Protocol column to the table
2. Reload the page
3. Look at your main document and API requests — they should show `h2`
4. If they show `http/1.1`, your server or CDN is not configured for HTTP/2

**HTTP/2 vs HTTP/1.1 in the waterfall:**

With HTTP/1.1, requests queue up because only 6 connections per host are allowed. You see a staircase pattern. With HTTP/2, requests to the same host are multiplexed over a single connection and start almost simultaneously. The waterfall looks like a vertical column of parallel bars instead of a staircase.

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div data-pop-title="HTTP/1.1" data-pop="Max 6 connections per host → later requests queue, staircase shape." style="margin-bottom:1rem;"><div style="font-weight:700;margin-bottom:.4rem;">HTTP/1.1 <span style="font-weight:400;color:var(--d-muted);">— max 6 connections per host → later requests queue, staircase shape</span></div><div style="position:relative;"><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">index.html</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:0%;width:12%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">a.js</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">b.js</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">c.css</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">d.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">e.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">f.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">g.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:24%;width:10%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">h.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:24%;width:10%;height:100%;background:#fb8c00;border-radius:2px;"></i></div></div></div></div><div data-pop-title="HTTP/2 (h2)" data-pop="One multiplexed connection → parallel bars start together." style="margin-bottom:1rem;"><div style="font-weight:700;margin-bottom:.4rem;">HTTP/2 (h2) <span style="font-weight:400;color:var(--d-muted);">— one multiplexed connection → parallel bars start together</span></div><div style="position:relative;"><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">index.html</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:0%;width:12%;height:100%;background:#43a047;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">a.js</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">b.js</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">c.css</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">d.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">e.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">f.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">g.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></div><div style="display:flex;align-items:center;height:1.3rem;"><div style="width:6rem;flex:none;font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">h.png</div><div style="position:relative;flex:1;height:.6rem;"><i style="position:absolute;left:13%;width:10%;height:100%;background:#43a047;border-radius:2px;"></i></div></div></div></div></div>
```

---

## Security Info Per Request

In the request detail pane, the **Security** tab (sometimes appears inside Headers or as a separate tab depending on Chrome version) shows TLS/certificate details for the connection.

**What it shows:**

```
Connection
  Protocol:        TLS 1.3
  Key exchange:    X25519
  Cipher:          AES_128_GCM

Certificate
  Subject:         api.example.com
  Issuer:          DigiCert TLS RSA SHA256 2020 CA1
  Valid from:      Jul 1, 2026
  Valid to:        Jul 1, 2027
  SAN:             api.example.com, *.example.com

Certificate Transparency
  Passed (2 SCTs)
```

**Use cases:**
- Verify TLS version (should be 1.2 or 1.3; 1.0 and 1.1 are deprecated)
- Check certificate expiration date
- Debug mixed content warnings — find which requests are HTTP on an HTTPS page
- Verify the right certificate is being served for a domain after cert renewal
- Check SAN (Subject Alternative Names) to see which domains the cert covers

For full certificate details, you can also click the padlock icon in the browser's address bar or open the **Security** panel in DevTools (Application → Security or the Security top-level tab).

---

## DOMContentLoaded and Load Event Lines

Two vertical lines appear across the waterfall timeline and correspond to browser events:

**Blue dashed line — DOMContentLoaded**

Fires when the HTML document has been completely parsed and all deferred scripts have executed. The DOM is built and interactive at this point. Stylesheets and images may still be loading. JavaScript registered with `document.addEventListener('DOMContentLoaded', ...)` runs here.

**Red dashed line — Load event**

Fires when the entire page has finished loading, including all dependent resources: images, scripts, stylesheets, iframes. JavaScript registered with `window.onload` or `window.addEventListener('load', ...)` runs here.


```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="position:relative;min-width:520px;height:7.5rem;margin:0 1rem;"><div style="position:absolute;left:0;right:0;top:2.2rem;height:4px;background:var(--d-border);border-radius:2px;"></div><div data-pop-title="Navigation start" data-pop="Time zero of the waterfall: the browser begins loading the page." style="position:absolute;left:0%;top:0;transform:translateX(-50%);text-align:center;width:9rem;"><div style="font-size:.78rem;font-weight:700;color:#757575;">Navigation start</div><div style="width:.9rem;height:.9rem;border-radius:50%;background:#757575;margin:.55rem auto .4rem;"></div><div style="font-size:.7rem;color:var(--d-muted);"></div></div><div data-pop-title="HTML parsed" data-pop="The parser has read the whole document and built the DOM. Render-blocking scripts or CSS in `&lt;head&gt;` delay this." style="position:absolute;left:18%;top:0;transform:translateX(-50%);text-align:center;width:9rem;"><div style="font-size:.78rem;font-weight:700;color:#757575;">HTML parsed</div><div style="width:.9rem;height:.9rem;border-radius:50%;background:#757575;margin:.55rem auto .4rem;"></div><div style="font-size:.7rem;color:var(--d-muted);">DOM built</div></div><div data-pop-title="DOMContentLoaded (blue line)" data-pop="Fires when the HTML is fully parsed and deferred scripts have executed. `document.addEventListener(&#x27;DOMContentLoaded&#x27;, ...)` runs here. Healthy: under 500 ms excellent, under 1.5 s good, over 3 s needs work." style="position:absolute;left:45%;top:0;transform:translateX(-50%);text-align:center;width:9rem;"><div style="font-size:.78rem;font-weight:700;color:#1e88e5;">DOMContentLoaded</div><div style="width:.9rem;height:.9rem;border-radius:50%;background:#1e88e5;margin:.55rem auto .4rem;"></div><div style="font-size:.7rem;color:var(--d-muted);">DOM ready, deferred scripts run</div></div><div data-pop-title="Load (red line)" data-pop="Fires when the page and all dependent resources (images, scripts, stylesheets, iframes) are loaded. `window.onload` runs here. Healthy: under 1 s excellent, under 3 s good, over 5 s needs work." style="position:absolute;left:85%;top:0;transform:translateX(-50%);text-align:center;width:9rem;"><div style="font-size:.78rem;font-weight:700;color:#e53935;">load</div><div style="width:.9rem;height:.9rem;border-radius:50%;background:#e53935;margin:.55rem auto .4rem;"></div><div style="font-size:.7rem;color:var(--d-muted);">images, CSS, iframes done</div></div></div><div style="display:flex;flex-wrap:wrap;gap:1rem;font-size:.78rem;margin-top:.3rem;"><span><b style="color:#1e88e5;">Blue</b> dashed line in waterfall = DOMContentLoaded</span><span><b style="color:#e53935;">Red</b> dashed line = load</span></div></div>
```

The status bar at the bottom of the Network panel shows the times:
```
47 requests | 2.1 MB transferred | DOMContentLoaded: 890 ms | Load: 1.38 s
```

**What healthy numbers look like:**

| Metric | Excellent | Good | Needs work |
|--------|-----------|------|------------|
| DOMContentLoaded | < 500 ms | < 1.5 s | > 3 s |
| Load | < 1 s | < 3 s | > 5 s |

**What causes late DOMContentLoaded:**
- Render-blocking `<script>` tags in `<head>` without `async` or `defer`
- Large synchronous CSS files that block rendering
- Slow server response for the HTML document

**What causes late Load after DOMContentLoaded:**
- Large unoptimized images
- Many large JavaScript bundles
- Third-party scripts that load additional resources
- Slow API calls triggered by scripts

---

## Complete Debugging Walkthrough

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="display:flex;flex-wrap:wrap;align-items:stretch;gap:.4rem .2rem;"><div style="display:flex;align-items:center;"><div data-pop-title="Step 1: Open DevTools and enable Preserve log" data-pop="F12, Network tab, tick Preserve log. Without it, a redirect or page reload clears the failing request." style="border:2px solid #1e88e5;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#1e88e5 12%,transparent);"><div style="font-size:.65rem;color:#1e88e5;font-weight:700;">STEP 1</div>Open DevTools<br>Preserve log</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 2: Reproduce the failure" data-pop="Perform the action that breaks (submit the form, click the button) with recording on." style="border:2px solid #1e88e5;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#1e88e5 12%,transparent);"><div style="font-size:.65rem;color:#1e88e5;font-weight:700;">STEP 2</div>Reproduce<br>the failure</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 3: Find the request" data-pop="Use the filter (Fetch/XHR, `status-code:4`, `domain:`) or sort by Status to find the failing row, usually red." style="border:2px solid #1e88e5;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#1e88e5 12%,transparent);"><div style="font-size:.65rem;color:#1e88e5;font-weight:700;">STEP 3</div>Find the<br>request</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 4: Read the status code" data-pop="4xx = client error (401 auth, 403 forbidden, 404 missing, 422 validation); 5xx = server error. See the Status Code Reference." style="border:2px solid #e53935;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#e53935 12%,transparent);"><div style="font-size:.65rem;color:#e53935;font-weight:700;">STEP 4</div>Read the<br>status code</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 5: Check the Payload tab" data-pop="Confirm the request body or query string is what you think you sent." style="border:2px solid #fb8c00;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#fb8c00 12%,transparent);"><div style="font-size:.65rem;color:#fb8c00;font-weight:700;">STEP 5</div>Check<br>Payload</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 6: Check the Response tab" data-pop="Servers often explain the failure in the response body, e.g. a validation message." style="border:2px solid #fb8c00;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#fb8c00 12%,transparent);"><div style="font-size:.65rem;color:#fb8c00;font-weight:700;">STEP 6</div>Check<br>Response</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 7: Check Headers for clues" data-pop="Look at Authorization, Content-Type, cookies and CORS headers." style="border:2px solid #fb8c00;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#fb8c00 12%,transparent);"><div style="font-size:.65rem;color:#fb8c00;font-weight:700;">STEP 7</div>Check<br>Headers</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 8: Rule out performance" data-pop="Open Timing to see whether the problem is slowness (TTFB) or an actual error." style="border:2px solid #8e24aa;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#8e24aa 12%,transparent);"><div style="font-size:.65rem;color:#8e24aa;font-weight:700;">STEP 8</div>Rule out<br>Timing</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 9: Copy as cURL" data-pop="Right-click, Copy, Copy as cURL; replay it in a terminal to isolate browser from server." style="border:2px solid #43a047;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#43a047 12%,transparent);"><div style="font-size:.65rem;color:#43a047;font-weight:700;">STEP 9</div>Copy as<br>cURL</div><span style="padding:0 .25rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div data-pop-title="Step 10-11: Fix and verify" data-pop="Fix the code, repeat the flow, and confirm the request now returns 2xx." style="border:2px solid #43a047;border-radius:8px;padding:.45rem .65rem;text-align:center;font-size:.76rem;background:color-mix(in srgb,#43a047 12%,transparent);"><div style="font-size:.65rem;color:#43a047;font-weight:700;">STEP 10</div>Fix &amp;<br>verify</div></div></div></div>
```

A step-by-step example: you have a form that submits user data to an API, and it's failing silently. Here is the full debugging process.

### Step 1: Open DevTools and Enable Preserve Log

```
F12 → Network tab → check "Preserve log"
```

Preserve log is critical here — without it, if the form submission causes a page redirect or reload, the request disappears.

### Step 2: Reproduce the Failure

Submit the form. The failing request appears in the table.

### Step 3: Find the Request

Filter by `Fetch/XHR` using the type buttons to hide images, fonts, and scripts. Look for:
- Red status codes (4xx or 5xx rows are highlighted in red)
- Your API endpoint URL

```
Name                    Status  Type   Time
POST /api/users/create  422     fetch  45ms   ← this one
```

### Step 4: Read the Status Code

422 Unprocessable Entity means the request reached the server but the server rejected the data due to validation errors.

### Step 5: Check the Payload Tab

Click the request row → **Payload** tab. Look at what was sent:

```json
{
  "name": "Alice Smith",
  "email": "alice@",
  "role": "admin"
}
```

The email address is malformed — `alice@` with no domain. The form's client-side validation missed it.

### Step 6: Check the Response Tab

Click **Response** tab to see the server's error message:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

This confirms the diagnosis: invalid email, server-side validation caught it.

### Step 7: Check Headers for Clues

Click the **Headers** tab. Check:
- `content-type: application/json` is present in the request — the body is being sent as JSON, not form data
- The `authorization` header is present and has a Bearer token
- The response has `content-type: application/json` confirming the error response is parseable

### Step 8: Check Timing to Rule Out Performance Issues

Click the **Timing** tab. If TTFB was <50ms, the server responded quickly, ruling out a timeout. This confirms it's a data problem, not a network problem.

### Step 9: Copy as cURL for Isolated Testing

Right-click the request → **Copy as cURL (bash)**. Paste into terminal:

```bash
curl 'https://api.example.com/api/users/create' \
  -H 'authorization: Bearer eyJ...' \
  -H 'content-type: application/json' \
  --data-raw '{"name":"Alice Smith","email":"alice@","role":"admin"}'
```

Run it in terminal to confirm the same 422 happens outside the browser, then modify the payload to test the fix:

```bash
  --data-raw '{"name":"Alice Smith","email":"alice@example.com","role":"admin"}'
```

This should return 201 Created.

### Step 10: Fix the Code

Now you know:
1. The field causing the error (`email`)
2. The exact validation rule it violated
3. The server's error response format (for proper error display in the UI)

Fix: add email validation to the client-side form handler and add proper error message display that reads `response.details[0].message`.

### Step 11: Verify the Fix

After deploying the fix, reload and submit again. Check the Network panel:
- The POST request should return `201 Created`
- The Payload tab should show the corrected email
- The Response tab should show the success response

---

## Status Code Reference

| Code | Text | Meaning |
|------|------|---------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created (POST/PUT) |
| 204 | No Content | Success, no response body |
| 301 | Moved Permanently | Permanent redirect |
| 302 | Found | Temporary redirect |
| 304 | Not Modified | Cached response is valid; use it |
| 400 | Bad Request | Malformed request syntax |
| 401 | Unauthorized | Not authenticated (no or invalid credentials) |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource does not exist |
| 405 | Method Not Allowed | HTTP method not allowed on this endpoint |
| 409 | Conflict | Request conflicts with current state (duplicate) |
| 410 | Gone | Resource permanently deleted |
| 422 | Unprocessable Entity | Request understood but validation failed |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Generic server-side error |
| 502 | Bad Gateway | Upstream server returned invalid response |
| 503 | Service Unavailable | Server overloaded or down for maintenance |
| 504 | Gateway Timeout | Upstream server timed out |

**Grey/strikethrough status codes** in the Network table indicate a cached response served without contacting the server. A `(from memory cache)` or `(from disk cache)` label appears in the Size column.

---

## Quick Reference: Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Open DevTools | Cmd+Option+I | F12 or Ctrl+Shift+I |
| Open Network panel | Cmd+Option+I then Cmd+[ or Cmd+] to navigate | F12, then Ctrl+[ or ] |
| Clear requests | Cmd+Backspace | Ctrl+Delete |
| Start/stop recording | Cmd+E | Ctrl+E |
| Search request URLs | Cmd+F | Ctrl+F |
| Search all response content | Cmd+Shift+F | Ctrl+Shift+F |
| Hard reload (bypass cache) | Cmd+Shift+R | Ctrl+Shift+R |
| Close detail pane | Escape | Escape |
| Command Menu | Cmd+Shift+P | Ctrl+Shift+P |

---

[← Web Devtools](/coding/web-devtools/)
