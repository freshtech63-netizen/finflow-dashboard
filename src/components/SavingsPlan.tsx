import { ArrowUpRight, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SavingsGoal } from '../types'
import { formatCurrency } from '../utils/finance'

export function SavingsPlan({ goals, currency = 'USD' }: { goals: SavingsGoal[]; currency?: string }) {
  return <section className="panel min-w-0 p-4 sm:p-5">
    <div className="flex items-center justify-between"><div><h2 className="section-title">Savings goals</h2><p className="section-caption">Progress toward your plans</p></div><Link to="/savings" aria-label="View savings goals" className="grid size-7 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><ArrowUpRight size={15} /></Link></div>
    <div className="mt-5 space-y-5">{goals.slice(0, 3).map((goal) => {
      const progress = Math.min(100, Math.round((goal.saved / Math.max(goal.target, 1)) * 100))
      return <div key={goal.id}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-[var(--surface-hover)] text-[var(--text-secondary)]"><Target size={15} /></span><div className="min-w-0"><p className="truncate text-[11px] font-medium text-[var(--text-primary)]">{goal.name}</p><p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{formatCurrency(goal.saved, currency)} saved</p></div></div><span className="shrink-0 text-[10px] font-semibold text-[var(--text-secondary)]">{progress}%</span></div><div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]"><div className="h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${progress}%` }} /></div><p className="mt-1.5 text-right text-[9px] text-[var(--text-muted)]">of {formatCurrency(goal.target, currency)}</p></div>
    })}</div>
    <Link to="/savings" className="mt-5 block w-full rounded-md border border-[var(--line)] py-2 text-center text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">View savings goals</Link>
  </section>
}