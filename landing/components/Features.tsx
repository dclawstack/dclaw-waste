const features = [
  {
    icon: "📋",
    category: "Core Operations",
    title: "Equipment & Lease Management",
    description:
      "Track every roll-off, compactor, and baler across its full lifecycle — from contract creation and delivery scheduling to damage assessments and renewal alerts. Stop losing 20–35% of lease revenue to spreadsheet errors.",
    highlight: "Lease revenue leak: fixed",
    bullets: ["Contract lifecycle tracking", "Damage assessment & billing", "Auto-renewal alerts at 30 days", "Delivery/pickup scheduling"],
    color: "from-purple-500 to-purple-700",
    bg: "bg-purple-50",
    accent: "#7660A8",
  },
  {
    icon: "🗑️",
    category: "Waste Intelligence",
    title: "AI-Powered Waste Tracking",
    description:
      "Log every kg by waste type, site, and diversion method. The AI classifier reads a plain-text description and instantly assigns waste type and recommended disposal — no dropdown hunting required.",
    highlight: "AI classifies in < 1 second",
    bullets: ["6 waste stream types", "AI text classifier", "Statistical anomaly detection", "Site-level waste intensity"],
    color: "from-green-500 to-emerald-700",
    bg: "bg-green-50",
    accent: "#2E8B57",
  },
  {
    icon: "🌿",
    category: "Sustainability",
    title: "Carbon Impact & ESG Reports",
    description:
      "Automatic Scope 3 carbon accounting using EPA WARM model factors. Generate a print-ready ESG report in one click — diversion rate, CO₂e avoided, LEED MR credits, and per-site breakdown.",
    highlight: "LEED MR credits auto-calculated",
    bullets: ["EPA WARM emission factors", "Scope 3 classification", "LEED credit estimator", "Printable + CSV export"],
    color: "from-emerald-500 to-teal-700",
    bg: "bg-teal-50",
    accent: "#0d9488",
  },
  {
    icon: "🚚",
    category: "Field Operations",
    title: "Smart Collection Scheduling",
    description:
      "Schedule pickups, deliveries, and swaps with a date-grouped timeline view. The AI route optimizer reorders your daily jobs using nearest-neighbour TSP — reducing fuel and time on every route.",
    highlight: "Route optimizer built-in",
    bullets: ["Calendar timeline view", "Greedy TSP route optimizer", "Complete/cancel inline", "Overdue pickup alerts"],
    color: "from-blue-500 to-indigo-700",
    bg: "bg-blue-50",
    accent: "#2563eb",
  },
  {
    icon: "🤖",
    category: "AI Copilot",
    title: "Contextual Waste Copilot",
    description:
      "A persistent AI assistant available on every page. Ask “what leases are expiring this month?” or “which site has the highest landfill rate?” — it reads live data from your database and answers in plain English.",
    highlight: "Works without API key",
    bullets: ["Live DB context injection", "Suggested quick actions", "OpenRouter + local Ollama fallback", "Accessible from every page"],
    color: "from-violet-500 to-purple-700",
    bg: "bg-violet-50",
    accent: "#7c3aed",
  },
  {
    icon: "⚠️",
    category: "Compliance",
    title: "Hazardous Waste Compliance",
    description:
      "Track UN numbers, hazard classes, and manifest IDs for every regulated waste stream. The compliance workflow guides records from Pending → Manifested → Disposed → Verified, with alerts for incomplete manifests.",
    highlight: "EPA/DOT manifest tracking",
    bullets: ["UN number validation", "Manifest lifecycle workflow", "Disposal vendor linkage", "Compliance status badges"],
    color: "from-red-500 to-orange-600",
    bg: "bg-red-50",
    accent: "#dc2626",
  },
  {
    icon: "🧾",
    category: "Revenue",
    title: "Invoicing & Stripe Payments",
    description:
      "Auto-generate monthly invoices from lease contracts. Apply damage charges, send payment links directly from the platform, and track outstanding balances with an at-a-glance banner.",
    highlight: "Stripe integration built-in",
    bullets: ["Auto-generate from contracts", "Damage charge rollup", "Stripe payment links", "Outstanding balance tracker"],
    color: "from-amber-500 to-yellow-600",
    bg: "bg-amber-50",
    accent: "#d97706",
  },
  {
    icon: "📊",
    category: "Analytics",
    title: "Predictive Analytics & Trends",
    description:
      "12-week waste trend charts with total vs. diverted dual-series. Per-site AI prediction tells you when the next collection is needed based on historical waste rate and trend direction.",
    highlight: "No API key needed",
    bullets: ["12-week time-series trends", "AI next-collection prediction", "Anomaly detection (z-score)", "Diversion rate donut chart"],
    color: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50",
    accent: "#0891b2",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="pill pill-brand mb-4">Platform Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">
            Everything a waste company needs.<br />
            <span className="gradient-text">Nothing it doesn't.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Eight deeply integrated modules — from the moment a container is leased to the day an ESG report lands in your auditor's inbox.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className={`feature-card rounded-2xl p-6 ${f.bg} border border-black/5`}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{f.icon}</div>
                <span className="pill" style={{ background: `${f.accent}15`, color: f.accent }}>
                  {f.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{f.description}</p>
              <ul className="space-y-1.5 mb-4">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: f.accent, flexShrink: 0 }}>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: `${f.accent}20`, color: f.accent }}>
                ✦ {f.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
