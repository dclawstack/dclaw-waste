"use client"

import { useEffect, useState } from "react"
import { listHazmat, createHazmat, updateHazmat, deleteHazmat, listSites, listVendors, HazmatRecord, HazmatStatus, Site, Vendor } from "@/lib/api"
import { useToast } from "@/lib/toast"
import { Plus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_STYLE: Record<HazmatStatus, { bg: string; color: string }> = {
  pending:    { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  manifested: { bg: "var(--dk-info-bg)",    color: "var(--dk-info)" },
  disposed:   { bg: "var(--dk-success-bg)", color: "var(--dk-success)" },
  verified:   { bg: "var(--dk-brand-soft)", color: "var(--dk-brand)" },
}

export default function HazmatPage() {
  const toast = useToast()
  const [records, setRecords] = useState<HazmatRecord[]>([])
  const [total, setTotal] = useState(0)
  const [sites, setSites] = useState<Site[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ site_id: "", waste_type_detail: "", un_number: "", hazard_class: "", quantity_kg: "", manifest_number: "", disposal_vendor_id: "", notes: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const [h, s, v] = await Promise.all([
        listHazmat({ limit: "100" }),
        listSites({ active_only: "true", limit: "100" }),
        listVendors({ vendor_type: "processor", limit: "50" }),
      ])
      setRecords(h.items); setTotal(h.total); setSites(s.items); setVendors(v.items)
    } catch { toast.error("Failed to load hazmat records") }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.site_id || !form.waste_type_detail || !form.un_number || !form.hazard_class || !form.quantity_kg) {
      toast.error("All required fields must be filled"); return
    }
    setSaving(true)
    try {
      await createHazmat({
        ...form,
        quantity_kg: parseFloat(form.quantity_kg),
        disposal_vendor_id: form.disposal_vendor_id || undefined,
        manifest_number: form.manifest_number || undefined,
      })
      toast.success("Hazmat record created")
      setShowForm(false)
      setForm({ site_id: "", waste_type_detail: "", un_number: "", hazard_class: "", quantity_kg: "", manifest_number: "", disposal_vendor_id: "", notes: "" })
      load()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function handleStatusChange(id: string, status: HazmatStatus) {
    try { await updateHazmat(id, { status }); load() }
    catch { toast.error("Update failed") }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete hazmat record?")) return
    try { await deleteHazmat(id); toast.success("Deleted"); load() }
    catch { toast.error("Delete failed") }
  }

  if (loading) return <div className="animate-pulse" style={{ height: 200, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="dk-eyebrow mb-1">Compliance</p>
          <h1 className="dk-h4">Hazardous Waste <span style={{ color: "var(--dk-fg-2)", fontWeight: 400 }}>({total})</span></h1>
        </div>
        <Button onClick={() => setShowForm(true)} style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}>
          <Plus size={16} className="mr-1" /> Log Hazmat
        </Button>
      </div>

      {total > 0 && records.some(r => r.status === "pending") && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "var(--dk-warning-bg)" }}>
          <AlertTriangle size={16} style={{ color: "var(--dk-warning)" }} />
          <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-warning)", fontWeight: 500 }}>
            {records.filter(r => r.status === "pending").length} pending hazmat records require manifesting
          </span>
        </div>
      )}

      {records.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--dk-fg-2)" }}>No hazmat records. Log regulated waste streams here.</div>
      ) : (
        <div className="dk-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dk-border)", background: "var(--dk-gray-50)" }}>
                  {["Waste Type","UN#","Hazard Class","Qty (kg)","Manifest","Status",""].map(h => (
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const ss = STATUS_STYLE[r.status]
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--dk-border)" }}>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", fontWeight: 600, color: "var(--dk-fg)" }}>{r.waste_type_detail}</td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", fontFamily: "var(--dk-font-mono)", color: "var(--dk-danger)" }}>{r.un_number}</td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>Class {r.hazard_class}</td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{Number(r.quantity_kg).toFixed(1)}</td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: r.manifest_number ? "var(--dk-fg-1)" : "var(--dk-fg-muted)", fontFamily: "var(--dk-font-mono)" }}>
                        {r.manifest_number || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="dk-badge" style={{ background: ss.bg, color: ss.color }}>{r.status}</span>
                          <select className="text-xs border rounded px-1 py-0.5" style={{ borderColor: "var(--dk-border)" }} value={r.status}
                            onChange={e => handleStatusChange(r.id, e.target.value as HazmatStatus)}>
                            {(["pending","manifested","disposed","verified"] as HazmatStatus[]).map(s =>
                              <option key={s} value={s}>{s}</option>
                            )}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(r.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-danger)", background: "var(--dk-danger-bg)" }}>Delete</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Hazardous Waste</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Site *</Label>
              <Select value={form.site_id} onValueChange={v => setForm(f => ({ ...f, site_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                <SelectContent>{sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Waste Type Detail *</Label><Input value={form.waste_type_detail} onChange={e => setForm(f => ({ ...f, waste_type_detail: e.target.value }))} placeholder="Used motor oil, Battery acid…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>UN Number *</Label><Input value={form.un_number} onChange={e => setForm(f => ({ ...f, un_number: e.target.value }))} placeholder="UN1268" /></div>
              <div><Label>Hazard Class *</Label><Input value={form.hazard_class} onChange={e => setForm(f => ({ ...f, hazard_class: e.target.value }))} placeholder="3" /></div>
              <div><Label>Quantity (kg) *</Label><Input type="number" step="0.001" value={form.quantity_kg} onChange={e => setForm(f => ({ ...f, quantity_kg: e.target.value }))} /></div>
              <div><Label>Manifest #</Label><Input value={form.manifest_number} onChange={e => setForm(f => ({ ...f, manifest_number: e.target.value }))} /></div>
            </div>
            {vendors.length > 0 && (
              <div>
                <Label>Disposal Vendor</Label>
                <Select value={form.disposal_vendor_id} onValueChange={v => setForm(f => ({ ...f, disposal_vendor_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
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
