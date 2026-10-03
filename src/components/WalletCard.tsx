import { ArrowUpRight, MoreHorizontal, WalletCards } from './icons'
import { Link } from 'react-router-dom'
import type { Wallet } from '../types'
import { formatCurrency } from '../utils/finance'

export function WalletCard({ wallet, currency = 'USD' }: { wallet: Wallet; currency?: string }) {
  return <article className="panel min-w-0 p-4 sm:p-5">
    <div className="relative flex items-start justify-between"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-md bg-[var(--accent-subtle)] text-[var(--accent)]"><WalletCards size={16} /></span><div><p className="text-xs text-[var(--text-secondary)]">{wallet.name}</p><p className="mt-0.5 text-xs font-medium text-[var(--text-primary)]">{wallet.number}</p></div></div><Link to="/wallets" aria-label={`Manage ${wallet.name}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"><MoreHorizontal size={16} /></Link></div>
    <div className="relative mt-6 flex items-end justify-between"><div><p className="eyebrow">Available balance</p><p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-[var(--text-primary)]">{formatCurrency(wallet.balance, currency)}</p></div><span className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)]">{wallet.status || 'Active'} · {wallet.brand}<ArrowUpRight size={11} /></span></div>
  </article>
}