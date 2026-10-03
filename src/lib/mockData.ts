import type { DashboardData } from '../types'

export const demoDashboard: DashboardData = {
  balance: 24850.82,
  income: 8420.0,
  expenses: 3128.45,
  savings: 5291.55,
  wallets: [
    { id: 'sample-wallet-main', name: 'Main account', number: '••••  4829', balance: 16480.2, tone: 'blue', brand: 'VISA' },
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
    { month: "May '26", period: '2026-05', income: 6400, expenses: 3200 },
    { month: "Jun '26", period: '2026-06', income: 7100, expenses: 3900 },
    { month: "Jul '26", period: '2026-07', income: 6850, expenses: 3450 },
    { month: "Aug '26", period: '2026-08', income: 7900, expenses: 4300 },
    { month: "Sep '26", period: '2026-09', income: 7450, expenses: 3550 },
    { month: "Oct '26", period: '2026-10', income: 8420, expenses: 3128 },
  ],
  trend: [
    { month: "May '26", period: '2026-05', balance: 18400 },
    { month: "Jun '26", period: '2026-06', balance: 21100 },
    { month: "Jul '26", period: '2026-07', balance: 20500 },
    { month: "Aug '26", period: '2026-08', balance: 22900 },
    { month: "Sep '26", period: '2026-09', balance: 23200 },
    { month: "Oct '26", period: '2026-10', balance: 24850 },
  ],
  spending: [
    { category: 'Food', amount: 840, color: '#7893a8' },
    { category: 'Transport', amount: 420, color: '#718b88' },
    { category: 'Bills', amount: 760, color: '#898d92' },
    { category: 'Shopping', amount: 490, color: '#9b8c76' },
    { category: 'Entertainment', amount: 310, color: '#827c88' },
    { category: 'Other', amount: 308, color: '#62666a' },
  ],
}

export const emptyDashboard: DashboardData = {
  balance: 0,
  income: 0,
  expenses: 0,
  savings: 0,
  wallets: [],
  goals: [],
  transactions: [],
  chart: [],
  trend: [],
  spending: [],
}