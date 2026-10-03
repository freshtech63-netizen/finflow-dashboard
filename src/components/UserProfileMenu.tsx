import { useEffect, useRef, useState } from 'react'
import { CircleHelp, LogOut, ChevronDown, Settings } from './icons'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function UserProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const name = user?.displayName || 'Alex Morgan'
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function signOut() {
    setError('')
    try {
      await logout()
      setOpen(false)
    } catch {
      setError('Could not sign out. Please try again.')
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open profile menu" className="flex items-center gap-2.5 rounded-lg p-1.5 text-left transition hover:bg-white/[.04]">
        <span className="grid size-8 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-hover)] text-[11px] font-bold text-[var(--text-primary)]">{user?.photoURL ? <img src={user.photoURL} alt="" className="size-full object-cover" /> : initials}</span>
        <span className="hidden min-w-0 sm:block"><span className="block max-w-28 truncate text-xs font-semibold text-zinc-200">{name}</span><span className="block max-w-28 truncate text-[10px] text-zinc-500">Personal account</span></span>
        <ChevronDown size={14} className="hidden text-zinc-500 sm:block" />
      </button>
      {open && <div className="absolute right-0 top-12 z-30 w-52 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] p-1.5 shadow-xl shadow-black/20">
        <div className="border-b border-[#292b31] px-3 py-2.5"><p className="text-xs font-semibold text-zinc-200">{name}</p><p className="mt-1 truncate text-[10px] text-zinc-500">{user?.email}</p></div>
        <Link to="/settings" onClick={() => setOpen(false)} className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><Settings size={14} /> Account settings</Link>
        <Link to="/help" onClick={() => setOpen(false)} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><CircleHelp size={14} /> Help desk</Link>
        {error && <p role="alert" className="px-3 py-2 text-[11px] text-[var(--negative)]">{error}</p>}
        <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-[var(--negative)] hover:bg-[var(--negative-subtle)]"><LogOut size={14} /> Sign out</button>
      </div>}
    </div>
  )
}