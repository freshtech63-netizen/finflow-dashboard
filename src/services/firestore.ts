import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentReference,
} from 'firebase/firestore'
import type { NewTransaction, NewWallet, Transaction, Wallet } from '../types'
import { COLLECTIONS, db, getAuthenticatedUser } from '../lib/firebase'
import { logFirestoreWriteError } from '../utils/firestoreWrites'

type StoredWallet = Wallet & { userId: string; createdAt?: unknown; updatedAt?: unknown }
type StoredTransaction = Transaction & { userId: string; createdAt?: unknown; updatedAt?: unknown }

function normalizeTransaction(value: NewTransaction, id: string): Transaction {
  const name = value.name.trim()
  return {
    ...value,
    id,
    name,
    amount: Number(value.amount),
    initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    color: '#8298e8',
  }
}

function walletRecord(snapshot: { id: string; data: () => Record<string, unknown> }): Wallet {
  return { ...snapshot.data(), id: snapshot.id } as Wallet
}

function transactionRecord(snapshot: { id: string; data: () => Record<string, unknown> }): Transaction {
  return { ...snapshot.data(), id: snapshot.id } as Transaction
}

export async function createWallet(value: NewWallet): Promise<Wallet> {
  const user = await getAuthenticatedUser()
  let reference: DocumentReference
  try {
    reference = await addDoc(collection(db, COLLECTIONS.wallets), {
      ...value,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } satisfies Omit<StoredWallet, 'id'>)
  } catch (error) {
    logFirestoreWriteError(error)
    throw error
  }
  return { ...value, id: reference.id }
}

export async function getWallets(): Promise<Wallet[]> {
  const user = await getAuthenticatedUser()
  const records = await getDocs(query(collection(db, COLLECTIONS.wallets), where('userId', '==', user.uid)))
  return records.docs.map(walletRecord)
}

export async function updateWallet(walletId: string, value: NewWallet): Promise<Wallet> {
  const user = await getAuthenticatedUser()
  try {
    await updateDoc(doc(db, COLLECTIONS.wallets, walletId), {
      ...value,
      userId: user.uid,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    logFirestoreWriteError(error)
    throw error
  }
  return { ...value, id: walletId }
}

export async function deleteWallet(walletId: string): Promise<void> {
  await getAuthenticatedUser()
  try {
    await deleteDoc(doc(db, COLLECTIONS.wallets, walletId))
  } catch (error) {
    logFirestoreWriteError(error)
    throw error
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const user = await getAuthenticatedUser()
  const records = await getDocs(query(collection(db, COLLECTIONS.transactions), where('userId', '==', user.uid)))
  return records.docs.map(transactionRecord)
}

export async function testFirestoreWrite(): Promise<string> {
  if (!import.meta.env.DEV) {
    throw new Error('The Firestore connection test is available only during local development.')
  }
  const user = await getAuthenticatedUser()
  let testReference: DocumentReference | undefined

  try {
    testReference = await addDoc(collection(db, COLLECTIONS.wallets), {
      userId: user.uid,
      name: 'Firestore Test',
      balance: 0,
      currency: 'NGN',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    const saved = await getDoc(testReference)
    if (!saved.exists()) throw new Error('Firestore test write completed, but the test document could not be read.')
    return testReference.id
  } catch (error) {
    logFirestoreWriteError(error)
    throw error
  } finally {
    if (testReference) {
      try {
        await deleteDoc(testReference)
      } catch (error) {
        logFirestoreWriteError(error)
        throw error
      }
    }
  }
}

export async function createTransaction(value: NewTransaction): Promise<Transaction> {
  const user = await getAuthenticatedUser()
  const reference = doc(collection(db, COLLECTIONS.transactions))
  const normalized = normalizeTransaction(value, reference.id)

  try {
    await runTransaction(db, async (firestoreTransaction) => {
      const walletReference = value.walletId ? doc(db, COLLECTIONS.wallets, value.walletId) : null
      const walletSnapshot = walletReference ? await firestoreTransaction.get(walletReference) : null
      if (walletReference && (!walletSnapshot?.exists() || walletSnapshot.data().userId !== user.uid)) {
        throw new Error('The selected wallet is unavailable.')
      }

      firestoreTransaction.set(reference, {
        ...normalized,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } satisfies StoredTransaction)

      if (walletReference && walletSnapshot?.exists()) {
        const amountChange = value.direction === 'income' ? value.amount : -value.amount
        firestoreTransaction.update(walletReference, {
          balance: Number(walletSnapshot.data().balance || 0) + amountChange,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        })
      }
    })
  } catch (error) {
    logFirestoreWriteError(error)
    throw error
  }
  return normalized
}

export async function updateTransaction(transactionId: string, value: NewTransaction): Promise<Transaction> {
  const user = await getAuthenticatedUser()
  const reference = doc(db, COLLECTIONS.transactions, transactionId)
  const normalized = normalizeTransaction(value, transactionId)

  try {
    await runTransaction(db, async (firestoreTransaction) => {
      const previousSnapshot = await firestoreTransaction.get(reference)
      if (!previousSnapshot.exists() || previousSnapshot.data().userId !== user.uid) {
        throw new Error('The transaction is unavailable.')
      }

      const previous = previousSnapshot.data() as StoredTransaction
      const walletIds = [...new Set([previous.walletId, value.walletId].filter((id): id is string => Boolean(id)))]
      const walletSnapshots = await Promise.all(walletIds.map(async (walletId) => {
        const walletReference = doc(db, COLLECTIONS.wallets, walletId)
        const snapshot = await firestoreTransaction.get(walletReference)
        return { walletId, reference: walletReference, snapshot }
      }))

      for (const { walletId, snapshot } of walletSnapshots) {
        if (!snapshot.exists() || snapshot.data().userId !== user.uid) {
          throw new Error(`The wallet ${walletId} is unavailable.`)
        }
      }

      firestoreTransaction.set(reference, {
        ...normalized,
        userId: user.uid,
        createdAt: previous.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      } satisfies StoredTransaction)

      const balanceChanges = new Map<string, number>()
      if (previous.walletId) {
        balanceChanges.set(previous.walletId, (previous.direction === 'income' ? -1 : 1) * Number(previous.amount))
      }
      if (value.walletId) {
        balanceChanges.set(value.walletId, (balanceChanges.get(value.walletId) || 0) + (value.direction === 'income' ? 1 : -1) * value.amount)
      }
      for (const { walletId, reference: walletReference, snapshot } of walletSnapshots) {
        if (!snapshot.exists()) throw new Error(`The wallet ${walletId} is unavailable.`)
        firestoreTransaction.update(walletReference, {
          balance: Number(snapshot.data().balance || 0) + (balanceChanges.get(walletId) || 0),
          userId: user.uid,
          updatedAt: serverTimestamp(),
        })
      }
    })
  } catch (error) {
    logFirestoreWriteError(error)
    throw error
  }
  return normalized
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const user = await getAuthenticatedUser()
  const reference = doc(db, COLLECTIONS.transactions, transactionId)

  try {
    await runTransaction(db, async (firestoreTransaction) => {
      const snapshot = await firestoreTransaction.get(reference)
      if (!snapshot.exists() || snapshot.data().userId !== user.uid) {
        throw new Error('The transaction is unavailable.')
      }

      const record = snapshot.data() as StoredTransaction
      const walletReference = record.walletId ? doc(db, COLLECTIONS.wallets, record.walletId) : null
      const walletSnapshot = walletReference ? await firestoreTransaction.get(walletReference) : null
      if (walletReference && walletSnapshot?.exists() && walletSnapshot.data().userId === user.uid) {
        const amountChange = record.direction === 'income' ? -Number(record.amount) : Number(record.amount)
        firestoreTransaction.update(walletReference, {
          balance: Number(walletSnapshot.data().balance || 0) + amountChange,
          userId: user.uid,
          updatedAt: serverTimestamp(),
        })
      }
      firestoreTransaction.delete(reference)
    })
  } catch (error) {
    logFirestoreWriteError(error)
    throw error
  }
}
