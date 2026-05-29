interface BarData {
  label: string
  value: number
  color?: string
}

interface Props {
  data: BarData[]
  height?: number
  unit?: string
}

const PALETTE = [
  "var(--dk-brand)", "var(--dk-success)", "var(--dk-warning)",
  "var(--dk-danger)", "var(--dk-info)", "var(--dk-purple-400)",
]

export default function WasteBarChart({ data, height = 140, unit = "kg" }: Props) {
  if (!data.length) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dk-fg-2)", fontSize: "var(--dk-text-sm)" }}>No data</div>

  const max = Math.max(...data.map(d => d.value), 1)
  const barW = Math.max(24, Math.min(48, 240 / data.length))
  const gap = 8
  const svgWidth = data.length * (barW + gap) + gap
  const svgHeight = height

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={svgWidth} height={svgHeight} style={{ display: "block" }}>
        {data.map((d, i) => {
          const barH = Math.max(4, ((d.value / max) * (svgHeight - 36)))
          const x = gap + i * (barW + gap)
          const y = svgHeight - 20 - barH
          const color = d.color ?? PALETTE[i % PALETTE.length]
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.85} />
              <text x={x + barW / 2} y={svgHeight - 6} textAnchor="middle"
                style={{ fontSize: 10, fill: "var(--dk-fg-2)", fontFamily: "var(--dk-font-sans)" }}>
                {d.label.length > 7 ? d.label.slice(0, 6) + "…" : d.label}
              </text>
              <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                style={{ fontSize: 9, fill: "var(--dk-fg-2)", fontFamily: "var(--dk-font-sans)" }}>
                {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}t` : `${Math.round(d.value)}`}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
