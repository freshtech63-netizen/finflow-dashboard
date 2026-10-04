import type { DashboardData, Transaction, Wallet } from '../types'
import { getTransactions, getWallets } from '../services/firestore'
import { expenseCategoryColor, normalizeExpenseCategory } from '../utils/finance'

function normalizeTransaction(transaction: Partial<Transaction> & { id: string; amount: number; direction: 'income' | 'expense' }): Transaction {
  const name = transaction.name || 'Transaction'
  return {
    id: transaction.id,
    name,
    category: transaction.category || 'Other',
    date: transaction.date || new Date().toISOString().slice(0, 10),
    amount: Number(transaction.amount),
    direction: transaction.direction,
    initials: transaction.initials || name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    color: transaction.color || '#8298e8',
    paymentMethod: transaction.paymentMethod,
    walletId: transaction.walletId,
    notes: transaction.notes,
  }
}

function chartFromTransactions(transactions: Transaction[]) {
  const byMonth = new Map<string, { month: string; period: string; income: number; expenses: number; time: number }>()
  transactions.forEach((item) => {
    const date = new Date(`${item.date}T12:00:00`)
    if (Number.isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const value = byMonth.get(key) || { month: `${monthName} '${String(date.getFullYear()).slice(-2)}`, period, income: 0, expenses: 0, time: date.getTime() }
    value[item.direction === 'income' ? 'income' : 'expenses'] += item.amount
    byMonth.set(key, value)
  })
  return [...byMonth.values()].sort((a, b) => a.time - b.time).map(({ month, period, income, expenses }) => ({ month, period, income, expenses }))
}

function spendingFromTransactions(transactions: Transaction[]) {
  const amounts = new Map<string, number>()
  transactions.filter((item) => item.direction === 'expense').forEach((item) => {
    const category = normalizeExpenseCategory(item.category)
    amounts.set(category, (amounts.get(category) || 0) + item.amount)
  })
  return [...amounts.entries()].map(([category, amount]) => ({ category, amount, color: expenseCategoryColor(category) })).sort((a, b) => b.amount - a.amount)
}

function deriveData(transactions: Transaction[], wallets: Wallet[]): DashboardData {
  const income = transactions.filter((item) => item.direction === 'income').reduce((sum, item) => sum + item.amount, 0)
  const expenses = transactions.filter((item) => item.direction === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const allMonthlyData = chartFromTransactions(transactions)
  const chart = allMonthlyData.slice(-12)
  const netTransactions = income - expenses
  const openingBalance = wallets.length ? wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0) - netTransactions : 0
  let runningBalance = openingBalance
  const trend = allMonthlyData.map((month) => {
    runningBalance += month.income - month.expenses
    return { month: month.month, period: month.period, balance: runningBalance }
  }).slice(-12)
  return {
    balance: wallets.length ? wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0) : income - expenses,
    income,
    expenses,
    savings: income - expenses,
    wallets,
    goals: [],
    transactions: [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    chart,
    trend,
    spending: spendingFromTransactions(transactions),
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const [wallets, transactions] = await Promise.all([getWallets(), getTransactions()])
  return deriveData(transactions.map((item) => normalizeTransaction(item)), wallets)
}