"use client"

import { useEffect, useState } from "react"
import { listEquipment, createEquipment, updateEquipment, deleteEquipment, Equipment, EquipmentType, EquipmentStatus } from "@/lib/api"
import { Plus, Truck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  available: "dk-badge dk-badge-success",
  deployed: "dk-badge dk-badge-brand",
  maintenance: "dk-badge dk-badge-warning",
  retired: "dk-badge dk-badge-neutral",
}

const TYPE_LABELS: Record<EquipmentType, string> = {
  roll_off: "Roll-Off", compactor: "Compactor", baler: "Baler", dumpster: "Dumpster", cart: "Cart",
}

export default function EquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ serial_number: "", equipment_type: "roll_off" as EquipmentType, capacity_yards: "", notes: "" })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function load() {
    try {
      const data = await listEquipment({ limit: "100" })
      setItems(data.items); setTotal(data.total)
    } catch { setError("Failed to load equipment") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.serial_number.trim()) { setFormError("Serial number required"); return }
    setSaving(true); setFormError("")
    try {
      await createEquipment({
        serial_number: form.serial_number,
        equipment_type: form.equipment_type,
        capacity_yards: form.capacity_yards ? parseInt(form.capacity_yards) : undefined,
        notes: form.notes || undefined,
      })
      setShowForm(false)
      setForm({ serial_number: "", equipment_type: "roll_off", capacity_yards: "", notes: "" })
      load()
    } catch (e: any) { setFormError(e.message || "Failed to create") }
    finally { setSaving(false) }
  }

  async function handleStatusChange(eq: Equipment, status: EquipmentStatus) {
    try { await updateEquipment(eq.id, { status }); load() }
    catch { setError("Failed to update status") }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this equipment?")) return
    try { await deleteEquipment(id); load() }
    catch { setError("Failed to delete equipment") }
  }

  if (loading) return <div className="animate-pulse" style={{ height: 200, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />
  if (error) return <div className="p-4 rounded-xl dk-badge-danger" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>{error}</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="dk-eyebrow mb-1">Fleet</p>
          <h1 className="dk-h4">Equipment <span style={{ color: "var(--dk-fg-2)", fontWeight: 400, fontSize: "var(--dk-text-lg)" }}>({total})</span></h1>
        </div>
        <Button onClick={() => setShowForm(true)} style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}>
          <Plus size={16} className="mr-1" /> Add Equipment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(eq => (
          <div key={eq.id} className="dk-card flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Truck size={16} style={{ color: "var(--dk-brand)" }} />
                <span style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{eq.serial_number}</span>
              </div>
              <span className={STATUS_COLORS[eq.status]}>{eq.status}</span>
            </div>
            <div>
              <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>{TYPE_LABELS[eq.equipment_type]}</p>
              {eq.capacity_yards && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{eq.capacity_yards} yards</p>}
              {eq.location_address && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }} className="truncate">{eq.location_address}</p>}
            </div>
            <div className="flex gap-2 mt-auto">
              <select
                className="flex-1 text-xs border rounded-lg px-2 py-1"
                style={{ borderColor: "var(--dk-border)", fontFamily: "var(--dk-font-sans)" }}
                value={eq.status}
                onChange={e => handleStatusChange(eq, e.target.value as EquipmentStatus)}
              >
                {(["available","deployed","maintenance","retired"] as EquipmentStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button onClick={() => handleDelete(eq.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-danger)", background: "var(--dk-danger-bg)" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-3 text-center py-16" style={{ color: "var(--dk-fg-2)" }}>
            No equipment yet. Add your first unit.
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Equipment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {formError && <p style={{ color: "var(--dk-danger)", fontSize: "var(--dk-text-sm)" }}>{formError}</p>}
            <div><Label>Serial Number *</Label><Input value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} placeholder="EQ-001" /></div>
            <div>
              <Label>Type *</Label>
              <Select value={form.equipment_type} onValueChange={v => setForm(f => ({ ...f, equipment_type: v as EquipmentType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Capacity (yards)</Label><Input type="number" value={form.capacity_yards} onChange={e => setForm(f => ({ ...f, capacity_yards: e.target.value }))} placeholder="20" /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving} style={{ background: "var(--dk-brand)", color: "white" }}>{saving ? "Saving…" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
