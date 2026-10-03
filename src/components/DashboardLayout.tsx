import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNavigation } from './MobileNavigation'
import { Topbar } from './Topbar'
import { DashboardDataProvider } from '../context/DashboardDataContext'

export function DashboardLayout() {
  return <DashboardDataProvider><DashboardShell /></DashboardDataProvider>
}

function DashboardShell() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.matchMedia('(max-width: 1279px)').matches)
  useEffect(() => {
    const tabletQuery = window.matchMedia('(max-width: 1279px) and (min-width: 768px)')
    const sync = () => setSidebarCollapsed(tabletQuery.matches)
    sync()
    tabletQuery.addEventListener('change', sync)
    return () => tabletQuery.removeEventListener('change', sync)
  }, [])
  return <div className="app-grid min-h-screen">
    <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
    <div className={`min-h-screen transition-[padding] duration-200 ${sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-[248px]'}`}><Topbar searchQuery={searchQuery} onSearchChange={setSearchQuery} onOpenMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} /><main className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-6 sm:px-7 sm:pt-8 md:pb-10 lg:px-9"><Outlet context={{ searchQuery }} /></main></div>
    <MobileNavigation onOpenMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
    {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)}><div className="absolute inset-x-3 bottom-[78px] rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] p-2 shadow-2xl" onClick={(event) => event.stopPropagation()}><p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--text-muted)]">More</p>{[['/messages', 'Messages'], ['/invoices', 'Invoices'], ['/savings', 'Savings goals'], ['/recurring', 'Recurring payments'], ['/subscriptions', 'Subscriptions'], ['/insights', 'Insights'], ['/help', 'Help desk']].map(([to, label]) => <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-3 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">{label}</Link>)}</div></div>}
  </div>
}