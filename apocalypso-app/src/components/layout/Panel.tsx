import { useState, useRef, useEffect } from 'react'

interface PanelProps {
  id: string
  title: string
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  side: 'left' | 'right'
  collapsible?: boolean
}

export default function Panel({
  id,
  title,
  children,
  defaultWidth = 360,
  minWidth = 280,
  maxWidth = 600,
  side,
  collapsible = true,
}: PanelProps) {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(`panel-${id}-width`)
    return saved ? Number(saved) : defaultWidth
  })
  const [collapsed, setCollapsed] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    localStorage.setItem(`panel-${id}-width`, String(width))
  }, [id, width])

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    isDragging.current = true
    const startX = e.clientX
    const startWidth = width

    function onMove(ev: MouseEvent) {
      if (!isDragging.current) return
      const delta = side === 'left' ? ev.clientX - startX : startX - ev.clientX
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta))
      setWidth(newWidth)
    }

    function onUp() {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  if (collapsed) {
    return (
      <div
        className="w-10 flex flex-col items-center py-4 bg-slate-900 cursor-pointer hover:bg-slate-800 transition"
        style={{
          borderLeft: side === 'right' ? '1px solid rgb(51, 65, 85)' : undefined,
          borderRight: side === 'left' ? '1px solid rgb(51, 65, 85)' : undefined,
        }}
        onClick={() => setCollapsed(false)}
      >
        <span className="text-xs text-slate-400">{side === 'left' ? '>' : '<'}</span>
        <span className="text-xs text-slate-500 mt-2 [writing-mode:vertical-rl]">{title}</span>
      </div>
    )
  }

  return (
    <div
      className="relative flex-shrink-0 flex flex-col overflow-hidden"
      style={{
        width: `${width}px`,
        borderLeft: side === 'right' ? '1px solid rgb(51, 65, 85)' : undefined,
        borderRight: side === 'left' ? '1px solid rgb(51, 65, 85)' : undefined,
      }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-900/80">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</span>
        {collapsible && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-300 text-xs"
            title="Collapse"
          >
            {side === 'left' ? '<' : '>'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Resize handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        className={`absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-500/50 transition ${
          side === 'left' ? 'right-0' : 'left-0'
        }`}
      />
    </div>
  )
}
