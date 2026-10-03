import { ArrowUpRight, MoreHorizontal, WalletCards } from 'lucide-react'
import type { Wallet } from '../types'
import { formatCurrency } from '../utils/finance'

export function WalletCard({ wallet, currency = 'USD' }: { wallet: Wallet; currency?: string }) {
  return <article className="panel min-w-0 p-4 sm:p-5">
    <div className="relative flex items-start justify-between"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-md bg-[var(--accent-subtle)] text-[var(--accent)]"><WalletCards size={16} /></span><div><p className="text-[10px] text-[var(--text-secondary)]">{wallet.name}</p><p className="mt-0.5 text-[11px] font-medium text-[var(--text-primary)]">{wallet.number}</p></div></div><button type="button" aria-label={`More options for ${wallet.name}`} className="grid size-7 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"><MoreHorizontal size={16} /></button></div>
    <div className="relative mt-6 flex items-end justify-between"><div><p className="eyebrow">Available balance</p><p className="mt-1 font-['Manrope'] text-lg font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(wallet.balance, currency)}</p></div><span className="flex items-center gap-1 text-[9px] font-semibold text-[var(--text-muted)]">{wallet.brand}<ArrowUpRight size={11} /></span></div>
  </article>
}