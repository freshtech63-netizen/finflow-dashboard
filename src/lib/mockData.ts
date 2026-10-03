import type { DashboardData } from '../types'

export const demoDashboard: DashboardData = {
  balance: 24850.82,
  income: 8420.0,
  expenses: 3128.45,
  savings: 1722.0,
  wallets: [
    { id: 'sample-wallet-main', name: 'Main account', number: '••••  4829', balance: 12480.2, tone: 'blue', brand: 'VISA' },
    { id: 'sample-wallet-savings', name: 'Savings', number: '••••  0951', balance: 8370.62, tone: 'green', brand: 'VISA' },
  ],
  goals: [
    { id: 'goal-travel', name: 'Japan trip', saved: 2840, target: 5000, color: '#7190ff' },
    { id: 'goal-home', name: 'New home', saved: 12650, target: 24000, color: '#67d6a2' },
    { id: 'goal-emergency', name: 'Emergency fund', saved: 4200, target: 6000, color: '#f3bb72' },
  ],
  transactions: [
    { id: 'tx-1', name: 'Whole Foods Market', category: 'Groceries', date: 'Today, 10:42 AM', amount: 84.36, direction: 'expense', initials: 'W', color: '#d98054' },
    { id: 'tx-2', name: 'Acme Studio', category: 'Salary', date: 'Today, 9:15 AM', amount: 4250.0, direction: 'income', initials: 'A', color: '#6788dc' },
    { id: 'tx-3', name: 'Spotify Premium', category: 'Subscriptions', date: 'Yesterday', amount: 10.99, direction: 'expense', initials: 'S', color: '#63bb85' },
    { id: 'tx-4', name: 'Blue Bottle Coffee', category: 'Dining', date: 'Yesterday', amount: 8.5, direction: 'expense', initials: 'B', color: '#ab805e' },
    { id: 'tx-5', name: 'Freelance project', category: 'Side income', date: 'Oct 1, 2026', amount: 680.0, direction: 'income', initials: 'F', color: '#9372d5' },
  ],
  chart: [
    { month: 'May', income: 6400, expenses: 3200 },
    { month: 'Jun', income: 7100, expenses: 3900 },
    { month: 'Jul', income: 6850, expenses: 3450 },
    { month: 'Aug', income: 7900, expenses: 4300 },
    { month: 'Sep', income: 7450, expenses: 3550 },
    { month: 'Oct', income: 8420, expenses: 3128 },
  ],
  trend: [
    { month: 'May', balance: 18400 },
    { month: 'Jun', balance: 21100 },
    { month: 'Jul', balance: 20500 },
    { month: 'Aug', balance: 22900 },
    { month: 'Sep', balance: 23200 },
    { month: 'Oct', balance: 24850 },
  ],
  spending: [
    { category: 'Food', amount: 840, color: '#8298e8' },
    { category: 'Transport', amount: 420, color: '#79aa9a' },
    { category: 'Bills', amount: 760, color: '#a4a8b1' },
    { category: 'Shopping', amount: 490, color: '#c1a17c' },
    { category: 'Entertainment', amount: 310, color: '#a28eb9' },
    { category: 'Other', amount: 308, color: '#6c7079' },
  ],
}