import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { COLLECTIONS, db } from './firebase'
import type { Invoice, NewInvoice } from '../types'

export async function getInvoices(uid: string): Promise<Invoice[]> {
  if (!db) throw new Error('Invoice storage is unavailable. Check your Firebase configuration.')
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.invoices), where('userId', '==', uid)))
  return snapshot.docs.map((record) => ({ ...record.data(), id: record.id }) as Invoice)
}

export async function saveInvoice(uid: string, invoice: NewInvoice, invoiceId?: string): Promise<Invoice> {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = subtotal * invoice.taxPercent / 100
  const total = Math.max(0, subtotal + tax - invoice.discount)
  const id = invoiceId || globalThis.crypto?.randomUUID?.() || `${Date.now()}`
  const saved: Invoice = { ...invoice, id, userId: uid, subtotal, tax, total }

  if (!db) throw new Error('Invoice storage is unavailable. Check your Firebase configuration.')
  const reference = doc(db, COLLECTIONS.invoices, id)
  await setDoc(reference, { ...saved, updatedAt: serverTimestamp(), ...(!invoiceId ? { createdAt: serverTimestamp() } : {}) }, { merge: Boolean(invoiceId) })
  return saved
}

export async function removeInvoice(uid: string, invoiceId: string): Promise<void> {
  if (!uid) throw new Error('Sign in again before deleting an invoice.')
  if (!db) throw new Error('Invoice storage is unavailable. Check your Firebase configuration.')
  await deleteDoc(doc(db, COLLECTIONS.invoices, invoiceId))
}
