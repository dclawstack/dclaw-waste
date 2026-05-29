"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { saveAuth } from "@/lib/auth"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const resp = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.detail || "Login failed")
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
        <h1 style={{ fontWeight: 700, fontSize: "var(--dk-text-2xl)", color: "var(--dk-fg)", marginBottom: 4 }}>Sign in</h1>
        <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)" }}>Access your waste management platform</p>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg text-sm" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" required autoComplete="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" required autoComplete="current-password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
        </div>
        <Button type="submit" disabled={loading} className="w-full" style={{ background: "var(--dk-brand)", color: "white", borderRadius: "var(--dk-radius-pill)" }}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)", textAlign: "center" }}>
        No account?{" "}
        <Link href="/register" style={{ color: "var(--dk-brand)", fontWeight: 600 }}>Create one</Link>
      </p>

      {/* Demo shortcut */}
      <div className="pt-2 border-t" style={{ borderColor: "var(--dk-border)" }}>
        <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)", textAlign: "center", marginBottom: 8 }}>Demo access — skip login</p>
        <button
          onClick={() => router.push("/")}
          className="w-full py-2 rounded-lg text-sm"
          style={{ background: "var(--dk-gray-100)", color: "var(--dk-fg-1)" }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  )
}
