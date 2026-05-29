"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { listLeases, LeaseContract, ContractStatus, downloadCsv } from "@/lib/api"
import { Plus, AlertTriangle, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const STATUS_STYLE: Record<ContractStatus, { bg: string; color: string }> = {
  active:     { bg: "var(--dk-success-bg)",  color: "var(--dk-success)" },
  pending:    { bg: "var(--dk-info-bg)",      color: "var(--dk-info)" },
  expired:    { bg: "var(--dk-danger-bg)",    color: "var(--dk-danger)" },
  terminated: { bg: "var(--dk-gray-100)",     color: "var(--dk-gray-500)" },
}

export default function LeasesPage() {
  const [items, setItems] = useState<LeaseContract[]>([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<ContractStatus | "">("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function load(status?: ContractStatus | "") {
    setLoading(true)
    try {
      const params: Record<string, string> = { limit: "50" }
      if (status) params.status = status
      const data = await listLeases(params)
      setItems(data.items); setTotal(data.total)
    } catch { setError("Failed to load leases") }
    finally { setLoading(false) }
  }

  useEffect(() => { load(filter) }, [filter])

  if (error) return (
    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>
      <AlertTriangle size={18} />{error}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="dk-eyebrow mb-1">Contracts</p>
          <h1 className="dk-h4">Leases <span style={{ color: "var(--dk-fg-2)", fontWeight: 400 }}>({total})</span></h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCsv("/api/v1/leases/export/csv", "leases.csv")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm" style={{ background: "var(--dk-gray-100)", color: "var(--dk-fg-1)" }}>
            <Download size={14} /> CSV
          </button>
          <Link href="/leases/new">
            <Button style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}>
              <Plus size={16} className="mr-1" /> New Lease
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["", "active", "pending", "expired", "terminated"] as (ContractStatus | "")[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-full text-sm transition-colors"
            style={
              filter === s
                ? { background: "var(--dk-brand)", color: "white", fontWeight: 600 }
                : { background: "var(--dk-gray-100)", color: "var(--dk-fg-2)" }
            }
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl" style={{ height: 60, background: "var(--dk-gray-100)" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--dk-fg-2)" }}>No leases yet. Create one to get started.</div>
      ) : (
        <div className="dk-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dk-border)", background: "var(--dk-gray-50)" }}>
                  {["Customer", "Equipment ID", "Period", "Rate / mo", "Status", "Expires in", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid var(--dk-border)" }}>
                    <td className="px-4 py-3">
                      <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{c.customer_name}</p>
                      <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{c.customer_email}</p>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)", fontFamily: "var(--dk-font-mono)" }}>{c.equipment_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)" }}>{c.start_date} → {c.end_date}</td>
                    <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", fontWeight: 600 }}>${Number(c.monthly_rate).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="dk-badge" style={{ background: STATUS_STYLE[c.status].bg, color: STATUS_STYLE[c.status].color }}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {c.days_remaining !== null && c.days_remaining !== undefined && (
                        <span style={{ fontSize: "var(--dk-text-sm)", color: c.days_remaining <= 30 ? "var(--dk-warning)" : "var(--dk-fg-2)" }}>
                          {c.days_remaining}d
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/leases/${c.id}`}>
                        <ChevronRight size={16} style={{ color: "var(--dk-fg-muted)" }} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
