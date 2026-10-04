import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
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
import { auth, authPersistenceReady, COLLECTIONS, db, googleProvider } from '../lib/firebase'
import { firebaseErrorMessage } from '../utils/firebaseErrors'
import { logFirestoreWriteError } from '../utils/firestoreWrites'

export type ProfilePreferences = { currency: string; theme: 'dark' | 'light' }
export type EditableProfile = { displayName: string; email: string; photoURL: string; currency: string; theme: 'dark' | 'light' }
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
type AppUser = Pick<User, 'uid' | 'email' | 'displayName' | 'photoURL'>
type AuthContextValue = {
  user: AppUser | null
  authStatus: AuthStatus
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

async function ensureUserProfile(user: User) {
  const reference = doc(db, COLLECTIONS.users, user.uid)
  const existing = await getDoc(reference)
  try {
    await setDoc(reference, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (error) {
    logFirestoreWriteError(error)
    throw error
  }
  return existing.data()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [authError, setAuthError] = useState('')
  const [preferences, setPreferences] = useState<ProfilePreferences>(defaultPreferences)

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined
    let profileReadId = 0

    void authPersistenceReady.then(() => {
      if (!active) return
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        const readId = ++profileReadId
        setAuthStatus('loading')
        setAuthError('')
        if (!firebaseUser) {
          setUser(null)
          setPreferences(defaultPreferences)
          document.documentElement.dataset.theme = 'dark'
          setAuthStatus('unauthenticated')
          return
        }

        setUser(firebaseUser)
        void (async () => {
          try {
            const saved = await ensureUserProfile(firebaseUser)
            const nextPreferences: ProfilePreferences = {
              currency: typeof saved?.currency === 'string' ? saved.currency : 'USD',
              theme: saved?.theme === 'light' ? 'light' : 'dark',
            }
            if (!active || readId !== profileReadId) return
            setPreferences(nextPreferences)
            document.documentElement.dataset.theme = nextPreferences.theme
          } catch (error) {
            if (active && readId === profileReadId) {
              setAuthError(firebaseErrorMessage(error, 'Your account profile could not be loaded.'))
            }
          } finally {
            if (active && readId === profileReadId) setAuthStatus('authenticated')
          }
        })()
      }, (error) => {
        if (!active) return
        setUser(null)
        setAuthError(firebaseErrorMessage(error, 'Authentication could not be restored. Please sign in again.'))
        setAuthStatus('unauthenticated')
      })
    }).catch((error: unknown) => {
      if (!active) return
      setUser(null)
      setAuthError(firebaseErrorMessage(error, 'Authentication could not be initialized. Please reload the page.'))
      setAuthStatus('unauthenticated')
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    authStatus,
    loading: authStatus === 'loading',
    authError,
    firebaseConfigured: true,
    preferences,
    login: async (email, password) => {
      await authPersistenceReady
      await signInWithEmailAndPassword(auth, email, password)
    },
    register: async (name, email, password) => {
      await authPersistenceReady
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName: name })
      await ensureUserProfile(credential.user)
    },
    loginWithGoogle: async () => {
      await authPersistenceReady
      const credential = await signInWithPopup(auth, googleProvider)
      await ensureUserProfile(credential.user)
    },
    resetPassword: async (email) => {
      await authPersistenceReady
      await sendPasswordResetEmail(auth, email)
    },
    logout: async () => {
      await authPersistenceReady
      await signOut(auth)
      setPreferences(defaultPreferences)
      document.documentElement.dataset.theme = 'dark'
    },
    saveProfile: async (profile) => {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Sign in again before updating your profile.')
      if (profile.email.trim() !== currentUser.email) await updateEmail(currentUser, profile.email.trim())
      await updateProfile(currentUser, {
        displayName: profile.displayName.trim(),
        photoURL: profile.photoURL.trim() || null,
      })
      try {
        await setDoc(doc(db, COLLECTIONS.users, currentUser.uid), {
          uid: currentUser.uid,
          email: profile.email.trim(),
          displayName: profile.displayName.trim(),
          photoURL: profile.photoURL.trim() || '',
          currency: profile.currency,
          theme: profile.theme,
          updatedAt: serverTimestamp(),
        }, { merge: true })
      } catch (error) {
        logFirestoreWriteError(error)
        throw error
      }
      setUser(currentUser)
      const nextPreferences = { currency: profile.currency, theme: profile.theme }
      setPreferences(nextPreferences)
      document.documentElement.dataset.theme = nextPreferences.theme
    },
  }), [user, authStatus, authError, preferences])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
