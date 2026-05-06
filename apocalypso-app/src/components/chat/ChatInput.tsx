import { useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  onCommand?: (command: string, args: string) => void
  placeholder?: string
}

export default function ChatInput({ onSend, onCommand, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    // Check for commands
    if (trimmed.startsWith('/') && onCommand) {
      const spaceIndex = trimmed.indexOf(' ')
      const command = spaceIndex > 0 ? trimmed.slice(1, spaceIndex) : trimmed.slice(1)
      const args = spaceIndex > 0 ? trimmed.slice(spaceIndex + 1) : ''
      onCommand(command, args)
    } else {
      onSend(trimmed)
    }

    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-slate-700">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder || 'Type a message or /roll 1d20+5...'}
        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition"
      >
        Send
      </button>
    </form>
  )
}
