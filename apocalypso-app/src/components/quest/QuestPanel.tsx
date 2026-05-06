interface Quest {
  id: string
  objective: string
  timeRemaining: string
  penalty: string
  reward: string
  recommendedLevel: number
  status: 'active' | 'complete' | 'failed'
  assignedTo: string[]
}

interface QuestPanelProps {
  quests: Quest[]
  onComplete?: (questId: string) => void
  onFail?: (questId: string) => void
}

export default function QuestPanel({ quests, onComplete, onFail }: QuestPanelProps) {
  const activeQuests = quests.filter((q) => q.status === 'active')

  if (activeQuests.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        <p className="text-sm text-slate-500 text-center">No active quests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activeQuests.map((quest) => (
        <div
          key={quest.id}
          className="bg-slate-900 border border-amber-800/40 rounded-xl p-4 space-y-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <h4 className="text-sm font-bold text-amber-300">DAILY QUEST</h4>
            </div>
            <span className="text-xs text-slate-400">Lvl {quest.recommendedLevel}</span>
          </div>

          <p className="text-sm text-slate-200">{quest.objective}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Time: </span>
              <span className="text-slate-300 font-mono">{quest.timeRemaining}</span>
            </div>
            <div>
              <span className="text-slate-500">Reward: </span>
              <span className="text-green-400">{quest.reward}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Penalty: </span>
              <span className="text-red-400 font-medium">{quest.penalty}</span>
            </div>
          </div>

          {(onComplete || onFail) && (
            <div className="flex gap-2 pt-1">
              {onComplete && (
                <button
                  onClick={() => onComplete(quest.id)}
                  className="px-3 py-1 bg-green-900/50 hover:bg-green-800 border border-green-600/50 text-xs text-green-300 rounded transition"
                >
                  Complete
                </button>
              )}
              {onFail && (
                <button
                  onClick={() => onFail(quest.id)}
                  className="px-3 py-1 bg-red-900/50 hover:bg-red-800 border border-red-600/50 text-xs text-red-300 rounded transition"
                >
                  Failed
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
