# DClaw Waste — v1.2 Feature Roadmap

> **Domain:** Waste Management SaaS — commercial B2B, mid-market
> **Stack lock:** Next.js 14 · FastAPI · PostgreSQL · Tailwind · shadcn/ui · DKube design tokens
> **AI mandate:** Every P0 feature ships with an AI copilot component (YC S25/W26 RFS requirement)
> **For agents:** Pick a feature, implement fully end-to-end, tick the checkbox.

---

## YC / Industry Alignment

This roadmap is benchmarked against:
- **YC RFS 2025–2026:** Circular economy, climate tech, AI-first vertical SaaS
- **Comparable funded companies:** Rubicon (waste marketplace), RoadRunner (transparent recycling), Greyparrot (AI waste analytics), Recycleye (AI sorting), Compology (IoT fill sensors), CurbWaste (waste ops SaaS)
- **Revenue patterns:** Container/equipment leasing is typically 20–35% of waste company revenue and has the highest margins. ESG/Scope 3 reporting is now a compliance requirement for 68% of mid-market customers.

---

## Pre-Flight Checklist — Do This First

- [ ] `frontend/package-lock.json` committed after any `npm install`
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [ ] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- [ ] `frontend/public/dclaw-manifest.json` exists (DPanel registration)
- [ ] DKube design tokens applied — `globals.css` uses `--dk-*` variables

---

## v1.0 Feature Inventory (Current)

- [ ] Core scaffold (FastAPI, Next.js, Docker, Helm, Alembic, CI)
- [ ] Health endpoint `/health` → `{"status":"ok"}`
- [ ] Dashboard stub page
- [ ] Basic waste tracking CRUD (waste records by type/location)
- [ ] Backend tests (pytest)

---

## v1.2 Roadmap

---

### P0 — Must Have (Demo-Ready)

#### P0.1 — Equipment & Container Lease Management
**Why first:** Leasing is the highest-margin revenue stream in waste operations. Rubicon and CurbWaste both list it as their #1 retention driver. Without lease tracking, waste companies run on spreadsheets.

**Description:** Full lifecycle management for leased waste equipment — roll-off containers, compactors, balers, dumpsters. From contract creation to billing to damage close-out.

**Entities:**
```
Equipment
├── id, serial_number, type (roll_off | compactor | baler | dumpster | cart)
├── capacity_yards: int
├── status: enum [available | deployed | maintenance | retired]
├── location_address: str (nullable — where it currently sits)
├── purchase_date: date
└── notes: str

LeaseContract
├── id, equipment_id → Equipment
├── customer_name, customer_email, customer_phone
├── service_address: str
├── start_date, end_date: date
├── monthly_rate: Decimal
├── billing_cycle: enum [monthly | quarterly | annual]
├── status: enum [active | expired | terminated | pending]
├── auto_renew: bool
└── special_terms: str (nullable)

LeaseEvent
├── id, contract_id → LeaseContract
├── event_type: enum [delivery | pickup | swap | maintenance_call | damage_report | inspection]
├── scheduled_at: datetime
├── completed_at: datetime (nullable)
├── driver_notes: str
└── photo_urls: list[str]

DamageAssessment
├── id, contract_id → LeaseContract
├── reported_at: datetime
├── description: str
├── severity: enum [minor | moderate | severe]
├── repair_cost: Decimal
├── charged_to_customer: bool
└── photo_urls: list[str]
```

**Backend:**
- CRUD for `Equipment`, `LeaseContract`, `LeaseEvent`, `DamageAssessment`
- `GET /api/v1/leases` — list with filters: status, customer, equipment_type
- `POST /api/v1/leases` — create contract + auto-schedule delivery event
- `GET /api/v1/leases/{id}/events` — timeline for a contract
- `POST /api/v1/leases/{id}/renew` — extend end_date, log renewal event
- `GET /api/v1/equipment` — fleet inventory with availability status
- `GET /api/v1/equipment/availability` — available units by type/capacity
- Background task: flag contracts expiring in ≤30 days → `expiring_soon` flag

**Frontend:**
- `/leases` — table view: contract list with status badges, days-remaining chip, search/filter
- `/leases/new` — multi-step form: select equipment → customer info → schedule delivery → pricing
- `/leases/[id]` — contract detail: event timeline, damage log, renewal button, billing summary
- `/equipment` — fleet grid: equipment cards with status, location, current lessee
- Renewal alert banner on dashboard for expiring contracts

**AI Component:**
- Lease term recommender: given customer type + waste volume, suggest optimal container size, billing cycle, and estimated monthly rate (uses historical contract data)
- Damage risk scorer: flag high-risk customers before renewal based on damage history

**Files to touch:**
- `backend/app/models/lease.py`, `equipment.py`, `damage.py`
- `backend/app/api/v1/leases.py`, `equipment.py`
- `backend/app/schemas/lease.py`
- `frontend/src/app/(dashboard)/leases/page.tsx`
- `frontend/src/app/(dashboard)/leases/[id]/page.tsx`
- `frontend/src/app/(dashboard)/equipment/page.tsx`

---

#### P0.2 — AI Waste Copilot (Floating Chat)
**Why:** YC S25/W26 RFS mandates AI copilot as P0. Greyparrot's differentiator is intelligence over data — this is the moat.

**Description:** Persistent AI assistant accessible from every page. Contextually aware of the current page (contracts, fleet, waste data). Suggests next actions, answers "what's happening with X" questions.

**Backend:**
- `POST /api/v1/copilot/chat` — accepts message + page_context, returns streamed response
- RAG over: lease contracts, waste records, equipment status, compliance flags
- Tool calls: `lookup_contract`, `check_equipment_status`, `list_expiring_leases`, `get_waste_summary`
- Fallback chain: OpenRouter (Kimi K2.5) → local Ollama

**Frontend:**
- Floating chat button (bottom-right, every page)
- Slide-out panel: conversation history, streaming response, suggested quick actions
- Context injection: passes current page entity (e.g., open contract ID) to each message

**Files to touch:**
- `backend/app/api/v1/copilot.py`
- `backend/app/services/rag.py`
- `frontend/src/components/copilot/CopilotPanel.tsx`
- `frontend/src/components/copilot/CopilotButton.tsx`

---

#### P0.3 — Waste Stream Tracking
**Description:** Log and classify waste generation by type, location, date, and source. The core data spine that everything else (carbon, compliance, recycling) plugs into.

**Entities:**
```
WasteRecord
├── id, site_id → Site
├── waste_type: enum [general | recyclable | organic | hazardous | e_waste | construction]
├── weight_kg: Decimal
├── volume_liters: Decimal (nullable)
├── diversion_method: enum [landfill | recycle | compost | incinerate | reuse | donate]
├── vendor_id → Vendor (nullable)
├── recorded_at: datetime
└── notes: str

Site
├── id, name, address
├── site_type: enum [office | warehouse | restaurant | retail | construction | industrial]
├── customer_name: str
└── active: bool
```

**Backend:**
- Full CRUD for `WasteRecord` and `Site`
- `GET /api/v1/waste/summary` — total by type, diversion rate, landfill vs. diverted
- `GET /api/v1/waste/trends` — weekly/monthly totals per site
- AI classification endpoint: `POST /api/v1/waste/classify` — given description, suggest waste_type + diversion_method

**Frontend:**
- `/waste` — log entry form + recent records table
- `/sites` — site list with per-site waste summary cards
- Dashboard widget: diversion rate donut chart, top waste streams bar

**Files to touch:**
- `backend/app/models/waste.py`, `site.py`
- `backend/app/api/v1/waste.py`, `sites.py`
- `frontend/src/app/(dashboard)/waste/page.tsx`
- `frontend/src/app/(dashboard)/sites/page.tsx`

---

#### P0.4 — Collection Scheduling
**Description:** Schedule and dispatch collection pickups. Integrates with lease contracts (delivery/swap/pickup) and standalone collection routes.

**Entities:**
```
CollectionJob
├── id, site_id → Site
├── contract_id → LeaseContract (nullable)
├── job_type: enum [regular_collection | delivery | swap | pickup | emergency]
├── scheduled_date: date
├── time_window: enum [morning | afternoon | anytime]
├── status: enum [scheduled | in_progress | completed | cancelled]
├── driver_notes: str
└── completed_at: datetime (nullable)
```

**Backend:**
- CRUD for `CollectionJob`
- `GET /api/v1/schedule` — calendar view: jobs by date range
- `POST /api/v1/schedule/optimize` — AI reorders jobs by geographic proximity for a given day
- Auto-create collection jobs when waste records suggest fill threshold crossed

**Frontend:**
- `/schedule` — weekly calendar view, drag-to-reschedule
- Job detail drawer: site info, contract link, driver notes, status update
- Dashboard widget: today's jobs, overdue pickups alert

**Files to touch:**
- `backend/app/models/schedule.py`
- `backend/app/api/v1/schedule.py`
- `backend/app/services/route_optimizer.py`
- `frontend/src/app/(dashboard)/schedule/page.tsx`

---

### P1 — Should Have (v1.1–1.2)

#### P1.1 — Vendor & Hauler Management
**Description:** Manage waste haulers, recyclers, and processors. Rate their performance, compare costs. Inspired by Rubicon's marketplace model.

- Vendor CRUD: name, type, service_area, accepted_waste_types, rate_per_ton
- Service record log: date, waste_type, weight, cost, vendor
- AI vendor scorer: performance rating from service history (reliability, cost, diversion rate)
- Frontend: vendor list, vendor detail with service history, cost comparison table

**Files:** `backend/app/models/vendor.py`, `frontend/src/app/(dashboard)/vendors/page.tsx`

---

#### P1.2 — Carbon Impact Calculator
**Description:** Calculate Scope 3 waste-related emissions. Required for LEED, ESG, and enterprise procurement. Rubicon and RoadRunner both charge premium for this.

- Per-waste-record carbon factor lookup (EPA emission factors by waste type + diversion method)
- Monthly/annual carbon report: landfill CH4 avoided, recycling offset
- `GET /api/v1/carbon/report?period=monthly` → kg CO₂e by category
- AI: model "what if we increased composting 20%?" reduction scenarios
- Frontend: carbon dashboard page, downloadable PDF report stub

**Files:** `backend/app/services/carbon.py`, `frontend/src/app/(dashboard)/carbon/page.tsx`

---

#### P1.3 — Lease Billing & Invoicing
**Description:** Generate invoices for active lease contracts. Auto-calculate based on billing cycle, apply damage charges.

- `Invoice` model: contract_id, period_start/end, base_amount, damage_charges, total, status (draft | sent | paid)
- `POST /api/v1/invoices/generate` — batch generate for all active contracts in a period
- PDF invoice template (HTML → PDF via WeasyPrint or similar)
- Stripe integration stub: payment link on invoice
- Frontend: invoices list, invoice detail, "Mark Paid" action

**Files:** `backend/app/models/invoice.py`, `backend/app/services/billing.py`

---

#### P1.4 — Hazardous Waste Compliance
**Description:** Classify and track hazmat waste streams per EPA/DOT requirements. Manifest tracking and regulatory reporting.

- `HazmatRecord` extends WasteRecord: UN_number, hazard_class, manifest_id, transporter_license
- Manifest PDF generation (Uniform Hazardous Waste Manifest format)
- Compliance alert: flag records missing required fields
- Frontend: hazmat log view with compliance status badges

---

### P2 — Could Have (v1.3+)

#### P2.1 — ESG / Zero Waste Analytics Dashboard
- Waste diversion rate over time (landfill diversion %)
- Cost per ton by waste stream
- Peer benchmarking: compare diversion rate vs. industry averages
- LEED credit progress tracker
- Downloadable sustainability report (CSV + PDF)
- AI insight: "Your cardboard recycling rate dropped 12% last month — likely contamination in bin #3"

#### P2.2 — Recycling Optimization & Contamination Alerts
- AI image classification: photo upload → recyclable vs. contaminated flag (Recycleye-style)
- Per-stream contamination rate tracking
- Employee-facing sorting guide generator (AI creates site-specific guides)
- Recycling purity score per site

#### P2.3 — Employee Engagement & Gamification
- Team challenges: "Waste-Free Lunch Week", monthly reduction targets
- Leaderboard by site/team
- Automated monthly impact report (emails per team: "You diverted X kg this month!")
- Badge system for milestones

#### P2.4 — Circular Economy Marketplace
- Post surplus materials (pallets, cardboard, scrap metal) for reuse
- Match waste generators with certified recyclers
- Material exchange ledger: track circular transactions
- Integration with P1.2 carbon calculator (circular transactions earn carbon credit)

#### P2.5 — DClaw Carbon Integration
- API sync: push waste-derived Scope 3 data to DClaw Carbon module
- Emission factor matching: waste type → GHG Protocol factor
- Bidirectional: carbon module can query waste records for drill-down

---

## Implementation Priority

```
Sprint 1:  P0.3 Waste Tracking     → core data spine, unblocks everything
Sprint 2:  P0.1 Lease Management   → highest revenue impact, core domain feature
Sprint 3:  P0.4 Collection Scheduling → integrates with leases + waste records
Sprint 4:  P0.2 AI Copilot         → YC mandate, adds intelligence layer over existing data
Sprint 5:  P1.1 Vendor Management  → completes the operational loop
Sprint 6:  P1.3 Lease Billing      → closes the revenue loop
Sprint 7:  P1.2 Carbon Calculator  → unlocks ESG upsell
Sprint 8:  P1.4 Hazmat Compliance  → enterprise/regulated accounts
```

---

## Acceptance Criteria (P0 Ship Gate)

- [ ] All P0 APIs return real PostgreSQL data (no mocks)
- [ ] Frontend pages load in <1s on local Docker
- [ ] Backend test coverage ≥70%
- [ ] AI Copilot responds in <3s on first message
- [ ] `docker compose up -d` starts all services cleanly
- [ ] `frontend/public/dclaw-manifest.json` present
- [ ] DKube design tokens applied throughout frontend
