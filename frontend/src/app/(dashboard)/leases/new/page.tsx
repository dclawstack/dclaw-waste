"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createLease, listEquipment, Equipment } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewLeasePage() {
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [form, setForm] = useState({
    equipment_id: "", customer_name: "", customer_email: "", customer_phone: "",
    service_address: "", start_date: "", end_date: "",
    monthly_rate: "", billing_cycle: "monthly", auto_renew: false, special_terms: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    listEquipment({ status: "available", limit: "100" }).then(d => setEquipment(d.items)).catch(() => {})
  }, [])

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.equipment_id) { setError("Select an equipment unit"); return }
    if (!form.monthly_rate || isNaN(Number(form.monthly_rate))) { setError("Enter a valid monthly rate"); return }
    setSaving(true); setError("")
    try {
      const contract = await createLease({
        ...form,
        monthly_rate: parseFloat(form.monthly_rate),
        customer_phone: form.customer_phone || undefined,
        special_terms: form.special_terms || undefined,
      } as any)
      router.push(`/leases/${contract.id}`)
    } catch (e: any) { setError(e.message || "Failed to create lease") }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/leases"><ArrowLeft size={18} style={{ color: "var(--dk-fg-2)" }} /></Link>
        <div>
          <p className="dk-eyebrow mb-1">New Contract</p>
          <h1 className="dk-h4">Create Lease</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="dk-card space-y-5">
        {error && <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>{error}</p>}

        <fieldset className="space-y-4">
          <legend style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", marginBottom: 12 }}>Equipment</legend>
          <div>
            <Label>Equipment Unit *</Label>
            <Select value={form.equipment_id} onValueChange={v => set("equipment_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select available unit" /></SelectTrigger>
              <SelectContent>
                {equipment.map(eq => (
                  <SelectItem key={eq.id} value={eq.id}>{eq.serial_number} — {eq.equipment_type}{eq.capacity_yards ? ` (${eq.capacity_yards}yd)` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", marginBottom: 12 }}>Customer</legend>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name *</Label><Input required value={form.customer_name} onChange={e => set("customer_name", e.target.value)} /></div>
            <div><Label>Email *</Label><Input required type="email" value={form.customer_email} onChange={e => set("customer_email", e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={form.customer_phone} onChange={e => set("customer_phone", e.target.value)} /></div>
            <div className="col-span-2"><Label>Service Address *</Label><Input required value={form.service_address} onChange={e => set("service_address", e.target.value)} /></div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", marginBottom: 12 }}>Terms</legend>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Start Date *</Label><Input required type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} /></div>
            <div><Label>End Date *</Label><Input required type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} /></div>
            <div><Label>Monthly Rate ($) *</Label><Input required type="number" step="0.01" min="0" value={form.monthly_rate} onChange={e => set("monthly_rate", e.target.value)} /></div>
            <div>
              <Label>Billing Cycle</Label>
              <Select value={form.billing_cycle} onValueChange={v => set("billing_cycle", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Special Terms</Label><Input value={form.special_terms} onChange={e => set("special_terms", e.target.value)} placeholder="Optional" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.auto_renew} onChange={e => set("auto_renew", e.target.checked)} className="rounded" />
            <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)" }}>Auto-renew on expiry</span>
          </label>
        </fieldset>

        <div className="flex gap-3 justify-end pt-2">
          <Link href="/leases"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={saving} style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}>
            {saving ? "Creating…" : "Create Lease"}
          </Button>
        </div>
      </form>
    </div>
  )
}
