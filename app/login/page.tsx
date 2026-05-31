'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, LogIn, UserPlus } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/'
  const forbidden = params.get('error') === 'forbidden'
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<'signin' | 'signup' | null>(null)
  const [message, setMessage] = useState(forbidden ? 'That account is not allowed to access the admin area.' : '')

  async function signIn() {
    setMessage('')
    setLoading('signin')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(null)

    if (error) {
      setMessage(error.message)
      return
    }

    router.replace(next)
    router.refresh()
  }

  async function signUp() {
    setMessage('')
    setLoading('signup')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    })
    setLoading(null)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Account created. Check your email if Supabase requires confirmation, then sign in.')
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <div className="section-label mb-2">Account</div>
        <h1 className="text-2xl font-mono font-bold text-text-primary">Sign in</h1>
      </div>

      <div className="card p-6 flex flex-col gap-4">
        <div>
          <label className="section-label mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-amber/60"
          />
        </div>

        <div>
          <label className="section-label mb-1 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-bg-base border border-bg-border rounded px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-amber/60"
          />
        </div>

        {message && (
          <div className="flex items-start gap-2 text-sm font-mono text-accent-red">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={signIn}
            disabled={!email || !password || loading !== null}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-accent-amber px-4 py-2.5 font-mono text-sm font-bold text-bg-base transition-colors hover:bg-accent-amber/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LogIn size={15} />
            {loading === 'signin' ? 'Signing in...' : 'Sign in'}
          </button>
          <button
            onClick={signUp}
            disabled={!email || !password || loading !== null}
            className="flex flex-1 items-center justify-center gap-2 rounded border border-bg-border px-4 py-2.5 font-mono text-sm text-text-secondary transition-colors hover:border-accent-amber/50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserPlus size={15} />
            {loading === 'signup' ? 'Creating...' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
