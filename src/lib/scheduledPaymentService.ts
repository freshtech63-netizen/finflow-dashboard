import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { COLLECTIONS, db } from './firebase'
import type { NewScheduledPayment, ScheduleType, ScheduledPayment } from '../types'

const collectionFor = (type: ScheduleType) => type === 'recurring' ? 'recurringPayments' : COLLECTIONS.subscriptions
const demoKey = (type: ScheduleType) => `finflow-demo-${type}`

function readDemo(type: ScheduleType): ScheduledPayment[] {
  try {
    const records: unknown = JSON.parse(localStorage.getItem(demoKey(type)) || '[]')
    return Array.isArray(records) ? records as ScheduledPayment[] : []
  } catch {
    return []
  }
}

export async function getScheduledPayments(uid: string, type: ScheduleType): Promise<ScheduledPayment[]> {
  if (uid === 'demo') return readDemo(type)
  if (!db) return []
  const records = await getDocs(query(collection(db, collectionFor(type)), where('userId', '==', uid)))
  return records.docs.map((record) => ({ ...record.data(), id: record.id }) as ScheduledPayment)
}

export async function saveScheduledPayment(uid: string, type: ScheduleType, value: NewScheduledPayment, id?: string): Promise<ScheduledPayment> {
  const paymentId = id || globalThis.crypto?.randomUUID?.() || `${Date.now()}`
  const saved: ScheduledPayment = { ...value, type, id: paymentId, userId: uid }
  if (uid === 'demo') {
    const current = readDemo(type)
    const next = id ? current.map((item) => item.id === id ? saved : item) : [saved, ...current]
    localStorage.setItem(demoKey(type), JSON.stringify(next))
    return saved
  }
  if (!db) throw new Error('Payment schedule storage is unavailable. Check your Firebase configuration.')
  await setDoc(doc(db, collectionFor(type), paymentId), { ...saved, updatedAt: serverTimestamp(), ...(!id ? { createdAt: serverTimestamp() } : {}) }, { merge: Boolean(id) })
  return saved
}

export async function deleteScheduledPayment(uid: string, type: ScheduleType, id: string): Promise<void> {
  if (uid === 'demo') {
    localStorage.setItem(demoKey(type), JSON.stringify(readDemo(type).filter((item) => item.id !== id)))
    return
  }
  if (!db) throw new Error('Payment schedule storage is unavailable. Check your Firebase configuration.')
  await deleteDoc(doc(db, collectionFor(type), id))
}
