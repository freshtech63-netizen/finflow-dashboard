export type Transaction = {
  id: string
  name: string
  category: string
  date: string
  amount: number
  direction: 'income' | 'expense'
  initials: string
  color: string
  paymentMethod?: string
  walletId?: string
}

export type NewTransaction = Omit<Transaction, 'id' | 'initials' | 'color'>

export type Wallet = {
  id: string
  name: string
  number: string
  balance: number
  tone: 'blue' | 'green' | 'orange'
  brand: string
}

export type SavingsGoal = {
  id: string
  name: string
  saved: number
  target: number
  color: string
}

export type DashboardData = {
  balance: number
  income: number
  expenses: number
  savings: number
  wallets: Wallet[]
  goals: SavingsGoal[]
  transactions: Transaction[]
  chart: { month: string; income: number; expenses: number }[]
  trend: { month: string; balance: number }[]
  spending: { category: string; amount: number; color: string }[]
}