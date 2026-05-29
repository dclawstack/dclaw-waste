import Sidebar from "@/components/layout/Sidebar"
import CopilotButton from "@/components/copilot/CopilotButton"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--dk-bg-muted)" }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
      <CopilotButton />
    </div>
  )
}
