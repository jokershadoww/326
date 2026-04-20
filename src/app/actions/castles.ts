'use server';

import { adminDb } from '@/lib/firebase';
import { Castle, CastleRank, CastleType } from '@/types/castle';
import { revalidatePath } from 'next/cache';

const COLLECTION_NAME = 'castles';

export async function getCastles(page: number = 1, limit: number = 10) {
  try {
    const offset = (page - 1) * limit;
    
    // Note: In a real production app with massive data, we should use cursors (startAfter).
    // For now, offset is sufficient and simpler for page-number navigation.
    const snapshot = await adminDb.collection(COLLECTION_NAME)
      .orderBy('rank', 'asc') // row1, row2, row3
      // .orderBy('createdAt', 'desc') // Removed to avoid composite index requirement
      .offset(offset)
      .limit(limit)
      .get();

    const totalSnapshot = await adminDb.collection(COLLECTION_NAME).count().get();
    const total = totalSnapshot.data().count;

    const allSnapshot = await adminDb.collection(COLLECTION_NAME)
      .select('barracksArmor', 'archersArmor', 'drops')
      .get();

    let barracksArmorSum = 0;
    let archersArmorSum = 0;
    let warReadyCount = 0;

    allSnapshot.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
      const d = doc.data() as Partial<Castle>;
      barracksArmorSum += Number(d.barracksArmor) || 0;
      archersArmorSum += Number(d.archersArmor) || 0;
      if ((Number(d.drops) || 0) >= 193) warReadyCount += 1;
    });

    const castles: Castle[] = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Castle));

    // Serialization for Client Components
    return {
      castles: JSON.parse(JSON.stringify(castles)),
      total,
      totalPages: Math.ceil(total / limit),
      totals: {
        barracksArmorSum,
        archersArmorSum,
        castlesCount: total,
        warReadyCount,
      }
    };
  } catch (error: any) {
    console.error('Error fetching castles:', error);

    // Check for missing index error
    if (error?.message?.includes('index')) {
        return { error: 'يتطلب هذا العرض فهرساً (Index) في قاعدة البيانات. راجع السجلات (Console) للحصول على رابط الإنشاء.' };
    }
    
    // Check for initialization error
    if (error?.message?.includes('not initialized')) {
        return { error: 'لم يتم تهيئة قاعدة البيانات. تأكد من إعداد ملف .env.local بشكل صحيح.' };
    }

    return { error: `حدث خطأ أثناء جلب القلاع: ${error.message || 'خطأ غير معروف'}` };
  }
}

export async function getAllCastles() {
  try {
    const snapshot = await adminDb.collection(COLLECTION_NAME)
      .orderBy('rank', 'asc')
      .get();

    const castles: Castle[] = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Castle));

    return { castles: JSON.parse(JSON.stringify(castles)) };
  } catch (error) {
    console.error('Error fetching all castles:', error);
    return { error: 'حدث خطأ أثناء جلب القائمة الكاملة للقلاع' };
  }
}

export async function createCastle(prevState: any, formData: FormData) {
  try {
    const data: Omit<Castle, 'id' | 'createdAt'> = {
      name: formData.get('name') as string,
      rank: formData.get('rank') as CastleRank,
      type: formData.get('type') as CastleType,
      giant: Number(formData.get('giant')),
      barracksArmor: Number(formData.get('barracksArmor')),
      archersArmor: Number(formData.get('archersArmor')),
      barracksPiercing: Number(formData.get('barracksPiercing')),
      archersPiercing: Number(formData.get('archersPiercing')),
      normalRally: Number(formData.get('normalRally')),
      superRally: Number(formData.get('superRally')),
      drops: Number(formData.get('drops')),
      accountEmail: formData.get('accountEmail') as string,
      accountPassword: formData.get('accountPassword') as string,
      readiness: {
        speedups50: Number(formData.get('speedups50')),
        speedups25: Number(formData.get('speedups25')),
        freeHours: Number(formData.get('freeHours')),
        healingHours: Number(formData.get('healingHours')),
        goldHeroFragments: Number(formData.get('goldHeroFragments')),
        redHeroFragments: Number(formData.get('redHeroFragments')),
      }
    };

    // Basic Validation
    if (!data.name || !data.rank || !data.type) {
      return { error: 'يرجى ملء جميع الحقول الأساسية' };
    }

    await adminDb.collection(COLLECTION_NAME).add({
      ...data,
      createdAt: Date.now(),
    });

    revalidatePath('/coordinator/server-info');
    revalidatePath('/admin/server');
    return { success: 'تم إضافة القلعة بنجاح' };
  } catch (error) {
    console.error('Error creating castle:', error);
    return { error: 'حدث خطأ أثناء إضافة القلعة' };
  }
}

export async function updateCastle(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { error: 'معرف القلعة مفقود' };

    const data: Partial<Castle> = {
      name: formData.get('name') as string,
      rank: formData.get('rank') as CastleRank,
      type: formData.get('type') as CastleType,
      giant: Number(formData.get('giant')),
      barracksArmor: Number(formData.get('barracksArmor')),
      archersArmor: Number(formData.get('archersArmor')),
      barracksPiercing: Number(formData.get('barracksPiercing')),
      archersPiercing: Number(formData.get('archersPiercing')),
      normalRally: Number(formData.get('normalRally')),
      superRally: Number(formData.get('superRally')),
      drops: Number(formData.get('drops')),
      accountEmail: formData.get('accountEmail') as string,
      accountPassword: formData.get('accountPassword') as string,
      readiness: {
        speedups50: Number(formData.get('speedups50')),
        speedups25: Number(formData.get('speedups25')),
        freeHours: Number(formData.get('freeHours')),
        healingHours: Number(formData.get('healingHours')),
        goldHeroFragments: Number(formData.get('goldHeroFragments')),
        redHeroFragments: Number(formData.get('redHeroFragments')),
      }
    };

    await adminDb.collection(COLLECTION_NAME).doc(id).update(data);

    revalidatePath('/coordinator/server-info');
    revalidatePath('/admin/server');
    return { success: 'تم تحديث القلعة بنجاح' };
  } catch (error) {
    console.error('Error updating castle:', error);
    return { error: 'حدث خطأ أثناء تحديث القلعة' };
  }
}

export async function deleteCastle(id: string) {
  try {
    await adminDb.collection(COLLECTION_NAME).doc(id).delete();
    revalidatePath('/coordinator/server-info');
    revalidatePath('/admin/server');
    return { success: true };
  } catch (error) {
    console.error('Error deleting castle:', error);
    return { error: 'حدث خطأ أثناء حذف القلعة' };
  }
}
