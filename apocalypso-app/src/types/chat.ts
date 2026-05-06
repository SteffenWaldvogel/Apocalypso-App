export interface DiceRollResult {
  formula: string
  rolls: number[]
  total: number
  modifier: number
  isNat20: boolean
  isNat1: boolean
  vsDC?: number
  success?: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  type: 'text' | 'roll' | 'system' | 'whisper'
  content: string
  rollResult?: DiceRollResult
  recipientId?: string // for whispers
  timestamp: number
}
