import { useNavigate } from 'react-router-dom'
import type { Character } from '@/types/character'

interface SelectCharacterScreenProps {
  campaignId: string
  campaignName: string
  characters: Character[]
  userId: string
  onSelect: (character: Character) => void
}

export default function SelectCharacterScreen({ campaignId, campaignName, characters, userId, onSelect }: SelectCharacterScreenProps) {
  const navigate = useNavigate()
  const myCharacters = characters.filter((c) => c.playerId === userId)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-violet-300 mb-2">Select Your Character</h2>
        <p className="text-sm text-slate-500 mb-6">Campaign: {campaignName}</p>

        {myCharacters.length > 0 ? (
          <div className="space-y-2 mb-4">
            {myCharacters.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition"
              >
                <span className="text-slate-200">{c.identity.name}</span>
                <span className="text-xs text-slate-500 ml-2">{c.class.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 mb-4">You have no characters in this campaign.</p>
        )}

        <button
          onClick={() => navigate(`/campaign/${campaignId}/character/new`)}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition"
        >
          Create New Character
        </button>
      </div>
    </div>
  )
}
