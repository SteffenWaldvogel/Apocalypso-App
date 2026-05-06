interface CorruptionMeterProps {
  current: number
  onChange?: (value: number) => void
}

export default function CorruptionMeter({ current, onChange }: CorruptionMeterProps) {
  const thresholds = [25, 50, 75, 100]

  function getColor(): string {
    if (current >= 75) return '#ec4899'
    if (current >= 50) return '#dc2626'
    if (current >= 25) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">Corruption</span>
        <div className="flex items-center gap-1">
          {onChange && (
            <button
              onClick={() => onChange(Math.max(0, current - 5))}
              className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
            >
              -
            </button>
          )}
          <span className="text-slate-200 font-mono text-sm">{current}%</span>
          {onChange && (
            <button
              onClick={() => onChange(Math.min(100, current + 5))}
              className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
            >
              +
            </button>
          )}
        </div>
      </div>
      <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${current}%`, backgroundColor: getColor() }}
        />
        {thresholds.map((t) => (
          <div
            key={t}
            className="absolute top-0 h-full w-px bg-slate-500"
            style={{ left: `${t}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500 px-1">
        {thresholds.map((t) => (
          <span key={t} className={current >= t ? 'text-pink-400' : ''}>
            {t}%
          </span>
        ))}
      </div>
    </div>
  )
}
