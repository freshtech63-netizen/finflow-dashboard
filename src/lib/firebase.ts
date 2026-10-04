import { getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, type User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const COLLECTIONS = {
  users: 'users',
  wallets: 'wallets',
  transactions: 'transactions',
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

const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const
const missingConfig = requiredConfig.filter((key) => !config[key])
if (missingConfig.length) {
  throw new Error(`Firebase configuration is missing required Vite settings: ${missingConfig.map((key) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`).join(', ')}`)
}
if (config.projectId !== 'finflow-37b6e') {
  throw new Error('Firebase is configured for an unexpected project. FinFlow requires finflow-37b6e.')
}

export const app = getApps().find((firebaseApp) => firebaseApp.name === '[DEFAULT]') || initializeApp(config)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export const firebaseConfigured = true
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence)

export async function getAuthenticatedUser(): Promise<User> {
  await authPersistenceReady
  await new Promise<void>((resolve, reject) => {
    let unsubscribe = () => {}
    unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe()
      resolve()
    }, (error) => {
      unsubscribe()
      reject(error)
    })
  })
  const user = auth.currentUser
  if (!user) throw Object.assign(new Error('User is not authenticated.'), { code: 'unauthenticated' })
  return user
}
