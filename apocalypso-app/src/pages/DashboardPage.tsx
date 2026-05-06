import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'
import { useCollection, useCampaignOps } from '@/hooks/useFirestore'
import type { Campaign } from '@/types/campaign'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { createCampaign, joinCampaign } = useCampaignOps()
  const { data: campaigns, loading } = useCollection<Campaign>('campaigns')
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [campaignName, setCampaignName] = useState('')

  // Show all campaigns (small group — no need to filter heavily)
  const myCampaigns = campaigns

  async function handleCreate() {
    if (!user || !campaignName.trim()) return
    setCreating(true)
    const id = await createCampaign(user.uid, campaignName.trim())
    setCampaignName('')
    setCreating(false)
    navigate(`/campaign/${id}`)
  }

  async function handleJoin() {
    if (!user || !joinCode.trim()) return
    await joinCampaign(joinCode.trim(), user.uid, user.displayName || user.email || 'Player')
    setJoinCode('')
    navigate(`/campaign/${joinCode.trim()}`)
  }

  return (
    <div className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-violet-300">Apocalypso</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{user?.email}</span>
          <span className="text-slate-600 text-xs font-mono">{user?.uid?.slice(0, 8)}</span>
          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Create Campaign */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Your Campaigns</h2>

          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : myCampaigns.length > 0 ? (
            <div className="space-y-3 mb-4">
              {myCampaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/campaign/${c.id}`)}
                  className="w-full text-left p-4 bg-slate-900 border border-slate-700 hover:border-violet-500/50 rounded-xl transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-medium">{c.name}</span>
                    <span className="text-xs text-slate-500">Day {c.currentDay}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">ID: {c.id}</p>
                </button>
              ))}
            </div>
          ) : null}

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="New campaign name..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={creating || !campaignName.trim()}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                {creating ? '...' : 'Create'}
              </button>
            </div>
          </div>
        </section>

        {/* Join Campaign */}
        <section>
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Join a Campaign</h2>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <p className="text-xs text-slate-500 mb-3">Enter the campaign ID from your GM:</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Campaign ID..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 font-medium rounded-lg transition"
              >
                Join
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
