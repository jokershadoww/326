 'use server';
 
 import { adminAuth } from '@/lib/firebase';
 import { revalidatePath } from 'next/cache';
 import { cookies } from 'next/headers';
import type { UserRecord, ListUsersResult } from 'firebase-admin/auth';
 
export async function setAdminRoleByEmail(formData: FormData) {
  const cookieStore = await cookies();
  const sa = cookieStore.get('super_admin_session')?.value;
  if (sa !== '1') return;
  const emailInput = (formData.get('email') as string)?.trim()?.toLowerCase();
  if (!emailInput) return;
  try {
    const user = await adminAuth.getUserByEmail(emailInput);
    const claims = (user.customClaims || {}) as Record<string, any>;
    const newClaims = { ...claims, role: 'admin' };
    await adminAuth.setCustomUserClaims(user.uid, newClaims);
    revalidatePath('/super-admin');
  } catch (error: any) {
    console.error('Failed to promote user to admin:', error);
  }
}

export async function updateAdmin(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sa = cookieStore.get('super_admin_session')?.value;
  if (sa !== '1') return { error: 'غير مصرح: هذه العملية للسوبر أدمن فقط' };
  const uid = formData.get('uid') as string;
  const displayName = (formData.get('displayName') as string)?.trim();
  const emailNew = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string | null;
  const emailOld = (formData.get('oldEmail') as string)?.trim()?.toLowerCase();
  if (!uid) return { error: 'معرّف الحساب مفقود' };
  const updates: { displayName?: string; email?: string; password?: string } = {};
  if (displayName) updates.displayName = displayName;
  if (emailNew) updates.email = emailNew;
  if (password && password.length >= 6) updates.password = password;
  if (password && password.length > 0 && password.length < 6) {
    return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }
  try {
    if (Object.keys(updates).length > 0) {
      await adminAuth.updateUser(uid, updates);
    }
    if (emailNew) {
      const emailLower = emailNew.toLowerCase();
      let pageToken: string | undefined = undefined;
      do {
        const res: ListUsersResult = await adminAuth.listUsers(1000, pageToken);
        for (const u of res.users) {
          const claims = (u.customClaims || {}) as Record<string, any>;
          const role = claims.role as string | undefined;
          const ownerUid = claims.ownerAdminUid as string | undefined;
          const ownerEmailClaim = (claims.ownerAdminEmail as string | undefined)?.toLowerCase();
          if (role !== 'admin' && (ownerUid === uid || (ownerEmailClaim && ownerEmailClaim === emailOld))) {
            const newClaims = { ...claims, ownerAdminUid: uid, ownerAdminEmail: emailLower };
            await adminAuth.setCustomUserClaims(u.uid, newClaims);
          }
        }
        pageToken = res.pageToken;
      } while (pageToken);
    }
    revalidatePath('/super-admin');
    return { success: 'تم تحديث بيانات الأدمن' };
  } catch (error: any) {
    if (error?.code === 'auth/email-already-exists') {
      return { error: 'هذا البريد مستخدم بالفعل' };
    }
    return { error: 'فشل تحديث بيانات الأدمن' };
  }
}
 export async function createAdmin(prevState: any, formData: FormData) {
   const cookieStore = await cookies();
  const sa = cookieStore.get('super_admin_session')?.value;
  if (sa !== '1') return { error: 'غير مصرح: دخول السوبر أدمن مطلوب' };
 
   const displayName = (formData.get('displayName') as string)?.trim();
   const email = (formData.get('email') as string)?.trim();
   const password = formData.get('password') as string;
 
   if (!displayName || !email || !password) {
     return { error: 'يرجى إدخال الاسم والبريد وكلمة المرور' };
   }
   if (password.length < 6) {
     return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
   }
 
   try {
     const userRecord = await adminAuth.createUser({
       email,
       password,
       displayName,
     });
 
     await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
 
     revalidatePath('/super-admin');
     return { success: 'تم إنشاء حساب الأدمن بنجاح' };
   } catch (error: any) {
     if (error?.code === 'auth/email-already-exists') {
       return { error: 'هذا البريد مسجل بالفعل' };
     }
     return { error: 'حدث خطأ أثناء إنشاء حساب الأدمن' };
   }
 }
 
 export async function listAdmins() {
   try {
     const result = await adminAuth.listUsers(1000);
     const admins = result.users
       .filter((u: UserRecord) => (u.customClaims || {}).role === 'admin')
       .map((u: UserRecord) => ({
         uid: u.uid,
         email: u.email,
         displayName: u.displayName,
         createdAt: u.metadata.creationTime,
        disabled: !!u.disabled,
       }));
     return { users: JSON.parse(JSON.stringify(admins)) };
   } catch (e) {
     return { error: 'حدث خطأ أثناء جلب قائمة الأدمن' };
   }
 }

export async function disableAdmin(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sa = cookieStore.get('super_admin_session')?.value;
  if (sa !== '1') return { error: 'غير مصرح: هذه العملية للسوبر أدمن فقط' };
  const uid = formData.get('uid') as string;
  const email = (formData.get('email') as string)?.toLowerCase();
  if (!uid) return { error: 'معرّف الحساب مفقود' };
  try {
    await adminAuth.updateUser(uid, { disabled: true });
    try {
      let pageToken: string | undefined = undefined;
      do {
        const res: ListUsersResult = await adminAuth.listUsers(1000, pageToken);
        const users = res.users;
        for (const u of users) {
          const claims = (u.customClaims || {}) as Record<string, any>;
          const role = claims.role as string | undefined;
          const ownerEmailClaim = (claims.ownerAdminEmail as string | undefined)?.toLowerCase();
          if ((claims.ownerAdminUid === uid || (ownerEmailClaim && ownerEmailClaim === email)) && role !== 'admin') {
            if (!u.disabled) {
              await adminAuth.updateUser(u.uid, { disabled: true });
            }
          }
        }
        pageToken = res.pageToken;
      } while (pageToken);
    } catch {}
    revalidatePath('/super-admin');
    return { success: 'تم تعطيل الأدمن' };
  } catch {
    return { error: 'فشل تعطيل الأدمن' };
  }
}

function genTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  for (let i = 0; i < 12; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function resetAdminPasswordAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sa = cookieStore.get('super_admin_session')?.value;
  if (sa !== '1') return { error: 'غير مصرح: هذه العملية للسوبر أدمن فقط' };
  const uid = formData.get('uid') as string;
  if (!uid) return { error: 'معرف المستخدم مفقود' };
  try {
    const temp = genTempPassword();
    await adminAuth.updateUser(uid, { password: temp });
    return { success: true, tempPassword: temp };
  } catch {
    return { error: 'فشل إعادة تعيين كلمة المرور' };
  }
}

export async function enableAdmin(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sa = cookieStore.get('super_admin_session')?.value;
  if (sa !== '1') return { error: 'غير مصرح: هذه العملية للسوبر أدمن فقط' };
  const uid = formData.get('uid') as string;
  const email = (formData.get('email') as string)?.toLowerCase();
  if (!uid) return { error: 'معرّف الحساب مفقود' };
  try {
    await adminAuth.updateUser(uid, { disabled: false });
    try {
      let pageToken: string | undefined = undefined;
      do {
        const res: ListUsersResult = await adminAuth.listUsers(1000, pageToken);
        const users = res.users;
        for (const u of users) {
          const claims = (u.customClaims || {}) as Record<string, any>;
          const role = claims.role as string | undefined;
          const ownerEmailClaim = (claims.ownerAdminEmail as string | undefined)?.toLowerCase();
          if ((claims.ownerAdminUid === uid || (ownerEmailClaim && ownerEmailClaim === email)) && role !== 'admin') {
            if (u.disabled) {
              await adminAuth.updateUser(u.uid, { disabled: false });
            }
            if (!claims.ownerAdminUid && !ownerEmailClaim) {
              const newClaims = { ...claims, ownerAdminUid: uid, ownerAdminEmail: email };
              await adminAuth.setCustomUserClaims(u.uid, newClaims);
            }
          }
          if (role !== 'admin' && !claims.ownerAdminUid && !ownerEmailClaim) {
            const newClaims = { ...claims, ownerAdminUid: uid, ownerAdminEmail: email };
            await adminAuth.setCustomUserClaims(u.uid, newClaims);
          }
        }
        pageToken = res.pageToken;
      } while (pageToken);
    } catch {}
    revalidatePath('/super-admin');
    return { success: 'تم تفعيل الأدمن' };
  } catch {
    return { error: 'فشل تفعيل الأدمن' };
  }
}

export async function deleteAdmin(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const sa = cookieStore.get('super_admin_session')?.value;
  if (sa !== '1') return { error: 'غير مصرح: هذه العملية للسوبر أدمن فقط' };
  const uid = formData.get('uid') as string;
  const email = (formData.get('email') as string)?.toLowerCase();
  if (!uid) return { error: 'معرّف الحساب مفقود' };
  try {
    await adminAuth.deleteUser(uid);
    revalidatePath('/super-admin');
    return { success: 'تم حذف حساب الأدمن' };
  } catch {
    return { error: 'فشل حذف حساب الأدمن' };
  }
}
