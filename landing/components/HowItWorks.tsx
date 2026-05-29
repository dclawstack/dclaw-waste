const steps = [
  {
    step: "01",
    title: "Load Demo Data",
    description:
      "Click 'Load Demo Data' on the dashboard. Six equipment units, four sites, three active lease contracts, and 40 waste records are created instantly. You're looking at a real, live platform in under 60 seconds.",
    icon: "⚡",
    detail: "POST /api/v1/seed — one endpoint fills everything",
  },
  {
    step: "02",
    title: "Manage Your Fleet & Leases",
    description:
      "Add equipment, create contracts, schedule deliveries, log damage — the full leasing lifecycle in one place. Renewal alerts fire 30 days before expiry. Auto-generate an invoice with one click.",
    icon: "🏗️",
    detail: "Equipment → Lease → Invoice → Payment link",
  },
  {
    step: "03",
    title: "Track Waste & Get AI Insights",
    description:
      "Log waste by type and site. The AI classifier suggests the right category from a text description. The Copilot answers plain-English questions. Anomaly detection flags unusual spikes before they become problems.",
    icon: "🤖",
    detail: "No API key needed — works fully offline",
  },
  {
    step: "04",
    title: "Generate Your ESG Report",
    description:
      "One API call produces a complete sustainability scorecard — Scope 3 carbon accounting, LEED credit estimate, certification level, per-site breakdown, and four plain-English AI highlights. Print or export as CSV.",
    icon: "📄",
    detail: "LEED / Zero Waste / ESG certification ready",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: "#F8F6FB" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="pill pill-brand mb-4">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5">
            From zero to insights
            <br />
            <span className="gradient-text">in four steps.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            No lengthy onboarding. No professional services. Just open, click, and run.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-[calc(50%-1px)] top-12 bottom-12 w-0.5 bg-brand-200" />

          <div className="space-y-12">
            {steps.map((s, i) => (
              <div key={s.step} className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-8`}>
                {/* Content card */}
                <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-brand-100 feature-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">{s.icon}</div>
                    <span className="text-4xl font-black text-brand-200">{s.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{s.description}</p>
                  <div className="flex items-center gap-2 text-xs font-mono text-brand-600 bg-brand-50 rounded-lg px-3 py-2">
                    <span className="opacity-60">›</span> {s.detail}
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden lg:flex w-12 h-12 rounded-full bg-brand-700 text-white font-black text-lg items-center justify-center flex-shrink-0 z-10 shadow-lg shadow-brand-300">
                  {s.step.replace("0", "")}
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
