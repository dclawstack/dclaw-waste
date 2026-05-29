"use client"

import { useEffect, useState } from "react"
import { getCarbonReport, CarbonReport } from "@/lib/api"
import { Leaf, TrendingDown, TrendingUp, Download } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function CarbonPage() {
  const [report, setReport] = useState<CarbonReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCarbonReport().then(setReport).finally(() => setLoading(false))
  }, [])

  function downloadReport() {
    if (!report) return
    const csv = ["waste_type,diversion_method,weight_kg,factor,co2e_kg",
      ...report.by_stream.map(s => `${s.waste_type},${s.diversion_method},${s.weight_kg},${s.factor},${s.co2e_kg}`)
    ].join("\n")
    const a = document.createElement("a")
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    a.download = "carbon_report.csv"
    a.click()
  }

  if (loading) return <div className="animate-pulse" style={{ height: 300, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className="dk-eyebrow mb-1">Scope 3</p><h1 className="dk-h4">Carbon Impact</h1></div>
        <button onClick={downloadReport} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: "var(--dk-gray-100)", color: "var(--dk-fg-1)" }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="dk-card text-center">
              <div className="flex justify-center mb-2"><TrendingUp size={20} style={{ color: "var(--dk-danger)" }} /></div>
              <p style={{ fontSize: "var(--dk-text-2xl)", fontWeight: 700, color: "var(--dk-fg)" }}>{report.total_co2e_kg.toLocaleString()}</p>
              <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Total kg CO₂e emitted</p>
            </div>
            <div className="dk-card text-center">
              <div className="flex justify-center mb-2"><TrendingDown size={20} style={{ color: "var(--dk-success)" }} /></div>
              <p style={{ fontSize: "var(--dk-text-2xl)", fontWeight: 700, color: "var(--dk-success)" }}>{report.avoided_co2e_kg.toLocaleString()}</p>
              <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>kg CO₂e avoided</p>
            </div>
            <div className="dk-card text-center">
              <div className="flex justify-center mb-2"><Leaf size={20} style={{ color: "var(--dk-brand)" }} /></div>
              <p style={{ fontSize: "var(--dk-text-2xl)", fontWeight: 700, color: report.net_co2e_kg < 0 ? "var(--dk-success)" : "var(--dk-fg)" }}>
                {report.net_co2e_kg.toLocaleString()}
              </p>
              <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Net kg CO₂e</p>
            </div>
          </div>

          <div className="dk-card">
            <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", marginBottom: 8 }}>
              Classification: <span style={{ color: "var(--dk-brand)" }}>{report.scope3_classification}</span>
            </p>
          </div>

          <div className="dk-card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--dk-border)", background: "var(--dk-gray-50)" }}>
              <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>Emissions by Waste Stream</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--dk-border)" }}>
                    {["Waste Type","Diversion","Weight (kg)","Factor","CO₂e (kg)"].map(h => (
                      <th key={h} className="text-left px-4 py-2" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.by_stream.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--dk-border)" }}>
                      <td className="px-4 py-2" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{s.waste_type}</td>
                      <td className="px-4 py-2" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>{s.diversion_method}</td>
                      <td className="px-4 py-2" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{s.weight_kg.toLocaleString()}</td>
                      <td className="px-4 py-2" style={{ fontSize: "var(--dk-text-xs)", fontFamily: "var(--dk-font-mono)", color: "var(--dk-fg-2)" }}>{s.factor}</td>
                      <td className="px-4 py-2">
                        <span style={{ fontWeight: 700, fontSize: "var(--dk-text-sm)", color: s.co2e_kg < 0 ? "var(--dk-success)" : "var(--dk-danger)" }}>
                          {s.co2e_kg > 0 ? "+" : ""}{s.co2e_kg.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {report.by_stream.length === 0 && (
            <div className="text-center py-12" style={{ color: "var(--dk-fg-2)" }}>
              <Leaf size={32} className="mx-auto mb-3" style={{ color: "var(--dk-gray-300)" }} />
              <p>No waste data yet. Load demo data or log waste records to see your carbon impact.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
