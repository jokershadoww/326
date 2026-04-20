import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { listAdmins, setAdminRoleByEmail } from '@/app/actions/admins';
import AdminActions from './AdminActions';
import { logoutSuperAdmin } from '@/app/actions/super-admin-auth';
import CreateAdminForm from './CreateAdminForm';

export default async function SuperAdminPage() {
  const cookieStore = await cookies();
  const sa = cookieStore.get('super_admin_session')?.value;
  if (sa !== '1') {
    redirect('/super-admin/login');
  }
  const adminsRes = await listAdmins();
  const admins = adminsRes.users || [];
  const errorMsg = (adminsRes as any).error;

  return (
    <div className="p-6 space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/40 border border-border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold">سوبر أدمن</h1>
            <p className="text-muted-foreground">إدارة حسابات الأدمن الخاصة بالموقع</p>
          </div>
          <div className="flex items-center gap-2">
            <details className="relative">
              <summary className="list-none">
                <button className="px-4 py-2 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25">
                  إنشاء أدمن جديد
                </button>
              </summary>
              <div className="absolute z-10 mt-2 right-0 w-[min(92vw,520px)] p-4 rounded-xl bg-background border border-border shadow-xl">
                <h3 className="text-sm font-semibold mb-3">بيانات الأدمن</h3>
                <CreateAdminForm />
              </div>
            </details>
            <details className="relative">
              <summary className="list-none">
                <button className="px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25">
                  ترقية حساب موجود
                </button>
              </summary>
              <div className="absolute z-10 mt-2 right-0 w-[min(92vw,420px)] p-4 rounded-xl bg-background border border-border shadow-xl">
                <h3 className="text-sm font-semibold mb-3">أدخل البريد لترقية الحساب إلى أدمن</h3>
                <form action={setAdminRoleByEmail} className="space-y-3">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="example@domain.com"
                    className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 px-3 outline-none"
                  />
                  <button className="px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25">
                    ترقية
                  </button>
                </form>
              </div>
            </details>
            <form action={logoutSuperAdmin}>
              <button className="px-4 py-2 rounded-lg border border-border hover:bg-secondary/40">تسجيل الخروج</button>
            </form>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
        {errorMsg && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
            {errorMsg}
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">قائمة الأدمن الحاليين</h2>
          <span className="text-xs text-muted-foreground">المجموع: {admins.length}</span>
        </div>
        <div className="bg-background/50 border border-border rounded-xl overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">البريد</th>
                <th className="px-4 py-3">حالة الحساب</th>
                <th className="px-4 py-3">تاريخ الإنشاء</th>
                <th className="px-4 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {admins.map((u: any) => (
                <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.displayName || 'بدون اسم'}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${
                        u.disabled
                          ? 'bg-red-500/15 text-red-400 border-red-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                      }`}
                    >
                      {u.disabled ? 'معطل' : 'نشط'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-center">
                      <AdminActions uid={u.uid} email={u.email || ''} isSuper={false} />
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    لا توجد حسابات أدمن حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
