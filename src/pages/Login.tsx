import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, WalletCards } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { firebaseErrorMessage } from '../utils/firebaseErrors'

export function Login() {
  const { user, login, loginDemo, demoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />
  const destination = (location.state as { from?: string } | null)?.from || '/'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate(destination, { replace: true })
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'Unable to sign in. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return <AuthFrame title="Welcome back" subtitle="Sign in to review your accounts and activity.">
    <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
      <label className="block text-xs font-medium text-[var(--text-secondary)]">Email address
        <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-1.5 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" />
      </label>
      <label className="block text-xs font-medium text-[var(--text-secondary)]">Password
        <span className="relative mt-1.5 block">
          <input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3.5 pr-11 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
        </span>
      </label>
      <div className="flex justify-end"><Link to="/reset-password" className="text-xs font-medium text-[var(--accent)] hover:underline">Forgot password?</Link></div>
      {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
      <button disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] text-sm font-semibold text-[#081725] transition hover:brightness-110 disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'} {!busy && <ArrowRight size={14} />}</button>
    </form>
    {demoMode && <div className="mt-5 border-t border-[var(--line)] pt-5">
      <button type="button" onClick={() => { loginDemo(); navigate('/', { replace: true }) }} className="h-10 w-full rounded-md border border-[var(--line)] text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">Explore demo preview</button>
      <p className="mt-2 text-center text-xs leading-relaxed text-[var(--text-muted)]">Demo preview uses sample data saved only in this browser.</p>
    </div>}
    <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">New to FinFlow? <Link to="/register" className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]">Create an account</Link></p>
  </AuthFrame>
}

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <main className="app-grid grid min-h-screen place-items-center px-4 py-10">
    <section className="w-full max-w-[410px]">
      <Link to="/login" className="mb-7 flex items-center justify-center gap-2.5" aria-label="FinFlow sign in">
        <span className="grid size-9 place-items-center rounded-md bg-[var(--accent)] text-[#081725]"><WalletCards size={17} /></span>
        <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">FinFlow</span>
      </Link>
      <div className="panel p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>
        {children}
      </div>
      <p className="mt-5 text-center text-xs text-[var(--text-muted)]">Your financial information stays private and secure.</p>
    </section>
  </main>
}
