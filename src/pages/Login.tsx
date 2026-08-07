import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Leaf } from 'lucide-react'

type Mode = 'password' | 'magic-link'

export default function Login() {
  const { session, signInWithPassword, signInWithMagicLink, signInWithGoogle } = useAuth()
  const location = useLocation() as { state?: { from?: string; message?: string } }

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    if (mode === 'password') {
      const { error } = await signInWithPassword(email, password)
      if (error) setError(error)
    } else {
      const { error } = await signInWithMagicLink(email)
      if (error) setError(error)
      else setMagicLinkSent(true)
    }

    setSubmitting(false)
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Leaf size={20} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">3T Impact Engine</h1>
          {location.state?.message && (
            <p className="mt-1 text-sm text-slate-500">{location.state.message}</p>
          )}
        </div>

        {magicLinkSent ? (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            Check your inbox — we sent a sign-in link to <strong>{email}</strong>.
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="you@company.com"
                />
              </div>

              {mode === 'password' && (
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting
                  ? 'Please wait…'
                  : mode === 'password'
                    ? 'Sign in'
                    : 'Send magic link'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === 'password' ? 'magic-link' : 'password')}
              className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              {mode === 'password' ? 'Use a magic link instead' : 'Use a password instead'}
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              OR
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.6C29.6 34.7 27 35.5 24 35.5c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.6 5.6C41.9 35.9 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
              </svg>
              Sign in with Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Access is invite-only. Contact your administrator if you need an account.
        </p>
      </div>
    </div>
  )
}
