import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, WalletCards } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true)
    try { await login(email, password); navigate(destination, { replace: true }) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.') } finally { setBusy(false) }
  }
  return <AuthFrame title="Welcome back" subtitle="A clearer picture of your money starts here."><form onSubmit={(event) => void submit(event)} className="mt-7 space-y-4"><label className="block text-[11px] font-medium text-zinc-400">Email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-11 w-full rounded-lg border border-[#30323a] bg-[#111317] px-3.5 text-xs text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-[#7190ff]" /></label><label className="block text-[11px] font-medium text-zinc-400">Password<span className="relative mt-2 block"><input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-11 w-full rounded-lg border border-[#30323a] bg-[#111317] px-3.5 pr-11 text-xs text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-[#7190ff]" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span></label><div className="flex justify-end"><Link to="/reset-password" className="text-[10px] font-medium text-[#9aabff] hover:text-white">Forgot password?</Link></div>{error && <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/[.07] px-3 py-2 text-[10px] text-rose-300">{error}</p>}<button disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7190ff] text-xs font-bold text-[#111627] transition hover:bg-[#8ba2ff] disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'} {!busy && <ArrowRight size={15} />}</button></form>{demoMode && <><div className="my-5 flex items-center gap-3 text-[9px] uppercase tracking-[.1em] text-zinc-700"><span className="h-px flex-1 bg-[#292b31]" />or<span className="h-px flex-1 bg-[#292b31]" /></div><button onClick={() => { loginDemo(); navigate('/', { replace: true }) }} className="h-10 w-full rounded-lg border border-[#30323a] text-[11px] font-medium text-zinc-300 transition hover:border-[#7190ff]/50 hover:text-white">Explore the demo dashboard</button><p className="mt-3 text-center text-[9px] leading-relaxed text-zinc-600">Demo mode uses sample data. Configure Firebase to enable account sign-in.</p></>}<p className="mt-6 text-center text-[11px] text-zinc-500">New to Finflow? <Link to="/register" className="font-semibold text-zinc-200 hover:text-[#a5b5ff]">Create an account</Link></p></AuthFrame>
}

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <main className="app-grid grid min-h-screen place-items-center px-4 py-10"><section className="w-full max-w-[390px]"><Link to="/login" className="mb-8 flex items-center justify-center gap-2"><span className="grid size-9 place-items-center rounded-[10px] bg-[#7190ff] text-[#111627]"><WalletCards size={19} strokeWidth={2.4} /></span><span className="font-['Manrope'] text-lg font-extrabold text-zinc-100">finflow<span className="text-[#7190ff]">.</span></span></Link><div className="panel p-6 sm:p-8"><h1 className="font-['Manrope'] text-[22px] font-bold text-zinc-100">{title}</h1><p className="mt-2 text-xs text-zinc-500">{subtitle}</p>{children}</div><p className="mt-5 text-center text-[9px] text-zinc-700">Your financial information stays private and secure.</p></section></main>
}