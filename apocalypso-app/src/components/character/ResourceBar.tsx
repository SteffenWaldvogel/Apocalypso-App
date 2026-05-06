interface ResourceBarProps {
  label: string
  current: number
  max: number
  color: string
  onChange?: (value: number) => void
}

export default function ResourceBar({ label, current, max, color, onChange }: ResourceBarProps) {
  const percent = max > 0 ? (current / max) * 100 : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <div className="flex items-center gap-1">
          {onChange && (
            <button
              onClick={() => onChange(Math.max(0, current - 1))}
              className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
            >
              -
            </button>
          )}
          <span className="text-slate-200 font-mono text-sm min-w-[60px] text-center">
            {current} / {max}
          </span>
          {onChange && (
            <button
              onClick={() => onChange(Math.min(max, current + 1))}
              className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
            >
              +
            </button>
          )}
        </div>
      </div>
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
