import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Edit, Plus, Repeat2, Trash, X } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useDashboardData } from '../context/DashboardDataContext'
import { deleteScheduledPayment, getScheduledPayments, saveScheduledPayment } from '../lib/scheduledPaymentService'
import type { NewScheduledPayment, ScheduleType, ScheduledPayment, ScheduledPaymentStatus } from '../types'
import { formatCurrency, formatTransactionDate } from '../utils/finance'
import { firebaseErrorMessage } from '../utils/firebaseErrors'

const inputClass = 'mt-1.5 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]'

export function ScheduledPaymentsPage({ type }: { type: ScheduleType }) {
  const { user, preferences } = useAuth()
  const { data } = useDashboardData()
  const [records, setRecords] = useState<ScheduledPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [selected, setSelected] = useState<ScheduledPayment | undefined>()
  const [busyId, setBusyId] = useState('')
  const isSubscription = type === 'subscription'
  const title = isSubscription ? 'Subscriptions' : 'Recurring payments'
  const sorted = useMemo(() => [...records].sort((a, b) => a.nextPaymentDate.localeCompare(b.nextPaymentDate)), [records])
  const monthlyTotal = records.filter((item) => item.status === 'active').reduce((sum, item) => sum + item.amount, 0)

  useEffect(() => {
    let active = true
    if (!user) return
    setLoading(true)
    getScheduledPayments(user.uid, type).then((result) => {
      if (active) { setRecords(result); setError('') }
    }).catch(() => {
      if (active) setError(`${title} could not be loaded. Check your connection and retry.`)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user, type, title])

  function openEditor(record?: ScheduledPayment) {
    setSelected(record)
    setEditorOpen(true)
  }

  async function save(value: NewScheduledPayment, id?: string) {
    if (!user) throw new Error('Sign in again before saving this payment.')
    const saved = await saveScheduledPayment(user.uid, type, value, id)
    setRecords((previous) => id ? previous.map((item) => item.id === id ? saved : item) : [saved, ...previous])
    setNotice(`${saved.name} ${id ? 'updated' : 'added'}.`)
    setError('')
  }

  async function changeStatus(record: ScheduledPayment) {
    if (!user) return
    const status: ScheduledPaymentStatus = record.status === 'active' ? 'paused' : 'active'
    setBusyId(record.id)
    try {
      await save(recordToInput(record, status), record.id)
    } catch (caught) {
      setError(firebaseErrorMessage(caught, `Could not update ${record.name}.`))
    } finally {
      setBusyId('')
    }
  }

  async function remove(record: ScheduledPayment) {
    if (!user || !window.confirm(`Delete ${record.name}?`)) return
    setBusyId(record.id)
    try {
      await deleteScheduledPayment(user.uid, type, record.id)
      setRecords((previous) => previous.filter((item) => item.id !== record.id))
      setNotice(`${record.name} deleted.`)
    } catch (caught) {
      setError(firebaseErrorMessage(caught, `${record.name} could not be deleted.`))
    } finally {
      setBusyId('')
    }
  }

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="eyebrow">Payments</p><h2 className="page-title mt-1">{title}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">{isSubscription ? 'Track billing dates and manage active subscriptions.' : 'Keep track of scheduled bills and recurring transfers.'}</p></div>
      <button type="button" onClick={() => openEditor()} className="inline-flex h-9 items-center gap-2 self-start rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725] sm:self-auto"><Plus size={14} /> Add {isSubscription ? 'subscription' : 'payment'}</button>
    </div>
    {notice && <p role="status" className="rounded-md border border-[var(--positive)]/25 bg-[var(--positive-subtle)] px-3 py-2.5 text-xs text-[var(--positive)]">{notice}</p>}
    {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="panel p-4"><p className="text-xs text-[var(--text-secondary)]">Tracked</p><p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{records.length}</p></div>
      <div className="panel p-4"><p className="text-xs text-[var(--text-secondary)]">Active</p><p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{records.filter((item) => item.status === 'active').length}</p></div>
      <div className="panel p-4"><p className="text-xs text-[var(--text-secondary)]">Active total</p><p className="mt-2 text-lg font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(monthlyTotal, preferences.currency)}<span className="ml-1 text-xs font-normal text-[var(--text-muted)]">per cycle</span></p></div>
    </section>

    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4 sm:px-5"><div><h3 className="section-title">Scheduled items</h3><p className="section-caption">These are reminders only; payments are not initiated automatically.</p></div></div>
      {loading ? <p role="status" className="px-5 py-12 text-center text-sm text-[var(--text-secondary)]">Loading {title.toLowerCase()}…</p> : sorted.length ? <div className="divide-y divide-[var(--line)]">
        {sorted.map((record) => <article key={record.id} className="flex min-w-0 flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-input)] text-[var(--text-secondary)]"><Repeat2 size={15} /></span><div className="min-w-0"><p className="truncate text-sm font-medium text-[var(--text-primary)]">{record.name}</p><p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{record.category} · {record.frequency} · Next {formatTransactionDate(record.nextPaymentDate)}{record.walletId ? ` · ${data.wallets.find((wallet) => wallet.id === record.walletId)?.name || 'Account'}` : ''}</p></div></div>
          <div className="flex items-center justify-between gap-3 sm:justify-end"><div className="text-right"><p className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(record.amount, preferences.currency)}</p><p className={`mt-0.5 text-[10px] capitalize ${record.status === 'active' ? 'text-[var(--positive)]' : 'text-[var(--text-muted)]'}`}>{record.status}</p></div><button type="button" onClick={() => openEditor(record)} aria-label={`Edit ${record.name}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"><Edit size={14} /></button><button type="button" onClick={() => void changeStatus(record)} disabled={busyId === record.id || record.status === 'cancelled'} className="h-8 rounded-md border border-[var(--line)] px-2.5 text-[11px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-40">{record.status === 'active' ? 'Pause' : 'Resume'}</button><button type="button" onClick={() => void remove(record)} disabled={busyId === record.id} aria-label={`Delete ${record.name}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--negative-subtle)] hover:text-[var(--negative)] disabled:opacity-40"><Trash size={14} /></button></div>
        </article>)}
      </div> : <div className="grid justify-items-center px-6 py-14 text-center"><span className="grid size-11 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-input)] text-[var(--text-secondary)]"><Repeat2 size={18} /></span><h3 className="mt-4 text-sm font-medium text-[var(--text-primary)]">Nothing scheduled yet</h3><p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-secondary)]">Add a {isSubscription ? 'subscription' : 'recurring payment'} to keep upcoming costs organized.</p><button type="button" onClick={() => openEditor()} className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725]"><Plus size={14} /> Add item</button></div>}
    </section>
    <ScheduleEditor open={editorOpen} type={type} payment={selected} wallets={data.wallets} onClose={() => setEditorOpen(false)} onSave={save} />
  </div>
}

function recordToInput(record: ScheduledPayment, status: ScheduledPaymentStatus): NewScheduledPayment {
  return { name: record.name, amount: record.amount, category: record.category, frequency: record.frequency, nextPaymentDate: record.nextPaymentDate, walletId: record.walletId, status }
}

function ScheduleEditor({ open, type, payment, wallets, onClose, onSave }: {
  open: boolean
  type: ScheduleType
  payment?: ScheduledPayment
  wallets: { id: string; name: string }[]
  onClose: () => void
  onSave: (value: NewScheduledPayment, id?: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [frequency, setFrequency] = useState<NewScheduledPayment['frequency']>('monthly')
  const [nextPaymentDate, setNextPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [walletId, setWalletId] = useState('')
  const [status, setStatus] = useState<ScheduledPaymentStatus>('active')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(payment?.name || '')
    setAmount(String(payment?.amount ?? ''))
    setCategory(payment?.category || '')
    setFrequency(payment?.frequency || 'monthly')
    setNextPaymentDate(payment?.nextPaymentDate || new Date().toISOString().slice(0, 10))
    setWalletId(payment?.walletId || '')
    setStatus(payment?.status || 'active')
    setError('')
  }, [open, payment])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, busy, onClose])

  if (!open) return null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedAmount = Number(amount)
    if (!name.trim() || !category.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a name, category, and amount greater than zero.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onSave({ name: name.trim(), amount: parsedAmount, category: category.trim(), frequency, nextPaymentDate, walletId, status }, payment?.id)
      onClose()
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'This item could not be saved.'))
    } finally {
      setBusy(false)
    }
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}><section role="dialog" aria-modal="true" aria-labelledby="schedule-title" className="w-full max-w-lg rounded-t-xl border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-2xl sm:rounded-xl sm:p-6">
    <header className="mb-5 flex items-center justify-between"><div><h2 id="schedule-title" className="text-base font-semibold text-[var(--text-primary)]">{payment ? 'Edit' : 'Add'} {type === 'subscription' ? 'subscription' : 'recurring payment'}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Track the schedule; no payment will be initiated.</p></div><button type="button" onClick={onClose} aria-label="Close form" className="grid size-9 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"><X size={16} /></button></header>
    <form onSubmit={(event) => void submit(event)} className="space-y-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="text-xs font-medium text-[var(--text-secondary)]">Name<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Monthly rent" /></label>
      <label className="text-xs font-medium text-[var(--text-secondary)]">Amount<input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} placeholder="0.00" /></label>
      <label className="text-xs font-medium text-[var(--text-secondary)]">Category<input required maxLength={60} value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass} placeholder="Housing" /></label>
      <label className="text-xs font-medium text-[var(--text-secondary)]">Frequency<select value={frequency} onChange={(event) => setFrequency(event.target.value as NewScheduledPayment['frequency'])} className={inputClass}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="custom">Custom</option></select></label>
      <label className="text-xs font-medium text-[var(--text-secondary)]">Next payment date<input required type="date" value={nextPaymentDate} onChange={(event) => setNextPaymentDate(event.target.value)} className={inputClass} /></label>
      <label className="text-xs font-medium text-[var(--text-secondary)]">Wallet or account<select value={walletId} onChange={(event) => setWalletId(event.target.value)} className={inputClass}><option value="">Not assigned</option>{wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name}</option>)}</select></label>
      <label className="text-xs font-medium text-[var(--text-secondary)] sm:col-span-2">Status<select value={status} onChange={(event) => setStatus(event.target.value as ScheduledPaymentStatus)} className={inputClass}><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option></select></label>
    </div>{error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}<footer className="flex justify-end gap-2 border-t border-[var(--line)] pt-4"><button type="button" disabled={busy} onClick={onClose} className="h-9 rounded-md border border-[var(--line)] px-4 text-xs text-[var(--text-secondary)]">Cancel</button><button type="submit" disabled={busy} className="h-9 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-[#081725] disabled:opacity-60">{busy ? 'Saving…' : payment ? 'Save changes' : 'Add item'}</button></footer></form>
  </section></div>
}
