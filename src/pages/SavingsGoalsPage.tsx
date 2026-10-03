import { useEffect, useState, type FormEvent } from 'react'
import { Edit, Plus, Target, Trash, X } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useDashboardData } from '../context/DashboardDataContext'
import type { NewSavingsGoal, SavingsGoal } from '../types'
import { formatCurrency } from '../utils/finance'
import { firebaseErrorMessage } from '../utils/firebaseErrors'

const inputClass = 'mt-1.5 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]'

export function SavingsGoalsPage() {
  const { data, saveSavingsGoal, deleteSavingsGoal } = useDashboardData()
  const { preferences, user, demoMode } = useAuth()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<SavingsGoal | undefined>()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState('')

  async function remove(goal: SavingsGoal) {
    if (!user || !window.confirm(`Delete the ${goal.name} goal?`)) return
    setBusyId(goal.id)
    setError('')
    try {
      await deleteSavingsGoal(goal.id)
      setNotice(`${goal.name} goal deleted.`)
    } catch {
      setError('This savings goal could not be deleted. Please try again.')
    } finally {
      setBusyId('')
    }
  }

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Planning</p><h2 className="page-title mt-1">Savings goals</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Track progress toward the things you’re saving for.</p></div><button type="button" onClick={() => { setSelected(undefined); setOpen(true) }} className="inline-flex h-9 items-center gap-2 self-start rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725] sm:self-auto"><Plus size={14} /> Add goal</button></div>
    {demoMode && <p className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">Demo preview · sample goals are read-only; new goals are saved in this browser.</p>}
    {notice && <p role="status" className="rounded-md border border-[var(--positive)]/25 bg-[var(--positive-subtle)] px-3 py-2.5 text-xs text-[var(--positive)]">{notice}</p>}
    {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
    {data.goals.length ? <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">{data.goals.map((goal) => {
      const progress = Math.min(100, Math.round(goal.saved / Math.max(1, goal.target) * 100))
      const sample = demoMode && (goal.id.startsWith('goal-'))
      return <article key={goal.id} className="panel min-w-0 p-5">
        <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-input)] text-[var(--text-secondary)]"><Target size={16} /></span><div className="min-w-0"><h3 className="truncate text-sm font-medium text-[var(--text-primary)]">{goal.name}</h3><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{progress}% complete</p></div></div><div className="flex gap-1"><button type="button" disabled={sample} onClick={() => { setSelected(goal); setOpen(true) }} aria-label={`Edit ${goal.name}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] disabled:opacity-30"><Edit size={14} /></button><button type="button" disabled={sample || busyId === goal.id} onClick={() => void remove(goal)} aria-label={`Delete ${goal.name}`} className="grid size-8 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--negative-subtle)] hover:text-[var(--negative)] disabled:opacity-30"><Trash size={14} /></button></div></div>
        <div className="mt-5 flex items-baseline justify-between gap-2"><p className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(goal.saved, preferences.currency)}<span className="ml-1 text-xs font-normal text-[var(--text-muted)]">saved</span></p><p className="text-xs tabular-nums text-[var(--text-secondary)]">of {formatCurrency(goal.target, preferences.currency)}</p></div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]"><div className="h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${progress}%` }} /></div>
      </article>
    })}</section> : <section className="panel grid justify-items-center px-6 py-14 text-center"><span className="grid size-11 place-items-center rounded-md border border-[var(--line)] bg-[var(--surface-input)] text-[var(--text-secondary)]"><Target size={18} /></span><h3 className="mt-4 text-sm font-medium text-[var(--text-primary)]">No savings goals yet</h3><p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-secondary)]">Add a goal to track your progress over time.</p><button type="button" onClick={() => { setSelected(undefined); setOpen(true) }} className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-[#081725]"><Plus size={14} /> Add goal</button></section>}
    <GoalEditor open={open} goal={selected} onClose={() => setOpen(false)} onSave={async (value, id) => { await saveSavingsGoal(value, id); setNotice(`${value.name} goal ${id ? 'updated' : 'added'}.`); setError('') }} />
  </div>
}

function GoalEditor({ open, goal, onClose, onSave }: { open: boolean; goal?: SavingsGoal; onClose: () => void; onSave: (value: NewSavingsGoal, id?: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(goal?.name || '')
    setSaved(String(goal?.saved ?? ''))
    setTarget(String(goal?.target ?? ''))
    setError('')
  }, [open, goal])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, busy, onClose])

  if (!open) return null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const savedAmount = Number(saved)
    const targetAmount = Number(target)
    if (!name.trim() || !Number.isFinite(savedAmount) || savedAmount < 0 || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError('Enter a goal name, a non-negative saved amount, and a target greater than zero.')
      return
    }
    setBusy(true)
    try {
      await onSave({ name: name.trim(), saved: savedAmount, target: targetAmount, color: 'blue' }, goal?.id)
      onClose()
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'The savings goal could not be saved.'))
    } finally {
      setBusy(false)
    }
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}><section role="dialog" aria-modal="true" aria-labelledby="goal-title" className="w-full max-w-md rounded-t-xl border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-2xl sm:rounded-xl sm:p-6">
    <header className="mb-5 flex items-center justify-between"><div><h2 id="goal-title" className="text-base font-semibold text-[var(--text-primary)]">{goal ? 'Edit savings goal' : 'Add savings goal'}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Set a clear target and record your current progress.</p></div><button type="button" onClick={onClose} aria-label="Close form" className="grid size-9 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"><X size={16} /></button></header>
    <form onSubmit={(event) => void submit(event)} className="space-y-4"><label className="block text-xs font-medium text-[var(--text-secondary)]">Goal name<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Emergency fund" /></label><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-[var(--text-secondary)]">Saved so far<input required type="number" min="0" step="0.01" value={saved} onChange={(event) => setSaved(event.target.value)} className={inputClass} placeholder="0.00" /></label><label className="text-xs font-medium text-[var(--text-secondary)]">Target amount<input required type="number" min="0.01" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} className={inputClass} placeholder="5,000.00" /></label></div>
      {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
      <footer className="flex justify-end gap-2 border-t border-[var(--line)] pt-4"><button type="button" disabled={busy} onClick={onClose} className="h-9 rounded-md border border-[var(--line)] px-4 text-xs text-[var(--text-secondary)]">Cancel</button><button type="submit" disabled={busy} className="h-9 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-[#081725] disabled:opacity-60">{busy ? 'Saving…' : goal ? 'Save changes' : 'Add goal'}</button></footer>
    </form>
  </section></div>
}
