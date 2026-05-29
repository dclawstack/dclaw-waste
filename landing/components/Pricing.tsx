import { REGISTER_URL } from "@/lib/links";

const plans = [
  {
    name: "Starter",
    price: "$299",
    period: "/month",
    description: "For small haulers replacing spreadsheets.",
    features: [
      "Up to 25 equipment units",
      "Unlimited lease contracts",
      "Waste tracking & AI classifier",
      "Collection scheduling",
      "CSV exports",
    ],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Professional",
    price: "$599",
    period: "/month",
    description: "For mid-market companies that need ESG.",
    features: [
      "Everything in Starter",
      "Unlimited equipment",
      "Carbon & ESG reporting",
      "Hazmat compliance module",
      "AI route optimizer",
      "Stripe invoicing",
      "Predictive scheduling",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-site operators at scale.",
    features: [
      "Everything in Professional",
      "Multi-tenant org isolation",
      "Role-based access control",
      "API webhooks & integrations",
      "Dedicated support",
      "Custom SLA",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6" style={{ background: "#F8F6FB" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="pill pill-brand mb-4">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 flex flex-col ${
                p.featured
                  ? "bg-brand-800 text-white shadow-2xl shadow-brand-300 scale-105 relative"
                  : "bg-white border border-gray-100"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h3 className={`text-lg font-bold mb-1 ${p.featured ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
              <p className={`text-sm mb-5 ${p.featured ? "text-white/60" : "text-gray-500"}`}>{p.description}</p>
              <div className="mb-6">
                <span className={`text-4xl font-black ${p.featured ? "text-white" : "text-gray-900"}`}>{p.price}</span>
                <span className={`text-sm ${p.featured ? "text-white/60" : "text-gray-400"}`}>{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5"
                      style={{ color: p.featured ? "#86efac" : "#2E8B57" }}>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={p.featured ? "text-white/90" : "text-gray-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={p.cta === "Contact Sales" ? "mailto:sales@dclawwaste.com" : REGISTER_URL}
                className={`text-center font-semibold py-3 rounded-full transition-all ${
                  p.featured
                    ? "bg-white text-brand-800 hover:bg-brand-50"
                    : "bg-brand-700 text-white hover:bg-brand-800"
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
