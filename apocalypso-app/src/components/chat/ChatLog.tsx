import { useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types/chat'

interface ChatLogProps {
  messages: ChatMessage[]
  currentUserId: string
  currentCharacterName?: string
  isGM?: boolean
}

export default function ChatLog({ messages, currentUserId, currentCharacterName, isGM }: ChatLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {messages.length === 0 && (
          <p className="text-center text-slate-500 text-sm mt-8">No messages yet.</p>
        )}
        {messages
          .filter((msg) => {
            if (msg.type !== 'whisper') return true
            if (isGM) return true
            if (msg.senderId === currentUserId) return true
            if (msg.recipientId === currentCharacterName) return true
            return false
          })
          .map((msg) => (
          <MessageItem key={msg.id} message={msg} isOwn={msg.senderId === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function formatTime(timestamp: unknown): string {
  if (!timestamp) return ''
  const date = typeof timestamp === 'number' ? new Date(timestamp) : (timestamp as { toDate?: () => Date }).toDate?.() ?? new Date()
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageItem({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  if (message.type === 'system') {
    return (
      <div className="text-center py-2">
        <div className="inline-block px-4 py-2 bg-amber-900/20 border border-amber-500/30 rounded-lg">
          <p className="text-xs text-amber-400 font-bold mb-0.5">SYSTEM</p>
          <p className="text-sm text-amber-200">{message.content}</p>
        </div>
      </div>
    )
  }

  if (message.type === 'roll' && message.rollResult) {
    const { rollResult } = message
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[280px] p-3 rounded-lg border ${
          rollResult.isNat20 ? 'bg-amber-900/20 border-amber-500/40' :
          rollResult.isNat1 ? 'bg-red-900/20 border-red-500/40' :
          'bg-slate-800 border-slate-700'
        }`}>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs text-slate-400">{message.senderName} rolled</p>
            <span className="text-[10px] text-slate-600">{formatTime(message.timestamp)}</span>
          </div>
          <p className="text-xs text-slate-500 font-mono">{rollResult.formula}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-2xl font-bold ${
              rollResult.isNat20 ? 'text-amber-400' :
              rollResult.isNat1 ? 'text-red-400' :
              rollResult.success === true ? 'text-green-400' :
              rollResult.success === false ? 'text-red-300' :
              'text-slate-100'
            }`}>
              {rollResult.total}
            </span>
            {rollResult.isNat20 && <span className="text-xs font-bold text-amber-400">CRIT!</span>}
            {rollResult.isNat1 && <span className="text-xs font-bold text-red-400">FUMBLE!</span>}
            {rollResult.vsDC !== undefined && (
              <span className="text-xs text-slate-400">vs DC {rollResult.vsDC}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            [{rollResult.rolls.join(', ')}]
          </p>
          {message.content && (
            <p className="text-xs text-slate-400 mt-1 italic">{message.content}</p>
          )}
        </div>
      </div>
    )
  }

  if (message.type === 'whisper') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[280px] px-3 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-purple-400 mb-0.5">
            {isOwn ? 'Whisper sent' : `${message.senderName} whispers`}
          </p>
          <p className="text-sm text-purple-200 italic">{message.content}</p>
        </div>
      </div>
    )
  }

  // Regular text message
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[280px] px-3 py-2 rounded-lg ${
        isOwn ? 'bg-violet-800/40 border border-violet-600/30' : 'bg-slate-800 border border-slate-700'
      }`}>
        <div className="flex items-baseline justify-between gap-2">
          {!isOwn && <p className="text-xs text-slate-400">{message.senderName}</p>}
          <span className="text-[10px] text-slate-600 ml-auto">{formatTime(message.timestamp)}</span>
        </div>
        <p className="text-sm text-slate-200">{message.content}</p>
      </div>
    </div>
  )
}
