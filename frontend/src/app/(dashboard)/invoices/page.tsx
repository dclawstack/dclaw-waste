"use client"

import { useEffect, useState } from "react"
import { listInvoices, markInvoicePaid, deleteInvoice, generateInvoicesForContract, listLeases, Invoice, InvoiceStatus, LeaseContract } from "@/lib/api"
import { useToast } from "@/lib/toast"
import { Plus, Receipt, CheckCircle, ExternalLink } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_STYLE: Record<InvoiceStatus, { bg: string; color: string }> = {
  draft:   { bg: "var(--dk-gray-100)",    color: "var(--dk-gray-500)" },
  sent:    { bg: "var(--dk-info-bg)",     color: "var(--dk-info)" },
  paid:    { bg: "var(--dk-success-bg)",  color: "var(--dk-success)" },
  overdue: { bg: "var(--dk-danger-bg)",   color: "var(--dk-danger)" },
}

export default function InvoicesPage() {
  const toast = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [total, setTotal] = useState(0)
  const [leases, setLeases] = useState<LeaseContract[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenForm, setShowGenForm] = useState(false)
  const [selectedContract, setSelectedContract] = useState("")
  const [generating, setGenerating] = useState(false)

  async function load() {
    try {
      const [inv, lss] = await Promise.all([listInvoices({ limit: "100" }), listLeases({ status: "active", limit: "50" })])
      setInvoices(inv.items); setTotal(inv.total); setLeases(lss.items)
    } catch { toast.error("Failed to load invoices") }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handlePay(id: string) {
    try { await markInvoicePaid(id); toast.success("Invoice marked as paid"); load() }
    catch (e: any) { toast.error(e.message) }
  }

  async function handlePaymentLink(id: string) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/invoices/${id}/payment-link`, { method: "POST" })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      window.open(data.payment_url, "_blank")
      if (data.is_demo) toast.warning("Demo payment link — configure STRIPE_API_KEY for real payments")
      else toast.success("Payment link opened")
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete invoice?")) return
    try { await deleteInvoice(id); toast.success("Deleted"); load() }
    catch { toast.error("Delete failed") }
  }

  async function handleGenerate() {
    if (!selectedContract) { toast.error("Select a contract"); return }
    setGenerating(true)
    try {
      await generateInvoicesForContract(selectedContract)
      toast.success("Invoice generated"); setShowGenForm(false); load()
    } catch (e: any) { toast.error(e.message) }
    finally { setGenerating(false) }
  }

  const totalOutstanding = invoices
    .filter(i => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.total), 0)

  if (loading) return <div className="animate-pulse" style={{ height: 200, background: "var(--dk-gray-100)", borderRadius: "var(--dk-radius-lg)" }} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="dk-eyebrow mb-1">Billing</p>
          <h1 className="dk-h4">Invoices <span style={{ color: "var(--dk-fg-2)", fontWeight: 400 }}>({total})</span></h1>
        </div>
        <Button onClick={() => setShowGenForm(true)} style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}>
          <Plus size={16} className="mr-1" /> Generate Invoice
        </Button>
      </div>

      {totalOutstanding > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--dk-warning-bg)" }}>
          <Receipt size={16} style={{ color: "var(--dk-warning)" }} />
          <span style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-warning)", fontWeight: 500 }}>
            ${totalOutstanding.toFixed(2)} outstanding across {invoices.filter(i => i.status !== "paid").length} invoices
          </span>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--dk-fg-2)" }}>No invoices yet. Generate one from an active lease.</div>
      ) : (
        <div className="dk-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dk-border)", background: "var(--dk-gray-50)" }}>
                  {["Contract","Period","Base","Damage","Total","Status","Due",""].map(h => (
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const ss = STATUS_STYLE[inv.status]
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--dk-border)" }}>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", fontFamily: "var(--dk-font-mono)", color: "var(--dk-fg-2)" }}>{inv.contract_id.slice(0, 8)}…</td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{inv.period_start} → {inv.period_end}</td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>${Number(inv.base_amount).toFixed(2)}</td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-sm)", color: Number(inv.damage_charges) > 0 ? "var(--dk-danger)" : "var(--dk-fg-2)" }}>+${Number(inv.damage_charges).toFixed(2)}</td>
                      <td className="px-4 py-3" style={{ fontWeight: 700, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>${Number(inv.total).toFixed(2)}</td>
                      <td className="px-4 py-3"><span className="dk-badge" style={{ background: ss.bg, color: ss.color }}>{inv.status}</span></td>
                      <td className="px-4 py-3" style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{inv.due_date}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {inv.status !== "paid" && (
                            <>
                              <button onClick={() => handlePaymentLink(inv.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-brand)", background: "var(--dk-brand-soft)" }}>
                                <ExternalLink size={11} /> Pay
                              </button>
                              <button onClick={() => handlePay(inv.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-success)", background: "var(--dk-success-bg)" }}>
                                <CheckCircle size={11} /> Mark
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDelete(inv.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dk-danger)", background: "var(--dk-danger-bg)" }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showGenForm} onOpenChange={setShowGenForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Active Lease Contract</Label>
              <Select value={selectedContract} onValueChange={setSelectedContract}>
                <SelectTrigger><SelectValue placeholder="Select contract" /></SelectTrigger>
                <SelectContent>
                  {leases.map(l => <SelectItem key={l.id} value={l.id}>{l.customer_name} — ${Number(l.monthly_rate).toFixed(2)}/mo</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>
              A draft invoice will be created for the current calendar month with base amount from the lease rate.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowGenForm(false)}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={generating} style={{ background: "var(--dk-brand)", color: "white" }}>{generating ? "Generating…" : "Generate"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
