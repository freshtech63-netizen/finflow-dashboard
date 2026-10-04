import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowRight, CreditCard, Download, Edit, FileText, HelpCircle, Messages, Plus, Trash, TrendingUp } from '../components/icons'
import { Link, useOutletContext } from 'react-router-dom'
import { BalanceTrendChart, IncomeExpenseChart, SpendingBreakdown } from '../components/FinancialCharts'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { InvoiceEditorModal } from '../components/InvoiceEditorModal'
import { WalletEditorModal } from '../components/WalletEditorModal'
import { ScheduledPaymentsPage } from './ScheduledPaymentsPage'
import { WalletCard } from '../components/WalletCard'
import { useAuth } from '../context/AuthContext'
import { useDashboardData } from '../context/DashboardDataContext'
import { getInvoices, removeInvoice, saveInvoice } from '../lib/invoiceService'
import type { Invoice, NewInvoice } from '../types'
import { downloadTransactionsCsv, formatCurrency, formatTransactionDate } from '../utils/finance'
import { firebaseErrorMessage } from '../utils/firebaseErrors'

type OutletContext = { searchQuery?: string }

function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow">Overview</p>
        <h2 className="page-title mt-1.5">{title}</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p>
      </div>
      {actions}
    </div>
  )
}

function MetricRow({ title, value, positive }: { title: string; value: string; positive?: boolean }) {
  return (
    <div className="panel p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-[.12em] text-[var(--text-muted)]">{title}</p>
      <p className={`mt-2 text-sm font-semibold ${positive ? 'text-[var(--positive)]' : 'text-[var(--text-primary)]'}`}>{value}</p>
    </div>
  )
}

export function AnalyticsPage() {
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  const money = (value: number) => formatCurrency(value, preferences.currency)
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="A deeper view of spending behavior and efficiency." actions={<Link to="/transactions" className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-3 py-2 text-[10px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">View activity <ArrowRight size={13} /></Link>} />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricRow title="Avg. income" value={money(data.income / Math.max(1, data.chart.length))} positive />
        <MetricRow title="Avg. expenses" value={money(data.expenses / Math.max(1, data.chart.length))} />
        <MetricRow title="Net recorded" value={money(data.savings)} positive />
        <MetricRow title="Expense / income" value={`${data.income ? Math.round((data.expenses / data.income) * 100) : 0}%`} />
      </section>
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <IncomeExpenseChart data={data.chart} currency={preferences.currency} />
        <BalanceTrendChart data={data.trend} currency={preferences.currency} />
      </section>
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SpendingBreakdown data={data.spending} currency={preferences.currency} />
        <div className="panel p-4 sm:p-5">
          <h3 className="section-title">Expense watchlist</h3>
          <div className="mt-4 space-y-3">
            {data.spending.map((entry) => (
              <div key={entry.category} className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="size-2 rounded-[3px]" style={{ backgroundColor: entry.color }} />
                  <span className="truncate text-[11px] text-[var(--text-secondary)]">{entry.category}</span>
                </div>
                <span className="text-[11px] font-medium text-[var(--text-primary)]">{money(entry.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export function TransactionsPage() {
  const { data, deleteTransaction } = useDashboardData()
  const { preferences, user } = useAuth()
  const { searchQuery = '' } = useOutletContext<OutletContext>()
  const [direction, setDirection] = useState<'all' | 'income' | 'expense'>('all')
  const [category, setCategory] = useState('all')
  const [walletId, setWalletId] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<import('../types').Transaction | undefined>()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const filtered = data.transactions.filter((item) => {
    const matchesSearch = `${item.name} ${item.category} ${item.paymentMethod || ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
    const matchesDirection = direction === 'all' || item.direction === direction
    const matchesCategory = category === 'all' || item.category === category
    const matchesWallet = walletId === 'all' || item.walletId === walletId
    const matchesFrom = !fromDate || item.date >= fromDate
    const matchesTo = !toDate || item.date <= toDate
    return matchesSearch && matchesDirection && matchesCategory && matchesWallet && matchesFrom && matchesTo
  })
  const categories = [...new Set(data.transactions.map((item) => item.category))].sort()
  const filterClass = 'h-9 min-w-0 rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-2.5 text-xs text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]'

  async function remove(transaction: import('../types').Transaction) {
    if (!user || !window.confirm(`Delete “${transaction.name}”? This cannot be undone.`)) return
    setError('')
    setNotice('')
    try {
      await deleteTransaction(transaction.id)
      setNotice(`${transaction.name} was deleted.`)
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'This transaction could not be deleted.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Search and review activity across your accounts." actions={<div className="flex gap-2"><button type="button" onClick={() => downloadTransactionsCsv(filtered)} disabled={!filtered.length} className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-40"><Download size={14} /> Export</button><button type="button" onClick={() => setAddOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725]"><Plus size={14} /> Add transaction</button></div>} />
      {notice && <p role="status" className="rounded-md border border-[var(--positive)]/25 bg-[var(--positive-subtle)] px-3 py-2.5 text-xs text-[var(--positive)]">{notice}</p>}
      {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricRow title="Income" value={formatCurrency(data.income, preferences.currency)} positive />
        <MetricRow title="Expenses" value={formatCurrency(data.expenses, preferences.currency)} />
        <MetricRow title="Net" value={formatCurrency(data.savings, preferences.currency)} positive />
      </section>
      <section aria-label="Transaction filters" className="panel grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6">
        <select aria-label="Transaction type" value={direction} onChange={(event) => setDirection(event.target.value as typeof direction)} className={filterClass}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select>
        <select aria-label="Transaction category" value={category} onChange={(event) => setCategory(event.target.value)} className={filterClass}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Wallet" value={walletId} onChange={(event) => setWalletId(event.target.value)} className={filterClass}><option value="all">All accounts</option>{data.wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}</select>
        <label className="flex min-w-0 items-center gap-1 text-[10px] text-[var(--text-muted)]"><span className="sr-only">From date</span><input aria-label="From date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className={filterClass + ' w-full'} /></label>
        <label className="flex min-w-0 items-center gap-1 text-[10px] text-[var(--text-muted)]"><span className="sr-only">To date</span><input aria-label="To date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className={filterClass + ' w-full'} /></label>
        <button type="button" onClick={() => { setDirection('all'); setCategory('all'); setWalletId('all'); setFromDate(''); setToDate('') }} className="h-9 rounded-md border border-[var(--line)] px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">Clear filters</button>
      </section>
      <section className="panel overflow-hidden">
        <p className="border-b border-[var(--line)] px-4 py-3 text-xs text-[var(--text-secondary)] sm:px-5">{filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}</p>
        {filtered.length ? <><div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(100px,.8fr)_minmax(110px,.8fr)_minmax(120px,.8fr)_88px] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--text-muted)] md:grid"><span>Activity</span><span>Category</span><span>Date</span><span className="text-right">Amount</span><span className="text-right">Actions</span></div><div className="divide-y divide-[var(--line)]">{filtered.map((transaction) => <article key={transaction.id} className="flex min-w-0 items-center gap-2 px-4 py-3.5 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(100px,.8fr)_minmax(110px,.8fr)_minmax(120px,.8fr)_88px] md:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-initial"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-secondary)]">{transaction.initials}</span><div className="min-w-0"><p title={transaction.name} className="max-w-full truncate text-sm font-medium text-[var(--text-primary)]">{transaction.name}</p><p className="mt-0.5 truncate text-xs text-[var(--text-secondary)] md:hidden">{transaction.category} · {formatTransactionDate(transaction.date)}</p></div></div>
          <span className="hidden truncate text-xs text-[var(--text-secondary)] md:block">{transaction.category}</span><span className="hidden text-xs text-[var(--text-secondary)] md:block">{formatTransactionDate(transaction.date)}</span><span className={`shrink-0 text-right text-sm font-semibold tabular-nums md:text-right ${transaction.direction === 'income' ? 'text-[var(--positive)]' : 'text-[var(--text-primary)]'}`}>{transaction.direction === 'income' ? '+' : '−'}{formatCurrency(transaction.amount, preferences.currency)}</span><div className="flex shrink-0 md:justify-end"><button type="button" onClick={() => { setSelected(transaction); setAddOpen(true) }} aria-label={`Edit ${transaction.name}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><Edit size={14} /></button><button type="button" onClick={() => void remove(transaction)} aria-label={`Delete ${transaction.name}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--negative-subtle)] hover:text-[var(--negative)]"><Trash size={14} /></button></div>
        </article>)}</div></> : <div className="px-5 py-12 text-center"><p className="text-sm font-medium text-[var(--text-primary)]">{data.transactions.length ? 'No matching transactions' : 'No transactions yet'}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{data.transactions.length ? 'Try changing or clearing your filters.' : 'Add a transaction to start tracking your cash flow.'}</p></div>}
      </section>
      <AddTransactionModal open={addOpen} transaction={selected} onClose={() => { setAddOpen(false); setSelected(undefined) }} />
    </div>
  )
}

export function ActivityPage() {
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  const latest = data.transactions.slice(0, 8)
  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="Track your most recent financial movement." />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricRow title="Payments" value={String(data.transactions.filter((item) => item.direction === 'expense').length)} />
        <MetricRow title="Incoming" value={String(data.transactions.filter((item) => item.direction === 'income').length)} positive />
        <MetricRow title="Net recorded" value={formatCurrency(data.income - data.expenses, preferences.currency)} positive />
      </section>
      <section className="panel p-4 sm:p-5">
        <div className="space-y-3">
          {latest.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`grid size-9 place-items-center rounded-full ${transaction.direction === 'income' ? 'bg-[var(--positive-subtle)] text-[var(--positive)]' : 'bg-[var(--negative-subtle)] text-[var(--negative)]'}`}><TrendingUp size={15} /></span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-[var(--text-primary)]">{transaction.name}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <span className={`text-[11px] font-semibold ${transaction.direction === 'income' ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>{transaction.direction === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, preferences.currency)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function WalletsPage() {
  const { data, saveWallet, deleteWallet } = useDashboardData()
  const { preferences } = useAuth()
  const [editorOpen, setEditorOpen] = useState(false)
  const [selected, setSelected] = useState<import('../types').Wallet | undefined>()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState('')

  function openEditor(wallet?: import('../types').Wallet) {
    setSelected(wallet)
    setEditorOpen(true)
  }

  async function removeAccount(wallet: import('../types').Wallet) {
    if (!window.confirm(`Delete ${wallet.name}? Existing transactions will remain in your history.`)) return
    setBusyId(wallet.id)
    setError('')
    try {
      await deleteWallet(wallet.id)
      setNotice(`${wallet.name} was removed.`)
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'This account could not be deleted. Please try again.'))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cards / Wallets" subtitle="Manage account balances and review the activity assigned to each one." actions={<button type="button" onClick={() => openEditor()} className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725]"><Plus size={14} /> Add account</button>} />
      {notice && <p role="status" className="rounded-md border border-[var(--positive)]/25 bg-[var(--positive-subtle)] px-3 py-2.5 text-xs text-[var(--positive)]">{notice}</p>}
      {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
      <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {data.wallets.map((wallet) => <div key={wallet.id} className="min-w-0 space-y-2"><WalletCard wallet={wallet} currency={preferences.currency} /><div className="flex justify-end gap-1"><button type="button" onClick={() => openEditor(wallet)} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><Edit size={13} /> Edit</button><button type="button" onClick={() => void removeAccount(wallet)} disabled={busyId === wallet.id} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--negative-subtle)] hover:text-[var(--negative)] disabled:opacity-40"><Trash size={13} /> Delete</button></div><section className="panel p-4"><h3 className="text-xs font-medium text-[var(--text-primary)]">Recent activity</h3><div className="mt-3 space-y-2">{data.transactions.filter((item) => item.walletId === wallet.id).slice(0, 3).map((item) => <div key={item.id} className="flex min-w-0 items-center justify-between gap-3 text-xs"><span className="truncate text-[var(--text-secondary)]">{item.name}</span><span className="shrink-0 tabular-nums text-[var(--text-primary)]">{item.direction === 'income' ? '+' : '−'}{formatCurrency(item.amount, preferences.currency)}</span></div>)}{!data.transactions.some((item) => item.walletId === wallet.id) && <p className="text-xs text-[var(--text-muted)]">No transactions assigned to this account yet.</p>}</div></section></div>)}
      </section>
      {!data.wallets.length && <section className="panel grid justify-items-center px-6 py-14 text-center"><span className="grid size-11 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-input)] text-[var(--text-secondary)]"><CreditCard size={18} /></span><h3 className="mt-4 text-sm font-medium text-[var(--text-primary)]">No accounts connected</h3><p className="mt-1 max-w-sm text-xs text-[var(--text-secondary)]">Add a wallet or account to track balances and assign transactions.</p><button type="button" onClick={() => openEditor()} className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725]"><Plus size={14} /> Add account</button></section>}
      {!!data.wallets.length && <section className="panel p-4 sm:p-5">
        <h3 className="section-title">Balance summary</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {data.wallets.map((wallet) => (
            <div key={wallet.id} className="rounded-md border border-[var(--line)] bg-[var(--surface-input)] p-3">
              <p className="text-[10px] text-[var(--text-muted)]">{wallet.name}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(wallet.balance, preferences.currency)}</p>
            </div>
          ))}
        </div>
      </section>}
      <WalletEditorModal open={editorOpen} wallet={selected} onClose={() => setEditorOpen(false)} onSave={async (wallet, id, requestId) => { await saveWallet(wallet, id, requestId); setNotice(`${wallet.name} ${id ? 'updated' : 'added'}.`); setError('') }} />
    </div>
  )
}

export function InvoicesPage() {
  const { user, preferences } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selected, setSelected] = useState<Invoice | undefined>()
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    let active = true
    if (!user) return
    setLoading(true)
    getInvoices(user.uid).then((result) => {
      if (active) { setInvoices(result); setError('') }
    }).catch(() => {
      if (active) setError('Invoices could not be loaded. Check your connection and retry.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user])

  const sortedInvoices = useMemo(() => [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate)), [invoices])
  const outstanding = invoices.filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue').reduce((sum, invoice) => sum + invoice.total, 0)
  const paid = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0)

  function openEditor(mode: 'create' | 'edit' | 'view', invoice?: Invoice) {
    setEditorMode(mode)
    setSelected(invoice)
    setEditorOpen(true)
  }

  async function persistInvoice(value: NewInvoice, id?: string) {
    if (!user) throw new Error('Sign in again before saving an invoice.')
    const saved = await saveInvoice(user.uid, value, id)
    setInvoices((previous) => id ? previous.map((invoice) => invoice.id === id ? saved : invoice) : [saved, ...previous])
    setNotice(`Invoice ${saved.invoiceNumber} ${id ? 'updated' : 'created'}.`)
    setError('')
  }

  async function deleteInvoice(invoice: Invoice) {
    if (!user || !window.confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) return
    setBusyId(invoice.id)
    setError('')
    try {
      await removeInvoice(user.uid, invoice.id)
      setInvoices((previous) => previous.filter((item) => item.id !== invoice.id))
      setNotice(`Invoice ${invoice.invoiceNumber} deleted.`)
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'This invoice could not be deleted.'))
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="Create, track, and manage customer invoices." actions={<button type="button" onClick={() => openEditor('create')} className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725]"><Plus size={14} /> New invoice</button>} />
      {notice && <p role="status" className="rounded-md border border-[var(--positive)]/25 bg-[var(--positive-subtle)] px-3 py-2.5 text-xs text-[var(--positive)]">{notice}</p>}
      {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricRow title="All invoices" value={String(invoices.length)} />
        <MetricRow title="Outstanding" value={formatCurrency(outstanding, preferences.currency)} />
        <MetricRow title="Paid" value={formatCurrency(paid, preferences.currency)} positive />
      </section>
      <section className="panel overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(100px,.8fr)_minmax(100px,.8fr)_minmax(90px,.8fr)_100px] border-b border-[var(--line)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.08em] text-[var(--text-muted)] md:grid">
          <span>Customer</span><span>Invoice</span><span>Due date</span><span className="text-right">Total</span><span className="text-right">Status</span>
        </div>
        {loading ? <p role="status" className="px-5 py-12 text-center text-sm text-[var(--text-secondary)]">Loading invoices…</p> : sortedInvoices.length ? <div className="divide-y divide-[var(--line)]">
          {sortedInvoices.map((invoice) => <article key={invoice.id} className="flex min-w-0 flex-col gap-3 px-4 py-4 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(100px,.8fr)_minmax(100px,.8fr)_minmax(90px,.8fr)_100px] md:items-center md:px-5">
            <button type="button" onClick={() => openEditor('view', invoice)} className="min-w-0 text-left"><span className="block truncate text-sm font-medium text-[var(--text-primary)]">{invoice.customerName}</span><span className="block truncate text-xs text-[var(--text-muted)] md:hidden">{invoice.invoiceNumber} · Due {formatTransactionDate(invoice.dueDate)}</span><span className="hidden truncate text-xs text-[var(--text-secondary)] md:block">{invoice.customerEmail}</span></button>
            <span className="hidden text-xs text-[var(--text-secondary)] md:block">{invoice.invoiceNumber}</span>
            <span className="hidden text-xs text-[var(--text-secondary)] md:block">{formatTransactionDate(invoice.dueDate)}</span>
            <div className="flex items-center justify-between md:justify-end"><span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(invoice.total, preferences.currency)}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize md:hidden ${invoice.status === 'paid' ? 'bg-[var(--positive-subtle)] text-[var(--positive)]' : invoice.status === 'overdue' ? 'bg-[var(--negative-subtle)] text-[var(--negative)]' : 'bg-[var(--surface-hover)] text-[var(--text-secondary)]'}`}>{invoice.status}</span></div>
            <div className="flex items-center justify-between gap-2 md:justify-end"><span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-medium capitalize md:inline-flex ${invoice.status === 'paid' ? 'bg-[var(--positive-subtle)] text-[var(--positive)]' : invoice.status === 'overdue' ? 'bg-[var(--negative-subtle)] text-[var(--negative)]' : 'bg-[var(--surface-hover)] text-[var(--text-secondary)]'}`}>{invoice.status}</span><div className="flex gap-1"><button type="button" onClick={() => openEditor('edit', invoice)} aria-label={`Edit ${invoice.invoiceNumber}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><Edit size={14} /></button><button type="button" onClick={() => void deleteInvoice(invoice)} disabled={busyId === invoice.id} aria-label={`Delete ${invoice.invoiceNumber}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--negative-subtle)] hover:text-[var(--negative)] disabled:opacity-40"><Trash size={14} /></button></div></div>
          </article>)}
        </div> : <div className="grid justify-items-center px-6 py-14 text-center"><span className="grid size-11 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-input)] text-[var(--text-secondary)]"><FileText size={18} /></span><h3 className="mt-4 text-sm font-medium text-[var(--text-primary)]">No invoices yet</h3><p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-secondary)]">Create your first invoice to keep customer payments and due dates organized.</p><button type="button" onClick={() => openEditor('create')} className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725]"><Plus size={14} /> Create invoice</button></div>}
      </section>
      <InvoiceEditorModal open={editorOpen} mode={editorMode} invoice={selected} currency={preferences.currency} issuerName={user?.displayName || 'FinFlow account'} issuerEmail={user?.email || ''} onClose={() => setEditorOpen(false)} onSave={persistInvoice} />
    </div>
  )
}

export function RecurringPage() {
  return <ScheduledPaymentsPage type="recurring" />
}

export function SubscriptionsPage() {
  return <ScheduledPaymentsPage type="subscription" />
}

export function InsightsPage() {
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  const totalExpenses = data.spending.reduce((sum, item) => sum + item.amount, 0)
  const largestCategory = data.spending[0]
  const recentMonths = data.chart.slice(-2)
  const [previousMonth, currentMonth] = recentMonths
  const expenseChange = previousMonth && currentMonth ? currentMonth.expenses - previousMonth.expenses : null
  const completedGoals = data.goals.filter((goal) => goal.target > 0)
  const insights = [
    largestCategory && { title: 'Largest spending category', body: `${largestCategory.category} is your highest recorded expense category at ${formatCurrency(largestCategory.amount, preferences.currency)}.` },
    expenseChange !== null && { title: 'Expense trend', body: `Expenses ${expenseChange > 0 ? 'increased' : expenseChange < 0 ? 'decreased' : 'stayed level'} by ${formatCurrency(Math.abs(expenseChange), preferences.currency)} from ${previousMonth.month} to ${currentMonth.month}.` },
    completedGoals.length > 0 && { title: 'Savings goal progress', body: `${completedGoals.length} savings ${completedGoals.length === 1 ? 'goal is' : 'goals are'} available to track; your combined recorded balance is ${formatCurrency(completedGoals.reduce((sum, goal) => sum + goal.saved, 0), preferences.currency)}.` },
  ].filter((item): item is { title: string; body: string } => Boolean(item))
  return (
    <div className="space-y-6">
      <PageHeader title="Insights" subtitle="Personalized guidance drawn from your spending data." />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricRow title="Largest category" value={largestCategory?.category || '—'} positive />
        <MetricRow title="Net recorded" value={formatCurrency(data.savings, preferences.currency)} positive />
        <MetricRow title="Expense total" value={formatCurrency(totalExpenses, preferences.currency)} />
      </section>
      <section className="panel p-4 sm:p-5">
        <h3 className="section-title">Based on your data</h3>
        {insights.length ? <ul className="mt-4 space-y-3">{insights.map((item) => <li key={item.title} className="rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-3"><p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{item.body}</p></li>)}</ul> : <div className="mt-4 rounded-md border border-dashed border-[var(--line)] px-4 py-8 text-center"><p className="text-sm font-medium text-[var(--text-primary)]">More activity is needed</p><p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[var(--text-secondary)]">Add transactions or savings goals to see insights based on your actual financial activity.</p></div>}
      </section>
    </div>
  )
}

export function ReportsPage() {
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="A concise snapshot of your month-over-month performance." />
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <IncomeExpenseChart data={data.chart} currency={preferences.currency} />
        <BalanceTrendChart data={data.trend} currency={preferences.currency} />
      </section>
      <section className="panel p-4 sm:p-5">
        <h3 className="section-title">Summary</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricRow title="Income" value={formatCurrency(data.income, preferences.currency)} positive />
          <MetricRow title="Expenses" value={formatCurrency(data.expenses, preferences.currency)} />
          <MetricRow title="Savings" value={formatCurrency(data.savings, preferences.currency)} positive />
        </div>
      </section>
    </div>
  )
}

export function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Help" subtitle="Quick answers and support for common account tasks." />
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[
          ['How do I add transactions?', 'Use the Add transaction button at the top of the dashboard to record income or spending.'],
          ['Can I change my profile?', 'Open Settings and update your display name, avatar URL, currency, and theme.'],
          ['How are my charts refreshed?', 'Charts update from the shared dashboard data store as soon as new transactions are saved.'],
          ['Where do my settings save?', 'Profile settings are persisted in your authenticated Firebase user profile.'],
        ].map(([question, answer]) => (
          <div key={question} className="panel p-4 sm:p-5">
            <div className="flex items-start gap-3"><span className="mt-0.5 grid size-8 place-items-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]"><HelpCircle size={16} /></span><div><p className="text-[11px] font-semibold text-[var(--text-primary)]">{question}</p><p className="mt-2 text-[10px] leading-relaxed text-[var(--text-secondary)]">{answer}</p></div></div>
          </div>
        ))}
      </section>
    </div>
  )
}

export function MessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Messages" subtitle="Messages and account updates will appear in this inbox." />
      <section className="panel grid min-h-[300px] justify-items-center content-center px-6 py-12 text-center">
        <span className="grid size-11 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-input)] text-[var(--text-secondary)]"><Messages size={18} /></span>
        <h3 className="mt-4 text-sm font-medium text-[var(--text-primary)]">Your inbox is clear</h3>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-secondary)]">There are no messages yet. We’ll show messages here when this account has inbox updates.</p>
      </section>
    </div>
  )
}

export function ExpensesPage() {
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  const expenses = data.transactions.filter((item) => item.direction === 'expense')
  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" subtitle="Spending across categories and payment methods." />
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SpendingBreakdown data={data.spending} currency={preferences.currency} />
        <div className="panel p-4 sm:p-5">
          <h3 className="section-title">Expense totals</h3>
          <div className="mt-4 space-y-3">
            {expenses.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-2.5">
                <div>
                  <p className="text-[11px] font-medium text-[var(--text-primary)]">{transaction.name}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{transaction.category}</p>
                </div>
                <span className="text-[11px] font-semibold text-[var(--negative)]">-{formatCurrency(transaction.amount, preferences.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export function IncomePage() {
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  const incomes = data.transactions.filter((item) => item.direction === 'income')
  return (
    <div className="space-y-6">
      <PageHeader title="Income" subtitle="Incoming cash and salary streams." />
      <section className="panel p-4 sm:p-5">
        <div className="space-y-3">
          {incomes.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-3">
              <div>
                <p className="text-[11px] font-medium text-[var(--text-primary)]">{transaction.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">{transaction.category}</p>
              </div>
              <span className="text-[11px] font-semibold text-[var(--positive)]">+{formatCurrency(transaction.amount, preferences.currency)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
