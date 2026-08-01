---
title: 08 Security Panel
---

# Chrome DevTools: Security Panel

The Security panel is the single place in DevTools to inspect HTTPS posture, certificate chains, TLS negotiation, mixed content, and per-origin security for any page. This guide walks from reading the overview state all the way to debugging CORS and SRI.

---

## What the Security Panel Shows

The Security panel aggregates every piece of security information Chrome collected while loading the page:

- Whether the main origin is served over HTTPS, and whether that HTTPS is valid
- The TLS version and cipher suite negotiated with the server
- The full X.509 certificate chain for the main origin
- Any mixed content (HTTPS page loading HTTP sub-resources)
- A per-origin breakdown so you can see which third-party origins are secure and which are not
- Certificate Transparency status

It does not replace the Network panel — it complements it. Think of the Security panel as a summary dashboard and the Network panel as the raw detail view.

---

## UI Layout (ASCII diagram)

```
+---------------------------------------------------------------+
|  DevTools  Elements  Console  Sources  Network  Security  ... |
+---------------------------------------------------------------+
|                                                               |
|  Security Overview                                            |
|  +----------------------------------------------------------+ |
|  |  [Green lock icon]  This page is secure (valid HTTPS)    | |
|  |                                                          | |
|  |  Certificate  ──────────────────────────────────────     | |
|  |    Subject:  example.com                                 | |
|  |    Issuer:   DigiCert TLS RSA SHA256 2020 CA1            | |
|  |    Expires:  2026-03-15                                  | |
|  |    [View certificate]                                    | |
|  |                                                          | |
|  |  Connection  ──────────────────────────────────────      | |
|  |    Protocol:    TLS 1.3                                  | |
|  |    Key exchange: X25519                                  | |
|  |    Cipher:       AES_128_GCM                             | |
|  |                                                          | |
|  |  Resources  ───────────────────────────────────────      | |
|  |    All served securely                                   | |
|  +----------------------------------------------------------+ |
|                                                               |
|  Origins                                                      |
|  +----------------------------------------------------------+ |
|  |  Main origin           example.com            [Secure]   | |
|  |  Third-party origins   cdn.example.com        [Secure]   | |
|  |                        analytics.example.com  [Secure]   | |
|  |                        old-api.example.com    [Not sec.] | |
|  +----------------------------------------------------------+ |
|                                                               |
+---------------------------------------------------------------+
```

Open the Security panel via:
- Menu: DevTools > Security tab (may be hidden under the `>>` overflow menu)
- Keyboard: there is no default shortcut; pin it via the DevTools settings panel
- Reload the page after opening — the Security panel only captures data for requests made while it is open

---

## Security Overview States

### Secure (green lock): HTTPS with valid certificate

Chrome shows a green lock (or the word "Secure" depending on Chrome version) when:

1. The main document was loaded over HTTPS
2. The TLS certificate is signed by a trusted CA, is not expired, and the hostname matches
3. No active mixed content was found
4. The certificate chain is complete and valid

The overview message reads: *"This page is secure (valid HTTPS)."*

### Not Secure (red warning triangle): HTTP or certificate error

Chrome shows the red indicator when:

- The page was loaded over plain HTTP (`http://`)
- The TLS certificate is expired, self-signed without being trusted, or the hostname does not match
- An active mixed content resource was found (blocking it downgrades the indicator)

The overview message describes the specific problem, for example: *"Your connection to this site is not fully secure"* or *"This page is not secure (broken HTTPS)."*

### Info (grey info icon): HTTPS but with issues

Chrome uses the grey/info indicator for HTTPS pages that have minor problems:

- Passive mixed content that was loaded (images, video) rather than blocked
- A legacy TLS version (TLS 1.0 or 1.1)
- Certain certificate transparency issues

The page technically loaded over HTTPS, but Chrome wants to draw attention to a non-critical security concern.

---

## Certificate Details

Click "View certificate" in the Security panel overview or click on a specific origin in the Origins list to see its certificate.

### Subject

The subject field identifies the entity the certificate was issued to:

- **Common Name (CN)** — historically the hostname (e.g., `example.com`). Modern certificates still populate this field but browsers now rely on Subject Alternative Names.
- **Subject Alternative Names (SANs)** — the authoritative list of hostnames covered by the certificate. A single certificate can cover many names:
  ```
  DNS: example.com
  DNS: www.example.com
  DNS: api.example.com
  ```
  Wildcard SANs like `*.example.com` cover one level of subdomain.

### Issuer

The issuer identifies the Certificate Authority (CA) that signed the certificate. You will typically see a two- or three-level chain:

```
Root CA:          DigiCert Global Root CA
Intermediate CA:  DigiCert TLS RSA SHA256 2020 CA1
Leaf cert:        example.com
```

### Validity period

Every certificate has a `Not Before` and `Not After` date. Chrome rejects certificates presented before or after these dates with `NET::ERR_CERT_DATE_INVALID`. Since 2020, public CAs cap validity at 398 days.

### Certificate chain (root CA → intermediate → leaf)

Browsers ship with a built-in list of trusted root CAs. Because root CAs rarely sign leaf certificates directly, there is at least one intermediate CA in between:

```
[Root CA]  — self-signed, trusted by OS/browser trust store
    |
    v
[Intermediate CA]  — signed by Root CA
    |
    v
[Leaf certificate]  — signed by Intermediate CA, issued to your domain
```

The server must send the full chain (leaf + all intermediates) in the TLS handshake. If the server omits an intermediate, browsers that have not cached it will show a certificate error even though the root is trusted. This is a common deployment mistake.

### Public key algorithm and signature algorithm

| Field | Example value | Notes |
|---|---|---|
| Public key | RSA 2048-bit | RSA keys under 2048 bits are distrusted |
| Public key | EC 256-bit (prime256v1) | ECDSA is smaller and faster than RSA |
| Signature algorithm | sha256WithRSAEncryption | SHA-1 signatures were deprecated in 2017 |
| Signature algorithm | ecdsa-with-SHA256 | Common for ECDSA leaf certs |

### Certificate Transparency (CT) logs

CT is a public, append-only log of every certificate a CA issues. Browsers require that certificates be logged in at least two independent CT logs before they will be trusted without an error.

**Why it exists:** Before CT, a compromised CA could issue a certificate for any domain and browsers would trust it silently. CT makes it impossible to issue a certificate without it appearing in a public audit trail. Domain owners can monitor CT logs to detect misissued certificates for their domains within hours.

**What DevTools shows:** The Security panel shows "Certificate Transparency: Certificate is CT-qualified" when the certificate carries valid Signed Certificate Timestamps (SCTs). SCTs can be embedded in the certificate itself, in a TLS extension, or in a stapled OCSP response.

If CT is not satisfied you will see a warning, and in some contexts (Chrome Enterprise, HSTS preloaded domains) the connection will be refused.

---

## Connection Details

The Connection section in the Security panel summary shows what was negotiated during the TLS handshake.

### TLS version: TLS 1.0/1.1 (deprecated), TLS 1.2, TLS 1.3

| Version | Year | Status | Notes |
|---|---|---|---|
| TLS 1.0 | 1999 | Deprecated/blocked | Chrome and Firefox block by default since 2020; POODLE, BEAST |
| TLS 1.1 | 2006 | Deprecated/blocked | Blocked alongside TLS 1.0 |
| TLS 1.2 | 2008 | Supported | Still widely used; secure when configured correctly |
| TLS 1.3 | 2018 | Preferred | Removed weak primitives, 1-RTT handshake, 0-RTT resumption |

TLS 1.3 differences worth knowing:
- Removed RSA key exchange, CBC mode ciphers, MD5, SHA-1
- Handshake is encrypted earlier, hiding more metadata
- 1-RTT by default (vs 2-RTT in TLS 1.2), 0-RTT session resumption available (with replay risk)
- Forward secrecy is mandatory — all key exchange uses ephemeral Diffie-Hellman

### Cipher suite breakdown

A cipher suite is a colon-separated string that names every algorithm in the TLS session. For TLS 1.2:

```
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
     ^     ^        ^         ^
     |     |        |         |
     |     |        |         MAC / PRF algorithm
     |     |        Bulk encryption (AES-256 in GCM mode)
     |     Authentication (RSA certificate)
     Key exchange (ECDHE = Elliptic Curve Diffie-Hellman Ephemeral)
```

In TLS 1.3 cipher suites are shorter because key exchange and authentication are no longer part of the suite name:

```
TLS_AES_256_GCM_SHA384
     ^          ^
     Bulk encryption  MAC
```

| Component | Example | Notes |
|---|---|---|
| Key exchange | ECDHE (P-256, X25519) | Ephemeral = forward secrecy |
| Key exchange | RSA | Static; no forward secrecy; removed in TLS 1.3 |
| Authentication | RSA | Server proves identity using its RSA private key |
| Authentication | ECDSA | Smaller signatures than RSA |
| Bulk encryption | AES-128-GCM | AEAD — provides confidentiality and integrity together |
| Bulk encryption | AES-256-GCM | Stronger but ~10% slower; use when required by compliance |
| Bulk encryption | CHACHA20-POLY1305 | Fast on devices without AES hardware acceleration |
| MAC / hash | SHA256, SHA384 | HMAC-based in TLS 1.2; integrated in AEAD in TLS 1.3 |

### Forward secrecy (ECDHE) — why it matters

Without forward secrecy (RSA key exchange), someone who records your encrypted traffic today and later compromises your server's private key can decrypt everything retroactively.

With forward secrecy, each TLS session uses an ephemeral (one-time) Diffie-Hellman key pair. The session key is derived from the ephemeral pair, not from the server's long-term private key. Even if the server key is stolen later, past sessions cannot be decrypted.

ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) is the modern implementation. X25519 is the preferred curve — fast, constant-time, and free of the implementation pitfalls in older NIST curves. Chrome prefers `X25519` or `P-256` for ECDHE.

DevTools shows "Key exchange: X25519" or "Key exchange group: P-256" in the Connection section when forward secrecy is active.

---

## Mixed Content

Mixed content occurs when an HTTPS page loads resources over HTTP. It undermines HTTPS because an attacker on the network can modify the HTTP sub-resources.

### Active mixed content (scripts, iframes, XHR) — blocked by browsers

Active mixed content can manipulate the DOM, intercept credentials, or redirect users. Chrome blocks it by default:

- `<script src="http://...">`
- `<iframe src="http://...">`
- `XMLHttpRequest` / `fetch` to `http://`
- `<link rel="stylesheet" href="http://...">`
- Fonts loaded over HTTP

When active mixed content is blocked, the Security panel shows a red indicator and the Console shows an error like:

```
Mixed Content: The page at 'https://example.com' was loaded over HTTPS, but 
requested an insecure resource 'http://cdn.example.com/script.js'. 
This request has been blocked; the content must be served over HTTPS.
```

### Passive mixed content (images) — loaded with warning

Passive mixed content cannot modify the page but leaks the fact that the user is on the page (Referer) and can be intercepted:

- `<img src="http://...">`
- `<video src="http://...">`
- `<audio src="http://...">`

Browsers load passive mixed content but show the grey "Info" indicator instead of the green lock.

### How to find mixed content

**Security panel:** The overview states "This page is not fully secure" and the Origins section flags which origins served insecure resources.

**Console:** Filter by the "Warnings" level. Look for "Mixed Content:" messages that include the exact URL of the insecure resource.

**Network panel filter:** Open Network panel, type `is:mixed-content` in the filter bar (Chrome 80+). This lists only the requests Chrome identified as mixed content.

**Lighthouse:** Run a Lighthouse audit — it includes a "Uses HTTPS" check that lists all mixed content URLs.

### How to fix mixed content

**1. Upgrade all URLs to HTTPS directly:**
```html
<!-- Before -->
<img src="http://cdn.example.com/logo.png">
<script src="http://cdn.example.com/analytics.js"></script>

<!-- After -->
<img src="https://cdn.example.com/logo.png">
<script src="https://cdn.example.com/analytics.js"></script>
```

**2. Use protocol-relative URLs (legacy approach, less recommended):**
```html
<img src="//cdn.example.com/logo.png">
```
The browser inherits the current page's protocol. Avoid this on pages that may also be served over HTTP.

**3. CSP `upgrade-insecure-requests` directive:**

Add this HTTP response header to instruct the browser to upgrade HTTP sub-resource URLs to HTTPS automatically before fetching:

```
Content-Security-Policy: upgrade-insecure-requests
```

Or as a `<meta>` tag (applies only to the current document, not headers):
```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

This is a migration aid — fix the URLs in source when you can.

---

## Origins Section

The Origins list in the left sidebar of the Security panel shows every origin that made a network request during the page load. Click any origin to see its certificate and connection details.

Each origin shows one of three states:

| State | Meaning |
|---|---|
| Secure | HTTPS with a valid certificate and no issues |
| Not secure | HTTP request or certificate error |
| Unknown / no security info | Requests served from cache with no new network negotiation |

This is useful for auditing third-party dependencies. If `cdn.analytics-provider.com` shows "Not secure", that is an active or passive mixed content problem you need to resolve even though it is not your own origin.

Clicking a third-party origin shows the same certificate chain and TLS details as the main origin, letting you verify the TLS posture of every resource on the page.

---

## Common Certificate Errors

### NET::ERR_CERT_AUTHORITY_INVALID

The certificate was signed by a CA that Chrome does not trust. Common causes:

- Self-signed certificate in a development environment
- Corporate MITM proxy injecting its own certificate (the proxy root is not in Chrome's trust store)
- Missing intermediate certificate (the server did not send the full chain)

**Development fix:** Import the self-signed certificate into your OS trust store (Keychain Access on macOS, Certificate Manager on Windows) and mark it as trusted for SSL. Chrome uses the OS trust store on macOS and Windows.

**Production fix:** Use a certificate from a publicly trusted CA (Let's Encrypt is free) and ensure the server sends the complete chain.

### NET::ERR_CERT_DATE_INVALID

The certificate's `Not After` date is in the past (expired) or the `Not Before` date is in the future (not yet valid). Also appears if the client's system clock is significantly wrong.

**Fix:** Renew the certificate. Automate renewal with certbot or a managed certificate service so you never hit this in production. On Let's Encrypt, renewal at 60 days (before the 90-day expiry) is the standard practice.

### NET::ERR_CERT_COMMON_NAME_INVALID

The hostname the browser is connecting to does not appear in the certificate's SANs (or CN for legacy certificates). Common causes:

- Connecting to an IP address but the certificate only covers a hostname
- www vs. non-www mismatch (`www.example.com` cert used on `example.com`)
- Subdomain not listed in SANs
- Certificate from one domain accidentally deployed to a different domain

**Fix:** Issue a certificate that includes all hostnames you serve. Wildcard certificates (`*.example.com`) cover one subdomain level.

### NET::ERR_SSL_PROTOCOL_ERROR

Chrome and the server could not agree on a TLS version or cipher suite. Common causes:

- Server only supports TLS 1.0/1.1 which Chrome has disabled
- Server is misconfigured and sends a malformed handshake
- Firewall or middlebox is interfering with the TLS handshake

**Fix:** Configure the server to offer TLS 1.2 and TLS 1.3. Disable TLS 1.0 and 1.1. For nginx:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
ssl_prefer_server_ciphers off;
```

---

## Content Security Policy (CSP)

CSP is an HTTP response header that tells the browser which sources are allowed to load each type of content. It is the strongest defence against cross-site scripting (XSS) after input sanitisation.

### Reading CSP headers in the Network panel

1. Open Network panel, click the main document request (usually the first entry)
2. Click the "Headers" tab
3. Scroll to "Response Headers"
4. Look for `Content-Security-Policy` or `Content-Security-Policy-Report-Only`

Example:
```
Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com; img-src *; report-uri /csp-report
```

### CSP violations in the Console

When a resource is blocked by CSP, the browser logs an error in the Console:

```
Refused to load the script 'https://evil.com/bad.js' because it violates the 
following Content Security Policy directive: "script-src 'self' cdn.example.com".
```

The error includes the blocked URL, the violated directive, and the effective CSP source list. Use these errors to tighten or fix your policy.

### Common CSP directives

| Directive | Controls | Example value |
|---|---|---|
| `default-src` | Fallback for all resource types not listed explicitly | `'self'` |
| `script-src` | JavaScript sources: `<script>`, `eval()`, inline handlers | `'self' cdn.example.com 'nonce-abc123'` |
| `style-src` | CSS sources: `<style>`, `<link rel="stylesheet">`, inline styles | `'self' 'nonce-abc123'` |
| `img-src` | Image sources: `<img>`, CSS `background-image` | `'self' data: https:` |
| `connect-src` | Fetch, XHR, WebSocket, EventSource destinations | `'self' https://api.example.com` |
| `font-src` | Web font sources | `'self' https://fonts.gstatic.com` |
| `frame-src` | Sources for `<iframe>` | `'none'` |
| `frame-ancestors` | Which pages may embed this page in a frame | `'self'` — equivalent to X-Frame-Options: SAMEORIGIN |
| `object-src` | `<object>`, `<embed>`, `<applet>` | `'none'` — disable Flash/Java |
| `base-uri` | Restricts `<base href>` | `'self'` |
| `upgrade-insecure-requests` | Upgrades HTTP sub-resource URLs to HTTPS | (no value, flag directive) |
| `block-all-mixed-content` | Blocks all mixed content (stricter than default) | (no value, flag directive) |
| `report-uri` | URL to POST violation reports to (legacy) | `/csp-report` |
| `report-to` | Reporting API group name (modern replacement for report-uri) | `csp-endpoint` |

### Nonces and hashes for inline scripts

Instead of `'unsafe-inline'` (which defeats the purpose of CSP for scripts), use nonces:

```http
Content-Security-Policy: script-src 'nonce-rAnd0mV4lue=='
```

```html
<script nonce="rAnd0mV4lue==">
  // This inline script is allowed
</script>
```

Generate a new nonce per request. An attacker cannot predict it, so they cannot inject a script that passes the nonce check.

### Report-only mode

Use `Content-Security-Policy-Report-Only` to test a policy without enforcing it:

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

Violations appear in the Console and are sent to the report-uri but resources are not blocked. This lets you audit the impact of a new policy before turning it on.

---

## Important Security Headers

These HTTP response headers are separate from CSP but complement it. Check them in Network panel > Headers > Response Headers.

| Header | Purpose | Example value |
|---|---|---|
| `Strict-Transport-Security` | Tells browsers to only use HTTPS for this domain for a defined period | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | Prevents browsers from MIME-sniffing responses away from the declared Content-Type | `nosniff` |
| `X-Frame-Options` | Controls whether the page can be embedded in a frame (legacy; use CSP `frame-ancestors` instead) | `DENY` or `SAMEORIGIN` |
| `Referrer-Policy` | Controls how much referrer information is included with requests | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Restricts browser features (camera, geolocation, microphone, etc.) per origin | `camera=(), microphone=(), geolocation=(self)` |
| `Cross-Origin-Opener-Policy` (COOP) | Isolates the browsing context group; required for SharedArrayBuffer | `same-origin` |
| `Cross-Origin-Embedder-Policy` (COEP) | Requires all sub-resources to opt in to cross-origin embedding; required for SharedArrayBuffer | `require-corp` |
| `Cross-Origin-Resource-Policy` (CORP) | Restricts which origins may load a resource | `same-origin` or `cross-origin` |

### Strict-Transport-Security (HSTS) in depth

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- `max-age=31536000` — remember for 1 year (in seconds). Each visit resets the clock.
- `includeSubDomains` — apply HSTS to all subdomains. Do not add this until all subdomains serve HTTPS.
- `preload` — request inclusion in Chrome's built-in HSTS preload list. Browsers will refuse HTTP before ever making a request. Requires hstspreload.org submission.

### X-Content-Type-Options

```http
X-Content-Type-Options: nosniff
```

Without this, Internet Explorer and legacy browsers guess the content type from the content itself. An attacker who can upload an image with embedded JavaScript could have it executed if the browser sniffs it as `text/html`. `nosniff` forces the browser to use the declared `Content-Type`.

### Referrer-Policy

```http
Referrer-Policy: strict-origin-when-cross-origin
```

| Value | Behaviour |
|---|---|
| `no-referrer` | Never send Referer header |
| `no-referrer-when-downgrade` | Send full URL on same-protocol, nothing on HTTPS→HTTP |
| `origin` | Send only the origin (no path) |
| `origin-when-cross-origin` | Full URL same-origin, origin only cross-origin |
| `strict-origin-when-cross-origin` | Full URL same-origin, origin on HTTPS→HTTPS, nothing on HTTPS→HTTP (browser default since Chrome 85) |
| `unsafe-url` | Always send full URL — leaks paths to third parties |

### Cross-Origin-Opener-Policy (COOP) and Cross-Origin-Embedder-Policy (COEP)

These two headers together opt a page into cross-origin isolation, which is required to use `SharedArrayBuffer` and high-resolution timers (Spectre mitigations):

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

COOP `same-origin` prevents other windows from obtaining a reference to this window unless they are same-origin. COEP `require-corp` prevents loading cross-origin resources unless they include a `Cross-Origin-Resource-Policy` response header explicitly allowing it.

---

## CORS Debugging

Cross-Origin Resource Sharing (CORS) controls which origins can read responses from `fetch` and `XMLHttpRequest`. Chrome enforces CORS; DevTools shows you exactly what went wrong.

### Reading CORS preflight in the Network panel

For requests that are not "simple" (e.g., they use PUT/DELETE, custom headers, or JSON content-type), the browser sends an `OPTIONS` preflight request first:

1. Open Network panel
2. Look for an `OPTIONS` request to the same URL — it appears just before the actual request
3. Click it, go to Headers tab
4. Check Request Headers for `Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`
5. Check Response Headers for `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.

If the preflight fails (e.g., the server returns 403 or missing CORS headers), the actual request is never sent and the Console shows:

```
Access to fetch at 'https://api.example.com/data' from origin 'https://app.example.com' 
has been blocked by CORS policy: Response to preflight request doesn't pass access 
control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Common CORS misconfigurations and fixes

| Problem | Symptom | Fix |
|---|---|---|
| Missing `Access-Control-Allow-Origin` | CORS error on all cross-origin requests | Add `Access-Control-Allow-Origin: https://app.example.com` to response |
| `Access-Control-Allow-Origin: *` with credentials | Error: "cannot use wildcard with credentials" | Use explicit origin, add `Access-Control-Allow-Credentials: true` |
| Preflight not handled | OPTIONS returns 404 or 405 | Add an OPTIONS route that returns CORS headers |
| Custom headers not listed | Request header blocked | Add header name to `Access-Control-Allow-Headers` |
| Method not listed | DELETE/PUT blocked | Add method to `Access-Control-Allow-Methods` |
| Short max-age on preflight | Repeated preflight requests slow down the app | Increase `Access-Control-Max-Age` (e.g., 7200 seconds) |

### CORS headers reference

| Header | Direction | Purpose | Example value |
|---|---|---|---|
| `Origin` | Request | Browser sends the requesting origin | `https://app.example.com` |
| `Access-Control-Request-Method` | Preflight request | Method the actual request will use | `PUT` |
| `Access-Control-Request-Headers` | Preflight request | Custom headers the actual request will include | `Content-Type, Authorization` |
| `Access-Control-Allow-Origin` | Response | Origins allowed to read the response | `https://app.example.com` or `*` |
| `Access-Control-Allow-Methods` | Preflight response | Methods allowed | `GET, POST, PUT, DELETE, OPTIONS` |
| `Access-Control-Allow-Headers` | Preflight response | Request headers allowed | `Content-Type, Authorization, X-Custom-Header` |
| `Access-Control-Allow-Credentials` | Response | Whether cookies/auth headers may be sent | `true` |
| `Access-Control-Max-Age` | Preflight response | How long (seconds) to cache the preflight result | `7200` |
| `Access-Control-Expose-Headers` | Response | Response headers the browser JS may read (beyond safe list) | `X-Request-Id, X-RateLimit-Remaining` |

---

## Subresource Integrity (SRI)

SRI lets you pin a specific cryptographic hash of an external resource. If the CDN is compromised and serves a modified file, the hash will not match and the browser will refuse to execute it.

### How it works

Add an `integrity` attribute to `<script>` or `<link>` tags:

```html
<script
  src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
  integrity="sha384-WuipHMVGmsAcOl8kGPEIv6aBEMlhDTb5rQ3ZtcWH2oBFxMz1IyFENy2VLRM9l+H"
  crossorigin="anonymous">
</script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/styles.css"
  integrity="sha256-abc123..."
  crossorigin="anonymous">
```

- `integrity` — the hash algorithm and base64-encoded digest, separated by `-`
- `crossorigin="anonymous"` — required for SRI on cross-origin resources; triggers a CORS request

### Generating SRI hashes

```bash
# Using openssl
curl -s https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js \
  | openssl dgst -sha384 -binary \
  | openssl base64 -A

# Using the SRI Hash Generator at https://www.srihash.org/
```

### Viewing SRI in DevTools

In the Network panel, if a resource fails SRI verification you will see it in the Console:

```
Failed to find a valid digest in the 'integrity' attribute for resource 
'https://cdn.example.com/script.js' with computed SHA-384 integrity 
'differentHashValue='. The resource has been blocked.
```

The resource appears in the Network panel with a failed status. Check the Security tab on the request row for the mismatch details.

### SRI best practices

- Use `sha384` or `sha512`; avoid `sha256` for new deployments (still secure but `sha384` is conventional for public CDN libraries)
- Always pair SRI with `crossorigin="anonymous"` for cross-origin resources
- Update the hash whenever you update the dependency version
- SRI does not protect against compromised same-origin resources — it is a CDN / third-party protection mechanism

---

## HSTS — Preloading and Seeing HSTS State

### How HSTS works

When a browser receives an HSTS header, it notes the domain and `max-age`. For the duration of `max-age`, all future HTTP requests to the domain are internally rewritten to HTTPS before any network request is made. No HTTP request ever leaves the browser.

```
User types:    http://example.com
Browser sees:  HSTS record for example.com exists, max-age not expired
Browser sends: https://example.com  (no HTTP request made)
```

### HSTS preload list

The Chrome HSTS preload list (`net/http/transport_security_state_static.json`) is baked into Chrome at build time. Sites on the preload list get HSTS enforcement from the very first visit, eliminating the "Trust On First Use" vulnerability where the first HTTP request could be intercepted.

To qualify for preload:
1. Serve a valid HTTPS certificate
2. Redirect all HTTP to HTTPS
3. Serve HSTS with `max-age` of at least 31536000 (1 year)
4. Include `includeSubDomains`
5. Include `preload`
6. Submit to hstspreload.org

### Seeing HSTS state in DevTools

**Method 1 — Network panel:** Make an HTTP request to the domain and watch Network panel. If HSTS is active, you will see a 307 Internal Redirect (not a 301 from the server) from `http://` to `https://`. The initiator is the browser itself.

**Method 2 — chrome://net-internals/#hsts:**
1. Navigate to `chrome://net-internals/#hsts`
2. Under "Query HSTS/PKP domain", enter the domain name
3. Click Query
4. The output shows whether the domain is in the dynamic HSTS list or the preload list, and when the entry expires

**Method 3 — Security panel:** If you load an HTTPS page and the HSTS header is present in the response, the Security panel shows it in the certificate/connection summary area.

### Removing an HSTS entry (during development)

If you set HSTS accidentally in development:
1. Go to `chrome://net-internals/#hsts`
2. Under "Delete domain security policies", enter the domain
3. Click Delete

This only removes it from your browser's dynamic list. Preloaded entries cannot be removed this way — they require a submission to the preload removal list.

---

## Per-Request Certificate Info (from Network Panel > Security Tab)

Every network request in the Network panel has a "Security" tab (visible when you click the request). This gives you per-request TLS details separate from the main Security panel.

### How to access it

1. Open Network panel
2. Click any HTTPS request (e.g., an API call, image, script)
3. In the request detail pane, click the "Security" tab

### What it shows

| Field | Description |
|---|---|
| Connection | The origin, port, and whether the connection was reused |
| Protocol | TLS version negotiated for this specific connection |
| Key exchange | Algorithm and key size |
| Cipher | Bulk encryption algorithm and mode |
| Certificate subject | CN and SANs of the cert presented |
| Certificate issuer | CA that signed the cert |
| Certificate validity | Not Before / Not After |
| Certificate transparency | Whether CT SCTs are present |
| Subject public key info | Algorithm and key size of the public key |
| Certificate chain | Number of certificates in the chain |

### Why this matters beyond the main Security panel

The main Security panel shows the main document's TLS details. If a sub-resource uses a connection-pool reuse, you may see the same TLS info. But sometimes:

- An API endpoint serves on a different port or from a different server with different TLS config
- A CDN origin has a different certificate than the main site
- A third-party resource has a certificate that expires sooner than the main cert

Clicking into individual requests in the Network panel lets you audit each connection independently rather than relying on the aggregated overview.

### Correlating with the Security panel's Origins section

Use this workflow to fully audit a page:

1. Open DevTools (Security + Network panels)
2. Hard reload the page (Cmd+Shift+R / Ctrl+Shift+R)
3. In Security panel > Origins: note any "Not secure" or flagged origins
4. In Network panel: filter by the flagged origin's hostname
5. Click each request and check the Security tab for the exact certificate and TLS details
6. Cross-reference with Console for any mixed content or CSP violation messages

This gives you both the high-level summary (Security panel) and the per-request detail (Network > Security tab) needed to identify and fix any security issue on the page.

---

[← Web Devtools](/coding/web-devtools/)
