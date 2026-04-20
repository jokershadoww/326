'use server';

import { adminDb } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import type { UpdateLink } from '@/types/update-link';
import type { Castle } from '@/types/castle';

const COLLECTION = 'updateLinks';

type StagingRecord = { id: string; fields: Partial<Castle> };
const ALLOWED_KEYS: Array<keyof Castle> = [
  'name','rank','type','giant',
  'barracksArmor','archersArmor',
  'barracksPiercing','archersPiercing',
  'normalRally','superRally','drops',
  'accountEmail','accountPassword',
];
const READINESS_KEYS: Array<keyof Castle['readiness']> = [
  'speedups50','speedups25','freeHours','healingHours','goldHeroFragments','redHeroFragments',
];

function buildPatch(fields: Partial<Castle>): Partial<Castle> {
  const patch: Partial<Castle> = {};
  for (const k of ALLOWED_KEYS) {
    const v = fields[k] as unknown as string | number | undefined | null;
    if (v !== undefined && v !== null && v !== '' && v !== '—') {
      (patch as any)[k] = v;
    }
  }
  if (fields.readiness) {
    const rPatch: Partial<Castle['readiness']> = {};
    for (const rk of READINESS_KEYS) {
      const rv = fields.readiness[rk] as unknown as number | string | undefined | null;
      if (rv !== undefined && rv !== null && rv !== '' && rv !== '—') {
        (rPatch as any)[rk] = rv;
      }
    }
    if (Object.keys(rPatch).length) {
      (patch as any).readiness = rPatch;
    }
  }
  return patch;
}

export async function createUpdateLink(prevState: any, formData: FormData) {
  try {
    const name = (formData.get('name') as string)?.trim();
    const expiresAtStr = (formData.get('expiresAt') as string)?.trim();
    if (!name || !expiresAtStr) {
      return { error: 'الاسم وتاريخ الانتهاء مطلوبان' };
    }
    const expiresAt = Number(new Date(expiresAtStr).getTime());
    if (!expiresAt || expiresAt < Date.now()) {
      return { error: 'تاريخ الانتهاء غير صالح' };
    }
    const docRef = await adminDb.collection(COLLECTION).add({
      name,
      expiresAt,
      disabled: false,
      createdAt: Date.now(),
      submissionsCount: 0,
    });
    revalidatePath('/coordinator/server-info/update-data');
    return { success: true, id: docRef.id };
  } catch (e) {
    return { error: 'فشل إنشاء رابط التحديث' };
  }
}

export async function getUpdateLinks() {
  try {
    const snapshot = await adminDb.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const links: UpdateLink[] = snapshot.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
      const data = d.data() as UpdateLink;
      const { id, ...rest } = data;
      return { id: d.id, ...rest };
    });
    return { links: JSON.parse(JSON.stringify(links)) };
  } catch {
    return { error: 'فشل جلب روابط التحديث' };
  }
}

export async function getUpdateLinkById(id: string) {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return { error: 'الرابط غير موجود' };
    const data = doc.data() as UpdateLink;
    if (data.disabled) return { error: 'هذا الرابط معطل' };
    if (data.expiresAt <= Date.now()) return { error: 'انتهت صلاحية هذا الرابط' };
    return { link: { id: doc.id, ...data } };
  } catch {
    return { error: 'فشل جلب بيانات الرابط' };
  }
}

export async function updateUpdateLink(prevState: any, formData: FormData) {
  try {
    const id = (formData.get('id') as string)?.trim();
    if (!id) return { error: 'معرف الرابط مفقود' };
    const name = (formData.get('name') as string)?.trim();
    const expiresAtStr = (formData.get('expiresAt') as string)?.trim();
    const disabledStr = (formData.get('disabled') as string)?.trim();
    const patch: Partial<UpdateLink> = {};
    if (name) patch.name = name;
    if (expiresAtStr) {
      const expiresAt = Number(new Date(expiresAtStr).getTime());
      if (!expiresAt) return { error: 'تاريخ الانتهاء غير صالح' };
      patch.expiresAt = expiresAt;
    }
    if (disabledStr !== undefined) {
      patch.disabled = disabledStr === 'true';
    }
    await adminDb.collection(COLLECTION).doc(id).update(patch);
    revalidatePath('/coordinator/server-info/update-data');
    return { success: true };
  } catch {
    return { error: 'فشل تحديث بيانات الرابط' };
  }
}

export async function deleteUpdateLink(prevState: any, formData: FormData) {
  try {
    const id = (formData.get('id') as string)?.trim();
    if (!id) return { error: 'معرف الرابط مفقود' };
    await adminDb.collection(COLLECTION).doc(id).delete();
    revalidatePath('/coordinator/server-info/update-data');
    return { success: true };
  } catch {
    return { error: 'فشل حذف الرابط' };
  }
}

export async function submitBulkUpdates(prevState: any, formData: FormData) {
  try {
    const linkId = (formData.get('linkId') as string)?.trim();
    const rank = (formData.get('rank') as string)?.trim();
    const payloadStr = (formData.get('payload') as string)?.trim();
    if (!linkId || !rank || !payloadStr) {
      return { error: 'البيانات غير مكتملة' };
    }
    const linkRes = await getUpdateLinkById(linkId);
    if ((linkRes as any).error) {
      return { error: (linkRes as any).error };
    }
    const updates: Array<{ id: string; fields: Partial<Castle> }> = JSON.parse(payloadStr);
    const batch = adminDb.batch();
    for (const u of updates) {
      if (!u.id || !u.fields) continue;
      const docRef = adminDb.collection('castles').doc(u.id);
      const patch: any = {};
      // Only copy allowed fields if provided and not empty
      const keys = [
        'name','rank','type','giant',
        'barracksArmor','archersArmor',
        'barracksPiercing','archersPiercing',
        'normalRally','superRally','drops',
        'accountEmail','accountPassword',
      ];
      for (const k of keys) {
        const v = (u.fields as any)[k];
        if (v !== undefined && v !== null && v !== '') {
          patch[k] = typeof v === 'string' ? v.trim() : v;
        }
      }
      if (u.fields.readiness) {
        const r = u.fields.readiness as any;
        const rPatch: any = {};
        const rKeys = ['speedups50','speedups25','freeHours','healingHours','goldHeroFragments','redHeroFragments'];
        for (const rk of rKeys) {
          const rv = r[rk];
          if (rv !== undefined && rv !== null && rv !== '') {
            rPatch[rk] = rv;
          }
        }
        if (Object.keys(rPatch).length) {
          patch.readiness = rPatch;
        }
      }
      if (Object.keys(patch).length) {
        batch.update(docRef, patch);
      }
    }
    await batch.commit();
    try {
      const doc = await adminDb.collection(COLLECTION).doc(linkId).get();
      const current = (doc.data() as any)?.submissionsCount || 0;
      await adminDb.collection(COLLECTION).doc(linkId).update({
        submissionsCount: current + 1,
        lastUsedAt: Date.now(),
      });
    } catch {}
    return { success: true };
  } catch (e) {
    return { error: 'فشل تنفيذ التحديث الجماعي' };
  }
}

export async function getStagingCastles(linkId: string) {
  try {
    const snapshot = await adminDb.collection('updateLinks').doc(linkId).collection('staging').get();
    const ids = snapshot.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => d.id);
    return { ids };
  } catch {
    return { ids: [] };
  }
}

export async function getStagingRecords(linkId: string) {
  try {
    const snapshot = await adminDb.collection('updateLinks').doc(linkId).collection('staging').get();
    const records: StagingRecord[] = snapshot.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({
      id: d.id,
      fields: d.data() as Partial<Castle>,
    }));
    return { records: JSON.parse(JSON.stringify(records)) };
  } catch {
    return { records: [] };
  }
}

export async function submitSingleUpdate(prevState: any, formData: FormData) {
  try {
    const linkId = (formData.get('linkId') as string)?.trim();
    const castleId = (formData.get('castleId') as string)?.trim();
    const payloadStr = (formData.get('payload') as string)?.trim();
    if (!linkId || !castleId || !payloadStr) return { error: 'بيانات غير مكتملة' };
    const linkRes = await getUpdateLinkById(linkId);
    if ((linkRes as any).error) return { error: (linkRes as any).error };
    const fields = JSON.parse(payloadStr);
    await adminDb.collection('updateLinks').doc(linkId).collection('staging').doc(castleId).set(fields, { merge: true });
    return { success: true };
  } catch {
    return { error: 'فشل إرسال تحديث القلعة' };
  }
}

export async function approveStaging(prevState: any, formData: FormData) {
  try {
    const linkId = (formData.get('linkId') as string)?.trim();
    if (!linkId) return { error: 'معرف الرابط مفقود' };
    const recordsRes = await getStagingRecords(linkId);
    const records = (recordsRes as any).records as StagingRecord[] || [];
    if (!records.length) return { error: 'لا توجد بيانات للموافقة' };
    const batch = adminDb.batch();
    for (const r of records) {
      const docRef = adminDb.collection('castles').doc(r.id);
      const patch = buildPatch(r.fields);
      if (Object.keys(patch).length) {
        batch.update(docRef, patch);
      }
    }
    await batch.commit();
    const staging = await adminDb.collection('updateLinks').doc(linkId).collection('staging').get();
    const delBatch = adminDb.batch();
    staging.docs.forEach((d: any) => delBatch.delete(d.ref));
    await delBatch.commit();
    const doc = await adminDb.collection('updateLinks').doc(linkId).get();
    const current = (doc.data() as any)?.submissionsCount || 0;
    await adminDb.collection('updateLinks').doc(linkId).update({
      submissionsCount: current + records.length,
      lastUsedAt: Date.now(),
    });
    revalidatePath('/coordinator/server-info');
    revalidatePath('/coordinator/server-info/update-data');
    return { success: true };
  } catch {
    return { error: 'فشل الموافقة على البيانات' };
  }
}

export async function approveSingle(prevState: any, formData: FormData) {
  try {
    const linkId = (formData.get('linkId') as string)?.trim();
    const castleId = (formData.get('castleId') as string)?.trim();
    if (!linkId || !castleId) return { error: 'معرفات غير مكتملة' };
    const doc = await adminDb.collection('updateLinks').doc(linkId).collection('staging').doc(castleId).get();
    if (!doc.exists) return { error: 'لا توجد بيانات لهذه القلعة' };
    const fields = doc.data() as Record<string, any>;
    const patch = buildPatch(fields as Partial<Castle>);
    if (Object.keys(patch).length) {
      await adminDb.collection('castles').doc(castleId).update(patch);
    }
    await adminDb.collection('updateLinks').doc(linkId).collection('staging').doc(castleId).delete();
    const linkDoc = await adminDb.collection('updateLinks').doc(linkId).get();
    const current = (linkDoc.data() as any)?.submissionsCount || 0;
    await adminDb.collection('updateLinks').doc(linkId).update({
      submissionsCount: current + 1,
      lastUsedAt: Date.now(),
    });
    revalidatePath(`/coordinator/server-info/update-data/links/${linkId}/review`);
    revalidatePath('/coordinator/server-info');
    return { success: true };
  } catch {
    return { error: 'فشل الموافقة الفردية' };
  }
}

export async function rejectSingle(prevState: any, formData: FormData) {
  try {
    const linkId = (formData.get('linkId') as string)?.trim();
    const castleId = (formData.get('castleId') as string)?.trim();
    if (!linkId || !castleId) return { error: 'معرفات غير مكتملة' };
    await adminDb.collection('updateLinks').doc(linkId).collection('staging').doc(castleId).delete();
    revalidatePath(`/coordinator/server-info/update-data/links/${linkId}/review`);
    return { success: true };
  } catch {
    return { error: 'فشل رفض التحديث لهذه القلعة' };
  }
}
