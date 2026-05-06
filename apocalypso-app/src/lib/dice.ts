import { DiceRoll } from '@dice-roller/rpg-dice-roller'
import type { DiceRollResult } from '@/types/chat'

export function rollDice(formula: string, modifier = 0, dc?: number): DiceRollResult {
  const roll = new DiceRoll(formula)
  const total = roll.total + modifier

  // Extract individual die results
  const rolls: number[] = []
  for (const group of roll.rolls) {
    if (Array.isArray(group)) {
      for (const r of group) {
        if (typeof r === 'object' && r !== null && 'value' in r) {
          rolls.push((r as { value: number }).value)
        }
      }
    } else if (typeof group === 'number') {
      rolls.push(group)
    }
  }

  // Check for natural 20/1 (only on d20 rolls)
  const isD20 = formula.toLowerCase().includes('d20')
  const isNat20 = isD20 && rolls.some((r) => r === 20)
  const isNat1 = isD20 && rolls.some((r) => r === 1)

  return {
    formula: modifier !== 0 ? `${formula} + ${modifier}` : formula,
    rolls,
    total,
    modifier,
    isNat20,
    isNat1,
    vsDC: dc,
    success: dc !== undefined ? total >= dc : undefined,
  }
}

export function rollInitiative(dexMod: number): number {
  const result = rollDice('1d20', dexMod)
  return result.total
}

export function rollAttack(toHit: number, statMod: number, skillBonus = 0): DiceRollResult {
  const totalMod = toHit + statMod + skillBonus
  return rollDice('1d20', totalMod)
}

export function rollSave(statMod: number, dc: number): DiceRollResult {
  return rollDice('1d20', statMod, dc)
}
