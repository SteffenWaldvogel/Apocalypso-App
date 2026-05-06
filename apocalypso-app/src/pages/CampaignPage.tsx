import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'
import { useDoc, useCollection, useChatOps, useCombatOps, useCharacterOps } from '@/hooks/useFirestore'
import { useCampaignActions } from '@/hooks/useCampaignActions'
import { useMapState } from '@/hooks/useMapState'
import Panel from '@/components/layout/Panel'
import CharacterSheet from '@/components/character/CharacterSheet'
import InitiativeTracker from '@/components/combat/InitiativeTracker'
import MapCanvas from '@/components/map/MapCanvas'
import MapUpload from '@/components/map/MapUpload'
import ChatLog from '@/components/chat/ChatLog'
import ChatInput from '@/components/chat/ChatInput'
import QuestSection from '@/components/quest/QuestSection'
import JoinCampaignScreen from '@/components/campaign/JoinCampaignScreen'
import SelectCharacterScreen from '@/components/campaign/SelectCharacterScreen'
import type { ChatMessage } from '@/types/chat'
import type { Character } from '@/types/character'
import type { Campaign } from '@/types/campaign'

export default function CampaignPage() {
  const { campaignId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: campaign } = useDoc<Campaign>(campaignId ? `campaigns/${campaignId}` : '')
  const { data: characters } = useCollection<Character>(campaignId ? `campaigns/${campaignId}/characters` : '')
  const { data: messages } = useCollection<ChatMessage>(campaignId ? `campaigns/${campaignId}/chat` : '', 'timestamp', 200)
  const { sendMessage } = useChatOps(campaignId || '')
  const { data: combatData } = useDoc<import('@/types/combat').CombatState>(campaignId ? `campaigns/${campaignId}/combat/state` : '')
  const { updateCombat, endCombat } = useCombatOps(campaignId || '')
  const { updateCharacter } = useCharacterOps(campaignId || '')

  const combat: import('@/types/combat').CombatState = combatData
    ? { active: combatData.active, round: combatData.round, currentTurnIndex: combatData.currentTurnIndex, initiative: combatData.initiative }
    : { active: false, round: 0, currentTurnIndex: 0, initiative: [] }

  const [myCharacter, setMyCharacter] = useState<Character | null>(null)
  const [memberRole, setMemberRole] = useState<'gm' | 'player' | null>(null)

  const isGM = campaign?.gmId === user?.uid || memberRole === 'gm'

  function addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>) {
    if (campaignId) sendMessage(msg)
  }

  const { handleStatRoll, handleAttackRoll, handleSendMessage, handleCommand } = useCampaignActions({
    userId: user?.uid || 'unknown',
    myCharacter,
    characters,
    isGM,
    addMessage,
    updateCombat,
    endCombat,
  })

  const { mapState, handleMapUpload, handleTokenMove, handleTokenSelect, handleFogReveal } = useMapState({ campaignId: campaignId || '', characters, addMessage })

  function handleCharacterUpdate(charId: string, updates: Partial<import('@/types/character').Character>) {
    const { id: _id, ...data } = updates as Record<string, unknown>
    updateCharacter(charId, data)
  }

  // Load member role — auto-register if not a member yet
  useEffect(() => {
    if (!campaignId || !user?.uid) return
    const memberRef = doc(db, `campaigns/${campaignId}/members/${user.uid}`)
    const unsubscribe = onSnapshot(memberRef, async (snap) => {
      if (snap.exists()) {
        setMemberRole(snap.data().role as 'gm' | 'player')
      } else if (campaign) {
        const role = campaign.gmId === user.uid ? 'gm' : 'player'
        await setDoc(memberRef, {
          userId: user.uid, role,
          displayName: user.displayName || user.email || 'Unknown',
        })
        await updateDoc(doc(db, `campaigns/${campaignId}`), { memberIds: arrayUnion(user.uid) })
        setMemberRole(role)
      }
    })
    return unsubscribe
  }, [campaignId, user?.uid, campaign])

  // Auto-select my character when characters load
  useEffect(() => {
    const mine = characters.find((c) => c.playerId === user?.uid)
    if (mine) setMyCharacter(mine)
  }, [characters, user?.uid])

  // GM auto-selects first character to display
  useEffect(() => {
    if (isGM && characters.length > 0 && !myCharacter) setMyCharacter(characters[0])
  }, [isGM, characters, myCharacter])

  // Not recognized as GM or player — show join screen
  if (!isGM && memberRole === null && campaign) {
    return (
      <JoinCampaignScreen
        campaign={campaign}
        campaignId={campaignId!}
        userId={user!.uid}
        displayName={user?.displayName || user?.email || 'Unknown'}
      />
    )
  }

  // Player without character — show selection
  if (!myCharacter && !isGM) {
    return (
      <SelectCharacterScreen
        campaignId={campaignId!}
        campaignName={campaign?.name || campaignId || ''}
        characters={characters}
        userId={user?.uid || ''}
        onSelect={setMyCharacter}
      />
    )
  }

  const displayCharacter = myCharacter || (isGM && characters.length > 0 ? characters[0] : null)

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left: Character Sheet */}
      <Panel id="character" title={isGM ? 'Characters (GM)' : 'Character'} side="left" defaultWidth={380} minWidth={300} maxWidth={550}>
        {isGM ? (
          <div>
            <div className="flex gap-1 p-2 border-b border-slate-700 overflow-x-auto">
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setMyCharacter(c)}
                  className={`px-3 py-1 text-xs rounded whitespace-nowrap transition ${
                    myCharacter?.id === c.id ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {c.identity.name}
                </button>
              ))}
              <button
                onClick={() => navigate(`/campaign/${campaignId}/character/new`)}
                className="px-3 py-1 text-xs bg-slate-800 text-slate-500 hover:text-slate-300 rounded"
              >
                + New
              </button>
            </div>
            {displayCharacter && (
              <>
                <button
                  onClick={() => navigate(`/campaign/${campaignId}/character/${displayCharacter.id}`)}
                  className="w-full px-3 py-1.5 text-xs text-violet-400 hover:text-violet-300 border-b border-slate-700 transition"
                >
                  Edit in Character Editor
                </button>
                <CharacterSheet character={displayCharacter} editable={true} onUpdate={(u) => handleCharacterUpdate(displayCharacter.id, u)} onRoll={handleStatRoll} onAttack={handleAttackRoll} />
              </>
            )}
          </div>
        ) : (
          displayCharacter && (
            <>
              <button
                onClick={() => navigate(`/campaign/${campaignId}/character/${displayCharacter.id}`)}
                className="w-full px-3 py-1.5 text-xs text-violet-400 hover:text-violet-300 border-b border-slate-700 transition"
              >
                Edit Character
              </button>
              <CharacterSheet character={displayCharacter} editable={true} onRoll={handleStatRoll} onAttack={handleAttackRoll} />
            </>
          )
        )}
      </Panel>

      {/* Center: Map */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {combat.active && (
          <div className="p-3 border-b border-slate-700 flex-shrink-0">
            <InitiativeTracker
              combat={combat}
              onNextTurn={isGM ? () => {
                const next = (combat.currentTurnIndex + 1) % combat.initiative.length
                updateCombat({ ...combat, currentTurnIndex: next, round: next === 0 ? combat.round + 1 : combat.round })
              } : undefined}
              onEndCombat={isGM ? () => {
                endCombat()
                addMessage({ senderId: 'system', senderName: 'System', type: 'system', content: 'Combat ended.' })
              } : undefined}
            />
          </div>
        )}

        <div className="flex-1 relative bg-slate-950 overflow-hidden">
          {mapState ? (
            <MapCanvas map={mapState} isGM={isGM} onTokenMove={handleTokenMove} onTokenSelect={handleTokenSelect} onFogReveal={handleFogReveal} />
          ) : (
            <MapUpload onUpload={handleMapUpload} />
          )}
        </div>

        {isGM && (
          <div className="px-4 py-2 border-t border-slate-700 bg-slate-900/80 flex items-center gap-4 text-xs text-slate-500">
            <span className="text-amber-400 font-bold">GM</span>
            <span>Day {campaign?.currentDay || 1}</span>
            <span>{characters.length} characters</span>
            <span>Campaign ID: <code className="text-slate-400">{campaignId}</code></span>
          </div>
        )}
      </div>

      {/* Right: Chat */}
      <Panel id="chat" title="Chat" side="right" defaultWidth={320} minWidth={260} maxWidth={500}>
        <div className="flex flex-col h-full">
          <QuestSection />
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <ChatLog messages={messages} currentUserId={user?.uid || 'unknown'} currentCharacterName={myCharacter?.identity.name} isGM={isGM} />
            <ChatInput onSend={handleSendMessage} onCommand={handleCommand} placeholder="Message or /roll 1d20+5..." />
          </div>
        </div>
      </Panel>
    </div>
  )
}
