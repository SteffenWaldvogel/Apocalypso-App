import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'
import { useDoc, useCharacterOps } from '@/hooks/useFirestore'
import type { Character } from '@/types/character'
import { createDefaultCharacter } from '@/types/characterDefaults'

const STAT_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'lck'] as const
const STAT_LABELS: Record<string, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA', lck: 'LCK' }

export default function CharacterEditorPage() {
  const { campaignId, characterId } = useParams()
  const navigate = useNavigate()
  const { data: loadedCharacter } = useDoc<Character>(
    campaignId && characterId ? `campaigns/${campaignId}/characters/${characterId}` : ''
  )
  const { updateCharacter } = useCharacterOps(campaignId || '')
  const [character, setCharacter] = useState<Character | null>(null)
  const [saving, setSaving] = useState(false)

  // Sync loaded character into local state for editing
  useEffect(() => {
    if (loadedCharacter && !character) setCharacter(loadedCharacter)
  }, [loadedCharacter, character])

  async function handleSave() {
    if (!characterId || !character) return
    setSaving(true)
    const { id: _id, ...data } = character
    await updateCharacter(characterId, data)
    setSaving(false)
  }

  function updateField(path: string, value: unknown) {
    if (!character) return
    setCharacter((prev) => {
      if (!prev) return prev
      const copy = structuredClone(prev)
      const keys = path.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let obj: any = copy
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>
      }
      obj[keys[keys.length - 1]] = value
      return copy
    })
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading character...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-violet-300">{character.identity.name || 'New Character'}</h1>
          <p className="text-sm text-slate-500">{character.class.name} — Tier {character.class.tier}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/campaign/${campaignId}`)}
            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition"
          >
            Back to Game
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Identity */}
        <Section title="Identity">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={character.identity.name} onChange={(v) => updateField('identity.name', v)} />
            <Field label="Age" value={String(character.identity.age)} onChange={(v) => updateField('identity.age', Number(v))} />
            <Field label="Residence" value={character.identity.residence} onChange={(v) => updateField('identity.residence', v)} />
            <Field label="Hobbies" value={character.identity.hobbies} onChange={(v) => updateField('identity.hobbies', v)} />
          </div>
          <div className="mt-3">
            <label className="text-xs text-slate-500">Personality</label>
            <input
              value={character.identity.personality}
              onChange={(e) => updateField('identity.personality', e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="mt-3">
            <label className="text-xs text-slate-500">Backstory</label>
            <textarea
              value={character.identity.backstory}
              onChange={(e) => updateField('identity.backstory', e.target.value)}
              rows={3}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-violet-500 resize-y"
            />
          </div>
        </Section>

        {/* Class & Core */}
        <Section title="Class & Core">
          <div className="grid grid-cols-4 gap-4">
            <Field label="Class" value={character.class.name} onChange={(v) => updateField('class.name', v)} />
            <Field label="Tier" value={String(character.class.tier)} onChange={(v) => updateField('class.tier', Number(v))} />
            <Field label="Archetype" value={character.class.archetype} onChange={(v) => updateField('class.archetype', v)} />
            <Field label="XP" value={`${character.class.xp}/${character.class.xpNeeded}`} onChange={() => {}} disabled />
          </div>
          <div className="grid grid-cols-5 gap-4 mt-4">
            <Field label="HP" value={String(character.resources.hp.max)} onChange={(v) => { updateField('resources.hp.max', Number(v)); updateField('resources.hp.current', Number(v)) }} />
            <Field label="Stamina" value={String(character.resources.stamina.max)} onChange={(v) => { updateField('resources.stamina.max', Number(v)); updateField('resources.stamina.current', Number(v)) }} />
            <Field label="Mana" value={String(character.resources.mana.max)} onChange={(v) => { updateField('resources.mana.max', Number(v)); updateField('resources.mana.current', Number(v)) }} />
            <Field label="AC" value={String(character.ac)} onChange={(v) => updateField('ac', Number(v))} />
            <Field label="Speed" value={String(character.speed)} onChange={(v) => updateField('speed', Number(v))} />
          </div>
        </Section>

        {/* Attributes */}
        <Section title="Attributes">
          <div className="grid grid-cols-7 gap-3">
            {STAT_KEYS.map((key) => (
              <div key={key} className="text-center">
                <label className="text-xs font-bold text-slate-400">{STAT_LABELS[key]}</label>
                <input
                  type="number"
                  value={character.stats[key].score}
                  onChange={(e) => updateField(`stats.${key}.score`, Number(e.target.value))}
                  className="w-full mt-1 px-2 py-2 bg-slate-800 border border-slate-600 rounded text-center text-lg font-bold text-slate-200 focus:outline-none focus:border-violet-500"
                />
                <input
                  type="number"
                  value={character.stats[key].amplifier}
                  onChange={(e) => updateField(`stats.${key}.amplifier`, Number(e.target.value))}
                  placeholder="amp"
                  className="w-full mt-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-center text-xs text-violet-400 focus:outline-none focus:border-violet-500"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Corruption */}
        <Section title="Corruption">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={character.corruption.current}
              onChange={(e) => updateField('corruption.current', Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-slate-200 w-16 text-right">{character.corruption.current}%</span>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-violet-500 disabled:opacity-50"
      />
    </div>
  )
}

// Standalone page for creating a new character
export function CreateCharacterPage() {
  const { campaignId } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  async function handleCreate() {
    if (!campaignId || !user || !name.trim()) return
    const ref = await addDoc(
      collection(db, `campaigns/${campaignId}/characters`),
      createDefaultCharacter(user.uid, campaignId, name.trim())
    )
    navigate(`/campaign/${campaignId}/character/${ref.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-8">
        <h2 className="text-xl font-bold text-violet-300 mb-4">Create Character</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Character name..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 mb-4"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          Create
        </button>
      </div>
    </div>
  )
}
