import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getDashboardData } from '../lib/dashboardService'
import {
  createTransaction as createTransactionRecord,
  createWallet as createWalletRecord,
  deleteTransaction as deleteTransactionRecord,
  deleteWallet as deleteWalletRecord,
  updateTransaction as updateTransactionRecord,
  updateWallet as updateWalletRecord,
} from '../services/firestore'
import { emptyDashboard } from '../lib/dashboardDefaults'
import type { DashboardData, NewSavingsGoal, NewTransaction, NewWallet, SavingsGoal, Transaction, Wallet } from '../types'
import { expenseCategoryColor, normalizeExpenseCategory } from '../utils/finance'
import { firebaseErrorMessage } from '../utils/firebaseErrors'

type DashboardDataValue = {
  data: DashboardData
  loading: boolean
  error: string
  createTransaction: (input: NewTransaction) => Promise<Transaction>
  updateTransaction: (input: NewTransaction, transactionId: string) => Promise<Transaction>
  deleteTransaction: (transactionId: string) => Promise<void>
  saveWallet: (input: NewWallet, walletId?: string) => Promise<Wallet>
  deleteWallet: (walletId: string) => Promise<void>
  saveSavingsGoal: (input: NewSavingsGoal, goalId?: string) => Promise<SavingsGoal>
  deleteSavingsGoal: (goalId: string) => Promise<void>
  refresh: () => Promise<void>
}

const DashboardDataContext = createContext<DashboardDataValue | null>(null)

function applyTransaction(current: DashboardData, transaction: Transaction): DashboardData {
  const income = transaction.direction === 'income' ? transaction.amount : 0
  const expense = transaction.direction === 'expense' ? transaction.amount : 0
  const transactionDate = new Date(`${transaction.date}T12:00:00`)
  const currentMonth = `${transactionDate.toLocaleDateString('en-US', { month: 'short' })} '${String(transactionDate.getFullYear()).slice(-2)}`
  const period = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`
  const chart = [...current.chart]
  const monthIndex = chart.findIndex((entry) => entry.period === period || (!entry.period && entry.month === currentMonth))
  if (monthIndex >= 0) {
    chart[monthIndex] = { ...chart[monthIndex], income: chart[monthIndex].income + income, expenses: chart[monthIndex].expenses + expense }
  } else {
    chart.push({ month: currentMonth, period, income, expenses: expense })
  }
  const trend = [...current.trend]
  const trendIndex = trend.findIndex((entry) => entry.period === period || (!entry.period && entry.month === currentMonth))
  if (trendIndex >= 0) trend[trendIndex] = { ...trend[trendIndex], balance: trend[trendIndex].balance + income - expense }
  else trend.push({ month: currentMonth, period, balance: current.balance + income - expense })
  const spending = [...current.spending]
  if (expense) {
    const category = normalizeExpenseCategory(transaction.category)
    const categoryIndex = spending.findIndex((entry) => entry.category === category)
    if (categoryIndex >= 0) spending[categoryIndex] = { ...spending[categoryIndex], amount: spending[categoryIndex].amount + expense }
    else spending.push({ category, amount: expense, color: expenseCategoryColor(category) })
  }
  return {
    ...current,
    balance: current.balance + income - expense,
    income: current.income + income,
    expenses: current.expenses + expense,
    savings: current.savings + income - expense,
    wallets: current.wallets.map((wallet) => wallet.id === transaction.walletId ? { ...wallet, balance: wallet.balance + income - expense } : wallet),
    transactions: [transaction, ...current.transactions],
    chart: chart.sort((a, b) => (a.period || '').localeCompare(b.period || '')).slice(-12),
    trend: trend.sort((a, b) => (a.period || '').localeCompare(b.period || '')).slice(-12),
    spending,
  }
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { user, authStatus } = useAuth()
  const [data, setData] = useState<DashboardData>(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    if (!user || authStatus !== 'authenticated') return
    setLoading(true)
    try {
      setData(await getDashboardData())
      setError('')
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'Your latest data could not be loaded.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    if (authStatus === 'loading') {
      setLoading(true)
      return
    }
    if (!user || authStatus !== 'authenticated') {
      setData(emptyDashboard)
      setError('')
      setLoading(false)
      return
    }
    setData(emptyDashboard)
    setError('')
    setLoading(true)
    getDashboardData().then((result) => {
      if (active) { setData(result); setError('') }
    }).catch((caught: unknown) => {
      if (active) setError(firebaseErrorMessage(caught, 'Your latest data could not be loaded.'))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [user, authStatus])

  const value = useMemo<DashboardDataValue>(() => ({
    data,
    loading,
    error,
    refresh,
    createTransaction: async (input) => {
      if (!user) throw new Error('Sign in again before adding a transaction.')
      const transaction = await createTransactionRecord(input)
      setData((current) => applyTransaction(current, transaction))
      return transaction
    },
    updateTransaction: async (input, transactionId) => {
      if (!user) throw new Error('Sign in again before editing a transaction.')
      const transaction = await updateTransactionRecord(transactionId, input)
      setData(await getDashboardData())
      return transaction
    },
    deleteTransaction: async (transactionId) => {
      if (!user) throw new Error('Sign in again before deleting a transaction.')
      await deleteTransactionRecord(transactionId)
      setData(await getDashboardData())
    },
    saveWallet: async (input, walletId) => {
      if (!user) throw new Error('Sign in again before saving a wallet.')
      const wallet = walletId ? await updateWalletRecord(walletId, input) : await createWalletRecord(input)
      setData((current) => {
        const existing = current.wallets.find((item) => item.id === wallet.id)
        return {
          ...current,
          balance: current.balance + wallet.balance - (existing?.balance || 0),
          wallets: existing ? current.wallets.map((item) => item.id === wallet.id ? wallet : item) : [...current.wallets, wallet],
        }
      })
      return wallet
    },
    deleteWallet: async (walletId) => {
      if (!user) throw new Error('Sign in again before deleting a wallet.')
      await deleteWalletRecord(walletId)
      setData((current) => {
        const wallet = current.wallets.find((item) => item.id === walletId)
        return { ...current, balance: current.balance - (wallet?.balance || 0), wallets: current.wallets.filter((item) => item.id !== walletId) }
      })
    },
    saveSavingsGoal: async (input, goalId) => {
      void input
      void goalId
      throw new Error('Savings goals are not part of the current Firestore rollout. Wallet and transaction storage are enabled first.')
    },
    deleteSavingsGoal: async (goalId) => {
      void goalId
      throw new Error('Savings goals are not part of the current Firestore rollout. Wallet and transaction storage are enabled first.')
    },
  }), [data, loading, error, user, authStatus])

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}

export function useDashboardData() {
  const value = useContext(DashboardDataContext)
  if (!value) throw new Error('useDashboardData must be used within DashboardDataProvider')
  return value
}