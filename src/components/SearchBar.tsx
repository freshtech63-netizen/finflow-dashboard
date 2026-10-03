import { Search } from 'lucide-react'

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="hidden h-10 w-full max-w-[250px] items-center gap-2.5 rounded-lg border border-[#282a30] bg-[#111317] px-3.5 text-zinc-500 transition focus-within:border-[#536fcf] md:flex">
      <Search size={16} aria-hidden="true" />
      <input aria-label="Search transactions" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search anything..." className="min-w-0 flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600" />
      <kbd className="rounded border border-[#2a2c32] px-1.5 py-0.5 text-[10px] text-zinc-600">⌘ K</kbd>
    </label>
  )
}