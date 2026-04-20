'use server';

import { adminDb } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import type { War, WarType } from '@/types/war';

const COLLECTION_NAME = 'wars';

export async function getWars() {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .orderBy('date', 'desc')
      .get();

    const wars: War[] = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as War)
    );

    return { wars: JSON.parse(JSON.stringify(wars)) };
  } catch (error: any) {
    console.error('Error fetching wars:', error);
    return { error: 'حدث خطأ أثناء جلب الحروب' };
  }
}

export async function createWar(prevState: any, formData: FormData) {
  try {
    const type = formData.get('type') as WarType;
    const name = (formData.get('name') as string)?.trim();
    const dateStr = formData.get('date') as string;

    if (!type || !name || !dateStr) {
      return { error: 'يرجى إدخال جميع الحقول المطلوبة' };
    }

    const date = Date.parse(dateStr);
    if (Number.isNaN(date)) {
      return { error: 'تاريخ غير صالح' };
    }

    await adminDb.collection(COLLECTION_NAME).add({
      type,
      name,
      date,
      createdAt: Date.now(),
    });

    revalidatePath('/coordinator/war-management');
    return { success: 'تم إنشاء الحرب بنجاح' };
  } catch (error) {
    console.error('Error creating war:', error);
    return { error: 'حدث خطأ أثناء إنشاء الحرب' };
  }
}

export async function getWarById(id: string) {
  try {
    const doc = await adminDb.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return { error: 'الحرب غير موجودة' };
    
    return { war: { id: doc.id, ...doc.data() } as War };
  } catch (error) {
    console.error('Error fetching war:', error);
    return { error: 'حدث خطأ أثناء جلب بيانات الحرب' };
  }
}

export async function initializeWarDatabase(warId: string) {
  try {
    const warRef = adminDb.collection(COLLECTION_NAME).doc(warId);
    const warDoc = await warRef.get();
    
    if (!warDoc.exists) {
      return { error: 'الحرب غير موجودة' };
    }

    // Check if "db_initialized" flag is set, if not, create the structure
    if (!warDoc.data()?.db_initialized) {
      // Create a default configuration in a subcollection
      await warRef.collection('config').doc('main').set({
        initializedAt: Date.now(),
        status: 'active',
        settings: {
          allowRegistration: true,
          maxParticipants: 100
        }
      });

      // Mark war as initialized
      await warRef.update({
        db_initialized: true,
        lastAccessed: Date.now()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing war DB:', error);
    return { error: 'فشل في تهيئة قاعدة بيانات الحرب' };
  }
}

export async function deleteWar(id: string) {
  try {
    await adminDb.collection(COLLECTION_NAME).doc(id).delete();
    revalidatePath('/coordinator/war-management');
    return { success: 'تم حذف الحرب بنجاح' };
  } catch (error) {
    console.error('Error deleting war:', error);
    return { error: 'حدث خطأ أثناء حذف الحرب' };
  }
}

export async function updateWar(id: string, formData: FormData) {
  try {
    const type = formData.get('type') as WarType;
    const name = (formData.get('name') as string)?.trim();
    const dateStr = formData.get('date') as string;

    if (!type || !name || !dateStr) {
      return { error: 'يرجى إدخال جميع الحقول المطلوبة' };
    }

    const date = Date.parse(dateStr);
    if (Number.isNaN(date)) {
      return { error: 'تاريخ غير صالح' };
    }

    await adminDb.collection(COLLECTION_NAME).doc(id).update({
      type,
      name,
      date,
    });

    revalidatePath('/coordinator/war-management');
    return { success: 'تم تحديث الحرب بنجاح' };
  } catch (error) {
    console.error('Error updating war:', error);
    return { error: 'حدث خطأ أثناء تحديث الحرب' };
  }
}
