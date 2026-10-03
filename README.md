# FinFlow

A responsive dark fintech dashboard built with React, TypeScript, Vite, Tailwind CSS, Firebase Authentication, Cloud Firestore, Recharts, Font Awesome, and Inter.

## Run locally

```sh
npm install
npm run dev
```

Without Firebase credentials, choose **Explore demo preview** on the sign-in page. Demo figures are identified in the interface as sample data; changes to demo transactions, wallets, goals, invoices, and scheduled payments are stored in this browser only. Demo records are not presented as data from a Firebase account.

## Firebase setup

1. Create a Firebase project and enable Email/Password under Authentication.
2. Create a Cloud Firestore database.
3. Copy `.env.example` to `.env.local`, fill in the Firebase web app configuration, and restart Vite.
4. Deploy `firestore.rules` to the project.

Firebase Authentication persists sessions in browser local storage. Registration writes a profile to `users/{uid}`. Financial records include a `userId` field; Firestore rules enforce ownership on reads and writes.

## Data and features

The dashboard reads wallets, transactions, and savings goals from Firestore and derives balances, cash flow, category totals, and recent activity from those records. A new Firebase account with no financial records sees empty states rather than another account’s demo data.

Transactions can be created, edited, deleted, searched, filtered, and exported as CSV. Wallets, savings goals, invoices, recurring payments, and subscriptions support persistent create/edit/delete workflows. Scheduled payment records are reminders only; FinFlow does not initiate transfers or charges. Profile and display preferences are saved to the authenticated user profile.

Firestore creates collections when the first document is written. The current application uses `users`, `wallets`, `transactions`, `savingsGoals`, `invoices`, `recurringPayments`, and `subscriptions`. `expenses` remains available for a future separate expense model; current expense totals are derived from expense-direction transaction records.
