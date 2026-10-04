# FinFlow

A responsive dark fintech dashboard built with React, TypeScript, Vite, Tailwind CSS, Firebase Authentication, Cloud Firestore, Recharts, Font Awesome, and Inter.

## Run locally

```sh
npm install
npm run dev
```

FinFlow requires Firebase configuration to sign in. Put the seven `VITE_FIREBASE_*` settings in `.env.local` for local development and in the hosting provider's build environment for deployment. No demo account or sample financial data is included.

## Firebase setup

The application is configured for Firebase project `finflow-37b6e`. Its local `.env.local` file is intentionally not committed.

1. In **Project settings → General → Your apps**, confirm the registered Web App configuration matches `.env.local`. Keep the keys private to the local environment and deployment secret store; never commit `.env.local`.
2. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**. For Google, set a support email and save the provider.
3. In **Authentication → Settings → Authorized domains**, add `localhost` for local development and each exact production/preview hostname used to serve the app.
4. In **Firestore Database**, create a database in the intended region. Deploy the repository rules with `firebase login` followed by `firebase deploy --only firestore:rules --project finflow-37b6e`, or paste `firestore.rules` into **Firestore Database → Rules** and publish them.
5. Restart Vite after changing `.env.local`.

Firebase Authentication persists sessions using Firebase Auth persistence. Email registration and first sign-in initialize `users/{uid}` with the user's identity and timestamps. Financial records include a `userId` field; Firestore rules enforce ownership on reads and writes.

## Data and features

The initial Firestore rollout supports `users`, `wallets`, and `transactions`. The dashboard derives balances, cash flow, category totals, and recent activity from that user's wallet and transaction documents. Accounts with no financial records see empty states.

Sign in with email/password or use Google sign-in. Google sign-in creates a Firebase Authentication account on first use and initializes its Firestore profile. Transactions can be created, edited, deleted, searched, filtered, and exported as CSV. Wallets and transactions are the only financial collections enabled in this data-layer rollout. Existing pages for savings goals, invoices, recurring payments, and subscriptions remain in the UI, but their Firestore operations are intentionally paused until those collections are included in a later rules and service rollout.

Firestore creates collections when the first document is written. The current application uses only `users`, `wallets`, and `transactions`. Expense totals are derived from expense-direction transaction records.
