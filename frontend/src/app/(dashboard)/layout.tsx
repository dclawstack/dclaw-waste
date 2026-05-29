import Sidebar from "@/components/layout/Sidebar"
import CopilotButton from "@/components/copilot/CopilotButton"
import { ToastProvider } from "@/lib/toast"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen" style={{ background: "var(--dk-bg-muted)" }}>
        <Sidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
        <CopilotButton />
      </div>
    </ToastProvider>
  )
}
