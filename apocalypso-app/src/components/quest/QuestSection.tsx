import { useState } from 'react'
import QuestPanel from './QuestPanel'

export default function QuestSection() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border-b border-slate-700 flex-shrink-0">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 transition">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Quests</span>
        <span className="text-xs text-slate-500">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded && <div className="px-3 pb-3"><QuestPanel quests={[]} /></div>}
    </div>
  )
}
