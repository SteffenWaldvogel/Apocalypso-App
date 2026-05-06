# Apocalypso Web App - Feasibility Report

**Date:** 2026-05-05
**Scope:** Combined VTT + Character Management web application for custom TTRPG "Apocalypso"
**Target:** 1 GM + 3-6 players, real-time multiplayer

---

## Executive Summary

**Verdict: Feasible, but significant effort. Firebase is a strong backend choice for this scale.**

Building a combined Roll20 + D&D Beyond style app on Firebase is technically sound for 4-7 concurrent users. Firebase handles real-time sync, auth, hosting, and storage well at this scale. The primary challenges are frontend complexity (especially the interactive map) and the sheer breadth of features. A solo developer should expect 6-12 months for an MVP and 12-18+ months for a polished product.

---

## Firebase Evaluation

### 1. Firestore - Real-Time Sync

**Verdict: Well-suited for this use case.**

- Firestore's real-time listeners deliver updates in sub-100ms for small document changes (often 10-50ms on same-region connections)
- At 4-7 concurrent users, you are nowhere near Firestore's scaling limits
- Combat state, token positions, HP changes, initiative order -- all fit naturally as document updates with `onSnapshot` listeners
- Offline persistence is built-in, so disconnections during play are handled gracefully

**Recommended document structure:**
```
/campaigns/{campaignId}
/campaigns/{campaignId}/characters/{charId}
/campaigns/{campaignId}/combatState          (single doc: initiative, round, active turn)
/campaigns/{campaignId}/maps/{mapId}
/campaigns/{campaignId}/maps/{mapId}/tokens/{tokenId}
/campaigns/{campaignId}/chatLog/{messageId}  (dice rolls, messages)
/campaigns/{campaignId}/quests/{questId}
```

**Key consideration:** Keep documents small. Token positions should be individual documents (not an array in a map doc) so moving one token doesn't trigger a full re-read of all tokens.

### 2. Firebase Auth

**Verdict: Perfect fit.**

- Email/password or Google sign-in for players
- Custom claims for GM vs Player roles (`admin: true` on the GM)
- Security rules can enforce "only GM can modify NPC data" or "players can only edit their own character"
- Free tier supports 10,000 authentications/month (far more than needed)

### 3. Firebase Hosting

**Verdict: Perfect fit.**

- Serves the SPA with global CDN
- Automatic SSL
- Free tier: 10GB storage, 360MB/day transfer (more than enough)
- Easy CI/CD with GitHub Actions

### 4. Firebase Storage

**Verdict: Good fit with caveats.**

- Maps, character portraits, token images all store well here
- Free tier: 5GB storage, 1GB/day downloads
- For a small group, this is plenty (a campaign might use 50-200MB of map images)
- **Caveat:** No server-side image processing. If you want to generate fog-of-war tiles or resize images, you need Cloud Functions or do it client-side

### 5. Realtime Database vs Firestore

**Verdict: Use Firestore as primary, consider Realtime Database for one specific case.**

| Aspect | Firestore | Realtime Database |
|--------|-----------|-------------------|
| Latency | 10-50ms typical | 5-20ms typical |
| Data model | Documents/collections (structured) | Giant JSON tree (flexible but messy) |
| Querying | Rich queries, indexes | Limited filtering |
| Offline support | Excellent | Good |
| Scaling | Automatic | Single region, 200k concurrent |
| Cost model | Per read/write/delete | Per bandwidth + storage |

**Recommendation:** Use Firestore for everything. The latency difference (10-30ms) is imperceptible for turn-based combat. Realtime Database's slight speed edge only matters for twitch-reaction games, not tabletop RPGs where players take 30-second turns.

**Exception:** If you implement a live cursor/pointer feature (showing where other players are hovering on the map), Realtime Database's lower latency and bandwidth-based pricing could be cheaper for high-frequency updates. But this is an optional nice-to-have.

### 6. Cost Estimate (4-6 Concurrent Users)

**You will almost certainly stay within the free tier or pay under $5/month.**

Estimated usage for a 4-hour session with 5 players:
- Firestore reads: ~5,000-15,000 (listeners + character loads + combat updates)
- Firestore writes: ~500-2,000 (token moves, HP changes, dice rolls, chat)
- Storage: 100-500MB (maps, tokens)
- Hosting bandwidth: minimal (SPA loads once)

Free tier limits (daily):
- 50,000 reads
- 20,000 writes
- 20,000 deletes

**Even playing 3-4 sessions per week, you likely stay free.** If you exceed it, the Blaze plan includes the free allocation and most small apps pay $1-10/month.

**Cost risk:** The main danger is poorly designed listeners that trigger excessive reads. Example: if every player has a listener on a "gameState" document that updates 100 times per combat round, reads multiply fast. Solution: granular document structure and careful listener management.

### 7. Limitations - What Firebase Cannot Do

| Need | Firebase Can? | Workaround |
|------|--------------|------------|
| Complex game logic (damage calc, skill checks) | No server-side game engine | Run logic client-side (GM's client is authoritative) or use Cloud Functions |
| Token collision detection | No | Client-side JavaScript handles this trivially for grid-based movement |
| Fog of war | No built-in support | Client-side canvas rendering; store revealed areas in Firestore |
| Scheduled events (quest timers, condition expiry) | Not natively | Cloud Functions with scheduled triggers (cron) or client-side timers |
| Dice roll integrity (anti-cheat) | Client-side rolls can be faked | Cloud Functions for "server-side" rolls if trust is a concern |
| Complex queries across collections | Limited (no JOINs) | Denormalize data; use composite indexes |
| Full-text search (spell/item lookup) | No | Use Algolia, Typesense, or client-side filtering for small datasets |
| Audio/video chat | No | Integrate a third-party (Discord, WebRTC) |

**Critical insight:** For a trusted group of friends, client-side game logic is fine. You don't need a dedicated game server. The GM's client can serve as the "authority" for contested actions, and Firebase just syncs state.

---

## Frontend Framework Recommendation

### Recommended: React (with Next.js or Vite)

| Framework | Pros | Cons |
|-----------|------|------|
| **React** | Largest ecosystem, most canvas/game libraries, Firebase SDK designed for it, easiest to find help | Larger bundle, virtual DOM overhead |
| **Svelte** | Fastest runtime, smallest bundle, less boilerplate | Smaller ecosystem, fewer VTT-specific libraries, steeper learning curve for canvas integration |
| **Vue** | Good middle ground, excellent docs | Fewer game/canvas libraries than React |

**Why React wins here:**
1. Libraries like `react-konva`, `pixi-react`, or `@react-three/fiber` make canvas/WebGL integration straightforward
2. Firebase has first-class React integration (reactfire, react-firebase-hooks)
3. Most open-source VTT projects use React, so you can borrow code
4. If you ever need help or hire someone, React developers are abundant

**Svelte would be fine** if you're already comfortable with it. The performance advantage (30-40% smaller bundles) is nice but not critical for a 5-user app.

---

## Map Rendering: Canvas vs CSS Grid

### Verdict: Use HTML5 Canvas (via a library). CSS Grid is not viable for interactive maps.

**Why CSS Grid fails:**
- Rendering 100x100 grid cells as DOM elements kills performance
- Smooth token dragging across DOM elements is janky
- Fog of war, line-of-sight, and visual effects are nearly impossible
- Zoom/pan is awkward with DOM scaling

**Recommended approach: Konva.js (via react-konva)**

- Hardware-accelerated 2D canvas
- Built-in support for: drag-and-drop, hit detection, layering, zoom/pan
- Event handling on canvas objects (click a token, drag it)
- Excellent performance for grid-based maps up to 200x200

**Architecture for the map:**
```
Layer 1: Background map image
Layer 2: Grid overlay (rendered lines)
Layer 3: Fog of war (semi-transparent polygons)
Layer 4: Tokens (draggable sprites)
Layer 5: UI overlays (measurement lines, AoE templates)
```

**Alternative:** PixiJS for WebGL-accelerated rendering if you want particle effects, lighting, or animated tokens. More powerful but more complex.

**You do NOT need full WebGL/Three.js** unless you want 3D maps. For 2D grid-based movement, Canvas (Konva) is the right level of complexity.

---

## Existing Open-Source Projects to Leverage

| Project | What It Offers | Link |
|---------|---------------|------|
| **Fari App** | Open-source VTT with character sheets, dice rolling | https://fari.app/ |
| **Owlbear Rodeo** | Lightweight VTT with excellent map/token UX (study their approach) | https://owlbear.rodeo/ |
| **tldraw** | Infinite canvas SDK for React -- great base for map interaction | https://tldraw.dev/ |
| **react-konva** | React bindings for Konva.js canvas library | https://github.com/konvajs/react-konva |
| **Foundry VTT** | Not open-source but its module system is; study its data models | https://foundryvtt.com/ |
| **rpg-dice-roller** | JS library for parsing and rolling complex dice formulas | https://github.com/dice-roller/rpg-dice-roller |

**Key recommendation:** Don't build everything from scratch. Use `rpg-dice-roller` for dice parsing, `react-konva` for the map, and study Owlbear Rodeo's UX for token interaction patterns.

---

## Suggested Tech Stack

```
Frontend:
  - React 18+ (via Vite for fast dev, or Next.js if you want SSR)
  - TypeScript (essential for a project this complex)
  - react-konva (map/canvas rendering)
  - Zustand or Jotai (lightweight state management)
  - TailwindCSS (UI styling)
  - rpg-dice-roller (dice formula parsing)
  - react-beautiful-dnd or dnd-kit (drag-and-drop for inventory/spell lists)

Backend:
  - Firebase Auth (user accounts, GM/player roles)
  - Cloud Firestore (all game state, characters, campaigns)
  - Firebase Storage (maps, images, tokens)
  - Firebase Hosting (deploy the SPA)
  - Cloud Functions (optional: server-side dice rolls, scheduled quest timers)

Dev Tools:
  - Vite (bundler/dev server)
  - Firebase Emulator Suite (local development without hitting production)
  - GitHub Actions (CI/CD to Firebase Hosting)
```

---

## Rough Architecture

```
+------------------+       +------------------+
|   GM Client      |       |  Player Client   |
|  (React SPA)     |       |  (React SPA)     |
+--------+---------+       +--------+---------+
         |                          |
         |   Firestore Real-Time Listeners
         |   (onSnapshot)           |
         +------------+-------------+
                      |
              +-------+--------+
              |   Cloud        |
              |   Firestore    |
              |                |
              | /campaigns     |
              | /characters    |
              | /combatState   |
              | /maps/tokens   |
              | /chatLog       |
              +-------+--------+
                      |
              +-------+--------+
              | Firebase       |
              | Storage        |
              | (map images,   |
              |  token PNGs)   |
              +----------------+
```

**Data flow for combat:**
1. GM starts combat -> writes to `/campaigns/{id}/combatState`
2. All clients listen to `combatState` doc -> UI updates to show initiative tracker
3. Active player moves token -> writes new position to `/maps/{id}/tokens/{tokenId}`
4. All clients see token move in real-time via listener
5. Player rolls attack -> client generates roll, writes result to `/chatLog`
6. GM applies damage -> updates target's HP in `/characters/{id}`

---

## Scope and Effort Estimate (Solo Developer)

### Phase 1: Foundation (6-8 weeks)
- Firebase project setup, auth, basic routing
- Character sheet CRUD (stats, HP, Mana, Stamina, Corruption)
- Dice roller with custom formulas
- Real-time chat/dice log
- Basic campaign management

### Phase 2: Combat System (6-8 weeks)
- Initiative tracker with turn order
- Status conditions (apply/remove/duration tracking)
- Combat state machine (out-of-combat, in-combat, whose-turn)
- HP/resource modification during combat

### Phase 3: Interactive Map (8-12 weeks) -- THE HARDEST PART
- Canvas-based map with grid overlay
- Token placement, drag-and-drop movement
- Grid snapping (5ft per square)
- Zoom/pan controls
- Fog of war (GM reveals areas)
- Distance measurement tool

### Phase 4: Progression Systems (4-6 weeks)
- Skill threshold tracking (uses toward advancement)
- Class/tier progression tree visualization
- Power Path tracking
- Inventory with durability

### Phase 5: GM Tools (4-6 weeks)
- NPC stat block management
- Encounter builder
- Loot distribution system
- Daily Quest system with timers

### Phase 6: Polish (4-8 weeks)
- Mobile-responsive layout
- Performance optimization
- Error handling and edge cases
- Visual polish, animations

**Total estimate: 8-12 months for a usable MVP, 14-20 months for full feature set.**

### What to build FIRST (true MVP for playable sessions):
1. Character sheets with live stat tracking
2. Dice roller
3. Initiative tracker
4. Chat log
5. Simple map (image + tokens, no fog of war)

This "playable MVP" could be done in **10-14 weeks** by a focused solo developer.

---

## Risks and Tradeoffs

| Risk | Severity | Mitigation |
|------|----------|------------|
| Map/canvas is much harder than expected | HIGH | Use react-konva, study Owlbear Rodeo, accept simpler map features initially |
| Feature creep (trying to build Roll20 + D&D Beyond) | HIGH | Strict MVP discipline; build what you need for next session |
| Firestore costs spike from bad data design | LOW | Use Firebase Emulator, monitor reads carefully, denormalize wisely |
| Solo developer burnout | MEDIUM | Ship incrementally; use the app while building it |
| Real-time sync conflicts (two people edit same thing) | LOW | Firestore handles last-write-wins; for combat, only active player + GM write |
| Security (players cheating) | LOW | For friends, client-side logic is fine; add Cloud Functions later if needed |

---

## Conclusion

Firebase is an excellent choice for this project at this scale. The combination of Firestore's real-time sync, generous free tier, and zero server management makes it ideal for a solo developer building a small-group multiplayer app.

The biggest challenge is not the backend -- it's the frontend complexity of building an interactive map editor. Budget 40% of your development time for the map alone, or start with a minimal map (static image + draggable tokens) and iterate.

**Recommended next steps:**
1. Set up a Firebase project with the Emulator Suite
2. Build the character sheet + dice roller as a proof of concept
3. Test real-time sync with 2 browser windows
4. Only then tackle the map canvas

This is absolutely buildable. The question is not feasibility but scope management.

---

## Sources

- [Firebase Real-Time Queries at Scale](https://firebase.google.com/docs/firestore/real-time_queries_at_scale)
- [Firebase: Choose Firestore or Realtime Database](https://firebase.google.com/docs/database/rtdb-vs-firestore)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Pricing Details](https://cloud.google.com/firestore/pricing)
- [Firebase Pricing 2026: Free Tier Limits](https://firebasepricing.com/)
- [Building Real-Time Multiplayer with Firebase](https://paddo.dev/blog/flutter-real-time-multiplayer-firebase/)
- [Firestore vs Realtime Database Performance](https://estuary.dev/blog/firestore-vs-realtime-database/)
- [Svelte vs React in 2026: Performance & DX Compared](https://strapi.io/blog/svelte-vs-react-comparison)
- [Fari App - Open Source VTT](https://fari.app/)
- [tldraw - Infinite Canvas SDK](https://tldraw.dev/)
- [Firebase Performance: Firestore and Realtime Database Latency](https://medium.com/@d8schreiber/firebase-performance-firestore-and-realtime-database-latency-13effcade26d)
