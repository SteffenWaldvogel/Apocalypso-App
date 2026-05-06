import { useCallback } from 'react'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useDoc } from './useFirestore'
import type { Character } from '@/types/character'
import type { MapState, MapToken } from '@/types/map'
import type { ChatMessage } from '@/types/chat'

const GRID_SIZE = 40
const TOKEN_START_X = 3
const TOKEN_SPACING = 2
const TOKEN_START_Y = 3

interface UseMapStateParams {
  campaignId: string
  characters: Character[]
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
}

export function useMapState({ campaignId, characters, addMessage }: UseMapStateParams) {
  const mapDocPath = campaignId ? `campaigns/${campaignId}/maps/current` : ''
  const { data: mapState } = useDoc<MapState>(mapDocPath)

  const saveMap = useCallback(async (state: MapState) => {
    if (!campaignId) return
    const { id: _id, ...data } = state as MapState & { id: string }
    await setDoc(doc(db, `campaigns/${campaignId}/maps/current`), data)
  }, [campaignId])

  async function handleMapUpload(imageUrl: string, width: number, height: number, file?: File) {
    let finalUrl = imageUrl

    // Upload to Firebase Storage if a file is provided
    if (file && campaignId) {
      const storageRef = ref(storage, `campaigns/${campaignId}/maps/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      finalUrl = await getDownloadURL(storageRef)
    }

    const state: MapState = {
      id: 'current', name: 'Battle Map', imageUrl: finalUrl, gridSize: GRID_SIZE,
      gridCols: Math.ceil(width / GRID_SIZE), gridRows: Math.ceil(height / GRID_SIZE),
      showGrid: true,
      tokens: characters.map((c, i) => ({
        id: `t-${c.id}`, characterId: c.id, label: c.identity.name.slice(0, 3),
        x: TOKEN_START_X + i * TOKEN_SPACING, y: TOKEN_START_Y, size: 1 as const, color: '#7c3aed', visible: true,
        hp: { current: c.resources.hp.current, max: c.resources.hp.max },
      })),
      fogOfWar: [],
    }
    await saveMap(state)
  }

  async function handleTokenMove(tokenId: string, x: number, y: number) {
    if (!mapState || !campaignId) return
    const updatedTokens = mapState.tokens.map((t) => t.id === tokenId ? { ...t, x, y } : t)
    await updateDoc(doc(db, `campaigns/${campaignId}/maps/current`), { tokens: updatedTokens })
  }

  function handleTokenSelect(token: MapToken | null) {
    if (token) addMessage({ senderId: 'system', senderName: 'System', type: 'system', content: `Selected: ${token.label}${token.hp ? ` (HP: ${token.hp.current}/${token.hp.max})` : ''}` })
  }

  async function handleFogReveal(row: number, col: number) {
    if (!mapState || !campaignId) return
    // Initialize fog grid if empty
    let fog = mapState.fogOfWar
    if (!fog || fog.length === 0) {
      fog = Array.from({ length: mapState.gridRows }, () => Array(mapState.gridCols).fill(false))
    }
    // Toggle the cell
    const updatedFog = fog.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? !c : c) : r)
    await updateDoc(doc(db, `campaigns/${campaignId}/maps/current`), { fogOfWar: updatedFog })
  }

  return { mapState, handleMapUpload, handleTokenMove, handleTokenSelect, handleFogReveal }
}
