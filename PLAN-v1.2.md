# DClaw Waste — Master Feature Roadmap
> **Version:** 1.4 (YC-Ready Edition)  
> **Author:** sureshOC  
> **Last updated:** 2026-05-29  
> **Stack:** Next.js 14 · FastAPI · PostgreSQL · Tailwind · DKube design system  
> **Target:** Y Combinator W27 application — B2B SaaS, Sustainability/Climate Tech vertical

---

## YC Submission Context

**Problem Statement:**  
Commercial waste management companies lose 20–35% of revenue to manual spreadsheet workflows — missed lease renewals, unbilled damage charges, non-compliant hazmat manifests, and zero ESG visibility. DClaw Waste replaces these with an AI-powered operations platform.

**Market:**  
US commercial waste management market: $80B+. Mid-market companies (5–200 employees) are dramatically underserved — enterprise solutions (Rubicon, WasteQuip) cost $50k+/year and are inaccessible. SaaS at $299–$999/month hits a $12B TAM.

**Traction Signal:**  
Platform operational with demo data — see `POST /api/v1/seed`. Covers the full ops stack: equipment leasing, collection scheduling, waste tracking, carbon reporting, hazmat compliance, invoicing.

**Why DClaw Waste wins:**  
1. Embeds directly into existing waste company ops — zero workflow change  
2. ESG/Scope 3 report is auto-generated — enterprise procurement requires it  
3. AI copilot surfaces insights without dashboards expertise  
4. Equipment lease management closes the 20–35% revenue leak immediately  

---

## Competitive Landscape

| Feature | DClaw Waste | Rubicon | RoadRunner | CurbWaste | Spreadsheets |
|---------|-------------|---------|------------|-----------|--------------|
| Equipment leasing | ✅ Full CRUD + events | ✅ | ❌ | ✅ Basic | ❌ |
| AI waste copilot | ✅ + RAG | ❌ | ❌ | ❌ | ❌ |
| Carbon Scope 3 | ✅ EPA WARM | ✅ Paid add-on | ✅ Paid add-on | ❌ | ❌ |
| Hazmat compliance | ✅ UN manifest | ✅ | ❌ | ❌ | ❌ |
| Route optimizer | ✅ TSP | ✅ Paid | ✅ | ✅ | ❌ |
| Pricing | $299–$999/mo | $2k+/mo | $500+/mo | $300+/mo | $0 + pain |
| Open source potential | ✅ | ❌ | ❌ | ❌ | N/A |

---

## Implementation Status

### ✅ Completed (v1.0 – v1.3)

| Feature | Status | Version |
|---------|--------|---------|
| FastAPI + PostgreSQL scaffold | ✅ | v1.0 |
| Health endpoint `/health` | ✅ | v1.0 |
| Equipment CRUD (fleet management) | ✅ | v1.2 |
| Lease contracts + events + damage | ✅ | v1.2 |
| Waste stream tracking (6 types) | ✅ | v1.2 |
| Collection scheduling + route optimizer | ✅ | v1.2 |
| AI Waste Copilot (rule-based + LLM) | ✅ | v1.2 |
| Dashboard with live stats | ✅ | v1.2 |
| Vendor & hauler management | ✅ | v1.3 |
| Carbon Impact Calculator (EPA WARM) | ✅ | v1.3 |
| Lease invoice generation | ✅ | v1.3 |
| Hazardous waste compliance (UN/manifest) | ✅ | v1.3 |
| AI waste classifier (keyword ML) | ✅ | v1.3 |
| Statistical anomaly detection (z-score) | ✅ | v1.3 |
| SVG dashboard charts (donut + bar) | ✅ | v1.3 |
| CSV export (leases + waste records) | ✅ | v1.3 |
| Mobile-responsive sidebar | ✅ | v1.3 |
| Toast notification system | ✅ | v1.3 |
| Seed / demo data endpoint | ✅ | v1.3 |
| 20+ pytest tests | ✅ | v1.3 |

---

## YC Gap Analysis — What's Missing for Real B2B SaaS

Evaluated against YC's criteria: **hair-on-fire problem, 10x better, network effects, revenue model, founder-market fit, demo-ability.**

### Tier 1 — Blockers (Cannot submit without these)

| # | Gap | Why Critical | Status |
|---|-----|-------------|--------|
| G1 | **No Authentication** | Zero auth = toy app. No B2B buyer trusts unauth'd SaaS. JWT + user model required. | 🔴 v1.4 |
| G2 | **No Waste Trend Time-Series** | Dashboard shows totals but not improvement over time. YC wants the hockey stick. | 🔴 v1.4 |
| G3 | **No Downloadable ESG Report** | Carbon page shows data but zero PDF/print report. This is the #1 enterprise close feature. | 🔴 v1.4 |
| G4 | **No Payment Integration** | Invoices exist but no way to collect payment. Revenue story is incomplete. | 🔴 v1.4 |
| G5 | **No Predictive Analytics** | Data is logged but never used for forecasting. AI label without prediction = false advertising. | 🔴 v1.4 |
| G6 | **No Onboarding Flow** | New users see empty dashboard with zero guidance. Demo fails in first 10 seconds. | 🔴 v1.4 |

### Tier 2 — Differentiators (Need for competitive moat)

| # | Gap | Why Important | Status |
|---|-----|---------------|--------|
| G7 | **No Role-Based Access** | Admin/operator/viewer — enterprise procurement requires it | 🟡 v1.5 |
| G8 | **No Waste Reduction Goals** | KPI tracking vs targets — sustainability managers live by goals | 🟡 v1.5 |
| G9 | **No LEED Credit Tracker** | LEED MR credits are why facilities managers pay for ESG tools | 🟡 v1.5 |
| G10 | **No Email Notifications** | Lease expiry emails, overdue pickup alerts — daily driver retention | 🟡 v1.5 |
| G11 | **No API Webhooks** | Enterprise buyers need integration with ERP, Slack, PagerDuty | 🟡 v1.5 |
| G12 | **No Multi-tenant Architecture** | Can't sell to multiple companies with shared DB | 🟡 v1.5 |

### Tier 3 — Scale Features (v1.6+)

| # | Gap | Why Important |
|---|-----|---------------|
| G13 | **No IoT fill-level simulation** | Real sensor integration = Compology differentiator |
| G14 | **No Customer portal** | Self-service for waste generators drives virality |
| G15 | **No Marketplace** | Vendor matching network = flywheel / network effects |
| G16 | **No Native mobile app** | Field workers need offline-capable PWA |
| G17 | **No Sustainability benchmarking** | "You're top 20% in your city" = virality |

---

## v1.4 Roadmap — YC Submission Sprint

> **Goal:** Make this indistinguishable from a real, revenue-generating B2B SaaS company.

### AUTH-1 — JWT Authentication & User Management
**Why:** Zero auth = demo toy. A real B2B SaaS login page signals enterprise-readiness.

**Backend:**
- `User` model: email (unique), hashed_password (bcrypt), full_name, role, organization_name, is_active
- `POST /api/v1/auth/register` — create account, return JWT
- `POST /api/v1/auth/login` — validate credentials, return `{access_token, token_type, user}`
- `GET /api/v1/auth/me` — return current user from JWT
- `PUT /api/v1/auth/me` — update profile
- JWT dependency `get_current_user` for protected routes
- Add `python-jose[cryptography]` + `passlib[bcrypt]` to requirements

**Frontend:**
- `/login` — clean login form with DKube tokens
- `/register` — registration with organization name field
- `lib/auth.ts` — token storage, auth context, useAuth() hook
- Sidebar header: user avatar + name + org + logout button
- Redirect unauthenticated users to `/login`

**Files:** `models/user.py`, `schemas/auth.py`, `api/v1/auth.py`, `services/jwt.py`  
**Tests:** register + login + me + duplicate email rejection

---

### TREND-1 — Waste Trend Time-Series
**Why:** "Are things getting better?" is the question every sustainability manager asks. Time-series answers it.

**Backend:**
- `GET /api/v1/waste/trends?weeks=12` → `[{week_label, week_start, total_kg, diverted_kg, diversion_rate_pct, co2e_saved_kg}]`
- Aggregates by ISO week using SQLAlchemy date functions
- No deps — pure SQL aggregation

**Frontend:**
- `TrendLineChart` — SVG dual-line chart (total vs diverted) with week labels
- Embedded in dashboard below stats grid
- Toggle: 4 weeks / 12 weeks / 24 weeks

**Files:** `waste.py` (add endpoint), `components/charts/TrendLineChart.tsx`

---

### ESG-1 — Full Sustainability Report
**Why:** Every enterprise sustainability manager needs a shareable, printable report for auditors and leadership. This is the feature that closes deals.

**Backend:**
- `GET /api/v1/esg/report` — comprehensive sustainability scorecard:
  - Summary: total waste, diversion rate %, recycled %, composted %, landfill %
  - Carbon: total CO₂e, avoided CO₂e, net CO₂e, Scope 3 classification
  - LEED estimate: MR credits earned based on diversion
  - Per-site breakdown
  - Trend: diversion rate vs 30 days ago
  - AI highlights: 3 plain-English insights (rule-based or LLM)
  - Certification readiness: Zero Waste (90%+), LEED (75%+), Good (50%+)

**Frontend:**
- `/esg` — full report page with print button (`window.print()`)
- Print CSS: clean white single-column layout
- Certification badge: color-coded based on diversion rate
- "Download as CSV" button
- Share link stub

**Files:** `api/v1/esg.py`, `(dashboard)/esg/page.tsx`

---

### PREDICT-1 — AI Predictive Scheduling
**Why:** "When should my next collection be?" saves fuel, prevents overflows, proves AI value.

**Backend:**
- `GET /api/v1/sites/{id}/predict` — analyzes last 30 days of waste records:
  - Computes avg weekly waste rate (kg/week)
  - Linear trend (increasing/stable/decreasing)
  - Suggests next collection date based on capacity threshold
  - Returns confidence score

**Frontend:**
- Prediction card on `/sites` page for each site
- Small badge on schedule page: "Predicted fill: June 15"

**Files:** `sites.py` (add endpoint)

---

### STRIPE-1 — Payment Links on Invoices
**Why:** Revenue model is incomplete without payment collection. A single "Pay Now" button closes the loop.

**Backend:**
- `POST /api/v1/invoices/{id}/payment-link` — creates Stripe checkout session or returns mock URL
- Adds `payment_url` and `stripe_session_id` fields to Invoice model
- Real Stripe call if `STRIPE_API_KEY` configured, otherwise returns demo URL

**Frontend:**
- "Pay Now" button on invoice rows (opens payment_url in new tab)
- Invoice status auto-updates to "sent" when link generated

**Files:** `invoices.py` (add endpoint), `Invoice` model (add fields)

---

### ONBOARD-1 — First-Use Onboarding
**Why:** A YC demo reviewer will see an empty dashboard. Guided onboarding saves the demo.

**Frontend:**
- `OnboardingBanner` component — shows when total_equipment=0 and total_sites=0
- Step checklist: Add Site → Add Equipment → Create Lease → Log Waste → View Dashboard
- Each step links directly to the relevant page
- "Load Demo Data" shortcut fills everything in 1 click
- Dismissible with localStorage flag

**Files:** `components/onboarding/OnboardingBanner.tsx`, update `(dashboard)/page.tsx`

---

## Acceptance Criteria — YC-Ready Gate

- [ ] `POST /api/v1/auth/register` + `POST /api/v1/auth/login` work end-to-end
- [ ] JWT token validates on `GET /api/v1/auth/me`
- [ ] `/login` and `/register` pages render with DKube tokens
- [ ] `GET /api/v1/waste/trends?weeks=12` returns 12 weeks of data
- [ ] Dashboard shows trend line chart with week labels
- [ ] `GET /api/v1/esg/report` returns diversion rate, carbon, LEED estimate, highlights
- [ ] `/esg` page prints cleanly (no sidebar, clean white)
- [ ] `GET /api/v1/sites/{id}/predict` returns avg_weekly_kg + suggested_next_collection
- [ ] `POST /api/v1/invoices/{id}/payment-link` returns a payment_url
- [ ] Onboarding banner shows on empty dashboard, dismisses after demo data loaded
- [ ] All new endpoints have passing pytest tests
- [ ] `docker compose up -d` starts cleanly with no errors

---

## v1.5 Roadmap — Post-YC Interview

| Feature | Why | When |
|---------|-----|------|
| Role-based access control (admin/operator/viewer) | Enterprise procurement | Sprint 1 |
| Email notifications (lease expiry, overdue pickups) | Daily active retention | Sprint 1 |
| Waste reduction goals + progress bars | KPI management | Sprint 2 |
| LEED MR credit tracker with threshold alerts | Certification guidance | Sprint 2 |
| API webhooks (Slack, Zapier, ERP) | Integration stickiness | Sprint 3 |
| Multi-tenant org isolation | Sales scalability | Sprint 3 |
| Customer self-service portal | Virality + NPS | Sprint 4 |
| IoT fill-level sensor simulation | Hardware upsell | Sprint 5 |

---

## Technical Architecture (Enterprise-Ready)

```
DClaw Waste v1.4 Architecture
─────────────────────────────────────────────────────
Frontend (Next.js 14 App Router)
  ├── Auth context (JWT in localStorage, auto-refresh)
  ├── (auth) routes: /login, /register
  ├── (dashboard) routes: all feature pages
  └── DKube design system (Poppins, purple tokens)

Backend (FastAPI + SQLAlchemy 2.0 async)
  ├── /api/v1/auth        — JWT register/login/me
  ├── /api/v1/equipment   — Fleet management CRUD
  ├── /api/v1/leases      — Contract lifecycle
  ├── /api/v1/waste       — Tracking + trends + classify + anomaly
  ├── /api/v1/sites       — Sites + prediction
  ├── /api/v1/schedule    — Jobs + route optimizer
  ├── /api/v1/vendors     — Network management
  ├── /api/v1/carbon      — EPA WARM Scope 3
  ├── /api/v1/invoices    — Billing + Stripe
  ├── /api/v1/hazmat      — Compliance
  ├── /api/v1/esg         — Sustainability report ← NEW v1.4
  ├── /api/v1/dashboard   — Live stats
  ├── /api/v1/copilot     — AI assistant
  └── /api/v1/seed        — Demo data

Database (PostgreSQL 16)
  ├── users               ← NEW v1.4
  ├── equipment
  ├── lease_contracts, lease_events, damage_assessments
  ├── sites, waste_records
  ├── collection_jobs
  ├── vendors
  ├── invoices (+ payment_url)  ← UPDATED v1.4
  ├── hazmat_records
  └── (org_id column on all tables — v1.5)

Infrastructure
  ├── Docker Compose (postgres + backend + frontend)
  ├── Helm charts (Kubernetes)
  ├── GitHub Actions CI
  └── Health checks on all services
```
