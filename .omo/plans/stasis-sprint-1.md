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

- [x] 1. Scaffold Next.js 14 project with TypeScript + git init

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

- [x] 2. Install Sprint 1 dependencies + configure Tailwind and postcss

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

- [x] 3. Initialize shadcn/ui + design system tokens + theme provider

- [x] 4. Environment setup, data directory, Vitest config, utility functions

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

- [x] 5. Prisma schema definition, migration, and seed data

- [x] 6. tRPC server setup — context, procedure builder, app router skeleton

- [x] 7. tRPC client provider + React Query wrapper

- [x] 9. categories tRPC router

- [x] 10. income tRPC router

- [x] 11. budget tRPC router

- [x] 12. dashboard tRPC router

- [x] 13. Bottom tab bar navigation component

- [x] 14. Placeholder pages for Trackers, Chat, and Settings

- [x] 15. Dashboard — income + committed + free cash cards

- [x] 16. Dashboard — upcoming dues + debt progress + AI button

- [x] 17. Budget — category list with allocation bars and income summary

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

- [x] 18. Budget — inline edit and allocation warning

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

- [x] 19. Vitest tests for utility functions

- [x] 20. Vitest integration tests for tRPC procedures

- [x] 21. Playwright smoke tests for Dashboard and Budget

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

- [x] F1. **Plan Compliance Audit** — `oracle`
- [x] F2. **Code Quality Review** — `unspecified-high`
- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
- [x] F4. **Scope Fidelity Check** — `deep`
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
