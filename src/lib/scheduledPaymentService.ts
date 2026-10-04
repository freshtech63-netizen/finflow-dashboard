import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { COLLECTIONS, db, requireCurrentUser } from './firebase'
import type { NewScheduledPayment, ScheduleType, ScheduledPayment } from '../types'
import { withFirestoreWrite } from '../utils/firestoreWrites'

const collectionFor = (type: ScheduleType) => type === 'recurring' ? COLLECTIONS.recurringPayments : COLLECTIONS.subscriptions

export async function getScheduledPayments(uid: string, type: ScheduleType): Promise<ScheduledPayment[]> {
  if (!db) throw new Error('Payment schedule storage is unavailable. Check your Firebase configuration.')
  const records = await getDocs(query(collection(db, collectionFor(type)), where('userId', '==', uid)))
  return records.docs.map((record) => ({ ...record.data(), id: record.id }) as ScheduledPayment)
}

export async function saveScheduledPayment(uid: string, type: ScheduleType, value: NewScheduledPayment, id?: string): Promise<ScheduledPayment> {
  const currentUser = requireCurrentUser(uid)
  const paymentId = id || globalThis.crypto?.randomUUID?.() || `${Date.now()}`
  const saved: ScheduledPayment = { ...value, type, id: paymentId, userId: currentUser.uid }
  if (!db) throw new Error('Payment schedule storage is unavailable. Check your Firebase configuration.')
  const firestore = db
  await withFirestoreWrite(() => setDoc(doc(firestore, collectionFor(type), paymentId), { ...saved, updatedAt: serverTimestamp(), ...(!id ? { createdAt: serverTimestamp() } : {}) }, { merge: Boolean(id) }))
  return saved
}

export async function deleteScheduledPayment(uid: string, type: ScheduleType, id: string): Promise<void> {
  requireCurrentUser(uid)
  if (!db) throw new Error('Payment schedule storage is unavailable. Check your Firebase configuration.')
  const firestore = db
  await withFirestoreWrite(() => deleteDoc(doc(firestore, collectionFor(type), id)))
}
