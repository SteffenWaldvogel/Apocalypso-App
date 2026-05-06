import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  async function handleGoogle() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-slate-900 border border-violet-800/50 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-violet-300 mb-2">
          Apocalypso
        </h1>
        <p className="text-center text-slate-400 mb-8 text-sm">
          The System is watching.
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={handleGoogle}
          className="w-full mt-3 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-medium rounded-lg transition"
        >
          Continue with Google
        </button>

        <p className="text-center text-slate-500 mt-6 text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-violet-400 hover:text-violet-300"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
