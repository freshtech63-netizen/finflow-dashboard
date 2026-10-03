import { ArrowUpRight, Construction } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const descriptions: Record<string, string> = {
  '/analytics': 'Understand your spending patterns and track how your money moves.',
  '/transactions': 'Review, search, and organize your account activity.',
  '/invoices': 'Keep track of incoming invoices and payment dates.',
  '/recurring': 'Stay ahead of the bills and transfers that repeat.',
  '/subscriptions': 'See all your memberships in one place.',
  '/settings': 'Manage your profile, preferences, and connected accounts.',
}

export function PlaceholderPage() {
  const { pathname } = useLocation()
  const title = pathname.slice(1).replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  return <section className="panel mx-auto mt-8 flex min-h-[340px] max-w-2xl flex-col items-center justify-center px-6 text-center"><span className="grid size-11 place-items-center rounded-xl border border-[#7190ff]/20 bg-[#7190ff]/[.09] text-[#90a5ff]"><Construction size={19} /></span><p className="mt-5 text-[9px] font-semibold uppercase tracking-[.15em] text-zinc-600">Coming into focus</p><h2 className="mt-2 font-['Manrope'] text-xl font-bold text-zinc-100">{title}</h2><p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">{descriptions[pathname] || 'Your finances, organized around what matters.'}</p><button type="button" className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[#30323a] px-3 py-2 text-[10px] font-medium text-zinc-400 hover:text-white">Back to overview <ArrowUpRight size={13} /></button></section>
}