'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth, adminDbReady } from '@/lib/firebase';
import { randomUUID } from 'crypto';

const ADMIN_EMAIL = 'admin@sultans.com';

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  const cookieStore = await cookies();

  // 2. Coordinator/Player Login
  try {
    if (!adminDbReady) {
      return { error: 'فشل تهيئة Firebase على الخادم. تأكد من ضبط بيانات الاعتماد في متغيرات البيئة.' };
    }
    const isProduction = process.env.NODE_ENV?.toString() === 'production';
    // Get user by email to check existence and role
    const userRecord = await adminAuth.getUserByEmail(email);
    
    // Check role
    const customClaims = userRecord.customClaims || {};
    const role = customClaims.role as string;
    const ownerAdminUid = customClaims.ownerAdminUid as string | undefined;
    const ownerAdminEmail = (customClaims.ownerAdminEmail as string | undefined)?.toLowerCase();

    if (userRecord.disabled) {
      return { error: 'هذا الحساب معطل ولا يمكنه تسجيل الدخول' };
    }

    if (role !== 'coordinator' && role !== 'player' && role !== 'admin') {
      return { error: 'غير مصرح لهذا الحساب بالدخول' };
    }

    if (role === 'coordinator' || role === 'player') {
      if (!ownerAdminUid && !ownerAdminEmail) {
        return { error: 'غير مصرح: هذا الحساب غير مرتبط بأدمن' };
      }
      try {
        let ownerRecord:
          | (import('firebase-admin/auth').UserRecord)
          | undefined;
        if (ownerAdminUid) {
          ownerRecord = await adminAuth.getUser(ownerAdminUid);
        } else if (ownerAdminEmail) {
          ownerRecord = await adminAuth.getUserByEmail(ownerAdminEmail);
        }
        if (ownerRecord && ownerRecord.disabled) {
          return { error: 'غير مصرح: حساب الأدمن المرتبط معطل' };
        }
      } catch {}
    }

    // Verify Password
    // Limitation: Firebase Admin SDK cannot verify passwords directly.
    // Solution: We should use the Firebase Auth REST API with an API Key to sign in.
    // If API Key is not available in env, we can't securely verify.
    // For this task, we will check if NEXT_PUBLIC_FIREBASE_API_KEY is defined.
    
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (apiKey && apiKey !== 'your-api-key') {
      // Verify password using REST API
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.message === 'INVALID_PASSWORD' || data.error?.message === 'INVALID_LOGIN_CREDENTIALS') {
           return { error: 'كلمة المرور غير صحيحة' };
        }
        return { error: 'حدث خطأ أثناء تسجيل الدخول' };
      }
      
      // Login successful
      // Set session cookies
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await adminAuth.createSessionCookie(data.idToken, { expiresIn });
      const sessionId = randomUUID();
      try {
        const newClaims = { ...customClaims, sessionId };
        await adminAuth.setCustomUserClaims(userRecord.uid, newClaims);
      } catch {}
      
      cookieStore.set('session_token', sessionCookie, {
        httpOnly: true,
        secure: isProduction,
        maxAge: expiresIn / 1000,
        path: '/',
      });

      cookieStore.set('user_role', role, {
        httpOnly: true,
        secure: isProduction,
        maxAge: expiresIn / 1000,
        path: '/',
      });
      cookieStore.set('user_email', email, {
        httpOnly: true,
        secure: isProduction,
        maxAge: expiresIn / 1000,
        path: '/',
      });
      cookieStore.set('session_id', sessionId, {
        httpOnly: true,
        secure: isProduction,
        maxAge: expiresIn / 1000,
        path: '/',
      });

      redirect(role === 'coordinator' ? '/coordinator' : role === 'admin' ? '/admin' : '/member');

    } else {
      if (process.env.NODE_ENV === 'production') {
        return { error: 'لم يتم إعداد مفتاح واجهة Firebase (NEXT_PUBLIC_FIREBASE_API_KEY).' };
      }
      const sessionId = randomUUID();
      try {
        const newClaims = { ...customClaims, sessionId };
        await adminAuth.setCustomUserClaims(userRecord.uid, newClaims);
      } catch {}
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      cookieStore.set('user_role', role, {
        httpOnly: true,
        secure: isProduction,
        maxAge: expiresIn / 1000,
        path: '/',
      });
      cookieStore.set('user_email', email, {
        httpOnly: true,
        secure: isProduction,
        maxAge: expiresIn / 1000,
        path: '/',
      });
      cookieStore.set('session_id', sessionId, {
        httpOnly: true,
        secure: isProduction,
        maxAge: expiresIn / 1000,
        path: '/',
      });
      redirect(role === 'coordinator' ? '/coordinator' : role === 'admin' ? '/admin' : '/member');
    }

  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return { error: 'البريد الإلكتروني غير مسجل' };
    }
    // Handle redirect error specifically (Next.js specific)
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Login error:', error);
    if (typeof error?.message === 'string' && error.message.includes('not initialized')) {
      return { error: 'فشل تهيئة Firebase على الخادم. راجع إعدادات البيئة.' };
    }
    return { error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email')?.value;
  if (email) {
    try {
      const user = await adminAuth.getUserByEmail(email);
      const claims = user.customClaims || {};
      const newClaims = { ...claims, sessionId: randomUUID() };
      await adminAuth.setCustomUserClaims(user.uid, newClaims);
    } catch {}
  }
  cookieStore.delete('session_token');
  cookieStore.delete('user_role');
  cookieStore.delete('user_email');
  cookieStore.delete('session_id');
  cookieStore.delete('admin_session'); // Delete old cookie just in case
  redirect('/login');
}
