const rows = [
  { feature: "Equipment & lease management", dclaw: "full", rubicon: "yes", roadrunner: "no", sheets: "no" },
  { feature: "AI waste copilot", dclaw: "full", rubicon: "no", roadrunner: "no", sheets: "no" },
  { feature: "Carbon Scope 3 reporting", dclaw: "full", rubicon: "paid", roadrunner: "paid", sheets: "no" },
  { feature: "Hazmat / UN manifest tracking", dclaw: "full", rubicon: "yes", roadrunner: "no", sheets: "no" },
  { feature: "AI route optimizer", dclaw: "full", rubicon: "paid", roadrunner: "yes", sheets: "no" },
  { feature: "Predictive scheduling", dclaw: "full", rubicon: "no", roadrunner: "no", sheets: "no" },
  { feature: "Instant demo data", dclaw: "full", rubicon: "no", roadrunner: "no", sheets: "no" },
];

function Cell({ kind }: { kind: string }) {
  if (kind === "full")
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-bold">✓</span>;
  if (kind === "yes")
    return <span className="text-gray-400 text-sm">✓</span>;
  if (kind === "paid")
    return <span className="text-amber-500 text-xs font-medium">Add-on</span>;
  return <span className="text-gray-300 text-sm">—</span>;
}

export default function Comparison() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="pill pill-brand mb-4">Why DClaw Waste</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5">
            10× better than the alternatives
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Enterprise tools cost $2k+/month. Spreadsheets cost you revenue.
            DClaw Waste gives you everything from $299/month.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: "#F8F6FB" }}>
                <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500">Capability</th>
                <th className="px-4 py-5 text-center">
                  <span className="font-black text-brand-700">DClaw Waste</span>
                </th>
                <th className="px-4 py-5 text-center text-sm font-semibold text-gray-400">Rubicon</th>
                <th className="px-4 py-5 text-center text-sm font-semibold text-gray-400">RoadRunner</th>
                <th className="px-4 py-5 text-center text-sm font-semibold text-gray-400">Spreadsheets</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.feature} className={i % 2 ? "bg-gray-50/50" : "bg-white"}>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{r.feature}</td>
                  <td className="px-4 py-4 text-center" style={{ background: "rgba(118,96,168,0.04)" }}><Cell kind={r.dclaw} /></td>
                  <td className="px-4 py-4 text-center"><Cell kind={r.rubicon} /></td>
                  <td className="px-4 py-4 text-center"><Cell kind={r.roadrunner} /></td>
                  <td className="px-4 py-4 text-center"><Cell kind={r.sheets} /></td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-100">
                <td className="px-6 py-5 text-sm font-bold text-gray-900">Starting price</td>
                <td className="px-4 py-5 text-center font-black text-brand-700">$299/mo</td>
                <td className="px-4 py-5 text-center text-sm text-gray-400">$2,000+/mo</td>
                <td className="px-4 py-5 text-center text-sm text-gray-400">$500+/mo</td>
                <td className="px-4 py-5 text-center text-sm text-gray-400">$0 + pain</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
