import { useEffect, useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import type { NewTransaction } from '../types'
import { useDashboardData } from '../context/DashboardDataContext'

const categories: Record<NewTransaction['direction'], string[]> = {
  expense: ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Other'],
  income: ['Salary', 'Freelance', 'Investment', 'Refund', 'Other'],
}
const inputClass = 'mt-1.5 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 text-xs text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]'

export function AddTransactionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, createTransaction } = useDashboardData()
  const [direction, setDirection] = useState<NewTransaction['direction']>('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories.expense[0])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [paymentMethod, setPaymentMethod] = useState('Debit card')
  const [walletId, setWalletId] = useState(data.wallets[0]?.id || '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setWalletId(data.wallets[0]?.id || '')
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, data.wallets, busy, onClose])

  useEffect(() => { setCategory(categories[direction][0]) }, [direction])
  if (!open) return null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) { setError('Enter an amount greater than zero.'); return }
    if (parsedAmount > 999999999) { setError('The amount is too large.'); return }
    setBusy(true)
    try {
      await createTransaction({ name: name.trim(), amount: parsedAmount, direction, category, date, paymentMethod, walletId })
      setSaved(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The transaction could not be saved. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="transaction-title" className="w-full max-w-[520px] rounded-t-xl border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-2xl sm:rounded-xl sm:p-6">
      <div className="flex items-start justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[.1em] text-[var(--text-muted)]">Account activity</p><h2 id="transaction-title" className="mt-1 font-['Manrope'] text-lg font-bold text-[var(--text-primary)]">{saved ? 'Transaction saved' : 'Add transaction'}</h2></div><button type="button" onClick={onClose} aria-label="Close transaction form" className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><X size={17} /></button></div>
      {saved ? <div className="py-8 text-center"><span className="mx-auto grid size-10 place-items-center rounded-full bg-[#3c8f6f]/15 text-[#7fcea5]"><Check size={18} /></span><p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{name} added</p><p className="mt-1 text-xs text-[var(--text-secondary)]">Your dashboard totals and activity have been updated.</p><button type="button" onClick={onClose} className="mt-5 h-10 rounded-md bg-[var(--accent)] px-5 text-xs font-semibold text-[#101521]">Done</button></div> : <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 rounded-md border border-[var(--line)] bg-[var(--surface-input)] p-1"><button type="button" onClick={() => setDirection('expense')} className={`h-8 rounded text-xs font-medium transition ${direction === 'expense' ? 'bg-[var(--surface-selected)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>Expense</button><button type="button" onClick={() => setDirection('income')} className={`h-8 rounded text-xs font-medium transition ${direction === 'income' ? 'bg-[var(--surface-selected)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>Income</button></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-[10px] font-medium text-[var(--text-secondary)]">Description<input required maxLength={80} autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Grocery store" className={inputClass} /></label><label className="text-[10px] font-medium text-[var(--text-secondary)]">Amount<input required type="number" min="0.01" max="999999999" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className={inputClass} /></label></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-[10px] font-medium text-[var(--text-secondary)]">Category<select required value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>{categories[direction].map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-[10px] font-medium text-[var(--text-secondary)]">Date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} /></label></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-[10px] font-medium text-[var(--text-secondary)]">Payment method<select required value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={inputClass}><option>Debit card</option><option>Credit card</option><option>Bank transfer</option><option>Cash</option><option>Digital wallet</option></select></label><label className="text-[10px] font-medium text-[var(--text-secondary)]">Wallet or account<select required value={walletId} onChange={(event) => setWalletId(event.target.value)} className={inputClass}>{data.wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}</select></label></div>
        {error && <p role="alert" className="rounded-md border border-[#a35c5c]/40 bg-[#8f3939]/10 px-3 py-2 text-[10px] text-[#df9999]">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-4"><button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-md border border-[var(--line)] px-4 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">Cancel</button><button type="submit" disabled={busy} className="h-10 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-[#101521] disabled:opacity-60">{busy ? 'Saving…' : 'Save transaction'}</button></div>
      </form>}
    </section>
  </div>
}