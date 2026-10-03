import type { Transaction } from '../types'

const expenseCategoryColors: Record<string, string> = {
  Food: '#7893a8',
  Transport: '#718b88',
  Bills: '#898d92',
  Shopping: '#9b8c76',
  Entertainment: '#827c88',
  Other: '#62666a',
}

export function normalizeExpenseCategory(category: string) {
  return Object.hasOwn(expenseCategoryColors, category) ? category : 'Other'
}

export function expenseCategoryColor(category: string) {
  return expenseCategoryColors[normalizeExpenseCategory(category)]
}

export function formatCurrency(value: number, currency = 'USD') {
  const locale = currency === 'NGN' ? 'en-NG' : 'en-US'
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

export function formatTransactionDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

export function transactionNet(transactions: Transaction[]) {
  return transactions.reduce((total, transaction) => total + (transaction.direction === 'income' ? transaction.amount : -transaction.amount), 0)
}

function csvCell(value: string | number) {
  const text = String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function downloadTransactionsCsv(transactions: Transaction[]) {
  const header = ['Description', 'Category', 'Date', 'Type', 'Amount', 'Payment method', 'Wallet', 'Notes']
  const rows = transactions.map((item) => [
    item.name,
    item.category,
    item.date,
    item.direction,
    item.amount.toFixed(2),
    item.paymentMethod || '',
    item.walletId || '',
    item.notes || '',
  ])
  const content = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `finflow-transactions-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}