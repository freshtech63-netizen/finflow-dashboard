import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardData } from '../types'
import { formatCurrency } from '../utils/finance'

const tooltipStyle = { background: 'var(--surface-raised)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 11 }

export function IncomeExpenseChart({ data, currency }: { data: DashboardData['chart']; currency: string }) {
  return <section className="panel min-w-0 p-4 sm:p-5">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="section-title">Income and expenses</h2><p className="section-caption">Monthly cash flow</p></div><div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)]"><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[2px] bg-[var(--accent)]" />Income</span><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-[2px] bg-[var(--negative)]" />Expenses</span></div></div>
    <div className="h-[218px] min-w-0 sm:h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }} barGap={4}>
      <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={9} /><YAxis axisLine={false} tickLine={false} tickCount={4} tickFormatter={(value: number) => `${currency === 'USD' ? '$' : ''}${value >= 1000 ? `${(value / 1000).toFixed(value % 1000 ? 1 : 0)}k` : value}`} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value), currency), '']} /><Bar dataKey="income" name="Income" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={24} /><Bar dataKey="expenses" name="Expenses" fill="var(--negative)" radius={[3, 3, 0, 0]} maxBarSize={24} />
    </BarChart></ResponsiveContainer></div>
  </section>
}

export function BalanceTrendChart({ data, currency }: { data: DashboardData['trend']; currency: string }) {
  return <section className="panel min-w-0 p-4 sm:p-5">
    <div className="mb-4"><h2 className="section-title">Balance trend</h2><p className="section-caption">Net account balance over time</p></div>
    {data.length ? <div className="h-[218px] min-w-0 sm:h-[250px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
      <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={9} /><YAxis axisLine={false} tickLine={false} tickCount={4} tickFormatter={(value: number) => `${currency === 'USD' ? '$' : ''}${value >= 1000 ? `${(value / 1000).toFixed(value % 1000 ? 1 : 0)}k` : value}`} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value), currency), 'Balance']} /><Line type="monotone" dataKey="balance" stroke="var(--accent)" strokeWidth={2} dot={{ r: 2.5, fill: 'var(--surface-raised)', stroke: 'var(--accent)', strokeWidth: 1.5 }} activeDot={{ r: 4, fill: 'var(--accent)' }} />
    </LineChart></ResponsiveContainer></div> : <div className="grid h-[218px] place-items-center text-xs text-[var(--text-muted)]">Add transactions to see your balance trend.</div>}
  </section>
}

export function SpendingBreakdown({ data, currency }: { data: DashboardData['spending']; currency: string }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  return <section className="panel min-w-0 p-4 sm:p-5">
    <div className="mb-2"><h2 className="section-title">Spending breakdown</h2><p className="section-caption">Expenses by category</p></div>
    {data.length ? <div className="grid grid-cols-[minmax(120px,.9fr)_minmax(0,1fr)] items-center gap-2 sm:gap-4"><div className="h-[190px] min-w-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="amount" nameKey="category" innerRadius="64%" outerRadius="88%" paddingAngle={2} stroke="none">{data.map((entry) => <Cell key={entry.category} fill={entry.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value), currency), '']} /></PieChart></ResponsiveContainer><div className="pointer-events-none -mt-[117px] text-center"><p className="text-[9px] text-[var(--text-muted)]">Total</p><p className="mt-0.5 text-xs font-semibold text-[var(--text-primary)]">{formatCurrency(total, currency)}</p></div></div><ul className="space-y-2.5">{data.map((item) => <li key={item.category} className="flex min-w-0 items-center justify-between gap-2 text-[10px]"><span className="flex min-w-0 items-center gap-2 text-[var(--text-secondary)]"><i className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} /><span className="truncate">{item.category}</span></span><span className="shrink-0 font-medium text-[var(--text-primary)]">{formatCurrency(item.amount, currency)}</span></li>)}</ul></div> : <div className="grid h-[190px] place-items-center text-xs text-[var(--text-muted)]">No expense activity to break down.</div>}
  </section>
}