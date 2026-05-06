import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Campaign } from '@/types/campaign'

interface JoinCampaignScreenProps {
  campaign: Campaign
  campaignId: string
  userId: string
  displayName: string
}

export default function JoinCampaignScreen({ campaign, campaignId, userId, displayName }: JoinCampaignScreenProps) {
  async function handleClaimGM() {
    if (campaign.gmId && campaign.gmId !== userId) return // prevent stealing GM from another user
    await updateDoc(doc(db, `campaigns/${campaignId}`), { gmId: userId, memberIds: arrayUnion(userId) })
    await setDoc(doc(db, `campaigns/${campaignId}/members/${userId}`), {
      userId, role: 'gm', displayName: displayName || 'GM',
    })
  }

  async function handleJoinAsPlayer() {
    await updateDoc(doc(db, `campaigns/${campaignId}`), { memberIds: arrayUnion(userId) })
    await setDoc(doc(db, `campaigns/${campaignId}/members/${userId}`), {
      userId, role: 'player', displayName: displayName || 'Player',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-violet-300 mb-2">{campaign.name}</h2>
        <p className="text-sm text-slate-500 mb-6">You're not a member of this campaign yet.</p>
        <div className="space-y-3">
          <button
            onClick={handleClaimGM}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition"
          >
            Claim as GM
          </button>
          <button
            onClick={handleJoinAsPlayer}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition"
          >
            Join as Player
          </button>
        </div>
      </div>
    </div>
  )
}
