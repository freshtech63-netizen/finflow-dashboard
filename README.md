# Finflow Dashboard

A responsive personal finance dashboard built with React, TypeScript, Vite, Tailwind CSS, Firebase Authentication, Cloud Firestore, Recharts, and Lucide.

## Run locally

```sh
npm install
npm run dev
```

Without Firebase credentials, use **Explore the demo dashboard** on the sign-in page. Demo data lives in `src/lib/mockData.ts` and is served by the same dashboard service abstraction used for Firestore.

## Firebase setup

1. Create a Firebase project and enable Email/Password under Authentication.
2. Create a Cloud Firestore database and apply `firestore.rules`.
3. Copy `.env.example` to `.env.local` and fill in the web app configuration values.
4. Restart the Vite development server.

Registration creates a profile at `users/{uid}`. Financial records belong to the signed-in user through a `userId` field. Firestore collections are created on their first write; the planned collections are `users`, `wallets`, `transactions`, `savingsGoals`, `expenses`, `invoices`, and `subscriptions`.

## Data model

The dashboard currently reads `wallets`, `transactions`, `savingsGoals`, and `expenses`; when these have no records, it shows the realistic local sample dataset. The other collections are reserved for the follow-on pages. Each financial record should include `userId` and an `amount` where appropriate. The `src/lib/dashboardService.ts` adapter is the boundary for replacing or extending the sample data.
