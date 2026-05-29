"use client"

import { useEffect, useState } from "react"
import { getCarbonReport } from "@/lib/api"
import { Leaf, TrendingDown, Award, Download, Printer, CheckCircle } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

type ESGReport = {
  generated_at: string; period: string;
  total_waste_kg: number; recycled_kg: number; composted_kg: number;
  reused_kg: number; landfill_kg: number; diverted_kg: number;
  diversion_rate_pct: number; total_co2e_kg: number; avoided_co2e_kg: number;
  net_co2e_kg: number; leed_mr_credits: number; certification_level: string;
  certification_color: string; active_leases: number; total_sites: number;
  waste_intensity_kg_per_site: number;
  by_site: Array<{ site_id: string; site_name: string; total_kg: number; diversion_rate_pct: number; co2e_kg: number }>;
  highlights: string[];
}

const CERT_COLORS: Record<string, { bg: string; text: string }> = {
  green:  { bg: "var(--dk-success-bg)",  text: "var(--dk-success)" },
  blue:   { bg: "var(--dk-info-bg)",     text: "var(--dk-info)" },
  yellow: { bg: "var(--dk-warning-bg)",  text: "var(--dk-warning)" },
  orange: { bg: "var(--dk-warning-bg)",  text: "var(--dk-warning)" },
  gray:   { bg: "var(--dk-gray-100)",    text: "var(--dk-gray-500)" },
}

export default function ESGPage() {
  const [report, setReport] = useState<ESGReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/esg/report`)
      .then(r => r.json())
      .then(setReport)
      .finally(() => setLoading(false))
  }, [])

  function downloadCSV() {
    if (!report) return
    const rows = [
      ["Metric", "Value"],
      ["Period", report.period],
      ["Total Waste (kg)", report.total_waste_kg],
      ["Diverted (kg)", report.diverted_kg],
      ["Landfill (kg)", report.landfill_kg],
      ["Recycled (kg)", report.recycled_kg],
      ["Composted (kg)", report.composted_kg],
      ["Diversion Rate (%)", report.diversion_rate_pct],
      ["Total CO₂e (kg)", report.total_co2e_kg],
      ["Avoided CO₂e (kg)", report.avoided_co2e_kg],
      ["Net CO₂e (kg)", report.net_co2e_kg],
      ["LEED MR Credits", report.leed_mr_credits],
      ["Certification Level", report.certification_level],
      ...report.by_site.map(s => [`Site: ${s.site_name}`, `${s.total_kg} kg, ${s.diversion_rate_pct}% diverted`]),
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const a = document.createElement("a")
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    a.download = `esg-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  if (loading) return <div className="animate-pulse" style={{ height: 400, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />

  return (
    <div className="space-y-6 max-w-4xl" id="esg-report">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="dk-eyebrow mb-1">Sustainability</p>
          <h1 className="dk-h4">ESG Report</h1>
          {report && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", marginTop: 4 }}>
            Generated {new Date(report.generated_at).toLocaleString()} · {report.period}
          </p>}
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: "var(--dk-gray-100)", color: "var(--dk-fg-1)" }}>
            <Printer size={14} /> Print
          </button>
          <button onClick={downloadCSV} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: "var(--dk-gray-100)", color: "var(--dk-fg-1)" }}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* Certification badge */}
          {(() => {
            const c = CERT_COLORS[report.certification_color] || CERT_COLORS.gray
            return (
              <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: c.bg, border: `1px solid ${c.text}33` }}>
                <Award size={24} style={{ color: c.text }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: "var(--dk-text-lg)", color: c.text }}>{report.certification_level}</p>
                  <p style={{ fontSize: "var(--dk-text-sm)", color: c.text, opacity: 0.8 }}>
                    {report.leed_mr_credits > 0 ? `Estimated ${report.leed_mr_credits} LEED MR credits earned` : "Increase diversion rate to earn LEED credits"}
                  </p>
                </div>
              </div>
            )
          })()}

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Waste", value: `${report.total_waste_kg.toLocaleString()} kg`, icon: Leaf },
              { label: "Diverted", value: `${report.diversion_rate_pct}%`, icon: TrendingDown, color: "var(--dk-success)" },
              { label: "CO₂e Avoided", value: `${report.avoided_co2e_kg.toLocaleString()} kg`, icon: Leaf, color: "var(--dk-success)" },
              { label: "Net CO₂e", value: `${report.net_co2e_kg.toLocaleString()} kg`, icon: Leaf, color: report.net_co2e_kg < 0 ? "var(--dk-success)" : "var(--dk-danger)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="dk-card text-center">
                <Icon size={20} className="mx-auto mb-2" style={{ color: color || "var(--dk-brand)" }} />
                <p style={{ fontWeight: 700, fontSize: "var(--dk-text-xl)", color: "var(--dk-fg)" }}>{value}</p>
                <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Waste breakdown */}
          <div className="dk-card">
            <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", marginBottom: 16 }}>Waste Diversion Breakdown</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Recycled", value: report.recycled_kg, color: "var(--dk-success)" },
                { label: "Composted", value: report.composted_kg, color: "var(--dk-warning)" },
                { label: "Reused", value: report.reused_kg, color: "var(--dk-info)" },
                { label: "Incinerated", value: report.total_waste_kg - report.recycled_kg - report.composted_kg - report.reused_kg - report.landfill_kg, color: "var(--dk-brand)" },
                { label: "Landfill", value: report.landfill_kg, color: "var(--dk-danger)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 rounded-lg" style={{ background: "var(--dk-gray-50)" }}>
                  <p style={{ fontWeight: 700, fontSize: "var(--dk-text-lg)", color }}>{Math.max(0, value).toLocaleString()}</p>
                  <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>kg {label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI highlights */}
          {report.highlights.length > 0 && (
            <div className="dk-card" style={{ background: "var(--dk-bg-tint)" }}>
              <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", marginBottom: 12 }}>Key Insights</p>
              <div className="space-y-3">
                {report.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={15} style={{ color: "var(--dk-brand)", marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>{h}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-site table */}
          {report.by_site.length > 0 && (
            <div className="dk-card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--dk-border)", background: "var(--dk-gray-50)" }}>
                <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>Performance by Site</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--dk-border)" }}>
                    {["Site", "Total Waste (kg)", "Diversion Rate", "CO₂e (kg)"].map(h => (
                      <th key={h} className="text-left px-4 py-2" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.by_site.map(s => (
                    <tr key={s.site_id} style={{ borderBottom: "1px solid var(--dk-border)" }}>
                      <td className="px-4 py-3" style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{s.site_name}</td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>{s.total_kg.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dk-gray-200)", maxWidth: 80 }}>
                            <div className="h-full rounded-full" style={{ width: `${s.diversion_rate_pct}%`, background: s.diversion_rate_pct >= 75 ? "var(--dk-success)" : s.diversion_rate_pct >= 50 ? "var(--dk-warning)" : "var(--dk-danger)" }} />
                          </div>
                          <span style={{ fontSize: "var(--dk-text-sm)", fontWeight: 600, color: "var(--dk-fg)" }}>{s.diversion_rate_pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: s.co2e_kg < 0 ? "var(--dk-success)" : "var(--dk-danger)" }}>
                        {s.co2e_kg > 0 ? "+" : ""}{s.co2e_kg.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer for print */}
          <div className="text-center pt-4 hidden print:block">
            <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>
              Generated by DClaw Waste Platform · {new Date().toLocaleDateString()}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
