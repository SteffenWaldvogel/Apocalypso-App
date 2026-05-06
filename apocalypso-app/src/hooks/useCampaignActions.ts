import { rollDice } from '@/lib/dice'
import { getLevel, getModifier } from '@/types/character'
import type { Character, EquipmentItem } from '@/types/character'
import type { ChatMessage, DiceRollResult } from '@/types/chat'
import type { CombatState } from '@/types/combat'

interface CampaignActionsParams {
  userId: string
  myCharacter: Character | null
  characters: Character[]
  isGM: boolean
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setCombat: React.Dispatch<React.SetStateAction<CombatState>>
}

export function useCampaignActions({ userId, myCharacter, characters, isGM, addMessage, setCombat }: CampaignActionsParams) {
  function handleRoll(result: DiceRollResult, description: string) {
    addMessage({
      senderId: userId,
      senderName: myCharacter?.identity.name || 'Unknown',
      type: 'roll',
      content: description,
      rollResult: result,
    })
  }

  function handleStatRoll(description: string, modifier: number) {
    const result = rollDice('1d20', modifier)
    handleRoll(result, description)
  }

  function handleAttackRoll(item: EquipmentItem) {
    if (!myCharacter) return
    const level = getLevel(myCharacter)
    const strMod = getModifier(myCharacter.stats.str, level)
    const attackResult = rollDice('1d20', (item.toHit || 0) + strMod)
    handleRoll(attackResult, `${item.name} — Attack`)

    if (item.damage && item.damage !== '—') {
      const dmgResult = rollDice(item.damage)
      addMessage({
        senderId: userId,
        senderName: myCharacter.identity.name,
        type: 'roll',
        content: `${item.name} — Damage (${item.damageType})`,
        rollResult: dmgResult,
      })
    }
  }

  function handleSendMessage(text: string) {
    addMessage({
      senderId: userId,
      senderName: myCharacter?.identity.name || 'Unknown',
      type: 'text',
      content: text,
    })
  }

  function handleCommand(command: string, args: string) {
    if (command === 'roll' || command === 'r') {
      const result = rollDice(args || '1d20')
      handleRoll(result, args || '1d20')
    } else if (command === 'combat' && isGM) {
      const init = characters.map((c) => ({
        characterId: c.id,
        name: c.identity.name,
        roll: rollDice('1d20', getModifier(c.stats.dex, getLevel(c))).total,
        dexTiebreak: c.stats.dex.score,
        isNpc: false,
      })).sort((a, b) => b.roll - a.roll || b.dexTiebreak - a.dexTiebreak)

      setCombat({ active: true, round: 1, currentTurnIndex: 0, initiative: init })
      addMessage({ senderId: 'system', senderName: 'System', type: 'system', content: 'Combat initiated. Roll for initiative.' })
    } else if (command === 'endcombat' && isGM) {
      setCombat({ active: false, round: 0, currentTurnIndex: 0, initiative: [] })
      addMessage({ senderId: 'system', senderName: 'System', type: 'system', content: 'Combat ended.' })
    }
  }

  return { handleStatRoll, handleAttackRoll, handleSendMessage, handleCommand }
}
