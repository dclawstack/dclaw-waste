"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getStoredUser, clearAuth, type AuthUser } from "@/lib/auth"
import {
  LayoutDashboard, Truck, FileText, Trash2, MapPin, Calendar,
  Users, Leaf, Receipt, AlertTriangle, Menu, X, Award, LogOut, User,
} from "lucide-react"

const nav = [
  { href: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/equipment", label: "Equipment",  icon: Truck },
  { href: "/leases",    label: "Leases",     icon: FileText },
  { href: "/invoices",  label: "Invoices",   icon: Receipt },
  { href: "/waste",     label: "Waste Log",  icon: Trash2 },
  { href: "/hazmat",    label: "Hazmat",     icon: AlertTriangle },
  { href: "/sites",     label: "Sites",      icon: MapPin },
  { href: "/schedule",  label: "Schedule",   icon: Calendar },
  { href: "/vendors",   label: "Vendors",    icon: Users },
  { href: "/carbon",    label: "Carbon",     icon: Leaf },
  { href: "/esg",       label: "ESG Report", icon: Award },
]

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => { setUser(getStoredUser()) }, [])

  function handleLogout() {
    clearAuth()
    router.push("/login")
  }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-4 border-b" style={{ borderColor: "var(--dk-border)" }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "var(--dk-brand)" }}>
          <Trash2 size={14} color="white" />
        </div>
        <div className="min-w-0">
          <p style={{ fontWeight: 700, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)", lineHeight: 1.2 }}>DClaw Waste</p>
          {user && <p style={{ fontSize: "10px", color: "var(--dk-fg-2)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.organization_name}</p>}
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/" && path.startsWith(href))
          return (
            <Link key={href} href={href} onClick={onLinkClick}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
              style={active ? { background: "var(--dk-brand)", color: "white" } : { color: "var(--dk-fg-1)" }}
            >
              <Icon size={15} />
              <span style={{ fontSize: "var(--dk-text-sm)", fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-3 border-t space-y-1" style={{ borderColor: "var(--dk-border)" }}>
        {user ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--dk-brand-soft)" }}>
                <User size={12} style={{ color: "var(--dk-brand)" }} />
              </div>
              <div className="min-w-0">
                <p style={{ fontSize: "var(--dk-text-xs)", fontWeight: 600, color: "var(--dk-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.full_name}</p>
                <p style={{ fontSize: "10px", color: "var(--dk-fg-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 w-full rounded-lg" style={{ color: "var(--dk-fg-2)", fontSize: "var(--dk-text-xs)" }}>
              <LogOut size={12} /> Sign out
            </button>
          </>
        ) : (
          <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ color: "var(--dk-fg-2)", fontSize: "var(--dk-text-xs)" }}>
            <User size={12} /> Sign in
          </Link>
        )}
        <p style={{ fontSize: "10px", color: "var(--dk-fg-muted)", paddingLeft: 12 }}>v1.4 · YC-Ready</p>
      </div>
    </>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 min-h-screen border-r flex-shrink-0"
        style={{ background: "var(--dk-white)", borderColor: "var(--dk-border)" }}
      >
        <NavContent />
      </aside>

      {/* Mobile: top bar with hamburger */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b"
        style={{ background: "var(--dk-white)", borderColor: "var(--dk-border)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--dk-brand)" }}>
            <Trash2 size={12} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>DClaw Waste</span>
        </div>
        <button onClick={() => setMobileOpen(true)} style={{ color: "var(--dk-fg-1)" }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <aside
            className="relative flex flex-col w-64 min-h-screen z-10"
            style={{ background: "var(--dk-white)" }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4"
              style={{ color: "var(--dk-fg-2)" }}
            >
              <X size={20} />
            </button>
            <NavContent onLinkClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile spacer so content isn't under the top bar */}
      <div className="md:hidden h-14 flex-shrink-0" style={{ display: "block" }} />
    </>
  )
}
