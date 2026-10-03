import type { ReactNode } from 'react'
import { ArrowRight, ChevronRight, CreditCard, HelpCircle, TrendingUp } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { BalanceTrendChart, IncomeExpenseChart, SpendingBreakdown } from '../components/FinancialCharts'
import { WalletCard } from '../components/WalletCard'
import { useAuth } from '../context/AuthContext'
import { useDashboardData } from '../context/DashboardDataContext'
import { formatCurrency } from '../utils/finance'

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
        <MetricRow title="Net trend" value={money(data.savings)} positive />
        <MetricRow title="Spending share" value={`${Math.max(1, Math.round((data.expenses / Math.max(data.income, 1)) * 100))}%`} />
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
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  const { searchQuery = '' } = useOutletContext<OutletContext>()
  const filtered = data.transactions.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(searchQuery.toLowerCase()))
  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Monitor cash flow across cards and wallets." actions={<Link to="/" className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] px-3 py-2 text-[10px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">Dashboard <ChevronRight size={13} /></Link>} />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricRow title="Income" value={formatCurrency(data.income, preferences.currency)} positive />
        <MetricRow title="Expenses" value={formatCurrency(data.expenses, preferences.currency)} />
        <MetricRow title="Net" value={formatCurrency(data.savings, preferences.currency)} positive />
      </section>
      <section className="panel overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(80px,.8fr)_minmax(90px,.8fr)_minmax(90px,.8fr)] border-b border-[var(--line)] px-4 py-3 text-[9px] font-semibold uppercase tracking-[.12em] text-[var(--text-muted)] sm:px-5">
          <span>Transaction</span>
          <span className="hidden sm:block">Category</span>
          <span>Date</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {filtered.length ? filtered.map((transaction) => (
            <div key={transaction.id} className="grid grid-cols-[minmax(0,1.5fr)_minmax(80px,.8fr)_minmax(90px,.8fr)_minmax(90px,.8fr)] items-center px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: `${transaction.color}25`, color: transaction.color }}>{transaction.initials}</span>
                <span className="min-w-0"><span className="block truncate text-[11px] font-medium text-[var(--text-primary)]">{transaction.name}</span><span className="block truncate text-[9px] text-[var(--text-muted)] sm:hidden">{transaction.category}</span></span>
              </div>
              <span className="hidden truncate text-[10px] text-[var(--text-secondary)] sm:block">{transaction.category}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">{transaction.date}</span>
              <span className={`text-right text-[11px] font-semibold ${transaction.direction === 'income' ? 'text-[var(--positive)]' : 'text-[var(--text-primary)]'}`}>{transaction.direction === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, preferences.currency)}</span>
            </div>
          )) : <p className="px-5 py-10 text-center text-xs text-[var(--text-muted)]">No transactions match your current search.</p>}
        </div>
      </section>
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
        <MetricRow title="This month" value={formatCurrency(data.income - data.expenses, preferences.currency)} positive />
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
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  return (
    <div className="space-y-6">
      <PageHeader title="Cards / Wallets" subtitle="See balances, brands, and connected accounts." />
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.wallets.map((wallet) => <WalletCard key={wallet.id} wallet={wallet} currency={preferences.currency} />)}
      </section>
      <section className="panel p-4 sm:p-5">
        <h3 className="section-title">Balance summary</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {data.wallets.map((wallet) => (
            <div key={wallet.id} className="rounded-md border border-[var(--line)] bg-[var(--surface-input)] p-3">
              <p className="text-[10px] text-[var(--text-muted)]">{wallet.name}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(wallet.balance, preferences.currency)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function InvoicesPage() {
  const { preferences } = useAuth()
  const invoices = [
    { id: 'INV-2041', client: 'Northstar Studio', amount: 1290, status: 'Paid', due: 'Due in 3 days' },
    { id: 'INV-2038', client: 'Kite Labs', amount: 680, status: 'Pending', due: 'Due in 8 days' },
    { id: 'INV-2032', client: 'Sora Retail', amount: 950, status: 'Review', due: 'Due tomorrow' },
  ]
  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="Track invoices, due dates, and client payments." actions={<button type="button" className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-[10px] font-semibold text-[#111627]">New invoice</button>} />
      <section className="panel overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(100px,.8fr)_minmax(100px,.8fr)_minmax(100px,.8fr)] border-b border-[var(--line)] px-4 py-3 text-[9px] font-semibold uppercase tracking-[.12em] text-[var(--text-muted)] sm:px-5">
          <span>Client</span>
          <span>Invoice</span>
          <span>Due</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="grid grid-cols-[minmax(0,1.2fr)_minmax(100px,.8fr)_minmax(100px,.8fr)_minmax(100px,.8fr)] items-center px-4 py-3 sm:px-5">
              <span className="text-[11px] text-[var(--text-primary)]">{invoice.client}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">{invoice.id}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">{invoice.due}</span>
              <div className="flex items-center justify-end gap-2">
                <span className="text-[11px] font-medium text-[var(--text-primary)]">{formatCurrency(invoice.amount, preferences.currency)}</span>
                <span className="rounded-full border border-[var(--line)] px-2 py-1 text-[9px] text-[var(--text-secondary)]">{invoice.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function RecurringPage() {
  const { preferences } = useAuth()
  const bills = [
    { name: 'Rent', amount: 1840, cadence: 'Monthly', next: '15 Nov' },
    { name: 'Internet', amount: 69, cadence: 'Monthly', next: '12 Nov' },
    { name: 'Gym', amount: 48, cadence: 'Monthly', next: '18 Nov' },
  ]
  return (
    <div className="space-y-6">
      <PageHeader title="Recurring" subtitle="Scheduled transfers and subscriptions you pay regularly." />
      <section className="panel p-4 sm:p-5">
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.name} className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-3">
              <div>
                <p className="text-[11px] font-medium text-[var(--text-primary)]">{bill.name}</p>
                <p className="mt-1 text-[10px] text-[var(--text-secondary)]">{bill.cadence} • Next {bill.next}</p>
              </div>
              <div className="text-right"><p className="text-[11px] font-semibold text-[var(--text-primary)]">{formatCurrency(bill.amount, preferences.currency)}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function SubscriptionsPage() {
  const { preferences } = useAuth()
  const plans = [
    { name: 'Notion', amount: 12, category: 'Productivity' },
    { name: 'Spotify', amount: 10.99, category: 'Entertainment' },
    { name: 'Figma', amount: 18, category: 'Design' },
  ]
  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" subtitle="Keep tabs on your active memberships and recurring services." />
      <section className="panel p-4 sm:p-5">
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.name} className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-3">
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]"><CreditCard size={15} /></span><div><p className="text-[11px] font-medium text-[var(--text-primary)]">{plan.name}</p><p className="text-[10px] text-[var(--text-secondary)]">{plan.category}</p></div></div>
              <span className="text-[11px] font-semibold text-[var(--text-primary)]">{formatCurrency(plan.amount, preferences.currency)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function InsightsPage() {
  const { data } = useDashboardData()
  const { preferences } = useAuth()
  const totalExpenses = data.spending.reduce((sum, item) => sum + item.amount, 0)
  return (
    <div className="space-y-6">
      <PageHeader title="Insights" subtitle="Personalized guidance drawn from your spending data." />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricRow title="Largest category" value={data.spending[0]?.category || 'N/A'} positive />
        <MetricRow title="Saved this month" value={formatCurrency(data.savings, preferences.currency)} positive />
        <MetricRow title="Expense total" value={formatCurrency(totalExpenses, preferences.currency)} />
      </section>
      <section className="panel p-4 sm:p-5">
        <h3 className="section-title">Suggested actions</h3>
        <ul className="mt-4 space-y-3 text-[11px] text-[var(--text-secondary)]">
          <li className="rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-2.5">Your largest expense is <span className="font-medium text-[var(--text-primary)]">{data.spending[0]?.category || 'Food'}</span>, which is consistent with the last 60 days.</li>
          <li className="rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-2.5">Your recurring costs are stable, and your monthly cash buffer has increased by <span className="font-medium text-[var(--text-primary)]">{formatCurrency(data.savings, preferences.currency)}</span>.</li>
          <li className="rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-2.5">You are on track to exceed your current savings goal by <span className="font-medium text-[var(--text-primary)]">{formatCurrency(Math.max(0, data.savings), preferences.currency)}</span>.</li>
        </ul>
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
          ['Where do my settings save?', 'Profile settings are persisted in the authenticated user profile or demo local profile in demo mode.'],
        ].map(([question, answer]) => (
          <div key={question} className="panel p-4 sm:p-5">
            <div className="flex items-start gap-3"><span className="mt-0.5 grid size-8 place-items-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]"><HelpCircle size={16} /></span><div><p className="text-[11px] font-semibold text-[var(--text-primary)]">{question}</p><p className="mt-2 text-[10px] leading-relaxed text-[var(--text-secondary)]">{answer}</p></div></div>
          </div>
        ))}
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
