# Apocalypso App — Requirements Specification

**Version:** 1.0
**Date:** 2026-05-05
**Target:** Web application (React + Firebase)
**Users:** 1 GM + 3–6 Players, real-time multiplayer

---

## Table of Contents

1. [User Roles & Auth](#1-user-roles--auth)
2. [Campaign Management](#2-campaign-management)
3. [Character Sheets](#3-character-sheets)
4. [Dice & Rolling](#4-dice--rolling)
5. [Combat System](#5-combat-system)
6. [Interactive Map](#6-interactive-map)
7. [Inventory & Equipment](#7-inventory--equipment)
8. [Skill Progression](#8-skill-progression)
9. [Class & Tier System](#9-class--tier-system)
10. [Power Paths](#10-power-paths)
11. [The System & Daily Quests](#11-the-system--daily-quests)
12. [Conditions & Status Effects](#12-conditions--status-effects)
13. [NPC & Creature Management](#13-npc--creature-management)
14. [Chat & Dice Log](#14-chat--dice-log)
15. [GM Tools](#15-gm-tools)
16. [Corruption Tracker](#16-corruption-tracker)
17. [Rune Magic (Future)](#17-rune-magic-future)
18. [Non-Functional Requirements](#18-non-functional-requirements)

---

## 1. User Roles & Auth

### 1.1 Roles
| Role | Permissions |
|------|-------------|
| **GM** | Full read/write on all campaign data. Can modify any character, NPC, map, quest. Controls combat state. |
| **Player** | Read/write own character. Read-only on other characters (visible stats only). Can roll dice, move own token, send chat. |
| **Spectator** (future) | Read-only on everything. Cannot interact. |

### 1.2 Authentication
- [ ] Email/password sign-up and login
- [ ] Google sign-in (optional)
- [ ] GM invites players via shareable campaign link/code
- [ ] Session persistence (stay logged in between sessions)
- [ ] Role assignment by GM after joining

### 1.3 Acceptance Criteria
- A new user can create an account in under 30 seconds
- GM can create a campaign and invite players with a single link
- Players cannot modify other players' characters or GM-only data

---

## 2. Campaign Management

### 2.1 Features
- [ ] Create campaign (name, description, setting notes)
- [ ] Campaign dashboard showing: active characters, current session day, active quests
- [ ] Archive/delete campaign
- [ ] Multiple campaigns per GM account
- [ ] Campaign settings (house rules toggles, variant options like 2d10 mode)

### 2.2 Data Model
```
Campaign {
  id, name, description, gmId
  currentDay: number
  settings: { diceMode: "d20" | "2d10", defenseRolls: boolean, stressDie: boolean }
  createdAt, lastSessionAt
}
```

---

## 3. Character Sheets

### 3.1 Core Data (live-synced across all clients)
- [ ] **Identity:** Name, age, residence, personality, backstory, appearance, hobbies
- [ ] **Core Stats:** Class, Level, XP (current / needed), Corruption %
- [ ] **Resources:** HP (current/max), Mana (current/max), Stamina (current/max), Speed, AC
- [ ] **Seven Attributes:** STR, DEX, CON, INT, WIS, CHA, LCK — each with Score + Base-Stat Amplifier
- [ ] **Derived Modifiers:** Auto-calculated from (Stat x Level) / 2 (or /4 for LCK)
- [ ] **Starter-Zeugnis:** 14 school subjects with modifiers (-2 to +3)
- [ ] **Character portrait** (uploadable image)

### 3.2 Editing
- [ ] Players can edit their own sheet in real-time
- [ ] GM can edit any sheet
- [ ] Changes propagate to all connected clients instantly
- [ ] Undo last change (per field, 1 level)
- [ ] Stat modification history (log of what changed and when)

### 3.3 Computed Values
- [ ] Modifiers auto-calculate: `(Stat × Level) ÷ 2` (standard) or `÷ 4` (LCK)
- [ ] HP/Stamina/Mana bars with visual fill indicators
- [ ] Corruption meter (0–100% with threshold markers at 25/50/75/100)

### 3.4 Acceptance Criteria
- Changing HP on GM screen reflects on player screen within 200ms
- All 7 stats display with both Score and Amplifier clearly visible
- Derived modifiers update automatically when stats change

---

## 4. Dice & Rolling

### 4.1 Core Mechanics
- [ ] Roll `1d20 + Stat Modifier + Skill Modifier + Situational Modifiers` vs DC
- [ ] Support custom formulas: `2d10`, `1d6`, `3d8+5`, etc.
- [ ] Natural 20 / Natural 1 detection and visual highlight (crit success/failure)
- [ ] Roll with Advantage (roll twice, take higher)
- [ ] Roll with Disadvantage (roll twice, take lower)
- [ ] Stat-based quick rolls (click a stat → rolls d20 + that stat's modifier)
- [ ] Skill-based quick rolls (click a skill → rolls d20 + stat mod + skill level)
- [ ] Attack rolls (d20 + weapon to-hit + stat mod + skill bonuses)
- [ ] Damage rolls (per weapon: e.g., `1d6+2`)
- [ ] Saving throws (d20 + relevant stat mod)

### 4.2 Dice UI
- [ ] Dice tray/roller with animated dice (visual feedback)
- [ ] Formula input field for custom rolls
- [ ] Quick-roll buttons on character sheet (next to each stat/skill)
- [ ] Roll result appears in chat log for all players to see
- [ ] Private rolls (GM only, result hidden from players)
- [ ] Roll history (scrollable log)

### 4.3 Variant Support
- [ ] 2d10 mode toggle (replaces d20 with 2d10, enables degree-of-success display)
- [ ] Stress Die toggle (adds 1d6 to certain rolls when conditions met)

### 4.4 Acceptance Criteria
- A roll is visible to all players within 500ms of being made
- Natural 20 and Natural 1 are visually distinct (animation/color)
- Roll formula and result are both logged in chat

---

## 5. Combat System

### 5.1 Initiative
- [ ] "Start Combat" button (GM only) — prompts all characters/NPCs to roll initiative
- [ ] Auto-roll initiative: `1d20 + DEX Mod` for each participant
- [ ] Manual initiative override (GM can adjust order)
- [ ] Tie-breaking by raw DEX
- [ ] Visual turn order bar showing all combatants (sorted)
- [ ] Current turn indicator (whose turn it is, highlighted)

### 5.2 Turn Management
- [ ] "End Turn" button advances to next combatant
- [ ] Turn timer (optional, configurable by GM)
- [ ] Track per-turn resources: Action, Bonus Action, Reaction, Movement
- [ ] Reset these at start of each turn
- [ ] Round counter

### 5.3 Combat Actions
- [ ] Attack: select target → roll attack → compare vs AC → roll damage if hit
- [ ] Apply damage to target (auto-deduct from HP)
- [ ] Apply condition to target (select from condition list)
- [ ] Use ability/skill (deduct cost from Mana/Stamina)
- [ ] Dash (double movement)
- [ ] Disengage
- [ ] Ready an action

### 5.4 Combat State
- [ ] Real-time sync: all players see same initiative order, same turn, same HP values
- [ ] "End Combat" button (GM) — clears initiative, returns to exploration mode
- [ ] Combat log (all attacks, damage, conditions applied — timestamped)

### 5.5 Acceptance Criteria
- Initiative rolls and order display within 1 second of "Start Combat"
- HP changes reflect on all screens within 200ms
- Conditions auto-display on affected character's portrait/token

---

## 6. Interactive Map

### 6.1 Map Canvas
- [ ] Upload map image (PNG/JPG, GM only)
- [ ] Grid overlay (configurable: 5ft per square, hex optional future)
- [ ] Zoom in/out (mouse wheel + pinch on mobile)
- [ ] Pan (click-drag on background)
- [ ] Map dimensions configurable (e.g., 30x30, 50x50)

### 6.2 Tokens
- [ ] Place tokens on map (character portraits or generic icons)
- [ ] Drag-and-drop token movement (snap to grid)
- [ ] Token ownership (players can only move their own unless GM)
- [ ] Token size (1x1, 2x2, 3x3 for large creatures)
- [ ] Token labels (name, HP bar below token)
- [ ] Hidden tokens (GM-only visibility, for ambushes)

### 6.3 Measurement & Movement
- [ ] Distance measurement tool (click two points, show distance in ft)
- [ ] Movement path visualization (show squares moved)
- [ ] Movement remaining indicator (30ft speed - squares moved)
- [ ] AoE templates (cone 15ft, sphere 10ft radius, line 30ft)

### 6.4 Fog of War
- [ ] GM draws revealed/hidden areas
- [ ] Players only see revealed portions of the map
- [ ] Dynamic reveal (GM reveals as party moves)
- [ ] "Reveal all" toggle for post-combat cleanup

### 6.5 GM Map Tools
- [ ] Place NPC/creature tokens
- [ ] Drawing tools (freehand, rectangle, circle) for terrain notes
- [ ] Ping (highlight a location for all players)
- [ ] Multiple maps per campaign (switch between them)

### 6.6 Acceptance Criteria
- Token drag-and-drop feels responsive (< 50ms visual feedback)
- Token position syncs to all clients within 200ms
- Map loads in under 3 seconds for images up to 5MB
- Zoom/pan is smooth at 60fps

---

## 7. Inventory & Equipment

### 7.1 Per-Character Inventory
- [ ] Item list with columns: Name, Effect, To Hit, Range, Damage Type, Damage, AC, Current Durability, Max Durability
- [ ] Add/remove items
- [ ] Equip/unequip (equipped items affect AC, available attacks)
- [ ] Durability tracking (decrement on use, break at 0)
- [ ] Durability warning (visual at 25% remaining)

### 7.2 Item Catalog
- [ ] Master item list (from Apocalypso Item List.md) — GM can add custom items
- [ ] Search/filter items
- [ ] GM can distribute items to player inventories

### 7.3 Loot
- [ ] GM creates loot drops (list of items)
- [ ] Players can claim items from loot pool
- [ ] Trade items between characters

### 7.4 Acceptance Criteria
- Durability auto-decrements when GM clicks "combat ended"
- Items at 0 durability are visually marked "broken"
- Equipped weapon's stats auto-populate attack roll formulas

---

## 8. Skill Progression

### 8.1 Proficiency-Based Skills
- [ ] Display: Skill Name, Key Stat, Current Level, Threshold Progress, Max
- [ ] Track meaningful uses toward threshold (GM increments counter)
- [ ] Auto-advance: when threshold reached, Current +1, new threshold set
- [ ] Visual progress bar per skill (uses / threshold needed)
- [ ] Notification when a skill levels up

### 8.2 Specialized Skills
- [ ] Killing skill with cap 25 (highlight differently)
- [ ] Scavenging, Driving, Cooking, Mana Control, Pathsense, etc.
- [ ] Max cap increases with tier progression (GM can modify)

### 8.3 Starter-Zeugnis Integration
- [ ] Show subject modifiers alongside relevant skill checks
- [ ] Auto-add Zeugnis bonus to relevant rolls (e.g., Sport → Athletics)

### 8.4 Acceptance Criteria
- GM can increment skill use counter with one click
- Threshold advancement triggers a notification to the player
- Skill levels are immediately reflected in roll formulas

---

## 9. Class & Tier System

### 9.1 Class Display
- [ ] Current class name and tier (e.g., "Guardian — 1st Advancement")
- [ ] Class progression tree visualization (show path from Tier 1 → 5)
- [ ] Highlight current position on the tree
- [ ] Show branching options at Tier 3/4/5 (what you could become)
- [ ] XP tracking (current / needed for next level)

### 9.2 Class Skills
- [ ] List all gained class skills (passive, auto-active, chosen active)
- [ ] Show Mastery level per skill (Base / Mastery I / Mastery II)
- [ ] Track uses toward mastery (count / 10 for M1, count / 25 for M2)
- [ ] Skill cards with: Name, Type, Action Type, Range, Effect, Duration, Cost
- [ ] Quick-use button (deducts cost, logs to chat)

### 9.3 Advancement
- [ ] When XP threshold met, GM triggers advancement
- [ ] Show skill choices (Option A vs Option B) for player to pick
- [ ] Lock in choice (cannot change after confirmation)
- [ ] Apply stat bonuses from archetype automatically

### 9.4 Acceptance Criteria
- Class tree is visually clear and clickable for info
- Skill mastery progression is visible at a glance
- Advancement choice is a one-time decision with confirmation dialog

---

## 10. Power Paths

### 10.1 Path Tracking
- [ ] Which path(s) the character is on (can be multiple if compatible)
- [ ] Current advancement level (1–4)
- [ ] Abilities unlocked at current level
- [ ] Prerequisites for next level shown
- [ ] Compatibility matrix (which paths conflict)

### 10.2 Path Abilities
- [ ] List unlocked abilities with full mechanics
- [ ] Quick-use buttons (deduct costs, apply effects)
- [ ] Visual indicators for active path effects

### 10.3 Beast Path Specific
- [ ] Which beast traits absorbed (list with tier)
- [ ] Trait effects (passive and active)
- [ ] Fusion tracking (if applicable)

### 10.4 Acceptance Criteria
- Power Path info is accessible from character sheet in 1 click
- Abilities show costs and can be activated directly

---

## 11. The System & Daily Quests

### 11.1 Quest Display
- [ ] Active quests panel showing: Objective, Time Remaining, Penalty, Reward, Recommended Level
- [ ] Countdown timer (real-time or in-game day tracking)
- [ ] Quest status: Active / Completed / Failed
- [ ] System notification style (styled to look like an in-game System popup)

### 11.2 GM Quest Tools
- [ ] Create quest (fill in objective, duration, penalty, reward, level)
- [ ] Assign quest to specific character(s) or whole party
- [ ] Mark quest complete (distribute reward automatically)
- [ ] Mark quest failed (apply penalty)
- [ ] Schedule quest appearance (triggers at specific in-game day)

### 11.3 System Messages
- [ ] GM can send "System" messages styled differently from normal chat
- [ ] Glitched text style for Forbidden Path messages
- [ ] Status Vision notifications (contextual info popups for characters with Status Vision)

### 11.4 Acceptance Criteria
- Quests appear as dramatic styled notifications, not plain text
- Timer counts down visually
- Penalties auto-apply on failure (death = character marked dead, stat loss = auto-deducted)

---

## 12. Conditions & Status Effects

### 12.1 Condition List
All 15 conditions from the game:
- Physical: Stunned, Weakened, Burning, Slowed, Bleeding, Prone
- Mental: Confused, Disoriented, Feared, Restrained
- Special: Taunted, Anti-Taunted, Sepsis, Gravity Warp
- Fatigue: Exhausted (with stacking)

### 12.2 Condition Application
- [ ] GM or abilities can apply conditions to any combatant
- [ ] Duration tracking (X rounds remaining)
- [ ] Auto-expire: conditions with round durations tick down each turn
- [ ] Save-to-end: prompt save at start/end of turn for applicable conditions
- [ ] Visual indicator on character portrait and token (icon overlay)
- [ ] Mechanical effects auto-applied (e.g., Stunned = can't take actions, Slowed = half movement)

### 12.3 Acceptance Criteria
- Applying a condition shows immediately on the character's token and sheet
- Round-based conditions auto-decrement each turn
- Condition effects are visually summarized (tooltip showing what's restricted)

---

## 13. NPC & Creature Management

### 13.1 NPC Sheets
- [ ] Same format as player character sheets (stats, abilities, equipment)
- [ ] GM-only visibility (players can't see NPC stat blocks)
- [ ] Quick-create from creature template (select creature type, auto-populate)
- [ ] Creature catalog (all 41 creatures from Creatures/ folder as templates)

### 13.2 Encounter Builder
- [ ] Select creatures from catalog → set quantity → place on map
- [ ] Auto-roll initiative for all creatures
- [ ] Group initiative (all same creature type share one initiative)
- [ ] HP tracking per creature instance
- [ ] Creature abilities listed with quick-use buttons

### 13.3 Creature Templates
- [ ] Beasts (25 types, Tier 1–5)
- [ ] Void Creatures (16 types, organized by category)
- [ ] Custom creatures (GM can create and save)

### 13.4 Acceptance Criteria
- GM can set up a 5-creature encounter in under 60 seconds
- Creature HP depletes individually when targeted
- Dead creatures are marked and removed from initiative

---

## 14. Chat & Dice Log

### 14.1 Features
- [ ] Real-time text chat between all connected players
- [ ] Dice roll results appear inline (formatted: who rolled, formula, result, success/fail)
- [ ] System messages (styled differently — gold/purple for The System)
- [ ] Whisper messages (GM ↔ specific player, hidden from others)
- [ ] Timestamps
- [ ] Scrollable history (persists between sessions)

### 14.2 Acceptance Criteria
- Messages appear within 500ms of being sent
- Dice results show: player name, formula, individual dice, total, vs DC if applicable
- Chat history loads previous session's messages on reconnect

---

## 15. GM Tools

### 15.1 GM Dashboard
- [ ] Overview of all characters (HP, Mana, Stamina at a glance)
- [ ] Quick-damage/heal buttons (select character, input amount)
- [ ] Quick condition apply (select character + condition + duration)
- [ ] "Rest" buttons: Short Rest (restore Mana/Stamina) / Long Rest (restore all)
- [ ] In-game day tracker (advance day)
- [ ] Session notes (per-session text area)

### 15.2 Secret Info
- [ ] GM notes per character (invisible to players)
- [ ] Hidden dice rolls
- [ ] Hidden map tokens (only GM sees)
- [ ] Spoiler-tagged quest outcomes

### 15.3 Acceptance Criteria
- GM can damage a character in 2 clicks (select + amount)
- Short/Long rest applies correct resource restoration to ALL characters simultaneously
- Day advancement triggers any scheduled quests

---

## 16. Corruption Tracker

### 16.1 Features
- [ ] Visual meter (0–100%) with color gradient (green → yellow → red → purple)
- [ ] Threshold markers at 25%, 50%, 75%, 100%
- [ ] GM can add/remove corruption
- [ ] History log (what caused each corruption change)
- [ ] Threshold alerts (notification when crossing 25/50/75/100)
- [ ] At 100%: character marked as "corrupted" with special visual treatment

### 16.2 Acceptance Criteria
- Corruption changes are logged with reason
- Crossing a threshold triggers a dramatic notification

---

## 17. Rune Magic (Future)

### 17.1 Features (Phase 2+)
- [ ] Rune crafting interface: select Base Rune + Modifier + Catalyst
- [ ] Spell result display (effect, cost, risk)
- [ ] Rune language selector (Aetheric / Chthonic / Mnemonic)
- [ ] Combination detection (Forbidden Sigils, Echo Blessings, Soul Chains)
- [ ] Visual rune display (stylized per language)

### 17.2 Acceptance Criteria
- TBD (pending full rune magic mechanics design)

---

## 18. Non-Functional Requirements

### 18.1 Performance
- [ ] Initial page load: < 3 seconds
- [ ] Real-time updates: < 200ms propagation
- [ ] Map interaction: 60fps during zoom/pan/drag
- [ ] Support 7 simultaneous connections without degradation

### 18.2 Responsive Design
- [ ] Desktop primary (1920x1080 optimized)
- [ ] Tablet usable (1024x768)
- [ ] Mobile: character sheet view only (map not required on mobile)

### 18.3 Reliability
- [ ] Offline tolerance: queue writes when disconnected, sync on reconnect
- [ ] No data loss on browser refresh
- [ ] Auto-save (no manual save button needed)

### 18.4 Security
- [ ] Firestore security rules enforce role-based access
- [ ] Players cannot modify other players' data
- [ ] GM role cannot be self-assigned (only original campaign creator)
- [ ] No sensitive data stored client-side beyond auth tokens

### 18.5 Accessibility
- [ ] Keyboard navigation for dice rolling and turn management
- [ ] Screen reader support for character sheet values
- [ ] Color-blind friendly condition indicators (icons, not just color)

---

## Priority Matrix

| Priority | Features | MVP? |
|----------|----------|------|
| **P0 — Must Have** | Auth, Character Sheets, Dice Rolling, Combat (Initiative + Turns), Chat Log | Yes |
| **P1 — Should Have** | Interactive Map (basic: image + tokens + grid), Inventory, Skill Progression, Conditions | Yes (simplified) |
| **P2 — Nice to Have** | Fog of War, Power Path UI, Class Tree Visualization, Quest System, NPC Catalog | No |
| **P3 — Future** | Rune Magic, AoE Templates, Encounter Builder, Mobile Layout, Spectator Mode | No |

---

## Data Architecture (Firestore)

```
/users/{userId}
  - displayName, email, role (global)

/campaigns/{campaignId}
  - name, gmId, currentDay, settings, createdAt

/campaigns/{campaignId}/members/{userId}
  - role: "gm" | "player"
  - characterId (reference)

/campaigns/{campaignId}/characters/{charId}
  - identity: { name, age, backstory, appearance, ... }
  - stats: { str, dex, con, int, wis, cha, lck } (each: { score, amplifier })
  - resources: { hp: {current, max}, mana: {current, max}, stamina: {current, max} }
  - class: { name, tier, xp, xpNeeded, archetype }
  - corruption: { current, history[] }
  - skills: { [skillName]: { current, threshold, max, uses } }
  - classSkills: { [skillName]: { masteryLevel, useCount } }
  - zeugnis: { [subject]: modifier }
  - powerPaths: [{ pathName, level, abilities[] }]
  - equipment: [{ name, effect, toHit, range, damageType, damage, ac, durability, maxDurability, equipped }]

/campaigns/{campaignId}/combat
  - active: boolean
  - round: number
  - currentTurnIndex: number
  - initiative: [{ characterId, roll, dexTiebreak }]

/campaigns/{campaignId}/maps/{mapId}
  - name, imageUrl, gridSize, width, height
  - fogOfWar: { revealed: [[x,y]...] }

/campaigns/{campaignId}/maps/{mapId}/tokens/{tokenId}
  - characterId (or npcId), x, y, size, visible, label

/campaigns/{campaignId}/chat/{messageId}
  - senderId, type: "text" | "roll" | "system" | "whisper"
  - content, rollFormula, rollResult, timestamp
  - recipientId (for whispers)

/campaigns/{campaignId}/quests/{questId}
  - objective, timeRemaining, penalty, reward, level
  - assignedTo: [charIds], status: "active" | "complete" | "failed"
  - createdAt, deadline

/campaigns/{campaignId}/npcs/{npcId}
  - (same structure as characters, minus player-specific fields)

/campaigns/{campaignId}/conditions/{conditionId}
  - targetId, conditionType, roundsRemaining, appliedBy, source
```

---

## Next Steps

1. Validate these requirements against actual play sessions (what do you use most?)
2. Prioritize MVP scope (P0 features only for first release)
3. Create wireframes / UI mockups for key screens
4. Set up Firebase project + scaffold React app
5. Build character sheet as proof of concept
