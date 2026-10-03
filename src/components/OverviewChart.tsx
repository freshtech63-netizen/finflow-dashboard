import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardData } from '../types'

export function OverviewChart({ data }: { data: DashboardData['chart'] }) {
  const [range, setRange] = useState('6 months')
  return <section className="panel min-w-0 p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[13px] font-semibold text-zinc-100">Cash flow</h2><p className="mt-1 text-[10px] text-zinc-600">Income and expenses over time</p></div><select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Chart date range" className="rounded-md border border-[#2a2c32] bg-[#15171c] px-2.5 py-1.5 text-[10px] text-zinc-400 outline-none"><option>6 months</option><option>12 months</option></select></div>
    <div className="mt-4 flex items-center gap-4 text-[10px]"><span className="flex items-center gap-1.5 text-zinc-500"><i className="size-1.5 rounded-full bg-[#7f98ff]" />Income</span><span className="flex items-center gap-1.5 text-zinc-500"><i className="size-1.5 rounded-full bg-[#54cda0]" />Expenses</span><span className="ml-auto text-[9px] text-zinc-600">USD</span></div>
    <div className="mt-3 h-[202px] w-full sm:h-[230px]">
      <ResponsiveContainer width="100%" height="100%"><AreaChart data={range === '12 months' ? [...data, ...data] : data} margin={{ top: 8, right: 2, left: -17, bottom: 0 }}>
        <defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7190ff" stopOpacity={0.22} /><stop offset="95%" stopColor="#7190ff" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#54cda0" stopOpacity={0.14} /><stop offset="95%" stopColor="#54cda0" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value: number) => `$${value / 1000}k`} tickCount={4} /><Tooltip contentStyle={{ background: '#1a1c22', border: '1px solid #30323a', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#f4f5f7' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
        <Area type="monotone" dataKey="income" stroke="#8198ff" strokeWidth={2} fill="url(#incomeFill)" activeDot={{ r: 4, fill: '#a9b8ff', stroke: '#202333', strokeWidth: 2 }} /><Area type="monotone" dataKey="expenses" stroke="#5bc89e" strokeWidth={2} fill="url(#expenseFill)" activeDot={{ r: 4, fill: '#94e3c2', stroke: '#202333', strokeWidth: 2 }} />
      </AreaChart></ResponsiveContainer>
    </div>
  </section>
}