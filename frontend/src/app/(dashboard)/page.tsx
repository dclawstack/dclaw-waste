"use client"

import { useEffect, useState } from "react"
import { getDashboard, getWasteSummary, DashboardStats, WasteSummary } from "@/lib/api"
import { useToast } from "@/lib/toast"
import { Truck, FileText, Trash2, MapPin, Calendar, AlertTriangle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import DiversionDonut from "@/components/charts/DiversionDonut"
import WasteBarChart from "@/components/charts/WasteBarChart"
import TrendLineChart from "@/components/charts/TrendLineChart"
import OnboardingBanner from "@/components/onboarding/OnboardingBanner"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

type TrendPoint = {
  week_label: string; week_start: string;
  total_kg: number; diverted_kg: number;
  diversion_rate_pct: number; co2e_saved_kg: number;
}

function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: React.ElementType; accent?: boolean; sub?: string
}) {
  return (
    <div className="dk-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)", fontWeight: 500 }}>{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: accent ? "var(--dk-brand)" : "var(--dk-gray-100)" }}>
          <Icon size={16} color={accent ? "white" : "var(--dk-brand)"} />
        </div>
      </div>
      <p style={{ fontSize: "var(--dk-text-3xl)", fontWeight: 700, color: "var(--dk-fg)", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const toast = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [summary, setSummary] = useState<WasteSummary | null>(null)
  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState("")

  async function load() {
    try {
      const [s, ws] = await Promise.all([getDashboard(), getWasteSummary()])
      setStats(s); setSummary(ws)
    } catch { setError("Could not load dashboard. Is the backend running?") }

    try {
      const tr = await fetch(`${API_BASE}/api/v1/waste/trends?weeks=12`).then(r => r.json())
      if (Array.isArray(tr)) setTrends(tr)
    } catch { /* trends are optional */ }
  }

  useEffect(() => { load() }, [])

  async function handleSeed() {
    setSeeding(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/seed/`, { method: "POST" })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      toast.success(`Demo data loaded: ${data.waste_records_created} waste records, ${data.contracts_created} leases`)
      load()
    } catch (e: any) { toast.error(e.message || "Seed failed") }
    finally { setSeeding(false) }
  }

  const barData = summary
    ? Object.entries(summary.by_type).map(([label, value]) => ({ label, value: Number(value) }))
    : []
  const diverted = summary ? (summary.total_weight_kg * summary.diversion_rate_pct / 100) : 0

  const trendLabels = trends.map(t => t.week_label)
  const trendSeries = trends.length > 0 ? [
    { label: "Total (kg)", values: trends.map(t => t.total_kg), color: "var(--dk-brand)" },
    { label: "Diverted (kg)", values: trends.map(t => t.diverted_kg), color: "var(--dk-success)" },
  ] : []

  if (error) return (
    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>
      <AlertTriangle size={18} /><span style={{ fontSize: "var(--dk-text-sm)" }}>{error}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="dk-eyebrow mb-1">Overview</p>
          <h1 className="dk-h4">Dashboard</h1>
        </div>
        <Button onClick={handleSeed} disabled={seeding} variant="outline" className="gap-2 text-sm">
          <Zap size={15} style={{ color: "var(--dk-warning)" }} />
          {seeding ? "Loading…" : "Load Demo Data"}
        </Button>
      </div>

      {/* Onboarding banner — shows only when empty */}
      {stats && stats.total_equipment === 0 && stats.total_sites === 0 && (
        <OnboardingBanner
          hasEquipment={stats.total_equipment > 0}
          hasSites={stats.total_sites > 0}
          hasLeases={stats.active_leases > 0}
          hasWaste={stats.total_waste_kg > 0}
          onSeed={handleSeed}
          seeding={seeding}
        />
      )}

      {/* Alerts */}
      {stats && (stats.expiring_soon > 0 || stats.jobs_overdue > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {stats.expiring_soon > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl flex-1" style={{ background: "var(--dk-warning-bg)" }}>
              <AlertTriangle size={16} style={{ color: "var(--dk-warning)" }} />
              <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-warning)", fontWeight: 500 }}>
                {stats.expiring_soon} lease{stats.expiring_soon > 1 ? "s" : ""} expiring within 30 days
              </span>
            </div>
          )}
          {stats.jobs_overdue > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl flex-1" style={{ background: "var(--dk-danger-bg)" }}>
              <AlertTriangle size={16} style={{ color: "var(--dk-danger)" }} />
              <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-danger)", fontWeight: 500 }}>
                {stats.jobs_overdue} overdue pickup{stats.jobs_overdue > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      {!stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dk-card animate-pulse" style={{ height: 110, background: "var(--dk-gray-100)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Equipment" value={stats.total_equipment} icon={Truck} sub={`${stats.available_equipment} available`} />
          <StatCard label="Active Leases" value={stats.active_leases} icon={FileText} accent sub={`${stats.expiring_soon} expiring soon`} />
          <StatCard label="Total Waste (kg)" value={stats.total_waste_kg.toLocaleString()} icon={Trash2} sub={`${stats.diversion_rate_pct}% diverted`} />
          <StatCard label="Sites" value={stats.total_sites} icon={MapPin} />
          <StatCard label="Jobs Today" value={stats.jobs_today} icon={Calendar} sub={stats.jobs_overdue > 0 ? `${stats.jobs_overdue} overdue` : "On track"} />
          <StatCard label="Diversion Rate" value={`${stats.diversion_rate_pct}%`} icon={Trash2} accent sub="vs landfill" />
        </div>
      )}

      {/* Charts row */}
      {summary && summary.total_weight_kg > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="dk-card flex flex-col gap-4">
            <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>Diversion Rate</p>
            <div className="flex items-center justify-around">
              <DiversionDonut diverted={diverted} total={summary.total_weight_kg} size={130} />
              <div className="space-y-2">
                {Object.entries(summary.by_diversion).map(([method, kg]) => (
                  <div key={method} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: method === "landfill" ? "var(--dk-danger)" : "var(--dk-success)" }} />
                    <span style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-1)" }}>{method}</span>
                    <span style={{ fontSize: "var(--dk-text-xs)", fontWeight: 600, color: "var(--dk-fg)" }}>{Number(kg).toLocaleString()} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dk-card flex flex-col gap-4">
            <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>Waste by Type</p>
            <WasteBarChart data={barData} height={130} />
          </div>
        </div>
      )}

      {/* 12-week trend chart */}
      {trendSeries.length > 0 && trends.some(t => t.total_kg > 0) && (
        <div className="dk-card">
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>12-Week Waste Trend</p>
            <span style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>kg per week</span>
          </div>
          <TrendLineChart labels={trendLabels} series={trendSeries} height={140} />
        </div>
      )}

      {(!summary || summary.total_waste_kg === 0) && !stats?.total_equipment && (
        <div className="dk-card text-center py-12">
          <Trash2 size={32} className="mx-auto mb-3" style={{ color: "var(--dk-gray-300)" }} />
          <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>No waste data yet</p>
          <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)", marginTop: 4 }}>
            Click <strong>Load Demo Data</strong> above to see charts instantly.
          </p>
        </div>
      )}
    </div>
  )
}
