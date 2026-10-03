import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getDashboardData, saveTransaction } from '../lib/dashboardService'
import { demoDashboard } from '../lib/mockData'
import type { DashboardData, NewTransaction, Transaction } from '../types'

type DashboardDataValue = {
  data: DashboardData
  loading: boolean
  error: string
  createTransaction: (input: NewTransaction) => Promise<Transaction>
  refresh: () => Promise<void>
}

const DashboardDataContext = createContext<DashboardDataValue | null>(null)

function applyTransaction(current: DashboardData, transaction: Transaction): DashboardData {
  const income = transaction.direction === 'income' ? transaction.amount : 0
  const expense = transaction.direction === 'expense' ? transaction.amount : 0
  const currentMonth = new Date(`${transaction.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short' })
  const chart = [...current.chart]
  const monthIndex = chart.findIndex((entry) => entry.month === currentMonth)
  if (monthIndex >= 0) {
    chart[monthIndex] = { ...chart[monthIndex], income: chart[monthIndex].income + income, expenses: chart[monthIndex].expenses + expense }
  } else {
    chart.push({ month: currentMonth, income, expenses: expense })
  }
  const trend = [...current.trend]
  const trendIndex = trend.findIndex((entry) => entry.month === currentMonth)
  if (trendIndex >= 0) trend[trendIndex] = { ...trend[trendIndex], balance: trend[trendIndex].balance + income - expense }
  else trend.push({ month: currentMonth, balance: current.balance + income - expense })
  const spending = [...current.spending]
  if (expense) {
    const category = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment'].includes(transaction.category) ? transaction.category : 'Other'
    const categoryIndex = spending.findIndex((entry) => entry.category === category)
    if (categoryIndex >= 0) spending[categoryIndex] = { ...spending[categoryIndex], amount: spending[categoryIndex].amount + expense }
    else spending.push({ category, amount: expense, color: '#6c7079' })
  }
  return {
    ...current,
    balance: current.balance + income - expense,
    income: current.income + income,
    expenses: current.expenses + expense,
    savings: current.savings + income - expense,
    wallets: current.wallets.map((wallet) => wallet.id === transaction.walletId ? { ...wallet, balance: wallet.balance + income - expense } : wallet),
    transactions: [transaction, ...current.transactions],
    chart: chart.slice(-12),
    trend: trend.slice(-12),
    spending,
  }
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>(demoDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    if (!user) return
    setLoading(true)
    try {
      setData(await getDashboardData(user.uid))
      setError('')
    } catch {
      setError('Your latest data could not be loaded. Sample data is shown until the connection is restored.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    getDashboardData(user.uid).then((result) => {
      if (active) { setData(result); setError('') }
    }).catch(() => {
      if (active) setError('Your latest data could not be loaded. Sample data is shown until the connection is restored.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [user])

  const value = useMemo<DashboardDataValue>(() => ({
    data,
    loading,
    error,
    refresh,
    createTransaction: async (input) => {
      if (!user) throw new Error('Sign in again before adding a transaction.')
      const transaction = await saveTransaction(user.uid, input)
      setData((current) => applyTransaction(current, transaction))
      return transaction
    },
  }), [data, loading, error, user])

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}

export function useDashboardData() {
  const value = useContext(DashboardDataContext)
  if (!value) throw new Error('useDashboardData must be used within DashboardDataProvider')
  return value
}