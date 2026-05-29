const metrics = [
  { label: "Diversion Rate", value: "82%", change: "+14%", color: "#2E8B57" },
  { label: "CO₂e Avoided", value: "12.4t", change: "this quarter", color: "#7660A8" },
  { label: "LEED MR Credits", value: "1.5", change: "Platinum tier", color: "#0891b2" },
  { label: "Certification", value: "Zero Waste", change: "90%+ threshold", color: "#d97706" },
];

export default function ESGSection() {
  return (
    <section id="esg" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <span className="pill pill-green mb-4">ESG & Compliance</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Your sustainability story,
              <span className="gradient-text"> told automatically.</span>
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Enterprise procurement teams, LEED auditors, and sustainability managers
              all ask for the same thing — a clean, numbers-backed sustainability report.
              DClaw Waste generates it from your operational data with zero extra work.
            </p>
            <ul className="space-y-4">
              {[
                { icon: "🌱", text: "EPA WARM model emission factors for 6 waste types × 6 diversion methods" },
                { icon: "🏆", text: "Automatic LEED MR credit estimation and certification level badge" },
                { icon: "📊", text: "Per-site breakdown with diversion progress bars" },
                { icon: "🤖", text: "4 AI-generated plain-English highlights from your own data" },
                { icon: "📄", text: "Print-ready layout with one-click CSV export" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                  <span className="text-gray-700">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: ESG report card mockup */}
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-teal-100 rounded-3xl blur-2xl opacity-60" />

            {/* Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">ESG Report</p>
                  <p className="text-xl font-black text-gray-900">Sustainability Scorecard</p>
                </div>
                <div className="bg-green-100 text-green-700 font-bold text-sm px-3 py-1.5 rounded-full">
                  🏆 Zero Waste
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {metrics.map((m) => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">{m.label}</p>
                    <p className="text-2xl font-black" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.change}</p>
                  </div>
                ))}
              </div>

              {/* Diversion bar */}
              <div className="mb-5">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Waste Diversion</span>
                  <span className="font-semibold text-green-600">82% diverted from landfill</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: "82%" }} />
                </div>
              </div>

              {/* AI insight */}
              <div className="bg-brand-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-brand-700 mb-1">✦ AI Insight</p>
                <p className="text-sm text-gray-700">
                  "Your diversion rate of 82% qualifies for LEED Platinum. Increasing composting by 10% would cross the 90% Zero Waste threshold."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
