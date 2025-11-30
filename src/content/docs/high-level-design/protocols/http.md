---
title: HTTP & HTTPS Protocols
---

## HTTP/1.0 (1996)

The first widely adopted version of HTTP.

**Key Characteristics:**
- **New TCP connection per request**: Every request requires a new TCP handshake (expensive!)
- **No persistent connections**: Connection closes after each request/response
- **Simple text-based protocol**: Headers and body in plain text
- **No compression**: Headers sent uncompressed every time

```plantuml
@startuml
title HTTP/1.0 - Multiple Connections
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant Browser
participant Server

== Request 1: HTML ==
Browser -> Server: TCP Handshake (SYN, SYN-ACK, ACK)
Browser -> Server: GET /index.html HTTP/1.0
Server --> Browser: 200 OK\n<html>...</html>
Browser -> Server: TCP Close (FIN)
note right
  Connection closed
  after each request
end note

== Request 2: CSS ==
Browser -> Server: TCP Handshake (SYN, SYN-ACK, ACK)
Browser -> Server: GET /style.css HTTP/1.0
Server --> Browser: 200 OK\nbody { ... }
Browser -> Server: TCP Close (FIN)

== Request 3: Image ==
Browser -> Server: TCP Handshake (SYN, SYN-ACK, ACK)
Browser -> Server: GET /logo.png HTTP/1.0
Server --> Browser: 200 OK\n[binary image]
Browser -> Server: TCP Close (FIN)

legend right
  Problems:
  - 3 resources = 3 TCP handshakes
  - Slow (latency for each handshake)
  - Server overhead
endlegend
@enduml
```

**Problems:**
- **High Latency**: Each TCP handshake adds ~100ms round-trip time
- **Server Resource Waste**: Opening/closing connections constantly
- **Poor Performance**: Loading a page with 50 resources = 50 connections

## HTTP/1.1 (1997)

Major improvements to address HTTP/1.0 inefficiencies.

**Key Features:**

### 1. Persistent Connections (Keep-Alive)
Reuse the same TCP connection for multiple requests.

```plantuml
@startuml
title HTTP/1.1 - Persistent Connection
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant Browser
participant Server

Browser -> Server: TCP Handshake (once)
note right
  Connection stays open
  for multiple requests
end note

Browser -> Server: GET /index.html HTTP/1.1\nConnection: keep-alive
Server --> Browser: 200 OK\n<html>...</html>

Browser -> Server: GET /style.css HTTP/1.1\nConnection: keep-alive
Server --> Browser: 200 OK\nbody { ... }

Browser -> Server: GET /logo.png HTTP/1.1\nConnection: keep-alive
Server --> Browser: 200 OK\n[binary image]

note right
  Same connection
  Much faster!
end note

Browser -> Server: Connection: close
Server -> Browser: TCP Close

legend right
  Improvement:
  - 3 resources = 1 TCP handshake
  - Much faster
  - Less server overhead
endlegend
@enduml
```

### 2. Pipelining
Send multiple requests without waiting for responses (but still has issues).

```plantuml
@startuml
title HTTP/1.1 Pipelining (Theoretical)
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #fee2e2
skinparam noteBorderColor #ef4444
hide footbox

participant Browser
participant Server

Browser -> Server: GET /index.html
Browser -> Server: GET /style.css
Browser -> Server: GET /script.js
note right
  Send all requests
  without waiting
end note

Server --> Browser: Response 1 (HTML)
Server --> Browser: Response 2 (CSS)
Server --> Browser: Response 3 (JS)
note left
  Responses must come
  in ORDER (FIFO)
end note

note bottom
  ❌ Head-of-Line Blocking Problem:
  If response 1 is slow, response 2 and 3 must wait!
  Rarely used in practice because of this.
end note
@enduml
```

### 3. Host Header (Virtual Hosting)
Multiple domains on one IP address.

```http
GET /index.html HTTP/1.1
Host: example.com    ← Required header

GET /about.html HTTP/1.1
Host: another.com    ← Same server, different site
```

**HTTP/1.1 Limitations:**

```plantuml
@startuml
title HTTP/1.1 Head-of-Line Blocking
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #fee2e2
skinparam noteBorderColor #ef4444
hide footbox

participant Browser
participant Server

Browser -> Server: Request 1 (fast resource)
Browser -> Server: Request 2 (slow resource - 5s)
Browser -> Server: Request 3 (fast resource)

note right of Server
  Processing...
end note

Server --> Browser: Response 1 ✅
note right
  Request 2 is slow!
  Blocking everything...
end note

... 5 seconds ...

Server --> Browser: Response 2 ⏳
Server --> Browser: Response 3 ✅

note bottom
  Problem: Request 3 (fast) waited 5 seconds
  because Request 2 (slow) blocked the pipeline.
  This is Head-of-Line (HOL) Blocking.
end note
@enduml
```

**Workarounds Browsers Use:**
- Open **6-8 parallel TCP connections** per domain
- Still wasteful and limited

## HTTP/2 (2015)

Revolutionary changes to solve HTTP/1.1 problems.

**Key Features:**

### 1. Binary Protocol (Not Text)

```plantuml
@startuml
title HTTP/1.1 vs HTTP/2 Format
left to right direction
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc

package "HTTP/1.1 (Text)" {
  rectangle "GET /api/users HTTP/1.1\nHost: example.com\nUser-Agent: Chrome\nContent-Type: application/json\n\n{\"id\": 123}" as HTTP1 #fee2e2
  note bottom of HTTP1
    Human-readable
    Larger size
    Slower parsing
  end note
}

package "HTTP/2 (Binary Frames)" {
  rectangle "Frame Type: HEADERS\nStream ID: 1\n[binary data]\n\nFrame Type: DATA\nStream ID: 1\n[binary data]" as HTTP2 #dcfce7
  note bottom of HTTP2
    Binary format
    Smaller size
    Faster parsing
  end note
}

@enduml
```

### 2. Multiplexing (No More Head-of-Line Blocking!)

Multiple requests/responses over **single TCP connection** without blocking.

```plantuml
@startuml
title HTTP/2 Multiplexing
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #dcfce7
skinparam noteBorderColor #10b981
hide footbox

participant Browser
participant "Single TCP\nConnection" as TCP
participant Server

Browser -> TCP: Request 1 (Stream 1) - fast
Browser -> TCP: Request 2 (Stream 2) - slow
Browser -> TCP: Request 3 (Stream 3) - fast
note right
  All sent simultaneously
  on SAME connection
  Each has unique Stream ID
end note

TCP -> Server: Forward all streams

Server --> TCP: Response 1 (Stream 1) ✅
note left
  Responses can come back
  in ANY order!
  No blocking!
end note

Server --> TCP: Response 3 (Stream 3) ✅
note left
  Stream 3 doesn't wait
  for slow Stream 2
end note

... Stream 2 processing ...

Server --> TCP: Response 2 (Stream 2) ⏳

TCP --> Browser: All responses received

legend right
  ✅ No Head-of-Line Blocking
  ✅ Single TCP connection
  ✅ Parallel requests
  ✅ Responses in any order
endlegend
@enduml
```

### 3. Header Compression (HPACK)

Headers are compressed using HPACK algorithm.

```http
HTTP/1.1 (Repeated Headers - Wasteful)
─────────────────────────────────────────
Request 1:
  User-Agent: Mozilla/5.0 ...           (200 bytes)
  Authorization: Bearer eyJhbG...       (300 bytes)
  Cookie: session=abc123...             (100 bytes)

Request 2:
  User-Agent: Mozilla/5.0 ...           (200 bytes) ← Duplicate!
  Authorization: Bearer eyJhbG...       (300 bytes) ← Duplicate!
  Cookie: session=abc123...             (100 bytes) ← Duplicate!

Total: 1200 bytes for 2 requests

HTTP/2 (HPACK Compression)
─────────────────────────────────────────
Request 1:
  :method: GET
  :path: /users
  User-Agent: Mozilla/5.0 ...           (200 bytes)
  Authorization: Bearer eyJhbG...       (300 bytes)
  [Stored in compression table with index]

Request 2:
  :method: GET
  :path: /posts
  User-Agent: [Reference: Index 62]    (2 bytes) ← Compressed!
  Authorization: [Reference: Index 63] (2 bytes) ← Compressed!

Total: ~504 bytes for 2 requests (58% savings!)
```

### 4. Server Push

Server can send resources **before** client asks for them.

```plantuml
@startuml
title HTTP/2 Server Push
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #dcfce7
skinparam noteBorderColor #10b981
hide footbox

participant Browser
participant Server

Browser -> Server: GET /index.html HTTP/2
note right
  Client only requests HTML
end note

Server -> Server: Parse HTML\nFound: <link rel="stylesheet" href="style.css">
note left
  Server knows client
  will need style.css
end note

Server --> Browser: PUSH_PROMISE: /style.css
note left
  Server proactively
  pushes CSS
end note

Server --> Browser: 200 OK\n<html>...</html>
Server --> Browser: 200 OK\n/style.css content

Browser -> Browser: Parse HTML\nOh, I need style.css!
Browser -> Browser: Already in cache from push!
note right
  No extra request needed
  Faster page load
end note

legend right
  ✅ Eliminates round trips
  ✅ Faster page loads
  ⚠️  Must be used carefully
     (can waste bandwidth if wrong)
endlegend
@enduml
```

### 5. Stream Prioritization

Tell server which resources are more important.

```plantuml
@startuml
title HTTP/2 Stream Prioritization
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant Browser
participant Server

Browser -> Server: Stream 1: /index.html (Priority: HIGH)
Browser -> Server: Stream 2: /style.css (Priority: HIGH)
Browser -> Server: Stream 3: /analytics.js (Priority: LOW)
Browser -> Server: Stream 4: /ad-banner.png (Priority: LOW)

note right of Browser
  Browser tells server
  what's important
end note

Server -> Server: Prioritize Streams 1 & 2
note left
  Server processes
  high-priority first
end note

Server --> Browser: Stream 1: HTML ✅
Server --> Browser: Stream 2: CSS ✅
note left
  Critical rendering path
  loads first
end note

Server --> Browser: Stream 3: Analytics
Server --> Browser: Stream 4: Ad banner

legend right
  Result: Faster perceived load time
  Critical resources load first
endlegend
@enduml
```

## HTTP Version Comparison

```plantuml
@startuml
title HTTP Evolution Timeline
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #334155

left to right direction

rectangle "HTTP/1.0\n(1996)" as HTTP10 #fee2e2
rectangle "HTTP/1.1\n(1997)" as HTTP11 #fef3c7
rectangle "HTTP/2\n(2015)" as HTTP2 #dcfce7
rectangle "HTTP/3\n(2022)" as HTTP3 #e0e7ff

HTTP10 -right-> HTTP11 : + Keep-alive\n+ Host header\n+ Pipelining
HTTP11 -right-> HTTP2 : + Multiplexing\n+ Binary\n+ Header compression\n+ Server push
HTTP2 -right-> HTTP3 : + QUIC (UDP)\n+ Better mobile\n+ 0-RTT

note bottom of HTTP10
  ❌ New TCP per request
  ❌ No compression
  ❌ Text-based
end note

note bottom of HTTP11
  ✅ Persistent connections
  ⚠️  HOL blocking
  ⚠️  Limited parallelism
end note

note bottom of HTTP2
  ✅ True parallelism
  ✅ Binary protocol
  ✅ Header compression
  ⚠️  Still TCP (HOL at TCP level)
end note

note bottom of HTTP3
  ✅ No TCP HOL blocking
  ✅ Faster connections (QUIC)
  ✅ Better for lossy networks
end note
@enduml
```

### Performance Comparison Table

| Feature | HTTP/1.0 | HTTP/1.1 | HTTP/2 |
|---------|----------|----------|--------|
| Connection | New per request | Persistent (keep-alive) | Single multiplexed |
| Requests/Connection | 1 | Sequential | Parallel (unlimited) |
| Header Compression | ❌ | ❌ | ✅ (HPACK) |
| Binary Protocol | ❌ | ❌ | ✅ |
| Server Push | ❌ | ❌ | ✅ |
| Stream Priority | ❌ | ❌ | ✅ |
| Head-of-Line Blocking | ✅ (worst) | ✅ (pipelining) | ❌ (at HTTP level) |
| Browser Support | Legacy | Universal | Universal (HTTPS only) |

:::tip[Key Takeaway]
**HTTP/2 is the default for modern web**:
- All major browsers support it
- Requires HTTPS (TLS)
- Backward compatible (falls back to HTTP/1.1)
- Dramatically faster for modern websites with many resources

**When you visit a site over HTTPS, you're likely using HTTP/2!**
:::

## HTTPS (HTTP Secure)

HTTPS is HTTP with encryption via **TLS/SSL**. It's not a separate protocol version—it's HTTP running over an encrypted connection.

HTTPS is the secure version of HTTP, used for web browsing, which encrypts data using the TLS protocol. TLS (Transport Layer Security) is a **general-purpose cryptographic protocol** that secures communications. 

HTTPS is a specific application of TLS for websites. Essentially, HTTPS is a web protocol that relies on TLS to encrypt the connection between your browser and a website.

**Key Differences from HTTP:**

| Feature | HTTP | HTTPS |
|---------|------|-------|
| Port | 80 | 443 |
| Encryption | ❌ None | ✅ TLS/SSL |
| Data Visibility | Plaintext (anyone can read) | Encrypted (only endpoints can decrypt) |
| Certificate | Not required | Required (from CA) |
| Browser Indicator | "Not Secure" warning | 🔒 Padlock icon |
| SEO Ranking | Lower | Higher (Google prefers HTTPS) |

```plantuml
@startuml
title HTTP vs HTTPS Data Flow
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant Browser
participant Attacker
participant Server

== HTTP (Insecure) ==
Browser -> Server: GET /login?user=john&pass=secret123
note right
  ❌ Plaintext
  Anyone can read it!
end note

Attacker -> Attacker: Intercept packet\nSteal password!
note right of Attacker
  Man-in-the-Middle Attack
  Password exposed
end note

Server --> Browser: 200 OK\nWelcome John!

== HTTPS (Secure) ==
Browser -> Server: TLS Handshake\n(Establish encryption)
note right
  Exchange encryption keys
  Verify server identity
end note

Browser -> Server: [Encrypted data]\n0x8f3a2b... (gibberish)
note right
  ✅ Even if intercepted,
  cannot be read
end note

Attacker -> Attacker: Intercept packet\nSee only encrypted bytes
note right of Attacker
  ❌ Cannot decrypt
  Password safe!
end note

Server --> Browser: [Encrypted response]\n0x2c9d1f...

legend right
  HTTPS protects:
  - Passwords and credentials
  - Personal information
  - Payment details
  - Session cookies
endlegend
@enduml
```

### What HTTPS Protects Against

```plantuml
@startuml
title HTTPS Security Benefits
left to right direction
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc

package "HTTP Vulnerabilities" {
  rectangle "Eavesdropping\n(Packet Sniffing)" as V1 #fee2e2
  rectangle "Man-in-the-Middle\n(MITM)" as V2 #fee2e2
  rectangle "Data Tampering" as V3 #fee2e2
  rectangle "Identity Spoofing" as V4 #fee2e2
}

package "HTTPS Protections" {
  rectangle "Encryption\n(TLS)" as P1 #dcfce7
  rectangle "Certificate\nValidation" as P2 #dcfce7
  rectangle "Integrity\nChecks" as P3 #dcfce7
  rectangle "Authentication" as P4 #dcfce7
}

V1 -right-> P1 : Prevents
V2 -right-> P2 : Prevents
V3 -right-> P3 : Prevents
V4 -right-> P4 : Prevents

note bottom of V1
  Attacker reads WiFi traffic
  Sees passwords in plaintext
end note

note bottom of P1
  All data encrypted
  Only gibberish visible
end note

@enduml
```

:::caution[Why HTTPS is Mandatory Today]
- **Google Chrome** marks all HTTP sites as "Not Secure"
- **HTTP/2** requires HTTPS (browsers won't use HTTP/2 over plain HTTP)
- **Modern APIs** (Service Workers, Geolocation, Camera) only work on HTTPS
- **SEO penalty** for HTTP sites
- **Cookie security** (Secure flag requires HTTPS)
:::

## TLS (Transport Layer Security)

TLS is the **encryption protocol** that powers HTTPS. It evolved from SSL (Secure Sockets Layer).

**Timeline:**
- SSL 1.0 (1994) - Never released
- SSL 2.0 (1995) - Deprecated (insecure)
- SSL 3.0 (1996) - Deprecated (POODLE attack)
- **TLS 1.0** (1999) - Based on SSL 3.0
- **TLS 1.1** (2006) - Minor improvements
- **TLS 1.2** (2008) - **Still widely used**
- **TLS 1.3** (2018) - **Current standard** (faster, more secure)

:::tip[SSL vs TLS]
"SSL" is often used colloquially, but modern systems use **TLS**. When people say "SSL certificate," they actually mean "TLS certificate." The terms are used interchangeably, but TLS is the correct technical term.
:::

### TLS Handshake Process

```plantuml
@startuml
title TLS 1.2 Handshake (Simplified)
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant "Client\n(Browser)" as Client
participant "Server\n(example.com)" as Server

== Phase 1: Hello ==
Client -> Server: ClientHello\n- TLS version: 1.2\n- Cipher suites: [AES-256-GCM, ChaCha20...]\n- Random bytes (Client Random)
note right
  Client announces:
  - What encryption it supports
  - Random data for key generation
end note

Server -> Client: ServerHello\n- Chosen cipher: AES-256-GCM\n- Random bytes (Server Random)\n- **Certificate** (Public Key + CA signature)
note left
  Server sends:
  - Chosen encryption method
  - Digital certificate (proves identity)
  - Random data
end note

== Phase 2: Certificate Verification ==
Client -> Client: Verify certificate\n1. Check CA signature\n2. Check expiration date\n3. Check domain name
note right
  ✅ Certificate from trusted CA?
  ✅ Not expired?
  ✅ Matches example.com?
end note

== Phase 3: Key Exchange ==
Client -> Server: ClientKeyExchange\n- Pre-master secret (encrypted with server's public key)
note right
  Client generates random
  "pre-master secret" and
  encrypts it with server's
  public key (only server
  can decrypt)
end note

Client -> Client: Generate Session Keys\n= f(Client Random, Server Random, Pre-master Secret)
Server -> Server: Decrypt pre-master secret\nGenerate Session Keys
note right
  Both sides now have
  identical session keys
  (symmetric encryption)
end note

== Phase 4: Finish ==
Client -> Server: Finished (encrypted with session key)
note right
  ✅ Everything encrypted
  from now on
end note

Server -> Client: Finished (encrypted with session key)

Client -> Server: [Encrypted HTTP Request]\nGET /api/users
Server -> Client: [Encrypted HTTP Response]\n200 OK {"users": [...]}

legend right
  TLS 1.2 Handshake: ~2 round trips
  TLS 1.3 Handshake: ~1 round trip (faster!)
endlegend
@enduml
```

### TLS 1.3 Improvements (2018)

```plantuml
@startuml
title TLS 1.2 vs TLS 1.3 Handshake Speed
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant Client12 as "Client\n(TLS 1.2)"
participant Server12 as "Server\n(TLS 1.2)"
participant Client13 as "Client\n(TLS 1.3)"
participant Server13 as "Server\n(TLS 1.3)"

== TLS 1.2 (2 Round Trips) ==
Client12 -> Server12: ClientHello
note right
  Round Trip 1
end note

Server12 -> Client12: ServerHello\nCertificate\nKeyExchange
note left
  Round Trip 2
end note

Client12 -> Server12: KeyExchange\nFinished

Server12 -> Client12: Finished
note right
  ⏱️ ~100-200ms
  (depending on latency)
end note

Client12 -> Server12: HTTP Request (encrypted)

== TLS 1.3 (1 Round Trip) ==
Client13 -> Server13: ClientHello\n+ Key Share (guess)
note right
  Client pre-sends
  key material
end note

Server13 -> Client13: ServerHello\nCertificate\nFinished
note left
  Server can finish
  immediately
end note

Client13 -> Server13: HTTP Request (encrypted)
note right
  ⏱️ ~50-100ms
  50% faster!
end note

legend right
  TLS 1.3 Benefits:
  ✅ Faster handshake (1-RTT)
  ✅ 0-RTT for repeat connections
  ✅ Removed weak ciphers
  ✅ Forward secrecy by default
endlegend
@enduml
```

### How TLS Certificates Work

```plantuml
@startuml
title Certificate Authority (CA) Trust Chain
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc

rectangle "Root CA\n(DigiCert, Let's Encrypt)" as Root #fef3c7
note right of Root
  Pre-installed in browsers
  Highly trusted
  Self-signed
end note

rectangle "Intermediate CA" as Intermediate #dbeafe
note right of Intermediate
  Signed by Root CA
  Issues certificates
end note

rectangle "example.com\nCertificate" as Cert #dcfce7
note right of Cert
  Signed by Intermediate CA
  Contains:
  - Domain name
  - Public key
  - Expiration date
end note

rectangle "Browser" as Browser #e0e7ff
note left of Browser
  Validates chain:
  1. Cert signed by Intermediate?
  2. Intermediate signed by Root?
  3. Root in trusted list?
end note

Root -down-> Intermediate : Signs
Intermediate -down-> Cert : Signs
Browser -up-> Cert : Verifies

legend bottom
  If any link breaks (expired, untrusted CA),
  browser shows "Your connection is not private"
endlegend
@enduml
```

**Certificate Contents:**
```
Certificate:
    Subject: CN=example.com
    Issuer: CN=Let's Encrypt Authority X3
    Validity:
        Not Before: Jan 1 00:00:00 2024 GMT
        Not After : Apr 1 00:00:00 2024 GMT
    Public Key: RSA 2048 bit
    Signature Algorithm: sha256WithRSAEncryption
    X509v3 Subject Alternative Name:
        DNS:example.com, DNS:*.example.com
```

### Symmetric vs Asymmetric Encryption in TLS

```plantuml
@startuml
title TLS Uses Both Encryption Types
left to right direction
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc

package "Asymmetric (Public Key)\nUsed During Handshake" {
  rectangle "Server Public Key\n(in certificate)" as PubKey #fef3c7
  rectangle "Encrypt\nPre-master Secret" as Encrypt #fef3c7
  rectangle "Server Private Key\n(secret, on server)" as PrivKey #fee2e2
  
  PubKey -down-> Encrypt
  Encrypt -down-> PrivKey : Only server\ncan decrypt
  
  note bottom of PubKey
    ✅ Secure key exchange
    ❌ Slow (RSA/ECC)
    Used once per session
  end note
}

package "Symmetric (Session Key)\nUsed For Data Transfer" {
  rectangle "Session Key\n(AES-256)" as SessionKey #dcfce7
  rectangle "Encrypt HTTP Data" as EncryptData #dcfce7
  rectangle "Decrypt HTTP Data" as DecryptData #dcfce7
  
  SessionKey -down-> EncryptData
  SessionKey -down-> DecryptData
  
  note bottom of SessionKey
    ✅ Very fast (AES)
    ✅ Both sides have key
    Used for all HTTP traffic
  end note
}

Encrypt -right-> SessionKey : Derives

@enduml
```

:::note[Why Two Encryption Types?]
1. **Asymmetric (RSA/ECC)**: Used only for **handshake** to securely exchange keys. Slow but secure for key exchange.
2. **Symmetric (AES)**: Used for **actual data encryption**. Much faster, but requires both sides to have the same key (which was securely exchanged via asymmetric encryption).

**Analogy**: Asymmetric encryption is like a locked mailbox where anyone can drop a letter (encrypt), but only you have the key to open it (decrypt). Symmetric encryption is like both people having the same key to a shared locker.
:::

### Common TLS Cipher Suites

```
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
│   │     │    │   │       │   │
│   │     │    │   │       │   └─ HMAC algorithm (integrity check)
│   │     │    │   │       └───── Mode of operation (Galois/Counter)
│   │     │    │   └───────────── Encryption algorithm + key size
│   │     │    └───────────────── Symmetric cipher
│   │     └────────────────────── Certificate signature algorithm
│   └──────────────────────────── Key exchange algorithm
└──────────────────────────────── Protocol (TLS)
```

**Modern Recommended Cipher Suites (TLS 1.3):**
- `TLS_AES_256_GCM_SHA384`
- `TLS_CHACHA20_POLY1305_SHA256`
- `TLS_AES_128_GCM_SHA256`

**Deprecated/Weak (Avoid):**
- Anything with `RC4`, `MD5`, `DES`, `3DES`
- `TLS_RSA_*` (no forward secrecy)

## HTTPS + HTTP/2 = Modern Web

```plantuml
@startuml
title Modern HTTPS Connection Stack
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc

rectangle "Application Layer" as App {
  rectangle "HTTP/2\n(Binary, Multiplexing)" as HTTP2 #dcfce7
}

rectangle "Security Layer" as Security {
  rectangle "TLS 1.3\n(Encryption)" as TLS #fef3c7
}

rectangle "Transport Layer" as Transport {
  rectangle "TCP\n(Reliable Delivery)" as TCP #dbeafe
}

rectangle "Network Layer" as Network {
  rectangle "IP\n(Routing)" as IP #e0e7ff
}

App -down-> Security : Encrypted HTTP/2 frames
Security -down-> Transport : Encrypted packets
Transport -down-> Network : TCP segments

note right of HTTP2
  - Multiplexing
  - Header compression
  - Server push
end note

note right of TLS
  - Encrypts all HTTP/2 data
  - Authenticates server
  - Protects integrity
end note

note right of TCP
  - Ensures packet delivery
  - Handles retransmissions
  - In-order delivery
end note

legend bottom
  When you visit https://example.com:
  1. TCP connection established
  2. TLS handshake (verify certificate)
  3. HTTP/2 negotiation (ALPN)
  4. Encrypted HTTP/2 communication
endlegend
@enduml
```

:::tip[Key Takeaway]
**Modern web = HTTPS + HTTP/2**:
- HTTP/2 requires HTTPS in browsers
- TLS 1.3 makes HTTPS faster than ever
- Together they provide speed + security
- All major sites use this stack

**When you see 🔒 in your browser, you're using TLS + HTTP/2!**
:::

## TLS Termination

**TLS Termination** is the process of decrypting HTTPS traffic at a proxy/load balancer instead of at the backend application server.

### Why TLS Termination?

In large-scale applications, handling TLS encryption/decryption directly on application servers can be:
- **CPU-intensive**: Encryption/decryption consumes significant CPU resources
- **Certificate management complexity**: Managing certificates across many servers
- **Difficult to inspect traffic**: Can't log, monitor, or filter encrypted traffic

**Solution**: Offload TLS to a dedicated layer (load balancer, reverse proxy, CDN).

```plantuml
@startuml
title Without TLS Termination (End-to-End Encryption)
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant Client
participant "Load\nBalancer" as LB
participant "App\nServer 1" as App1
participant "App\nServer 2" as App2

Client -> LB: HTTPS Request\n[Encrypted]
note right
  TLS connection
end note

LB -> App1: HTTPS Request\n[Still Encrypted]
note right
  Load balancer
  cannot inspect
  payload
end note

App1 -> App1: TLS Handshake\nDecrypt\nProcess Request
note right
  Each server handles
  TLS individually
  CPU overhead
end note

App1 -> LB: HTTPS Response\n[Encrypted]
LB -> Client: HTTPS Response\n[Encrypted]

legend bottom
  ❌ Every server does TLS (CPU load)
  ❌ Certificate on every server
  ❌ Cannot inspect/log traffic at LB
endlegend
@enduml
```

```plantuml
@startuml
title With TLS Termination (Decrypt at Load Balancer)
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #dcfce7
skinparam noteBorderColor #10b981
hide footbox

participant Client
participant "Load Balancer\n(TLS Termination)" as LB
participant "App\nServer 1" as App1
participant "App\nServer 2" as App2

Client -> LB: HTTPS Request\n[Encrypted]
note right
  TLS connection
  to load balancer
end note

LB -> LB: TLS Handshake\nDecrypt\nInspect Headers\nLog Request
note right
  ✅ LB handles TLS
  ✅ Can inspect traffic
  ✅ Can add headers
  ✅ Can rate limit
end note

LB -> App1: HTTP Request\n[Plain HTTP]
note right
  Internal network
  No encryption needed
  (trusted environment)
end note

App1 -> App1: Process Request\n(No TLS overhead)
note right
  ✅ Faster processing
  ✅ No certificate needed
  ✅ Less CPU usage
end note

App1 -> LB: HTTP Response\n[Plain HTTP]
LB -> LB: Encrypt\nAdd Headers
LB -> Client: HTTPS Response\n[Encrypted]

legend bottom
  ✅ Centralized certificate management
  ✅ Traffic inspection/logging
  ✅ Reduced CPU load on app servers
  ✅ Single TLS configuration
endlegend
@enduml
```

### TLS Termination Patterns

1. TLS Termination - Loadbalancer terminates the TLS encryption, and forwards the HTTP (not HTTPS) to the backend servers
2. TLS Pass through - Loadbalancer just proxies the HTTPS request to the backend servers.
3. TLS Re-encryption - Loadbalancer decrypts the HTTPS request for logging or filtering purpose, once done, it re-encrypts the current request and sends HTTPS to backend servers.

```plantuml
@startuml
title TLS Termination Patterns
left to right direction
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc

package "Pattern 1: TLS Termination" {
  rectangle "Client" as C1 #e0e7ff
  rectangle "Load Balancer\n(Terminates TLS)" as LB1 #fef3c7
  rectangle "Backend\n(HTTP)" as B1 #dcfce7
  
  C1 -right-> LB1 : HTTPS
  LB1 -right-> B1 : HTTP
  
  note bottom of LB1
    ✅ Most common
    ✅ Simple
    ⚠️  Backend unencrypted
  end note
}

package "Pattern 2: TLS Pass-Through" {
  rectangle "Client" as C2 #e0e7ff
  rectangle "Load Balancer\n(TCP Proxy)" as LB2 #dbeafe
  rectangle "Backend\n(Handles TLS)" as B2 #dcfce7
  
  C2 -right-> LB2 : HTTPS
  LB2 -right-> B2 : HTTPS
  
  note bottom of LB2
    ✅ End-to-end encryption
    ❌ No traffic inspection
    ❌ More CPU on backend
  end note
}

package "Pattern 3: TLS Re-Encryption" {
  rectangle "Client" as C3 #e0e7ff
  rectangle "Load Balancer\n(Terminates + Re-encrypts)" as LB3 #fef3c7
  rectangle "Backend\n(HTTPS)" as B3 #dcfce7
  
  C3 -right-> LB3 : HTTPS
  LB3 -right-> B3 : HTTPS (new)
  
  note bottom of LB3
    ✅ Traffic inspection
    ✅ Secure backend
    ⚠️  More complex
    ⚠️  Higher latency
  end note
}

@enduml
```

### Real-World Use Cases

**1. Cloud Load Balancers (AWS, Azure, GCP)**
```plaintext
Internet → AWS ALB (TLS Termination) → EC2 Instances (HTTP)
         ↑
    Certificate managed
    by AWS Certificate Manager
```

**2. Kubernetes Ingress**
```plaintext
Internet → Nginx Ingress (TLS Termination) → Kubernetes Pods (HTTP)
         ↑
    TLS secret stored
    in Kubernetes
```

**3. CDN (Cloudflare, Akamai)**
```plaintext
Client → CDN Edge (TLS Termination) → Origin Server (HTTP/HTTPS)
       ↑
  CDN handles TLS
  Caches static content
```

### Security Considerations

:::caution[TLS Termination Security]
**Risks:**
- **Plaintext Backend Traffic**: Internal traffic is unencrypted
- **LB Compromise**: If load balancer is compromised, all traffic is exposed
- **Compliance Issues**: Some regulations (PCI-DSS, HIPAA) may require end-to-end encryption

**Mitigations:**
1. **Trusted Network**: Use TLS termination only on trusted internal networks (VPC, private subnet)
2. **TLS Re-encryption**: Encrypt traffic again between LB and backend (Pattern 3)
3. **Network Segmentation**: Isolate backend servers from public internet
4. **IPsec/VPN**: Encrypt internal network traffic at network layer
5. **Mutual TLS (mTLS)**: Backend servers authenticate to load balancer
:::

### When to Use Each Pattern

| Pattern | Use Case | Pros | Cons |
|---------|----------|------|------|
| **TLS Termination** | Most web applications, APIs | Simple, fast, traffic inspection | Backend unencrypted |
| **TLS Pass-Through** | Zero-trust networks, compliance | End-to-end encryption | No inspection, higher CPU |
| **TLS Re-Encryption** | Financial services, healthcare | Best security + inspection | Complex, higher latency |

:::tip[Best Practice]
**For most applications**: Use **TLS Termination** with a private backend network (VPC).

**For sensitive data**: Use **TLS Re-encryption** or **TLS Pass-Through** depending on whether you need traffic inspection.

**Modern trend**: mTLS (mutual TLS) everywhere - both client and server authenticate with certificates (used in service meshes like Istio).
:::

## GRPC vs REST

If you simply configured a standard REST API to accept `application/x-protobuf` instead of `application/json`, you would only gain the serialization benefits (smaller payload size). However, you would miss out on the architectural and transport advantages that make `gRPC` a standard for microservices.

Here is why gRPC is more than just `"REST with Protobuf."`

1. `HTTP/2` Native (The "Hidden" Performance Booster)
Most REST APIs still run on `HTTP/1.1` (though ``HTTP/2`` is possible, it is not enforced). gRPC is designed strictly for `HTTP/2`. This difference fundamentally changes how data moves.

- **Multiplexing**: In a standard REST (`HTTP/1.1`) call, if you need to fetch 5 resources, browsers or clients often open 5 separate TCP connections. In gRPC, a single `TCP` connection is established, and multiple requests/responses are "multiplexed" (sent simultaneously) over that single channel without blocking each other (Head-of-Line Blocking).

- **Header Compression** (`HPACK`): REST APIs send heavy textual headers (User-Agent, Authorization, etc.) with every single request. gRPC compresses these headers efficiently, which significantly reduces overhead for high-frequency internal calls.

2. **Streaming** (Beyond Request/Response)
Your premise ("making http post calls") assumes a strict **Request-Response model** (Client sends one thing, Server sends one thing back).

    - gRPC breaks this paradigm. Because of `HTTP/2` **framing**, gRPC supports:

    - **Server-side streaming**: Client sends one request, server sends back a stream of 100 updates.

    - **Client-side streaming**: Client uploads a massive file chunk-by-chunk, server replies once when done.

    - **Bidirectional streaming**: Both sides send data independently in real-time (like a chat app or stock ticker).

Implementing bidirectional streaming over standard REST usually requires messy workarounds (Long Polling, WebSockets, or Server-Sent Events), whereas in gRPC, it is a first-class citizen.

3. **The "Contract First" Workflow** (IDL)
If you build a REST API with Protobuf manually, you still have to manually maintain the "**translation layer**."

- **REST approach**: You write the backend code. Then you write an **OpenAPI** (Swagger) **spec** (or vice versa). Then you hope the frontend developer reads the documentation correctly. If you change a field name, the client breaks at runtime.

- **gRPC approach**: You define a **.proto** file first. The gRPC tooling generates the code for both the client and the server.

    - The client function `GetUser(id)` is generated for you.

    - The `serialization/deserialization` logic is generated for you.

    - You physically cannot call the API with the wrong parameters because the code won't compile.

4. **Semantic Differences** (Action vs. Resource)
- **REST is Resource-Oriented**: It focuses on Nouns. `POST /users`, `GET /users/123`. You are constrained by HTTP verbs (`GET, POST, PUT, DELETE`).

- **gRPC is Action-Oriented (RPC)**: It focuses on Verbs. It looks like a function call. `service.CreateUser()`, `service.CalculateRoute()`. You aren't forcing your logic to fit into HTTP verbs; you are just calling functions across the network.

### gRPC Architecture and Data Flow

```plantuml
@startuml
title gRPC Complete Architecture
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
skinparam noteBackgroundColor #fef3c7

package "Client Application" {
  rectangle "App Code\n(Python/Java/Go)" as ClientCode #e0f2fe
  rectangle "Generated\nClient Stub" as ClientStub #dbeafe
  rectangle "gRPC Core\n(HTTP/2 + Protobuf)" as ClientCore #bfdbfe
}

package "Network Layer" {
  cloud "HTTP/2\nTCP Connection" as NetworkConn #f8fafc
}

package "Server Application" {
  rectangle "gRPC Core\n(HTTP/2 + Protobuf)" as ServerCore #fce7f3
  rectangle "Generated\nServer Stub" as ServerStub #fbcfe8
  rectangle "Service\nImplementation" as ServerCode #f9a8d4
}

ClientCode -down-> ClientStub : 1. Call method\ngetUser(id=123)
note right of ClientCode
  Developer writes:
  user = stub.GetUser(
    UserRequest(id=123)
  )
end note

ClientStub -down-> ClientCore : 2. Serialize to\nProtobuf binary
note right of ClientStub
  Auto-generated from .proto
  Handles type conversion
end note

ClientCore -down-> NetworkConn : 3. HTTP/2 POST\n:method POST\n:path /UserService/GetUser\ncontent-type: application/grpc+proto
note bottom of ClientCore
  HTTP/2 features:
  - Single TCP connection
  - Multiplexing
  - Header compression
end note

NetworkConn -down-> ServerCore : 4. HTTP/2 stream\n[protobuf binary]

ServerCore -down-> ServerStub : 5. Deserialize\nProtobuf to object
note left of ServerCore
  Validates message format
  Decompresses headers
end note

ServerStub -down-> ServerCode : 6. Call service method\nGetUser(request)
note left of ServerStub
  Type-safe method call
  Generated from .proto
end note

ServerCode -up-> ServerStub : 7. Return response\nUser{id:123, name:"John"}
note right of ServerCode
  Business logic
  Database queries
  Processing
end note

ServerStub -up-> ServerCore : 8. Serialize response\nto Protobuf

ServerCore -up-> NetworkConn : 9. HTTP/2 response\n[protobuf binary]

NetworkConn -up-> ClientCore : 10. HTTP/2 stream

ClientCore -up-> ClientStub : 11. Deserialize\nProtobuf to object

ClientStub -up-> ClientCode : 12. Return User object

legend right
  gRPC eliminates manual HTTP handling:
  - No URL construction
  - No JSON parsing
  - No manual serialization
  - Type-safe at compile time
endlegend
@enduml
```

### Practical Example: Code vs Network

#### Step 1: Define the Contract (.proto file)

```protobuf
// Userservice.protobuf
syntax = "proto3";

service UserService {
  rpc GetUser (UserRequest) returns (UserResponse);
  rpc ListUsers (Empty) returns (stream UserResponse);  // Server streaming
}

message UserRequest {
  int32 id = 1;
}

message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

message Empty {}
```

#### Step 2: Client Code (Python example)

```python
//Client.py
import grpc
import user_pb2
import user_pb2_grpc

# Client sits in your application (could be another microservice)
channel = grpc.insecure_channel('localhost:50051')
stub = user_pb2_grpc.UserServiceStub(channel)

# This looks like a local function call!
request = user_pb2.UserRequest(id=123)
response = stub.GetUser(request)
print(f"User: {response.name}, Email: {response.email}")

# Server streaming example
for user in stub.ListUsers(user_pb2.Empty()):
    print(f"Streamed user: {user.name}")
```

#### Step 3: What Actually Happens on the Wire

```plantuml
@startuml
title What Happens Under the Hood
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant "Client App\n(Python)" as Client
participant "gRPC Client\nStub" as ClientStub
participant "HTTP/2\nConnection" as HTTP2
participant "gRPC Server" as Server
participant "Service\nImplementation" as Service

== Connection Establishment ==
Client -> ClientStub: channel = grpc.insecure_channel()
ClientStub -> HTTP2: Establish TCP connection
HTTP2 -> Server: TCP handshake + HTTP/2 preface
note right
  Single connection reused
  for all RPC calls
end note

== RPC Call: GetUser(id=123) ==
Client -> ClientStub: stub.GetUser(UserRequest(id=123))
note right of Client
  Looks like local function call
  Type-safe, no URL construction
end note

ClientStub -> ClientStub: Serialize to Protobuf\n[0x08 0x7B] (id=123)
note right
  Binary encoding:
  Field 1 (id), varint, value 123
  Much smaller than JSON
end note

ClientStub -> HTTP2: HTTP/2 POST\nHeaders:\n  :method: POST\n  :path: /UserService/GetUser\n  content-type: application/grpc+proto\n  te: trailers\nBody: [0x08 0x7B]
note right
  HTTP/2 frame format
  Headers compressed (HPACK)
  Multiple calls multiplexed
end note

HTTP2 -> Server: Binary protobuf payload
Server -> Service: GetUser(UserRequest{id: 123})
note left
  Deserialized automatically
  Type-safe in server code
end note

Service -> Service: Query database
Service -> Server: User{id:123, name:"John", email:"j@ex.com"}

Server -> HTTP2: HTTP/2 Response\nHeaders:\n  :status: 200\n  content-type: application/grpc+proto\n  grpc-status: 0\nBody: [protobuf binary]
note left
  Serialized User object
  Compressed response
end note

HTTP2 -> ClientStub: Binary response
ClientStub -> ClientStub: Deserialize protobuf
ClientStub -> Client: UserResponse{id:123, name:"John", ...}
note right
  Type-safe object returned
  No JSON parsing needed
end note

== Server Streaming: ListUsers() ==
Client -> ClientStub: for user in stub.ListUsers()
ClientStub -> HTTP2: POST /UserService/ListUsers
HTTP2 -> Server: Request (empty)
Server -> Service: ListUsers(Empty{})

loop For each user in database
  Service -> Server: yield User{...}
  Server -> HTTP2: HTTP/2 DATA frame
  note left
    Multiple responses
    Same HTTP/2 stream
  end note
  HTTP2 -> ClientStub: Protobuf user object
  ClientStub -> Client: User object
  Client -> Client: print(user)
end

Server -> HTTP2: HTTP/2 trailers (grpc-status: 0)
note left
  End of stream signal
end note

legend right
Key Differences from REST:
1. Single TCP connection, multiplexed
2. Binary protobuf (not JSON)
3. Streaming built-in (not bolt-on)
4. Type-safe generated code
5. No manual HTTP handling
endlegend
@enduml
```

### Where Does the Client Sit?

```plantuml
@startuml
title gRPC Client Deployment Scenarios
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc
skinparam cloudBorderColor #10b981
skinparam cloudBackgroundColor #ecfdf5

package "Scenario 1: Microservices (Internal)" {
  rectangle "Order Service\n(gRPC Client)" as OrderClient #e0f2fe
  rectangle "User Service\n(gRPC Server)" as UserServer #fce7f3
  rectangle "Payment Service\n(gRPC Server)" as PaymentServer #fef3c7
  
  OrderClient -right-> UserServer : gRPC call\ngetUser(id)
  OrderClient -down-> PaymentServer : gRPC call\nprocessPayment()
  
  note bottom of OrderClient
    Order service acts as CLIENT
    when calling other services
  end note
}

package "Scenario 2: Mobile/Web App" {
  rectangle "Browser\n(gRPC-Web Client)" as Browser #dbeafe
  cloud "gRPC-Web\nProxy (Envoy)" as Proxy #d1fae5
  rectangle "Backend API\n(gRPC Server)" as Backend #fce7f3
  
  Browser -right-> Proxy : HTTP/1.1 + Base64\n(browser-compatible)
  Proxy -right-> Backend : HTTP/2 + Binary\n(native gRPC)
  
  note bottom of Browser
    Browsers can't:
    - Access raw HTTP/2 frames
    - Send trailers (in some cases)
    - Use bidirectional streaming
  end note
  
  note bottom of Proxy
    Proxy translates:
    gRPC-Web ↔ gRPC
  end note
}

package "Scenario 3: API Gateway Pattern" {
  rectangle "API Gateway\n(gRPC Client + HTTP Server)" as Gateway #f3e8ff
  rectangle "Service A\n(gRPC Server)" as ServiceA #fce7f3
  rectangle "Service B\n(gRPC Server)" as ServiceB #fef3c7
  rectangle "External Client\n(REST)" as External #e0e7ff
  
  External -down-> Gateway : REST/HTTP
  Gateway -down-> ServiceA : gRPC
  Gateway -down-> ServiceB : gRPC
  
  note bottom of Gateway
    Gateway translates REST to gRPC
    Internal services use gRPC
  end note
}

package "Scenario 4: CLI Tool / Batch Job" {
  rectangle "Admin CLI\n(gRPC Client)" as CLI #dbeafe
  rectangle "Backend Service\n(gRPC Server)" as BackendService #fce7f3
  
  CLI -right-> BackendService : gRPC call\nadminOperation()
  
  note bottom of CLI
    Command-line tools can be
    gRPC clients for automation
  end note
}

legend right
gRPC Client can be:
- Another microservice (most common)
- Mobile app (via gRPC-Web)
- Web app (via gRPC-Web)
- CLI tool / script
- API Gateway
- Batch job / worker
endlegend
@enduml
```

### Binary Payload Comparison

**REST/JSON Request:**
```http
POST /api/users/123 HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User-Agent: Mozilla/5.0...

{"id": 123, "name": "John Doe", "email": "john@example.com"}
```
**Size: ~350 bytes** (headers + JSON)

**gRPC/Protobuf Request:**
```
:method: POST
:path: /UserService/GetUser
content-type: application/grpc+proto

[Binary: 0x08 0x7B]  // Just 2 bytes for id=123!
```
**Size: ~80 bytes** (compressed headers + protobuf)

:::tip[Key Insight]
In gRPC, the **client stub is auto-generated code** that lives in your application (microservice, CLI, mobile app, etc.). It handles all the low-level HTTP/2 and Protobuf serialization, so you just call methods like local functions.
:::

### Why Browsers Don't Fully Support gRPC

Browsers have fundamental limitations that prevent native gRPC support:

#### 1. **No Access to Raw HTTP/2 Frames**

```plantuml
@startuml
title Browser Limitations with HTTP/2
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc
skinparam noteBorderColor #ef4444
skinparam noteBackgroundColor #fee2e2

package "What gRPC Needs" {
  rectangle "Direct HTTP/2\nFrame Control" as Need1 #fecaca
  rectangle "Custom Headers\n(trailers)" as Need2 #fecaca
  rectangle "Bidirectional\nStreaming" as Need3 #fecaca
}

package "What Browser Provides" {
  rectangle "Fetch API" as Fetch #dbeafe
  rectangle "XMLHttpRequest" as XHR #dbeafe
  rectangle "WebSocket" as WS #dbeafe
}

note right of Need1
  gRPC needs to control
  HTTP/2 frame types directly
end note

note left of Fetch
  Fetch API abstracts away
  low-level HTTP/2 details
end note

Fetch -[hidden]right-> Need1
XHR -[hidden]right-> Need2
WS -[hidden]right-> Need3

note bottom
  Browser security model prevents
  direct HTTP/2 frame manipulation
end note
@enduml
```

:::tip[Browsers DO Support HTTP/2!]
**Modern browsers fully support HTTP/2** (Chrome, Firefox, Safari, Edge all use HTTP/2 by default since ~2015).

**But there's a catch**: Browsers only expose HTTP/2 through **high-level JavaScript APIs** like `fetch()` and `XMLHttpRequest`, which hide the low-level HTTP/2 details for security and simplicity.

**What This Means:**
- ✅ Your browser **uses HTTP/2** when you visit `https://google.com`
- ✅ Multiplexing, header compression, server push all work automatically
- ❌ JavaScript **cannot directly control** HTTP/2 frames, trailers, or stream management
- ❌ This prevents **native gRPC** from working in browsers

**Analogy**: It's like having a sports car (HTTP/2) but only being allowed to use the automatic transmission (fetch API). You get the speed benefits, but can't manually shift gears (control frames).
:::

**Problem**: Browsers provide high-level APIs (`fetch`, `XMLHttpRequest`) that abstract HTTP/2. gRPC needs direct control over HTTP/2 frames to:
- Send custom frame types
- Control flow control windows
- Manage stream priorities

#### 2. **HTTP Trailers Limitation**

gRPC relies heavily on **HTTP trailers** to send metadata after the response body (like error codes, status).

:::note[What are HTTP Trailers?]
**HTTP Trailers** are additional headers sent **after** the response body, rather than before it. They're part of the HTTP/1.1 and HTTP/2 specifications.

**Normal HTTP Response (Headers First):**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 42
[response body]
```

**HTTP Response with Trailers (Metadata After Body):**
```http
HTTP/2 200 OK
Content-Type: application/grpc+proto
TE: trailers                    ← Indicates trailers will follow
[response body - streaming data]
grpc-status: 0                  ← Trailer header (after body)
grpc-message: Success           ← Trailer header (after body)
```

**Why Trailers Matter for gRPC:**
- **Streaming**: You don't know the final status until all data is sent
- **Error Codes**: Server can send data first, then indicate success/failure
- **Metadata**: Checksums, timing info, custom headers sent after processing

**Example Use Case:**
```
1. Server starts sending 1000 user records
2. Client receives records as they stream
3. Error occurs at record 500
4. Server sends trailer: grpc-status: 13 (Internal Error)
5. Client knows exactly what happened
```

Without trailers, the server would need to buffer the entire response or use workarounds.
:::

```http
// Normal gRPC response with trailers
HTTP/2 200 OK
content-type: application/grpc+proto
[response data - streaming]
grpc-status: 0          ← Trailer (sent AFTER body)
grpc-message: Success   ← Trailer
```

**Browser Issue**: 
- `fetch()` API doesn't expose trailers in most browsers
- Even with HTTP/2, trailers are often ignored or inaccessible in JavaScript

#### 3. **Bidirectional Streaming**

```plantuml
@startuml
title gRPC Streaming Types
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant "Browser" as Browser
participant "Server" as Server

== Server Streaming (Supported in gRPC-Web) ==
Browser -> Server: Request
note right: Single request
Server --> Browser: Response 1
Server --> Browser: Response 2
Server --> Browser: Response 3
note left: Multiple responses
note right of Browser
  Fetch API supports this
  (Server-Sent Events style)
end note

== Client Streaming (NOT in gRPC-Web) ==
Browser -> Server: Request 1
Browser -> Server: Request 2
Browser -> Server: Request 3
note right: Multiple requests
Server --> Browser: Single response
note right of Browser
  ❌ Fetch API limitation
  Can't send multiple requests
  on same stream
end note

== Bidirectional Streaming (NOT in gRPC-Web) ==
Browser -> Server: Request 1
Server --> Browser: Response 1
Browser -> Server: Request 2
Server --> Browser: Response 2
note right of Browser
  ❌ Would need WebSocket
  Not true HTTP/2 gRPC
end note

legend right
  Browsers can only do:
  - Unary (request/response)
  - Server streaming
  
  Cannot do:
  - Client streaming
  - Bidirectional streaming
endlegend
@enduml
```

### gRPC-Web: The Browser Solution

gRPC-Web is a **modified protocol** that works within browser constraints.

```plantuml
@startuml
title gRPC-Web Proxy Architecture
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam sequenceArrowColor #334155
skinparam sequenceParticipantBorderColor #94a3b8
skinparam sequenceParticipantBackgroundColor #f8fafc
skinparam noteBackgroundColor #f8fafc
skinparam noteBorderColor #94a3b8
hide footbox

participant "Browser\n(JavaScript)" as Browser
participant "gRPC-Web\nProxy (Envoy)" as Proxy
participant "Backend\n(gRPC Server)" as Backend

== Request Flow ==
Browser -> Browser: Generate JS stub\nfrom .proto
note right of Browser
  Code generation still works
  But different wire format
end note

Browser -> Proxy: HTTP/1.1 POST\nContent-Type: application/grpc-web+proto\nBody: [Base64 encoded protobuf]
note right of Browser
  Uses regular HTTP/1.1
  Base64 encoding (not binary)
  Trailers in body (not headers)
end note

Proxy -> Proxy: Decode Base64\nExtract trailers from body
note right of Proxy
  Proxy does the translation
  Envoy, Nginx, or custom proxy
end note

Proxy -> Backend: HTTP/2 gRPC\nBinary protobuf\nReal trailers
note right of Proxy
  Converts to native gRPC
  Full HTTP/2 features
end note

Backend -> Backend: Process request
Backend -> Proxy: gRPC response\n+ trailers

Proxy -> Proxy: Encode to Base64\nEmbed trailers in body
note left of Proxy
  Converts back to
  gRPC-Web format
end note

Proxy -> Browser: HTTP/1.1 Response\nBase64 encoded\nTrailers in body
note left of Browser
  Browser-compatible format
  Can use fetch() API
end note

legend right
  gRPC-Web Compromises:
  ✅ Unary calls work
  ✅ Server streaming works
  ❌ Client streaming doesn't work
  ❌ Bidirectional streaming doesn't work
  ⚠️  Larger payload (Base64 overhead)
endlegend
@enduml
```

#### What gRPC-Web Proxy Does

**Envoy Proxy Configuration Example:**
```yaml
http_filters:
  - name: envoy.filters.http.grpc_web
    typed_config:
      "@type": type.googleapis.com/envoy.extensions.filters.http.grpc_web.v3.GrpcWeb
```

**Translation:**
1. **Request**: Base64 protobuf → Binary protobuf
2. **Headers**: Browser-safe headers → gRPC headers
3. **Trailers**: Extract from body → Put in HTTP/2 trailers
4. **Response**: Binary → Base64, Trailers → Body

#### Why gRPC is Not Popular with Web Apps (Client-Side)

```plantuml
@startuml
title gRPC vs REST for Web Clients
left to right direction
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam rectangleBorderColor #94a3b8
skinparam rectangleBackgroundColor #f8fafc

package "REST Advantages for Web" {
  rectangle "Native Browser\nSupport" as REST1 #dcfce7
  rectangle "Easy Debugging\n(DevTools)" as REST2 #dcfce7
  rectangle "CDN Cacheable" as REST3 #dcfce7
  rectangle "No Proxy Needed" as REST4 #dcfce7
  rectangle "Human Readable" as REST5 #dcfce7
}

package "gRPC-Web Disadvantages" {
  rectangle "Needs Proxy\n(Envoy/Nginx)" as GRPC1 #fee2e2
  rectangle "Larger Payloads\n(Base64)" as GRPC2 #fee2e2
  rectangle "Limited Streaming" as GRPC3 #fee2e2
  rectangle "Binary Debugging\nHarder" as GRPC4 #fee2e2
  rectangle "No Browser Cache" as GRPC5 #fee2e2
}

note right of REST1
  fetch() works out of the box
  No translation needed
end note

note left of GRPC1
  Must deploy and maintain
  additional proxy layer
end note

note right of REST3
  GET requests cacheable
  by CDNs (Cloudflare, etc.)
end note

note left of GRPC5
  POST requests only
  Can't leverage HTTP cache
end note

@enduml
```

#### Real-World Comparison

**REST API (Direct from Browser):**
```javascript
// Works everywhere, no setup
const response = await fetch('https://api.example.com/users/123');
const user = await response.json();
console.log(user);  // Easy to debug in DevTools
```

**gRPC-Web (Requires Proxy + Code Gen):**
```javascript
// 1. Need to deploy Envoy proxy
// 2. Generate JS stubs from .proto
// 3. Import generated code
import {UserServiceClient} from './generated/user_grpc_web_pb';
import {UserRequest} from './generated/user_pb';

const client = new UserServiceClient('https://api.example.com');
const request = new UserRequest();
request.setId(123);

client.getUser(request, {}, (err, response) => {
  console.log(response.toObject());  // Binary, harder to debug
});
```

#### When to Use gRPC-Web vs REST

| Use Case | Recommended |
|----------|-------------|
| Public API for web apps | **REST/JSON** |
| Internal microservices | **gRPC (native)** |
| Mobile apps (native) | **gRPC (native)** |
| Real-time dashboards (server streaming) | **gRPC-Web** ⚠️ |
| Simple CRUD operations | **REST/JSON** |
| Backend-to-backend (Node.js, Go server) | **gRPC (native)** |

:::caution[gRPC-Web Tradeoffs]
**Problems:**
1. **Extra infrastructure**: Must deploy and maintain Envoy/Nginx proxy
2. **Larger payloads**: Base64 encoding adds ~33% overhead
3. **Limited streaming**: No client or bidirectional streaming
4. **Debugging harder**: Binary format in Network tab
5. **No HTTP caching**: All POST requests, can't use CDN effectively

**Benefits:**
- Type safety (if you really need it on frontend)
- Code generation (shared .proto between frontend/backend)
- Server streaming (for real-time updates)
:::

#### Why REST Dominates Web Clients

```plaintext
Web App Priorities          gRPC-Web  REST/JSON
─────────────────────────────────────────────────
Simple setup                    ❌        ✅
Works everywhere                ⚠️        ✅
Easy debugging (DevTools)       ❌        ✅
CDN caching                     ❌        ✅
No extra infrastructure         ❌        ✅
Human-readable payloads         ❌        ✅
Bidirectional streaming         ❌        ❌*
Type safety                     ✅        ⚠️**

* Use WebSockets for real-time bidirectional
** Can add TypeScript types manually
```

**Bottom Line**: For browser-based web apps, **REST/JSON remains king** because it's simpler and doesn't require proxy infrastructure. gRPC shines for **backend microservices** where you control both ends and can use native gRPC.
