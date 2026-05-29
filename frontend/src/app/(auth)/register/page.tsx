"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { saveAuth } from "@/lib/auth"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "", full_name: "", organization_name: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return }
    setLoading(true); setError("")
    try {
      const resp = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.detail || "Registration failed")
      }
      const data = await resp.json()
      saveAuth(data.access_token, data.user)
      router.push("/")
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="dk-card space-y-5">
      <div>
        <h1 style={{ fontWeight: 700, fontSize: "var(--dk-text-2xl)", color: "var(--dk-fg)", marginBottom: 4 }}>Create account</h1>
        <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)" }}>Start managing waste smarter</p>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg text-sm" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Jane Smith" />
        </div>
        <div>
          <Label>Organization / Company</Label>
          <Input required value={form.organization_name} onChange={e => setForm(f => ({ ...f, organization_name: e.target.value }))} placeholder="Green Haulers Inc." />
        </div>
        <div>
          <Label>Work Email</Label>
          <Input type="email" required autoComplete="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" />
        </div>
        <div>
          <Label>Password (min 8 characters)</Label>
          <Input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
        </div>
        <Button type="submit" disabled={loading} className="w-full" style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)", textAlign: "center" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--dk-brand)", fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  )
}
