import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Transaction } from '../types'
import { formatCurrency, formatTransactionDate } from '../utils/finance'

export function RecentTransactions({ transactions, query = '', currency = 'USD' }: { transactions: Transaction[]; query?: string; currency?: string }) {
  const normalized = query.trim().toLowerCase()
  const filtered = transactions.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalized))
  return <section className="panel min-w-0 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-4 sm:px-5"><div><h2 className="section-title">Recent transactions</h2><p className="section-caption">Your latest account activity</p></div><Link to="/transactions" className="rounded-md px-2 py-1.5 text-[10px] font-medium text-[var(--accent)] transition hover:bg-[var(--accent-subtle)]">View all</Link></div>
    <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(75px,.8fr)_minmax(82px,.8fr)_minmax(75px,.7fr)] border-y border-[#25272d] px-4 py-2.5 text-[9px] font-medium uppercase tracking-[.08em] text-zinc-600 sm:px-5"><span>Merchant</span><span className="hidden sm:block">Category</span><span>Date</span><span className="text-right">Amount</span></div>
    <div className="divide-y divide-[#24262c]">{filtered.length ? filtered.slice(0, 5).map((item) => <div key={item.id} className="grid grid-cols-[minmax(0,1.7fr)_minmax(75px,.8fr)_minmax(82px,.8fr)_minmax(75px,.7fr)] items-center px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: `${item.color}35`, color: item.color }}>{item.initials}</span><span className="min-w-0"><span className="block truncate text-[10px] font-medium text-zinc-300 sm:text-[11px]">{item.name}</span><span className="block truncate text-[9px] text-zinc-600 sm:hidden">{item.category}</span></span></div>
      <span className="hidden truncate text-[10px] text-zinc-500 sm:block">{item.category}</span><span className="truncate text-[9px] text-zinc-600 sm:text-[10px]">{formatTransactionDate(item.date)}</span><span className={`flex items-center justify-end gap-0.5 whitespace-nowrap text-[10px] font-semibold tabular-nums sm:text-[11px] ${item.direction === 'income' ? 'text-[var(--positive)]' : 'text-[var(--text-primary)]'}`}>{item.direction === 'income' ? <ArrowDownLeft size={12} className="text-[var(--positive)]" /> : <ArrowUpRight size={12} className="text-[var(--text-muted)]" />}{item.direction === 'income' ? '+' : '-'}{formatCurrency(item.amount, currency)}</span>
    </div>) : <p className="px-5 py-8 text-center text-xs text-zinc-600">No transactions match “{query}”.</p>}</div>
  </section>
}