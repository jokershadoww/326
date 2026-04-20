'use server';

import { adminAuth } from '@/lib/firebase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { UserRecord } from 'firebase-admin/auth';

export async function getMembers() {
  try {
    const listUsersResult = await adminAuth.listUsers(1000);
    const users = listUsersResult.users.map((user: UserRecord) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      metadata: {
        creationTime: user.metadata.creationTime,
        disabled: user.disabled,
      },
      customClaims: user.customClaims,
    }));

    // Serialization for Client Component
    const serializedUsers = JSON.parse(JSON.stringify(users));

    return { users: serializedUsers };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { error: 'حدث خطأ أثناء جلب قائمة الأعضاء' };
  }
}

export async function createMember(prevState: any, formData: FormData) {
  const displayName = formData.get('displayName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!displayName || !email || !password || !role) {
    return { error: 'جميع الحقول مطلوبة' };
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

    let ownerAdminUid: string | undefined = undefined;
    let ownerAdminEmail: string | undefined = undefined;
    try {
      const cookieStore = await cookies();
      const actorRole = cookieStore.get('user_role')?.value;
      const actorEmail = cookieStore.get('user_email')?.value;
      if (actorRole === 'admin' && actorEmail) {
        const adminRecord = await adminAuth.getUserByEmail(actorEmail);
        ownerAdminUid = adminRecord.uid;
        ownerAdminEmail = actorEmail.toLowerCase();
      }
    } catch {}

    const claims: Record<string, any> = { role };
    if (ownerAdminUid) claims.ownerAdminUid = ownerAdminUid;
    if (ownerAdminEmail) claims.ownerAdminEmail = ownerAdminEmail;
    await adminAuth.setCustomUserClaims(userRecord.uid, claims);

    revalidatePath('/admin/members');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating member:', error);
    if (error.code === 'auth/email-already-exists') {
      return { error: 'البريد الإلكتروني مسجل بالفعل' };
    }
    return { error: 'حدث خطأ أثناء إنشاء العضو' };
  }
}

export async function updateMember(prevState: any, formData: FormData) {
  const uid = formData.get('uid') as string;
  const displayName = formData.get('displayName') as string;
  const role = formData.get('role') as string;

  if (!uid) {
    return { error: 'معرف المستخدم مفقود' };
  }

  try {
    const updates: { displayName?: string } = {};
    if (displayName) updates.displayName = displayName;

    if (Object.keys(updates).length > 0) {
      await adminAuth.updateUser(uid, updates);
    }

    if (role) {
      const userRecord = await adminAuth.getUser(uid);
      const currentClaims = userRecord.customClaims || {};
      await adminAuth.setCustomUserClaims(uid, { ...currentClaims, role });
    }

    revalidatePath('/admin/members');
    return { success: 'تم تحديث بيانات العضو بنجاح' };
  } catch (error) {
    console.error('Error updating member:', error);
    return { error: 'حدث خطأ أثناء تحديث العضو' };
  }
}

export async function disableMemberAction(prevState: any, formData: FormData) {
  const uid = formData.get('uid') as string;
  const role = formData.get('role') as string;
  if (!uid) return { error: 'معرف المستخدم مفقود' };
  if (role === 'admin') return { error: 'لا يمكن تعطيل حساب الأدمن' };
  try {
    await adminAuth.updateUser(uid, { disabled: true });
    revalidatePath('/admin/players');
    return { success: 'تم تعطيل الحساب' };
  } catch (error) {
    console.error('Error disabling member:', error);
    return { error: 'فشل تعطيل الحساب' };
  }
}

export async function enableMemberAction(prevState: any, formData: FormData) {
  const uid = formData.get('uid') as string;
  const role = formData.get('role') as string;
  if (!uid) return { error: 'معرف المستخدم مفقود' };
  if (role === 'admin') return { error: 'لا يمكن تعديل حالة الأدمن هنا' };
  try {
    await adminAuth.updateUser(uid, { disabled: false });
    revalidatePath('/admin/players');
    return { success: 'تم تفعيل الحساب' };
  } catch (error) {
    console.error('Error enabling member:', error);
    return { error: 'فشل تفعيل الحساب' };
  }
}

export async function deleteMemberAction(prevState: any, formData: FormData) {
  const uid = formData.get('uid') as string;
  const role = formData.get('role') as string;
  if (!uid) return { error: 'معرف المستخدم مفقود' };
  if (role === 'admin') return { error: 'لا يمكن حذف حساب الأدمن' };
  try {
    await adminAuth.deleteUser(uid);
    revalidatePath('/admin/players');
    return { success: 'تم حذف الحساب' };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { error: 'فشل حذف الحساب' };
  }
}

function genTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  for (let i = 0; i < 12; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const uid = formData.get('uid') as string;
  const role = formData.get('role') as string;
  if (!uid) return { error: 'معرف المستخدم مفقود' };
  if (role === 'admin') return { error: 'لا يمكن إعادة تعيين كلمة مرور الأدمن هنا' };
  try {
    const temp = genTempPassword();
    await adminAuth.updateUser(uid, { password: temp });
    revalidatePath('/admin/players');
    return { success: true, tempPassword: temp };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { error: 'فشل إعادة تعيين كلمة المرور' };
  }
}

export async function disableAllNonAdminBulk() {
  try {
    const res = await adminAuth.listUsers(1000);
    const users = res.users;
    for (const u of users) {
      const role = (u.customClaims || {}).role as string | undefined;
      if (role === 'player' || role === 'coordinator') {
        if (!u.disabled) {
          await adminAuth.updateUser(u.uid, { disabled: true });
        }
      }
    }
  } catch (e) {
    console.error('Bulk disable failed', e);
  }
}

export async function enableAllNonAdminBulk() {
  try {
    const res = await adminAuth.listUsers(1000);
    const users = res.users;
    for (const u of users) {
      const role = (u.customClaims || {}).role as string | undefined;
      if (role === 'player' || role === 'coordinator') {
        if (u.disabled) {
          await adminAuth.updateUser(u.uid, { disabled: false });
        }
      }
    }
  } catch (e) {
    console.error('Bulk enable failed', e);
  }
}
