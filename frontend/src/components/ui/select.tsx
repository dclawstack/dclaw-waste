"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Context ───────────────────────────────────────────────────────────────────

type SelectCtx = {
  value: string
  selectedLabel: string
  onSelect: (value: string, label: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Ctx = React.createContext<SelectCtx>({
  value: "", selectedLabel: "", onSelect: () => {}, open: false, setOpen: () => {},
})

// ── Select (root) ─────────────────────────────────────────────────────────────

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  defaultValue?: string
}

function Select({ value = "", onValueChange, children, defaultValue }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const onSelect = (v: string, label: string) => {
    setSelectedLabel(label)
    onValueChange?.(v)
    setOpen(false)
  }

  return (
    <Ctx.Provider value={{ value, selectedLabel, onSelect, open, setOpen }}>
      <div ref={ref} style={{ position: "relative" }}>
        {children}
      </div>
    </Ctx.Provider>
  )
}

// ── SelectTrigger ─────────────────────────────────────────────────────────────

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(Ctx)
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <span className="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
        <ChevronDown size={14} className={cn("ml-2 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </button>
    )
  },
)
SelectTrigger.displayName = "SelectTrigger"

// ── SelectValue ───────────────────────────────────────────────────────────────

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, selectedLabel } = React.useContext(Ctx)
  const display = selectedLabel || value
  return (
    <span className={display ? "" : "text-muted-foreground"}>
      {display || placeholder || "Select..."}
    </span>
  )
}

// ── SelectContent ─────────────────────────────────────────────────────────────

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(Ctx)
    if (!open) return null
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1 top-full",
          className,
        )}
        {...props}
      >
        <div className="p-1 max-h-60 overflow-y-auto">{children}</div>
      </div>
    )
  },
)
SelectContent.displayName = "SelectContent"

// ── SelectItem ────────────────────────────────────────────────────────────────

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onSelect } = React.useContext(Ctx)
  const isSelected = selectedValue === value
  const label = typeof children === "string" ? children : value

  return (
    <div
      ref={ref}
      onClick={() => onSelect(value, label)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent font-medium",
        className,
      )}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex items-center">
          <Check size={12} />
        </span>
      )}
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

// ── SelectLabel (bonus) ───────────────────────────────────────────────────────

const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("py-1.5 pl-8 pr-2 text-xs font-semibold text-muted-foreground", className)} {...props} />
  ),
)
SelectLabel.displayName = "SelectLabel"

// ── SelectSeparator ───────────────────────────────────────────────────────────

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  ),
)
SelectSeparator.displayName = "SelectSeparator"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator }
