/**
 * Seed script: Populates Firestore with the current Apocalypso campaign.
 * Run with: npx tsx scripts/seed.ts
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB4M7j-TqKjYWYMtcql-QJfBFkVz4hPuYo",
  authDomain: "apocalypso-3fd48.firebaseapp.com",
  projectId: "apocalypso-3fd48",
  storageBucket: "apocalypso-3fd48.firebasestorage.app",
  messagingSenderId: "35956046402",
  appId: "1:35956046402:web:5ce31ca4ec8f1fddd70bdb",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// GM user ID (the test account we created)
const GM_ID = "WuiHz30g76U7jAGANluQi4iIhkd2"

async function seed() {
  console.log("Authenticating...")
  const auth = getAuth(app)
  await signInWithEmailAndPassword(auth, "test@apocalypso.dev", "testpass123")
  console.log("Seeding Apocalypso campaign...")

  // 1. Create campaign
  const campaignId = "apocalypso-sigmaringen"
  await setDoc(doc(db, `campaigns/${campaignId}`), {
    name: "Apocalypso — Sigmaringen",
    description: "April 22nd. The Outbreak. Class 10b. Sigmaringen, Baden-Württemberg.",
    gmId: GM_ID,
    currentDay: 6,
    settings: { diceMode: "d20", defenseRolls: false, stressDie: false },
    createdAt: Date.now(),
    lastSessionAt: Date.now(),
  })
  console.log("  Campaign created:", campaignId)

  // 2. Add GM as member
  await setDoc(doc(db, `campaigns/${campaignId}/members/${GM_ID}`), {
    userId: GM_ID,
    role: "gm",
    displayName: "GM (Steffen)",
  })

  // 3. Seed characters
  const characters = [
    // === PLAYER CHARACTERS ===
    {
      id: "francesco-ricci",
      playerId: GM_ID, // All assigned to GM for now, reassign when players join
      campaignId,
      identity: {
        name: "Francesco Ricci",
        age: 17,
        residence: "Sigmaringen",
        personality: "ruhig, risikobereit, verlässlich, optimistisch",
        backstory: "Francesco wurde in Sigmaringen geboren, doch die Wurzeln seiner Familie liegen tief in Süditalien. Mit viel Fleiß und unerschütterlichem Optimismus haben seine Eltern sich hier ein kleines, aber eigenes Zuhause aufgebaut.",
        appearance: "Langes geschmeidiges blaues Haar, 182 cm, schlank mit leichten Muskeln, braune Augen.",
        hobbies: "Volleyball, Fußball",
      },
      class: { name: "Guardian", tier: 2, archetype: "Tank", xp: 1, xpNeeded: 20 },
      corruption: { current: 0, history: [] },
      resources: { hp: { current: 33, max: 33 }, mana: { current: 41, max: 41 }, stamina: { current: 83, max: 83 } },
      speed: 30,
      ac: 15,
      stats: {
        str: { score: 11, amplifier: 5 },
        dex: { score: 3, amplifier: 0 },
        con: { score: 10, amplifier: 5 },
        int: { score: 6, amplifier: 0 },
        wis: { score: 2, amplifier: 0 },
        cha: { score: 7, amplifier: 0 },
        lck: { score: 1, amplifier: 0 },
      },
      skills: {
        Athletics: { keyStat: "STR", current: 11, threshold: 0, max: 10, uses: 0 },
        Acrobatics: { keyStat: "DEX", current: 3, threshold: 0, max: 10, uses: 0 },
        Stealth: { keyStat: "DEX", current: 3, threshold: 0, max: 10, uses: 0 },
        Perception: { keyStat: "WIS", current: 2, threshold: 4, max: 10, uses: 2 },
        Intimidation: { keyStat: "CHA", current: 7, threshold: 0, max: 10, uses: 0 },
        Persuasion: { keyStat: "CHA", current: 7, threshold: 0, max: 10, uses: 0 },
        Scavenging: { keyStat: "—", current: 0, threshold: 3, max: 10, uses: 1 },
        Driving: { keyStat: "—", current: 0, threshold: 7, max: 10, uses: 5 },
        Killing: { keyStat: "—", current: 0, threshold: 5, max: 10, uses: 3 },
        Cooking: { keyStat: "—", current: 0, threshold: 2, max: 10, uses: 1 },
        Taunting: { keyStat: "—", current: 0, threshold: 3, max: 10, uses: 2 },
        "Mana Control": { keyStat: "—", current: 0, threshold: 1, max: 10, uses: 0 },
      },
      classSkills: [
        { name: "Stone Skin", type: "passive", effect: "For 10 turns, increase AC by 1", cost: "5 Stamina", masteryLevel: 0, useCount: 4 },
        { name: "Unmoving Line", type: "passive", effect: "When a creature disengages, they provoke an opportunity attack; on hit: speed 0", cost: "5 Stamina", masteryLevel: 0, useCount: 0 },
        { name: "Bulwark Stance", type: "active", effect: "Take half damage from all sources; allies within 5 ft gain +1 AC. 1 turn.", cost: "20 Stamina", masteryLevel: 0, useCount: 0 },
        { name: "Attacktank", type: "choice", effect: "After halving damage, next attack: +2 to hit, +2 base dmg", cost: "10 Stamina", masteryLevel: 0, useCount: 0 },
      ],
      zeugnis: [
        { subject: "Sprachen", modifier: 1 }, { subject: "Kunst", modifier: -1 }, { subject: "Musik", modifier: 0 },
        { subject: "Geschichte", modifier: 2 }, { subject: "Politik", modifier: 1 }, { subject: "Erdkunde", modifier: 1 },
        { subject: "Wirtschaft", modifier: 1 }, { subject: "Religion", modifier: -1 }, { subject: "Mathe", modifier: 0 },
        { subject: "Physik", modifier: 0 }, { subject: "Chemie", modifier: 0 }, { subject: "Biologie", modifier: 1 },
        { subject: "Sport", modifier: 2 }, { subject: "Psychologie", modifier: 3 },
      ],
      powerPaths: [],
      equipment: [
        { name: "Voidbeater v1", effect: "—", toHit: 2, range: "5 ft / 40 ft", damageType: "blunt", damage: "1d6+2", ac: null, durability: 30, maxDurability: 35, equipped: true },
        { name: "Combat Vest", effect: "+1 AC", toHit: null, range: "—", damageType: "—", damage: "—", ac: 1, durability: 15, maxDurability: 20, equipped: true },
        { name: "Papshield", effect: "Halve damage 1/3 turns", toHit: 2, range: "5 ft / 10 ft", damageType: "blunt", damage: "1d4", ac: null, durability: 28, maxDurability: 30, equipped: true },
        { name: "Taschenmesser", effect: "+1 on related Checks", toHit: 0, range: "5 ft / 60 ft", damageType: "slash/pierce", damage: "1d4", ac: null, durability: 8, maxDurability: 10, equipped: false },
      ],
    },
    {
      id: "leo-altmann",
      playerId: GM_ID,
      campaignId,
      identity: {
        name: "Leo Altmann",
        age: 17,
        residence: "Sigmaringen",
        personality: "Meist ruhig, zurückhaltend; bei Stress hektisch, spielt mit Kette",
        backstory: "Aufgewachsen in Sigmaringen. Horror-Fan seit Kindheit; in den Ferien im PC-Laden geholfen, Technik-Leidenschaft entwickelt. Zum 17. Geburtstag bekam er die Kleeblatt-Kette vom Bruder als Glücksbringer fürs Abitur.",
        appearance: "Ca. 175 cm, messy braune Haare, grüne Augen, Brille, zu großes Hemd & Jeans, trägt Kleeblatt-Kette",
        hobbies: "Technik basteln; immer mit kleinem Werkzeugkasten unterwegs",
      },
      class: { name: "Hustler", tier: 2, archetype: "Luck", xp: 1, xpNeeded: 20 },
      corruption: { current: 0, history: [] },
      resources: { hp: { current: 27, max: 27 }, mana: { current: 63, max: 63 }, stamina: { current: 44, max: 44 } },
      speed: 30,
      ac: 13,
      stats: {
        str: { score: 4, amplifier: 0 },
        dex: { score: 7, amplifier: 0 },
        con: { score: 3, amplifier: 0 },
        int: { score: 7, amplifier: 0 },
        wis: { score: 3, amplifier: 0 },
        cha: { score: 5, amplifier: 0 },
        lck: { score: 10, amplifier: 7.5 },
      },
      skills: {
        Athletics: { keyStat: "STR", current: 4, threshold: 2, max: 10, uses: 1 },
        Acrobatics: { keyStat: "DEX", current: 7, threshold: 0, max: 10, uses: 0 },
        "Sleight of Hand": { keyStat: "DEX", current: 7, threshold: 0, max: 10, uses: 0 },
        Stealth: { keyStat: "DEX", current: 7, threshold: 0, max: 10, uses: 0 },
        Perception: { keyStat: "WIS", current: 3, threshold: 3, max: 10, uses: 2 },
        Scavenging: { keyStat: "—", current: 0, threshold: 6, max: 25, uses: 4 },
        Driving: { keyStat: "—", current: 0, threshold: 1, max: 10, uses: 0 },
        Killing: { keyStat: "—", current: 0, threshold: 4, max: 10, uses: 3 },
        "Mana Control": { keyStat: "—", current: 1, threshold: 0, max: 25, uses: 0 },
      },
      classSkills: [
        { name: "Lucky Day", type: "passive", effect: "Once/day: 5 min Lucky buff (automatic)", cost: "—", masteryLevel: 0, useCount: 3 },
        { name: "Greedy Rat", type: "passive", effect: "+2 on all Scavenging checks", cost: "—", masteryLevel: 0, useCount: 0 },
        { name: "Mana Sense", type: "passive", effect: "Sense surrounding Mana and control own at rudimentary level", cost: "—", masteryLevel: 0, useCount: 0 },
        { name: "Last Straw", type: "passive", effect: "Once per Long Rest: reroll Natural 1 without side effect", cost: "5 Mana", masteryLevel: 0, useCount: 1 },
        { name: "Wildcard Twist", type: "active", effect: "Roll 1d6: 1-2 double dmg; 3-4 untargetable; 5-6 random", cost: "15 Mana", masteryLevel: 0, useCount: 2 },
        { name: "Nuh uh! / Yuh uh!", type: "passive", effect: "On initiative: extra 1d20 (1-10 auto-Taunt; 11-20 Anti-Taunt)", cost: "—", masteryLevel: 0, useCount: 0 },
      ],
      zeugnis: [
        { subject: "Sprachen", modifier: 3 }, { subject: "Kunst", modifier: 0 }, { subject: "Musik", modifier: -1 },
        { subject: "Geschichte", modifier: 0 }, { subject: "Politik", modifier: 1 }, { subject: "Erdkunde", modifier: 1 },
        { subject: "Wirtschaft", modifier: 0 }, { subject: "Religion", modifier: -1 }, { subject: "Mathe", modifier: 2 },
        { subject: "Physik", modifier: 2 }, { subject: "Chemie", modifier: 1 }, { subject: "Biologie", modifier: 0 },
        { subject: "Sport", modifier: 1 }, { subject: "Psychologie", modifier: 1 },
      ],
      powerPaths: [],
      equipment: [
        { name: "Voidbeater v1", effect: "Named by Herald", toHit: 2, range: "5 ft / 40 ft", damageType: "blunt", damage: "1d6+2", ac: null, durability: 28, maxDurability: 35, equipped: true },
        { name: "Combat Vest", effect: "+1 AC", toHit: null, range: "—", damageType: "—", damage: "—", ac: 1, durability: 18, maxDurability: 20, equipped: true },
        { name: "Werkzeugset", effect: "+1 on related Checks", toHit: null, range: "—", damageType: "—", damage: "—", ac: null, durability: 99, maxDurability: 99, equipped: true },
        { name: "Kleeblatt-Kette", effect: "Glücksbringer (integrated)", toHit: null, range: "—", damageType: "—", damage: "—", ac: null, durability: 99, maxDurability: 99, equipped: true },
      ],
    },
    {
      id: "jannik-hammerer",
      playerId: GM_ID,
      campaignId,
      identity: {
        name: "Jannik Hammerer",
        age: 17,
        residence: "Sigmaringen, Nähe Kaserne",
        personality: "Sporty, Helpful, Honest, 'Not the smartest'",
        backstory: "Lives alone with his mother. Has been active in many sports clubs and often trains. Father left the family at age 7; since then he's shouldered extra responsibility caring for his mum.",
        appearance: "Athletic build, short hair, sporty clothes",
        hobbies: "Kugelstoßen, Leichtathletik",
      },
      class: { name: "Street Brawler", tier: 2, archetype: "Brawler", xp: 1, xpNeeded: 20 },
      corruption: { current: 20, history: [{ amount: 20, reason: "Void exposure", timestamp: Date.now() }] },
      resources: { hp: { current: 37, max: 37 }, mana: { current: 36, max: 36 }, stamina: { current: 92, max: 92 } },
      speed: 30,
      ac: 14,
      stats: {
        str: { score: 10, amplifier: 5 },
        dex: { score: 7, amplifier: 0 },
        con: { score: 9, amplifier: 5 },
        int: { score: 6, amplifier: 0 },
        wis: { score: 2, amplifier: 0 },
        cha: { score: 5, amplifier: 0 },
        lck: { score: 1, amplifier: 0 },
      },
      skills: {
        Athletics: { keyStat: "STR", current: 10, threshold: 0, max: 10, uses: 0 },
        Acrobatics: { keyStat: "DEX", current: 7, threshold: 0, max: 10, uses: 0 },
        Stealth: { keyStat: "DEX", current: 7, threshold: 0, max: 10, uses: 0 },
        Perception: { keyStat: "WIS", current: 2, threshold: 4, max: 10, uses: 2 },
        Scavenging: { keyStat: "—", current: 0, threshold: 4, max: 10, uses: 2 },
        Driving: { keyStat: "—", current: 0, threshold: 5, max: 10, uses: 3 },
        Killing: { keyStat: "—", current: 1, threshold: 11, max: 25, uses: 8 },
        Cooking: { keyStat: "—", current: 0, threshold: 2, max: 10, uses: 1 },
        Pathsense: { keyStat: "—", current: 0, threshold: 1, max: 10, uses: 0 },
      },
      classSkills: [
        { name: "Enhance Fists", type: "passive", effect: "+1d4 dmg on unarmed strikes for 10 turns", cost: "5 Stamina", masteryLevel: 0, useCount: 3 },
        { name: "Fistfighter", type: "passive", effect: "+1 base dmg on all fist strikes (permanent)", cost: "—", masteryLevel: 0, useCount: 0 },
        { name: "Counterblow", type: "passive", effect: "Once per turn reaction: counterattack with unarmed strike when attacked", cost: "5 Stamina", masteryLevel: 0, useCount: 0 },
        { name: "Ironburst Combo", type: "active", effect: "3 unarmed strikes vs same target; 2 hits: prone; 3 hits: +1d4 dmg", cost: "30 Stamina", masteryLevel: 0, useCount: 1 },
        { name: "Rageborn", type: "choice", effect: "+3 Base Dmg, -2 AC for up to 3 turns", cost: "5 Stamina/turn", masteryLevel: 0, useCount: 1 },
      ],
      zeugnis: [
        { subject: "Sprachen", modifier: 2 }, { subject: "Kunst", modifier: 0 }, { subject: "Musik", modifier: 1 },
        { subject: "Geschichte", modifier: 1 }, { subject: "Politik", modifier: 1 }, { subject: "Erdkunde", modifier: -1 },
        { subject: "Wirtschaft", modifier: -1 }, { subject: "Religion", modifier: 0 }, { subject: "Mathe", modifier: 0 },
        { subject: "Physik", modifier: 0 }, { subject: "Chemie", modifier: 1 }, { subject: "Biologie", modifier: 1 },
        { subject: "Sport", modifier: 3 }, { subject: "Psychologie", modifier: 2 },
      ],
      powerPaths: [],
      equipment: [
        { name: "Steel Hands", effect: "Once per long rest: Enhance Fist without cost", toHit: 1, range: "5 ft", damageType: "blunt", damage: "1d6+2", ac: null, durability: 48, maxDurability: 50, equipped: true },
        { name: "Combat Vest", effect: "+1 AC", toHit: null, range: "—", damageType: "—", damage: "—", ac: 1, durability: 16, maxDurability: 20, equipped: true },
        { name: "Brick 'Erzi'", effect: "Auto-return; crit: prone + triple damage", toHit: 2, range: "60 ft", damageType: "blunt", damage: "1d8+2", ac: null, durability: 150, maxDurability: 150, equipped: true },
      ],
    },
    // === PARTY NPCs ===
    {
      id: "sarah-hirtz",
      playerId: "npc",
      campaignId,
      identity: {
        name: "Sarah Hirtz",
        age: 17,
        residence: "Sigmaringen",
        personality: "einfühlsam, ruhig unter Druck, organisiert, beschützend",
        backstory: "Sarah wuchs zwischen Krankenstationen und Operationssälen auf, denn beide Eltern sind angesehene Ärzte. Schon als Kind half sie, kleine Verbände anzulegen.",
        appearance: "170 cm, blonde Zöpfe, blaue Augen, sportlich-leicht gebaut, immer mit Erste-Hilfe-Köfferchen",
        hobbies: "freiwillige Arbeit im Jugend-DRK, Laufen, Lesen medizinischer Fachbücher",
      },
      class: { name: "Combat Medic", tier: 2, archetype: "Support (Medical)", xp: 1, xpNeeded: 20 },
      corruption: { current: 0, history: [] },
      resources: { hp: { current: 39, max: 39 }, mana: { current: 51, max: 51 }, stamina: { current: 89, max: 89 } },
      speed: 30,
      ac: 13,
      stats: {
        str: { score: 5, amplifier: 0 },
        dex: { score: 5, amplifier: 0 },
        con: { score: 14, amplifier: 5 },
        int: { score: 5, amplifier: 0 },
        wis: { score: 6, amplifier: 5 },
        cha: { score: 3, amplifier: 0 },
        lck: { score: 1, amplifier: 0 },
      },
      skills: {
        Athletics: { keyStat: "STR", current: 5, threshold: 2, max: 10, uses: 1 },
        Perception: { keyStat: "WIS", current: 6, threshold: 6, max: 10, uses: 4 },
        Healing: { keyStat: "—", current: 0, threshold: 9, max: 10, uses: 6 },
        Killing: { keyStat: "—", current: 0, threshold: 3, max: 10, uses: 2 },
      },
      classSkills: [
        { name: "Skilled Medic", type: "passive", effect: "+1 on any Medicine or Constitution check", cost: "—", masteryLevel: 0, useCount: 0 },
        { name: "Helper Instinct", type: "passive", effect: "If ally falls below 50% HP, use reaction to toss healing potion or grant +1 AC", cost: "5 Stamina", masteryLevel: 0, useCount: 0 },
        { name: "Injection!", type: "active", effect: "Adrenaline (+2 atk, +10 ft move), Stabilize (remove Confusion/Corruption), or Fury (crits, 1d4 recoil)", cost: "15 Mana", masteryLevel: 0, useCount: 0 },
        { name: "Healing Hand", type: "choice", effect: "Heal an ally for 1d4 + 2", cost: "10 Mana/Stamina", masteryLevel: 0, useCount: 0 },
      ],
      zeugnis: [],
      powerPaths: [],
      equipment: [
        { name: "Combat Vest", effect: "+1 AC", toHit: null, range: "—", damageType: "—", damage: "—", ac: 1, durability: 18, maxDurability: 20, equipped: true },
        { name: "Voidbeater v1", effect: "Named by Herald", toHit: 2, range: "5 ft / 40 ft", damageType: "blunt", damage: "1d6+2", ac: null, durability: 28, maxDurability: 35, equipped: true },
      ],
    },
    {
      id: "noah-cicek",
      playerId: "npc",
      campaignId,
      identity: {
        name: "Noah Cicek",
        age: 17,
        residence: "Sigmaringen",
        personality: "introspective, cautious, quietly determined",
        backstory: "Noah was raised by his seamstress mother, Mia. When his Witchmark first flared, she crafted the Mother's Mark amulet to suppress its corrupting pull. His father Roberto — a high-level Runeseeker heavily touched by the Void — sees Noah's Echo Evolution as the key to greater power.",
        appearance: "slender build, pale skin, short black hair, grey eyes; wears glowing Mother's Mark amulet",
        hobbies: "sketching arcane sigils, reading ancient tomes",
      },
      class: { name: "Witchmarked", tier: 1, archetype: "Magic", xp: 3, xpNeeded: 8 },
      corruption: { current: 10, history: [{ amount: 10, reason: "Echo Evolution initiation", timestamp: Date.now() }] },
      resources: { hp: { current: 9, max: 9 }, mana: { current: 74, max: 74 }, stamina: { current: 7, max: 7 } },
      speed: 30,
      ac: 12,
      stats: {
        str: { score: 0, amplifier: 0 },
        dex: { score: 1, amplifier: 0 },
        con: { score: 1, amplifier: 0 },
        int: { score: 5, amplifier: 1.5 },
        wis: { score: 8, amplifier: 1.8 },
        cha: { score: 2, amplifier: 0 },
        lck: { score: 1, amplifier: 0 },
      },
      skills: {
        Killing: { keyStat: "—", current: 0, threshold: 2, max: 10, uses: 1 },
        "Mana Control": { keyStat: "—", current: 1, threshold: 2, max: 25, uses: 1 },
      },
      classSkills: [
        { name: "Corrupted Body", type: "passive", effect: "Body adapted to Corruption. +1 on WIS checks", cost: "—", masteryLevel: 0, useCount: 0 },
        { name: "Mana Sense", type: "passive", effect: "Sense surrounding Mana and control own at rudimentary level", cost: "—", masteryLevel: 0, useCount: 0 },
        { name: "Yar'Khul", type: "active", effect: "Vs Void creatures: WIS save DC 14; on fail: confusion and inner thoughts revealed", cost: "5 Mana", masteryLevel: 0, useCount: 0 },
        { name: "Void Suction", type: "active", effect: "Void creatures that fail WIS Save (14) take 1d6 dmg; on success +1 Echo Evolution counter", cost: "10 Mana", masteryLevel: 0, useCount: 3 },
      ],
      zeugnis: [],
      powerPaths: [{ name: "Echo Evolution", level: 1, abilities: ["Yar'Khul"] }],
      equipment: [
        { name: "Combat Vest", effect: "+1 AC", toHit: null, range: "—", damageType: "—", damage: "—", ac: 1, durability: 20, maxDurability: 20, equipped: true },
        { name: "Mother's Mark", effect: "Arcane amulet — holds corruption at bay", toHit: null, range: "—", damageType: "—", damage: "—", ac: null, durability: 99, maxDurability: 99, equipped: true },
      ],
    },
  ]

  for (const char of characters) {
    const { id, ...data } = char
    await setDoc(doc(db, `campaigns/${campaignId}/characters/${id}`), data)
    console.log(`  Character: ${char.identity.name}`)
  }

  // 4. Seed NPCs (non-party)
  const npcs = [
    {
      id: "herald-fatebound-jester",
      identity: { name: "Herald, The Fatebound Jester", age: 0, residence: "Beyond", personality: "Childlike madness layered over cold, mechanical core", backstory: "A walking oddball whose laughter cracks reality. Bears the Warhorn that can rend the veil of fate itself.", appearance: "Shifting motley armor, impossible proportions, manic grin", hobbies: "Breaking fate" },
      class: { name: "Fatebound Jester", tier: 5, archetype: "Luck", xp: 0, xpNeeded: 0 },
      stats: { str: { score: 14, amplifier: 0 }, dex: { score: 18, amplifier: 0 }, con: { score: 36, amplifier: 20 }, int: { score: 20, amplifier: 0 }, wis: { score: 18, amplifier: 0 }, cha: { score: 32, amplifier: 20 }, lck: { score: 10, amplifier: 0 } },
      resources: { hp: { current: 500, max: 500 }, mana: { current: 300, max: 300 }, stamina: { current: 200, max: 200 } },
      ac: 25, speed: 40, corruption: { current: 0, history: [] },
      isNpc: true, npcType: "god",
    },
    {
      id: "aric-sternhold",
      identity: { name: "Aric Sternhold, The Adjudicator", age: 0, residence: "System Chamber", personality: "Clipped, formal tones. Never raises his voice.", backstory: "Guide & Enforcer of the System Chamber. Lives to uphold the System's code.", appearance: "Tall, imposing, jet-black plate with silver runes, steel eyes", hobbies: "Upholding cosmic law" },
      class: { name: "System Warden", tier: 5, archetype: "Unique", xp: 0, xpNeeded: 0 },
      stats: { str: { score: 16, amplifier: 0 }, dex: { score: 12, amplifier: 0 }, con: { score: 18, amplifier: 0 }, int: { score: 20, amplifier: 5 }, wis: { score: 22, amplifier: 10 }, cha: { score: 14, amplifier: 0 }, lck: { score: 8, amplifier: 0 } },
      resources: { hp: { current: 200, max: 200 }, mana: { current: 150, max: 150 }, stamina: { current: 120, max: 120 } },
      ac: 20, speed: 30, corruption: { current: 0, history: [] },
      isNpc: true, npcType: "boss",
    },
    {
      id: "roberto-cicek",
      identity: { name: "Roberto Cicek", age: 45, residence: "Unknown", personality: "Stern, calculating, views Noah as a catalyst", backstory: "Noah's father. A high-level Runeseeker heavily touched by the Void. 80% corrupted. Sees Noah's Echo Evolution as key to greater power.", appearance: "Gaunt, void-touched veins visible, dark robes with rune inscriptions", hobbies: "Void research, rune mastery" },
      class: { name: "Rune Seeker", tier: 2, archetype: "Magic", xp: 0, xpNeeded: 20 },
      stats: { str: { score: 4, amplifier: 0 }, dex: { score: 5, amplifier: 0 }, con: { score: 6, amplifier: 0 }, int: { score: 14, amplifier: 5 }, wis: { score: 12, amplifier: 5 }, cha: { score: 6, amplifier: 0 }, lck: { score: 3, amplifier: 0 } },
      resources: { hp: { current: 30, max: 30 }, mana: { current: 131, max: 131 }, stamina: { current: 15, max: 15 } },
      ac: 16, speed: 30, corruption: { current: 80, history: [{ amount: 80, reason: "Years of Void research", timestamp: Date.now() }] },
      isNpc: true, npcType: "ally-hostile",
    },
  ]

  for (const npc of npcs) {
    const { id, ...data } = npc
    await setDoc(doc(db, `campaigns/${campaignId}/npcs/${id}`), data)
    console.log(`  NPC: ${npc.identity.name}`)
  }

  console.log("\nDone! Campaign seeded at ID:", campaignId)
  console.log("URL: https://apocalypso-3fd48.web.app/campaign/" + campaignId)
  process.exit(0)
}

seed().catch(console.error)
