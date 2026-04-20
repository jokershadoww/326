'use server';

import { adminDb } from '@/lib/firebase';
import { AttendanceRecord } from '@/types/attendance';
import { Castle } from '@/types/castle';
import { revalidatePath } from 'next/cache';

const WARS_COLLECTION = 'wars';

export async function getWarAttendance(warId: string) {
  try {
    const snapshot = await adminDb
      .collection(WARS_COLLECTION)
      .doc(warId)
      .collection('attendance')
      .get();

    const attendance: AttendanceRecord[] = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) =>
        doc.data() as AttendanceRecord
    );
    return { attendance };
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return { error: 'حدث خطأ أثناء جلب سجل الحضور' };
  }
}

export async function registerAttendance(warId: string, data: Omit<AttendanceRecord, 'timestamp'>) {
  try {
    const warRef = adminDb.collection(WARS_COLLECTION).doc(warId);
    const warDoc = await warRef.get();

    if (!warDoc.exists) {
      return { error: 'الحرب غير موجودة' };
    }

    // Check if castle already registered
    const attendanceRef = warRef.collection('attendance').doc(data.castleId);
    const attendanceDoc = await attendanceRef.get();

    if (attendanceDoc.exists) {
      return { error: 'هذه القلعة مسجلة بالفعل' };
    }

    await attendanceRef.set({
      ...data,
      timestamp: Date.now(),
    });

    revalidatePath(`/coordinator/war-management/${warId}/attendance`);
    return { success: 'تم تسجيل الحضور بنجاح' };
  } catch (error) {
    console.error('Error registering attendance:', error);
    return { error: 'حدث خطأ أثناء تسجيل الحضور' };
  }
}

export async function getAvailableCastles(warId: string) {
  try {
    // 1. Get all castles
    const castlesSnapshot = await adminDb.collection('castles').orderBy('rank', 'asc').get();
    const allCastles = castlesSnapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) =>
        ({ id: doc.id, ...doc.data() } as Castle)
    );

    // 2. Get registered castle IDs
    const attendanceSnapshot = await adminDb
      .collection(WARS_COLLECTION)
      .doc(warId)
      .collection('attendance')
      .get();
    
    const registeredIds = new Set(
      attendanceSnapshot.docs.map(
        (doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => doc.id
      )
    );

    // 3. Filter out registered castles
    const availableCastles = allCastles.filter((c: Castle) => !registeredIds.has(c.id));

    return { castles: JSON.parse(JSON.stringify(availableCastles)) };
  } catch (error) {
    console.error('Error fetching available castles:', error);
    return { error: 'حدث خطأ أثناء جلب القلاع المتاحة' };
  }
}
