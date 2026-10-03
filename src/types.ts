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
  notes?: string
}

export type NewTransaction = Omit<Transaction, 'id' | 'initials' | 'color'>

export type Wallet = {
  id: string
  name: string
  number: string
  balance: number
  tone: 'blue' | 'green' | 'orange'
  brand: string
  status?: 'active' | 'inactive'
}

export type NewWallet = Omit<Wallet, 'id'>

export type SavingsGoal = {
  id: string
  name: string
  saved: number
  target: number
  color: string
}

export type NewSavingsGoal = Omit<SavingsGoal, 'id'>

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'

export type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
}

export type Invoice = {
  id: string
  userId: string
  customerName: string
  customerEmail: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  taxPercent: number
  discount: number
  notes: string
  status: InvoiceStatus
  subtotal: number
  tax: number
  total: number
}

export type NewInvoice = Omit<Invoice, 'id' | 'userId' | 'subtotal' | 'tax' | 'total'>

export type ScheduleType = 'recurring' | 'subscription'
export type ScheduledPaymentStatus = 'active' | 'paused' | 'cancelled'

export type ScheduledPayment = {
  id: string
  userId: string
  type: ScheduleType
  name: string
  amount: number
  category: string
  frequency: 'weekly' | 'monthly' | 'yearly' | 'custom'
  nextPaymentDate: string
  walletId: string
  status: ScheduledPaymentStatus
}

export type NewScheduledPayment = Omit<ScheduledPayment, 'id' | 'userId' | 'type'>

export type DashboardData = {
  balance: number
  income: number
  expenses: number
  savings: number
  wallets: Wallet[]
  goals: SavingsGoal[]
  transactions: Transaction[]
  chart: { month: string; period?: string; income: number; expenses: number }[]
  trend: { month: string; period?: string; balance: number }[]
  spending: { category: string; amount: number; color: string }[]
}