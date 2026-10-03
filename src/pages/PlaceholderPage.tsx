import { ArrowUpRight, Construction } from '../components/icons'
import { Link, useLocation } from 'react-router-dom'

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
  return <section className="panel mx-auto mt-8 flex min-h-[340px] max-w-2xl flex-col items-center justify-center px-6 text-center"><span className="grid size-11 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-input)] text-[var(--text-secondary)]"><Construction size={18} /></span><p className="mt-5 text-xs font-medium uppercase tracking-[.12em] text-[var(--text-muted)]">Coming into focus</p><h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{title}</h2><p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">{descriptions[pathname] || 'Your finances, organized around what matters.'}</p><Link to="/" className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">Back to overview <ArrowUpRight size={13} /></Link></section>
}