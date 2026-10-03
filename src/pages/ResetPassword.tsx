import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthFrame } from './Login'

export function ResetPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    try { await resetPassword(email); setSent(true) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to send a reset link.') }
  }
  return <AuthFrame title="Reset your password" subtitle="We’ll send you a secure link to get back in.">{sent ? <div className="mt-7 rounded-lg border border-[#67d6a2]/20 bg-[#67d6a2]/[.06] p-4 text-center"><MailCheck size={22} className="mx-auto text-[#67d6a2]" /><p className="mt-2 text-xs text-zinc-200">Check your inbox</p><p className="mt-1 text-[10px] text-zinc-500">A reset link was sent to {email}.</p></div> : <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-4"><label className="block text-[11px] font-medium text-zinc-400">Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-11 w-full rounded-lg border border-[#30323a] bg-[#111317] px-3.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-[#7190ff]" /></label>{error && <p role="alert" className="text-[10px] text-rose-300">{error}</p>}<button className="h-11 w-full rounded-lg bg-[#7190ff] text-xs font-bold text-[#111627] hover:bg-[#8ba2ff]">Send reset link</button></form>}<Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-200"><ArrowLeft size={13} /> Back to sign in</Link></AuthFrame>
}