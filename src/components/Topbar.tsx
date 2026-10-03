import { Bell, Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { UserProfileMenu } from './UserProfileMenu'

const titles: Record<string, string> = {
  '/': 'Overview', '/analytics': 'Analytics', '/transactions': 'Transactions', '/invoices': 'Invoices',
  '/recurring': 'Recurring payments', '/subscriptions': 'Subscriptions', '/settings': 'Settings',
}

export function Topbar({ searchQuery, onSearchChange, onOpenMobileMenu }: { searchQuery: string; onSearchChange: (value: string) => void; onOpenMobileMenu: () => void }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { pathname } = useLocation()
  const title = titles[pathname] || 'Overview'
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#202228] bg-[#0a0b0e]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onOpenMobileMenu} className="grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/[.05] md:hidden" aria-label="Open navigation"><Menu size={19} /></button>
        <div><p className="text-[10px] font-medium uppercase tracking-[.12em] text-zinc-600">Workspace <span className="px-1.5 text-zinc-700">/</span> Overview</p><h1 className="mt-0.5 truncate font-['Manrope'] text-[15px] font-bold text-zinc-100">{title}</h1></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <button type="button" onClick={() => setMobileSearchOpen(!mobileSearchOpen)} aria-label={mobileSearchOpen ? 'Close search' : 'Open search'} className="grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/[.05] md:hidden">{mobileSearchOpen ? <X size={17} /> : <Search size={17} />}</button>
        <button type="button" aria-label="Notifications" className="relative grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/[.05]"><Bell size={17} /><span className="absolute right-[9px] top-[8px] size-1.5 rounded-full bg-[#7190ff] ring-2 ring-[#0a0b0e]" /></button>
        <span className="hidden h-7 w-px bg-[#292b31] sm:block" />
        <UserProfileMenu />
      </div>
      {mobileSearchOpen && <label className="absolute inset-x-0 top-[71px] flex h-12 items-center gap-2 border-b border-[#292b31] bg-[#111317] px-4 text-zinc-500 md:hidden"><Search size={15} /><input autoFocus aria-label="Search transactions" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search transactions..." className="min-w-0 flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600" /></label>}
    </header>
  )
}