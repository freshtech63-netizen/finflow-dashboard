import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { firebaseErrorMessage } from '../utils/firebaseErrors'
import { AuthFrame } from './Login'

export function ResetPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'Unable to send a reset link. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return <AuthFrame title="Reset your password" subtitle="We’ll send a secure password reset link to your email.">
    {sent ? <div role="status" className="mt-6 rounded-md border border-[var(--positive)]/20 bg-[var(--positive-subtle)] p-4 text-center">
      <MailCheck size={20} className="mx-auto text-[var(--positive)]" />
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">Check your inbox</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">If an account exists for {email}, a reset link will arrive shortly.</p>
    </div> : <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
      <label className="block text-xs font-medium text-[var(--text-secondary)]">Email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-1.5 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" /></label>
      {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
      <button disabled={busy} className="h-11 w-full rounded-md bg-[var(--accent)] text-sm font-semibold text-[#081725] transition hover:brightness-110 disabled:opacity-50">{busy ? 'Sending…' : 'Send reset link'}</button>
    </form>}
    <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ArrowLeft size={13} /> Back to sign in</Link>
  </AuthFrame>
}
