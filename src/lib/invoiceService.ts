import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { COLLECTIONS, db, requireCurrentUser } from './firebase'
import type { Invoice, NewInvoice } from '../types'
import { withFirestoreWrite } from '../utils/firestoreWrites'

export async function getInvoices(uid: string): Promise<Invoice[]> {
  if (!db) throw new Error('Invoice storage is unavailable. Check your Firebase configuration.')
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.invoices), where('userId', '==', uid)))
  return snapshot.docs.map((record) => ({ ...record.data(), id: record.id }) as Invoice)
}

export async function saveInvoice(uid: string, invoice: NewInvoice, invoiceId?: string): Promise<Invoice> {
  const currentUser = requireCurrentUser(uid)
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = subtotal * invoice.taxPercent / 100
  const total = Math.max(0, subtotal + tax - invoice.discount)
  const id = invoiceId || globalThis.crypto?.randomUUID?.() || `${Date.now()}`
  const saved: Invoice = { ...invoice, id, userId: currentUser.uid, subtotal, tax, total }

  if (!db) throw new Error('Invoice storage is unavailable. Check your Firebase configuration.')
  const firestore = db
  const reference = doc(firestore, COLLECTIONS.invoices, id)
  await withFirestoreWrite(() => setDoc(reference, { ...saved, updatedAt: serverTimestamp(), ...(!invoiceId ? { createdAt: serverTimestamp() } : {}) }, { merge: Boolean(invoiceId) }))
  return saved
}

export async function removeInvoice(uid: string, invoiceId: string): Promise<void> {
  requireCurrentUser(uid)
  if (!db) throw new Error('Invoice storage is unavailable. Check your Firebase configuration.')
  const firestore = db
  await withFirestoreWrite(() => deleteDoc(doc(firestore, COLLECTIONS.invoices, invoiceId)))
}
