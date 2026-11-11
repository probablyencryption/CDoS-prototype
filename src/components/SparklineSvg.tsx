interface Props {
  values: number[]
}

// Inline sparkline of prior-session trust scores (Historical Trust layer).
export default function SparklineSvg({ values }: Props) {
  const width = 240
  const height = 40
  const pad = 3
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = (width - pad * 2) / (values.length - 1)
  const points = values.map((v, i) => ({
    x: pad + i * step,
    y: height - pad - ((v - min) / span) * (height - pad * 2),
  }))
  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
  const last = points[points.length - 1]
  const area = `${line} L${last.x.toFixed(1)},${height - pad} L${pad},${height - pad} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-2 h-10 w-full"
      role="img"
      aria-label={`Trust score across ${values.length} prior verified sessions`}
    >
      <path d={area} fill="#34D399" opacity={0.1} />
      <path
        d={line}
        fill="none"
        stroke="#34D399"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={2.2} fill="#34D399" />
    </svg>
  )
}
