import type { NewScheduledPayment, ScheduleType, ScheduledPayment } from '../types'

const unavailable = () => new Error('Recurring payments and subscriptions are not part of the current Firestore rollout. Users, wallets, and transactions are enabled first.')

export async function getScheduledPayments(_uid: string, _type: ScheduleType): Promise<ScheduledPayment[]> {
  throw unavailable()
}

export async function saveScheduledPayment(_uid: string, _type: ScheduleType, _value: NewScheduledPayment, _id?: string): Promise<ScheduledPayment> {
  throw unavailable()
}

export async function deleteScheduledPayment(_uid: string, _type: ScheduleType, _id: string): Promise<void> {
  throw unavailable()
}
