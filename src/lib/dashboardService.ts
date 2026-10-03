import { collection, deleteDoc, doc, getDocs, query, runTransaction, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { COLLECTIONS, db } from './firebase'
import { demoDashboard } from './mockData'
import type { DashboardData, NewSavingsGoal, NewTransaction, NewWallet, SavingsGoal, Transaction, Wallet } from '../types'
import { expenseCategoryColor, normalizeExpenseCategory } from '../utils/finance'

const DEMO_TRANSACTIONS_KEY = 'finflow-demo-transactions'
const DEMO_WALLETS_KEY = 'finflow-demo-wallets'
const DEMO_GOALS_KEY = 'finflow-demo-goals'
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

function readDemoTransactions(): Transaction[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(DEMO_TRANSACTIONS_KEY) || '[]') as Partial<Transaction>[]
    return parsed.filter((item): item is Partial<Transaction> & { id: string; amount: number; direction: 'income' | 'expense' } => Boolean(item.id && typeof item.amount === 'number' && (item.direction === 'income' || item.direction === 'expense'))).map(normalizeTransaction)
  } catch {
    return []
  }
}

function readDemoWallets(): Wallet[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DEMO_WALLETS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed as Wallet[] : []
  } catch {
    return []
  }
}

function readDemoGoals(): SavingsGoal[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DEMO_GOALS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed as SavingsGoal[] : []
  } catch {
    return []
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

function deriveData(transactions: Transaction[], wallets: Wallet[], goals: SavingsGoal[]): DashboardData {
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
    const additionalWallets = readDemoWallets()
    const income = created.filter((item) => item.direction === 'income').reduce((sum, item) => sum + item.amount, 0)
    const expenses = created.filter((item) => item.direction === 'expense').reduce((sum, item) => sum + item.amount, 0)
    return {
      ...demoDashboard,
      balance: demoDashboard.balance + additionalWallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0) + income - expenses,
      income: demoDashboard.income + income,
      expenses: demoDashboard.expenses + expenses,
      savings: demoDashboard.savings + income - expenses,
      wallets: [...demoDashboard.wallets, ...additionalWallets].map((wallet) => ({ ...wallet, balance: wallet.balance + created.filter((item) => item.walletId === wallet.id).reduce((sum, item) => sum + (item.direction === 'income' ? item.amount : -item.amount), 0) })),
      goals: [...demoDashboard.goals, ...readDemoGoals()],
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
  return deriveData(rawTransactions.map((item) => normalizeTransaction(item)), wallets, goals)
}

export async function saveWallet(uid: string, input: NewWallet, walletId?: string): Promise<Wallet> {
  const id = walletId || globalThis.crypto?.randomUUID?.() || `${Date.now()}`
  const wallet = { ...input, id, status: input.status || 'active' }
  if (!db || uid === 'demo') {
    const wallets = readDemoWallets()
    const next = walletId ? wallets.map((item) => item.id === walletId ? wallet : item) : [...wallets, wallet]
    localStorage.setItem(DEMO_WALLETS_KEY, JSON.stringify(next))
    return wallet
  }
  const reference = doc(db, COLLECTIONS.wallets, id)
  await setDoc(reference, { ...wallet, userId: uid, updatedAt: serverTimestamp(), ...(!walletId ? { createdAt: serverTimestamp() } : {}) }, { merge: Boolean(walletId) })
  return wallet
}

export async function deleteWallet(uid: string, walletId: string): Promise<void> {
  if (!db || uid === 'demo') {
    localStorage.setItem(DEMO_WALLETS_KEY, JSON.stringify(readDemoWallets().filter((wallet) => wallet.id !== walletId)))
    return
  }
  await deleteDoc(doc(db, COLLECTIONS.wallets, walletId))
}

export async function saveSavingsGoal(uid: string, input: NewSavingsGoal, goalId?: string): Promise<SavingsGoal> {
  const id = goalId || globalThis.crypto?.randomUUID?.() || `${Date.now()}`
  const goal = { ...input, id }
  if (!db || uid === 'demo') {
    const goals = readDemoGoals()
    localStorage.setItem(DEMO_GOALS_KEY, JSON.stringify(goalId ? goals.map((item) => item.id === goalId ? goal : item) : [...goals, goal]))
    return goal
  }
  await setDoc(doc(db, COLLECTIONS.savingsGoals, id), { ...goal, userId: uid, updatedAt: serverTimestamp(), ...(!goalId ? { createdAt: serverTimestamp() } : {}) }, { merge: Boolean(goalId) })
  return goal
}

export async function deleteSavingsGoal(uid: string, goalId: string): Promise<void> {
  if (!db || uid === 'demo') {
    localStorage.setItem(DEMO_GOALS_KEY, JSON.stringify(readDemoGoals().filter((goal) => goal.id !== goalId)))
    return
  }
  await deleteDoc(doc(db, COLLECTIONS.savingsGoals, goalId))
}

export async function saveTransaction(uid: string, input: NewTransaction, transactionId?: string): Promise<Transaction> {
  const id = transactionId || globalThis.crypto?.randomUUID?.() || `${Date.now()}`
  const normalized = normalizeTransaction({ ...input, id })
  const firestore = db
  if (!firestore || uid === 'demo') {
    const records = readDemoTransactions()
    if (transactionId && !records.some((item) => item.id === transactionId)) throw new Error('Sample transactions cannot be edited.')
    localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(transactionId ? records.map((item) => item.id === transactionId ? normalized : item) : [...records, normalized]))
    return normalized
  }

  const transactionRef = transactionId ? doc(firestore, COLLECTIONS.transactions, transactionId) : doc(collection(firestore, COLLECTIONS.transactions))
  await runTransaction(firestore, async (transaction) => {
    const previousSnapshot = transactionId ? await transaction.get(transactionRef) : null
    if (transactionId && (!previousSnapshot?.exists() || previousSnapshot.data().userId !== uid)) throw new Error('This transaction is unavailable.')
    const previous = previousSnapshot?.data() as (Transaction & { userId: string }) | undefined
    const walletIds = [...new Set([previous?.walletId, input.walletId].filter((walletId): walletId is string => Boolean(walletId && !walletId.startsWith('sample-'))))]
    const walletEntries = await Promise.all(walletIds.map(async (walletId) => {
      const reference = doc(firestore, COLLECTIONS.wallets, walletId)
      return [walletId, reference, await transaction.get(reference)] as const
    }))
    const deltaByWallet = new Map<string, number>()
    if (previous?.walletId && walletIds.includes(previous.walletId)) {
      deltaByWallet.set(previous.walletId, (previous.direction === 'income' ? -1 : 1) * Number(previous.amount))
    }
    if (input.walletId && walletIds.includes(input.walletId)) {
      deltaByWallet.set(input.walletId, (deltaByWallet.get(input.walletId) || 0) + (input.direction === 'income' ? 1 : -1) * input.amount)
    }
    const previousCreatedAt = previousSnapshot?.data()?.createdAt
    transaction.set(transactionRef, {
      ...normalized,
      userId: uid,
      createdAt: previousCreatedAt || serverTimestamp(),
      ...(previousSnapshot ? { updatedAt: serverTimestamp() } : {}),
    })
    for (const [walletId, reference, snapshot] of walletEntries) {
      if (!snapshot.exists()) {
        if (walletId === input.walletId) throw new Error('Select an active wallet before saving this transaction.')
        continue
      }
      if (snapshot.data().userId !== uid) throw new Error('This wallet is unavailable.')
      transaction.update(reference, { balance: Number(snapshot.data().balance || 0) + (deltaByWallet.get(walletId) || 0), updatedAt: serverTimestamp() })
    }
  })
  return { ...normalized, id }
}

export async function deleteTransaction(uid: string, transactionId: string): Promise<void> {
  if (!db || uid === 'demo') {
    const records = readDemoTransactions()
    if (!records.some((item) => item.id === transactionId)) throw new Error('Sample transactions cannot be deleted.')
    localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(records.filter((item) => item.id !== transactionId)))
    return
  }
  const firestore = db
  const reference = doc(firestore, COLLECTIONS.transactions, transactionId)
  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(reference)
    if (!snapshot.exists() || snapshot.data().userId !== uid) throw new Error('This transaction is unavailable.')
    const record = snapshot.data() as Transaction
    const walletReference = record.walletId && !record.walletId.startsWith('sample-') ? doc(firestore, COLLECTIONS.wallets, record.walletId) : null
    const walletSnapshot = walletReference ? await transaction.get(walletReference) : null
    if (walletReference && walletSnapshot?.exists() && walletSnapshot.data().userId === uid) {
      const reverse = record.direction === 'income' ? -Number(record.amount) : Number(record.amount)
      transaction.update(walletReference, { balance: Number(walletSnapshot.data().balance || 0) + reverse, updatedAt: serverTimestamp() })
    }
    transaction.delete(reference)
  })
}