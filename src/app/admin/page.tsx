export const dynamic = 'force-dynamic';
import { getCastles } from '@/app/actions/castles';
import { getMembers } from '@/app/actions/members';
import { Shield, Castle, Users, UserCog } from 'lucide-react';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase';

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;
  const email = cookieStore.get('user_email')?.value;
  const sessionIdCookie = cookieStore.get('session_id')?.value;
  if (role !== 'admin' || !email || !sessionIdCookie) {
    redirect('/login');
  }
  const record = await adminAuth.getUserByEmail(email);
  if (record.disabled) {
    redirect('/login');
  }
  const claims = (record.customClaims || {}) as Record<string, any>;
  const currentSessionId = claims.sessionId as string | undefined;
  if (!currentSessionId || currentSessionId !== sessionIdCookie) {
    redirect('/login');
  }
  const castlesRes = await getCastles(1, 10);
  const totals = (castlesRes as any).totals || { barracksArmorSum: 0, archersArmorSum: 0, castlesCount: 0 };
  const membersRes = await getMembers();
  const users = (membersRes as any).users || [];
  const totalAccounts = users.length;
  const coordinatorsCount = users.filter((u: any) => (u.customClaims || {}).role === 'coordinator').length;
  const armoredTotal = Number(totals.barracksArmorSum || 0) + Number(totals.archersArmorSum || 0);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الرئيسية</h1>
          <p className="text-muted-foreground text-sm">ملخص عام للسيرفر</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-primary font-bold">إجمالي المدرعات</p>
            <p className="text-2xl font-bold">{armoredTotal}</p>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Castle className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-indigo-300 font-bold">عدد القلاع</p>
            <p className="text-2xl font-bold text-white">{totals.castlesCount}</p>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-emerald-300 font-bold">عدد الحسابات</p>
            <p className="text-2xl font-bold text-white">{totalAccounts}</p>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <UserCog className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-purple-300 font-bold">عدد المنسقين</p>
            <p className="text-2xl font-bold text-white">{coordinatorsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
