import type { CombatState } from '@/types/combat'

interface InitiativeTrackerProps {
  combat: CombatState
  onNextTurn?: () => void
  onEndCombat?: () => void
}

export default function InitiativeTracker({ combat, onNextTurn, onEndCombat }: InitiativeTrackerProps) {
  if (!combat.active) return null

  return (
    <div className="bg-slate-900 border border-red-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h3 className="text-sm font-bold text-red-300">COMBAT</h3>
          <span className="text-xs text-slate-400">Round {combat.round}</span>
        </div>
        <div className="flex gap-2">
          {onNextTurn && (
            <button
              onClick={onNextTurn}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 rounded transition"
            >
              Next Turn
            </button>
          )}
          {onEndCombat && (
            <button
              onClick={onEndCombat}
              className="px-3 py-1 bg-red-900/50 hover:bg-red-800 border border-red-600/50 text-sm text-red-300 rounded transition"
            >
              End Combat
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {combat.initiative.map((entry, i) => {
          const isActive = i === combat.currentTurnIndex

          return (
            <div
              key={entry.characterId}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-violet-900/30 border border-violet-500/50'
                  : 'bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                {isActive && (
                  <div className="w-2 h-2 bg-violet-400 rounded-full" />
                )}
                <span className={`text-sm ${isActive ? 'text-violet-200 font-bold' : 'text-slate-300'}`}>
                  {entry.name}
                </span>
                {entry.isNpc && (
                  <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                    NPC
                  </span>
                )}
              </div>
              <span className="text-sm font-mono text-slate-400">
                {entry.roll}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
