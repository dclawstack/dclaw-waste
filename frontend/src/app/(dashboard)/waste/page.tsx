"use client"

import { useEffect, useState } from "react"
import { listWasteRecords, createWasteRecord, getWasteSummary, listSites, deleteWasteRecord, WasteRecord, WasteSummary, Site, WasteType, DiversionMethod } from "@/lib/api"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const WASTE_TYPES: WasteType[] = ["general","recyclable","organic","hazardous","e_waste","construction"]
const DIVERSION: DiversionMethod[] = ["landfill","recycle","compost","incinerate","reuse","donate"]

const TYPE_COLOR: Record<WasteType, string> = {
  general: "var(--dk-gray-400)", recyclable: "var(--dk-success)", organic: "var(--dk-warning)",
  hazardous: "var(--dk-danger)", e_waste: "var(--dk-info)", construction: "var(--dk-brand)",
}

export default function WastePage() {
  const [records, setRecords] = useState<WasteRecord[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<WasteSummary | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ site_id: "", waste_type: "general" as WasteType, weight_kg: "", diversion_method: "landfill" as DiversionMethod, notes: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function load() {
    try {
      const [rData, sData, sites] = await Promise.all([
        listWasteRecords({ limit: "50" }),
        getWasteSummary(),
        listSites({ active_only: "true", limit: "100" }),
      ])
      setRecords(rData.items); setTotal(rData.total); setSummary(sData); setSites(sites.items)
    } catch { setError("Failed to load waste data") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.site_id) { setError("Select a site"); return }
    if (!form.weight_kg || isNaN(Number(form.weight_kg))) { setError("Enter valid weight"); return }
    setSaving(true); setError("")
    try {
      await createWasteRecord({ ...form, weight_kg: parseFloat(form.weight_kg) })
      setShowForm(false); setForm({ site_id: "", waste_type: "general", weight_kg: "", diversion_method: "landfill", notes: "" })
      load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return
    try { await deleteWasteRecord(id); load() }
    catch { setError("Delete failed") }
  }

  if (loading) return <div className="animate-pulse" style={{ height: 300, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className="dk-eyebrow mb-1">Tracking</p><h1 className="dk-h4">Waste Log <span style={{ color: "var(--dk-fg-2)", fontWeight: 400 }}>({total})</span></h1></div>
        <Button onClick={() => setShowForm(true)} style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}><Plus size={16} className="mr-1" /> Log Waste</Button>
      </div>
      {error && <div className="p-3 rounded-xl text-sm" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>{error}</div>}

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-4">
          {records.length === 0 ? <p style={{ color: "var(--dk-fg-2)" }}>No waste records yet.</p> : (
            <div className="dk-card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--dk-border)", background: "var(--dk-gray-50)" }}>
                      {["Type","Weight (kg)","Diversion","Site","Date",""].map(h => (
                        <th key={h} className="text-left px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--dk-border)" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[r.waste_type] }} />
                            <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{r.waste_type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", fontWeight: 600, color: "var(--dk-fg)" }}>{Number(r.weight_kg).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="dk-badge" style={{ background: r.diversion_method === "landfill" ? "var(--dk-gray-100)" : "var(--dk-success-bg)", color: r.diversion_method === "landfill" ? "var(--dk-gray-500)" : "var(--dk-success)" }}>{r.diversion_method}</span>
                        </td>
                        <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{r.site_id.slice(0,8)}…</td>
                        <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{new Date(r.recorded_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDelete(r.id)} style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-xs)" }}>delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          {!summary ? <p style={{ color: "var(--dk-fg-2)" }}>No data.</p> : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="dk-card text-center">
                  <p style={{ fontSize: "var(--dk-text-2xl)", fontWeight: 700, color: "var(--dk-fg)" }}>{summary.total_weight_kg.toLocaleString()}</p>
                  <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Total kg</p>
                </div>
                <div className="dk-card text-center">
                  <p style={{ fontSize: "var(--dk-text-2xl)", fontWeight: 700, color: "var(--dk-success)" }}>{summary.diversion_rate_pct}%</p>
                  <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Diversion rate</p>
                </div>
                <div className="dk-card text-center">
                  <p style={{ fontSize: "var(--dk-text-2xl)", fontWeight: 700, color: "var(--dk-fg)" }}>{Object.keys(summary.by_type).length}</p>
                  <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Waste streams</p>
                </div>
                <div className="dk-card text-center">
                  <p style={{ fontSize: "var(--dk-text-2xl)", fontWeight: 700, color: "var(--dk-fg)" }}>{Object.keys(summary.by_diversion).length}</p>
                  <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Diversion methods</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="dk-card">
                  <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", marginBottom: 12 }}>By Waste Type</p>
                  {Object.entries(summary.by_type).map(([type, kg]) => (
                    <div key={type} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[type as WasteType] || "var(--dk-gray-400)" }} />
                        <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>{type}</span>
                      </div>
                      <span style={{ fontSize: "var(--dk-text-sm)", fontWeight: 600, color: "var(--dk-fg)" }}>{Number(kg).toLocaleString()} kg</span>
                    </div>
                  ))}
                </div>
                <div className="dk-card">
                  <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", marginBottom: 12 }}>By Diversion Method</p>
                  {Object.entries(summary.by_diversion).map(([method, kg]) => (
                    <div key={method} className="flex items-center justify-between py-1.5">
                      <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>{method}</span>
                      <span style={{ fontSize: "var(--dk-text-sm)", fontWeight: 600, color: method === "landfill" ? "var(--dk-danger)" : "var(--dk-success)" }}>{Number(kg).toLocaleString()} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Waste Record</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {error && <p style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)" }}>{error}</p>}
            <div>
              <Label>Site *</Label>
              <Select value={form.site_id} onValueChange={v => setForm(f => ({ ...f, site_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                <SelectContent>{sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Waste Type</Label>
                <Select value={form.waste_type} onValueChange={v => setForm(f => ({ ...f, waste_type: v as WasteType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WASTE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Weight (kg) *</Label><Input type="number" step="0.001" min="0" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} /></div>
            </div>
            <div>
              <Label>Diversion Method</Label>
              <Select value={form.diversion_method} onValueChange={v => setForm(f => ({ ...f, diversion_method: v as DiversionMethod }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIVERSION.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving} style={{ background: "var(--dk-brand)", color: "white" }}>{saving ? "Saving…" : "Log"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
