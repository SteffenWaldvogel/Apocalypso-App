import { useState } from 'react'
import { rollDice } from '@/lib/dice'
import type { DiceRollResult } from '@/types/chat'

interface DiceRollerProps {
  onRoll: (result: DiceRollResult, description: string) => void
}

const QUICK_ROLLS = ['1d20', '2d10', '1d6', '1d8', '1d10', '1d12', '2d6', '3d6']

export default function DiceRoller({ onRoll }: DiceRollerProps) {
  const [formula, setFormula] = useState('1d20')
  const [modifier, setModifier] = useState(0)
  const [dc, setDc] = useState<number | undefined>(undefined)
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null)

  function handleRoll() {
    const result = rollDice(formula, modifier, dc)
    setLastResult(result)
    onRoll(result, `Custom: ${formula}${modifier ? ` + ${modifier}` : ''}`)
  }

  function handleQuickRoll(f: string) {
    const result = rollDice(f, modifier, dc)
    setLastResult(result)
    onRoll(result, `Quick: ${f}${modifier ? ` + ${modifier}` : ''}`)
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-400">Dice Roller</h3>

      {/* Quick roll buttons */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_ROLLS.map((f) => (
          <button
            key={f}
            onClick={() => handleQuickRoll(f)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-mono text-slate-300 transition"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Custom formula */}
      <div className="flex gap-2">
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="e.g. 2d6+3"
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 font-mono focus:outline-none focus:border-violet-500"
        />
        <input
          type="number"
          value={modifier}
          onChange={(e) => setModifier(Number(e.target.value))}
          placeholder="+mod"
          className="w-16 px-2 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 font-mono text-center focus:outline-none focus:border-violet-500"
        />
        <input
          type="number"
          value={dc ?? ''}
          onChange={(e) => setDc(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="DC"
          className="w-14 px-2 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 font-mono text-center focus:outline-none focus:border-violet-500"
        />
        <button
          onClick={handleRoll}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded transition"
        >
          Roll
        </button>
      </div>

      {/* Result display */}
      {lastResult && (
        <div className={`p-3 rounded-lg border ${
          lastResult.isNat20 ? 'bg-amber-900/30 border-amber-500/50' :
          lastResult.isNat1 ? 'bg-red-900/30 border-red-500/50' :
          lastResult.success === true ? 'bg-green-900/20 border-green-500/30' :
          lastResult.success === false ? 'bg-red-900/20 border-red-500/30' :
          'bg-slate-800 border-slate-600'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">{lastResult.formula}</span>
            {lastResult.vsDC !== undefined && (
              <span className="text-xs text-slate-400">vs DC {lastResult.vsDC}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-3xl font-bold ${
              lastResult.isNat20 ? 'text-amber-400' :
              lastResult.isNat1 ? 'text-red-400' :
              'text-slate-100'
            }`}>
              {lastResult.total}
            </span>
            {lastResult.isNat20 && <span className="text-amber-400 text-sm font-bold">CRIT!</span>}
            {lastResult.isNat1 && <span className="text-red-400 text-sm font-bold">FUMBLE!</span>}
            {lastResult.success === true && !lastResult.isNat20 && (
              <span className="text-green-400 text-sm">Success</span>
            )}
            {lastResult.success === false && !lastResult.isNat1 && (
              <span className="text-red-400 text-sm">Failure</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            [{lastResult.rolls.join(', ')}]{lastResult.modifier ? ` + ${lastResult.modifier}` : ''}
          </div>
        </div>
      )}
    </div>
  )
}
