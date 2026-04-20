 'use server';
 
 import { cookies } from 'next/headers';
 import { redirect } from 'next/navigation';
 
 export async function loginSuperAdmin(prevState: any, formData: FormData) {
   const username = (formData.get('username') as string)?.trim();
   const password = formData.get('password') as string;
   if (!username || !password) {
     return { error: 'يرجى إدخال اسم المستخدم وكلمة المرور' };
   }
   if (username !== 'omar46' || password !== '123456omarA') {
     return { error: 'بيانات الدخول غير صحيحة' };
   }
   const cookieStore = await cookies();
   cookieStore.set('super_admin_session', '1', {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     maxAge: 60 * 60 * 4,
     path: '/',
   });
   cookieStore.set('super_admin_username', username, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     maxAge: 60 * 60 * 4,
     path: '/',
   });
   redirect('/super-admin');
 }
 
 export async function logoutSuperAdmin() {
   const cookieStore = await cookies();
   cookieStore.delete('super_admin_session');
   cookieStore.delete('super_admin_username');
   redirect('/super-admin/login');
 }
