import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ChartNoAxesCombined, ArrowLeftRight, CreditCard, Menu } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/analytics', label: 'Insights', icon: ChartNoAxesCombined },
  { to: '/transactions', label: 'Activity', icon: ArrowLeftRight },
  { to: '/subscriptions', label: 'Cards', icon: CreditCard },
]

export function MobileNavigation({ onOpenMenu }: { onOpenMenu: () => void }) {
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid h-[68px] grid-cols-5 border-t border-[#24262d] bg-[#0e0f13]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
    {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 text-[9px] font-medium ${isActive ? 'text-[#9baeff]' : 'text-zinc-600'}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></NavLink>)}
    <button onClick={onOpenMenu} type="button" className="flex flex-col items-center justify-center gap-1 text-[9px] font-medium text-zinc-600"><Menu size={18} strokeWidth={1.8} /><span>More</span></button>
  </nav>
}