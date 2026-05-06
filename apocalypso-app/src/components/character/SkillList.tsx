import type { Skill } from '@/types/character'

interface SkillListProps {
  skills: Record<string, Skill>
  onRoll?: (skillName: string, bonus: number) => void
  onIncrementUse?: (skillName: string) => void
}

export default function SkillList({ skills, onRoll, onIncrementUse }: SkillListProps) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_50px_60px_40px] gap-2 text-xs font-bold text-slate-500 px-2 pb-1 border-b border-slate-700">
        <span>Skill</span>
        <span className="text-center">Lvl</span>
        <span className="text-center">Progress</span>
        <span className="text-center">Max</span>
      </div>
      {Object.entries(skills).map(([name, skill]) => {
        const progressPercent = skill.threshold > 0
          ? (skill.uses / skill.threshold) * 100
          : 0

        return (
          <div
            key={name}
            className="grid grid-cols-[1fr_50px_60px_40px] gap-2 items-center px-2 py-1.5 rounded hover:bg-slate-800/50 group"
          >
            <button
              onClick={() => onRoll?.(name, skill.current)}
              className="text-left text-sm text-slate-200 hover:text-violet-300 transition cursor-pointer"
            >
              {name}
              <span className="text-xs text-slate-500 ml-1">
                ({skill.keyStat || '—'})
              </span>
            </button>

            <span className="text-center text-sm font-mono text-slate-200">
              {skill.current}
            </span>

            <div className="flex items-center gap-1">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
              {onIncrementUse && (
                <button
                  onClick={() => onIncrementUse(name)}
                  className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center bg-violet-600 hover:bg-violet-500 rounded text-xs text-white transition"
                >
                  +
                </button>
              )}
            </div>

            <span className="text-center text-xs text-slate-500 font-mono">
              {skill.max}
            </span>
          </div>
        )
      })}
    </div>
  )
}
