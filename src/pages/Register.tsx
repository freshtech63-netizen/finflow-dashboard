import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
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
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await register(name, email, password); navigate('/', { replace: true }) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to create your account.') } finally { setBusy(false) }
  }
  return <AuthFrame title="Create your account" subtitle="Start building a healthier relationship with money."><form onSubmit={(event) => void submit(event)} className="mt-7 space-y-4"><label className="block text-[11px] font-medium text-zinc-400">Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" className="mt-2 h-11 w-full rounded-lg border border-[#30323a] bg-[#111317] px-3.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-[#7190ff]" /></label><label className="block text-[11px] font-medium text-zinc-400">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-11 w-full rounded-lg border border-[#30323a] bg-[#111317] px-3.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-[#7190ff]" /></label><label className="block text-[11px] font-medium text-zinc-400">Password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-2 h-11 w-full rounded-lg border border-[#30323a] bg-[#111317] px-3.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-[#7190ff]" /></label>{error && <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/[.07] px-3 py-2 text-[10px] text-rose-300">{error}</p>}{demoMode && <p className="text-[10px] text-zinc-600">Firebase isn’t configured yet. Add project credentials to enable registration.</p>}<button disabled={busy || demoMode} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7190ff] text-xs font-bold text-[#111627] transition hover:bg-[#8ba2ff] disabled:opacity-50">{busy ? 'Creating account…' : 'Create account'} {!busy && <ArrowRight size={15} />}</button></form><p className="mt-6 text-center text-[11px] text-zinc-500">Already have an account? <Link to="/login" className="font-semibold text-zinc-200 hover:text-[#a5b5ff]">Sign in</Link></p></AuthFrame>
}