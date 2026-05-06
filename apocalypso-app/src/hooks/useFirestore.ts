import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Campaign } from '@/types/campaign'
import type { ChatMessage } from '@/types/chat'
import type { CombatState } from '@/types/combat'
import { createDefaultCharacter } from '@/types/characterDefaults'

// Listen to a single document
export function useDoc<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!path) { setLoading(false); return }
    const unsubscribe = onSnapshot(
      doc(db, path),
      (snap) => {
        setData(snap.exists() ? { id: snap.id, ...snap.data() } as T : null)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [path])

  return { data, loading, error }
}

// Listen to a collection
export function useCollection<T>(path: string, orderField?: string, limitCount?: number) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!path) { setLoading(false); return }
    const ref = collection(db, path)
    const constraints = []
    if (orderField) constraints.push(orderBy(orderField))
    if (limitCount) constraints.push(limit(limitCount))

    const q = constraints.length > 0 ? query(ref, ...constraints) : ref
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
        setData(items)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [path, orderField, limitCount])

  return { data, loading, error }
}

// Campaign operations
export function useCampaignOps() {
  async function createCampaign(gmId: string, name: string): Promise<string> {
    const ref = await addDoc(collection(db, 'campaigns'), {
      name,
      description: '',
      gmId,
      currentDay: 1,
      settings: { diceMode: 'd20', defenseRolls: false, stressDie: false },
      createdAt: Date.now(),
      lastSessionAt: Date.now(),
    } as Omit<Campaign, 'id'>)
    return ref.id
  }

  async function joinCampaign(campaignId: string, userId: string, displayName: string) {
    await setDoc(doc(db, `campaigns/${campaignId}/members/${userId}`), {
      userId,
      role: 'player',
      displayName,
    })
  }

  return { createCampaign, joinCampaign }
}

// Character operations
export function useCharacterOps(campaignId: string) {
  async function createCharacter(playerId: string, name: string): Promise<string> {
    const ref = await addDoc(
      collection(db, `campaigns/${campaignId}/characters`),
      createDefaultCharacter(playerId, campaignId, name)
    )
    return ref.id
  }

  async function updateCharacter(charId: string, updates: Partial<DocumentData>) {
    await updateDoc(doc(db, `campaigns/${campaignId}/characters/${charId}`), updates)
  }

  async function deleteCharacter(charId: string) {
    await deleteDoc(doc(db, `campaigns/${campaignId}/characters/${charId}`))
  }

  return { createCharacter, updateCharacter, deleteCharacter }
}

// Chat operations
export function useChatOps(campaignId: string) {
  async function sendMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>) {
    await addDoc(collection(db, `campaigns/${campaignId}/chat`), {
      ...msg,
      timestamp: serverTimestamp(),
    })
  }

  return { sendMessage }
}

// Combat operations — single doc at campaigns/{id}/combat/state
export function useCombatOps(campaignId: string) {
  const combatDocPath = `campaigns/${campaignId}/combat/state`

  async function updateCombat(state: CombatState) {
    await setDoc(doc(db, combatDocPath), state)
  }

  async function endCombat() {
    await setDoc(doc(db, combatDocPath), {
      active: false,
      round: 0,
      currentTurnIndex: 0,
      initiative: [],
    } satisfies CombatState)
  }

  return { updateCombat, endCombat }
}
