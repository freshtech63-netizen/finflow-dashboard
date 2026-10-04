type FirebaseWriteError = {
  code?: unknown
  message?: unknown
  name?: unknown
}

export function logFirestoreWriteError(error: unknown): void {
  const details = error && typeof error === 'object' ? error as FirebaseWriteError : {}
  console.error('Firestore write failed', {
    code: typeof details.code === 'string' ? details.code : undefined,
    message: typeof details.message === 'string' ? details.message : undefined,
    name: typeof details.name === 'string' ? details.name : undefined,
  })
}
