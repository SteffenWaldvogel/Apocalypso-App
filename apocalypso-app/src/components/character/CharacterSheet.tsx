import type { Character, EquipmentItem } from '@/types/character'
import { getLevel } from '@/types/character'
import StatBlock from './StatBlock'
import ResourceBar from './ResourceBar'
import CorruptionMeter from './CorruptionMeter'
import SkillList from './SkillList'
import EquipmentTable from './EquipmentTable'

interface CharacterSheetProps {
  character: Character
  editable?: boolean
  onUpdate?: (updates: Partial<Character>) => void
  onRoll?: (description: string, modifier: number) => void
  onAttack?: (item: EquipmentItem) => void
}

export default function CharacterSheet({ character, editable = false, onUpdate, onRoll, onAttack }: CharacterSheetProps) {
  const { identity, stats, resources, corruption, skills, equipment } = character
  const level = getLevel(character)

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-violet-900/20 to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{identity.name}</h2>
            <p className="text-sm text-violet-400">
              {character.class.name} — Tier {character.class.tier}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">XP</p>
            <p className="text-sm font-mono text-slate-200">
              {character.class.xp} / {character.class.xpNeeded}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Resources */}
        <div className="space-y-3">
          <ResourceBar
            label="HP"
            current={resources.hp.current}
            max={resources.hp.max}
            color="#ef4444"
            onChange={editable && onUpdate ? (v) => onUpdate({ resources: { ...resources, hp: { ...resources.hp, current: v } } }) : undefined}
          />
          <ResourceBar
            label="Stamina"
            current={resources.stamina.current}
            max={resources.stamina.max}
            color="#22c55e"
            onChange={editable && onUpdate ? (v) => onUpdate({ resources: { ...resources, stamina: { ...resources.stamina, current: v } } }) : undefined}
          />
          <ResourceBar
            label="Mana"
            current={resources.mana.current}
            max={resources.mana.max}
            color="#3b82f6"
            onChange={editable && onUpdate ? (v) => onUpdate({ resources: { ...resources, mana: { ...resources.mana, current: v } } }) : undefined}
          />
          <CorruptionMeter
            current={corruption.current}
            onChange={editable && onUpdate ? (v) => onUpdate({ corruption: { ...corruption, current: v } }) : undefined}
          />
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Attributes</h3>
          <StatBlock
            stats={stats}
            level={level}
            onRoll={onRoll ? (name, mod) => onRoll(`${name.toUpperCase()} Check`, mod) : undefined}
          />
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">AC</p>
            <p className="text-lg font-bold text-slate-200">{character.ac}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Speed</p>
            <p className="text-lg font-bold text-slate-200">{character.speed} ft</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Level</p>
            <p className="text-lg font-bold text-slate-200">{level}</p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Skills</h3>
          <SkillList
            skills={skills}
            onRoll={onRoll ? (name, bonus) => onRoll(`${name}`, bonus) : undefined}
            onIncrementUse={editable && onUpdate ? (skillName) => {
              const skill = skills[skillName]
              if (skill) onUpdate({ skills: { ...skills, [skillName]: { ...skill, uses: skill.uses + 1 } } })
            } : undefined}
          />
        </div>

        {/* Equipment */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Equipment</h3>
          <EquipmentTable
            items={equipment}
            onAttack={onAttack}
            onDurabilityChange={editable && onUpdate ? (index, delta) => {
              const updated = [...equipment]
              updated[index] = { ...updated[index], durability: Math.max(0, updated[index].durability + delta) }
              onUpdate({ equipment: updated })
            } : undefined}
          />
        </div>
      </div>
    </div>
  )
}
