"use client"

import { useEffect, useState } from "react"
import { getDashboard, DashboardStats } from "@/lib/api"
import { Truck, FileText, Trash2, MapPin, Calendar, AlertTriangle } from "lucide-react"

function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: React.ElementType;
  accent?: boolean; sub?: string
}) {
  return (
    <div className="dk-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)", fontWeight: 500 }}>{label}</span>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: accent ? "var(--dk-brand)" : "var(--dk-gray-100)" }}
        >
          <Icon size={16} color={accent ? "white" : "var(--dk-brand)"} />
        </div>
      </div>
      <p style={{ fontSize: "var(--dk-text-3xl)", fontWeight: 700, color: "var(--dk-fg)", lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => setError("Could not load dashboard. Is the backend running?"))
  }, [])

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>
        <AlertTriangle size={18} />
        <span style={{ fontSize: "var(--dk-text-sm)" }}>{error}</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="dk-card animate-pulse" style={{ height: 110, background: "var(--dk-gray-100)" }} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="dk-eyebrow mb-1">Overview</p>
        <h1 className="dk-h4">Dashboard</h1>
      </div>

      {/* Alerts */}
      {(stats.expiring_soon > 0 || stats.jobs_overdue > 0) && (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Equipment" value={stats.total_equipment} icon={Truck} sub={`${stats.available_equipment} available`} />
        <StatCard label="Active Leases" value={stats.active_leases} icon={FileText} accent sub={`${stats.expiring_soon} expiring soon`} />
        <StatCard label="Total Waste (kg)" value={stats.total_waste_kg.toLocaleString()} icon={Trash2} sub={`${stats.diversion_rate_pct}% diverted`} />
        <StatCard label="Sites" value={stats.total_sites} icon={MapPin} />
        <StatCard label="Jobs Today" value={stats.jobs_today} icon={Calendar} sub={stats.jobs_overdue > 0 ? `${stats.jobs_overdue} overdue` : "On track"} />
        <StatCard label="Diversion Rate" value={`${stats.diversion_rate_pct}%`} icon={Trash2} accent sub="Landfill avoided" />
      </div>
    </div>
  )
}
