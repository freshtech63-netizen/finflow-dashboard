import { Link, NavLink, useLocation } from 'react-router-dom'
import { Activity, ArrowLeftRight, ChartNoAxesCombined, CircleHelp, CreditCard, FileText, LayoutDashboard, LogOut, Messages, PanelLeftClose, PanelLeftOpen, ReceiptText, Repeat2, Settings, Sparkles, Target, WalletCards, Wallet } from './icons'
import { useAuth } from '../context/AuthContext'

type NavLinkItem = { to: string; label: string; icon: typeof LayoutDashboard }
const sections: { title: string; links: NavLinkItem[] }[] = [
  { title: 'Main', links: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
    { to: '/messages', label: 'Messages', icon: Messages },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/invoices', label: 'Invoices', icon: FileText },
  ] },
  { title: 'Finance', links: [
    { to: '/wallets', label: 'Cards & wallets', icon: Wallet },
    { to: '/savings', label: 'Savings goals', icon: Target },
    { to: '/recurring', label: 'Recurring', icon: Repeat2 },
    { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  ] },
  { title: 'Management', links: [
    { to: '/insights', label: 'Insights', icon: Sparkles },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/reports', label: 'Reports', icon: ReceiptText },
  ] },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { logout } = useAuth()
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[var(--line)] bg-[var(--surface)] transition-[width] duration-200 md:flex ${collapsed ? 'w-[76px]' : 'w-[248px]'}`}>
      <div className={`flex h-[68px] items-center border-b border-[var(--line)] ${collapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
        <Link to="/" className="flex items-center gap-2.5" aria-label="FinFlow home"><span className="grid size-8 place-items-center rounded-md bg-[var(--accent)] text-[#081725]"><WalletCards size={17} /></span>{!collapsed && <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">FinFlow</span>}</Link>
        <button onClick={onToggle} type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className={`grid size-7 place-items-center rounded-md text-zinc-600 hover:bg-white/[.05] hover:text-zinc-300 ${collapsed ? 'absolute -right-3 top-[82px] rounded-full border border-[#292b31] bg-[#111317]' : ''}`}>{collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={15} />}</button>
      </div>
      <nav className="scrollbar-hidden flex-1 overflow-y-auto px-3 py-6">
        {sections.map((section) => <NavGroup key={section.title} title={section.title} links={section.links} collapsed={collapsed} />)}
      </nav>
      <div className="border-t border-[var(--line)] p-3">
        <NavItem to="/settings" label="Settings" icon={Settings} collapsed={collapsed} />
        <NavItem to="/help" label="Help" icon={CircleHelp} collapsed={collapsed} />
        <button type="button" onClick={() => void logout()} title={collapsed ? 'Log out' : undefined} className={`flex h-9 w-full items-center gap-3 rounded-md px-3 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--negative-subtle)] hover:text-[var(--negative)] ${collapsed ? 'justify-center px-0' : ''}`}><LogOut size={15} />{!collapsed && 'Log out'}</button>
        {!collapsed && <p className="px-3 pb-1 pt-4 text-[10px] text-[var(--text-muted)]">FinFlow · Personal</p>}
      </div>
    </aside>
  )
}

function NavGroup({ title, links, collapsed }: { title: string; links: NavLinkItem[]; collapsed: boolean }) {
  return <div className="mb-5"><p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.1em] text-[var(--text-muted)] ${collapsed ? 'sr-only' : ''}`}>{title}</p>{links.map((link) => <NavItem key={link.to} {...link} collapsed={collapsed} />)}</div>
}

function NavItem({ to, label, icon: Icon, collapsed }: NavLinkItem & { collapsed: boolean }) {
  const { pathname } = useLocation()
  return <NavLink to={to} end={to === '/'} title={collapsed ? label : undefined} className={({ isActive }) => `group relative mb-0.5 flex h-9 items-center gap-3 rounded-md px-3 text-xs font-medium transition ${collapsed ? 'justify-center px-0' : ''} ${isActive || (to === '/' && pathname === '/dashboard') ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'}`}><Icon size={15} />{!collapsed && label}</NavLink>
}