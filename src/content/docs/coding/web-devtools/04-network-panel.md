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

```
+------------------------------------------------------------------+
|  TOOLBAR                                                         |
|  [Record] [Clear] [Filter] [Search] [Import] [Export HAR]       |
|  [Preserve log] [Disable cache] [No throttling v] [Settings]    |
+------------------------------------------------------------------+
|  FILTER BAR                                                      |
|  [Filter input box..................] [Invert] [Hide data URLs]   |
|  [All][Fetch/XHR][JS][CSS][Img][Media][Font][Doc][WS][Manifest] |
+------------------------------------------------------------------+
|  REQUEST TABLE                                                   |
|  Name       | Status | Type  | Initiator | Size  | Time | ...   |
|  ---------- | ------ | ----- | --------- | ----- | ---- | ...   |
|  index.html |  200   | doc   | Other     | 12 kB | 45ms | |>    |
|  main.js    |  200   | script| index:12  | 88 kB | 120ms| |-->  |
|  api/user   |  401   | fetch | app.js:45 | 312 B | 22ms | |>   |
|  logo.png   |  200   | png   | index:30  | 44 kB | 89ms | |---> |
|  ...        |        |       |           |       |      |       |
+----------------------------------+-------------------------------+
|  DETAIL PANE (appears on click)  |  WATERFALL COLUMN            |
|  Headers | Payload | Preview     |  (extends across the right)  |
|  Response | Initiator | Timing   |                              |
|  Cookies                         |                              |
+----------------------------------+-------------------------------+
|  STATUS BAR                                                      |
|  47 requests  |  2.1 MB transferred  |  8.4 MB resources  |     |
|  Finish: 1.40s | DOMContentLoaded: 890ms | Load: 1.38s          |
+------------------------------------------------------------------+
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

### ASCII Waterfall Diagram

```
Time (ms)  0    100   200   300   400   500   600   700   800
           |     |     |     |     |     |     |     |     |
           
index.html [=QDNS--TCP--TLS--][TTFB ][DL  ]
main.css                       [Q][s][TTFB][DL]
app.js                         [Q ][s][TTFB    ][DL   ]
logo.png                              [DNS][TCP][TTFB][DL]
api/data                                   [s][TTFB     ][DL]
analytics.js                          [Q       ][s][TTFB][D]

           |     |     |     |     |     |     |     |     |
           ^                  ^                        ^
           |                  |                        |
     Page start         DOMContentLoaded (blue)    Load event (red)
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

```
+--------+------------------+-------+----+
| Filter | [All v] [Search] |       |    |
+--------+------------------+-------+----+
| Dir | Data                       | Len|Time|
|  ↑  | {"type":"ping"}            |  15|0.1s|
|  ↓  | {"type":"pong"}            |  15|0.1s|
|  ↑  | {"type":"subscribe","ch":"prices"} |35|0.5s|
|  ↓  | {"type":"update","price":42.1}    |30|1.2s|
|  ↓  | {"type":"update","price":42.3}    |30|1.3s|
|  ↑  | [binary frame]             | 256|2.0s|
+-----+----------------------------+----+----+
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
