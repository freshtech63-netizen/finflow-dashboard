import { getApp, getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

export const COLLECTIONS = {
  users: 'users',
  wallets: 'wallets',
  transactions: 'transactions',
  savingsGoals: 'savingsGoals',
  expenses: 'expenses',
  invoices: 'invoices',
  recurringPayments: 'recurringPayments',
  subscriptions: 'subscriptions',
  messages: 'messages',
  notifications: 'notifications',
} as const

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const firebaseConfigured = Boolean(
  config.apiKey &&
  config.authDomain &&
  config.projectId &&
  config.storageBucket &&
  config.messagingSenderId &&
  config.appId,
)
export const firebaseApp = firebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(config))
  : null
export const auth = firebaseApp ? getAuth(firebaseApp) : null
export const db = firebaseApp
  ? initializeFirestore(firebaseApp, { experimentalForceLongPolling: true })
  : null

export const authPersistenceReady = auth
  ? setPersistence(auth, browserLocalPersistence)
  : Promise.resolve()