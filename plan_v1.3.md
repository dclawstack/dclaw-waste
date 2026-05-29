# DClaw Waste — Plan v1.3
# Strategic Gap Analysis & Feature Roadmap

> **Author:** sureshOC  
> **Date:** 2026-05-29  
> **Supersedes:** PLAN-v1.2.md  
> **Status:** Active Development

---

## Phase 1 Audit Summary

| Check | Result |
|-------|--------|
| Git remote | ✅ origin → github.com/dclawstack/dclaw-waste |
| Git user | ✅ sureshOC / suresh26.1992@gmail.com |
| Obsidian Vault | ✅ Present (.obsidian/) |
| Graphify knowledge graph | ❌ Not found — recommend `/graphify` after v1.3 |
| Database | PostgreSQL 16 (docker-compose) — SQLite not applicable |
| P0 features | ✅ Fully implemented (lease, equipment, waste, schedule, copilot, dashboard) |
| P1 features | ❌ Not yet implemented |
| P2 features | ❌ Not yet implemented |

---

## Phase 2: YC Gap Analysis

### What YC Reviewers Evaluate

YC's stated criteria for strong applications: **"hair-on-fire" problem**, large market, technical differentiation, 10x better than existing solutions, founder-market fit, early traction signal.

### Current State vs. YC Standard

| Dimension | Current State | YC Standard | Gap |
|-----------|--------------|-------------|-----|
| **Problem clarity** | "Waste management platform" (broad) | Specific painful problem with quantified cost | ❌ Needs sharper positioning |
| **AI differentiation** | Rule-based copilot fallback | Genuinely useful AI that saves time/money daily | ❌ No real AI value yet |
| **Demo-ability** | Empty dashboard on fresh start | Instant wow moment in <60 seconds | ❌ No seed/demo data |
| **Data visualization** | Raw numbers only | Charts showing trends & impact | ❌ No charts |
| **Network effects** | Single-tenant CRUD | Vendor marketplace creates lock-in | ❌ No vendor network |
| **ESG/Compliance** | Not implemented | Scope 3 carbon reports are table-stakes for enterprise | ❌ No carbon reporting |
| **Revenue mechanism** | No billing | Stripe + invoices = clear monetization story | ❌ No billing layer |
| **Hazmat/Compliance** | Not implemented | Regulated industries = sticky, high-value customers | ❌ No compliance module |
| **Mobile / field use** | Desktop-only layout | Waste ops = field workers on phones | ❌ No mobile sidebar |
| **Notification system** | Silent on critical events | Expiry alerts, overdue jobs need notifications | ❌ No toast/alerts |
| **Export / reporting** | No exports | CSV/PDF export required for LEED, audits | ❌ No exports |

### Critical Gaps Ranked by YC Impact

1. **No instant demo** — YC reviewers need to see value in seconds. Empty dashboard = zero impression.
2. **No data visualization** — Numbers without charts tell no story. Diversion rate trend is the core KPI.
3. **Missing ESG/Carbon reporting** — This is the #1 upsell in waste management. Enterprise buyers ask for it first.
4. **No vendor network** — Without hauler/recycler network data, the platform can't show cost optimization.
5. **No billing/invoices** — A waste company needs to know the platform generates revenue, not just tracks data.
6. **No AI that actually works** — The copilot is rule-based. At minimum, AI waste classification and anomaly detection should work without API keys.
7. **No mobile UX** — Field workers use phones. A sidebar that doesn't collapse = unusable in practice.
8. **No export capability** — LEED certification audits require data exports. This is a blocker for enterprise sales.

### What Would Make DClaw Waste Stand Out to YC

1. **"10x better than spreadsheets" demo**: One-click seed, beautiful charts, instant insight.
2. **Embedded AI that works offline**: Classification and anomaly detection with zero API keys — ML-in-the-product.
3. **Vendor network flywheel**: Each new vendor creates value for all customers → network effects.
4. **Compliance-as-a-feature**: Auto-generate EPA manifest, LEED report, Scope 3 carbon inventory.
5. **Revenue story**: Invoices → Stripe → ARR visible in the product.

---

## Feature Roadmap v1.3

### Complexity 0 — Low / Quick Wins
> Core foundational elements that multiply demo quality and UX polish. Implement first.

| # | Feature | Description | Impact |
|---|---------|-------------|--------|
| 0.1 | **Seed / Demo Data** | `POST /api/v1/seed` — creates realistic sample equipment, sites, leases, waste records, jobs | YC demo-ability |
| 0.2 | **Dashboard Charts** | SVG-based diversion donut + waste-by-type bar chart embedded in dashboard | Visual storytelling |
| 0.3 | **CSV Export** | Download leases list + waste records as CSV from frontend | Enterprise requirement |
| 0.4 | **Mobile Sidebar** | Hamburger toggle on small screens; sidebar overlays on mobile | Field worker UX |
| 0.5 | **Toast Notifications** | React Context toast system — success/error/warning on every action | UX polish |
| 0.6 | **`.env.example`** | Document all environment variables; remove secrets from codebase risk | Ops hygiene |
| 0.7 | **Waste Trend Sparkline** | 30-day rolling waste volume per site — mini trend chart on site cards | Insight at a glance |

### Complexity 1 — Medium / Core Differentiators
> Features that directly differentiate from spreadsheets and create customer stickiness.

| # | Feature | Description | Impact |
|---|---------|-------------|--------|
| 1.1 | **Vendor & Hauler Management** | CRUD for haulers, recyclers, processors; performance scoring; accepted waste types | Network foundation |
| 1.2 | **Carbon Impact Calculator** | EPA emission factors per waste type/diversion method; Scope 3 CO₂e report | ESG compliance |
| 1.3 | **Lease Invoice Generation** | Invoice CRUD; auto-calculate base + damage charges; mark paid | Revenue story |
| 1.4 | **Hazardous Waste Compliance** | HazmatRecord model; UN number; manifest tracking; disposal vendor linkage | Regulated customer unlock |
| 1.5 | **Waste Anomaly Detection** | Statistical z-score flags unusual waste spikes per site — visible on waste log | AI that works offline |

### Complexity 2 — High / AI Integrations & Advanced Workflows
> Features that create a moat. Require more engineering but define long-term competitive advantage.

| # | Feature | Description | Impact |
|---|---------|-------------|--------|
| 2.1 | **AI Waste Classifier** | `POST /api/v1/waste/classify` — takes free-text description, returns waste_type + diversion_method using LLM or keyword ML | UX speed-up |
| 2.2 | **Route Optimizer** | Greedy nearest-neighbor TSP for daily collection schedule; orders jobs by proximity | Ops efficiency |
| 2.3 | **ESG Report Generator** | Downloadable JSON/CSV ESG report: Scope 3 inventory, diversion rate, carbon offsets, LEED credits | Compliance upsell |
| 2.4 | **Predictive Fill Scheduling** | Linear extrapolation of waste growth per site → suggests next collection date | Preventive ops |
| 2.5 | **Customer Portal** | Separate read-only view for waste generators to see their site data (auth-gated) | Self-service upsell |
| 2.6 | **Stripe Billing Integration** | Connect invoices to Stripe payment links; webhook to mark paid | Monetization |

---

## Implementation Sprint Order

```
Sprint 1 (this session):
  0.1 Seed data          → instant demo
  0.2 Dashboard charts   → visual story
  0.3 CSV export         → enterprise-ready
  0.4 Mobile sidebar     → field-worker-ready
  0.5 Toast system       → UX baseline
  0.6 .env.example       → ops hygiene
  1.1 Vendor management  → network foundation
  1.2 Carbon calculator  → ESG story
  1.3 Lease invoices     → revenue story
  1.4 Hazmat compliance  → regulated market
  1.5 Anomaly detection  → embedded AI
  2.1 AI classifier      → AI story
  2.2 Route optimizer    → ops AI

Sprint 2 (next session):
  2.3 ESG report PDF
  2.4 Predictive scheduling
  2.5 Customer portal
  2.6 Stripe integration
```

---

## Technical Architecture Notes

### Database
- **Production:** PostgreSQL 16 via docker-compose (no SQLite — async driver requirement)
- **Tests:** PostgreSQL via pytest-asyncio + NullPool
- **Migrations:** Alembic autogenerate (all models imported in env.py)

### New Models (v1.3)
- `Vendor` — haulers, recyclers, processors
- `Invoice` — lease billing records
- `HazmatRecord` — regulated waste tracking

### Carbon Emission Factors (EPA WARM Model, kg CO₂e per kg waste)
| Waste Type | Landfill | Recycle | Compost | Incinerate |
|-----------|---------|---------|---------|------------|
| general | 0.49 | — | — | 0.42 |
| recyclable | 0.49 | -0.33 | — | — |
| organic | 0.65 | — | -0.18 | — |
| hazardous | 0.85 | — | — | 0.52 |
| e_waste | 0.49 | -0.95 | — | — |
| construction | 0.22 | -0.12 | — | 0.38 |

Negative values = emissions avoided (carbon credit).

### Anomaly Detection Method
- Per-site, rolling 30-record window
- Compute mean + std dev of `weight_kg`
- Flag record as anomaly if `weight_kg > mean + 2 * std_dev`
- Zero-dependency — pure Python statistics

---

## Acceptance Criteria (v1.3 Ship Gate)

- [ ] `POST /api/v1/seed` creates ≥5 equipment units, ≥3 sites, ≥3 contracts, ≥20 waste records
- [ ] Dashboard shows at least 2 visual charts (donut + bar)
- [ ] CSV export works for both leases and waste records
- [ ] Sidebar collapses to hamburger on mobile (< 768px)
- [ ] Vendor CRUD fully functional end-to-end
- [ ] Carbon report returns CO₂e values without API key
- [ ] Invoice list + create + mark-paid flow works
- [ ] HazmatRecord CRUD works with UN number field
- [ ] Anomaly flag appears on waste records with unusual weight
- [ ] AI classify endpoint returns waste_type + diversion_method for free-text input
- [ ] All new routes have at least one passing test
