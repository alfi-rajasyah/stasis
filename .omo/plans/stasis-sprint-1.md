# Stasis Sprint 1 — Foundation + Dashboard + Budget

## TL;DR

> **Quick Summary**: Bootstrap a Next.js 14 personal finance app with Prisma/SQLite, tRPC, shadcn/ui, and Tailwind. Implement the Dashboard (income, committed, free cash, upcoming dues, debt progress) and Budget (category allocations with inline edit) screens. All 5 routes scaffolded but only Dashboard + Budget functional.
>
> **Deliverables**:
> - Running Next.js app at localhost:3000 with TypeScript, Tailwind, and shadcn/ui
> - SQLite database with 11 tables, migrations, and seed data (10 categories + sample income)
> - tRPC API layer with 6 procedures (categories, income, budget, dashboard)
> - Dashboard screen with live data: income card, committed %, free cash, upcoming dues, debt progress
> - Budget screen with category allocation bars, inline edit, income-vs-allocation warning
> - Bottom tab bar navigation across 5 routes (3 placeholder)
> - Light/dark theme with system preference + manual toggle
> - Vitest test infrastructure with tests for utilities and tRPC procedures
>
> **Estimated Effort**: Medium (21 implementation tasks across 5 waves)
> **Parallel Execution**: YES — 5 waves, max 6 concurrent in Wave 3
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 8 → Task 11 → Task 13 → Task 17 → F1-F4

---

## Context

### Original Request
Implement Sprint 1 of Stasis — a personal finance manager PWA. Greenfield project. The user wants to run locally (`npm run dev` → localhost:3000), verify visually in browser, with automated tests (Vitest) written after each implementation wave and agent-executed QA (curl/Playwright) on every task.

### Interview Summary
**Key Discussions**:
- **Scope**: Sprint 1 ONLY. Trackers (Sprint 2), AI (Sprint 3), PWA/Deploy (Sprint 4) are explicitly excluded.
- **Test Strategy**: Vitest tests written after implementation + Agent-executed QA (curl + Playwright) + visual browser verification
- **Design System Resolution**: System preference + manual toggle for theme (not dark-by-default). Primary accent = Slate #475569 (not blue #3B82F6).
- **categories.type enum**: `'income'` (Salary, Freelance) and `'expense'` (all others including Housing, Food, Transport, Entertainment, Subscriptions, Utilities, Debt Repayment, Savings)
- **No Docker**: Local dev only. Docker deferred to Sprint 4.
- **Sprint 1 deps only**: No `ai`, `@ai-sdk/deepseek`, `next-pwa`, or `uuid` packages.

**Research Findings**:
- No existing codebase — pure greenfield
- No git repo — must initialize
- No SDD frameworks detected
- Project spec (`stasis-master-spec.md`) is 393 lines with full DB schema, API surface, screen wireframes
- Agent prompt (`stasis-agent-prompt.md`) contains full-project build order — Steps 7-12 (Trackers, AI, Settings, PWA, Docker) are excluded from Sprint 1

### Metis Review
**Identified Gaps** (addressed):
- Build order conflates all 4 sprints → Plan strips to Sprint 1 only
- categories.type has no defined enum → Resolved: 'income' | 'expense'
- Design system contradictions → Resolved: system preference + toggle, slate accent
- PWA/AI deps in Step 1 → Excluded from Sprint 1 dependency list
- Dashboard committed = Rp 0 in Sprint 1 → Accepted as expected behavior, empty states designed
- Divide-by-zero when income = 0 → Explicit handling: show "—%" when no income
- IDR formatting needs dot separators → Utility function `formatIDR()` included
- Seed data month mismatch → Dynamic current-month dates in seed script
- `./data/` directory may not exist → Explicit creation before Prisma migration

---

## Work Objectives

### Core Objective
Deliver a fully functional local development environment for Stasis with the Dashboard and Budget MVP screens running on localhost:3000, backed by a SQLite database through type-safe tRPC procedures.

### Concrete Deliverables
- `http://localhost:3000` — Dashboard (home page, `/`)
- `http://localhost:3000/budget` — Budget allocation screen
- `http://localhost:3000/trackers` — Placeholder route (Sprint 2)
- `http://localhost:3000/chat` — Placeholder route (Sprint 3)
- `http://localhost:3000/settings` — Placeholder route (Sprint 4)
- tRPC API at `/api/trpc/*` with 6 procedures

### Definition of Done
- [ ] `npm run dev` starts without errors
- [ ] `npx tsc --noEmit` passes (zero type errors)
- [ ] `npx vitest run` passes all tests
- [ ] Dashboard displays income, committed %, free cash, upcoming dues, debt progress
- [ ] Budget screen allows editing category allocations with persistence
- [ ] Light/dark theme toggle works
- [ ] 5 routes navigable via bottom tab bar

### Must Have
- Next.js 14 App Router + TypeScript scaffold
- Prisma schema with all 11 tables + migration + seed
- tRPC procedures: `categories.list`, `income.add`, `income.list`, `budget.getAll`, `budget.set`, `dashboard.getSummary`
- Dashboard: income card, committed card (with % bar), free cash card, upcoming dues list, debt progress bars
- Budget: category list with allocation amounts, visual bars, inline edit, income-vs-allocation warning
- Bottom tab bar with active state
- Light/dark mode with next-themes (system preference + manual toggle)
- Inter font, slate primary color (#475569), min 44px touch targets
- All monetary values as INTEGER (smallest Rupiah unit), formatted with dot separators

### Must NOT Have (Guardrails)
- **AI/SDK**: Do not install `ai`, `@ai-sdk/deepseek` — Sprint 3
- **PWA**: Do not install or configure `next-pwa` — Sprint 4
- **Docker**: Do not create Dockerfile or docker-compose.yml — Sprint 4
- **Trackers**: Do not build subscriptions, bills, or debts CRUD/UI — Sprint 2
- **AI Chat**: Do not build chat screen or AI integration — Sprint 3
- **Settings**: Do not build settings functionality beyond placeholder route — Sprint 4
- **Direct Prisma on client**: All data access must go through tRPC
- **Float money**: All monetary values must be INTEGER (zod `.int().nonnegative()`)
- **Transactions table**: Do not create a transactions/expense-tracking table
- **Multi-user/auth**: No authentication, no multi-user support
- **Animation libraries**: No framer-motion or spring physics — use CSS transitions only
- **Over-abstraction**: No premature utility extraction, no generic "data" or "result" type names

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (setting up Vitest in Wave 2)
- **Automated tests**: Tests-after (Vitest)
- **Framework**: Vitest with @testing-library/react for component tests
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.omo/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send tRPC requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Project Bootstrap — sequential chain, short):
├── Task 1: create-next-app scaffold + git init
├── Task 2: Install Sprint 1 deps + configure Tailwind + postcss
├── Task 3: shadcn/ui init + design tokens + theme provider
└── Task 4: Environment setup + data dir + Vitest config + utility functions

Wave 2 (Foundation — 4 tasks parallel):
├── Task 5: Prisma schema + migration + seed
├── Task 6: tRPC server setup
├── Task 7: tRPC client provider
└── Task 8: Root layout + metadata + font loading

Wave 3 (Routers + Navigation — 6 tasks parallel):
├── Task 9: categories router
├── Task 10: income router
├── Task 11: budget router
├── Task 12: dashboard router
├── Task 13: Bottom tab bar component
└── Task 14: Placeholder pages (Trackers, Chat, Settings)

Wave 4 (Screens — 4 tasks parallel):
├── Task 15: Dashboard — income + committed + free cash cards
├── Task 16: Dashboard — upcoming dues + debt progress + AI button
├── Task 17: Budget — category list + allocation bars + income summary
└── Task 18: Budget — inline edit + allocation warning + tests

Wave 5 (Testing — 3 tasks parallel):
├── Task 19: Utility function tests
├── Task 20: tRPC procedure integration tests
└── Task 21: Playwright smoke tests

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan Compliance Audit (oracle)
├── Task F2: Code Quality Review (unspecified-high)
├── Task F3: Real Manual QA (unspecified-high)
└── Task F4: Scope Fidelity Check (deep)
→ Present results → Get explicit user okay
```

### Dependency Matrix

- **1**: — — 2, 1
- **2**: 1 — 3, 2, 4-8, 2
- **3**: 2 — 8, 13-18, 2
- **4**: 1 — 5, 19, 2
- **5**: 2, 4 — 6, 9-12, 9-18, 2
- **6**: 5 — 7, 9-12, 3
- **7**: 6 — 15-18, 3
- **8**: 3 — 13-18, 3
- **9**: 5, 6 — 12, 3
- **10**: 5, 6 — 12, 15-18, 3
- **11**: 5, 6 — 12, 17-18, 3
- **12**: 9, 10, 11 — 15-16, 3
- **13**: 3, 8 — 15-18, 4
- **14**: 3, 8 — —, 4
- **15**: 7, 10, 12, 13 — —, 4
- **16**: 7, 12, 13 — —, 4
- **17**: 7, 11, 13 — 18, 4
- **18**: 7, 11, 13, 17 — —, 4
- **19**: 4 — —, 5
- **20**: 9, 10, 11, 12 — —, 5
- **21**: 15, 16, 17, 18 — —, 5

> **Format**: Task — Blocked By (Task IDs) — Blocks (Task IDs), Wave

### Agent Dispatch Summary

- **Wave 1**: 4 — T1-T4 → `quick`
- **Wave 2**: 4 — T5 → `deep`, T6 → `deep`, T7 → `quick`, T8 → `visual-engineering`
- **Wave 3**: 6 — T9-T11 → `quick`, T12 → `deep`, T13 → `visual-engineering`, T14 → `quick`
- **Wave 4**: 4 — T15-T16 → `visual-engineering`, T17 → `visual-engineering`, T18 → `deep`
- **Wave 5**: 3 — T19 → `quick`, T20 → `deep`, T21 → `unspecified-high`
- **FINAL**: 4 — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

- [ ] 1. Scaffold Next.js 14 project with TypeScript + git init

  **What to do**:
  - Run `npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --no-import-alias` in the Stasis directory
  - Initialize git: `git init && git add -A && git commit -m "chore: scaffold Next.js 14 project with TypeScript"`
  - Verify scaffold: `npm run dev` starts on port 3000, shows Next.js default page
  - Clean up default boilerplate: remove `app/page.tsx` content (keep file), remove `app/globals.css` content (will be replaced)

  **Must NOT do**:
  - Do not install any additional packages (deps task handles that)
  - Do not modify `tsconfig.json` beyond Next.js defaults
  - Do not create any custom files beyond what create-next-app provides

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard project initialization — single CLI command + git init. Trivial, well-defined task.
  - **Skills**: [`git-master`]
    - `git-master`: For proper git init and initial commit

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential — blocks all subsequent tasks)
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4 — but sequential chain)
  - **Blocks**: Tasks 2, 3, 4, 5, 6, 7, 8, 13, 14
  - **Blocked By**: None

  **References**:
  - `stasis-master-spec.md:8` — App name "Stasis", product type confirmation
  - `stasis-master-spec.md:143-154` — Tech stack specification (Next.js 14, TypeScript, Tailwind)
  - `stasis-agent-prompt.md:20-24` — Step 1: Project Scaffold instructions

  **Acceptance Criteria**:
  - [ ] `ls package.json` returns the file (project exists)
  - [ ] `npm run dev` starts without errors (exit code 0 or running process, can kill after)
  - [ ] `git log --oneline` shows at least 1 commit
  - [ ] `npx tsc --noEmit` passes (zero type errors on default scaffold)

  **QA Scenarios**:

  ```
  Scenario: Scaffold creates valid Next.js project
    Tool: Bash
    Preconditions: Empty Stasis directory (no package.json)
    Steps:
      1. npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --no-import-alias
      2. git init && git add -A && git commit -m "chore: scaffold Next.js 14 project with TypeScript"
      3. npm run dev & (background, wait 10s for startup)
      4. curl -s http://localhost:3000 | head -20
    Expected Result: curl returns HTML with "Next.js" or valid page content. HTTP 200.
    Failure Indicators: npm run dev fails to start, curl returns error/empty, TypeScript errors in default scaffold
    Evidence: .omo/evidence/task-1-scaffold.txt (curl output + npm run dev output)
  ```

  **Commit**: YES (groups with itself)
  - Message: `chore: scaffold Next.js 14 project with TypeScript`
  - Files: all scaffolded files
  - Pre-commit: `npx tsc --noEmit`

- [ ] 2. Install Sprint 1 dependencies + configure Tailwind and postcss

  **What to do**:
  - Install Sprint 1 ONLY dependencies:
    ```
    npm install prisma @prisma/client @trpc/server @trpc/client @trpc/next @trpc/react-query @tanstack/react-query zod next-themes
    npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
    ```
  - Initialize shadcn/ui (will be used in Task 3, but `npx shadcn-ui@latest init` needs deps present)
    — Actually defer shadcn/ui init to Task 3. This task only installs npm packages.
  - Verify Tailwind is configured from `create-next-app` scaffold
  - Configure `postcss.config.js` if not present

  **Must NOT do**:
  - Do NOT install `ai`, `@ai-sdk/deepseek` (Sprint 3)
  - Do NOT install `next-pwa` (Sprint 4)
  - Do NOT install `uuid` (not needed)
  - Do NOT run `npx shadcn-ui@latest init` — that's Task 3

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: npm install + verify config files exist. Mechanical, low-risk.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1 for package.json)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 3, 4, 5, 6, 7
  - **Blocked By**: Task 1

  **References**:
  - `stasis-master-spec.md:143-154` — Tech stack (all packages listed)
  - `stasis-agent-prompt.md:21-22` — Step 1 dependency list (strip AI/PWA deps)
  - Metis finding: Sprint 1 deps only — confirmed with user

  **Acceptance Criteria**:
  - [ ] `npm ls prisma` shows installed version
  - [ ] `npm ls @trpc/server` shows installed version
  - [ ] `npm ls zod` shows installed version
  - [ ] `npm ls next-themes` shows installed version
  - [ ] `npm ls vitest` shows installed as devDependency
  - [ ] `tailwind.config.ts` exists and is valid TypeScript

  **QA Scenarios**:

  ```
  Scenario: All Sprint 1 dependencies installed correctly
    Tool: Bash
    Preconditions: Task 1 completed (package.json exists)
    Steps:
      1. npm install prisma @prisma/client @trpc/server @trpc/client @trpc/next @trpc/react-query @tanstack/react-query zod next-themes
      2. npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
      3. npm ls prisma --depth=0
      4. npm ls @trpc/server --depth=0
      5. npm ls zod --depth=0
      6. npm ls vitest --depth=0
    Expected Result: All packages show installed versions. No UNMET DEPENDENCY errors. No ERESOLVE errors.
    Failure Indicators: npm install fails with ERESOLVE, package version conflicts, missing packages
    Evidence: .omo/evidence/task-2-deps.txt (full npm ls output)

  Scenario: Sprint 3/4 dependencies are NOT installed
    Tool: Bash
    Preconditions: Task 2 completed
    Steps:
      1. npm ls ai 2>&1
      2. npm ls @ai-sdk/deepseek 2>&1
      3. npm ls next-pwa 2>&1
    Expected Result: All three return "UNMET DEPENDENCY" or "not found" or error — confirming they are NOT installed
    Evidence: .omo/evidence/task-2-no-leaked-deps.txt
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `chore: install Sprint 1 dependencies and configure Tailwind`
  - Files: `package.json`, `package-lock.json`, `tailwind.config.ts`, `postcss.config.js`

- [ ] 3. Initialize shadcn/ui + design system tokens + theme provider

  **What to do**:
  - Run `npx shadcn-ui@latest init` with these answers: TypeScript=yes, style=default, baseColor=slate, globalCSS=yes, cssVariables=yes, tailwind config path, import alias defaults
  - Add required shadcn/ui components: `npx shadcn-ui@latest add button card progress tabs input dialog badge separator`
  - Replace `app/globals.css` with design system tokens (CSS variables for light + dark mode):
    - Light: bg #FFFFFF, surface #F8FAFC, border #E2E8F0, primary #475569, coral #EF4444, mint #2DD4BF, text #1E293B / #64748B
    - Dark: bg #0F172A, surface #1E293B, border #334155, primary #64748B, coral #EF4444, mint #2DD4BF, text #F8FAFC / #94A3B8
    - Both: Inter font, 16px card radius, 10px button radius, min 44px touch targets
  - Create `components/theme-provider.tsx` using `next-themes` — system preference default + manual toggle
  - Create `components/theme-toggle.tsx` — button that cycles light/dark/system

  **Must NOT do**:
  - Do not install additional shadcn/ui components not listed above
  - Do not use #3B82F6 (blue) as accent — use slate #475569
  - Do not hardcode "dark by default" — use system preference

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Design system tokens, CSS variables, theme configuration — involves visual design decisions
  - **Skills**: [`ui-ux-pro-max`]
    - `ui-ux-pro-max`: For design system token generation and shadcn/ui integration

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 2 for shadcn/ui init)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 8, 13, 14, 15, 16, 17, 18
  - **Blocked By**: Task 2

  **References**:
  - `stasis-master-spec.md:7-8` — Design system specification (TouchFlow-inspired, slate palette)
  - `stasis-agent-prompt.md:152-178` — Design System section with exact color tokens
  - `stasis-agent-prompt.md:179` — `next-themes` for dark mode toggle
  - Metis resolution: System preference + toggle (not dark-by-default), slate #475569 (not blue)

  **Acceptance Criteria**:
  - [ ] `npx shadcn-ui@latest init` completes without errors
  - [ ] `ls components/ui/button.tsx` returns the component file
  - [ ] `app/globals.css` contains CSS variables for both light and dark modes
  - [ ] `components/theme-provider.tsx` wraps app with `next-themes` ThemeProvider
  - [ ] `components/theme-toggle.tsx` exists with light/dark/system cycling

  **QA Scenarios**:

  ```
  Scenario: shadcn/ui components are importable and render
    Tool: Bash (verify files exist + compile)
    Preconditions: Task 3 completed
    Steps:
      1. ls components/ui/button.tsx
      2. ls components/ui/card.tsx
      3. ls components/ui/progress.tsx
      4. ls components/ui/tabs.tsx
      5. ls components/ui/input.tsx
      6. ls components/ui/dialog.tsx
      7. ls components/ui/badge.tsx
      8. ls components/ui/separator.tsx
      9. npx tsc --noEmit (verify components compile)
    Expected Result: All 8 component files exist. TypeScript compiles without errors.
    Failure Indicators: Missing component files, TypeScript errors from shadcn/ui components
    Evidence: .omo/evidence/task-3-components.txt

  Scenario: Design tokens are correct
    Tool: Bash (grep)
    Preconditions: Task 3 completed
    Steps:
      1. grep "475569" app/globals.css — should find primary slate
      2. grep "EF4444" app/globals.css — should find coral
      3. grep "2DD4BF" app/globals.css — should find mint
      4. grep "0F172A" app/globals.css — should find dark bg
      5. grep "FFFFFF" app/globals.css — should find light bg
      6. grep "3B82F6" app/globals.css — should NOT find blue (unless shadcn default, acceptable)
    Expected Result: All 5 hex colors present. Blue #3B82F6 may appear from shadcn defaults but should not be the primary accent.
    Evidence: .omo/evidence/task-3-tokens.txt
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `feat: initialize shadcn/ui with design system tokens and theme provider`
  - Files: `components/`, `app/globals.css`, `tailwind.config.ts`

- [ ] 4. Environment setup, data directory, Vitest config, utility functions

  **What to do**:
  - Create `.env` with `DATABASE_URL="file:./data/stasis.db"` and `DEEPSEEK_API_KEY="placeholder-sprint-3"`
  - Create `.env.example` with the same keys but no values
  - Create `data/` directory: `mkdir -p data`
  - Create `.gitignore` entry for `data/` (the SQLite file should not be committed — but the directory needs a `.gitkeep`)
  - Create `vitest.config.ts` at project root:
    ```ts
    import { defineConfig } from 'vitest/config';
    import react from '@vitejs/plugin-react';
    export default defineConfig({
      plugins: [react()],
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
      },
    });
    ```
  - Create `vitest.setup.ts` with `@testing-library/jest-dom` import
  - Create `src/utils/format.ts` with `formatIDR(amount: number): string` — Indonesian Rupiah formatting using dot separators: `Rp 1.000.000`
  - Create `src/utils/dates.ts` with `getCurrentMonth(): string` — returns YYYY-MM
  - Add `test` script to `package.json`: `"test": "vitest run"`

  **Must NOT do**:
  - Do not hardcode API keys
  - Do not commit the SQLite database file
  - Do not create utility functions for things not yet needed

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config files, directory creation, small utility functions — straightforward file creation.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1; can run parallel with Tasks 2, 3 but safer sequential)
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5, 19
  - **Blocked By**: Task 1

  **References**:
  - `stasis-master-spec.md:338` — DATABASE_URL format
  - `stasis-master-spec.md:342` — Env vars list
  - `stasis-master-spec.md:199` — "All amounts in INTEGER (smallest currency unit)"
  - `stasis-master-spec.md:184` — month uses TEXT YYYY-MM
  - Metis finding: Need `./data/` directory before Prisma migration; IDR uses dot separators

  **Acceptance Criteria**:
  - [ ] `.env` file exists with `DATABASE_URL` and `DEEPSEEK_API_KEY`
  - [ ] `data/.gitkeep` exists (directory created)
  - [ ] `vitest.config.ts` compiles without errors
  - [ ] `src/utils/format.ts` exports `formatIDR` function
  - [ ] `src/utils/dates.ts` exports `getCurrentMonth` function
  - [ ] `npm test` runs vitest (0 tests is OK — just verifying config works)

  **QA Scenarios**:

  ```
  Scenario: formatIDR formats Indonesian Rupiah correctly
    Tool: Bash (node REPL)
    Preconditions: Task 4 completed
    Steps:
      1. node -e "const { formatIDR } = require('./src/utils/format'); console.log(formatIDR(5000000))"
    Expected Result: Output is "Rp 5.000.000"
    Failure Indicators: Wrong separator (comma instead of dot), missing "Rp" prefix, wrong value
    Evidence: .omo/evidence/task-4-formatidr.txt

  Scenario: getCurrentMonth returns YYYY-MM format
    Tool: Bash (node REPL)
    Preconditions: Task 4 completed
    Steps:
      1. node -e "const { getCurrentMonth } = require('./src/utils/dates'); console.log(getCurrentMonth())"
    Expected Result: Output matches regex /^\d{4}-\d{2}$/ (e.g., "2026-06")
    Failure Indicators: Wrong format (e.g., "6/2026"), missing leading zero, undefined
    Evidence: .omo/evidence/task-4-currentmonth.txt

  Scenario: Vitest configuration works
    Tool: Bash
    Preconditions: Task 4 completed
    Steps:
      1. npx vitest run --reporter=verbose
    Expected Result: Vitest runs and reports "No test files found" or "0 tests" — not a config error
    Failure Indicators: "Cannot find module", config parse error, jsdom not available
    Evidence: .omo/evidence/task-4-vitest-config.txt
  ```

  **Commit**: YES (groups with itself)
  - Message: `chore: setup env, vitest, data directory, and utility functions`
  - Files: `.env`, `.env.example`, `data/.gitkeep`, `vitest.config.ts`, `vitest.setup.ts`, `src/utils/format.ts`, `src/utils/dates.ts`

- [ ] 5. Prisma schema definition, migration, and seed data

  **What to do**:
  - Initialize Prisma: `npx prisma init --datasource-provider sqlite`
  - Define full schema in `prisma/schema.prisma` with all 11 tables from the master spec:
    - `categories`: id, name, type (enum: INCOME/EXPENSE), color, icon, createdAt, updatedAt
    - `income_entries`: id, source, categoryId, amount (Int), month (String YYYY-MM), notes, createdAt
    - `budget_allocations`: id, categoryId, month (String), allocatedAmount (Int), createdAt, updatedAt
    - `subscriptions`: id, name, amount, currency, billingCycle, nextBillingDate, categoryId, status, notes, createdAt
    - `subscription_payments`: id, subscriptionId, amount, paidDate, createdAt
    - `recurring_bills`: id, name, defaultAmount, dueDay, categoryId, status, notes, createdAt
    - `bill_payments`: id, billId, amount, month, paidDate, isPaid, createdAt
    - `debts`: id, name, creditor, principalAmount, remainingAmount, interestRate, monthlyPayment, startDate, categoryId, status, notes, createdAt
    - `debt_payments`: id, debtId, amount, paymentDate, notes, createdAt
    - `ai_conversations`: id, title, createdAt
    - `ai_messages`: id, conversationId, role, content, toolName, toolArgs, toolResult, createdAt
    - `settings`: key (String @id), value (Json)
  - Run `npx prisma migrate dev --name init`
  - Create `prisma/seed.ts` with:
    - 10 categories: Salary (INCOME, #22C55E), Freelance (INCOME, #3B82F6), Housing (EXPENSE, #EF4444), Food & Dining (EXPENSE, #F97316), Transport (EXPENSE, #EAB308), Entertainment (EXPENSE, #A855F7), Subscriptions (EXPENSE, #EC4899), Utilities (EXPENSE, #06B6D4), Debt Repayment (EXPENSE, #DC2626), Savings (EXPENSE, #10B981)
    - 1 sample income entry for current month: "Monthly Salary", amount 15000000, category Salary
    - 1 sample budget allocation for current month: Housing category, 5000000
  - Add seed config to `package.json`: `"prisma": { "seed": "npx tsx prisma/seed.ts" }`
  - Run `npx prisma db seed`

  **Must NOT do**:
  - Do not use Float for monetary fields — ALL amounts must be Int
  - Do not add a transactions table
  - Do not seed subscriptions, bills, or debts (those are Sprint 2 trackers)
  - Do not hardcode dates — use dynamic current month

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 11-table schema with relationships, seed script with dynamic dates, Prisma migration — complex, requires careful attention to data integrity.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 8 — all run after Wave 1)
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8)
  - **Blocks**: Tasks 6, 9, 10, 11, 12, 15, 16, 17, 18
  - **Blocked By**: Tasks 2, 4

  **References**:
  - `stasis-master-spec.md:160-203` — Full database schema with all column types
  - `stasis-master-spec.md:163` — Seed categories with colors
  - `stasis-master-spec.md:198-203` — Key design decisions (INTEGER amounts, YYYY-MM months)
  - `stasis-master-spec.md:134` — categories schema detail
  - Metis finding: categories.type enum = 'income' | 'expense'; seed income entry for current month

  **Acceptance Criteria**:
  - [ ] `npx prisma migrate status` shows 1 migration applied
  - [ ] `npx prisma db seed` completes without error
  - [ ] `npx prisma studio` can open (manual check — verify tables exist)
  - [ ] All 11 tables have correct columns and types (verify via `prisma/schema.prisma` review)
  - [ ] All monetary columns use `Int` type (not `Float` or `Decimal`)
  - [ ] Seed script creates 10 categories with correct colors
  - [ ] Seed script creates 1 income entry for current month
  - [ ] Seed script creates 1 budget allocation for current month

  **QA Scenarios**:

  ```
  Scenario: Prisma migration creates all tables
    Tool: Bash
    Preconditions: prisma/schema.prisma exists
    Steps:
      1. npx prisma migrate dev --name init
      2. npx prisma migrate status
    Expected Result: Status shows "1 migration found" and "Database is up to date". No errors.
    Failure Indicators: Migration fails (SQL syntax error), conflicting column types, missing relations
    Evidence: .omo/evidence/task-5-migration.txt

  Scenario: Seed data is correct
    Tool: Bash
    Preconditions: Migration applied
    Steps:
      1. npx prisma db seed
      2. npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM categories;" 2>&1
      3. npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM income_entries;" 2>&1
      4. npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM budget_allocations;" 2>&1
    Expected Result: categories=10, income_entries=1, budget_allocations=1
    Failure Indicators: Seed fails, wrong counts, missing tables
    Evidence: .omo/evidence/task-5-seed.txt

  Scenario: Monetary columns are INTEGER (not float)
    Tool: Bash (grep)
    Preconditions: prisma/schema.prisma exists
    Steps:
      1. grep "amount" prisma/schema.prisma | grep -v "//" 
    Expected Result: All amount fields show "Int" type (not Float/Decimal)
    Failure Indicators: Any amount field with Float or Decimal type
    Evidence: .omo/evidence/task-5-int-check.txt
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: add Prisma schema, migration, and seed data`
  - Files: `prisma/`, `package.json`
  - Pre-commit: `npx prisma validate`

- [ ] 6. tRPC server setup — context, procedure builder, app router skeleton

  **What to do**:
  - Create `src/server/context.ts` — tRPC context factory:
    - Import Prisma client singleton (`src/server/db.ts` — create this file)
    - Export `createTRPCContext` function
  - Create `src/server/db.ts` — Prisma client singleton with global caching (standard Next.js pattern)
  - Create `src/server/trpc.ts` — tRPC initialization:
    - `initTRPC.context<typeof createTRPCContext>().create()`
    - Export `router`, `publicProcedure`, `createCallerFactory`
  - Create `src/server/root.ts` — app router that merges all sub-routers:
    - Import categories, income, budget, dashboard routers
    - Export `appRouter` type
  - Create route handler at `src/app/api/trpc/[trpc]/route.ts`:
    - `fetchRequestHandler` from `@trpc/server/adapters/fetch`
    - Wire up `appRouter` and `createTRPCContext`

  **Must NOT do**:
  - Do not implement router procedures yet — only skeleton/imports
  - Do not create a custom Prisma adapter or wrapper
  - Do not use `any` types in context or router definitions

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: tRPC context + router architecture — foundational plumbing that everything depends on. Must be type-correct.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 5, 7, 8 — all run after Wave 1)
  - **Parallel Group**: Wave 2 (with Tasks 5, 7, 8)
  - **Blocks**: Tasks 7, 9, 10, 11, 12
  - **Blocked By**: Tasks 2, 5 (needs prisma client from Task 5)

  **References**:
  - `stasis-master-spec.md:207-233` — API Design section with all tRPC procedures
  - `stasis-agent-prompt.md:50-63` — Step 4: tRPC Setup instructions
  - tRPC official docs: `https://trpc.io/docs/server/adapters/fetch` — Next.js App Router setup pattern

  **Acceptance Criteria**:
  - [ ] `src/server/db.ts` exports Prisma client singleton
  - [ ] `src/server/context.ts` exports `createTRPCContext`
  - [ ] `src/server/trpc.ts` exports `router`, `publicProcedure`, `createCallerFactory`
  - [ ] `src/server/root.ts` exports `appRouter`
  - [ ] `src/app/api/trpc/[trpc]/route.ts` handles GET and POST
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: tRPC route handler responds to requests
    Tool: Bash (curl)
    Preconditions: Tasks 1-6 completed, `npm run dev` running
    Steps:
      1. npm run dev & (background)
      2. sleep 5
      3. curl -s http://localhost:3000/api/trpc/categories.list?input=%7B%7D
    Expected Result: Returns JSON (may be error "No procedure" since routers aren't built yet, but should NOT be 404 or connection refused)
    Failure Indicators: 404 Not Found, connection refused, 500 internal server error with crash
    Evidence: .omo/evidence/task-6-trpc-route.txt
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: setup tRPC server with context and router skeleton`
  - Files: `src/server/`, `src/app/api/trpc/[trpc]/route.ts`

- [ ] 7. tRPC client provider + React Query wrapper

  **What to do**:
  - Create `src/trpc/client.ts` — tRPC client configuration:
    - Import `createTRPCReact` from `@trpc/react-query`
    - Export typed `trpc` (or `api`) object
  - Create `src/trpc/react.tsx` — tRPC React provider component:
    - `TRPCProvider` that wraps children with `trpc.Provider` + `QueryClientProvider` from `@tanstack/react-query`
    - Configure `QueryClient` with reasonable defaults (staleTime: 30s, refetchOnWindowFocus: false)
  - Create `src/trpc/server.ts` — server-side caller for RSC:
    - `createCaller` using `createCallerFactory` and `createTRPCContext`

  **Must NOT do**:
  - Do not create the tRPC router procedures — only client-side setup
  - Do not use `any` for the router type

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard tRPC client boilerplate — well-documented pattern, few files, mechanical.

  **Parallelization**:
  - **Can Run In Parallel**: YES (blocks nothing in Wave 2; waits for Wave 3 usage)
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 8)
  - **Blocks**: Tasks 15, 16, 17, 18 (all pages use tRPC client)
  - **Blocked By**: Tasks 2, 6

  **References**:
  - `stasis-agent-prompt.md:61-62` — tRPC client provider wrapping the app
  - tRPC official docs: `https://trpc.io/docs/client/react/setup` — React Query integration

  **Acceptance Criteria**:
  - [ ] `src/trpc/client.ts` exports typed `trpc` object
  - [ ] `src/trpc/react.tsx` exports `TRPCProvider` component
  - [ ] `src/trpc/server.ts` exports `createCaller` function
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: TRPCProvider compiles and exports correctly
    Tool: Bash
    Preconditions: Tasks 1-7 completed
    Steps:
      1. npx tsc --noEmit
      2. grep "export.*TRPCProvider" src/trpc/react.tsx
      3. grep "export.*trpc" src/trpc/client.ts
    Expected Result: TypeScript compiles. Both exports found.
    Failure Indicators: Compilation errors, missing exports
    Evidence: .omo/evidence/task-7-trpc-client.txt
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: setup tRPC client provider and React Query`
  - Files: `src/trpc/`

- [ ] 8. Root layout with metadata, font loading, and PWA manifest placeholder

  **What to do**:
  - Create `app/layout.tsx`:
    - Import Inter font from `next/font/google`
    - Wrap body with `ThemeProvider` (from Task 3) and `TRPCProvider` (from Task 7)
    - Add metadata: title "Stasis", description "Personal Finance Manager"
    - Add viewport meta tag for mobile-first responsive
    - Include `manifest.json` link (pointing to a placeholder manifest)
  - Create `public/manifest.json` — PWA manifest placeholder:
    ```json
    { "name": "Stasis", "short_name": "Stasis", "start_url": "/", "display": "standalone" }
    ```
    (Full PWA config with icons deferred to Sprint 4)
  - Set html class to support next-themes (`suppressHydrationWarning`)
  - Apply Inter font to body

  **Must NOT do**:
  - Do not configure full PWA manifest with icons (Sprint 4)
  - Do not add service worker registration
  - Do not add complex metadata — keep it minimal

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout, font, theme integration — visual foundation of the app.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 5, 6, 7 — all run after Wave 1)
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: Tasks 13, 14, 15, 16, 17, 18
  - **Blocked By**: Tasks 2, 3 (needs theme provider and tailwind)

  **References**:
  - `stasis-master-spec.md:307-308` — PWA manifest specification
  - `stasis-agent-prompt.md:40-48` — Step 3: Layout + Navigation
  - `stasis-agent-prompt.md:173` — Inter font, mobile-first

  **Acceptance Criteria**:
  - [ ] `app/layout.tsx` exists with Inter font, ThemeProvider, TRPCProvider
  - [ ] `public/manifest.json` exists
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm run dev` starts and serves on localhost:3000

  **QA Scenarios**:

  ```
  Scenario: App layout renders with providers
    Tool: Playwright
    Preconditions: Tasks 1-8 completed, `npm run dev` running
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for page load (networkidle)
      3. Assert page title contains "Stasis"
      4. Assert <html> element has class (next-themes adds it)
      5. Take screenshot
    Expected Result: Page loads without errors. Title is "Stasis". No console errors.
    Failure Indicators: White screen, hydration error, font not loading, 500 error
    Evidence: .omo/evidence/task-8-layout.png (screenshot)
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: add root layout with metadata, font, and theme provider`
  - Files: `app/layout.tsx`, `public/manifest.json`

- [ ] 9. categories tRPC router

  **What to do**:
  - Create `src/server/routers/categories.ts`:
    - `categories.list` — public procedure returning all categories ordered by type then name
    - `categories.add` — procedure with zod input: `{ name: string, type: z.enum(['INCOME','EXPENSE']), color: string }`
    - Input validation: name min 1 char, color must be hex (#XXXXXX)
  - Register in `src/server/root.ts`

  **Must NOT do**:
  - Do not implement category edit/delete in Sprint 1 (edit is Sprint 4 — Settings)
  - Do not add icon field to the add input (icon support deferred)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple CRUD router — 2 procedures, straightforward Prisma queries.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10, 11, 13, 14 — all independent routers/nav)
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12, 13, 14)
  - **Blocks**: Task 12 (dashboard router needs categories)
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `stasis-master-spec.md:221-222` — categories.list, categories.add
  - `stasis-master-spec.md:160-161` — categories table schema
  - `stasis-master-spec.md:163` — Seed categories with colors

  **Acceptance Criteria**:
  - [ ] `categories.list` returns all 10 seeded categories
  - [ ] `categories.add` creates a new category and returns it
  - [ ] Invalid color (non-hex) returns zod validation error
  - [ ] Empty name returns zod validation error

  **QA Scenarios**:

  ```
  Scenario: list returns all seeded categories
    Tool: Bash (curl)
    Preconditions: Tasks 1-9 completed, `npm run dev` running
    Steps:
      1. curl -s "http://localhost:3000/api/trpc/categories.list?input=%7B%7D"
    Expected Result: JSON array with 10 items. First item has name "Salary", type "INCOME". All items have id, name, type, color fields.
    Failure Indicators: Empty array, 404, 500 error, wrong count
    Evidence: .omo/evidence/task-9-list.json

  Scenario: add validates hex color
    Tool: Bash (curl)
    Preconditions: categories.list working
    Steps:
      1. curl -s -X POST http://localhost:3000/api/trpc/categories.add -H "Content-Type: application/json" -d '{"name":"Test Category","type":"EXPENSE","color":"not-a-color"}'
    Expected Result: JSON error response with zod validation message. NOT a 200 success.
    Failure Indicators: 200 OK (accepts invalid color), server crash
    Evidence: .omo/evidence/task-9-validation.txt

  Scenario: add creates and returns new category
    Tool: Bash (curl)
    Preconditions: categories.list returns 10
    Steps:
      1. curl -s -X POST http://localhost:3000/api/trpc/categories.add -H "Content-Type: application/json" -d '{"name":"Test","type":"EXPENSE","color":"#FF0000"}'
      2. curl -s "http://localhost:3000/api/trpc/categories.list?input=%7B%7D"
    Expected Result: Step 1 returns new category object. Step 2 returns 11 items (one new).
    Failure Indicators: Step 1 fails, step 2 still shows 10
    Evidence: .omo/evidence/task-9-add.json
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: add categories tRPC router`
  - Files: `src/server/routers/categories.ts`, `src/server/root.ts`

- [ ] 10. income tRPC router

  **What to do**:
  - Create `src/server/routers/income.ts`:
    - `income.list` — public procedure, returns all income entries for a given month (YYYY-MM). Default to `getCurrentMonth()` if no input.
    - `income.add` — zod input: `{ source: string, categoryId: string, amount: z.number().int().positive(), month: string }`. Default month to current.
    - Validate categoryId exists and is type INCOME
  - Register in `src/server/root.ts`

  **Must NOT do**:
  - Do not allow negative or zero amounts (`.int().positive()`)
  - Do not accept non-INCOME categories for income entries

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 2 procedures, standard CRUD, Prisma queries.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9, 11, 12, 13, 14)
  - **Parallel Group**: Wave 3 (with Tasks 9, 11, 12, 13, 14)
  - **Blocks**: Tasks 12, 15, 16 (dashboard shows income)
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `stasis-master-spec.md:166-167` — income_entries schema
  - `stasis-master-spec.md:213-214` — income.add, income.list
  - `stasis-master-spec.md:199` — All amounts INTEGER

  **Acceptance Criteria**:
  - [ ] `income.list` for current month returns seeded income entry
  - [ ] `income.add` creates entry and returns it
  - [ ] Negative amount returns zod validation error
  - [ ] Non-existent categoryId returns error
  - [ ] Amount stored as INTEGER (verify in response)

  **QA Scenarios**:

  ```
  Scenario: list returns current month income
    Tool: Bash (curl)
    Preconditions: Seed data loaded
    Steps:
      1. curl -s "http://localhost:3000/api/trpc/income.list?input=%7B%7D"
    Expected Result: JSON array. At least 1 item. Each item has id, source, amount (integer), month, categoryId.
    Failure Indicators: Empty array, amount as float/decimal, wrong month
    Evidence: .omo/evidence/task-10-list.json

  Scenario: add rejects negative amount
    Tool: Bash (curl)
    Preconditions: income.list working
    Steps:
      1. curl -s -X POST http://localhost:3000/api/trpc/income.add -H "Content-Type: application/json" -d '{"source":"Test","categoryId":"<valid-category-id>","amount":-1000}'
    Expected Result: JSON error response (zod validation). HTTP status NOT 200.
    Failure Indicators: 200 OK (accepts negative), server crash
    Evidence: .omo/evidence/task-10-negative.txt

  Scenario: add creates valid income entry
    Tool: Bash (curl)
    Preconditions: Valid INCOME category exists (Salary from seed)
    Steps:
      1. curl -s -X POST http://localhost:3000/api/trpc/income.add -H "Content-Type: application/json" -d '{"source":"Freelance Project","categoryId":"<freelance-id>","amount":3000000}'
    Expected Result: JSON object with id, source="Freelance Project", amount=3000000, month=current YYYY-MM
    Failure Indicators: Error response, amount not integer, wrong month
    Evidence: .omo/evidence/task-10-add.json
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: add income tRPC router`
  - Files: `src/server/routers/income.ts`, `src/server/root.ts`

- [ ] 11. budget tRPC router

  **What to do**:
  - Create `src/server/routers/budget.ts`:
    - `budget.getAll` — public procedure, returns all EXPENSE-type categories with their budget allocation for a given month (default current). Join: categories LEFT JOIN budget_allocations. Returns: `[{ category, allocated: number | null }]`
    - `budget.set` — zod input: `{ categoryId: string, month: string, allocatedAmount: z.number().int().nonnegative() }`. Upsert: if allocation exists for (categoryId, month), update; otherwise create.
    - Validate categoryId exists and is type EXPENSE
    - Validate allocatedAmount is non-negative integer
  - Register in `src/server/root.ts`

  **Must NOT do**:
  - Do not allow allocation to INCOME-type categories
  - Do not allow negative allocations
  - Do not return allocations for categories with type INCOME in `getAll`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Upsert logic + category join — slightly more complex than basic CRUD but well-defined.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9, 10, 12, 13, 14)
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 12, 13, 14)
  - **Blocks**: Tasks 12, 17, 18 (budget screen)
  - **Blocked By**: Tasks 5, 6

  **References**:
  - `stasis-master-spec.md:168-169` — budget_allocations schema
  - `stasis-master-spec.md:210-211` — budget.getAll, budget.set
  - `stasis-agent-prompt.md:53` — budget router: getAll, set

  **Acceptance Criteria**:
  - [ ] `budget.getAll` returns all EXPENSE categories with allocation amounts
  - [ ] `budget.set` creates new allocation and returns it
  - [ ] `budget.set` updates existing allocation (same categoryId + month)
  - [ ] Setting allocation on INCOME category returns error
  - [ ] Negative allocation returns zod validation error
  - [ ] Allocation amount is INTEGER

  **QA Scenarios**:

  ```
  Scenario: getAll returns expense categories with allocations
    Tool: Bash (curl)
    Preconditions: Seed data loaded (1 budget allocation)
    Steps:
      1. curl -s "http://localhost:3000/api/trpc/budget.getAll?input=%7B%7D"
    Expected Result: JSON array. 8 categories (all EXPENSE type). Housing has allocated=5000000. Others have allocated=0 or null.
    Failure Indicators: INCOME categories in results, wrong counts, missing allocation
    Evidence: .omo/evidence/task-11-getall.json

  Scenario: set creates and updates allocation
    Tool: Bash (curl)
    Preconditions: budget.getAll working
    Steps:
      1. curl -s -X POST http://localhost:3000/api/trpc/budget.set -H "Content-Type: application/json" -d '{"categoryId":"<food-category-id>","month":"2026-06","allocatedAmount":2000000}'
      2. curl -s "http://localhost:3000/api/trpc/budget.getAll?input=%7B%7D"
    Expected Result: Step 1 returns allocation with amount=2000000. Step 2 shows Food & Dining with allocated=2000000.
    Failure Indicators: Error response, allocation not reflected in getAll
    Evidence: .omo/evidence/task-11-set.json

  Scenario: set rejects negative amount
    Tool: Bash (curl)
    Preconditions: budget.set working
    Steps:
      1. curl -s -X POST http://localhost:3000/api/trpc/budget.set -H "Content-Type: application/json" -d '{"categoryId":"<food-category-id>","month":"2026-06","allocatedAmount":-500}'
    Expected Result: JSON error response (zod validation). NOT 200.
    Failure Indicators: 200 OK
    Evidence: .omo/evidence/task-11-negative.txt
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: add budget tRPC router`
  - Files: `src/server/routers/budget.ts`, `src/server/root.ts`

- [ ] 12. dashboard tRPC router

  **What to do**:
  - Create `src/server/routers/dashboard.ts`:
    - `dashboard.getSummary` — public procedure for a given month (default current). Aggregates:
      - `income`: sum of all income_entries.amount for the month
      - `committed`: 0 in Sprint 1 (no subscriptions/bills/debts data). Calculate as sum of budget_allocations.allocatedAmount for the month (represents planned commitments)
      - `free`: income - committed (handle negative: floor at 0)
      - `committedPercent`: committed / income × 100 (handle divide-by-zero: return null or 0)
      - `upcomingDues`: [] (empty in Sprint 1 — subscriptions/bills not yet implemented)
      - `debts`: [] (empty in Sprint 1 — debts not yet implemented)
  - Register in `src/server/root.ts`

  **Must NOT do**:
  - Do not query subscriptions, bills, or debts tables — they have no data yet
  - Do not hardcode any values — calculate from actual database state
  - Do not return NaN or Infinity for committedPercent when income is 0

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Aggregation logic across multiple tables, edge case handling (divide-by-zero, negative free cash). Business logic with financial implications.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13, 14 — but depends on routers 9, 10, 11 completing first)
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11, 13, 14 — note: depends on 9, 10, 11 completing)
  - **Blocks**: Tasks 15, 16 (dashboard page)
  - **Blocked By**: Tasks 9, 10, 11

  **References**:
  - `stasis-master-spec.md:209` — dashboard.getSummary return shape
  - `stasis-master-spec.md:274-301` — Dashboard wireframe showing data model
  - Metis finding: committed in Sprint 1 = sum of budget allocations (not subs+bills+debts since those don't exist yet)

  **Acceptance Criteria**:
  - [ ] `dashboard.getSummary` returns `{ income, committed, free, committedPercent, upcomingDues, debts }`
  - [ ] Income matches sum of income entries for current month
  - [ ] Committed matches sum of budget allocations for current month
  - [ ] Free = max(0, income - committed)
  - [ ] When income is 0, committedPercent is null or 0 (not NaN/Infinity)
  - [ ] upcomingDues is an empty array
  - [ ] debts is an empty array
  - [ ] All monetary values are INTEGER

  **QA Scenarios**:

  ```
  Scenario: getSummary returns correct values with seed data
    Tool: Bash (curl)
    Preconditions: Seed data loaded (1 income 15M, 1 budget allocation 5M Housing)
    Steps:
      1. curl -s "http://localhost:3000/api/trpc/dashboard.getSummary?input=%7B%7D"
    Expected Result: JSON: { income: 15000000, committed: 5000000, free: 10000000, committedPercent: 33, upcomingDues: [], debts: [] }
    Failure Indicators: Wrong values, missing fields, committedPercent is NaN, upcomingDues/debts non-empty
    Evidence: .omo/evidence/task-12-summary.json

  Scenario: getSummary handles zero income gracefully
    Tool: Bash (curl)
    Preconditions: Delete all income entries for current month (or test with empty month)
    Steps:
      1. curl -s "http://localhost:3000/api/trpc/dashboard.getSummary?input=%7B%22month%22%3A%222026-01%22%7D"
    Expected Result: JSON: { income: 0, committed: 0, free: 0, committedPercent: null or 0, upcomingDues: [], debts: [] }
    Failure Indicators: NaN, Infinity, TypeError, 500 error
    Evidence: .omo/evidence/task-12-zero-income.json
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: add dashboard tRPC router with getSummary`
  - Files: `src/server/routers/dashboard.ts`, `src/server/root.ts`

- [ ] 13. Bottom tab bar navigation component

  **What to do**:
  - Create `components/tab-bar.tsx`:
    - Fixed position at bottom of viewport (`fixed bottom-0 inset-x-0`)
    - 5 tabs: Dashboard (🏠), Budget (💰), Trackers (📋), AI Chat (🤖), Settings (⚙️)
    - Use `next/link` for navigation
    - Active tab detection via `usePathname()` from `next/navigation`
    - Active tab: primary background + white text. Inactive: transparent + secondary text
    - Minimum 44px touch target height
    - Mobile-first: full width, max-width constraint on desktop
  - Use shadcn/ui styling conventions (Tailwind classes, not raw CSS)
  - Import into root layout

  **Must NOT do**:
  - Do not build sub-tab content for Trackers (that's Sprint 2)
  - Do not add animation beyond CSS transitions
  - Do not use icons that aren't in the spec
  - Do not build a sidebar variant yet (mobile-first)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with navigation, active states, responsive layout — visual design work.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9, 10, 11, 12, 14)
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11, 12, 14)
  - **Blocks**: Tasks 15, 16, 17, 18 (all screens)
  - **Blocked By**: Tasks 3, 8

  **References**:
  - `stasis-master-spec.md:264` — Screen map: 5 screens, bottom tab bar
  - `stasis-master-spec.md:299` — Wireframe tab bar icons
  - `stasis-agent-prompt.md:42-48` — Bottom tab bar spec
  - `stasis-agent-prompt.md:175-176` — Touch targets min 44px, mobile-first

  **Acceptance Criteria**:
  - [ ] Tab bar visible on all 5 pages
  - [ ] Active tab has different styling (background/border)
  - [ ] Each tab link navigates to correct route
  - [ ] Touch targets ≥ 44px height (verify via devtools or Playwright)
  - [ ] Responsive at 375px viewport width

  **QA Scenarios**:

  ```
  Scenario: Tab bar renders and navigates correctly
    Tool: Playwright
    Preconditions: Tasks 1-13 completed, `npm run dev` running
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert tab bar is visible (selector: nav or bottom bar container)
      3. Assert Dashboard tab has active styling
      4. Click "Budget" tab (text "💰" or "Budget")
      5. Assert URL contains "/budget"
      6. Assert Budget tab now has active styling, Dashboard does not
      7. Take screenshot
    Expected Result: Navigation works. Active tab highlights correctly. No console errors.
    Failure Indicators: Tab bar not visible, navigation doesn't work, no active state change
    Evidence: .omo/evidence/task-13-tab-bar.png (screenshot)
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: add bottom tab bar navigation component`
  - Files: `components/tab-bar.tsx`, `app/layout.tsx`

- [ ] 14. Placeholder pages for Trackers, Chat, and Settings

  **What to do**:
  - Create `app/trackers/page.tsx` — centered "Trackers — Coming in Sprint 2" message
  - Create `app/chat/page.tsx` — centered "AI Chat — Coming in Sprint 3" message
  - Create `app/settings/page.tsx` — centered "Settings — Coming in Sprint 4" message
  - Each page uses the same layout card pattern (shadcn/ui Card component)
  - Each page imports and displays the tab bar (via layout, not inline)

  **Must NOT do**:
  - Do not build any functional UI for these pages
  - Do not add fake/mock data or interactive elements
  - Do not build the Trackers sub-tabs

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 3 nearly identical placeholder pages — mechanical, simple.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9, 10, 11, 12, 13)
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11, 12, 13)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 8

  **References**:
  - `stasis-master-spec.md:262-272` — Screen map and navigation
  - Metis guardrail: Trackers/Chat/Settings are Sprint 2/3/4 — placeholder only

  **Acceptance Criteria**:
  - [ ] `/trackers` loads with placeholder message
  - [ ] `/chat` loads with placeholder message
  - [ ] `/settings` loads with placeholder message
  - [ ] All 3 pages show tab bar
  - [ ] No TypeScript errors

  **QA Scenarios**:

  ```
  Scenario: Placeholder pages load correctly
    Tool: Playwright
    Preconditions: Tasks 1-14 completed, `npm run dev` running
    Steps:
      1. Navigate to http://localhost:3000/trackers
      2. Assert page contains "Trackers" or "Coming in Sprint 2"
      3. Navigate to http://localhost:3000/chat
      4. Assert page contains "AI Chat" or "Coming in Sprint 3"
      5. Navigate to http://localhost:3000/settings
      6. Assert page contains "Settings" or "Coming in Sprint 4"
      7. Assert tab bar visible on all 3 pages
    Expected Result: All pages load. Tab bar persists. No errors.
    Failure Indicators: 404, blank page, missing tab bar, error messages
    Evidence: .omo/evidence/task-14-placeholders.png (screenshots)
  ```

  **Commit**: YES (groups with itself)
  - Message: `feat: add placeholder pages for Trackers, Chat, and Settings`
  - Files: `app/trackers/page.tsx`, `app/chat/page.tsx`, `app/settings/page.tsx`

- [ ] 15. Dashboard — income, committed, and free cash cards

  **What to do**:
  - Create/replace `app/page.tsx` (home page = Dashboard):
    - Fetch data via `trpc.dashboard.getSummary.useQuery()`
    - **Income card**: Displays "Rp X.XXX.XXX" with total income. Uses `formatIDR()` utility. Green (#22C55E) accent left border.
    - **Committed card**: Displays committed amount + percentage bar. Progress bar (shadcn/ui Progress component) showing committedPercent% filled. Slate accent.
    - **Free cash card**: Displays free cash amount. Green if positive, coral (#EF4444) if zero/negative.
    - Handle loading state: show skeleton/spinner while data loads
    - Handle empty state: show "No income entered yet" if income = 0
    - Handle edge case: committedPercent = "--" when income is 0
  - Use shadcn/ui Card components for each card
  - Apply design system tokens (border-radius 16px, Inter font, correct colors)

  **Must NOT do**:
  - Do not build the upcoming dues or debt progress sections (Task 16)
  - Do not build the floating AI button (Task 16)
  - Do not hardcode values — all from tRPC query
  - Do not use any animation library

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with data display, loading/empty states, progress bars — visual design + data integration.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 16, 17 — all independent pages)
  - **Parallel Group**: Wave 4 (with Tasks 16, 17, 18)
  - **Blocks**: None
  - **Blocked By**: Tasks 7, 10, 12, 13

  **References**:
  - `stasis-master-spec.md:274-301` — Dashboard wireframe with exact layout
  - `stasis-master-spec.md:275-287` — Income, Committed, Free cash card layout
  - `stasis-agent-prompt.md:65-75` — Step 5: Dashboard Screen
  - `src/utils/format.ts` — formatIDR utility

  **Acceptance Criteria**:
  - [ ] Dashboard loads at `/` route
  - [ ] Income card shows formatted amount (e.g., "Rp 15.000.000")
  - [ ] Committed card shows amount + progress bar
  - [ ] Free cash card shows correct value
  - [ ] Loading state appears before data loads
  - [ ] Empty state shows when income = 0
  - [ ] No console errors during render

  **QA Scenarios**:

  ```
  Scenario: Dashboard renders with seed data
    Tool: Playwright
    Preconditions: Seed data loaded (income 15M, allocation 5M Housing)
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for networkidle (tRPC queries complete)
      3. Assert page contains "Rp 15.000.000" (income)
      4. Assert page contains "Rp 5.000.000" (committed)
      5. Assert page contains "Rp 10.000.000" (free cash)
      6. Assert progress bar element exists and has non-zero width
      7. Take screenshot
    Expected Result: All three cards display correct data. No errors.
    Failure Indicators: Missing cards, wrong amounts, "Rp 0", progress bar missing
    Evidence: .omo/evidence/task-15-dashboard.png

  Scenario: Dashboard handles loading state
    Tool: Playwright
    Preconditions: Reload page with network throttling
    Steps:
      1. Navigate to http://localhost:3000
      2. Immediately check for skeleton/spinner/loading indicator
    Expected Result: Loading indicator visible briefly before data renders
    Evidence: .omo/evidence/task-15-loading.png
  ```

  **Commit**: YES (groups with Tasks 15 + 16 together)
  - Message: `feat: add Dashboard with income, committed, and free cash cards`
  - Files: `app/page.tsx`

- [ ] 16. Dashboard — upcoming dues, debt progress, and floating AI button

  **What to do**:
  - Extend `app/page.tsx` (or create sub-components):
    - **Upcoming dues section**: Section header "⚠️ Upcoming". Since Sprint 1 has no tracker data, show empty state: "No upcoming dues. Add subscriptions and bills in Trackers."
    - **Debt progress section**: Section header "📉 Debts". Empty state: "No active debts. Add debts in Trackers."
    - **Floating AI button**: Positioned bottom-right (above tab bar). Rounded, primary color, 🤖 icon. Links to `/chat`. In Sprint 1, clicking navigates to the placeholder Chat page.
    - Cards use same styling as Task 15 cards
  - Handle edge case: if dashboard has no data, show informative empty states (not blank sections)

  **Must NOT do**:
  - Do not mock/hardcode subscription, bill, or debt data
  - Do not build AI chat interaction (just a navigation button)
  - Do not build notification/reminder logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI sections with empty states, floating action button — visual design work.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 15, 17 — all independent pages)
  - **Parallel Group**: Wave 4 (with Tasks 15, 17, 18)
  - **Blocks**: None
  - **Blocked By**: Tasks 7, 12, 13

  **References**:
  - `stasis-master-spec.md:289-296` — Wireframe: Upcoming dues and Debt progress sections
  - `stasis-master-spec.md:297` — Floating AI button wireframe
  - `stasis-agent-prompt.md:74` — "Floating 'Ask AI' button at bottom right"
  - Metis finding: Dashboard committed = budget allocations in Sprint 1; upcoming dues and debts show empty state

  **Acceptance Criteria**:
  - [ ] Upcoming dues section visible with empty state message
  - [ ] Debt progress section visible with empty state message
  - [ ] Floating AI button visible, positioned correctly (bottom-right, above tab bar)
  - [ ] AI button navigates to `/chat` on click
  - [ ] No hardcoded subscription/debt data

  **QA Scenarios**:

  ```
  Scenario: Dashboard empty states are informative
    Tool: Playwright
    Preconditions: Dashboard page loaded
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to upcoming dues section
      3. Assert section contains text (not completely blank)
      4. Scroll to debt progress section
      5. Assert section contains text
    Expected Result: Both sections show informative empty state messages (not blank, not error).
    Failure Indicators: Blank sections, error messages, "undefined"
    Evidence: .omo/evidence/task-16-empty-states.png

  Scenario: Floating AI button navigates to Chat
    Tool: Playwright
    Preconditions: Dashboard page loaded
    Steps:
      1. Navigate to http://localhost:3000
      2. Click floating AI button (🤖 icon or "Ask AI" text)
      3. Assert URL is "http://localhost:3000/chat"
    Expected Result: Navigation to /chat succeeds. Chat placeholder page loads.
    Failure Indicators: Button not clickable, wrong URL, 404
    Evidence: .omo/evidence/task-16-ai-button.png
  ```

  **Commit**: YES (groups with Task 15)
  - Message: `feat: add Dashboard upcoming dues, debt progress, and AI button`
  - Files: `app/page.tsx`

- [ ] 17. Budget — category list with allocation bars and income summary

  **What to do**:
  - Create/replace `app/budget/page.tsx`:
    - **Income summary at top**: Fetch `trpc.income.list.useQuery()` + `trpc.dashboard.getSummary.useQuery()`. Display "Income: Rp X.XXX.XXX" for the current month
    - **Category list**: Fetch `trpc.budget.getAll.useQuery()`. For each EXPENSE category:
      - Category name + color dot (category.color)
      - Allocated amount (formatted with `formatIDR`)
      - Visual bar: shadcn/ui Progress component. Width = (allocated / income) × 100%. Clamp to 100%.
      - If no allocation: bar at 0%, show "Rp 0"
    - Handle loading state: spinner/skeleton
    - Handle empty state: "No categories available" if list is empty
    - Handle edge case: income = 0 → all bars at 0%, show "Enter income first"

  **Must NOT do**:
  - Do not build inline edit functionality (Task 18)
  - Do not build the allocation warning banner (Task 18)
  - Do not show INCOME-type categories in the allocation list
  - Do not allow bars to exceed 100% visually

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Data visualization with bars, income summary, category list — visual + data integration.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 15, 16, 18 — but depends on 17 for inline edit)
  - **Parallel Group**: Wave 4 (with Tasks 15, 16, 18)
  - **Blocks**: Task 18 (inline edit extends this page)
  - **Blocked By**: Tasks 7, 11, 13

  **References**:
  - `stasis-master-spec.md:281-285` — Budget screen wireframe
  - `stasis-agent-prompt.md:77-83` — Step 6: Budget Screen
  - `src/utils/format.ts` — formatIDR utility

  **Acceptance Criteria**:
  - [ ] Budget page loads at `/budget`
  - [ ] Income summary at top shows current month income
  - [ ] All 8 EXPENSE categories listed with colored dots
  - [ ] Each category shows allocation amount and visual bar
  - [ ] Housing shows allocated=5.000.000 with bar at ~33% (of 15M income)
  - [ ] Categories with no allocation show "Rp 0" and bar at 0%
  - [ ] No INCOME categories (Salary, Freelance) in the allocation list

  **QA Scenarios**:

  ```
  Scenario: Budget page renders with seed data
    Tool: Playwright
    Preconditions: Seed data loaded (income 15M, 1 allocation 5M Housing)
    Steps:
      1. Navigate to http://localhost:3000/budget
      2. Wait for networkidle
      3. Assert page contains "Rp 15.000.000" (income summary)
      4. Assert page contains "Housing" category
      5. Assert page contains "Rp 5.000.000" for Housing allocation
      6. Assert Housing progress bar has non-zero width (approx 33%)
      7. Assert other categories show "Rp 0"
      8. Take screenshot
    Expected Result: All 8 expense categories visible with correct data.
    Failure Indicators: Missing categories, wrong amounts, INCOME categories in list, bar widths wrong
    Evidence: .omo/evidence/task-17-budget.png
  ```

  **Commit**: YES (groups with Tasks 17 + 18 together)
  - Message: `feat: add Budget page with category list and allocation bars`
  - Files: `app/budget/page.tsx`

- [ ] 18. Budget — inline edit and allocation warning

  **What to do**:
  - Extend `app/budget/page.tsx`:
    - **Inline edit**: Clicking/tapping a category's allocated amount switches it to an input field (shadcn/ui Input component). On blur or Enter: call `trpc.budget.set.useMutation()` to save. On success: refetch list.
    - Input validation: only allow digits (integer). Prevent negative values.
    - **Allocation warning banner**: At top of category list. Calculate `totalAllocated = sum of all allocations`. If `totalAllocated > income`, show warning: "⚠️ Your allocations (Rp X) exceed your income (Rp Y) by Rp Z". Use coral/danger styling. If `totalAllocated <= income`, show success: "✅ Rp X remaining" in mint/success styling.
    - **Update on mutation**: Warning banner recalculates after inline edit saves.
  - Handle optimistic updates via React Query cache invalidation
  - Handle error state: show toast or inline error if mutation fails

  **Must NOT do**:
  - Do not allow editing income from this screen (income editing = income.add on AI or separate flow)
  - Do not allow editing category name/color (Sprint 4 — Settings)
  - Do not add drag-to-reorder or fancy animations

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Inline edit with optimistic updates, mutation handling, real-time warning recalculation — involves state management and user interaction logic.

  **Parallelization**:
  - **Can Run In Parallel**: Depends on Task 17 (same file)
  - **Parallel Group**: Wave 4 — runs after Task 17
  - **Blocks**: None
  - **Blocked By**: Tasks 7, 11, 13, 17 (extends the budget page from Task 17)

  **References**:
  - `stasis-master-spec.md:119` — AC: "Warning if allocation exceeds income"
  - `stasis-agent-prompt.md:80-81` — "Warning banner if total allocation exceeds total income", "Inline edit for each category's allocation"
  - tRPC docs: `useMutation` with `onSuccess` cache invalidation

  **Acceptance Criteria**:
  - [ ] Clicking allocated amount switches to input field
  - [ ] Enter/blur saves allocation via tRPC mutation
  - [ ] Saved allocation persists on page reload
  - [ ] Warning banner appears when total allocation > income
  - [ ] Success banner appears when total allocation ≤ income
  - [ ] Banner updates immediately after inline edit saves
  - [ ] Negative values rejected in input

  **QA Scenarios**:

  ```
  Scenario: Inline edit saves and persists
    Tool: Playwright
    Preconditions: Budget page loaded with seed data (5M Housing, 15M income)
    Steps:
      1. Navigate to http://localhost:3000/budget
      2. Click Housing allocated amount ("Rp 5.000.000")
      3. Assert input field appears with "5000000"
      4. Clear and type "3000000"
      5. Press Enter
      6. Assert amount changes to "Rp 3.000.000"
      7. Reload page
      8. Assert Housing still shows "Rp 3.000.000"
    Expected Result: Edit saves and persists across reload.
    Failure Indicators: Input doesn't appear, save fails, value reverts on reload
    Evidence: .omo/evidence/task-18-inline-edit.png

  Scenario: Allocation warning appears when exceeding income
    Tool: Playwright
    Preconditions: Budget page loaded, income = 15M
    Steps:
      1. Navigate to http://localhost:3000/budget
      2. Edit multiple categories to sum > 15M (e.g., Housing=8M, Food=5M, Transport=3M)
      3. Assert warning banner appears with coral/danger styling
      4. Assert banner text mentions exceeding income
    Expected Result: Warning visible with correct amount exceeded.
    Failure Indicators: No warning, wrong styling, banner doesn't update after edit
    Evidence: .omo/evidence/task-18-warning.png
  ```

  **Commit**: YES (groups with Task 17)
  - Message: `feat: add Budget inline edit and allocation warning`
  - Files: `app/budget/page.tsx`

- [ ] 19. Vitest tests for utility functions

  **What to do**:
  - Create `src/utils/format.test.ts`:
    - Test `formatIDR(0)` → `"Rp 0"`
    - Test `formatIDR(15000000)` → `"Rp 15.000.000"`
    - Test `formatIDR(1000)` → `"Rp 1.000"`
    - Test `formatIDR(999)` → `"Rp 999"`
    - Test `formatIDR(1000000000)` → `"Rp 1.000.000.000"`
    - Test negative: `formatIDR(-5000)` → should throw or handle gracefully
  - Create `src/utils/dates.test.ts`:
    - Test `getCurrentMonth()` returns YYYY-MM format matching regex `/^\d{4}-\d{2}$/`
    - Test `getCurrentMonth()` equals actual current month (dynamic assertion)

  **Must NOT do**:
  - Do not test implementation details — test outputs only
  - Do not create tests for functions that don't exist yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure function unit tests — simple, mechanical, well-scoped.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 20, 21 — all independent test files)
  - **Parallel Group**: Wave 5 (with Tasks 20, 21)
  - **Blocks**: None
  - **Blocked By**: Task 4 (utility functions)

  **References**:
  - `src/utils/format.ts` — formatIDR implementation
  - `src/utils/dates.ts` — getCurrentMonth implementation
  - Vitest docs: `https://vitest.dev/api/` — test, expect, describe

  **Acceptance Criteria**:
  - [ ] `npx vitest run src/utils/format.test.ts` passes all tests
  - [ ] `npx vitest run src/utils/dates.test.ts` passes all tests
  - [ ] formatIDR tests cover: zero, thousands, millions, billions, edge cases
  - [ ] getCurrentMonth tests cover: format match, dynamic current month

  **QA Scenarios**:

  ```
  Scenario: All utility tests pass
    Tool: Bash
    Preconditions: Tests written
    Steps:
      1. npx vitest run src/utils/ --reporter=verbose
    Expected Result: All tests pass. Zero failures. Zero errors. Clear output showing test names and pass status.
    Failure Indicators: Any test failure, timeout, import error
    Evidence: .omo/evidence/task-19-tests.txt (full vitest output)
  ```

  **Commit**: YES (groups with itself)
  - Message: `test: add Vitest tests for formatIDR and date utilities`
  - Files: `src/utils/format.test.ts`, `src/utils/dates.test.ts`
  - Pre-commit: `npx vitest run src/utils/`

- [ ] 20. Vitest integration tests for tRPC procedures

  **What to do**:
  - Create `src/server/routers/categories.test.ts`:
    - Test `categories.list` returns array with correct shape
    - Test `categories.add` creates category and it appears in list
    - Test `categories.add` rejects invalid color
    - Test `categories.add` rejects empty name
  - Create `src/server/routers/income.test.ts`:
    - Test `income.list` returns array
    - Test `income.add` creates entry
    - Test `income.add` rejects negative amount
    - Test `income.add` rejects non-INCOME category
  - Create `src/server/routers/budget.test.ts`:
    - Test `budget.getAll` returns expense categories
    - Test `budget.set` creates new allocation
    - Test `budget.set` updates existing allocation
    - Test `budget.set` rejects negative amount
    - Test `budget.set` rejects INCOME category
  - Create `src/server/routers/dashboard.test.ts`:
    - Test `dashboard.getSummary` returns correct shape
    - Test `dashboard.getSummary` handles zero income (no NaN)
    - Test `dashboard.getSummary` committedPercent is null/0 when income is 0
  - Use `createCaller` for testing (no HTTP server needed):
    ```ts
    const caller = appRouter.createCaller(await createTRPCContext());
    const result = await caller.categories.list();
    ```

  **Must NOT do**:
  - Do not start an HTTP server for tRPC tests — use `createCaller`
  - Do not test Prisma internals — test procedure behavior

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Integration tests for tRPC procedures — requires understanding of tRPC context, mocking DB state, testing business logic.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 19, 21 — all independent test files)
  - **Parallel Group**: Wave 5 (with Tasks 19, 21)
  - **Blocks**: None
  - **Blocked By**: Tasks 9, 10, 11, 12 (tRPC routers)

  **References**:
  - `src/server/routers/categories.ts`, `income.ts`, `budget.ts`, `dashboard.ts` — procedure implementations
  - `src/server/context.ts` — createTRPCContext for test setup
  - tRPC docs: `https://trpc.io/docs/server/server-side-calls` — createCaller pattern

  **Acceptance Criteria**:
  - [ ] `npx vitest run src/server/routers/` passes all tests
  - [ ] categories tests: 4 passing
  - [ ] income tests: 4 passing
  - [ ] budget tests: 5 passing
  - [ ] dashboard tests: 3 passing
  - [ ] No tests depend on running dev server

  **QA Scenarios**:

  ```
  Scenario: All tRPC integration tests pass
    Tool: Bash
    Preconditions: All routers implemented, tests written
    Steps:
      1. npx vitest run src/server/routers/ --reporter=verbose
    Expected Result: All tests pass. 16+ tests passing, 0 failures. Tests run without HTTP server.
    Failure Indicators: Any test failure, import error, Prisma connection error
    Evidence: .omo/evidence/task-20-trpc-tests.txt (full vitest output)
  ```

  **Commit**: YES (groups with itself)
  - Message: `test: add Vitest integration tests for tRPC procedures`
  - Files: `src/server/routers/categories.test.ts`, `src/server/routers/income.test.ts`, `src/server/routers/budget.test.ts`, `src/server/routers/dashboard.test.ts`
  - Pre-commit: `npx vitest run src/server/routers/`

- [ ] 21. Playwright smoke tests for Dashboard and Budget

  **What to do**:
  - Install Playwright: `npm install -D @playwright/test && npx playwright install chromium`
  - Create `e2e/smoke.spec.ts`:
    - Test: App loads at `/`
    - Test: Dashboard shows income card with amount
    - Test: Dashboard shows committed card with progress bar
    - Test: Dashboard shows free cash card
    - Test: Dashboard upcoming dues section exists
    - Test: Dashboard debt progress section exists
    - Test: Navigate to `/budget` via tab bar
    - Test: Budget shows income summary
    - Test: Budget shows category list with bars
    - Test: Budget inline edit works (click amount, change, save)
    - Test: Navigate to placeholder pages (`/trackers`, `/chat`, `/settings`)
    - Test: Theme toggle cycles light/dark
    - Test: No console errors on any page
  - Configure `playwright.config.ts`:
    - webServer: `npm run dev` on port 3000
    - timeout: 30s
    - screenshot on failure
  - Add `test:e2e` script to package.json: `"test:e2e": "playwright test"`

  **Must NOT do**:
  - Do not test features from Sprint 2-4
  - Do not hardcode seed data values that might change

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: End-to-end browser tests with Playwright — requires browser automation, selectors, assertions. Moderate complexity.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 19, 20)
  - **Parallel Group**: Wave 5 (with Tasks 19, 20)
  - **Blocks**: None
  - **Blocked By**: Tasks 15, 16, 17, 18 (all screens complete)

  **References**:
  - `app/page.tsx` — Dashboard implementation for selectors
  - `app/budget/page.tsx` — Budget implementation for inline edit selectors
  - Playwright docs: `https://playwright.dev/docs/writing-tests` — test structure

  **Acceptance Criteria**:
  - [ ] `npx playwright test` passes all tests
  - [ ] Dashboard tests: 6+ passing
  - [ ] Budget tests: 4+ passing
  - [ ] Navigation tests: 3+ passing
  - [ ] Screenshot captured for each test context

  **QA Scenarios**:

  ```
  Scenario: All Playwright smoke tests pass
    Tool: Bash
    Preconditions: App running, all screens built
    Steps:
      1. npx playwright test --reporter=list
    Expected Result: All tests pass. Zero failures. Screenshots saved (on failure or configured).
    Failure Indicators: Test timeout, element not found, assertion failure, console error
    Evidence: .omo/evidence/task-21-e2e.txt (test output), .omo/evidence/task-21-screenshots/ (Playwright traces)
  ```

  **Commit**: YES (groups with itself)
  - Message: `test: add Playwright smoke tests for Dashboard and Budget`
  - Files: `e2e/`, `playwright.config.ts`, `package.json`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback → fix → re-run → present again → wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .omo/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npx vitest run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Verify all monetary values are INTEGER. Verify no `ai`, `@ai-sdk/deepseek`, or `next-pwa` in package.json.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, zero income, rapid edits, negative amounts. Save to `.omo/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance per task. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `chore: scaffold Next.js 14 project with TypeScript` — all scaffolded files
- **2**: `chore: configure Tailwind, postcss, and dependencies` — package.json, config files
- **3**: `feat: add design system tokens and theme provider` — globals.css, theme-provider.tsx
- **4**: `chore: setup env, vitest, and utility functions` — .env, vitest.config.ts, utils/
- **5**: `feat: add Prisma schema, migration, and seed data` — prisma/
- **6**: `feat: setup tRPC server with context and router skeleton` — server/
- **7**: `feat: setup tRPC client provider and React Query` — app/providers.tsx
- **8**: `feat: add root layout with metadata and font loading` — app/layout.tsx
- **9**: `feat: add categories tRPC router` — server/routers/categories.ts
- **10**: `feat: add income tRPC router` — server/routers/income.ts
- **11**: `feat: add budget tRPC router` — server/routers/budget.ts
- **12**: `feat: add dashboard tRPC router` — server/routers/dashboard.ts
- **13**: `feat: add bottom tab bar navigation component` — components/tab-bar.tsx
- **14**: `feat: add placeholder pages for Trackers, Chat, Settings` — app/trackers/, app/chat/, app/settings/
- **15**: `feat: Dashboard income, committed, and free cash cards` — app/page.tsx
- **16**: `feat: Dashboard upcoming dues and debt progress sections` — app/page.tsx
- **17**: `feat: Budget category list with allocation bars` — app/budget/page.tsx
- **18**: `feat: Budget inline edit and allocation warning` — app/budget/page.tsx
- **19**: `test: add Vitest tests for utility functions` — utils/*.test.ts
- **20**: `test: add Vitest integration tests for tRPC procedures` — server/routers/*.test.ts
- **21**: `test: add Playwright smoke tests for Dashboard and Budget` — e2e/

---

## Success Criteria

### Verification Commands
```bash
npm run dev              # Expected: app starts on localhost:3000
npx tsc --noEmit         # Expected: zero errors
npx vitest run           # Expected: all tests pass, zero failures
npx prisma migrate status # Expected: all migrations applied
```

### Final Checklist
- [ ] All "Must Have" present (Dashboard + Budget functional, tRPC working, theme toggle)
- [ ] All "Must NOT Have" absent (no AI, no PWA, no Trackers, no Docker)
- [ ] All Vitest tests pass
- [ ] All Playwright smoke tests pass
- [ ] Agent QA evidence files exist in .omo/evidence/
- [ ] User confirms visual verification on localhost:3000
