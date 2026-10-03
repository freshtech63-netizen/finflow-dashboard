import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardData } from '../types'
import { formatCurrency } from '../utils/finance'

type Props = { data: DashboardData['chart']; currency?: string }

export function OverviewChart({ data, currency = 'USD' }: Props) {
  const [range, setRange] = useState<'6 months' | '12 months'>('6 months')
  const visibleData = data.slice(-(range === '6 months' ? 6 : 12))
  const compactCurrency = (value: number) => new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

  return <section className="panel min-w-0 p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="section-title">Overview</h2><p className="section-caption">Income and expenses by month</p></div>
      <label className="sr-only" htmlFor="overview-range">Chart time range</label>
      <select id="overview-range" value={range} onChange={(event) => setRange(event.target.value as typeof range)} aria-label="Chart date range" className="h-8 rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-2.5 text-xs text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"><option>6 months</option><option>12 months</option></select>
    </div>
    {visibleData.length ? <>
      <div className="mt-4 flex items-center gap-4 text-xs text-[var(--text-secondary)]"><span className="flex items-center gap-2"><i className="size-2 rounded-sm bg-[var(--accent)]" />Income</span><span className="flex items-center gap-2"><i className="size-2 rounded-sm bg-[var(--negative)]" />Expenses</span><span className="ml-auto text-[var(--text-muted)]">{currency}</span></div>
      <div className="mt-3 h-[230px] min-w-0">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={visibleData} margin={{ top: 8, right: 4, left: -17, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 5" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
          <YAxis axisLine={false} tickLine={false} tickCount={4} tickFormatter={(value: number) => compactCurrency(value)} />
          <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12 }} formatter={(value) => [formatCurrency(Number(value), currency), '']} />
          <Bar dataKey="income" name="Income" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={24} />
          <Bar dataKey="expenses" name="Expenses" fill="var(--negative)" radius={[3, 3, 0, 0]} maxBarSize={24} />
        </BarChart></ResponsiveContainer>
      </div>
    </> : <div className="grid h-[230px] place-items-center text-center"><p className="max-w-xs text-xs leading-relaxed text-[var(--text-secondary)]">Add transactions to see your monthly income and expenses here.</p></div>}
  </section>
}
