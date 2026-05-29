interface Props {
  diverted: number
  total: number
  size?: number
}

export default function DiversionDonut({ diverted, total, size = 120 }: Props) {
  const pct = total > 0 ? diverted / total : 0
  const r = 42
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--dk-gray-100)" strokeWidth={14} />
        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--dk-success)"
          strokeWidth={14}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Centre label */}
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 20, fontWeight: 700, fill: "var(--dk-fg)", fontFamily: "var(--dk-font-sans)" }}>
          {Math.round(pct * 100)}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 10, fill: "var(--dk-fg-2)", fontFamily: "var(--dk-font-sans)" }}>
          diverted
        </text>
      </svg>
    </div>
  )
}
