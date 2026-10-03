import { collection, doc, getDocs, query, runTransaction, serverTimestamp, where } from 'firebase/firestore'
import { COLLECTIONS, db } from './firebase'
import { demoDashboard } from './mockData'
import type { DashboardData, NewTransaction, SavingsGoal, Transaction, Wallet } from '../types'

const DEMO_TRANSACTIONS_KEY = 'finflow-demo-transactions'
const categoryPalette: Record<string, string> = {
  Food: '#8298e8', Transport: '#79aa9a', Bills: '#a4a8b1', Shopping: '#c1a17c', Entertainment: '#a28eb9', Other: '#6c7079',
}

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
  }
}

function readDemoTransactions(): Transaction[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(DEMO_TRANSACTIONS_KEY) || '[]') as Partial<Transaction>[]
    return parsed.filter((item): item is Partial<Transaction> & { id: string; amount: number; direction: 'income' | 'expense' } => Boolean(item.id && typeof item.amount === 'number' && (item.direction === 'income' || item.direction === 'expense'))).map(normalizeTransaction)
  } catch {
    return []
  }
}

function chartFromTransactions(transactions: Transaction[]) {
  const byMonth = new Map<string, { month: string; income: number; expenses: number; time: number }>()
  transactions.forEach((item) => {
    const date = new Date(`${item.date}T12:00:00`)
    if (Number.isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const value = byMonth.get(key) || { month: date.toLocaleDateString('en-US', { month: 'short' }), income: 0, expenses: 0, time: date.getTime() }
    value[item.direction === 'income' ? 'income' : 'expenses'] += item.amount
    byMonth.set(key, value)
  })
  return [...byMonth.values()].sort((a, b) => a.time - b.time).slice(-6).map(({ month, income, expenses }) => ({ month, income, expenses }))
}

function spendingFromTransactions(transactions: Transaction[]) {
  const amounts = new Map<string, number>()
  transactions.filter((item) => item.direction === 'expense').forEach((item) => {
    const category = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment'].includes(item.category) ? item.category : 'Other'
    amounts.set(category, (amounts.get(category) || 0) + item.amount)
  })
  return [...amounts.entries()].map(([category, amount]) => ({ category, amount, color: categoryPalette[category] }))
}

function deriveData(transactions: Transaction[], wallets: Wallet[], goals: SavingsGoal[]): DashboardData {
  const income = transactions.filter((item) => item.direction === 'income').reduce((sum, item) => sum + item.amount, 0)
  const expenses = transactions.filter((item) => item.direction === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const chart = chartFromTransactions(transactions)
  const netTransactions = income - expenses
  const openingBalance = wallets.length ? wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0) - netTransactions : 0
  let runningBalance = openingBalance
  const trend = chart.map((month) => {
    runningBalance += month.income - month.expenses
    return { month: month.month, balance: runningBalance }
  })
  return {
    balance: wallets.length ? wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0) : income - expenses,
    income,
    expenses,
    savings: income - expenses,
    wallets,
    goals,
    transactions: [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    chart,
    trend,
    spending: spendingFromTransactions(transactions),
  }
}

export async function getDashboardData(uid: string): Promise<DashboardData> {
  if (!db || uid === 'demo') {
    const created = readDemoTransactions()
    const transactions = [...demoDashboard.transactions, ...created]
    const income = created.filter((item) => item.direction === 'income').reduce((sum, item) => sum + item.amount, 0)
    const expenses = created.filter((item) => item.direction === 'expense').reduce((sum, item) => sum + item.amount, 0)
    return {
      ...demoDashboard,
      balance: demoDashboard.balance + income - expenses,
      income: demoDashboard.income + income,
      expenses: demoDashboard.expenses + expenses,
      savings: demoDashboard.savings + income - expenses,
      wallets: demoDashboard.wallets.map((wallet) => ({ ...wallet, balance: wallet.balance + created.filter((item) => item.walletId === wallet.id).reduce((sum, item) => sum + (item.direction === 'income' ? item.amount : -item.amount), 0) })),
      transactions,
      chart: demoDashboard.chart.map((entry) => ({ ...entry })),
      trend: demoDashboard.trend.map((entry) => ({ ...entry })),
      spending: demoDashboard.spending,
    }
  }

  const firestore = db
  if (!firestore) return demoDashboard
  const read = async <T extends Record<string, unknown>>(name: string) => {
    const snapshot = await getDocs(query(collection(firestore, name), where('userId', '==', uid)))
    return snapshot.docs.map((record) => ({ id: record.id, ...record.data() }) as unknown as T)
  }
  const [wallets, rawTransactions, goals] = await Promise.all([
    read<Wallet>(COLLECTIONS.wallets),
    read<Transaction>(COLLECTIONS.transactions),
    read<SavingsGoal>(COLLECTIONS.savingsGoals),
  ])
  if (!wallets.length && !rawTransactions.length && !goals.length) return demoDashboard
  return deriveData(rawTransactions.map((item) => normalizeTransaction(item)), wallets, goals)
}

export async function saveTransaction(uid: string, input: NewTransaction): Promise<Transaction> {
  const normalized = normalizeTransaction({ ...input, id: globalThis.crypto?.randomUUID?.() || `${Date.now()}` })
  const firestore = db
  if (!firestore || uid === 'demo') {
    localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify([...readDemoTransactions(), normalized]))
    return normalized
  }

  const transactionRef = doc(collection(firestore, COLLECTIONS.transactions))
  await runTransaction(firestore, async (transaction) => {
    const walletRef = input.walletId && !input.walletId.startsWith('sample-') ? doc(firestore, COLLECTIONS.wallets, input.walletId) : null
    const walletSnapshot = walletRef ? await transaction.get(walletRef) : null
    transaction.set(transactionRef, { ...normalized, userId: uid, createdAt: serverTimestamp() })
    if (walletRef && walletSnapshot?.exists()) {
      transaction.update(walletRef, { balance: Number(walletSnapshot.data().balance || 0) + (input.direction === 'income' ? input.amount : -input.amount), updatedAt: serverTimestamp() })
    }
  })
  return { ...normalized, id: transactionRef.id }
}