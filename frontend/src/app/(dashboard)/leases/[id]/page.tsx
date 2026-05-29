"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  getLease, getLeaseEvents, getLeiseDamages, renewLease, updateLease,
  addDamage, addLeaseEvent, deleteLease,
  LeaseContract, LeaseEvent, DamageAssessment, LeaseEventType, DamageSeverity,
} from "@/lib/api"
import { ArrowLeft, RefreshCw, AlertTriangle, Clock, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:     { bg: "var(--dk-success-bg)",  color: "var(--dk-success)" },
  pending:    { bg: "var(--dk-info-bg)",      color: "var(--dk-info)" },
  expired:    { bg: "var(--dk-danger-bg)",    color: "var(--dk-danger)" },
  terminated: { bg: "var(--dk-gray-100)",     color: "var(--dk-gray-500)" },
}

export default function LeaseDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [contract, setContract] = useState<LeaseContract | null>(null)
  const [events, setEvents] = useState<LeaseEvent[]>([])
  const [damages, setDamages] = useState<DamageAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDmgForm, setShowDmgForm] = useState(false)
  const [showEvtForm, setShowEvtForm] = useState(false)
  const [dmgForm, setDmgForm] = useState({ description: "", severity: "minor" as DamageSeverity, repair_cost: "" })
  const [evtForm, setEvtForm] = useState({ event_type: "inspection" as LeaseEventType, scheduled_at: "", driver_notes: "" })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const [c, e, d] = await Promise.all([getLease(id), getLeaseEvents(id), getLeiseDamages(id)])
      setContract(c); setEvents(e); setDamages(d)
    } catch { setError("Lease not found") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleRenew() {
    if (!confirm("Renew this lease for the same duration?")) return
    try { await renewLease(id); load() }
    catch (e: any) { setError(e.message) }
  }

  async function handleStatusChange(status: string) {
    try { await updateLease(id, { status: status as any }); load() }
    catch (e: any) { setError(e.message) }
  }

  async function handleDelete() {
    if (!confirm("Delete this lease and all events? This cannot be undone.")) return
    try { await deleteLease(id); router.push("/leases") }
    catch (e: any) { setError(e.message) }
  }

  async function submitDamage() {
    setSaving(true)
    try {
      await addDamage(id, { ...dmgForm, repair_cost: parseFloat(dmgForm.repair_cost) || 0 })
      setShowDmgForm(false); setDmgForm({ description: "", severity: "minor", repair_cost: "" }); load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function submitEvent() {
    setSaving(true)
    try {
      await addLeaseEvent(id, evtForm)
      setShowEvtForm(false); setEvtForm({ event_type: "inspection", scheduled_at: "", driver_notes: "" }); load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="animate-pulse" style={{ height: 300, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />
  if (error || !contract) return <div className="p-4 rounded-xl" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>{error || "Not found"}</div>

  const st = STATUS_STYLE[contract.status]

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/leases"><ArrowLeft size={18} style={{ color: "var(--dk-fg-2)" }} /></Link>
        <div className="flex-1">
          <p className="dk-eyebrow mb-1">Lease Contract</p>
          <h1 className="dk-h4">{contract.customer_name}</h1>
        </div>
        <div className="flex gap-2">
          {contract.status === "active" && (
            <Button onClick={handleRenew} variant="outline" className="gap-1">
              <RefreshCw size={14} /> Renew
            </Button>
          )}
          <button onClick={handleDelete} className="text-sm px-3 py-2 rounded-lg" style={{ color: "var(--dk-danger)", background: "var(--dk-danger-bg)" }}>Delete</button>
        </div>
      </div>

      {/* Contract info card */}
      <div className="dk-card grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="dk-badge" style={{ background: st.bg, color: st.color }}>{contract.status}</span>
            <select className="text-xs border rounded px-1 py-0.5" style={{ borderColor: "var(--dk-border)" }} value={contract.status} onChange={e => handleStatusChange(e.target.value)}>
              {["pending","active","expired","terminated"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Service Address</p><p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)", marginTop: 4 }}>{contract.service_address}</p></div>
        <div><p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Email</p><p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)", marginTop: 4 }}>{contract.customer_email}</p></div>
        <div><p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Period</p><p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)", marginTop: 4 }}>{contract.start_date} → {contract.end_date}</p></div>
        <div><p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Monthly Rate</p><p style={{ fontSize: "var(--dk-text-lg)", fontWeight: 700, color: "var(--dk-fg)", marginTop: 4 }}>${Number(contract.monthly_rate).toFixed(2)}</p></div>
        <div><p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Days Remaining</p>
          <p style={{ fontSize: "var(--dk-text-lg)", fontWeight: 700, color: (contract.days_remaining ?? 999) <= 30 ? "var(--dk-warning)" : "var(--dk-fg)", marginTop: 4 }}>{contract.days_remaining ?? "—"}</p></div>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="damage">Damage ({damages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-3 mt-4">
          <Button onClick={() => setShowEvtForm(true)} variant="outline" size="sm" className="gap-1"><Clock size={14} /> Add Event</Button>
          {events.length === 0 ? <p style={{ color: "var(--dk-fg-2)", fontSize: "var(--dk-text-sm)" }}>No events yet.</p> : (
            <div className="space-y-2">
              {events.map(ev => (
                <div key={ev.id} className="dk-card flex items-start gap-3 py-3">
                  <Clock size={16} style={{ color: "var(--dk-brand)", marginTop: 2 }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{ev.event_type.replace(/_/g, " ")}</p>
                    <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{new Date(ev.scheduled_at).toLocaleString()}</p>
                    {ev.driver_notes && <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-1)", marginTop: 4 }}>{ev.driver_notes}</p>}
                  </div>
                  {ev.completed_at && <span className="ml-auto dk-badge dk-badge-success">done</span>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="damage" className="space-y-3 mt-4">
          <Button onClick={() => setShowDmgForm(true)} variant="outline" size="sm" className="gap-1"><Wrench size={14} /> Report Damage</Button>
          {damages.length === 0 ? <p style={{ color: "var(--dk-fg-2)", fontSize: "var(--dk-text-sm)" }}>No damage reported.</p> : (
            <div className="space-y-2">
              {damages.map(d => (
                <div key={d.id} className="dk-card flex items-start gap-3 py-3">
                  <AlertTriangle size={16} style={{ color: "var(--dk-warning)", marginTop: 2 }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{d.description}</p>
                      <span className="dk-badge" style={{ background: d.severity === "severe" ? "var(--dk-danger-bg)" : d.severity === "moderate" ? "var(--dk-warning-bg)" : "var(--dk-gray-100)", color: d.severity === "severe" ? "var(--dk-danger)" : d.severity === "moderate" ? "var(--dk-warning)" : "var(--dk-gray-500)" }}>{d.severity}</span>
                    </div>
                    <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>Repair cost: ${d.repair_cost} {d.charged_to_customer ? "• Charged to customer" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Damage form dialog */}
      <Dialog open={showDmgForm} onOpenChange={setShowDmgForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report Damage</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Description *</Label><Input value={dmgForm.description} onChange={e => setDmgForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Severity</Label>
              <Select value={dmgForm.severity} onValueChange={v => setDmgForm(f => ({ ...f, severity: v as DamageSeverity }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Repair Cost ($)</Label><Input type="number" step="0.01" value={dmgForm.repair_cost} onChange={e => setDmgForm(f => ({ ...f, repair_cost: e.target.value }))} /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDmgForm(false)}>Cancel</Button>
              <Button onClick={submitDamage} disabled={saving} style={{ background: "var(--dk-brand)", color: "white" }}>{saving ? "Saving…" : "Submit"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event form dialog */}
      <Dialog open={showEvtForm} onOpenChange={setShowEvtForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Event</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Type</Label>
              <Select value={evtForm.event_type} onValueChange={v => setEvtForm(f => ({ ...f, event_type: v as LeaseEventType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["delivery","pickup","swap","maintenance_call","damage_report","inspection"] as LeaseEventType[]).map(t => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Scheduled At *</Label><Input type="datetime-local" value={evtForm.scheduled_at} onChange={e => setEvtForm(f => ({ ...f, scheduled_at: e.target.value }))} /></div>
            <div><Label>Notes</Label><Input value={evtForm.driver_notes} onChange={e => setEvtForm(f => ({ ...f, driver_notes: e.target.value }))} /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEvtForm(false)}>Cancel</Button>
              <Button onClick={submitEvent} disabled={saving} style={{ background: "var(--dk-brand)", color: "white" }}>{saving ? "Saving…" : "Add"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
