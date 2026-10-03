import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { firebaseErrorMessage } from '../utils/firebaseErrors'
import { AuthFrame } from './Login'

export function Register() {
  const { user, register, demoMode } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/', { replace: true })
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'Unable to create your account. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return <AuthFrame title="Create your account" subtitle="Set up a secure workspace for your finances.">
    <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
      <label className="block text-xs font-medium text-[var(--text-secondary)]">Full name<input required maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="mt-1.5 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" /></label>
      <label className="block text-xs font-medium text-[var(--text-secondary)]">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-1.5 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" /></label>
      <label className="block text-xs font-medium text-[var(--text-secondary)]">Password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-1.5 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" /></label>
      {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
      {demoMode && <p className="text-xs text-[var(--text-muted)]">Firebase isn’t configured, so account registration is unavailable in this environment.</p>}
      <button disabled={busy || demoMode} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] text-sm font-semibold text-[#081725] transition hover:brightness-110 disabled:opacity-50">{busy ? 'Creating account…' : 'Create account'} {!busy && <ArrowRight size={14} />}</button>
    </form>
    <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">Already have an account? <Link to="/login" className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]">Sign in</Link></p>
  </AuthFrame>
}
