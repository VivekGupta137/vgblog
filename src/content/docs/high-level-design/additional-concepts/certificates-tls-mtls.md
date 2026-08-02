---
title: Certificates Tls Mtls
---

# Certificates, TLS, and Mutual TLS — A Complete Guide

A ground-up reference for how services prove their identity to each other using X.509 certificates, how TLS works at the handshake level, and how mTLS extends that to authenticate both sides of a connection.

---

## Table of Contents

1. [Why service-to-service authentication matters](#1-why-it-matters)
2. [Authentication mechanism comparison](#2-mechanism-comparison)
3. [Certificate fundamentals](#3-certificate-fundamentals)
4. [The TLS handshake — one-way and mutual](#4-the-tls-handshake)
5. [How mTLS works end-to-end](#5-how-mtls-works)
6. [Implementing mTLS](#6-implementing-mtls)
7. [Common failure modes](#7-common-failure-modes)
8. [Glossary](#8-glossary)

---

## 1. Why it matters

When a browser talks to a website, a **human** authenticates — username, password, MFA. But when one backend service calls another, there is no human to type a password. The calling service still has to answer the receiver's question:

> "Who are you, and are you allowed to call me?"

That is **service-to-service authentication**. Sitting inside a trusted network is not sufficient on its own — a compromised host, misconfigured firewall, or malicious insider can otherwise call any internal service freely.

Two distinct questions are always in play. Keep them separate:

| Question | Name | Example |
|---|---|---|
| "Who are you?" | **Authentication (authN)** | This caller is the `order-service`. |
| "What are you allowed to do?" | **Authorization (authZ)** | `order-service` may call `CreateOrder` but not `DeleteUser`. |

Certificates answer **authentication**. Authorization is a separate layer on top — typically RBAC, JWT claims, or a policy engine.

---

## 2. Mechanism comparison

Common ways a service proves its identity, roughly weakest to strongest:

| Mechanism | How it proves identity | Strengths | Weaknesses |
|---|---|---|---|
| **Network trust only** | "You reached me through the firewall/VPN/mesh" | Zero app code | No real identity — one breach = full access |
| **API key / shared secret** | Caller sends a long secret string in a header | Simple to implement | Secret can leak; same key for everyone; manual rotation |
| **HMAC signed request** | Caller signs the request body with a shared secret | Tamper-proof; secret never transmitted | Both sides share a secret; clock-skew handling needed |
| **Bearer token / JWT** | Short-lived signed token from an auth server | Scales; carries claims; short-lived | Token theft = impersonation until expiry |
| **Kerberos / NTLM** | OS proves the calling account via Active Directory | No secrets in the app | Windows/AD-only; awkward across trust boundaries |
| **Mutual TLS (client certificate)** | Caller presents an X.509 cert and proves it owns the private key during the TLS handshake | Strong crypto identity; happens at transport layer before app code runs; nothing secret is transmitted | Cert lifecycle management (issue, rotate, expire, revoke) |

:::tip
Defense in depth is common and healthy: combine mTLS (authentication — *who* is calling) with an authorization layer (RBAC, JWT, or signed tokens — *what* the caller may do). No single mechanism needs to do both jobs.
:::

---

## 3. Certificate fundamentals

Before mTLS makes sense you need four concepts: **key pairs**, **certificates**, **certificate authorities**, and **certificate stores**.

### 3.1 The key pair (asymmetric cryptography)

A certificate is built on a **public/private key pair**. The fundamental property:

- Anything **signed** with the **private** key can be **verified** with the **public** key.
- Anything **encrypted** with the **public** key can only be **decrypted** with the **private** key.

The **private key is a secret you never share**. The **public key** you hand out freely. This lets you prove identity *without transmitting a secret*: sign something with your private key; the other side verifies with your public key.

:::note[The signet ring analogy]
Think of the private key as a signet ring that stamps a unique wax seal, and the public key as a photograph of that seal that everyone has. Anyone can check a letter's seal against the photo, but only you can *make* the seal. You never mail the ring.
:::

### 3.2 What an X.509 certificate is

An **X.509 certificate** is a structured file that bundles:

- A **public key**
- **Identity fields** — the **Subject**, whose **Common Name (CN)** is the human-readable identity (e.g. `payment-service.internal.corp`)
- **Validity dates** (`Not Before` / `Not After`)
- The **Issuer** — who vouches for it — and the issuer's **digital signature**
- A **thumbprint** — a hash that uniquely fingerprints the whole certificate

The certificate does **not** contain the private key. The private key is stored separately and protected. A `.pfx`/`.p12` file bundles cert + private key together (password-protected, for installation). A `.cer`/`.crt` is the public cert only.

#### What a certificate looks like

`openssl x509 -text -noout -in cert.pem` decodes any certificate:

```
Certificate:
    Data:
        Version: 3
        Serial Number: 04:ff:b3:14:28:c2:91:2d
        Signature Algorithm: sha256WithRSAEncryption
        Issuer:  C=US, O=Acme Corp Internal CA, CN=Acme-Internal-CA
        Validity
            Not Before: Jan 15 00:00:00 2024 GMT
            Not After:  Jan 15 23:59:59 2025 GMT
        Subject: C=US, O=Acme Corp, CN=payment-service.internal.corp
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus: 00:b3:4a:28:f9:c1:7e:...
                Exponent: 65537
        X509v3 Extensions:
            X509v3 Key Usage: Digital Signature, Key Encipherment
            X509v3 Extended Key Usage: TLS Web Client Authentication
    Signature Algorithm: sha256WithRSAEncryption
        8f:2a:14:bc:77:...   ← CA's digital signature over everything above
```

On disk, stored as Base64-encoded DER binary — **PEM format**:

```
-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIIBP+zFCjCkS0wDQYJKoZIhvcNAQELBQAwOTELMAkGA1UE
... (binary structure above, base64-encoded)
-----END CERTIFICATE-----
```

The private key is always a completely separate file and is **never shared**:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAs0oo+cEuPhM2...  (leaking this lets anyone impersonate you)
-----END RSA PRIVATE KEY-----
```

```plantuml
@startjson
#highlight "CA Signature"
#highlight "Private Key  (secret — never leaves the host)"
{
  "X.509 Certificate  (public — safe to share)": {
    "Subject":        "CN=payment-service.internal.corp, O=Acme Corp",
    "Issuer":         "CN=Acme-Internal-CA",
    "Valid":          "2024-01-15  →  2025-01-15",
    "Public Key":     "2048-bit RSA public key  [share freely]",
    "Serial Number":  "04:ff:b3:14:28:c2:91:2d",
    "Key Usage":      "TLS Web Client Authentication",
    "CA Signature":   "SHA256(all fields above) signed with CA private key"
  },
  "Private Key  (secret — never leaves the host)": {
    "Stored at":    "Secure key store (OS keychain, HSM, or file with tight ACL)",
    "Protected by": "Access control — only the service process may read it",
    "Contents":     "2048-bit RSA private key  [never share or transmit]"
  }
}
@endjson
```

### 3.3 Certificate Authorities and the chain of trust

How do you trust a certificate you have never seen? Because a **Certificate Authority (CA)** you *already* trust has **signed** it. Your OS ships with a set of trusted **Root CA** certificates. A cert may be signed by an intermediate CA, which is itself signed by the root — forming a **chain**:

```graphviz
digraph chain {
  rankdir=LR
  node [shape=box, style="filled,rounded", fillcolor=lightyellow]
  edge [label="signs"]

  Root   [label="Root CA\n(trusted by OS)", fillcolor=lightblue]
  Inter  [label="Intermediate CA\n(trusted because Root signed it)"]
  Leaf   [label="service certificate\n(CN=payment-service...)", fillcolor=lightgreen]

  Root -> Inter
  Inter -> Leaf
}
```

When a cert is presented, the receiver walks the chain up to a trusted root. If the chain is valid, not expired, and not revoked, the cert is trusted.

:::note
Internal PKIs often run their own **private root CA**. Every internal host is configured to trust that root — certs it issues are trusted internally but not on the public internet. This is the standard pattern for service-to-service mTLS within a datacenter or VPC.
:::

### 3.4 Where certificates live

| Platform | Location | Notes |
|---|---|---|
| **Windows** | `LocalMachine\My` (Personal store) | Machine-wide; `.pfx` imports cert + private key together |
| **Linux / macOS** | `/etc/ssl/certs/`, `/etc/pki/tls/`, or application-managed | PEM files; private key is a separate file with `600` permissions |
| **Kubernetes** | `Secret` of type `kubernetes.io/tls` | Projected into the pod as a volume; key never exposed to the image |
| **HSM** | Hardware Security Module | Private key never exported; crypto operations run inside the device |

:::caution[Private key ACLs]
Having a cert in the store is not enough. The process identity your service runs as must have **read permission on the private key**. If it does not, the cert loads but the TLS handshake fails when signing is attempted. This is one of the most common deployment gotchas.
:::

### 3.5 How a CA signs a certificate — the CSR flow

The signing process is a concrete cryptographic operation. It starts with you generating a key pair and creating a **CSR (Certificate Signing Request)** — a file that says "I am CN=X, here is my public key, and here is a signature proving I own the matching private key." Only the CSR goes to the CA; the private key never leaves your host.

```plantuml
@startuml
title Certificate Lifecycle: Key Generation → CSR → Signed Certificate

actor "Service Operator" as dev
participant "openssl / certreq\n(on the host)" as tool
participant "Certificate Authority\n(internal or public PKI)" as ca

group 1 — Generate key pair
    dev -> tool : openssl genrsa -out private.key 2048
    tool --> dev : private.key\n━━ NEVER leaves this host ━━
    note right of tool : Public key is derived from private.key\nbut cannot be reversed.
end

group 2 — Create a CSR
    dev -> tool : openssl req -new -key private.key -out request.csr\n  -subj "/CN=payment-service.internal.corp/O=Acme Corp"
    note right of tool
        request.csr contains:
        • Your public key
        • Identity fields (CN, Org, Country)
        • A signature using your PRIVATE key
          → proves you own the key pair
          → CA knows the CSR was not forged
    end note
    tool --> dev : request.csr  ← safe to send
end

group 3 — CA signs the CSR → produces the certificate
    dev -> ca : Submit request.csr
    ca -> ca : Verify identity\n(internal CA = policy / automated;\npublic CA = domain / org / EV checks)
    ca -> ca : Build cert fields:\n  Subject  ← from CSR\n  Issuer   = CA's Distinguished Name\n  Validity = today + N years\n  PublicKey← from CSR
    ca -> ca : hash = SHA256(all cert fields)\nsignature = RSA_sign(hash, CA_private_key)
    ca -> ca : Attach signature → cert.pem
    ca --> dev : cert.pem  (signed certificate)
end

note over dev
  You now have exactly two files:
  ┌──────────────────────────────────────────────────┐
  │  private.key  — secret, install on the host ONLY │
  │  cert.pem     — public, install and share freely │
  └──────────────────────────────────────────────────┘

  Anyone with the CA public key can verify the cert:
    expected_hash = SHA256(cert fields)
    actual_hash   = RSA_decrypt(signature, CA_public_key)
    if equal  → cert is genuine and untampered ✓
    if not    → cert was forged or altered     ✗
end note
@enduml
```

:::note[Why the CA signature is the critical piece]
It cryptographically binds "this public key" to "this identity (CN=...)". Without a trusted CA vouching for it, anyone could self-sign a cert claiming to be `bank.com`. With a CA signature your OS already trusts, you know the CA verified the claim first.
:::

---

## 4. The TLS handshake

TLS (the "S" in HTTPS) does two jobs: **encrypts** the connection and **authenticates** the parties. There are two flavors.

### 4.1 One-way TLS — only the server authenticates

This is standard HTTPS. Only the **server** presents a certificate; the client stays anonymous.

```
CLIENT                                              SERVER
  │  1. ClientHello — "let's negotiate TLS"          │
  │ ────────────────────────────────────────────────►│
  │                                                  │
  │  2. ServerHello + Certificate (public key)       │
  │ ◄──────────────────────────────────────────────── │
  │                                                  │
  │  3. Client validates cert chain + freshness      │
  │     (CA trusted? not expired? CN matches host?)  │
  │                                                  │
  │  4. ServerKeyExchange + signature                │
  │     (proves server holds the private key)        │
  │ ◄──────────────────────────────────────────────── │
  │                                                  │
  │  5. Both derive shared session key via ECDHE.    │
  │     Encrypted channel is live.                   │
  │ ◄─────────────────────────────────────────────── ►│
```

The client learns "I really am talking to `payment-service`." But the server has **no idea who the client is** — that is why web apps then ask you to log in.

#### CertificateVerify — how possession is proved

A certificate is a **public** file — anyone can copy it. Simply sending the cert during the handshake proves nothing. The proof comes from a separate `ServerKeyExchange` message:

```
After sending its certificate, the server sends:

  signature = RSA_sign(
      SHA256(client_random + server_random + ephemeral_DH_public_key),
      server_private_key     ← only the genuine server can produce this
  )

The client verifies the signature using the public key in the presented cert.
✓ Passes  → server genuinely holds the private key
✗ Fails   → abort; someone is impersonating the server
```

Because the signature covers freshly-generated random values unique to **this session**, it cannot be replayed from any prior connection.

#### Diffie-Hellman key exchange

Both sides independently derive the **same** session key without ever transmitting it. TLS uses **ECDHE** (Elliptic Curve Diffie-Hellman Ephemeral):

```
1. Both agree on a curve and a base point G (public)
2. Client  picks secret scalar a → sends a·G (public point)
3. Server  picks secret scalar b → sends b·G (public point)
4. Client  computes a·(b·G) = ab·G
5. Server  computes b·(a·G) = ab·G   ← same value!

An eavesdropper saw a·G and b·G but cannot compute ab·G
without knowing a or b. Neither secret crossed the wire.
```

:::note[Forward secrecy]
Because ECDHE uses **ephemeral** key pairs (generated fresh per session and then discarded), past sessions cannot be decrypted even if the server's long-term certificate private key is stolen later. This property is called **forward secrecy**.
:::

```plantuml
@startuml
title One-Way TLS Handshake — Full Detail

participant "Client\n(browser / service)" as C
participant "Server\n(payment-service)" as S

== Phase 1 — Negotiate ==

C -> S : ClientHello\n  client_random  (32 fresh random bytes)\n  supported cipher suites

S -> C : ServerHello\n  server_random  (32 fresh random bytes)\n  chosen suite: TLS_ECDHE_RSA_AES256_GCM_SHA384

S -> C : Certificate\n  server X.509 cert  (public key inside)\n  ← presented; proves nothing yet

note over C : Validate cert chain:\n  ✓ CA trusted by OS?\n  ✓ Not expired?\n  ✓ CN matches the hostname?

== Phase 2 — Key Exchange (ECDHE) ==

S -> C : ServerKeyExchange\n  Ks_pub  (server ephemeral EC public key)\n  + RSA_sign(SHA256(client_random + server_random + Ks_pub),\n             server_private_key)\n  ← THIS signature proves server owns the cert

note over C : Verify signature with public key from the cert.\n✓ pass → server is genuine\n✗ fail → abort; impersonation detected

C -> C : Generate ephemeral EC key pair:\n  Kc_priv  (secret, stays here forever)\n  Kc_pub   (sent to server)

C -> S : ClientKeyExchange\n  Kc_pub

note over C : pre_master_secret = ECDH(Kc_priv, Ks_pub)
note over S : pre_master_secret = ECDH(Ks_priv, Kc_pub)\n← same value (a·B = b·A in EC math)\n\nNeither private key crossed the wire.

== Phase 3 — Derive Session Keys ==

note over C,S
  master_secret = PRF(pre_master_secret, "master secret",
                      client_random + server_random)

  session_keys  = PRF(master_secret, "key expansion",
                      server_random + client_random)

  Expands into symmetric keys:
    client_write_key  → AES key for client → server
    server_write_key  → AES key for server → client
    + MAC keys for integrity

  pre_master_secret discarded immediately.
  Ephemeral keys (Kc_priv, Ks_priv) discarded immediately.
  Forward secrecy: past sessions safe even if cert key stolen later.
end note

C -> S : ChangeCipherSpec + Finished  (encrypted)
S -> C : ChangeCipherSpec + Finished  (encrypted)

note over C,S #LightGreen : Encrypted channel established.\nAll traffic uses AES-256-GCM.\nSession key was never transmitted — both sides computed it independently.
@enduml
```

### 4.2 Mutual TLS (mTLS) — both sides authenticate

mTLS adds one message: the server sends a **CertificateRequest**, asking the client to also prove its identity. Now **both** identities are established at the **transport layer**, before any application code runs.

```
CLIENT (order-service)                              SERVER (payment-service)
  │  1. ClientHello                                  │
  │ ────────────────────────────────────────────────►│
  │                                                  │
  │  2. ServerHello + Certificate                    │
  │     + CertificateRequest  ← mTLS-only message    │
  │ ◄──────────────────────────────────────────────── │
  │                                                  │
  │  3. Client validates server cert.                │
  │     Client sends ITS cert (public key)           │
  │     + CertificateVerify (signature with          │
  │       its own private key — the proof)           │
  │ ────────────────────────────────────────────────►│
  │                                                  │
  │  4. Server validates client cert chain           │
  │     AND verifies the CertificateVerify           │
  │     signature → client owns the private key.     │
  │     Server checks: is this CN on the allow-list? │
  │                                                  │
  │  5. Both authenticated. Encrypted channel up.    │
  │ ◄──────────────────────────────────────────────►│
```

:::note[The private key never leaves the client]
The client proves ownership by **signing** a value derived from the handshake; the server verifies with the public key in the presented cert. No secret crosses the wire. Copying the cert alone is useless without the corresponding private key.
:::

```plantuml
@startuml
title Mutual TLS (mTLS) — Full Annotated Handshake

participant "Client Service\n(order-service)" as C
participant "Server Service\n(payment-service)" as S

== Phase 1 — Negotiate ==

C -> S : 1. ClientHello\n   client_random, cipher suites

S -> C : 2. ServerHello\n   server_random, chosen cipher suite

S -> C : 3. Certificate\n   server X.509 cert (public key inside)

S -> C : 4. CertificateRequest  ← the mTLS-only extra message\n   "I require a client certificate too"

S -> C : 5. ServerKeyExchange\n   Ks_pub (ephemeral EC key)\n   + RSA_sign(hash, server_private_key)\n   → proves server owns its cert

note over C : Validate server cert chain.\nVerify ServerKeyExchange signature.\n✓ → server is genuine.

== Phase 2 — Client Proves Its Identity ==

C -> S : 6. Certificate\n   Client X.509 cert  (CN=order-service.internal.corp)\n   ← public, just a claim, proves nothing yet

C -> C : 7. Compute proof:\n   h     = SHA256(every handshake message 1–6)\n   proof = RSA_sign(h, client_private_key)

C -> S : 8. CertificateVerify\n   proof\n   ━━ THIS IS THE PROOF OF IDENTITY ━━\n   Only the holder of the private key matching\n   the presented cert can produce this.\n   h covers fresh randoms → not replayable.

note over S #LightCoral : 9. Verify CertificateVerify:\n   h' = SHA256(handshake messages 1–6)\n   RSA_verify(proof, h', public_key_from_cert)\n   ✓ match   → client holds the private key  ← authentication\n   ✗ mismatch → TLS alert, connection aborted

note over S #LightCoral : 10. Check allow-list:\n    Is this cert CN mapped to an allowed identity?\n    "order-service.internal.corp"   → ✓ allowed\n    "unknown-service.internal.corp" → ✗ rejected (HTTP 403)

== Phase 3 — Session Keys ==

C -> S : 11. ClientKeyExchange\n    Kc_pub (client ephemeral EC public key)

note over C,S : Both independently compute:\n  pre_master = ECDH(my_priv, their_pub)  ← same on both sides\n  master_secret, session_keys derived via PRF\n\nNo private key or pre-master secret ever crossed the wire.

C -> S : 12. ChangeCipherSpec + Finished  (encrypted)
S -> C : 13. ChangeCipherSpec + Finished  (encrypted)

note over C,S #LightGreen : Encrypted channel established.\nBoth identities cryptographically proven.\nApplication traffic flows over AES-256-GCM.
@enduml
```

**What mTLS actually verifies — two independent checks:**

| Check | Question | Mechanism |
|---|---|---|
| Chain validation | Is this cert genuine? | Walk the chain to a trusted root CA |
| CertificateVerify | Does the presenter own the cert? | Verify the signature — only possible with the private key |

:::success[Advantages of mTLS]
- **No shared secret transmitted** — identity proof uses signing, not secret comparison
- **Transport-layer enforcement** — rejected before application code runs; not bypassable by the app
- **Mutual** — both sides are authenticated in the same handshake, no second round-trip
- **Forward secrecy** — ephemeral ECDHE keys mean past sessions are safe if a cert is later compromised
- **Phishing-resistant** — the proof is cryptographically bound to this specific handshake session
:::

:::caution[Disadvantages of mTLS]
- **Certificate lifecycle** — certs expire; rotation and revocation must be automated or outages follow
- **PKI overhead** — you need a CA (internal or managed), enrollment workflow, and distribution
- **Debugging complexity** — TLS failures surface as opaque transport errors, not application errors
- **No revocation at handshake time by default** — CRL/OCSP checking must be explicitly configured; otherwise a revoked cert still passes chain validation until it expires
:::

---

## 5. How mTLS works end-to-end

For a call from **order-service → payment-service**, the complete picture:

**On the client (order-service) host:**
1. The client certificate (`order-service.internal.corp`) is installed in the cert store with its private key.
2. The process identity the service runs as has read access to the private key.
3. When making the HTTPS call, the TLS stack attaches the certificate and uses the private key to produce the `CertificateVerify` signature.

**On the server (payment-service) host:**
4. The TLS server is configured to **request** a client cert (`ssl_verify_client on` in nginx, `ClientCertificateMode.RequireCertificate` in ASP.NET, `AccessSSLRequireCert` in IIS).
5. The server validates the presented cert's chain (CA trusted? not expired?).
6. The server checks an **allow-list**: is this cert's Subject CN mapped to an allowed caller?
7. If yes, the request is allowed through to the application. If no → **HTTP 403** (cert not authorized), *before* any controller code runs.
8. The application may add a further authorization check (e.g. RBAC, JWT claims) on top.

:::note
Authentication (mTLS) and authorization (RBAC/claims) are separate gates. mTLS establishes *who* is calling. Whether that caller is *permitted* to invoke a specific operation is a second independent question answered by the authorization layer.
:::

---

## 6. Implementing mTLS

### 6.1 Generating a client certificate

```bash
# 1. Generate the private key — stays on this host only
openssl genrsa -out client.key 2048

# 2. Create a CSR
openssl req -new -key client.key -out client.csr \
  -subj "/CN=order-service.internal.corp/O=Acme Corp"

# 3. Have your CA sign it (internal CA example using openssl)
openssl x509 -req -in client.csr \
  -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out client.crt -days 365 -sha256

# 4. Bundle as PKCS#12 (for stores that need it, e.g. Windows)
openssl pkcs12 -export -out client.pfx -inkey client.key -in client.crt
```

### 6.2 Client side — attaching the cert to outgoing calls

#### Python (requests)

```python
import requests

response = requests.get(
    "https://payment-service.internal.corp/api/charge",
    cert=("client.crt", "client.key"),   # client cert + private key
    verify="ca.crt",                      # validate server cert against internal CA
)
```

#### Go

```go
cert, err := tls.LoadX509KeyPair("client.crt", "client.key")
if err != nil {
    log.Fatal(err)
}

caCert, _ := os.ReadFile("ca.crt")
caCertPool := x509.NewCertPool()
caCertPool.AppendCertsFromPEM(caCert)

tlsConfig := &tls.Config{
    Certificates: []tls.Certificate{cert},
    RootCAs:      caCertPool,
}

client := &http.Client{
    Transport: &http.Transport{TLSClientConfig: tlsConfig},
}
```

#### .NET (HttpClient)

```csharp
var cert = new X509Certificate2("client.pfx", "password");

var handler = new HttpClientHandler();
handler.ClientCertificates.Add(cert);
// validate server cert against internal CA
handler.ServerCertificateCustomValidationCallback =
    HttpClientHandler.DangerousAcceptAnyServerCertificateValidator; // dev only
    // In production: load and pin your internal CA cert instead

var client = new HttpClient(handler);
```

:::caution
Returning `true` unconditionally from `ServerCertificateCustomValidationCallback` means "trust any server cert." This is acceptable only inside a fully trusted internal network and should be gated on an environment flag. In internet-facing code it defeats the purpose of TLS entirely.
:::

#### Node.js

```javascript
const https = require("https");
const fs = require("fs");

const options = {
  cert: fs.readFileSync("client.crt"),
  key: fs.readFileSync("client.key"),
  ca: fs.readFileSync("ca.crt"),   // trust internal CA
};

const req = https.request("https://payment-service.internal.corp/", options, (res) => {
  // handle response
});
```

### 6.3 Server side — requiring and validating the client cert

#### nginx

```nginx
server {
    listen 443 ssl;

    ssl_certificate     /etc/ssl/server.crt;
    ssl_certificate_key /etc/ssl/server.key;
    ssl_client_certificate /etc/ssl/internal-ca.crt;   # CA to validate client certs against

    ssl_verify_client on;          # require a valid client cert
    ssl_verify_depth  2;           # walk the chain up to 2 levels

    location / {
        # $ssl_client_s_dn contains the client cert Subject DN
        # Use it to enforce an allow-list at the application level if needed
        proxy_set_header X-Client-Cert-Subject $ssl_client_s_dn;
        proxy_pass http://backend;
    }
}
```

#### ASP.NET Core

```csharp
builder.Services.AddAuthentication(CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate(options =>
    {
        options.AllowedCertificateTypes = CertificateTypes.All;
        options.RevocationMode = X509RevocationMode.NoCheck; // or Online for CRL
        options.Events = new CertificateAuthenticationEvents
        {
            OnCertificateValidated = context =>
            {
                // Enforce allow-list by CN
                var allowedCNs = new[] { "order-service.internal.corp", "inventory-service.internal.corp" };
                var cn = context.ClientCertificate.GetNameInfo(X509NameType.SimpleName, false);
                if (!allowedCNs.Contains(cn))
                {
                    context.Fail("Client certificate not on allow-list");
                    return Task.CompletedTask;
                }
                context.Success();
                return Task.CompletedTask;
            }
        };
    });

// Require HTTPS and client cert
builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureHttpsDefaults(https =>
    {
        https.ClientCertificateMode = ClientCertificateMode.RequireCertificate;
    });
});
```

### 6.4 Certificate rotation

:::tip
Automate rotation before it becomes an incident. A cert that has never been rotated in production is a cert that operations does not know how to rotate. Practice rotation on a schedule in staging.
:::

**Rotation procedure:**

```
1. Generate a new key pair + CSR (new private key must be generated, not reused)
2. Submit CSR to your CA → receive new signed certificate
3. Install the new cert alongside the old one (both active for a brief window)
4. Rolling-deploy services to use the new cert
5. Remove the old cert once all services have been updated
6. Verify no traffic references the old cert (check metrics / access logs)
```

A **zero-downtime** rotation requires:
- The server's allow-list accepts both the old and new client CN during the overlap window
- Or the CN does not change (same CN, new key pair + re-issued cert) so no allow-list changes are needed

---

## 7. Common failure modes

| Symptom | Likely cause | How to diagnose |
|---|---|---|
| **HTTP 403 / TLS alert "certificate required"** | Server requires a client cert but none was attached | Check client-side attach logic; confirm cert is in the cert store with its private key |
| **HTTP 403 / "certificate rejected"** | Client cert's CN is not in the server's allow-list | Inspect the server's cert mapping configuration; confirm the CN matches exactly |
| **"Could not establish trust relationship"** | Server cert not trusted by the client (chain or root missing) | Check client's trusted-root store; add internal CA root if needed |
| **Cert loads but handshake fails silently** | Process lacks **read access to the private key** | Check ACLs on the private key file; use `openssl verify` to confirm the key matches the cert |
| **Works in dev, fails in staging/prod** | mTLS disabled in dev by environment flag but enabled in staging | Check for environment guards around cert attachment; confirm cert is deployed to all environments |
| **Cert not found in store** | CN mismatch, wrong store location, or cert not deployed | On the host, list certs matching the expected CN; confirm `LocalMachine\My` vs `CurrentUser\My` |
| **Cert found but `PrivateKey` is null** | Cert installed without the private key (public cert only) | Re-import the `.pfx` bundle including the private key |
| **"Certificate has expired"** | `Not After` date passed | Renew cert; automate expiry alerts (alert at 30 days, 14 days, 7 days) |
| **Revoked cert still accepted** | CRL/OCSP checking not configured on the server | Enable `X509RevocationMode.Online` or configure OCSP stapling |

**Quick diagnostic commands:**

```bash
# Inspect a certificate's fields
openssl x509 -text -noout -in cert.pem

# Verify the private key matches the certificate
openssl rsa -check -in private.key                        # key is valid
openssl x509 -noout -modulus -in cert.pem | openssl md5   # cert modulus hash
openssl rsa  -noout -modulus -in private.key | openssl md5 # key modulus hash
# → hashes must match

# Walk the chain and validate against a CA
openssl verify -CAfile ca.crt cert.pem

# Test mTLS end-to-end
openssl s_client -connect payment-service.internal.corp:443 \
  -cert client.crt -key client.key \
  -CAfile ca.crt

# Check a remote server's cert
echo | openssl s_client -connect payment-service.internal.corp:443 2>/dev/null \
  | openssl x509 -noout -dates -subject -issuer
```

---

## 8. Glossary

| Term | Meaning |
|---|---|
| **Authentication (authN)** | Proving *who* you are |
| **Authorization (authZ)** | Deciding *what* you may do |
| **X.509 certificate** | Standard file format bundling a public key + identity + CA signature |
| **Public/private key pair** | Asymmetric keys: sign with private; verify with public; encrypt with public; decrypt with private |
| **CA (Certificate Authority)** | An entity whose signature makes a cert trustworthy |
| **Root CA** | A CA whose cert is trusted directly by the OS/browser — the anchor of the chain of trust |
| **Intermediate CA** | A CA signed by the root; issues leaf/service certs without exposing the root key |
| **Chain of trust** | Leaf cert → intermediate CA → root CA that the OS trusts |
| **Subject / CN (Common Name)** | The certificate's identity, e.g. `payment-service.internal.corp` |
| **Thumbprint** | A hash uniquely fingerprinting a specific certificate file |
| **PEM** | Base64-encoded certificate format — `-----BEGIN CERTIFICATE-----` |
| **PKCS#12 / PFX** | Bundle format containing cert + private key, password-protected |
| **CSR (Certificate Signing Request)** | File sent to a CA to request issuance of a signed certificate; contains public key and identity; does not contain private key |
| **TLS** | Transport Layer Security — encrypted + authenticated connection (the S in HTTPS) |
| **mTLS (mutual TLS)** | TLS where *both* client and server present certificates |
| **Client certificate** | The cert a *calling* service presents to prove its identity |
| **CertificateVerify** | TLS handshake message containing the client's signature proof that it holds the private key |
| **ECDHE** | Elliptic Curve Diffie-Hellman Ephemeral — key exchange that provides forward secrecy |
| **Forward secrecy** | Property ensuring past sessions cannot be decrypted even if long-term keys are later compromised |
| **CRL** | Certificate Revocation List — a CA-published list of revoked cert serial numbers |
| **OCSP** | Online Certificate Status Protocol — real-time revocation check against the CA |
| **Allow-list** | Server-side list of client cert CNs that are permitted to connect |
| **ACL (private key)** | Access Control List restricting which OS accounts may read a certificate's private key |
