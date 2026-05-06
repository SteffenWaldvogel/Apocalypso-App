import { useState } from 'react'
import type { Character } from '@/types/character'
import type { MapState, MapToken } from '@/types/map'
import type { ChatMessage } from '@/types/chat'

const GRID_SIZE = 40
const TOKEN_START_X = 3
const TOKEN_SPACING = 2
const TOKEN_START_Y = 3

interface UseMapStateParams {
  characters: Character[]
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
}

export function useMapState({ characters, addMessage }: UseMapStateParams) {
  const [mapState, setMapState] = useState<MapState | null>(null)

  function handleMapUpload(imageUrl: string, width: number, height: number) {
    setMapState({
      id: 'map-1', name: 'Battle Map', imageUrl, gridSize: GRID_SIZE,
      gridCols: Math.ceil(width / GRID_SIZE), gridRows: Math.ceil(height / GRID_SIZE),
      showGrid: true,
      tokens: characters.map((c, i) => ({
        id: `t-${c.id}`, characterId: c.id, label: c.identity.name.slice(0, 3),
        x: TOKEN_START_X + i * TOKEN_SPACING, y: TOKEN_START_Y, size: 1 as const, color: '#7c3aed', visible: true,
        hp: { current: c.resources.hp.current, max: c.resources.hp.max },
      })),
      fogOfWar: [],
    })
  }

  function handleTokenMove(tokenId: string, x: number, y: number) {
    setMapState((prev) => prev ? { ...prev, tokens: prev.tokens.map((t) => t.id === tokenId ? { ...t, x, y } : t) } : prev)
  }

  function handleTokenSelect(token: MapToken | null) {
    if (token) addMessage({ senderId: 'system', senderName: 'System', type: 'system', content: `Selected: ${token.label}${token.hp ? ` (HP: ${token.hp.current}/${token.hp.max})` : ''}` })
  }

  return { mapState, handleMapUpload, handleTokenMove, handleTokenSelect }
}
