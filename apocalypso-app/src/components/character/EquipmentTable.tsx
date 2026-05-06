import type { EquipmentItem } from '@/types/character'

interface EquipmentTableProps {
  items: EquipmentItem[]
  onAttack?: (item: EquipmentItem) => void
  onDurabilityChange?: (index: number, delta: number) => void
}

export default function EquipmentTable({ items, onAttack, onDurabilityChange }: EquipmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-700">
            <th className="text-left py-2 px-2">Name</th>
            <th className="text-center px-1">Hit</th>
            <th className="text-center px-1">Dmg</th>
            <th className="text-center px-1">Type</th>
            <th className="text-center px-1">AC</th>
            <th className="text-center px-1">Dur</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const durPercent = item.maxDurability > 0
              ? (item.durability / item.maxDurability) * 100
              : 100
            const isBroken = item.durability <= 0
            const isLow = durPercent <= 25 && !isBroken

            return (
              <tr
                key={i}
                className={`border-b border-slate-800 hover:bg-slate-800/50 ${isBroken ? 'opacity-40' : ''}`}
              >
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    {item.toHit !== null && onAttack && !isBroken && (
                      <button
                        onClick={() => onAttack(item)}
                        className="w-6 h-6 flex items-center justify-center bg-red-900/50 hover:bg-red-800 border border-red-600/50 rounded text-xs"
                        title="Attack"
                      >
                        D
                      </button>
                    )}
                    <span className={`text-slate-200 ${isBroken ? 'line-through' : ''}`}>
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="text-center text-slate-300 px-1">
                  {item.toHit !== null ? `+${item.toHit}` : '—'}
                </td>
                <td className="text-center text-slate-300 px-1">
                  {item.damage || '—'}
                </td>
                <td className="text-center text-slate-400 text-xs px-1">
                  {item.damageType || '—'}
                </td>
                <td className="text-center text-slate-300 px-1">
                  {item.ac ? `+${item.ac}` : '—'}
                </td>
                <td className="text-center px-1">
                  <div className="flex items-center justify-center gap-1">
                    {onDurabilityChange && (
                      <button
                        onClick={() => onDurabilityChange(i, -1)}
                        className="w-4 h-4 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs"
                      >
                        -
                      </button>
                    )}
                    <span className={`text-xs font-mono ${isLow ? 'text-amber-400' : isBroken ? 'text-red-400' : 'text-slate-300'}`}>
                      {item.durability}/{item.maxDurability}
                    </span>
                    {onDurabilityChange && (
                      <button
                        onClick={() => onDurabilityChange(i, 1)}
                        className="w-4 h-4 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
