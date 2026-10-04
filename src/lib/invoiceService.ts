import type { Invoice, NewInvoice } from '../types'

const unavailable = () => new Error('Invoices are not part of the current Firestore rollout. Users, wallets, and transactions are enabled first.')

export async function getInvoices(_uid: string): Promise<Invoice[]> {
  throw unavailable()
}

export async function saveInvoice(_uid: string, _invoice: NewInvoice, _invoiceId?: string): Promise<Invoice> {
  throw unavailable()
}

export async function removeInvoice(_uid: string, _invoiceId: string): Promise<void> {
  throw unavailable()
}
