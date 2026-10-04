const messages: Record<string, string> = {
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/user-not-found': 'The email or password is incorrect.',
  'auth/wrong-password': 'The email or password is incorrect.',
  'auth/email-already-in-use': 'An account already exists with this email address.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'Unable to reach the service. Check your internet connection.',
  'auth/requires-recent-login': 'For your security, sign out and back in before making this change.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Authentication.',
  'auth/unauthorized-domain': 'This website domain is not authorized for Firebase Authentication.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow popups and try again.',
  'auth/cancelled-popup-request': 'Another sign-in window is already open. Finish it or close it before trying again.',
  'permission-denied': 'Firestore permission denied. Check authentication and Firestore Security Rules.',
  'unauthenticated': 'You are not authenticated. Please sign in again.',
  'failed-precondition': 'Firestore configuration/database error.',
  unavailable: 'Firebase is temporarily unavailable. Check your connection.',
  'invalid-argument': 'Invalid data was sent to Firestore.',
}

const firestoreMessages: Record<string, string> = {
  'permission-denied': 'Firestore permission denied. Check your Firebase authentication and Firestore Security Rules.',
  unauthenticated: 'You are not authenticated. Please sign in again.',
  'failed-precondition': 'Firestore failed precondition. Check that Cloud Firestore is enabled and correctly configured.',
  unavailable: 'Firestore is unavailable. Check the Firebase connection.',
  'invalid-argument': 'Invalid data was sent to Firestore.',
  'not-found': 'The requested Firestore document was not found.',
  'already-exists': 'This Firestore document already exists.',
}

export function getFirestoreErrorMessage(error: unknown): string {
  const details = error && typeof error === 'object' ? error : null
  const rawCode = details && 'code' in details && typeof details.code === 'string' ? details.code : ''
  const code = rawCode.startsWith('firestore/') ? rawCode.slice('firestore/'.length) : rawCode
  const rawMessage = details && 'message' in details && typeof details.message === 'string'
    ? details.message
    : error instanceof Error ? error.message : 'Unknown error'
  const summary = firestoreMessages[code]

  if (code && summary) return `Firestore error (${code}): ${summary}${rawMessage ? ` Firebase message: ${rawMessage}` : ''}`
  return `Firestore error${code ? ` (${code})` : ''}: ${rawMessage}`
}

export function firebaseErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    const code = error.code.startsWith('firestore/') ? error.code.slice('firestore/'.length) : error.code
    if (messages[error.code] || messages[code]) return messages[error.code] || messages[code]
    if (code === 'unknown' || !code.startsWith('auth/')) {
      const message = 'message' in error && typeof error.message === 'string' ? error.message : ''
      if (message) return `Firestore error: ${message}`
    }
    return fallback
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
