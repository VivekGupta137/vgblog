---
title: Frontend security mistakes in React
description: Common frontend security pitfalls and how to avoid them in React apps.
---

# Frontend security mistakes juniors make (and how seniors fix them)

Most frontend security bugs come from **trusting user input too much**, **mis-handling auth tokens**, and **confusing UI with security boundaries**. Below is a practical checklist you can use during code reviews or interviews.

## 1) XSS (Cross‑Site Scripting) — the #1 frontend mistake

**Common junior mistakes**

- Using `dangerouslySetInnerHTML` with user content
- Rendering unsanitized HTML from APIs
- Trusting Markdown or rich text without sanitization

Example anti‑pattern:

```jsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Why it’s dangerous**

Attackers inject scripts or event handlers, then steal tokens, cookies, or perform actions as the user.

**How seniors fix it**

- Avoid raw HTML where possible (React escapes by default)
- Sanitize rich text with a proven library (e.g., DOMPurify)
- Enforce a strong Content Security Policy (CSP)

> “XSS is the most common frontend vulnerability — juniors often render unsanitized content or use `dangerouslySetInnerHTML` without proper sanitization.”

## 2) Token storage mistakes (high‑impact)

**Common junior mistakes**

- Storing JWTs in `localStorage` or `sessionStorage`

Why it’s bad: any XSS can read and exfiltrate those tokens.

Anti‑pattern:

```js
localStorage.setItem("token", jwt)
```

**How seniors fix it**

- Use `HttpOnly`, `Secure` cookies for session/refresh tokens
- Keep access tokens short‑lived
- Rotate and revoke tokens server‑side

> “Storing auth tokens in `localStorage` makes XSS a full account‑takeover vulnerability.”

## 3) Missing or weak CSP (Content Security Policy)

**Common junior mistakes**

- No CSP at all
- `script-src 'unsafe-inline' 'unsafe-eval'`
- Allowing scripts from everywhere

**Why CSP matters**

It’s the last line of defense against XSS: it blocks inline scripts and unexpected domains.

**Strong CSP patterns**

- `script-src 'self'`
- Use nonces or hashes for inline scripts
- Roll out with `Content-Security-Policy-Report-Only` first

> “Many teams forget CSP entirely, even though it’s one of the strongest protections against XSS.”

## 4) Confusing validation with security

**Common junior mistakes**

- Validating only on the frontend
- Trusting client‑side checks for authorization
- Rendering unescaped server data

**What seniors say**

> “Frontend validation is for UX, not security. All real validation and sanitization must happen on the backend.”

**Frontend still matters for**

- Output escaping
- Sanitizing rich text
- Preventing DOM‑based injection

## 5) CSRF misconceptions (especially with cookie auth)

**Common junior mistakes**

- Using cookies for auth without CSRF protection
- Disabling `SameSite`
- Assuming JWTs automatically prevent CSRF

**How seniors fix it**

- `SameSite=Lax` or `Strict` for session cookies
- CSRF tokens for unsafe methods (POST/PUT/PATCH/DELETE)
- Consider double‑submit cookie pattern

> “When using cookie‑based auth, you must handle CSRF. JWTs alone don’t remove this risk.”

## 6) Over‑trusting the frontend (authorization bugs)

**Common junior mistakes**

- Hiding buttons instead of enforcing permissions
- Trusting roles sent from the client
- Relying on UI to block actions

**Rule of thumb**

UI is **not** a security boundary. The backend must enforce all authorization checks.

## 7) Leaking sensitive data in the frontend

**Common junior mistakes**

- Shipping API keys in JS bundles
- Exposing internal IDs or PII in logs
- Leaving source maps publicly accessible

**How seniors fix it**

- Never ship secrets to the client
- Strip debug logs in production
- Protect or remove production source maps

---

# CSRF explained (quick, practical)

## What is CSRF?

**CSRF (Cross‑Site Request Forgery)** tricks a logged‑in user’s browser into sending a request that the server accepts as legitimate. The attacker doesn’t steal your password — they abuse automatic cookie sending.

## Classic example: money transfer

You’re logged into `bank.com`. Your browser has a valid session cookie.

The attacker hosts a page that auto‑submits a form:

```html
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="amount" value="1000" />
  <input type="hidden" name="to" value="attacker" />
</form>
<script>
  document.forms[0].submit();
</script>
```

Your browser sends the request **with your cookies**, and the bank processes it.

## Why it works

- Cookies are sent automatically to the domain
- The server can’t tell if the request came from your app or a malicious site
- CSRF only works when auth is **cookie‑based** and the action is **state‑changing**

## Defenses

### 1) SameSite cookies (modern default)

```
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax
```

- `Strict`: never sent on cross‑site requests
- `Lax`: sent only on top‑level navigation (good default)
- `None`: sent everywhere (must be `Secure`)

### 2) CSRF tokens (classic and effective)

Server issues a token; frontend sends it on unsafe requests:

```
POST /transfer
X-CSRF-Token: 9f82kls9d
```

Attackers can’t read or guess the token, so forged requests fail.

### 3) Origin/Referer checks (additional defense)

Reject requests with an unexpected `Origin`:

```
Origin: https://myapp.com
```

## Frontend’s role in CSRF protection

CSRF is primarily a backend concern, but the frontend must cooperate: include CSRF tokens in requests and avoid disabling `SameSite` unless there’s a strong reason.