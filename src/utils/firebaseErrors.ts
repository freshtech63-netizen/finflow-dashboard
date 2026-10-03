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
  'permission-denied': 'Firestore rejected this change. Confirm the published rules allow the signed-in user to create records in the wallets collection, then reload the app.',
  'firestore/permission-denied': 'Firestore rejected this change. Confirm the published rules allow the signed-in user to create records in the wallets collection, then reload the app.',
  unavailable: 'Firebase is temporarily unavailable. Check your connection and try again.',
}

export function firebaseErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return messages[error.code] || fallback
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
