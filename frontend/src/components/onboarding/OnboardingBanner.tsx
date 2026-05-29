"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle, Circle, Zap, X } from "lucide-react"

const DISMISS_KEY = "dclaw_onboarding_dismissed"

interface Step {
  label: string
  href: string
  done: boolean
}

interface Props {
  hasEquipment: boolean
  hasSites: boolean
  hasLeases: boolean
  hasWaste: boolean
  onSeed: () => void
  seeding: boolean
}

export default function OnboardingBanner({ hasEquipment, hasSites, hasLeases, hasWaste, onSeed, seeding }: Props) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true)
  }, [])

  const allDone = hasEquipment && hasSites && hasLeases && hasWaste
  if (dismissed || allDone) return null

  const steps: Step[] = [
    { label: "Add your first site", href: "/sites", done: hasSites },
    { label: "Add equipment to your fleet", href: "/equipment", done: hasEquipment },
    { label: "Create a lease contract", href: "/leases/new", done: hasLeases },
    { label: "Log a waste record", href: "/waste", done: hasWaste },
  ]

  const completedCount = steps.filter(s => s.done).length

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }

  return (
    <div className="rounded-xl p-5 mb-6" style={{ background: "var(--dk-bg-tint)", border: "1px solid var(--dk-border-brand)" }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="dk-eyebrow mb-1">Getting started</p>
          <h2 style={{ fontWeight: 700, fontSize: "var(--dk-text-lg)", color: "var(--dk-fg)" }}>
            Set up your waste management platform
          </h2>
          <p style={{ fontSize: "var(--dk-text-sm)", color: "var(--dk-fg-2)", marginTop: 2 }}>
            {completedCount} of {steps.length} steps complete
          </p>
        </div>
        <button onClick={dismiss} style={{ color: "var(--dk-fg-muted)" }}><X size={18} /></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {steps.map((step, i) => (
          <Link key={i} href={step.href}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors"
            style={{ background: step.done ? "var(--dk-success-bg)" : "var(--dk-white)", border: `1px solid ${step.done ? "var(--dk-success)" : "var(--dk-border)"}` }}
          >
            {step.done
              ? <CheckCircle size={15} style={{ color: "var(--dk-success)", flexShrink: 0 }} />
              : <Circle size={15} style={{ color: "var(--dk-gray-300)", flexShrink: 0 }} />
            }
            <span style={{ fontSize: "var(--dk-text-xs)", fontWeight: 500, color: step.done ? "var(--dk-success)" : "var(--dk-fg-1)" }}>
              {step.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
          style={{ background: "var(--dk-brand)", color: "white" }}
        >
          <Zap size={14} />
          {seeding ? "Loading demo…" : "Auto-fill with demo data"}
        </button>
        <span style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>
          Instantly populate all steps with realistic sample data
        </span>
      </div>
    </div>
  )
}
