import type { Character } from './character'

export function createDefaultCharacter(playerId: string, campaignId: string, name: string): Omit<Character, 'id'> {
  return {
    playerId,
    campaignId,
    identity: { name, age: 17, residence: 'Sigmaringen', personality: '', backstory: '', appearance: '', hobbies: '' },
    class: { name: 'Unassigned', tier: 1, archetype: '', xp: 0, xpNeeded: 20 },
    corruption: { current: 0, history: [] },
    resources: { hp: { current: 20, max: 20 }, mana: { current: 20, max: 20 }, stamina: { current: 40, max: 40 } },
    speed: 30,
    ac: 10,
    stats: {
      str: { score: 3, amplifier: 0 },
      dex: { score: 3, amplifier: 0 },
      con: { score: 3, amplifier: 0 },
      int: { score: 3, amplifier: 0 },
      wis: { score: 3, amplifier: 0 },
      cha: { score: 3, amplifier: 0 },
      lck: { score: 1, amplifier: 0 },
    },
    skills: {},
    classSkills: [],
    zeugnis: [],
    powerPaths: [],
    equipment: [],
    level: 1,
  }
}
