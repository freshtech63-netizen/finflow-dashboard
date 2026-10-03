import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ChartNoAxesCombined, ArrowLeftRight, CreditCard, Menu, Settings } from './icons'

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/wallets', label: 'Cards', icon: CreditCard },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNavigation({ onOpenMenu }: { onOpenMenu: () => void }) {
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid h-[68px] grid-cols-6 border-t border-[var(--line)] bg-[var(--page)]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
    {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 text-[9px] font-medium ${isActive ? 'text-[#9baeff]' : 'text-zinc-600'}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></NavLink>)}
    <button onClick={onOpenMenu} type="button" className="flex flex-col items-center justify-center gap-1 text-[9px] font-medium text-zinc-600"><Menu size={18} strokeWidth={1.8} /><span>More</span></button>
  </nav>
}