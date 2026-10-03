import { Bell, CircleHelp, Menu, Messages, Search, X } from './icons'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { UserProfileMenu } from './UserProfileMenu'

const titles: Record<string, string> = {
  '/': 'Overview', '/analytics': 'Analytics', '/transactions': 'Transactions', '/invoices': 'Invoices',
  '/dashboard': 'Overview', '/activity': 'Activity', '/wallets': 'Cards / Wallets', '/cards': 'Cards / Wallets', '/savings': 'Savings goals', '/messages': 'Messages',
  '/insights': 'Insights', '/recurring': 'Recurring payments', '/subscriptions': 'Subscriptions', '/settings': 'Settings', '/help': 'Help desk', '/reports': 'Reports', '/expenses': 'Expenses', '/income': 'Income',
}

export function Topbar({ searchQuery, onSearchChange, onOpenMobileMenu }: { searchQuery: string; onSearchChange: (value: string) => void; onOpenMobileMenu: () => void }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const title = titles[pathname] || 'Overview'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const field = document.querySelector<HTMLInputElement>('[data-global-search]')
        if (field) field.focus()
        else setMobileSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
        setMobileSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!notificationsOpen) return
    const closeOutside = (event: PointerEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) setNotificationsOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [notificationsOpen])

  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[var(--line)] bg-[var(--header)]/95 px-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onOpenMobileMenu} className="grid size-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:hidden" aria-label="Open navigation"><Menu size={20} /></button>
        <div className="min-w-0"><p className="text-[12px] font-medium text-[#9A9AA0]">Workspace <span className="px-1.5 text-[var(--line)]">/</span> {title}</p><h1 className="mt-0.5 truncate text-[18px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">{title}</h1></div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <button type="button" onClick={() => setMobileSearchOpen(!mobileSearchOpen)} aria-label={mobileSearchOpen ? 'Close search' : 'Open search'} className="grid size-9 place-items-center rounded-md text-[#E5E5E7] hover:bg-[var(--surface-hover)] md:hidden">{mobileSearchOpen ? <X size={16} /> : <Search size={16} />}</button>
        <Link to="/help" aria-label="Help desk" className="hidden size-9 place-items-center rounded-md text-[#E5E5E7] hover:bg-[var(--surface-hover)] sm:grid"><CircleHelp size={16} /></Link>
        <Link to="/messages" aria-label="Messages" className="hidden size-9 place-items-center rounded-md text-[#E5E5E7] hover:bg-[var(--surface-hover)] sm:grid"><Messages size={16} /></Link>
        <div className="relative" ref={notificationRef}>
          <button type="button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-expanded={notificationsOpen} aria-label="Notifications" className="relative grid size-9 place-items-center rounded-md text-[#E5E5E7] hover:bg-[var(--surface-hover)]"><Bell size={16} /></button>
          {notificationsOpen && <section aria-label="Notifications" className="absolute right-0 top-11 z-30 w-[min(300px,calc(100vw-24px))] rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] p-4 shadow-xl"><h2 className="text-sm font-medium text-[var(--text-primary)]">Notifications</h2><p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">You’re all caught up. New account alerts will appear here.</p></section>}
        </div>
        <span className="mx-1 hidden h-7 w-px bg-[var(--line)] sm:block" />
        <UserProfileMenu />
      </div>
      {mobileSearchOpen && <label className="absolute inset-x-0 top-[67px] flex h-12 items-center gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-4 text-[var(--text-muted)] md:hidden"><Search size={15} /><input data-global-search autoFocus aria-label="Search transactions" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search transactions" className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" /></label>}
    </header>
  )
}