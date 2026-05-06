export interface InitiativeEntry {
  characterId: string
  name: string
  roll: number
  dexTiebreak: number
  isNpc: boolean
}

export interface CombatState {
  active: boolean
  round: number
  currentTurnIndex: number
  initiative: InitiativeEntry[]
}

export type ConditionType =
  | 'stunned'
  | 'weakened'
  | 'burning'
  | 'slowed'
  | 'bleeding'
  | 'prone'
  | 'confused'
  | 'disoriented'
  | 'feared'
  | 'restrained'
  | 'taunted'
  | 'anti-taunted'
  | 'sepsis'
  | 'gravity-warp'
  | 'exhausted'

export interface ActiveCondition {
  id: string
  targetId: string
  type: ConditionType
  roundsRemaining: number | null // null = until save
  appliedBy: string
  source: string
}
