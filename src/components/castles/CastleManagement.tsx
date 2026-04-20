'use client';

import { useState, useTransition } from 'react';
import { Castle, CASTLE_RANKS, CASTLE_TYPES } from '@/types/castle';
import Modal from '@/components/ui/Modal';
import CastleForm from './CastleForm';
import { deleteCastle } from '@/app/actions/castles';
import { useRouter } from 'next/navigation';

interface CastleManagementProps {
  castles: Castle[];
  totalPages: number;
  currentPage: number;
  totals?: {
    barracksArmorSum: number;
    archersArmorSum: number;
    castlesCount: number;
    warReadyCount: number;
  };
}

export default function CastleManagement({ castles, totalPages, currentPage, totals }: CastleManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCastle, setEditingCastle] = useState<Castle | null>(null);
  const [viewingAccount, setViewingAccount] = useState<Castle | null>(null);
  const [viewingReadiness, setViewingReadiness] = useState<Castle | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه القلعة؟')) {
      await deleteCastle(id);
    }
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`?page=${page}`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">إدارة القلاع</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
          >
            <span className="text-xl">+</span>
            إضافة قلعة
          </button>
          <button
            onClick={() => router.push('/coordinator/server-info/update-data')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            title="تحديث البيانات"
          >
            تحديث البيانات
          </button>
        </div>
      </div>

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-xs">إجمالي مدرع الثكنة</p>
            <p className="text-white text-xl font-semibold">{totals.barracksArmorSum}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-xs">إجمالي مدرع الرماة</p>
            <p className="text-white text-xl font-semibold">{totals.archersArmorSum}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-xs">إجمالي عدد القلاع</p>
            <p className="text-white text-xl font-semibold">{totals.castlesCount}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-xs">القلاع المتاحة للحرب</p>
            <p className="text-white text-xl font-semibold">{totals.warReadyCount}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-900 text-slate-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">التصنيف</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">المارد</th>
                <th className="px-4 py-3 text-center" title="مدرع الرماة / مدرع الثكنة">مدرع (ر/ث)</th>
                <th className="px-4 py-3 text-center" title="خارق الرماة / خارق الثكنة">خارق (ر/ث)</th>
                <th className="px-4 py-3 text-center">الحشد (س/ع)</th>
                <th className="px-4 py-3">القطرات</th>
                <th className="px-4 py-3 text-center">الحساب</th>
                <th className="px-4 py-3 text-center">الجاهزية</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm">
              {castles.map((castle) => (
                <tr key={castle.id} className="hover:bg-slate-700/50 transition-colors text-slate-200">
                  <td className="px-4 py-3 font-medium text-white">{castle.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      castle.rank === 'row1' ? 'bg-yellow-500/20 text-yellow-400' :
                      castle.rank === 'row2' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {CASTLE_RANKS[castle.rank]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{CASTLE_TYPES[castle.type]}</td>
                  <td className="px-4 py-3">{castle.giant}</td>
                  <td className="px-4 py-3 text-center" dir="ltr">{castle.archersArmor} / {castle.barracksArmor}</td>
                  <td className="px-4 py-3 text-center" dir="ltr">{castle.archersPiercing} / {castle.barracksPiercing}</td>
                  <td className="px-4 py-3 text-center" dir="ltr">{castle.superRally} / {castle.normalRally}</td>
                  <td className="px-4 py-3">{castle.drops}</td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => setViewingAccount(castle)}
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                      title="عرض بيانات الحساب"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a2 2 0 01-2 2M15 7H9a2 2 0 00-2 2m6-2a2 2 0 012-2m-2 2v6m0-6h.01M5 20l-4-4a2 2 0 010-2.828l9-9a2 2 0 012.828 0L20 21" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => setViewingReadiness(castle)}
                      className="text-slate-400 hover:text-green-400 transition-colors"
                      title="عرض الجاهزية"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button 
                      onClick={() => setEditingCastle(castle)}
                      className="text-blue-400 hover:text-blue-300"
                      title="تعديل"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(castle.id)}
                      className="text-red-400 hover:text-red-300"
                      title="حذف"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {castles.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                    لا توجد قلاع مضافة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
            className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white disabled:opacity-50"
          >
            السابق
          </button>
          <span className="px-3 py-1 text-slate-400 flex items-center">
            صفحة {currentPage} من {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
            className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="إضافة قلعة جديدة"
      >
        <CastleForm 
          onSuccess={() => setIsAddOpen(false)}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCastle}
        onClose={() => setEditingCastle(null)}
        title="تعديل القلعة"
      >
        {editingCastle && (
          <CastleForm 
            castle={editingCastle}
            onSuccess={() => setEditingCastle(null)}
            onCancel={() => setEditingCastle(null)}
          />
        )}
      </Modal>

      {/* Account Info Modal */}
      <Modal
        isOpen={!!viewingAccount}
        onClose={() => setViewingAccount(null)}
        title={`بيانات حساب: ${viewingAccount?.name}`}
      >
        <div className="space-y-4 text-center">
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-slate-400 text-sm mb-1">البريد الإلكتروني / المعرف</p>
            <p className="text-white text-lg font-mono select-all">{viewingAccount?.accountEmail || '-'}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg">
            <p className="text-slate-400 text-sm mb-1">كلمة المرور</p>
            <p className="text-white text-lg font-mono select-all">{viewingAccount?.accountPassword || '-'}</p>
          </div>
        </div>
      </Modal>

      {/* Readiness Modal */}
      <Modal
        isOpen={!!viewingReadiness}
        onClose={() => setViewingReadiness(null)}
        title={`جاهزية: ${viewingReadiness?.name}`}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-3 rounded">
            <p className="text-slate-400 text-xs">تسريعات مسيرة 50</p>
            <p className="text-white text-lg">{viewingReadiness?.readiness.speedups50}</p>
          </div>
          <div className="bg-slate-900 p-3 rounded">
            <p className="text-slate-400 text-xs">تسريعات مسيرة 25</p>
            <p className="text-white text-lg">{viewingReadiness?.readiness.speedups25}</p>
          </div>
          <div className="bg-slate-900 p-3 rounded">
            <p className="text-slate-400 text-xs">ساعات حرة</p>
            <p className="text-white text-lg">{viewingReadiness?.readiness.freeHours}</p>
          </div>
          <div className="bg-slate-900 p-3 rounded">
            <p className="text-slate-400 text-xs">ساعات علاج</p>
            <p className="text-white text-lg">{viewingReadiness?.readiness.healingHours}</p>
          </div>
          <div className="bg-slate-900 p-3 rounded">
            <p className="text-slate-400 text-xs">قطع بطل ذهبية</p>
            <p className="text-yellow-400 text-lg">{viewingReadiness?.readiness.goldHeroFragments}</p>
          </div>
          <div className="bg-slate-900 p-3 rounded">
            <p className="text-slate-400 text-xs">قطع بطل حمراء</p>
            <p className="text-red-400 text-lg">{viewingReadiness?.readiness.redHeroFragments}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
