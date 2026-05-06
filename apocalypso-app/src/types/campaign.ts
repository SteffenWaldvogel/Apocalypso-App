export interface CampaignSettings {
  diceMode: 'd20' | '2d10'
  defenseRolls: boolean
  stressDie: boolean
}

export interface Campaign {
  id: string
  name: string
  description: string
  gmId: string
  currentDay: number
  settings: CampaignSettings
  createdAt: number
  lastSessionAt: number
}

export interface CampaignMember {
  userId: string
  role: 'gm' | 'player'
  characterId?: string
  displayName: string
}
