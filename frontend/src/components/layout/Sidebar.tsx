"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Truck, FileText, Trash2, MapPin, Calendar, MessageSquare
} from "lucide-react"

const nav = [
  { href: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/equipment", label: "Equipment",  icon: Truck },
  { href: "/leases",    label: "Leases",     icon: FileText },
  { href: "/waste",     label: "Waste Log",  icon: Trash2 },
  { href: "/sites",     label: "Sites",      icon: MapPin },
  { href: "/schedule",  label: "Schedule",   icon: Calendar },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside
      className="flex flex-col w-56 min-h-screen border-r"
      style={{ background: "var(--dk-white)", borderColor: "var(--dk-border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: "var(--dk-border)" }}>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: "var(--dk-brand)" }}
        >
          <Trash2 size={14} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: "var(--dk-text-sm)", color: "var(--dk-fg)" }}>
          DClaw Waste
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/" && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                active
                  ? "text-white"
                  : "hover:bg-gray-50"
              )}
              style={
                active
                  ? { background: "var(--dk-brand)", color: "white" }
                  : { color: "var(--dk-fg-1)" }
              }
            >
              <Icon size={16} />
              <span style={{ fontSize: "var(--dk-text-sm)", fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--dk-border)" }}>
        <p style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>DClaw Waste v1.2</p>
      </div>
    </aside>
  )
}
