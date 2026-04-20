import Link from 'next/link';
import { LayoutPanelTop, User, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase';

export default async function MemberDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;
  const email = cookieStore.get('user_email')?.value;
  const sessionIdCookie = cookieStore.get('session_id')?.value;
  if (role !== 'player' || !email || !sessionIdCookie) {
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-foreground">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <LayoutPanelTop className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">لوحة العضو</h1>
              <p className="text-xs text-muted-foreground">مرحبا بك في حسابك</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-foreground flex items-center gap-2">
              <LogOut className="w-4 h-4" /> خروج
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-300" />
              </div>
              <h2 className="text-lg font-bold">بيانات الحساب</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              هذا هو مركز حسابك. سنضيف لاحقًا معلوماتك الشخصية وروابط سريعة للمهام.
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-3">روابط سريعة</h2>
            <div className="space-y-2">
              <Link href="/" className="block px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                الصفحة الرئيسية
              </Link>
              <Link href="/login" className="block px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                تغيير الحساب
              </Link>
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-3">التحديثات</h2>
            <p className="text-sm text-muted-foreground">
              سنضيف ميزات العضو تدريجيًا: المشاركة في الحروب، متابعة حضورك، وتنبيهات مخصصة.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
