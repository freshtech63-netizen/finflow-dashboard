import { useEffect, useState, type FormEvent } from 'react'
import { WalletCards, X } from './icons'
import type { NewWallet, Wallet } from '../types'
import { getFirestoreErrorMessage } from '../utils/firebaseErrors'

type Props = {
  open: boolean
  wallet?: Wallet
  onClose: () => void
  onSave: (value: NewWallet, walletId?: string) => Promise<void>
}

const inputClass = 'mt-1.5 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]'

export function WalletEditorModal({ open, wallet, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [lastFour, setLastFour] = useState('')
  const [balance, setBalance] = useState('')
  const [brand, setBrand] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(wallet?.name || '')
    setLastFour(wallet?.number.replace(/\D/g, '').slice(-4) || '')
    setBalance(String(wallet?.balance ?? 0))
    setBrand(wallet?.brand || '')
    setStatus(wallet?.status || 'active')
    setError('')
  }, [open, wallet])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, busy, onClose])

  if (!open) return null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedBalance = Number(balance)
    if (!name.trim() || !Number.isFinite(parsedBalance) || parsedBalance < 0) {
      setError('Enter an account name and a valid non-negative balance.')
      return
    }
    if (lastFour && !/^\d{4}$/.test(lastFour)) {
      setError('Enter the final four digits, or leave the field blank.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const value: NewWallet = {
        name: name.trim(),
        number: lastFour ? `•••• ${lastFour}` : 'Account',
        balance: parsedBalance,
        tone: wallet?.tone || 'blue',
        brand: brand.trim() || 'Account',
        status,
      }
      await onSave(value, wallet?.id)
      onClose()
    } catch (caught) {
      setError(getFirestoreErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="wallet-title" className="w-full max-w-md rounded-t-xl border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-2xl sm:rounded-xl sm:p-6">
      <header className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-[var(--accent-subtle)] text-[var(--accent)]"><WalletCards size={16} /></span><div><h2 id="wallet-title" className="text-base font-semibold text-[var(--text-primary)]">{wallet ? 'Edit account' : 'Add account'}</h2><p className="mt-0.5 text-xs text-[var(--text-muted)]">Update an account balance and display details.</p></div></div><button type="button" onClick={onClose} aria-label="Close account form" className="grid size-9 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"><X size={16} /></button></header>
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">Account name<input required maxLength={60} autoFocus value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Everyday account" /></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-[var(--text-secondary)]">Current balance<input required type="number" min="0" step="0.01" inputMode="decimal" value={balance} onChange={(event) => setBalance(event.target.value)} className={inputClass} placeholder="0.00" /></label><label className="text-xs font-medium text-[var(--text-secondary)]">Last four digits<input inputMode="numeric" maxLength={4} value={lastFour} onChange={(event) => setLastFour(event.target.value.replace(/\D/g, '').slice(0, 4))} className={inputClass} placeholder="Optional" /></label></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-[var(--text-secondary)]">Provider or brand<input maxLength={40} value={brand} onChange={(event) => setBrand(event.target.value)} className={inputClass} placeholder="Bank or card network" /></label><label className="text-xs font-medium text-[var(--text-secondary)]">Status<select value={status} onChange={(event) => setStatus(event.target.value as 'active' | 'inactive')} className={inputClass}><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>
        {error && <p role="alert" className="break-words rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs leading-relaxed text-[var(--negative)]">{error}</p>}
        <footer className="flex justify-end gap-2 border-t border-[var(--line)] pt-4"><button type="button" disabled={busy} onClick={onClose} className="h-9 rounded-md border border-[var(--line)] px-4 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">Cancel</button><button type="submit" disabled={busy} className="h-9 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-[#081725] disabled:opacity-60">{busy ? 'Saving…' : wallet ? 'Save changes' : 'Add account'}</button></footer>
      </form>
    </section>
  </div>
}
