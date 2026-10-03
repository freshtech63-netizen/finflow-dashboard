import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ChartNoAxesCombined, ArrowLeftRight, CreditCard, Menu } from './icons'

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/wallets', label: 'Cards', icon: CreditCard },
]

export function MobileNavigation({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[var(--header)]/96 px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[13px] font-semibold transition ${isActive ? 'text-[var(--accent)]' : 'text-[#A7A7AC]'}`}>
            <span className="grid size-[22px] place-items-center"><Icon size={20} /></span>
            <span className="leading-none">{label}</span>
          </NavLink>
        ))}
        <button
          onClick={onOpenMenu}
          type="button"
          aria-label="Open more menu"
          className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[13px] font-semibold text-[#A7A7AC] transition hover:text-[var(--text-primary)]"
        >
          <span className="grid size-[22px] place-items-center"><Menu size={20} /></span>
          <span className="leading-none">More</span>
        </button>
      </div>
    </nav>
  )
}