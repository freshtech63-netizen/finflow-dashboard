import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { FileText, Plus, X } from './icons'
import type { Invoice, InvoiceItem, InvoiceStatus, NewInvoice } from '../types'
import { formatCurrency, formatTransactionDate } from '../utils/finance'
import { firebaseErrorMessage } from '../utils/firebaseErrors'

type Props = {
  open: boolean
  invoice?: Invoice
  mode: 'create' | 'edit' | 'view'
  currency: string
  issuerName: string
  issuerEmail: string
  onClose: () => void
  onSave: (value: NewInvoice, id?: string) => Promise<void>
}

const fieldClass = 'mt-1.5 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]'
const today = () => new Date().toISOString().slice(0, 10)
const blankItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 })

export function InvoiceEditorModal({ open, invoice, mode, currency, issuerName, issuerEmail, onClose, onSave }: Props) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [issueDate, setIssueDate] = useState(today())
  const [dueDate, setDueDate] = useState(today())
  const [items, setItems] = useState<InvoiceItem[]>([blankItem()])
  const [taxPercent, setTaxPercent] = useState('0')
  const [discount, setDiscount] = useState('0')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('pending')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const readOnly = mode === 'view'

  useEffect(() => {
    if (!open) return
    setCustomerName(invoice?.customerName || '')
    setCustomerEmail(invoice?.customerEmail || '')
    setInvoiceNumber(invoice?.invoiceNumber || `INV-${new Date().getTime().toString().slice(-8)}`)
    setIssueDate(invoice?.issueDate || today())
    setDueDate(invoice?.dueDate || today())
    setItems(invoice?.items.length ? invoice.items.map((item) => ({ ...item })) : [blankItem()])
    setTaxPercent(String(invoice?.taxPercent ?? 0))
    setDiscount(String(invoice?.discount ?? 0))
    setNotes(invoice?.notes || '')
    setStatus(invoice?.status || 'pending')
    setError('')
  }, [open, invoice])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, busy, onClose])

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items])
  const tax = subtotal * (Number(taxPercent) || 0) / 100
  const total = Math.max(0, subtotal + tax - (Number(discount) || 0))

  if (!open) return null

  async function submit(nextStatus: InvoiceStatus, event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (readOnly) return
    setError('')
    if (!customerName.trim() || !customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim()) || !invoiceNumber.trim()) {
      setError('Add the customer name, email, and invoice number.')
      return
    }
    if (!issueDate || !dueDate) {
      setError('Choose both issue and due dates.')
      return
    }
    if (dueDate < issueDate) {
      setError('The due date cannot be earlier than the issue date.')
      return
    }
    if (!items.length || items.some((item) => !item.description.trim() || !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0)) {
      setError('Each line item needs a description, quantity above zero, and a valid unit price.')
      return
    }
    const taxRate = Number(taxPercent)
    const discountAmount = Number(discount)
    if (!Number.isFinite(subtotal) || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100 || !Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > subtotal + tax) {
      setError('Review the tax and discount amounts.')
      return
    }
    const value: NewInvoice = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      invoiceNumber: invoiceNumber.trim(),
      issueDate,
      dueDate,
      items: items.map((item) => ({ ...item, description: item.description.trim() })),
      taxPercent: taxRate,
      discount: discountAmount,
      notes: notes.trim(),
      status: nextStatus,
    }
    setBusy(true)
    try {
      await onSave(value, invoice?.id)
      onClose()
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'The invoice could not be saved. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const setItem = (index: number, patch: Partial<InvoiceItem>) => {
    setItems((previous) => previous.map((item, position) => position === index ? { ...item, ...patch } : item))
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="invoice-title" className="invoice-print-sheet flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl border border-[var(--line)] bg-[var(--surface-raised)] shadow-2xl sm:rounded-xl">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-[var(--accent-subtle)] text-[var(--accent)]"><FileText size={16} /></span><div><h2 id="invoice-title" className="text-base font-semibold text-[var(--text-primary)]">{readOnly ? `Invoice ${invoice?.invoiceNumber}` : mode === 'edit' ? 'Edit invoice' : 'Create invoice'}</h2><p className="mt-0.5 text-xs text-[var(--text-muted)]">{readOnly ? `${invoice?.customerName} · ${invoice?.status}` : 'Prepare a clear, itemized invoice for your customer.'}</p></div></div>
        <button type="button" onClick={onClose} aria-label="Close invoice" className="grid size-9 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"><X size={16} /></button>
      </header>

      <form onSubmit={(event) => void submit(status, event)} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {readOnly && <section className="mb-5 grid grid-cols-1 gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-input)] p-4 sm:grid-cols-2"><div><p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Issued by</p><p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{issuerName}</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{issuerEmail}</p></div><div><p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Bill to</p><p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{invoice?.customerName}</p><p className="mt-0.5 text-xs text-[var(--text-secondary)]">{invoice?.customerEmail}</p></div><p className="text-xs text-[var(--text-secondary)]">Issue date: {invoice && formatTransactionDate(invoice.issueDate)}</p><p className="text-xs text-[var(--text-secondary)]">Due date: {invoice && formatTransactionDate(invoice.dueDate)}</p></section>}
        <fieldset disabled={readOnly || busy} className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Customer name<input required maxLength={100} value={customerName} onChange={(event) => setCustomerName(event.target.value)} className={fieldClass} placeholder="Customer or business" /></label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Customer email<input required type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className={fieldClass} placeholder="customer@example.com" /></label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Invoice number<input required maxLength={40} value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Status<select value={status} onChange={(event) => setStatus(event.target.value as InvoiceStatus)} className={fieldClass}><option value="pending">Pending</option><option value="draft">Draft</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option></select></label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Issue date<input type="date" required value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Due date<input type="date" required value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={fieldClass} /></label>
          </div>

          <section aria-label="Invoice line items">
            <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-medium text-[var(--text-primary)]">Line items</h3>{!readOnly && <button type="button" onClick={() => setItems((previous) => [...previous, blankItem()])} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"><Plus size={13} /> Add item</button>}</div>
            <div className="space-y-2">
              {items.map((item, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_64px_92px_auto] items-end gap-2">
                <label className="min-w-0 text-[11px] text-[var(--text-secondary)]">Item<input required maxLength={120} value={item.description} onChange={(event) => setItem(index, { description: event.target.value })} className={fieldClass} placeholder="Service or product" /></label>
                <label className="text-[11px] text-[var(--text-secondary)]">Qty<input required type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => setItem(index, { quantity: Number(event.target.value) })} className={fieldClass} /></label>
                <label className="text-[11px] text-[var(--text-secondary)]">Price<input required type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => setItem(index, { unitPrice: Number(event.target.value) })} className={fieldClass} /></label>
                {!readOnly && <button type="button" disabled={items.length === 1} onClick={() => setItems((previous) => previous.filter((_, position) => position !== index))} aria-label={`Remove item ${index + 1}`} className="mb-0.5 grid size-10 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--negative)] disabled:opacity-30"><X size={14} /></button>}
              </div>)}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Tax (%)<input type="number" min="0" max="100" step="0.01" value={taxPercent} onChange={(event) => setTaxPercent(event.target.value)} className={fieldClass} /></label>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Discount ({currency})<input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className={fieldClass} /></label>
          </div>
          <label className="block text-xs font-medium text-[var(--text-secondary)]">Notes<textarea rows={3} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1.5 w-full resize-y rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" placeholder="Payment terms or additional details" /></label>
        </fieldset>

        <dl className="ml-auto mt-5 max-w-xs space-y-2 border-t border-[var(--line)] pt-4 text-sm">
          <div className="flex justify-between text-[var(--text-secondary)]"><dt>Subtotal</dt><dd className="tabular-nums">{formatCurrency(subtotal, currency)}</dd></div>
          <div className="flex justify-between text-[var(--text-secondary)]"><dt>Tax ({Number(taxPercent) || 0}%)</dt><dd className="tabular-nums">{formatCurrency(tax, currency)}</dd></div>
          <div className="flex justify-between text-[var(--text-secondary)]"><dt>Discount</dt><dd className="tabular-nums">−{formatCurrency(Number(discount) || 0, currency)}</dd></div>
          <div className="flex justify-between border-t border-[var(--line)] pt-2 font-semibold text-[var(--text-primary)]"><dt>Total</dt><dd className="tabular-nums">{formatCurrency(total, currency)}</dd></div>
        </dl>
        {error && <p role="alert" className="mt-4 rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-xs text-[var(--negative)]">{error}</p>}
      </form>
      <footer className="flex flex-wrap justify-end gap-2 border-t border-[var(--line)] px-5 py-4 sm:px-6">
        {readOnly ? <><button type="button" onClick={() => window.print()} className="mr-auto h-9 rounded-md border border-[var(--line)] px-3 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">Print</button><button type="button" onClick={onClose} className="h-9 rounded-md border border-[var(--line)] px-4 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">Close</button></> : <><button type="button" disabled={busy} onClick={onClose} className="h-9 rounded-md border border-[var(--line)] px-4 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">Cancel</button>{mode === 'create' && <button type="button" disabled={busy} onClick={() => void submit('draft')} className="h-9 rounded-md border border-[var(--line)] px-4 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">Save draft</button>}<button type="button" disabled={busy} onClick={() => void submit(status === 'draft' && mode === 'create' ? 'pending' : status)} className="h-9 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-[#081725] disabled:opacity-60">{busy ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create invoice'}</button></>}
      </footer>
    </section>
  </div>
}
