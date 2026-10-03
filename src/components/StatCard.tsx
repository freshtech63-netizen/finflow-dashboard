import { ArrowDownRight, ArrowUpRight, type IconComponent } from './icons'

type Props = { label: string; value: string; icon: IconComponent; note: string; change?: string; positive?: boolean; accent?: string }

export function StatCard({ label, value, icon: Icon, note, change, positive = true, accent = 'bg-[var(--accent-subtle)] text-[var(--accent)]' }: Props) {
  return <article className="panel min-w-0 p-4 sm:p-5">
    <div className="flex items-center justify-between gap-3"><p className="text-[13px] font-medium text-[var(--text-heading-soft)]">{label}</p><span className={`grid size-8 place-items-center rounded-lg ${accent}`}><Icon size={16} strokeWidth={1.8} /></span></div>
    <p className="mt-4 text-[23px] font-semibold tracking-tight tabular-nums text-[var(--text-primary)] sm:text-[25px]">{value}</p>
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">{change && <span className={`inline-flex items-center gap-0.5 font-semibold ${positive ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>{positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span>}<span className="text-[var(--text-muted)]">{note}</span></div>
  </article>
}