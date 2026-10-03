import { useState } from 'react'
import { LogOut, ChevronDown, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function UserProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const name = user?.displayName || 'Alex Morgan'
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2)

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open profile menu" className="flex items-center gap-2.5 rounded-lg p-1.5 text-left transition hover:bg-white/[.04]">
        <span className="grid size-8 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-hover)] text-[11px] font-bold text-[var(--text-primary)]">{user?.photoURL ? <img src={user.photoURL} alt="" className="size-full object-cover" /> : initials}</span>
        <span className="hidden min-w-0 sm:block"><span className="block max-w-28 truncate text-xs font-semibold text-zinc-200">{name}</span><span className="block max-w-28 truncate text-[10px] text-zinc-500">Personal account</span></span>
        <ChevronDown size={14} className="hidden text-zinc-500 sm:block" />
      </button>
      {open && <div className="absolute right-0 top-12 z-30 w-52 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] p-1.5 shadow-xl shadow-black/20">
        <div className="border-b border-[#292b31] px-3 py-2.5"><p className="text-xs font-semibold text-zinc-200">{name}</p><p className="mt-1 truncate text-[10px] text-zinc-500">{user?.email}</p></div>
        <Link to="/settings" onClick={() => setOpen(false)} className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><Settings size={14} /> Account settings</Link>
        <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-rose-300 hover:bg-rose-400/10"><LogOut size={14} /> Sign out</button>
      </div>}
    </div>
  )
}