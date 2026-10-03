import { Search } from './icons'

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="hidden h-10 w-full max-w-[330px] items-center gap-2.5 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-[var(--text-muted)] transition-colors focus-within:border-[var(--accent)] md:flex">
      <Search size={16} aria-hidden="true" />
      <input data-global-search aria-label="Search transactions" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
      <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">{typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘ K' : 'Ctrl K'}</kbd>
    </label>
  )
}