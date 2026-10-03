import { useState } from 'react'
import { ArrowUpRight, Download, Plus, WalletCards } from '../components/icons'
import { Link, useOutletContext } from 'react-router-dom'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { BalanceTrendChart, SpendingBreakdown } from '../components/FinancialCharts'
import { OverviewChart } from '../components/OverviewChart'
import { RecentTransactions } from '../components/RecentTransactions'
import { SavingsPlan } from '../components/SavingsPlan'
import { StatCard } from '../components/StatCard'
import { WalletCard } from '../components/WalletCard'
import { useAuth } from '../context/AuthContext'
import { useDashboardData } from '../context/DashboardDataContext'
import { downloadTransactionsCsv, formatCurrency } from '../utils/finance'

type OutletContext = { searchQuery: string }
const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

export function Dashboard() {
  const { data, loading, error, refresh } = useDashboardData()
  const { searchQuery } = useOutletContext<OutletContext>()
  const { user, preferences } = useAuth()
  const [transactionOpen, setTransactionOpen] = useState(false)
  const firstName = user?.displayName?.split(' ')[0] || 'there'
  const money = (value: number) => formatCurrency(value, preferences.currency)

  return <div className="space-y-6 sm:space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">{today}</p><h2 className="page-title mt-1.5">Welcome back, {firstName}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Monitor and manage your money with a clear view of today’s finances.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => downloadTransactionsCsv(data.transactions)} disabled={!data.transactions.length} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2B2B2D] bg-[#171718] px-3.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"><Download size={16} className="text-[#D8D8DA]" /> Export CSV</button><button type="button" onClick={() => setTransactionOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"><Plus size={16} /> Add transaction</button></div></div>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-xs text-[var(--text-secondary)]"><span>{error}</span><button type="button" onClick={() => void refresh()} className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">Retry</button></div>}
    {loading && !data.transactions.length ? <section aria-label="Loading financial summary" role="status" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"><span className="sr-only">Loading your financial data</span>{[0, 1, 2].map((item) => <div key={item} className="panel h-32 animate-pulse bg-[var(--surface)]" />)}</section> : <section aria-label="Financial summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard label="Account balance" value={money(data.balance)} note="Across your accounts" icon={WalletCards} />
      <StatCard label="Total expenses" value={money(data.expenses)} note="Recorded expenses" icon={ArrowUpRight} accent="bg-[var(--negative-subtle)] text-[var(--negative)]" />
      <StatCard label="Total savings" value={money(data.savings)} note="Income minus expenses" icon={WalletCards} accent="bg-[var(--positive-subtle)] text-[var(--positive)]" />
    </section>}
    <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
      <OverviewChart data={data.chart} currency={preferences.currency} />
      <BalanceTrendChart data={data.trend} currency={preferences.currency} />
    </section>
    <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="panel min-w-0 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="section-title">My wallets</h2><p className="section-caption">Balances across your accounts</p></div><Link to="/wallets" className="text-xs font-medium text-[var(--accent)] hover:underline">Manage</Link></div><div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">{data.wallets.slice(0, 2).map((wallet) => <WalletCard key={wallet.id} wallet={wallet} currency={preferences.currency} />)}</div>{!data.wallets.length && <div className="py-8 text-center"><p className="text-xs text-[var(--text-secondary)]">No accounts yet.</p><Link to="/wallets" className="mt-2 inline-block text-xs font-medium text-[var(--accent)] hover:underline">Add an account</Link></div>}<div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3"><span className="text-xs text-[var(--text-secondary)]">Combined balance</span><span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">{money(data.balance)}</span></div></div>
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