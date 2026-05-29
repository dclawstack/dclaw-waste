"use client"

import { useEffect, useState } from "react"
import { listSites, createSite, deleteSite, Site, SiteType } from "@/lib/api"
import { Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SITE_TYPES: SiteType[] = ["office","warehouse","restaurant","retail","construction","industrial"]

export default function SitesPage() {
  const [items, setItems] = useState<Site[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", address: "", site_type: "office" as SiteType, customer_name: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function load() {
    try {
      const data = await listSites({ limit: "100" })
      setItems(data.items); setTotal(data.total)
    } catch { setError("Failed to load sites") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.name.trim() || !form.address.trim() || !form.customer_name.trim()) { setError("All fields required"); return }
    setSaving(true); setError("")
    try {
      await createSite(form)
      setShowForm(false); setForm({ name: "", address: "", site_type: "office", customer_name: "" }); load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this site? All related waste records will also be deleted.")) return
    try { await deleteSite(id); load() }
    catch { setError("Delete failed") }
  }

  if (loading) return <div className="animate-pulse" style={{ height: 200, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className="dk-eyebrow mb-1">Locations</p><h1 className="dk-h4">Sites <span style={{ color: "var(--dk-fg-2)", fontWeight: 400 }}>({total})</span></h1></div>
        <Button onClick={() => setShowForm(true)} style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}><Plus size={16} className="mr-1" /> Add Site</Button>
      </div>
      {error && <div className="p-3 rounded-xl text-sm" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(site => (
          <div key={site.id} className="dk-card flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: "var(--dk-brand)" }} />
                <span style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{site.name}</span>
              </div>
              <span className="dk-badge" style={{ background: site.active ? "var(--dk-success-bg)" : "var(--dk-gray-100)", color: site.active ? "var(--dk-success)" : "var(--dk-gray-500)" }}>{site.active ? "active" : "inactive"}</span>
            </div>
            <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{site.site_type}</p>
            <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>{site.address}</p>
            <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Customer: {site.customer_name}</p>
            <button onClick={() => handleDelete(site.id)} className="self-start mt-2 text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-danger)", background: "var(--dk-danger-bg)" }}>Delete</button>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-3 text-center py-16" style={{ color: "var(--dk-fg-2)" }}>No sites yet.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Site</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {error && <p style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)" }}>{error}</p>}
            <div><Label>Site Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Address *</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label>Customer Name *</Label><Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.site_type} onValueChange={v => setForm(f => ({ ...f, site_type: v as SiteType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SITE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
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
