export interface MapToken {
  id: string
  characterId?: string
  npcId?: string
  label: string
  x: number // grid position (column)
  y: number // grid position (row)
  size: 1 | 2 | 3 // 1x1, 2x2, 3x3 grid squares
  color: string
  imageUrl?: string
  visible: boolean // false = GM-only (hidden from players)
  hp?: { current: number; max: number }
}

export interface MapState {
  id: string
  name: string
  imageUrl: string | null
  gridSize: number // pixels per grid square
  gridCols: number
  gridRows: number
  showGrid: boolean
  tokens: MapToken[]
  fogOfWar: boolean[][]  // [row][col] = true means revealed
}

export interface MapViewport {
  x: number
  y: number
  scale: number
}
