import { useEffect, useState, type FormEvent } from 'react'
import { Check, LoaderCircle, UserRound } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { firebaseErrorMessage } from '../utils/firebaseErrors'

const currencies = ['USD', 'NGN', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']

export function SettingsPage() {
  const { user, preferences, saveProfile } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [currency, setCurrency] = useState(preferences.currency)
  const [theme, setTheme] = useState<'dark' | 'light'>(preferences.theme)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setDisplayName(user?.displayName || '')
    setEmail(user?.email || '')
    setPhotoURL(user?.photoURL || '')
  }, [user])
  useEffect(() => { setCurrency(preferences.currency); setTheme(preferences.theme) }, [preferences])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(''); setSuccess('')
    if (!displayName.trim()) { setError('Enter your name.'); return }
    if (photoURL.trim()) {
      try { const url = new URL(photoURL); if (!['http:', 'https:'].includes(url.protocol)) throw new Error() }
      catch { setError('Profile image must be a valid http or https URL.'); return }
    }
    setBusy(true)
    try {
      await saveProfile({ displayName, email, photoURL, currency, theme })
      setSuccess('Your profile and preferences have been saved.')
    } catch (caught) {
      setError(firebaseErrorMessage(caught, 'Your profile could not be saved.'))
    } finally { setBusy(false) }
  }

  const initials = (displayName || 'U').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const fieldClass = 'mt-1.5 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-input)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]'

  return <div className="mx-auto max-w-4xl space-y-6">
    <div><p className="eyebrow">Account</p><h2 className="page-title mt-1">Settings</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">Manage your profile and display preferences.</p></div>
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <section className="panel p-5 sm:p-6"><div className="mb-5"><h3 className="section-title">Profile</h3><p className="section-caption">These details are shown on your account.</p></div>
        <div className="mb-5 flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-hover)] text-sm font-semibold text-[var(--text-secondary)]">{photoURL ? <img src={photoURL} alt="Profile avatar preview" className="size-full object-cover" /> : initials || <UserRound size={19} />}</span><div><p className="text-xs font-medium text-[var(--text-primary)]">Profile image</p><p className="mt-1 text-[10px] text-[var(--text-muted)]">Provide a publicly accessible image URL.</p></div></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="text-[10px] font-medium text-[var(--text-secondary)]">Full name<input required maxLength={80} autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={fieldClass} /></label><label className="text-[10px] font-medium text-[var(--text-secondary)]">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} /></label><label className="text-[10px] font-medium text-[var(--text-secondary)] sm:col-span-2">Avatar image URL<input type="url" value={photoURL} onChange={(event) => setPhotoURL(event.target.value)} placeholder="https://example.com/avatar.jpg" className={fieldClass} /></label></div>
      </section>
      <section className="panel p-5 sm:p-6"><div className="mb-5"><h3 className="section-title">Preferences</h3><p className="section-caption">Choose how amounts and surfaces appear in Finflow.</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="text-[10px] font-medium text-[var(--text-secondary)]">Display currency<select value={currency} onChange={(event) => setCurrency(event.target.value)} className={fieldClass}>{currencies.map((code) => <option key={code} value={code}>{code}</option>)}</select></label><label className="text-[10px] font-medium text-[var(--text-secondary)]">Appearance<select value={theme} onChange={(event) => setTheme(event.target.value as 'dark' | 'light')} className={fieldClass}><option value="dark">Dark</option><option value="light">Light</option></select></label></div></section>
      {error && <p role="alert" className="rounded-md border border-[var(--negative)]/25 bg-[var(--negative-subtle)] px-3 py-2.5 text-[11px] text-[var(--negative)]">{error}</p>}
      {success && <p role="status" className="flex items-center gap-2 rounded-md border border-[var(--positive)]/20 bg-[var(--positive-subtle)] px-3 py-2.5 text-[11px] text-[var(--positive)]"><Check size={14} />{success}</p>}
      <div className="flex justify-end"><button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-[#111627] disabled:opacity-60">{busy && <LoaderCircle size={14} className="animate-spin" />}{busy ? 'Saving…' : 'Save changes'}</button></div>
    </form>
  </div>
}