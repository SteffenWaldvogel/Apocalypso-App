import type { ConditionType } from '@/types/combat'

interface ConditionBadgeProps {
  type: ConditionType
  roundsRemaining?: number | null
  onRemove?: () => void
}

const CONDITION_CONFIG: Record<ConditionType, { icon: string; label: string; color: string }> = {
  stunned: { icon: '⚡', label: 'Stunned', color: 'bg-yellow-900/40 border-yellow-500/50 text-yellow-300' },
  weakened: { icon: '🛡️', label: 'Weakened', color: 'bg-slate-700/40 border-slate-500/50 text-slate-300' },
  burning: { icon: '🔥', label: 'Burning', color: 'bg-orange-900/40 border-orange-500/50 text-orange-300' },
  slowed: { icon: '❄️', label: 'Slowed', color: 'bg-cyan-900/40 border-cyan-500/50 text-cyan-300' },
  bleeding: { icon: '🩸', label: 'Bleeding', color: 'bg-red-900/40 border-red-500/50 text-red-300' },
  prone: { icon: '🪓', label: 'Prone', color: 'bg-amber-900/40 border-amber-500/50 text-amber-300' },
  confused: { icon: '🌀', label: 'Confused', color: 'bg-purple-900/40 border-purple-500/50 text-purple-300' },
  disoriented: { icon: '🧠', label: 'Disoriented', color: 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300' },
  feared: { icon: '☠️', label: 'Feared', color: 'bg-gray-900/40 border-gray-500/50 text-gray-300' },
  restrained: { icon: '🕸️', label: 'Restrained', color: 'bg-stone-900/40 border-stone-500/50 text-stone-300' },
  taunted: { icon: '🔗', label: 'Taunted', color: 'bg-rose-900/40 border-rose-500/50 text-rose-300' },
  'anti-taunted': { icon: '🧿', label: 'Anti-Taunted', color: 'bg-teal-900/40 border-teal-500/50 text-teal-300' },
  sepsis: { icon: '🦠', label: 'Sepsis', color: 'bg-lime-900/40 border-lime-500/50 text-lime-300' },
  'gravity-warp': { icon: '🌪️', label: 'Gravity Warp', color: 'bg-violet-900/40 border-violet-500/50 text-violet-300' },
  exhausted: { icon: '💤', label: 'Exhausted', color: 'bg-zinc-900/40 border-zinc-500/50 text-zinc-300' },
}

export default function ConditionBadge({ type, roundsRemaining, onRemove }: ConditionBadgeProps) {
  const config = CONDITION_CONFIG[type]
  if (!config) return null

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${config.color} group`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {roundsRemaining !== null && roundsRemaining !== undefined && (
        <span className="font-mono text-xs opacity-70">({roundsRemaining})</span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 ml-1 w-3 h-3 flex items-center justify-center text-xs hover:text-white transition"
        >
          ×
        </button>
      )}
    </span>
  )
}
