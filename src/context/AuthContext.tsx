import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, COLLECTIONS, db, firebaseConfigured } from '../lib/firebase'

export type ProfilePreferences = { currency: string; theme: 'dark' | 'light' }
export type EditableProfile = { displayName: string; email: string; photoURL: string; currency: string; theme: 'dark' | 'light' }
type AppUser = Pick<User, 'uid' | 'email' | 'displayName' | 'photoURL'>
type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  demoMode: boolean
  preferences: ProfilePreferences
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  loginDemo: () => void
  logout: () => Promise<void>
  saveProfile: (profile: EditableProfile) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const DEMO_KEY = 'finflow-demo-session'
const DEMO_PROFILE_KEY = 'finflow-demo-profile'
const defaultPreferences: ProfilePreferences = { currency: 'USD', theme: 'dark' }

function readDemoProfile(): Partial<EditableProfile> {
  try { return JSON.parse(localStorage.getItem(DEMO_PROFILE_KEY) || '{}') as Partial<EditableProfile> } catch { return {} }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<ProfilePreferences>(defaultPreferences)

  useEffect(() => {
    if (!auth) {
      if (localStorage.getItem(DEMO_KEY) === 'active') {
        const profile = readDemoProfile()
        setUser({ uid: 'demo', email: profile.email || 'alex.morgan@example.com', displayName: profile.displayName || 'Alex Morgan', photoURL: profile.photoURL || null })
        setPreferences({ currency: profile.currency || 'USD', theme: profile.theme || 'dark' })
        document.documentElement.dataset.theme = profile.theme || 'dark'
      }
      setLoading(false)
      return
    }
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      try {
        const profile = firebaseUser && db ? await getDoc(doc(db, COLLECTIONS.users, firebaseUser.uid)) : null
        const saved = profile?.data()
        const nextPreferences: ProfilePreferences = { currency: saved?.currency || 'USD', theme: saved?.theme === 'light' ? 'light' : 'dark' }
        setPreferences(nextPreferences)
        document.documentElement.dataset.theme = nextPreferences.theme
      } finally { setLoading(false) }
    })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    demoMode: !firebaseConfigured,
    preferences,
    login: async (email, password) => {
      if (!auth) throw new Error('Firebase is not configured. Choose demo preview or add your Firebase environment variables.')
      await signInWithEmailAndPassword(auth, email, password)
    },
    register: async (name, email, password) => {
      if (!auth) throw new Error('Firebase is not configured. Add your Firebase environment variables to create an account.')
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName: name })
      if (db) await setDoc(doc(db, COLLECTIONS.users, credential.user.uid), { uid: credential.user.uid, email, displayName: name, createdAt: serverTimestamp() })
    },
    resetPassword: async (email) => {
      if (!auth) throw new Error('Password reset requires a configured Firebase project.')
      await sendPasswordResetEmail(auth, email)
    },
    loginDemo: () => {
      if (!firebaseConfigured) {
        localStorage.setItem(DEMO_KEY, 'active')
        const profile = readDemoProfile()
        setUser({ uid: 'demo', email: profile.email || 'alex.morgan@example.com', displayName: profile.displayName || 'Alex Morgan', photoURL: profile.photoURL || null })
        const nextPreferences: ProfilePreferences = { currency: profile.currency || 'USD', theme: profile.theme === 'light' ? 'light' : 'dark' }
        setPreferences(nextPreferences)
        document.documentElement.dataset.theme = nextPreferences.theme
      }
    },
    logout: async () => {
      if (auth) await signOut(auth)
      localStorage.removeItem(DEMO_KEY)
      setUser(null)
      setPreferences(defaultPreferences)
      document.documentElement.dataset.theme = 'dark'
    },
    saveProfile: async (profile) => {
      if (auth?.currentUser) {
        if (profile.email.trim() !== auth.currentUser.email) await updateEmail(auth.currentUser, profile.email.trim())
        await updateProfile(auth.currentUser, { displayName: profile.displayName.trim(), photoURL: profile.photoURL.trim() || null })
        if (db) await setDoc(doc(db, COLLECTIONS.users, auth.currentUser.uid), { uid: auth.currentUser.uid, email: profile.email.trim(), displayName: profile.displayName.trim(), photoURL: profile.photoURL.trim() || null, currency: profile.currency, theme: profile.theme, updatedAt: serverTimestamp() }, { merge: true })
        setUser(auth.currentUser)
      } else if (user?.uid === 'demo') {
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile))
        setUser({ uid: 'demo', email: profile.email.trim(), displayName: profile.displayName.trim(), photoURL: profile.photoURL.trim() || null })
      } else {
        throw new Error('Sign in again before updating your profile.')
      }
      const nextPreferences = { currency: profile.currency, theme: profile.theme }
      setPreferences(nextPreferences)
      document.documentElement.dataset.theme = nextPreferences.theme
    },
  }), [user, loading, preferences])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}