import CoordinatorServerInfo from '@/components/server/CoordinatorServerInfo';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase';
import Link from 'next/link';

export default async function AdminServerPage({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;
  const email = cookieStore.get('user_email')?.value;
  if (role !== 'admin' || !email) {
    redirect('/login');
  }
  const record = await adminAuth.getUserByEmail(email);
  if (record.disabled) {
    redirect('/login');
  }
  const sp = searchParams ? await searchParams : undefined;
  const pageParam = sp?.page || '1';
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
 

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
        <h1 className="text-2xl font-bold mb-2">حالة السيرفر</h1>
        <p className="text-muted-foreground">هذه الصفحة تستعرض كامل معلومات السيرفر الخاصة بالمنسق</p>
      </div>

      

      <CoordinatorServerInfo page={page} />
    </div>
  );
}
