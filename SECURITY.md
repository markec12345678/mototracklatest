# 🔒 Security Policy

## Supported Versions

MotoTrack is under active development. Security fixes are applied to the latest `main` branch only.

| Version | Supported          |
|---------|--------------------|
| `main`  | ✅ Active support  |
| `< 1.0` | ❌ Pre-release, no SLA |

---

## 🛡️ Reporting a Vulnerability

We take security vulnerabilities seriously. **Please do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **Email** the maintainer directly at: `markec12345678@users.noreply.github.com`
2. **Subject line**: `[SECURITY] MotoTrack — <short description>`
3. **Include** in the report:
   - Description of the vulnerability and its potential impact
   - Step-by-step reproduction instructions
   - Affected files, routes, or components (if known)
   - Suggested fix (optional but appreciated)
   - Your name/handle for credit (optional)

### Response Timeline

| Step                          | Target SLA |
|-------------------------------|------------|
| Acknowledgment of report      | 48 hours   |
| Initial assessment            | 5 days     |
| Fix or mitigation published   | 30 days    |
| Public disclosure (coordinated) | After fix is released |

### What to Expect

- We will acknowledge your report within 48 hours.
- We will investigate and verify the issue.
- We will coordinate a fix and disclosure timeline with you.
- We will credit reporters in release notes (unless you prefer to remain anonymous).

---

## 🚫 Out of Scope

The following are **not** considered security vulnerabilities:

- Self-XSS requiring the victim to paste malicious code into their own browser
- Missing security headers on a static asset route (please open a regular issue instead)
- Theoretical timing attacks without a working PoC
- Vulnerabilities in third-party services (MapTiler, OSRM, Overpass, Open-Meteo) — report to those projects directly
- Rate-limiting or denial-of-service against your own self-hosted instance
- Issues in the demo/sample data inside monitor components (they are illustrative, not real PII)

---

## 🔐 Built-in Security Measures

MotoTrack implements several layers of defense:

### API Surface
- All external API access (MapTiler, OSRM, Open-Meteo, Overpass) is **proxied through Next.js API routes** — frontend never holds raw third-party keys.
- API key for MapTiler is exposed as `NEXT_PUBLIC_MAPTILER_KEY` (intentionally public, scoped to map tiles + geocoding domain).
- Server-side routes validate input via `zod` schemas before proxying.

### Database
- Prisma ORM with parameterized queries (no raw SQL string concatenation) — SQL injection resistant.
- SQLite database file is stored **outside** the `public/` directory and is never served as a static asset.
- The DB file is `.gitignore`d — no seed data leaks to the repository.

### Client State
- Zustand stores are **client-side only** — no sensitive session data is persisted to `localStorage` unless explicitly user-initiated (e.g., saving a bookmark).
- No cookies store authentication tokens (NextAuth is available but not currently wired for login).
- The app does not transmit or store credit card numbers, SSNs, or other regulated PII.

### Dependencies
- Dependencies are pinned to minor versions in `package.json`.
- Run `bun audit` (or `npm audit`) periodically to check for known CVEs.
- Renovate / Dependabot is recommended (see below).

### Content Security
- Monitor panel data is **static sample data** embedded in the component source — no user-uploaded content is rendered without escaping.
- Map popups, POI descriptions, and search results are rendered through React's JSX (auto-escaped) — never `dangerouslySetInnerHTML`.

---

## 🔑 API Key Hygiene

MotoTrack requires a MapTiler API key. Follow these rules:

1. **Never commit** a real production key to the repository. Use `.env` (gitignored) or a secret manager.
2. **Rotate keys** if you suspect leakage. MapTiler allows multiple active keys.
3. **Restrict the key** in the MapTiler dashboard to your production domain(s) via HTTP referrer rules.
4. The provided `.env.example` contains only a placeholder — copy it to `.env` and fill in your real key.

```bash
cp .env.example .env
# Edit .env → NEXT_PUBLIC_MAPTILER_KEY=your_real_key
```

---

## 🧪 Security Testing Checklist (for contributors)

Before submitting a PR that touches API routes or authentication:

- [ ] All user input is validated with a `zod` schema
- [ ] No raw SQL — only Prisma query builder methods
- [ ] No secrets in source code or committed `.env`
- [ ] No `dangerouslySetInnerHTML` with untrusted data
- [ ] No `eval()`, `Function()`, or `new Function()` with user input
- [ ] HTTPS-only external requests (no `http://` for third-party APIs)
- [ ] Error responses do not leak stack traces or DB schema to the client
- [ ] File uploads (GPX import) are size-limited and MIME-validated

---

## 📜 Disclosure Policy

- We follow **coordinated disclosure** — vulnerabilities are disclosed publicly only after a fix is released and reporters have been notified.
- Critical vulnerabilities (RCE, auth bypass, mass data leak) may warrant an expedited patch release.
- We will publish a **SECURITY advisory** on GitHub for any CVE-classified issue.

---

## 📞 Contact

- **Security reports**: `markec12345678@users.noreply.github.com`
- **General issues**: [GitHub Issues](https://github.com/markec12345678/mototracklatest/issues)

---

Thank you for helping keep MotoTrack and its users safe. 🛡️
