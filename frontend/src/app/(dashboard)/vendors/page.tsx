"use client"

import { useEffect, useState } from "react"
import { listVendors, createVendor, updateVendor, deleteVendor, Vendor, VendorType } from "@/lib/api"
import { useToast } from "@/lib/toast"
import { Plus, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TYPE_LABELS: Record<VendorType, string> = {
  hauler: "Hauler", recycler: "Recycler", processor: "Processor", broker: "Broker",
}
const TYPE_COLOR: Record<VendorType, string> = {
  hauler: "var(--dk-brand)", recycler: "var(--dk-success)",
  processor: "var(--dk-info)", broker: "var(--dk-warning)",
}

export default function VendorsPage() {
  const toast = useToast()
  const [items, setItems] = useState<Vendor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", vendor_type: "hauler" as VendorType, service_areas: "", accepted_waste_types: "", contact_name: "", contact_email: "", contact_phone: "", rate_per_ton: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const data = await listVendors({ limit: "100" })
      setItems(data.items); setTotal(data.total)
    } catch { toast.error("Failed to load vendors") }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.name.trim()) { toast.error("Name required"); return }
    setSaving(true)
    try {
      await createVendor({ ...form, rate_per_ton: form.rate_per_ton ? parseFloat(form.rate_per_ton) : undefined })
      toast.success("Vendor created")
      setShowForm(false)
      setForm({ name: "", vendor_type: "hauler", service_areas: "", accepted_waste_types: "", contact_name: "", contact_email: "", contact_phone: "", rate_per_ton: "" })
      load()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function handleToggle(v: Vendor) {
    try { await updateVendor(v.id, { active: !v.active }); load() }
    catch { toast.error("Failed to update") }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete vendor?")) return
    try { await deleteVendor(id); toast.success("Deleted"); load() }
    catch { toast.error("Delete failed") }
  }

  if (loading) return <div className="animate-pulse" style={{ height: 200, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className="dk-eyebrow mb-1">Network</p><h1 className="dk-h4">Vendors <span style={{ color: "var(--dk-fg-2)", fontWeight: 400 }}>({total})</span></h1></div>
        <Button onClick={() => setShowForm(true)} style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}><Plus size={16} className="mr-1" /> Add Vendor</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(v => (
          <div key={v.id} className="dk-card flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} style={{ color: TYPE_COLOR[v.vendor_type] }} />
                <span style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{v.name}</span>
              </div>
              <span className="dk-badge" style={{ background: `${TYPE_COLOR[v.vendor_type]}20`, color: TYPE_COLOR[v.vendor_type] }}>{TYPE_LABELS[v.vendor_type]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} style={{ color: "var(--dk-warning)" }} />
              <span style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{Number(v.performance_score).toFixed(0)}/100 performance</span>
            </div>
            {v.service_areas && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Areas: {v.service_areas}</p>}
            {v.rate_per_ton && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-1)" }}>${Number(v.rate_per_ton).toFixed(2)}/ton</p>}
            {v.contact_email && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{v.contact_email}</p>}
            <div className="flex gap-2 mt-auto">
              <button onClick={() => handleToggle(v)} className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: v.active ? "var(--dk-success-bg)" : "var(--dk-gray-100)", color: v.active ? "var(--dk-success)" : "var(--dk-gray-500)" }}>
                {v.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => handleDelete(v.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-danger)", background: "var(--dk-danger-bg)" }}>Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-3 text-center py-16" style={{ color: "var(--dk-fg-2)" }}>No vendors yet. Add your haulers and recyclers.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vendor</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Type *</Label>
              <Select value={form.vendor_type} onValueChange={v => setForm(f => ({ ...f, vendor_type: v as VendorType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Service Areas</Label><Input value={form.service_areas} onChange={e => setForm(f => ({ ...f, service_areas: e.target.value }))} placeholder="Austin, Dallas" /></div>
              <div><Label>Accepted Waste Types</Label><Input value={form.accepted_waste_types} onChange={e => setForm(f => ({ ...f, accepted_waste_types: e.target.value }))} placeholder="general, recyclable" /></div>
              <div><Label>Rate per Ton ($)</Label><Input type="number" value={form.rate_per_ton} onChange={e => setForm(f => ({ ...f, rate_per_ton: e.target.value }))} /></div>
              <div><Label>Contact Name</Label><Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} /></div>
              <div><Label>Contact Email</Label><Input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving} style={{ background: "var(--dk-brand)", color: "white" }}>{saving ? "Saving…" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
