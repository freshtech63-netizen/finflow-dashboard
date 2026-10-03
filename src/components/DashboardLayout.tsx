import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNavigation } from './MobileNavigation'
import { Topbar } from './Topbar'
import { DashboardDataProvider } from '../context/DashboardDataContext'
import { useAuth } from '../context/AuthContext'
import { ArrowLeftRight, ChartNoAxesCombined, CircleHelp, CreditCard, FileText, LayoutDashboard, Messages, Repeat2, Settings, Sparkles, Target, X } from './icons'

export function DashboardLayout() {
  return <DashboardDataProvider><DashboardShell /></DashboardDataProvider>
}

function DashboardShell() {
  const { authError } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.matchMedia('(max-width: 1279px)').matches)
  useEffect(() => {
    const tabletQuery = window.matchMedia('(max-width: 1279px) and (min-width: 768px)')
    const sync = () => setSidebarCollapsed(tabletQuery.matches)
    sync()
    tabletQuery.addEventListener('change', sync)
    return () => tabletQuery.removeEventListener('change', sync)
  }, [])

  const mobileDrawerLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
    { to: '/messages', label: 'Messages', icon: Messages },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/wallets', label: 'Cards & wallets', icon: CreditCard },
    { to: '/savings', label: 'Savings goals', icon: Target },
    { to: '/recurring', label: 'Recurring', icon: Repeat2 },
    { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { to: '/insights', label: 'Insights', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/help', label: 'Help Desk', icon: CircleHelp },
  ]

  const moreLinks = [
    { to: '/messages', label: 'Messages', icon: Messages },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/savings', label: 'Savings Goals', icon: Target },
    { to: '/recurring', label: 'Recurring Payments', icon: Repeat2 },
    { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { to: '/insights', label: 'Insights', icon: Sparkles },
    { to: '/help', label: 'Help Desk', icon: CircleHelp },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  return <div className="app-grid min-h-screen">
    <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
    <div className={`min-h-screen transition-[padding] duration-200 ${sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-[248px]'}`}>
      <Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} onOpenMobileMenu={() => { setMobileDrawerOpen((value) => !value); setMobileMenuOpen(false) }} />
      {authError && <div role="alert" className="mx-4 mt-3 rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)] sm:mx-7 lg:mx-9">{authError}</div>}
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-6 sm:px-7 sm:pt-8 md:pb-10 lg:px-9"><Outlet context={{ searchQuery }} /></main>
    </div>
    <MobileNavigation onOpenMenu={() => { setMobileMenuOpen((value) => !value); setMobileDrawerOpen(false) }} />
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)}>
        <div className="absolute inset-x-3 bottom-[86px] rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] p-3 shadow-[0_20px_32px_rgba(0,0,0,0.22)]" onClick={(event) => event.stopPropagation()}>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">More</p>
            <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close more menu" className="grid size-8 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><X size={16} /></button>
          </div>
          <div className="grid gap-1.5">
            {moreLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--line)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">
                <span className="grid size-8 place-items-center rounded-md bg-[var(--surface)] text-[var(--text-primary)]"><Icon size={16} /></span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )}
    {mobileDrawerOpen && (
      <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setMobileDrawerOpen(false)}>
        <aside className="h-full w-[288px] border-r border-[var(--line)] bg-[var(--surface)] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()} aria-label="Mobile navigation drawer">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] text-[#081725]"><LayoutDashboard size={17} /></span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">FinFlow</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Workspace</p>
              </div>
            </div>
            <button type="button" onClick={() => setMobileDrawerOpen(false)} aria-label="Close navigation" className="grid size-9 place-items-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><X size={16} /></button>
          </div>
          <nav className="space-y-1.5">
            {mobileDrawerLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileDrawerOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${isActive ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'}`}>
                <span className="grid size-8 place-items-center rounded-md bg-transparent"><Icon size={16} /></span>
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    )}
  </div>
}