import type { Transaction } from '../types'

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

export function formatTransactionDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

export function transactionNet(transactions: Transaction[]) {
  return transactions.reduce((total, transaction) => total + (transaction.direction === 'income' ? transaction.amount : -transaction.amount), 0)
}