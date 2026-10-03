import { Link, NavLink } from 'react-router-dom'
import { Activity, ArrowLeftRight, ChartNoAxesCombined, CircleHelp, CreditCard, FileText, LayoutDashboard, PanelLeftClose, PanelLeftOpen, ReceiptText, Repeat2, Settings, Sparkles, WalletCards, Wallet } from 'lucide-react'

type NavLinkItem = { to: string; label: string; icon: typeof LayoutDashboard }
const sections: { title: string; links: NavLinkItem[] }[] = [
  { title: 'Main', links: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/activity', label: 'Activity', icon: Activity },
  ] },
  { title: 'Finance', links: [
    { to: '/wallets', label: 'Cards / Wallets', icon: Wallet },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/recurring', label: 'Recurring', icon: Repeat2 },
    { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  ] },
  { title: 'Management', links: [
    { to: '/insights', label: 'Insights', icon: Sparkles },
    { to: '/reports', label: 'Reports', icon: ReceiptText },
  ] },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#202228] bg-[#0d0e12] transition-[width] duration-200 md:flex ${collapsed ? 'w-[76px]' : 'w-[248px]'}`}>
      <div className={`flex h-[72px] items-center border-b border-[#202228] ${collapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
        <Link to="/" className="flex items-center gap-2.5" aria-label="Finflow home"><span className="grid size-8 place-items-center rounded-md bg-[var(--accent)] text-[#111627]"><WalletCards size={18} strokeWidth={2.2} /></span>{!collapsed && <span className="font-['Manrope'] text-[15px] font-bold tracking-[.01em] text-zinc-100">finflow</span>}</Link>
        <button onClick={onToggle} type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className={`grid size-7 place-items-center rounded-md text-zinc-600 hover:bg-white/[.05] hover:text-zinc-300 ${collapsed ? 'absolute -right-3 top-[82px] rounded-full border border-[#292b31] bg-[#111317]' : ''}`}>{collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={15} />}</button>
      </div>
      <nav className="scrollbar-hidden flex-1 overflow-y-auto px-3 py-6">
        {sections.map((section) => <NavGroup key={section.title} title={section.title} links={section.links} collapsed={collapsed} />)}
      </nav>
      <div className="border-t border-[#202228] p-3">
        <NavItem to="/settings" label="Settings" icon={Settings} collapsed={collapsed} />
        <NavItem to="/help" label="Help" icon={CircleHelp} collapsed={collapsed} />
        {!collapsed && <p className="px-3 pb-1 pt-4 text-[9px] text-zinc-700">© 2026 Finflow</p>}
      </div>
    </aside>
  )
}

function NavGroup({ title, links, collapsed }: { title: string; links: NavLinkItem[]; collapsed: boolean }) {
  return <div className="mb-5"><p className={`mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.1em] text-zinc-700 ${collapsed ? 'sr-only' : ''}`}>{title}</p>{links.map((link) => <NavItem key={link.to} {...link} collapsed={collapsed} />)}</div>
}

function NavItem({ to, label, icon: Icon, collapsed }: NavLinkItem & { collapsed: boolean }) {
  return <NavLink to={to} end={to === '/'} title={collapsed ? label : undefined} className={({ isActive }) => `group relative mb-0.5 flex h-9 items-center gap-3 rounded-md px-3 text-[11px] font-medium transition ${collapsed ? 'justify-center px-0' : ''} ${isActive ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200'}`}><Icon size={16} strokeWidth={1.8} />{!collapsed && label}</NavLink>
}