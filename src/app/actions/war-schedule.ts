'use server';

import { adminDb } from '@/lib/firebase';
import { WarSchedule } from '@/types/war-schedule';
import { revalidatePath } from 'next/cache';

const WARS_COLLECTION = 'wars';

export async function getWarSchedule(warId: string) {
  try {
    const doc = await adminDb
      .collection(WARS_COLLECTION)
      .doc(warId)
      .collection('schedule')
      .doc('main')
      .get();

    if (!doc.exists) {
      return { schedule: null };
    }

    return { schedule: doc.data() as WarSchedule };
  } catch (error) {
    console.error('Error fetching war schedule:', error);
    return { error: 'Failed to fetch schedule' };
  }
}

export async function saveWarSchedule(warId: string, schedule: Partial<WarSchedule>) {
  try {
    await adminDb
      .collection(WARS_COLLECTION)
      .doc(warId)
      .collection('schedule')
      .doc('main')
      .set(schedule, { merge: true });

    revalidatePath(`/coordinator/war-management/${warId}/schedule`);
    return { success: true };
  } catch (error) {
    console.error('Error saving war schedule:', error);
    return { error: 'Failed to save schedule' };
  }
}
