import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Download, Plus, WalletCards } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { BalanceTrendChart, IncomeExpenseChart, SpendingBreakdown } from '../components/FinancialCharts'
import { RecentTransactions } from '../components/RecentTransactions'
import { SavingsPlan } from '../components/SavingsPlan'
import { StatCard } from '../components/StatCard'
import { WalletCard } from '../components/WalletCard'
import { useAuth } from '../context/AuthContext'
import { useDashboardData } from '../context/DashboardDataContext'
import { formatCurrency } from '../utils/finance'

type OutletContext = { searchQuery: string }
const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

export function Dashboard() {
  const { data, loading, error } = useDashboardData()
  const { searchQuery } = useOutletContext<OutletContext>()
  const { user, preferences } = useAuth()
  const [transactionOpen, setTransactionOpen] = useState(false)
  const firstName = user?.displayName?.split(' ')[0] || 'there'
  const money = (value: number) => formatCurrency(value, preferences.currency)

  return <div className="space-y-6 sm:space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{today}</p><h2 className="page-title mt-1.5">Good morning, {firstName}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">A clear view of your money, all in one place.</p></div><div className="flex gap-2"><button type="button" onClick={() => window.print()} className="hidden h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-[11px] font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] sm:inline-flex"><Download size={14} /> Export</button><button type="button" onClick={() => setTransactionOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--accent)] px-3.5 text-[11px] font-semibold text-[#111627] transition hover:brightness-110"><Plus size={15} /> Add transaction</button></div></div>
    {error && <p role="status" className="rounded-md border border-[#9c865b]/30 bg-[#9c865b]/[.08] px-3 py-2 text-[10px] text-[#cdb98f]">{error}</p>}
    <section aria-label="Financial summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total balance" value={money(data.balance)} note="Across your accounts" icon={WalletCards} />
      <StatCard label="Income" value={money(data.income)} note="Recorded transactions" icon={ArrowDownLeft} accent="bg-[var(--positive-subtle)] text-[var(--positive)]" />
      <StatCard label="Expenses" value={money(data.expenses)} note="Recorded transactions" icon={ArrowUpRight} accent="bg-[var(--negative-subtle)] text-[var(--negative)]" />
      <StatCard label="Net savings" value={money(data.savings)} note="Income minus expenses" icon={WalletCards} />
    </section>
    <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
      <IncomeExpenseChart data={data.chart} currency={preferences.currency} />
      <BalanceTrendChart data={data.trend} currency={preferences.currency} />
    </section>
    <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="panel min-w-0 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="section-title">Accounts</h2><p className="section-caption">Balances across your wallets</p></div><Link to="/wallets" className="text-[10px] font-medium text-[var(--accent)] hover:underline">Manage</Link></div><div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">{data.wallets.slice(0, 2).map((wallet) => <WalletCard key={wallet.id} wallet={wallet} currency={preferences.currency} />)}</div>{!data.wallets.length && <p className="py-10 text-center text-xs text-[var(--text-muted)]">Add an account to track wallet balances.</p>}<div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3"><span className="text-[10px] text-[var(--text-secondary)]">Combined balance</span><span className="text-xs font-semibold tabular-nums text-[var(--text-primary)]">{money(data.balance)}</span></div></div>
      <SpendingBreakdown data={data.spending} currency={preferences.currency} />
    </section>
    <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]">
      <RecentTransactions transactions={data.transactions} query={searchQuery} currency={preferences.currency} />
      <SavingsPlan goals={data.goals} currency={preferences.currency} />
    </section>
    <nav aria-label="Finance sections" className="flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">{[['/insights', 'Insights'], ['/activity', 'Activity'], ['/invoices', 'Invoices'], ['/expenses', 'Expenses'], ['/income', 'Income']].map(([to, label]) => <Link key={to} to={to} className="rounded-md border border-[var(--line)] px-3 py-2 text-[10px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">{label}</Link>)}</nav>
    {loading && <span className="sr-only" role="status">Refreshing financial data</span>}
    <AddTransactionModal open={transactionOpen} onClose={() => setTransactionOpen(false)} />
  </div>
}