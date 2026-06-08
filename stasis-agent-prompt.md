# Stasis — AI Coding Agent Prompt

You are building **Stasis**, a personal finance manager web app. Below is everything you need. Refer to the master specification document (`stasis-master-spec.md`) for full context. This prompt contains the build instructions.

---

## Tech Stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** components
- **Prisma** ORM + **SQLite**
- **tRPC** for API layer
- **Vercel AI SDK** + **Deepseek API** (`deepseek-chat` model)
- **next-pwa** for PWA support

---

## Build Order

### Step 1: Project Scaffold
1. Initialize Next.js 14 with App Router and TypeScript
2. Install dependencies: `prisma`, `@prisma/client`, `tailwindcss`, `shadcn/ui`, `@trpc/server`, `@trpc/client`, `@trpc/next`, `@trpc/react-query`, `@tanstack/react-query`, `zod`, `ai` (Vercel AI SDK), `@ai-sdk/deepseek`, `next-pwa`, `uuid`
3. Configure `tailwind.config.ts` and `postcss.config.js`
4. Initialize shadcn/ui with `npx shadcn-ui@latest init` (defaults, Slate gray theme, CSS variables)
5. Configure `next-pwa` in `next.config.js`

### Step 2: Database Setup
1. Initialize Prisma with SQLite provider: `DATABASE_URL="file:./data/stasis.db"`
2. Create Prisma schema with all tables (see master spec Section 10):
   - categories, income_entries, budget_allocations
   - subscriptions, subscription_payments
   - recurring_bills, bill_payments
   - debts, debt_payments
   - ai_conversations, ai_messages
   - settings
3. Run `npx prisma migrate dev --name init`
4. Create seed script with default categories (see master spec for seed data)
5. Run `npx prisma db seed`

### Step 3: Layout + Navigation
1. Create root layout with `app/layout.tsx`:
   - Import Inter font
   - Dark theme by default (bg: #0F172A, text: white)
   - PWA manifest + meta tags
2. Create bottom tab bar component (mobile-first, fixed at bottom):
   - 5 tabs: Dashboard (🏠), Budget (💰), Trackers (📋), AI Chat (🤖), Settings (⚙️)
   - Active tab highlighted with theme color (#3B82F6)
   - Use `next/link` for navigation
3. Create 5 page routes: `/`, `/budget`, `/trackers`, `/chat`, `/settings`

### Step 4: tRPC Setup
1. Create tRPC router with all procedures (see master spec Section 11):
   - dashboard router: `getSummary`
   - budget router: `getAll`, `set`
   - income router: `add`, `list`
   - subscriptions router: `list`, `add`, `pay`, `cancel`
   - bills router: `list`, `add`, `togglePaid`
   - debts router: `list`, `add`, `pay`
   - ai router: `chat`, `conversations`, `conversation`
   - categories router: `list`, `add`
   - settings router: `get`, `set`
2. Create tRPC client provider wrapping the app
3. All procedures use zod for input validation
4. All monetary amounts stored and returned as INTEGER (smallest Rupiah unit)

### Step 5: Dashboard Screen (`/`)
Build the dashboard as specified in master spec Section 13:
- Current month header (YYYY-MM format)
- Income card: total income for current month
- Committed card: sum of (active subscriptions monthly + unpaid bills this month + debt monthly payments), with progress bar (committed / income)
- Free cash card: income - committed
- Upcoming dues list: subscriptions and bills due within 7 days
- Debt progress section: each active debt with name, creditor, progress bar (% paid)
- Floating "Ask AI" button at bottom right
- Use tRPC hooks to fetch data

### Step 6: Budget Screen (`/budget`)
- Income summary at top (pull from income_entries for current month)
- Category list with allocated amounts and visual bars
- Each bar shows allocated amount
- Warning banner if total allocation exceeds total income
- Inline edit for each category's allocation
- Only show categories with type = 'budget'

### Step 7: Trackers Screen (`/trackers`)
Three sub-tabs (use a tab component):

**Subscriptions tab:**
- Total monthly burn at top
- List of active subscriptions: name, amount, cycle, next billing date, status badge
- Add button → form: name, amount, currency, billing cycle, next billing date, category
- Actions per item: pay (logs payment, advances date), pause, cancel

**Bills tab:**
- Monthly grid of bills for current month
- Each bill: name, due day, default amount, is_paid checkbox
- Color-coded: green (paid), yellow (due within 3 days, unpaid), gray (unpaid, not yet due), red (overdue)
- Add button → form: name, default_amount, due_day, category
- Generate bill_payments for current month when new month starts

**Debts tab:**
- Active debts list: name, creditor, remaining, interest rate, monthly payment
- Progress bar per debt: (principal - remaining) / principal × 100
- Payoff projection: remaining / monthly_payment = months remaining
- Add button → form: name, creditor, principal, interest rate, monthly payment, start date, category
- Pay action: log payment, reduce remaining_amount

### Step 8: AI Chat Screen (`/chat`)
- Left panel or full screen: conversation list (past chats with auto-titles from first message)
- Right panel or main: message history with user/assistant/tool bubbles
- Input field at bottom
- Floating "+" button for new conversation
- Set up Vercel AI SDK with Deepseek provider:
  ```
  import { createDeepSeek } from '@ai-sdk/deepseek';
  const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });
  ```
- System prompt in master spec Section 12
- Define function calling tools that invoke tRPC procedures server-side:
  - add_subscription, add_bill, add_debt, add_income, set_budget, log_payment, query_finances, get_dashboard
- Stream responses using `streamText` from Vercel AI SDK
- Display tool calls as collapsible entries in the chat
- Persist conversations in ai_conversations + ai_messages tables

### Step 9: Settings Screen (`/settings`)
- Categories management: list → add / edit / archive
- Default currency selector
- AI model display
- Export CSV button
- About section with app name + version

### Step 10: PWA + Offline
- Configure next-pwa with manifest from master spec Section 14
- Use `icon-light.svg` and `icon-dark.svg` as the app icon source. Generate 192x192 and 512x512 PNGs from these for the PWA manifest. The icon is the Budget Bars design: a rounded square (rx=120 at 512px) with four horizontal bars in mint, primary, coral, and light gray — representing tracker categories.
- Implement IndexedDB cache for dashboard data
- Service worker handles offline routing
- Offline banner component

### Step 11: AI Insights Widget
- On dashboard, below the main cards
- Shows AI-generated insight based on current data
- "You spend X% on subscriptions" / "Debt Y will be paid off by Z"
- Refreshes weekly or on-demand

### Step 12: Docker + Deployment
- Create Dockerfile (node:20-alpine multi-stage, see master spec Section 15)
- Create docker-compose.yml
- Create .env.example
- Add Prisma binaryTargets for Alpine

---

## Design System (TouchFlow-inspired, Light + Dark Mode)

The app supports both light and dark mode, respecting the user's system preference with a manual toggle in Settings.

**Light Mode:**
- **Background:** #FFFFFF
- **Surface/Cards:** #F8FAFC with border #E2E8F0
- **Primary:** #475569 (Slate 600)
- **Coral:** #EF4444 (danger, debt, alerts)
- **Mint:** #2DD4BF (success, paid, positive)
- **Text:** #1E293B primary, #64748B secondary

**Dark Mode:**
- **Background:** #0F172A (Slate 900)
- **Surface/Cards:** #1E293B with border #334155
- **Primary:** #64748B (Slate 500 — lighter for dark bg readability)
- **Coral:** #EF4444 (same)
- **Mint:** #2DD4BF (same)
- **Text:** #F8FAFC primary, #94A3B8 secondary

**Both modes:**
- **Font:** Inter
- **Border radius:** 16px cards, 10px buttons, 24px icon containers
- **Touch targets:** Minimum 44px for all interactive elements
- **Mobile-first:** Design for 375px, scale up. Generous padding. Bottom tab bar.
- **Icon:** Budget Bars design — see `icon-light.svg` and `icon-dark.svg`
- Use Tailwind's `dark:` prefix for dark mode variants. Toggle via `next-themes`.

---

## Important Rules
1. All monetary values are INTEGER (smallest Rupiah unit). Never use floats.
2. Month format is always YYYY-MM string.
3. Never create a transactions table.
4. AI messages must store tool_name, tool_args, tool_result for audit.
5. Use tRPC for all data operations — no direct Prisma calls from client.
6. The app is single-user. No auth required.
7. Mobile-first responsive design. Test at 375px.
8. Keep the codebase clean and modular. One component per file.

---

## Reference

Read `stasis-master-spec.md` for:
- Full database schema with column types
- Complete user stories with acceptance criteria
- Detailed screen wireframes
- AI system prompt and tool definitions
- Sprint scope and deliverables
