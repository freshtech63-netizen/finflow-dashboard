import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { COLLECTIONS, db } from './firebase'
import type { Invoice, NewInvoice } from '../types'

const DEMO_INVOICES_KEY = 'finflow-demo-invoices'

function readDemoInvoices(): Invoice[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(DEMO_INVOICES_KEY) || '[]')
    return Array.isArray(value) ? value as Invoice[] : []
  } catch {
    return []
  }
}

export async function getInvoices(uid: string): Promise<Invoice[]> {
  if (uid === 'demo') return readDemoInvoices()
  if (!db) return []
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.invoices), where('userId', '==', uid)))
  return snapshot.docs.map((record) => ({ ...record.data(), id: record.id }) as Invoice)
}

export async function saveInvoice(uid: string, invoice: NewInvoice, invoiceId?: string): Promise<Invoice> {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = subtotal * invoice.taxPercent / 100
  const total = Math.max(0, subtotal + tax - invoice.discount)
  const id = invoiceId || globalThis.crypto?.randomUUID?.() || `${Date.now()}`
  const saved: Invoice = { ...invoice, id, userId: uid, subtotal, tax, total }

  if (uid === 'demo') {
    const invoices = readDemoInvoices()
    const next = invoiceId ? invoices.map((item) => item.id === invoiceId ? saved : item) : [...invoices, saved]
    localStorage.setItem(DEMO_INVOICES_KEY, JSON.stringify(next))
    return saved
  }

  if (!db) throw new Error('Invoice storage is unavailable. Check your Firebase configuration.')
  const reference = doc(db, COLLECTIONS.invoices, id)
  await setDoc(reference, { ...saved, updatedAt: serverTimestamp(), ...(!invoiceId ? { createdAt: serverTimestamp() } : {}) }, { merge: Boolean(invoiceId) })
  return saved
}

export async function removeInvoice(uid: string, invoiceId: string): Promise<void> {
  if (uid === 'demo') {
    localStorage.setItem(DEMO_INVOICES_KEY, JSON.stringify(readDemoInvoices().filter((item) => item.id !== invoiceId)))
    return
  }
  if (!db) throw new Error('Invoice storage is unavailable. Check your Firebase configuration.')
  await deleteDoc(doc(db, COLLECTIONS.invoices, invoiceId))
}
