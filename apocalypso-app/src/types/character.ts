export interface Stat {
  score: number
  amplifier: number
}

export interface Resource {
  current: number
  max: number
}

export interface Skill {
  keyStat: string
  current: number
  threshold: number
  max: number
  uses: number
}

export interface ClassSkill {
  name: string
  type: 'passive' | 'active' | 'choice'
  actionType?: string
  range?: string
  effect: string
  duration?: string
  cost?: string
  masteryLevel: 0 | 1 | 2
  useCount: number
}

export interface EquipmentItem {
  name: string
  effect: string
  toHit: number | null
  range: string
  damageType: string
  damage: string
  ac: number | null
  durability: number
  maxDurability: number
  equipped: boolean
}

export interface PowerPath {
  name: string
  level: number
  abilities: string[]
}

export interface ZeugnisEntry {
  subject: string
  modifier: number
}

export interface Character {
  id: string
  playerId: string
  campaignId: string

  // Identity
  identity: {
    name: string
    age: number
    residence: string
    personality: string
    backstory: string
    appearance: string
    hobbies: string
    portraitUrl?: string
  }

  // Core
  class: {
    name: string
    tier: number
    archetype: string
    xp: number
    xpNeeded: number
  }

  corruption: {
    current: number
    history: { amount: number; reason: string; timestamp: number }[]
  }

  // Resources
  resources: {
    hp: Resource
    mana: Resource
    stamina: Resource
  }

  speed: number
  ac: number

  // Attributes
  stats: {
    str: Stat
    dex: Stat
    con: Stat
    int: Stat
    wis: Stat
    cha: Stat
    lck: Stat
  }

  // Skills
  skills: Record<string, Skill>
  classSkills: ClassSkill[]

  // Starter-Zeugnis
  zeugnis: ZeugnisEntry[]

  // Power Paths
  powerPaths: PowerPath[]

  // Equipment
  equipment: EquipmentItem[]

  // Level (tracked separately from tier)
  level: number
}

// Tier → Level thresholds: Tier 1=Lv1, Tier 2=Lv5, Tier 3=Lv10, Tier 4=Lv15, Tier 5=Lv20
const TIER_LEVEL_THRESHOLDS = [1, 5, 10, 15, 20] as const

/** Get the character's effective level (uses stored level, falls back to tier-based) */
export function getLevel(character: Pick<Character, 'level' | 'class'>): number {
  if (character.level != null) return character.level
  const tierIndex = Math.max(0, Math.min(character.class.tier - 1, TIER_LEVEL_THRESHOLDS.length - 1))
  return TIER_LEVEL_THRESHOLDS[tierIndex]
}

/** Modifier = (BaseStat × Level) ÷ 2. LCK uses ÷ 4. */
export function getModifier(stat: Stat, level: number, isLuck = false): number {
  const divisor = isLuck ? 4 : 2
  return Math.floor((stat.score * level) / divisor)
}

export function getBaseState(stat: Stat): number {
  return stat.score - stat.amplifier
}
