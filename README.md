# FinFlow

A responsive dark fintech dashboard built with React, TypeScript, Vite, Tailwind CSS, Firebase Authentication, Cloud Firestore, Recharts, Font Awesome, and Inter.

## Run locally

```sh
npm install
npm run dev
```

FinFlow requires Firebase configuration to sign in. Without it, the authentication controls remain disabled and the sign-in page explains how to configure the app. No demo account or sample financial data is included.

## Firebase setup

The application is configured for Firebase project finflow Its local `.env.local` file is intentionally not committed.

1. Copy `.env.example` to `.env.local` and populate it with the Web App configuration from **Project settings → General → Your apps**. Never commit `.env.local` or other populated environment files.
2. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**. For Google, set a support email and save the provider.
3. In **Authentication → Settings → Authorized domains**, add `localhost` for local development and each exact production/preview hostname used to serve the app.
4. In **Firestore Database**, create a database in the intended region. Deploy the repository rules with `firebase login` followed by `firebase deploy --only firestore:rules --project finflow-37b6e`, or paste `firestore.rules` into **Firestore Database → Rules** and publish them.
5. Restart Vite after changing `.env.local`.

Firebase Authentication persists sessions in browser local storage. Email registration and first Google sign-in initialize `users/{uid}` with the user's identity and timestamps. Financial records include a `userId` field; Firestore rules enforce ownership on reads and writes.

## Netlify deployment

Set the `VITE_FIREBASE_*` variables listed in `.env.example` in **Project configuration → Environment variables**, with the Builds scope for each deployment context that needs Firebase. `VITE_FIREBASE_MEASUREMENT_ID` is optional. Do not put their values in source files or `netlify.toml`.

Vite embeds these variables in the browser bundle even when they are supplied through Netlify. Firebase Web App configuration is public client configuration, not a server credential. `netlify.toml` excludes only the seven named Firebase client configuration variables from secrets scanning; scanning remains enabled for other secrets, and no repository or build-output paths are excluded.

Protect Firebase data with Security Rules, configure App Check where appropriate, and restrict the Firebase API key to the required Firebase APIs. Never use this public key for non-Firebase services or put service-account credentials, private keys, or server tokens in any `VITE_*` variable. Redeploy after changing the Netlify configuration or environment variables.

## Data and features

The dashboard reads wallets, transactions, and savings goals from Firestore and derives balances, cash flow, category totals, and recent activity from those records. A new Firebase account with no financial records sees empty states.

Sign in with email/password or use Google sign-in. Google sign-in creates a Firebase Authentication account on first use and initializes its Firestore profile. Transactions can be created, edited, deleted, searched, filtered, and exported as CSV. Wallets, savings goals, invoices, recurring payments, and subscriptions support persistent create/edit/delete workflows. Scheduled payment records are reminders only; FinFlow does not initiate transfers or charges. Profile and display preferences are saved to the authenticated user profile.

Firestore creates collections when the first document is written. The current application uses `users`, `wallets`, `transactions`, `savingsGoals`, `invoices`, `recurringPayments`, and `subscriptions`. `expenses` remains available for a future separate expense model; current expense totals are derived from expense-direction transaction records.
