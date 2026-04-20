import { getCastles } from '@/app/actions/castles';
import Link from 'next/link';

export default async function CoordinatorServerInfo({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
  const res = await getCastles(page, limit);

  if ((res as any).error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
        {(res as any).error}
      </div>
    );
  }

  const castles = (res as any).castles || [];
  const totals = (res as any).totals || { barracksArmorSum: 0, archersArmorSum: 0, castlesCount: 0, warReadyCount: 0 };
  const totalPages = (res as any).totalPages || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
        <h1 className="text-2xl font-bold mb-2">معلومات السيرفر</h1>
        <p className="text-muted-foreground">نظرة عامة على القلاع والجهوزية والإحصائيات</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-300 font-bold">عدد القلاع</p>
          <p className="text-2xl font-bold text-white">{totals.castlesCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-300 font-bold">القلاع الجاهزة للحرب</p>
          <p className="text-2xl font-bold text-white">{totals.warReadyCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs text-indigo-300 font-bold">مجموع دروع الثكنة</p>
          <p className="text-2xl font-bold text-white">{totals.barracksArmorSum}</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-xs text-purple-300 font-bold">مجموع دروع الرماة</p>
          <p className="text-2xl font-bold text-white">{totals.archersArmorSum}</p>
        </div>
      </div>

      <div className="bg-secondary/30 border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold text-foreground">اسم القلعة</th>
                <th className="px-4 py-3 font-bold text-foreground">الصف</th>
                <th className="px-4 py-3 font-bold text-foreground">النوع</th>
                <th className="px-4 py-3 font-bold text-foreground">العملاق</th>
                <th className="px-4 py-3 font-bold text-foreground">دروع الثكنة</th>
                <th className="px-4 py-3 font-bold text-foreground">دروع الرماة</th>
                <th className="px-4 py-3 font-bold text-foreground">اختراق الثكنة</th>
                <th className="px-4 py-3 font-bold text-foreground">اختراق الرماة</th>
                <th className="px-4 py-3 font-bold text-foreground">الرالي العادي</th>
                <th className="px-4 py-3 font-bold text-foreground">الرالي السوبر</th>
                <th className="px-4 py-3 font-bold text-foreground">الدروب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {castles.map((c: any) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.rank}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.giant}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.barracksArmor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.archersArmor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.barracksPiercing}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.archersPiercing}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.normalRally}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.superRally}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.drops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between bg-secondary/30 border border-border rounded-lg px-4 py-3">
        <Link 
          href={`?page=${Math.max(1, currentPage - 1)}`} 
          className={`px-3 py-2 rounded ${currentPage > 1 ? 'bg-secondary/50 hover:bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground cursor-not-allowed'}`}
          aria-disabled={currentPage <= 1}
        >
          الصفحة السابقة
        </Link>
        <div className="text-muted-foreground">
          صفحة {currentPage} من {totalPages} — إجمالي القلاع: {totals.castlesCount}
        </div>
        <Link 
          href={`?page=${Math.min(totalPages, currentPage + 1)}`} 
          className={`px-3 py-2 rounded ${currentPage < totalPages ? 'bg-secondary/50 hover:bg-secondary text-foreground' : 'bg-secondary/30 text-muted-foreground cursor-not-allowed'}`}
          aria-disabled={currentPage >= totalPages}
        >
          الصفحة التالية
        </Link>
      </div>
    </div>
  );
}
