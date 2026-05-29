interface Series {
  values: number[]
  color: string
  label: string
}

interface Props {
  labels: string[]
  series: Series[]
  height?: number
  unit?: string
}

export default function TrendLineChart({ labels, series, height = 120, unit = "kg" }: Props) {
  if (!labels.length || !series.length) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dk-fg-2)", fontSize: "var(--dk-text-sm)" }}>
        No trend data yet
      </div>
    )
  }

  const allValues = series.flatMap(s => s.values)
  const maxV = Math.max(...allValues, 1)
  const w = 480
  const padL = 32
  const padR = 12
  const padT = 12
  const padB = 24
  const chartW = w - padL - padR
  const chartH = height - padT - padB
  const n = labels.length

  function xPos(i: number) { return padL + (i / (n - 1)) * chartW }
  function yPos(v: number) { return padT + chartH - (v / maxV) * chartH }

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={w} height={height} style={{ display: "block", minWidth: Math.max(w, n * 30) }}>
        {/* Y-axis guide lines */}
        {[0, 0.5, 1].map(p => {
          const y = padT + chartH * (1 - p)
          return (
            <g key={p}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="var(--dk-border)" strokeDasharray="3 3" />
              <text x={padL - 4} y={y + 4} textAnchor="end" style={{ fontSize: 9, fill: "var(--dk-fg-2)", fontFamily: "var(--dk-font-sans)" }}>
                {Math.round(maxV * p)}
              </text>
            </g>
          )
        })}

        {/* Lines */}
        {series.map(s => {
          const points = s.values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(" ")
          return (
            <g key={s.label}>
              <polyline points={points} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {s.values.map((v, i) => (
                <circle key={i} cx={xPos(i)} cy={yPos(v)} r={3} fill={s.color} />
              ))}
            </g>
          )
        })}

        {/* X-axis labels — every other one to avoid crowding */}
        {labels.map((l, i) => {
          if (n > 8 && i % 2 !== 0) return null
          return (
            <text key={i} x={xPos(i)} y={height - 4} textAnchor="middle" style={{ fontSize: 9, fill: "var(--dk-fg-2)", fontFamily: "var(--dk-font-sans)" }}>
              {l}
            </text>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {series.map(s => (
          <div key={s.label} className="flex items-center gap-1">
            <div className="w-3 h-0.5 rounded" style={{ background: s.color }} />
            <span style={{ fontSize: "var(--dk-text-xs)", color: "var(--dk-fg-2)" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
