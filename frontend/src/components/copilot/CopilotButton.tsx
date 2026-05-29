"use client"

import { useState } from "react"
import { Bot, X } from "lucide-react"
import CopilotPanel from "./CopilotPanel"

export default function CopilotButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && <CopilotPanel onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center z-50 transition-transform hover:scale-110 active:scale-95"
        style={{ background: "var(--dk-brand)", boxShadow: "var(--dk-shadow-brand)" }}
        title="Open Waste Copilot"
      >
        {open ? <X size={20} color="white" /> : <Bot size={20} color="white" />}
      </button>
    </>
  )
}
