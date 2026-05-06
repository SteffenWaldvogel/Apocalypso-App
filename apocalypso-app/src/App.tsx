import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import CampaignPage from '@/pages/CampaignPage'
import CharacterEditorPage, { CreateCharacterPage } from '@/pages/CharacterEditorPage'

function App() {
  const { user, loading, setUser } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return unsubscribe
  }, [setUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-violet-400 text-xl animate-pulse">
          The System is loading...
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/campaign/:campaignId" element={user ? <CampaignPage /> : <Navigate to="/login" />} />
        <Route path="/campaign/:campaignId/character/new" element={user ? <CreateCharacterPage /> : <Navigate to="/login" />} />
        <Route path="/campaign/:campaignId/character/:characterId" element={user ? <CharacterEditorPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
