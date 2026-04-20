import { getAllCastles } from '@/app/actions/castles';
import { LayoutGrid, Shield, Target, CheckCircle2, Building2 } from 'lucide-react';

export default async function CoordinatorPage() {
  const res = await getAllCastles();
  const castles = res.castles || [];

  const platformsCount = castles.filter((c: any) => c.rank === 'row1').length;
  const barracksArmorSum = castles.reduce((acc: number, c: any) => acc + (Number(c.barracksArmor) || 0), 0);
  const archersArmorSum = castles.reduce((acc: number, c: any) => acc + (Number(c.archersArmor) || 0), 0);
  const availableCastles = castles.filter((c: any) => (Number(c.drops) || 0) >= 193).length;
  const castlesCount = castles.length;

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/30 to-background border border-primary/10 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">لوحة المنسق</h1>
        <p className="text-lg text-muted-foreground">نظرة عامة سريعة على حالة السيرفر</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold">إجمالي المنصات</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">{platformsCount}</p>
          <p className="text-xs text-blue-300 mt-2">عدد قلاع الصف الأول</p>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">مدرع الثكنة</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">{barracksArmorSum}</p>
          <p className="text-xs text-emerald-300 mt-2">إجمالي عددالمدرع للثكنة</p>
        </div>

        <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/15 flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold">مدرع الرماة</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">{archersArmorSum}</p>
          <p className="text-xs text-purple-300 mt-2">إجمالي عدد المدرع للرماة</p>
        </div>

        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold">القلاع المتاحة</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">{availableCastles}</p>
          <p className="text-xs text-amber-300 mt-2">القلاع الجاهزة للحرب</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-500/10 border border-slate-500/20 hover:border-slate-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-600/15 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold">إجمالي القلاع</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">{castlesCount}</p>
          <p className="text-xs text-slate-300 mt-2">إجمالي عدد قلاع السيرفر</p>
        </div>
      </div>
    </div>
  );
}
