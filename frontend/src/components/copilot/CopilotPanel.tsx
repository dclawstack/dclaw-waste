"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Bot } from "lucide-react"
import { chatWithCopilot, CopilotResponse } from "@/lib/api"

type Message = { role: "user" | "assistant"; content: string; suggestions?: string[] }

interface Props {
  onClose: () => void
  pageContext?: string
}

export default function CopilotPanel({ onClose, pageContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your DClaw Waste Copilot. Ask me about leases, equipment, schedules, or waste data.", suggestions: ["What leases are expiring?", "How many jobs today?", "Show waste summary"] },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: msg }])
    setLoading(true)
    try {
      const res: CopilotResponse = await chatWithCopilot(msg, pageContext)
      setMessages(prev => [...prev, { role: "assistant", content: res.reply, suggestions: res.suggestions }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't reach the server. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed bottom-20 right-5 w-80 flex flex-col rounded-xl overflow-hidden z-50"
      style={{ boxShadow: "var(--dk-shadow-lg)", background: "var(--dk-white)", border: "1px solid var(--dk-border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--dk-brand)" }}>
        <div className="flex items-center gap-2">
          <Bot size={16} color="white" />
          <span style={{ color: "white", fontWeight: 600, fontSize: "var(--dk-text-sm)" }}>Waste Copilot</span>
        </div>
        <button onClick={onClose} style={{ color: "rgba(255,255,255,0.8)" }}>
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 340, minHeight: 200 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <div
              className={`rounded-lg px-3 py-2 text-sm max-w-[90%] ${m.role === "user" ? "ml-auto" : ""}`}
              style={
                m.role === "user"
                  ? { background: "var(--dk-brand)", color: "white" }
                  : { background: "var(--dk-gray-100)", color: "var(--dk-fg-1)" }
              }
            >
              {m.content}
            </div>
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {m.suggestions.map((s, si) => (
                  <button
                    key={si}
                    onClick={() => send(s)}
                    className="text-xs px-2 py-1 rounded-full border transition-colors"
                    style={{ borderColor: "var(--dk-border-brand)", color: "var(--dk-brand)", background: "var(--dk-brand-soft)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 items-center px-3 py-2 rounded-lg" style={{ background: "var(--dk-gray-100)" }}>
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--dk-gray-400)", animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-3 border-t" style={{ borderColor: "var(--dk-border)" }}>
        <input
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none border"
          style={{ borderColor: "var(--dk-border)", fontSize: "var(--dk-text-sm)", fontFamily: "var(--dk-font-sans)" }}
          placeholder="Ask anything…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-opacity"
          style={{ background: "var(--dk-brand)" }}
        >
          <Send size={14} color="white" />
        </button>
      </div>
    </div>
  )
}
