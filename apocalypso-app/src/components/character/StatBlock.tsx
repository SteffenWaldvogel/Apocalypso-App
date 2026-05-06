import { type Stat, getModifier } from '@/types/character'

interface StatBlockProps {
  stats: Record<string, Stat>
  level: number
  onRoll?: (statName: string, modifier: number) => void
}

const STAT_LABELS: Record<string, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
  lck: 'LCK',
}

const STAT_COLORS: Record<string, string> = {
  str: 'border-red-500/50 hover:border-red-400',
  dex: 'border-green-500/50 hover:border-green-400',
  con: 'border-orange-500/50 hover:border-orange-400',
  int: 'border-blue-500/50 hover:border-blue-400',
  wis: 'border-cyan-500/50 hover:border-cyan-400',
  cha: 'border-pink-500/50 hover:border-pink-400',
  lck: 'border-violet-500/50 hover:border-violet-400',
}

export default function StatBlock({ stats, level, onRoll }: StatBlockProps) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Object.entries(stats).map(([key, stat]) => {
        const isLuck = key === 'lck'
        const mod = getModifier(stat, level, isLuck)
        const base = stat.score - stat.amplifier

        return (
          <button
            key={key}
            onClick={() => onRoll?.(key, mod)}
            className={`flex flex-col items-center p-3 bg-slate-800 border ${STAT_COLORS[key]} rounded-lg transition cursor-pointer hover:bg-slate-700`}
          >
            <span className="text-xs font-bold text-slate-400">
              {STAT_LABELS[key]}
            </span>
            <span className="text-2xl font-bold text-slate-100">
              {stat.score}
            </span>
            {stat.amplifier > 0 && (
              <span className="text-xs text-violet-400">
                {base} + {stat.amplifier}
              </span>
            )}
            <span className="text-sm font-medium text-amber-400 mt-1">
              +{mod}
            </span>
          </button>
        )
      })}
    </div>
  )
}
