'use client';

import { useState } from 'react';
import { Castle, CastleRank, CastleType, CASTLE_RANKS, CASTLE_TYPES } from '@/types/castle';
import { createCastle, updateCastle } from '@/app/actions/castles';

interface CastleFormProps {
  castle?: Castle;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CastleForm({ castle, onSuccess, onCancel }: CastleFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      if (castle) {
        formData.append('id', castle.id);
        const result = await updateCastle(null, formData);
        if (result.error) {
          setError(result.error);
        } else {
          onSuccess();
        }
      } else {
        const result = await createCastle(null, formData);
        if (result.error) {
          setError(result.error);
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">اسم القلعة</label>
          <input
            type="text"
            name="name"
            defaultValue={castle?.name}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">تصنيف القلعة</label>
          <select
            name="rank"
            defaultValue={castle?.rank || 'row1'}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {Object.entries(CASTLE_RANKS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">نوع القلعة</label>
          <select
            name="type"
            defaultValue={castle?.type || 'archers'}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {Object.entries(CASTLE_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-white font-semibold mb-3">الإحصائيات</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'giant', label: 'المارد' },
            { name: 'barracksArmor', label: 'مدرع الثكنة' },
            { name: 'archersArmor', label: 'مدرع الرماة' },
            { name: 'barracksPiercing', label: 'خارق الثكنة' },
            { name: 'archersPiercing', label: 'خارق الرماة' },
            { name: 'normalRally', label: 'الحشد العادي' },
            { name: 'superRally', label: 'الحشد السوبر' },
            { name: 'drops', label: 'عدد القطرات' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{field.label}</label>
              <input
                type="number"
                name={field.name}
                defaultValue={(castle as any)?.[field.name] ?? 0}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Readiness */}
      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-white font-semibold mb-3">الجاهزية</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'speedups50', label: 'تسريعات مسيرة 50' },
            { name: 'speedups25', label: 'تسريعات مسيرة 25' },
            { name: 'freeHours', label: 'ساعات حرة' },
            { name: 'healingHours', label: 'ساعات علاج' },
            { name: 'goldHeroFragments', label: 'قطع بطل ذهبية' },
            { name: 'redHeroFragments', label: 'قطع بطل حمراء' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{field.label}</label>
              <input
                type="number"
                name={field.name}
                defaultValue={(castle?.readiness as any)?.[field.name] ?? 0}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-white font-semibold mb-3">بيانات الحساب</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني / المعرف</label>
            <input
              type="text"
              name="accountEmail"
              defaultValue={castle?.accountEmail}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">كلمة المرور</label>
            <input
              type="text"
              name="accountPassword"
              defaultValue={castle?.accountPassword}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          disabled={loading}
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-2"
          disabled={loading}
        >
          {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
          {castle ? 'حفظ التعديلات' : 'إضافة القلعة'}
        </button>
      </div>
    </form>
  );
}
