import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { ActivityPage, AnalyticsPage, ExpensesPage, HelpPage, IncomePage, InvoicesPage, InsightsPage, MessagesPage, RecurringPage, ReportsPage, SubscriptionsPage, TransactionsPage, WalletsPage } from './pages/DetailPages'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ResetPassword } from './pages/ResetPassword'
import { SettingsPage } from './pages/SettingsPage'
import { SavingsGoalsPage } from './pages/SavingsGoalsPage'

function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route element={<ProtectedRoute />}><Route element={<DashboardLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="transactions" element={<TransactionsPage />} />
      <Route path="activity" element={<ActivityPage />} />
      <Route path="wallets" element={<WalletsPage />} />
      <Route path="cards" element={<WalletsPage />} />
      <Route path="savings" element={<SavingsGoalsPage />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="invoices" element={<InvoicesPage />} />
      <Route path="recurring" element={<RecurringPage />} />
      <Route path="subscriptions" element={<SubscriptionsPage />} />
      <Route path="insights" element={<InsightsPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="help" element={<HelpPage />} />
      <Route path="expenses" element={<ExpensesPage />} />
      <Route path="income" element={<IncomePage />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}

export default App