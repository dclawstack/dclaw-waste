"use client"

import { useEffect, useState } from "react"
import { listJobs, createJob, completeJob, deleteJob, listSites, CollectionJob, JobType, TimeWindow, JobStatus, Site } from "@/lib/api"
import { Plus, CheckCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const JOB_TYPES: JobType[] = ["regular_collection","delivery","swap","pickup","emergency"]
const STATUS_STYLE: Record<JobStatus, { bg: string; color: string }> = {
  scheduled:   { bg: "var(--dk-info-bg)",    color: "var(--dk-info)" },
  in_progress: { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  completed:   { bg: "var(--dk-success-bg)", color: "var(--dk-success)" },
  cancelled:   { bg: "var(--dk-gray-100)",   color: "var(--dk-gray-500)" },
}

export default function SchedulePage() {
  const [jobs, setJobs] = useState<CollectionJob[]>([])
  const [total, setTotal] = useState(0)
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ site_id: "", job_type: "regular_collection" as JobType, scheduled_date: "", time_window: "anytime" as TimeWindow, driver_notes: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function load(status?: JobStatus | "") {
    setLoading(true)
    try {
      const params: Record<string, string> = { limit: "100" }
      if (status) params.status = status
      const [jData, sData] = await Promise.all([listJobs(params), listSites({ active_only: "true", limit: "100" })])
      setJobs(jData.items); setTotal(jData.total); setSites(sData.items)
    } catch { setError("Failed to load schedule") }
    finally { setLoading(false) }
  }

  useEffect(() => { load(statusFilter) }, [statusFilter])

  async function handleComplete(id: string) {
    try { await completeJob(id); load(statusFilter) }
    catch { setError("Failed to mark complete") }
  }

  async function handleDelete(id: string) {
    if (!confirm("Cancel this job?")) return
    try { await deleteJob(id); load(statusFilter) }
    catch { setError("Delete failed") }
  }

  async function handleCreate() {
    if (!form.site_id) { setError("Select a site"); return }
    if (!form.scheduled_date) { setError("Pick a date"); return }
    setSaving(true); setError("")
    try {
      await createJob(form)
      setShowForm(false); setForm({ site_id: "", job_type: "regular_collection", scheduled_date: "", time_window: "anytime", driver_notes: "" })
      load(statusFilter)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const grouped = jobs.reduce<Record<string, CollectionJob[]>>((acc, j) => {
    const d = j.scheduled_date
    if (!acc[d]) acc[d] = []
    acc[d].push(j)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className="dk-eyebrow mb-1">Operations</p><h1 className="dk-h4">Schedule <span style={{ color: "var(--dk-fg-2)", fontWeight: 400 }}>({total})</span></h1></div>
        <Button onClick={() => setShowForm(true)} style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}><Plus size={16} className="mr-1" /> New Job</Button>
      </div>
      {error && <div className="p-3 rounded-xl text-sm" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>{error}</div>}

      {/* Filters */}
      <div className="flex gap-2">
        {(["", "scheduled", "in_progress", "completed", "cancelled"] as (JobStatus | "")[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-full text-sm"
            style={statusFilter === s ? { background: "var(--dk-brand)", color: "white", fontWeight: 600 } : { background: "var(--dk-gray-100)", color: "var(--dk-fg-2)" }}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse" style={{ height: 200, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />
      ) : sortedDates.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--dk-fg-2)" }}>No jobs. Schedule a collection.</div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map(d => {
            const today = new Date().toISOString().slice(0, 10)
            const isToday = d === today
            const isPast = d < today
            return (
              <div key={d}>
                <div className="flex items-center gap-3 mb-3">
                  <Calendar size={16} style={{ color: "var(--dk-brand)" }} />
                  <span style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: isPast ? "var(--dk-danger)" : isToday ? "var(--dk-brand)" : "var(--dk-fg)" }}>
                    {isToday ? "Today — " : ""}{new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    {isPast && !isToday && " (overdue)"}
                  </span>
                </div>
                <div className="space-y-2">
                  {grouped[d].map(job => {
                    const ss = STATUS_STYLE[job.status]
                    const site = sites.find(s => s.id === job.site_id)
                    return (
                      <div key={job.id} className="dk-card flex items-center gap-4 py-3">
                        <span className="dk-badge" style={{ background: ss.bg, color: ss.color }}>{job.status}</span>
                        <div className="flex-1">
                          <p style={{ fontWeight: 600, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>{job.job_type.replace(/_/g, " ")}</p>
                          <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{site?.name || job.site_id.slice(0,8)} · {job.time_window}</p>
                          {job.driver_notes && <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-1)", marginTop: 2 }}>{job.driver_notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          {job.status === "scheduled" && (
                            <button onClick={() => handleComplete(job.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-success)", background: "var(--dk-success-bg)" }}>
                              <CheckCircle size={12} /> Done
                            </button>
                          )}
                          <button onClick={() => handleDelete(job.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-danger)", background: "var(--dk-danger-bg)" }}>Cancel</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Collection Job</DialogTitle></DialogHeader>
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
                <Label>Job Type</Label>
                <Select value={form.job_type} onValueChange={v => setForm(f => ({ ...f, job_type: v as JobType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{JOB_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time Window</Label>
                <Select value={form.time_window} onValueChange={v => setForm(f => ({ ...f, time_window: v as TimeWindow }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="anytime">Anytime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Scheduled Date *</Label><Input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} /></div>
            <div><Label>Driver Notes</Label><Input value={form.driver_notes} onChange={e => setForm(f => ({ ...f, driver_notes: e.target.value }))} /></div>
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
