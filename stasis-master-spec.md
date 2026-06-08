# Stasis — Personal Finance Manager
## Master Specification Document

**Version:** 1.0  
**Date:** 2026-06-08  
**Product Type:** Personal SaaS (single-user, self-hosted)  
**App Name:** Stasis — *equilibrium, balance, steady state*  
**Design:** TouchFlow-inspired. Light + dark mode (system preference + manual toggle). Slate palette (primary #475569 light / #64748B dark, coral #EF4444, mint #2DD4BF). White/dark backgrounds, rounded surfaces, thumb-friendly min 44px touch targets.  
**App Icon:** Budget Bars (G) — rounded square with colored category bars. Sources: `icon-light.svg` + `icon-dark.svg`.

---

## 1. Problem Statement

Alfi tracks his debts in Google Sheets and has no clear picture of where his money goes each month. Subscription creep, recurring bills, and debt obligations are scattered across memory and manual checks. He wants a single place to:

- See all recurring financial commitments at a glance
- Allocate his monthly budget across categories with confidence
- Track debts and payoff progress
- Get AI-driven insights on where to cut, reallocate, or optimize

Existing tools (spreadsheets, local banking apps) are either too manual, too generic, or don't sync well in Indonesia. A personal, AI-augmented tool fills the gap.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Reduce time spent tracking finances | From "whenever I remember in Sheets" → weekly 5-min check-in |
| Eliminate surprise charges | 0 missed subscription renewals or bill due dates |
| Improve budget confidence | User can state exact allocation per category before month starts |
| Debt payoff clarity | User knows exactly when each debt will be paid off |

---

## 3. User Persona

**Alfi** — A PM in IT based in Indonesia. Comfortable with tech but wants minimal friction for personal finance. Already uses AI (Deepseek API) as a personal assistant. Prefers manual data entry over bank sync due to poor local banking APIs. Wants control, clarity, and a dash of AI intelligence — not another bloated finance app.

---

## 4. Feature Requirements

### Must-Have (MVP)

| Feature | Description |
|---|---|
| **Monthly Budget Planner** | Set total monthly budget, allocate to categories. Visual bar showing allocation vs actual. |
| **Subscription Tracker** | Add subscriptions with name, amount, billing cycle, next billing date. Dashboard shows total monthly subscription burn. |
| **Recurring Bill Tracker** | Add recurring bills (electricity, water, internet, insurance). Due date tracking and monthly total. Checkbox to mark as paid. |
| **Debt Tracker** | Add debts with principal, interest rate, monthly payment, creditor. Payoff date projection. AI suggests payoff strategies. |
| **Income Entry** | Log monthly income sources. Feeds into budget allocation logic. |
| **Monthly Dashboard** | Single view: total income, total committed, remaining discretionary, debt progress bars. |
| **AI-Assisted Entry** | Natural language → structured data. "Netflix 149k per month billed on the 15th" → auto-categorizes and adds. |
| **AI Insights** | "You spent 18% of income on subscriptions. Consider pausing Spotify." |

### Should-Have (Sprint 4)

| Feature | Description |
|---|---|
| **Reminders / Notifications** | Push reminders before bill due dates and subscription renewals. |
| **Category Rollover** | Unspent budget rolls to next month or reallocates. |
| **Historical Trends** | Month-over-month comparison. 6-12 month trends. |
| **Multi-Currency Support** | IDR primary, foreign subscriptions in USD with converted totals. |
| **Export** | CSV/PDF export. |
| **PWA Offline** | Installable on mobile home screen with offline support. |

### Nice-to-Have

| Feature | Description |
|---|---|
| **WhatsApp Bot** | Log expenses or check balances via WhatsApp. |
| **Savings Goals** | Set savings targets with progress bars. |
| **Bill Split** | Track shared expenses / IOUs. |

---

## 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Platform** | Web app (PWA-capable). Responsive, mobile-first. TouchFlow-inspired: light theme, white backgrounds, rounded surfaces, thumb-friendly touch targets (min 44px). |
| **Data Privacy** | All data stored locally in SQLite. No third-party sharing. |
| **AI** | Deepseek API via Vercel AI SDK. Streaming chat interface. |
| **Performance** | Dashboard < 2s load. AI responses stream progressively. |
| **Language** | UI in English. AI understands mixed EN/ID. |
| **Deployment** | Docker on homelab VM. Cloudflare Tunnel for public access. |

---

## 6. Out of Scope

- Bank account syncing / open banking
- One-off expense tracking
- Multi-user / family accounts
- Investment portfolio tracking
- Tax calculation / reporting
- Mobile native app (PWA only)

---

## 7. Key Assumptions & Risks

| Assumption | Risk if wrong |
|---|---|
| User will manually enter data weekly | Low engagement. Mitigation: AI-assisted entry reduces friction. |
| Deepseek API remains available | Core AI feature breaks. Mitigation: swappable AI provider layer. |
| Categories are stable month-to-month | Noisy comparisons. Mitigation: easy category create/archive. |
| Single-user design is sufficient | Architecture rework needed if scaling to multi-user. |

---

## 8. User Stories (MVP)

### Budgeting
**As Alfi,** I want to set my monthly income and allocate it across categories, so that I know exactly how much I can spend.

**AC:** Enter income → assign amounts to categories → visual breakdown. Warning if allocation exceeds income. See remaining mid-month.

### Subscription Tracking
**As Alfi,** I want to add subscriptions with amount, cycle, and next billing date, so I know my total subscription spend and never miss a renewal.

**AC:** Natural language entry creates subscription. Dashboard shows total monthly burn. Warning indicator for dues within 3 days.

### Debt Tracking
**As Alfi,** I want to track all debts with principal, interest rate, and monthly payments, so I know my payoff timeline.

**AC:** Add debt → system calculates payoff date. AI suggests payoff strategy with reasoning.

### AI Assistant
**As Alfi,** I want natural language interaction, so data entry and insights feel conversational.

**AC:** Type "I just paid my internet bill 350k" → logs payment. Ask "how am I doing?" → AI summarizes. Ask "what can I cut?" → AI analyzes.

### Dashboard
**As Alfi,** I want a single dashboard showing my full financial picture.

**AC:** Dashboard shows income, committed, free cash, upcoming dues, debt progress. New month prompts budget setup.

---

## 9. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | SQLite via Prisma ORM |
| **API** | tRPC (typesafe procedures) |
| **AI** | Vercel AI SDK → Deepseek API |
| **PWA** | next-pwa |
| **Deployment** | Docker on homelab VM, Cloudflare Tunnel |
| **Backup** | Cron copies SQLite daily |

---

## 10. Database Schema

### categories
| id | name | type | color | icon | created_at | updated_at |

**Seed:** Salary (#22C55E), Freelance (#3B82F6), Housing (#EF4444), Food & Dining (#F97316), Transport (#EAB308), Entertainment (#A855F7), Subscriptions (#EC4899), Utilities (#06B6D4), Debt Repayment (#DC2626), Savings (#10B981)

### income_entries
id | source | category_id | amount (INTEGER, in Rupiah) | month (YYYY-MM) | notes | created_at

### budget_allocations
id | category_id | month (YYYY-MM) | allocated_amount (INTEGER) | created_at | updated_at

### subscriptions
id | name | amount (INTEGER) | currency (IDR/USD) | billing_cycle (monthly/yearly/quarterly) | next_billing_date | category_id | status (active/paused/cancelled) | notes | created_at

### subscription_payments
id | subscription_id | amount (INTEGER) | paid_date | created_at

### recurring_bills
id | name | default_amount (INTEGER) | due_day (1-31) | category_id | status (active/inactive) | notes | created_at

### bill_payments
id | bill_id | amount (INTEGER) | month (YYYY-MM) | paid_date | is_paid (BOOL) | created_at

### debts
id | name | creditor | principal_amount (INTEGER) | remaining_amount (INTEGER) | interest_rate (DECIMAL) | monthly_payment (INTEGER) | start_date | category_id | status (active/paid_off) | notes | created_at

### debt_payments
id | debt_id | amount (INTEGER) | payment_date | notes | created_at

### ai_conversations
id | title | created_at

### ai_messages
id | conversation_id | role (user/assistant/system/tool) | content | tool_name | tool_args (JSON) | tool_result (JSON) | created_at

### settings
key (PK) | value (JSON)

**Key design decisions:**
- All amounts in INTEGER (smallest currency unit). 5,000,000 IDR = 5000000
- month uses TEXT YYYY-MM for simple queries
- currency only on subscriptions (foreign subs possible)
- No transactions table (one-off expenses out of scope)
- AI messages track tool calls for audit trail

---

## 11. API Design (tRPC)

| Procedure | Description |
|---|---|
| `dashboard.getSummary` | { income, committed, free, upcomingDues, debts } |
| `budget.getAll` | [{ category, allocated }] for month |
| `budget.set` | Upsert allocation |
| `income.add` | Insert income entry |
| `income.list` | All entries for month |
| `subscriptions.list` | All active subscriptions |
| `subscriptions.add` | Insert subscription |
| `subscriptions.pay` | Log payment, advance next_billing_date |
| `subscriptions.cancel` | Set status to 'cancelled' |
| `bills.list` | Bills for month with is_paid |
| `bills.add` | Insert recurring bill |
| `bills.togglePaid` | Flip is_paid on bill_payment |
| `debts.list` | Active debts with payoff projection |
| `debts.add` | Insert debt |
| `debts.pay` | Log payment, reduce remaining_amount |
| `ai.chat` | Stream: takes messages[], returns SSE with tool calls |
| `ai.conversations` | List past conversations |
| `ai.conversation` | Single conversation with messages |
| `categories.list` | All categories, optional type filter |
| `categories.add` | Insert category |
| `settings.get` | key → value |
| `settings.set` | key → value |

---

## 12. AI System Design

### Capabilities
1. Create/update data via natural language
2. Answer questions by querying database
3. Give advice based on analysis

### Architecture
- Vercel AI SDK + Deepseek provider (deepseek-chat)
- Function calling → tRPC procedures as tools
- Streaming responses via SSE
- Chat persisted in ai_conversations / ai_messages

### AI Tools (Function Calling)
add_subscription | add_bill | add_debt | add_income | set_budget | log_payment | query_finances | get_dashboard

### System Prompt
You are Stasis, a personal finance assistant. Help the user track subscriptions, bills, debts, and budgets. Parse natural language into structured data using available tools. Query the database and summarize when asked questions. Be direct and practical when giving advice. All amounts are in Indonesian Rupiah (IDR) unless specified. Do not ask the user to manually fill forms — use your tools.

### UX
Chat input at bottom of every screen. AI understands screen context. Example: "add Netflix 149k per month billed on the 15th" → inserts → "✅ Added. You now spend 398k/month on subscriptions."

---

## 13. Screen Map & Navigation

**5 screens, bottom tab bar (mobile-first):**

🏠 **Dashboard** — Income, committed, free cash, upcoming dues, debt progress. Floating AI button.

💰 **Budget** — Income summary + category allocations with bars. Warning if total > income.

📋 **Trackers** — 3 sub-tabs: Subs (list + burn total), Bills (monthly grid + paid checkbox), Debts (list + payoff bars).

🤖 **AI Chat** — Conversation list → tap to open → message history → input field. AI reads/writes data.

⚙️ **Settings** — Categories management, currency, model, export CSV.

### Dashboard Wireframe
```
┌─────────────────────────┐
│  June 2026              │
├─────────────────────────┤
│   💰 Income             │
│   Rp 15,000,000         │
│                         │
│   📊 Committed          │
│   Rp 11,200,000  (74%)  │
│   ████████████████░░░░  │
│                         │
│   ✅ Free               │
│   Rp 3,800,000   (26%)  │
├─────────────────────────┤
│ ⚠️ Upcoming              │
│ • Netflix Rp149k — Jun 15│
│ • Internet Rp350k — Jun 20│
├─────────────────────────┤
│ 📉 Debts                 │
│ • BCA KPR  ████████░░ 78%│
│ • Motor    ████░░░░░░ 34%│
├─────────────────────────┤
│  [💬 Ask AI anything]   │
├─────────────────────────┤
│ 🏠   💰   📋   🤖   ⚙️  │
└─────────────────────────┘
```

---

## 14. PWA Specification

**Manifest:**
- name: Stasis, short_name: Stasis
- display: standalone
- background_color: #FFFFFF, theme_color: #475569
- icons: 192x192, 512x512

**Cache strategy:**
- / (HTML) → Network First
- /_next/static/* → Cache First
- /api/trpc/* → Network Only

**Offline UX:** Cached dashboard state. Tab bar works. Add/edit queued. Banner: "You're offline. Changes sync when connected."

---

## 15. Deployment

```
Homelab VM → Docker (app on 127.0.0.1:3000) → Cloudflare Tunnel → domain
Cron: daily SQLite backup to /opt/stasis/backups/
```

**docker-compose.yml:**
```yaml
services:
  app:
    build: .
    ports: ["127.0.0.1:3000:3000"]
    volumes: ["./data:/app/data"]
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - DATABASE_URL=file:/app/data/stasis.db
    restart: unless-stopped
```

**Env vars:** DEEPSEEK_API_KEY, DATABASE_URL

**Dockerfile:** node:20-alpine multi-stage build. Prisma binaryTargets = ["native", "linux-musl-openssl-3.0.x"].

**Backup cron:** `0 3 * * * cp /opt/stasis/data/stasis.db /opt/stasis/backups/stasis-$(date +%F).db`

---

## 16. Sprint Breakdown

### Sprint 1: Foundation + Dashboard + Budget
- Next.js + Prisma + SQLite scaffold, schema + migrations
- shadcn/ui + Tailwind + next-pwa config
- Bottom tab bar + screen routing
- Dashboard screen (income, committed, free, upcoming, debts)
- Budget screen (allocations, bar charts)
- tRPC: dashboard.getSummary, budget.*, income.*
- Seed categories
- AI chat placeholder UI

**Deliverable:** App runs on localhost. Dashboard + Budget functional.

### Sprint 2: Trackers
- Subscriptions list + add form
- Bills monthly grid + is_paid toggle
- Debts list + payoff progress bars
- tRPC: subscriptions.*, bills.*, debts.*
- Dashboard pulls live data from all trackers

**Deliverable:** All trackers functional. Dashboard fully live.

### Sprint 3: AI Integration
- Vercel AI SDK + Deepseek provider
- Function calling tools (DB read/write)
- AI chat screen (streaming, tool call display)
- Natural language entry (add subs/bills/debts via chat)
- AI insights widget on dashboard

**Deliverable:** AI assistant creates data and answers questions.

### Sprint 4: Polish + Offline
- PWA offline (IndexedDB cache + sync queue)
- Categories management screen
- Settings screen (currency, model, export)
- CSV export
- Docker deployment setup + testing

**Deliverable:** Full PWA with offline support. Deployable on homelab.

---

*End of Master Specification — Stasis v1.0*
