import { useState, useRef, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Line, Circle, Text, Image as KonvaImage, Group } from 'react-konva'
import type { MapState, MapToken, MapViewport } from '@/types/map'
import type Konva from 'konva'

interface MapCanvasProps {
  map: MapState
  isGM?: boolean
  onTokenMove?: (tokenId: string, x: number, y: number) => void
  onTokenSelect?: (token: MapToken | null) => void
  onFogReveal?: (row: number, col: number) => void
}

export default function MapCanvas({ map, isGM = false, onTokenMove, onTokenSelect, onFogReveal }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [viewport, setViewport] = useState<MapViewport>({ x: 0, y: 0, scale: 1 })
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null)
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  const [tool, setTool] = useState<'select' | 'fog' | 'measure'>('select')
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null)
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null)

  // Resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Load background image
  useEffect(() => {
    if (!map.imageUrl) { setBgImage(null); return }
    const img = new window.Image()
    img.src = map.imageUrl
    img.onload = () => setBgImage(img)
  }, [map.imageUrl])

  const { gridSize, gridCols, gridRows } = map
  const mapWidth = gridCols * gridSize
  const mapHeight = gridRows * gridSize

  // Zoom handler
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    if (!stage) return

    const oldScale = viewport.scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const scaleBy = 1.1
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clampedScale = Math.max(0.2, Math.min(5, newScale))

    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    }

    setViewport({
      scale: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    })
  }, [viewport])

  // Token drag
  function handleTokenDragEnd(token: MapToken, e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target
    const newGridX = Math.round(node.x() / gridSize)
    const newGridY = Math.round(node.y() / gridSize)
    // Snap to grid
    node.x(newGridX * gridSize)
    node.y(newGridY * gridSize)
    onTokenMove?.(token.id, newGridX, newGridY)
  }

  function handleTokenClick(token: MapToken) {
    setSelectedTokenId(token.id === selectedTokenId ? null : token.id)
    onTokenSelect?.(token.id === selectedTokenId ? null : token)
  }

  // Stage click for tools
  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = e.target.getStage()
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const gridX = Math.floor((pointer.x - viewport.x) / viewport.scale / gridSize)
    const gridY = Math.floor((pointer.y - viewport.y) / viewport.scale / gridSize)

    if (tool === 'fog' && isGM && onFogReveal) {
      onFogReveal(gridY, gridX)
    } else if (tool === 'measure') {
      if (!measureStart) {
        setMeasureStart({ x: gridX, y: gridY })
      } else {
        setMeasureEnd({ x: gridX, y: gridY })
        setMeasureStart(null)
      }
    } else if (tool === 'select') {
      // Clicking empty space deselects
      if (e.target === stage || e.target.getParent() === stage) {
        setSelectedTokenId(null)
        onTokenSelect?.(null)
      }
    }
  }

  // Measure distance
  const measureDist = measureStart && measureEnd
    ? Math.round(Math.sqrt((measureEnd.x - measureStart.x) ** 2 + (measureEnd.y - measureStart.y) ** 2) * 5)
    : null

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex gap-1 bg-slate-900/90 border border-slate-700 rounded-lg p-1">
        <ToolButton active={tool === 'select'} onClick={() => setTool('select')} title="Select/Move">
          ↖
        </ToolButton>
        {isGM && (
          <ToolButton active={tool === 'fog'} onClick={() => setTool('fog')} title="Reveal Fog">
            👁
          </ToolButton>
        )}
        <ToolButton active={tool === 'measure'} onClick={() => { setTool('measure'); setMeasureStart(null); setMeasureEnd(null) }} title="Measure">
          📏
        </ToolButton>
        <div className="w-px bg-slate-700 mx-1" />
        <ToolButton active={false} onClick={() => setViewport({ x: 0, y: 0, scale: 1 })} title="Reset View">
          ⊡
        </ToolButton>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 left-3 z-10 text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
        {Math.round(viewport.scale * 100)}%
      </div>

      {/* Measure readout */}
      {measureDist !== null && (
        <div className="absolute top-3 right-3 z-10 text-sm text-amber-300 bg-slate-900/90 border border-amber-700/50 px-3 py-1 rounded">
          {measureDist} ft
        </div>
      )}

      <Stage
        width={dimensions.width}
        height={dimensions.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        draggable={tool === 'select'}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setViewport((v) => ({ ...v, x: e.target.x(), y: e.target.y() }))
          }
        }}
      >
        {/* Background image */}
        <Layer>
          {bgImage && (
            <KonvaImage
              image={bgImage}
              width={mapWidth}
              height={mapHeight}
            />
          )}
          {!bgImage && (
            <Rect width={mapWidth} height={mapHeight} fill="#1a1a2e" />
          )}
        </Layer>

        {/* Grid */}
        {map.showGrid && (
          <Layer listening={false} opacity={0.2}>
            {Array.from({ length: gridCols + 1 }).map((_, i) => (
              <Line
                key={`v-${i}`}
                points={[i * gridSize, 0, i * gridSize, mapHeight]}
                stroke="#94a3b8"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: gridRows + 1 }).map((_, i) => (
              <Line
                key={`h-${i}`}
                points={[0, i * gridSize, mapWidth, i * gridSize]}
                stroke="#94a3b8"
                strokeWidth={0.5}
              />
            ))}
          </Layer>
        )}

        {/* Fog of War */}
        {map.fogOfWar.length > 0 && (
          <Layer listening={false}>
            {map.fogOfWar.map((row, rowIdx) =>
              row.map((revealed, colIdx) =>
                !revealed && !isGM ? (
                  <Rect
                    key={`fog-${rowIdx}-${colIdx}`}
                    x={colIdx * gridSize}
                    y={rowIdx * gridSize}
                    width={gridSize}
                    height={gridSize}
                    fill="#0a0a0f"
                  />
                ) : !revealed && isGM ? (
                  <Rect
                    key={`fog-${rowIdx}-${colIdx}`}
                    x={colIdx * gridSize}
                    y={rowIdx * gridSize}
                    width={gridSize}
                    height={gridSize}
                    fill="#0a0a0f"
                    opacity={0.5}
                  />
                ) : null
              )
            )}
          </Layer>
        )}

        {/* Tokens */}
        <Layer>
          {map.tokens
            .filter((t) => t.visible || isGM)
            .map((token) => (
              <TokenSprite
                key={token.id}
                token={token}
                gridSize={gridSize}
                selected={token.id === selectedTokenId}
                draggable={tool === 'select'}
                onClick={() => handleTokenClick(token)}
                onDragEnd={(e) => handleTokenDragEnd(token, e)}
              />
            ))}
        </Layer>

        {/* Measure line */}
        {measureStart && measureEnd && (
          <Layer listening={false}>
            <Line
              points={[
                measureStart.x * gridSize + gridSize / 2,
                measureStart.y * gridSize + gridSize / 2,
                measureEnd.x * gridSize + gridSize / 2,
                measureEnd.y * gridSize + gridSize / 2,
              ]}
              stroke="#f59e0b"
              strokeWidth={2}
              dash={[8, 4]}
            />
          </Layer>
        )}
      </Stage>
    </div>
  )
}

// Token rendering
function TokenSprite({
  token,
  gridSize,
  selected,
  draggable,
  onClick,
  onDragEnd,
}: {
  token: MapToken
  gridSize: number
  selected: boolean
  draggable: boolean
  onClick: () => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
}) {
  const size = token.size * gridSize
  const radius = size / 2 - 4

  return (
    <Group
      x={token.x * gridSize}
      y={token.y * gridSize}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onTap={onClick}
    >
      {/* Selection ring */}
      {selected && (
        <Circle
          x={size / 2}
          y={size / 2}
          radius={radius + 4}
          stroke="#a78bfa"
          strokeWidth={2}
          dash={[4, 4]}
        />
      )}

      {/* Token body */}
      <Circle
        x={size / 2}
        y={size / 2}
        radius={radius}
        fill={token.color}
        stroke={token.visible ? '#475569' : '#ef4444'}
        strokeWidth={token.visible ? 1 : 2}
        opacity={token.visible ? 1 : 0.6}
      />

      {/* Label */}
      <Text
        x={0}
        y={size / 2 - 5}
        width={size}
        text={token.label.slice(0, 3)}
        fontSize={Math.max(10, gridSize * 0.3)}
        fill="#fff"
        align="center"
        fontStyle="bold"
      />

      {/* HP bar */}
      {token.hp && (
        <>
          <Rect
            x={4}
            y={size - 8}
            width={size - 8}
            height={4}
            fill="#1e293b"
            cornerRadius={2}
          />
          <Rect
            x={4}
            y={size - 8}
            width={(size - 8) * (token.hp.current / token.hp.max)}
            height={4}
            fill={token.hp.current / token.hp.max > 0.5 ? '#22c55e' : token.hp.current / token.hp.max > 0.25 ? '#f59e0b' : '#ef4444'}
            cornerRadius={2}
          />
        </>
      )}
    </Group>
  )
}

function ToolButton({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded text-sm transition ${
        active ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
