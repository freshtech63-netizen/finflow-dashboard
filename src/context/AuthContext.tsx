import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, authPersistenceReady, COLLECTIONS, db, firebaseConfigured } from '../lib/firebase'
import { firebaseErrorMessage } from '../utils/firebaseErrors'

export type ProfilePreferences = { currency: string; theme: 'dark' | 'light' }
export type EditableProfile = { displayName: string; email: string; photoURL: string; currency: string; theme: 'dark' | 'light' }
type AppUser = Pick<User, 'uid' | 'email' | 'displayName' | 'photoURL'>
type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  authError: string
  firebaseConfigured: boolean
  preferences: ProfilePreferences
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  saveProfile: (profile: EditableProfile) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const defaultPreferences: ProfilePreferences = { currency: 'USD', theme: 'dark' }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [preferences, setPreferences] = useState<ProfilePreferences>(defaultPreferences)

  useEffect(() => {
    const currentAuth = auth
    if (!currentAuth) {
      setLoading(false)
      return
    }
    let active = true
    let unsubscribe: (() => void) | undefined
    let profileReadId = 0
    void authPersistenceReady.then(() => {
      if (!active) return
      unsubscribe = onAuthStateChanged(currentAuth, (firebaseUser) => {
        const currentReadId = ++profileReadId
        setUser(firebaseUser)
        setAuthError('')
        void (async () => {
          try {
            const profile = firebaseUser && db ? await getDoc(doc(db, COLLECTIONS.users, firebaseUser.uid)) : null
            const saved = profile?.data()
            const nextPreferences: ProfilePreferences = { currency: saved?.currency || 'USD', theme: saved?.theme === 'light' ? 'light' : 'dark' }
            if (!active || currentReadId !== profileReadId) return
            setPreferences(nextPreferences)
            document.documentElement.dataset.theme = nextPreferences.theme
          } catch (error) {
            if (active && currentReadId === profileReadId) {
              setAuthError(firebaseErrorMessage(error, 'Your account profile could not be loaded.'))
            }
          } finally {
            if (active && currentReadId === profileReadId) setLoading(false)
          }
        })()
      }, (error) => {
        if (!active) return
        setUser(null)
        setAuthError(firebaseErrorMessage(error, 'Authentication could not be restored. Please try signing in again.'))
        setLoading(false)
      })
    }).catch((error: unknown) => {
      if (!active) return
      setAuthError(firebaseErrorMessage(error, 'Authentication could not be initialized. Please reload the page.'))
      setLoading(false)
    })
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    authError,
    firebaseConfigured,
    preferences,
    login: async (email, password) => {
      if (!auth) throw new Error('Firebase is not configured. Add your Firebase environment variables to sign in.')
      await authPersistenceReady
      await signInWithEmailAndPassword(auth, email, password)
    },
    register: async (name, email, password) => {
      if (!auth) throw new Error('Firebase is not configured. Add your Firebase environment variables to create an account.')
      if (!db) throw new Error('User profile storage is unavailable. Check your Firebase configuration.')
      await authPersistenceReady
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      try {
        await updateProfile(credential.user, { displayName: name })
        await setDoc(doc(db, COLLECTIONS.users, credential.user.uid), {
          uid: credential.user.uid,
          displayName: credential.user.displayName || name,
          email: credential.user.email || email,
          photoURL: credential.user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true })
      } catch (error) {
        setAuthError(firebaseErrorMessage(error, 'Your account was created, but its Firestore profile could not be saved.'))
        throw error
      }
    },
    loginWithGoogle: async () => {
      if (!auth) throw new Error('Firebase is not configured. Add your Firebase environment variables to sign in.')
      if (!db) throw new Error('User profile storage is unavailable. Check your Firebase configuration.')
      await authPersistenceReady
      const credential = await signInWithPopup(auth, new GoogleAuthProvider())
      try {
        const profileRef = doc(db, COLLECTIONS.users, credential.user.uid)
        const existingProfile = await getDoc(profileRef)
        const existing = existingProfile.data()
        await setDoc(profileRef, {
          uid: credential.user.uid,
          email: credential.user.email || existing?.email || '',
          displayName: credential.user.displayName || existing?.displayName || '',
          photoURL: credential.user.photoURL || existing?.photoURL || '',
          ...(existingProfile.exists() ? {} : { createdAt: serverTimestamp() }),
          updatedAt: serverTimestamp(),
        }, { merge: true })
      } catch (error) {
        setAuthError(firebaseErrorMessage(error, 'Your Google account signed in, but its Firestore profile could not be saved.'))
        throw error
      }
    },
    resetPassword: async (email) => {
      if (!auth) throw new Error('Password reset requires a configured Firebase project.')
      await authPersistenceReady
      await sendPasswordResetEmail(auth, email)
    },
    logout: async () => {
      if (auth) {
        await authPersistenceReady
        await signOut(auth)
      }
      setUser(null)
      setPreferences(defaultPreferences)
      document.documentElement.dataset.theme = 'dark'
    },
    saveProfile: async (profile) => {
      if (auth?.currentUser) {
        if (!db) throw new Error('User profile storage is unavailable. Check your Firebase configuration.')
        if (profile.email.trim() !== auth.currentUser.email) await updateEmail(auth.currentUser, profile.email.trim())
        await updateProfile(auth.currentUser, { displayName: profile.displayName.trim(), photoURL: profile.photoURL.trim() || null })
        await setDoc(doc(db, COLLECTIONS.users, auth.currentUser.uid), { uid: auth.currentUser.uid, email: profile.email.trim(), displayName: profile.displayName.trim(), photoURL: profile.photoURL.trim() || null, currency: profile.currency, theme: profile.theme, updatedAt: serverTimestamp() }, { merge: true })
        setUser(auth.currentUser)
      } else {
        throw new Error('Sign in again before updating your profile.')
      }
      const nextPreferences = { currency: profile.currency, theme: profile.theme }
      setPreferences(nextPreferences)
      document.documentElement.dataset.theme = nextPreferences.theme
    },
  }), [user, loading, authError, preferences])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}