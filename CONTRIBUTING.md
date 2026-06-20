# 🤝 Contributing to MotoTrack

First off — **thank you** for taking the time to contribute! 🎉

MotoTrack is a large, opinionated codebase (851+ monitor components, ~10K-line toolbar file, persisted Zustand store). This guide will help you ship a contribution that merges fast.

---

## 📋 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [Before You Start](#-before-you-start)
3. [Development Setup](#-development-setup)
4. [Project Conventions](#-project-conventions)
5. [How to Contribute](#-how-to-contribute)
6. [Adding a Monitor Panel (Most Common)](#-adding-a-monitor-panel-most-common)
7. [Pull Request Checklist](#-pull-request-checklist)
8. [CI/CD Pipeline](#-cicd-pipeline)
9. [Style Guide](#-style-guide)
10. [Communication](#-communication)

---

## 📜 Code of Conduct

By participating, you agree to uphold a respectful, inclusive, and constructive tone. Personal attacks, harassment, or discrimination of any kind will not be tolerated. Disagreements are fine — be kind about them.

---

## 🧭 Before You Start

- **Search existing issues & PRs** — someone may already be working on your idea.
- **Open an issue first** for new features or large refactors (≥100 LOC). A 5-minute discussion can save a 5-hour rewrite.
- **Check the roadmap** in [README.md](README.md#-roadmap) — planned items may have design notes or constraints.
- **One feature per PR** — small, focused PRs review faster.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+ (tested on v24)
- **Bun** 1.x (preferred — the repo's scripts assume Bun)
- A **MapTiler API key** ([get one free](https://cloud.maptiler.com/))

### Steps

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/mototracklatest.git
cd mototracklatest

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Edit .env → add NEXT_PUBLIC_MAPTILER_KEY=your_key

# 4. Initialize the database
bun run db:push

# 5. Start the dev server (webpack mode, port 3000)
bun run dev
```

> ⚠️ **Use `bun run dev` (webpack mode), not `bun run dev:turbo` (turbopack).** The codebase is large enough that turbopack runs out of memory in this sandbox. Webpack with `--max-old-space-size=7168` is the tested configuration.

### Verify Your Setup

```bash
# Lint must pass cleanly
bun run lint

# Dev server must respond 200 on http://localhost:3000
curl -sI http://localhost:3000 | head -1
```

---

## 📐 Project Conventions

### Tech Stack (Non-Negotiable)
- **Next.js 16** with App Router (no Pages Router)
- **TypeScript 5** with strict typing — no `any` without a comment justifying it
- **Tailwind CSS 4** + **shadcn/ui** (New York style) — prefer existing components over custom
- **Prisma ORM** + SQLite for persistence
- **Zustand** for client state, **TanStack Query** for server state

### File Organization
```
src/
├── app/
│   ├── api/              # API routes (server-side, 'use server')
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # The ONLY user-visible route
├── components/
│   ├── map/              # Map components (851 monitors + 35 tools)
│   └── ui/               # shadcn/ui primitives (do not modify)
├── hooks/                # Custom React hooks
└── lib/                  # map-store.ts, db.ts, utils
```

### Naming
- **Components**: PascalCase, file name matches component name (`WeatherPanel.tsx` exports `WeatherPanel`)
- **Monitor components**: Must end in `Monitor` (`HairSalonStudioMonitor`, never `HairSalonStudio`)
- **Hooks**: `use-` prefix, camelCase
- **API routes**: kebab-case folder names
- **Store keys**: camelCase, no abbreviations (`hairSalonStudio`, not `hss`)

---

## 🛠️ How to Contribute

### 1. Pick or File an Issue
Check the [issue tracker](https://github.com/markec12345678/mototracklatest/issues) for items labeled `good first issue`, `help wanted`, or `bug`.

### 2. Create a Branch
```bash
git checkout -b feature/short-descriptive-name
# or
git checkout -b fix/issue-123-description
```

### 3. Make Your Changes
- Follow the [Style Guide](#-style-guide) below.
- Keep diffs focused — no unrelated reformatting.
- If touching API routes, add/adjust `zod` input validation.

### 4. Test Locally
```bash
# Lint
bun run lint

# Manual smoke test via browser (or agent-browser for automation)
# Verify the affected flow end-to-end
```

### 5. Commit (Conventional Commits)
We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body, optional>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Examples**:
```
feat(monitors): add 8 Financial Services monitors (859 total)
fix(routing): handle null waypoints in OSRM proxy
docs(readme): update monitor count to 851
ci: add TypeScript check to GitHub Actions
chore(deps): bump zustand to 5.0.2
```

### 6. Push & Open a PR
```bash
git push origin feature/short-descriptive-name
```

Open a PR against `main`. Fill in the PR template (see below).

---

## 🖥️ Adding a Monitor Panel (Most Common)

This is the most frequent contribution. Follow these steps **exactly** — the codebase is highly templated.

### Pre-flight Checks (Do These First!)

1. **Verify no file conflict**:
   ```bash
   ls src/components/map/<YourName>Monitor.tsx
   # Should return "No such file"
   ```

2. **Verify no store-key conflict**:
   ```bash
   rg "<yourStoreKey>" src/lib/map-store.ts
   # Should return nothing
   ```

3. **Verify the Lucide icon exists** in the type definitions (NOT via `require()`):
   ```bash
   rg "^export.*\b<IconName>\b" node_modules/lucide-react/dist/lucide-react.d.ts
   ```

4. **Find a free icon alias** in `MapToolbarButtons.tsx`:
   ```bash
   rg "<IconName> as <IconName>Icon\d+" src/components/map/MapToolbarButtons.tsx
   # Use the next free suffix
   ```

### Step-by-step

| # | File | Action |
|---|------|--------|
| 1 | `src/components/map/<Name>Monitor.tsx` | Create ~213-line component, copying `OfficeSupplyChainMonitor.tsx` pattern. Export name MUST end in `Monitor`. |
| 2 | `src/lib/map-store.ts` | Add 3 references: interface field, default state, setter. |
| 3 | `src/components/map/panel-groups/MonitorPanelRegistry.tsx` | Add store read + LazyPanel block. |
| 4 | `src/components/map/MapToolbarButtons.tsx` | Add icon import (with alias), store read, button block. |

### Hard Rules for Monitors

- ✅ **4 real US locations** with valid coordinates, realistic business data
- ✅ **Status values**: `'critical' | 'warning' | 'moderate' | 'stable'`
- ✅ **Trend values**: `'up' | 'down' | 'stable'` with `as const`
- ✅ **`flagshipLines`** is a comma-separated STRING
- ✅ **`monthlyRevenue`** is a NUMBER in $M (e.g., `1.2` means $1.2M)
- ❌ **NO indigo or blue** primary gradient colors (allowed: emerald, pink, amber, fuchsia, teal, orange, green, cyan, rose, red, violet, stone, purple, sky, yellow, slate)
- ❌ **NEVER use `\'` or `\\'`** inside string literals — causes parse errors. Use template literals or escape differently.
- ❌ **NO `dangerouslySetInnerHTML`**
- ❌ **NO `any` types**

### Verify Your Monitor

```bash
# 1. Lint
bun run lint

# 2. Browser test (manual or via agent-browser)
#    a. Open http://localhost:3000
#    b. Find your new toolbar button (look for the icon)
#    c. Click it → panel should appear top-right
#    d. Verify: heading, 4 locations, metrics grid, status filter, detail card
#    e. Click a location → detail card updates
#    f. Click X → panel closes
```

---

## ✅ Pull Request Checklist

Before requesting review, ensure:

- [ ] `bun run lint` passes with exit code 0
- [ ] Dev server starts cleanly on port 3000
- [ ] No console errors in browser DevTools
- [ ] No `console.log` left in production code (use proper logging if needed)
- [ ] No secrets, API keys, or `.env` content in the diff
- [ ] No commented-out code blocks
- [ ] If adding a monitor: all 4 registration points (component, store, registry, toolbar) are present
- [ ] If touching API routes: input validation added/updated
- [ ] If touching UI: tested on mobile (≤640px) and desktop (≥1024px) widths
- [ ] Commit messages follow Conventional Commits
- [ ] PR description explains the **why**, not just the **what**

---

## 🔄 CI/CD Pipeline

All PRs and pushes to `main` run through [GitHub Actions](.github/workflows/ci.yml):

| Job | Purpose | Fails on |
|-----|---------|----------|
| **lint** | `bun run lint` (ESLint) | Any ESLint error |
| **typecheck** | `tsc --noEmit` | Any TypeScript error |
| **build** | `bun run build` (only on PRs to main) | Build failure |

**Tips to keep CI green**:
- Run `bun run lint` locally before pushing.
- For TypeScript errors, run `npx tsc --noEmit` to reproduce locally.
- Build failures are often memory-related — if you added many components, the dev server uses webpack with `--max-old-space-size=7168`. CI runs `next build` which has its own memory budget.

---

## 🎨 Style Guide

### TypeScript
- Prefer `type` for unions/intersections, `interface` for object shapes that may be extended.
- Use `const` by default; `let` only when reassignment is required.
- Avoid `enum` — use union types or `as const` objects.
- Use `import type` for type-only imports.

### React
- Function components only — no class components.
- `'use client'` directive at the top of any file using hooks, state, or browser APIs.
- Prefer `useMemo`/`useCallback` for expensive computations passed as props.
- Effects must have explicit dependency arrays — no `// eslint-disable-next-line react-hooks/exhaustive-deps`.

### CSS / Tailwind
- Use Tailwind utility classes — no custom CSS unless absolutely necessary (add to `globals.css` if needed).
- **Sticky footer**: always wrap the app in `min-h-screen flex flex-col` and apply `mt-auto` to the footer.
- **Mobile-first**: write the mobile styles first, then enhance with `sm:`, `md:`, `lg:`.
- **Touch targets**: minimum 44×44px for interactive elements.
- **Colors**: use Tailwind variables (`bg-primary`, `text-primary-foreground`) — avoid hardcoded hex.
- **NO indigo or blue** as primary brand color (see monitor rules above).

### API Routes
- Always start with `'use server'` if the route is a server action, or use the standard `NextRequest`/`NextResponse` pattern for route handlers.
- Validate all input with `zod` — never trust `req.body` or `req.query` directly.
- Return appropriate HTTP status codes (400, 401, 404, 500).
- Don't leak stack traces or internal errors to the client.

---

## 💬 Communication

- **Issues**: For bugs, feature requests, and questions.
- **Pull Requests**: For code changes. Keep discussion in the PR, not DMs.
- **Security**: See [SECURITY.md](SECURITY.md) — do NOT open public issues for security vulnerabilities.

### Response Times

| Channel | Target |
|---------|--------|
| Issue acknowledgment | 3 days |
| PR initial review | 5 days |
| Security report acknowledgment | 48 hours (see SECURITY.md) |

---

## ❓ Need Help?

- Browse [closed PRs](https://github.com/markec12345678/mototracklatest/pulls?q=is%3Apr+is%3Aclosed) for examples of accepted contributions.
- Read the [README](README.md) for architecture context.
- Open an issue with the `question` label if you're stuck.

---

Happy contributing! 🚀 Map on.
