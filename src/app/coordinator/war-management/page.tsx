'use client';
import { getWars, createWar, updateWar, deleteWar } from '@/app/actions/wars';
import { WAR_TYPES, War } from '@/types/war';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { ExternalLink, Edit, Trash2, UserCheck } from 'lucide-react';
import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WarManagementPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editingWar, setEditingWar] = useState<War | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Shared state for the list to trigger re-renders/fetches if needed
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    let res;
    if (editingWar) {
      res = await updateWar(editingWar.id, formData);
    } else {
      res = await createWar(null, formData);
    }

    if (res.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
      setEditingWar(null);
      setRefreshKey(prev => prev + 1); // Trigger list refresh
      startTransition(() => router.refresh());
    }
    setLoading(false);
  }

  function openCreateModal() {
    setEditingWar(null);
    setIsOpen(true);
  }

  function openEditModal(war: War) {
    setEditingWar(war);
    setIsOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">إدارة الحروب</h1>
          <p className="text-muted-foreground">إنشاء وتنظيم الحروب القادمة.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <span className="text-xl">+</span>
          إنشاء حرب
        </button>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={() => { setIsOpen(false); setEditingWar(null); }} 
        title={editingWar ? "تعديل بيانات الحرب" : "إنشاء حرب جديدة"}
      >
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">نوع الحرب</label>
              <select
                name="type"
                required
                defaultValue={editingWar?.type}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {Object.entries(WAR_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">اسم الحرب</label>
              <input
                name="name"
                type="text"
                required
                defaultValue={editingWar?.name}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">تاريخ الحرب</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={editingWar ? new Date(editingWar.date).toISOString().split('T')[0] : ''}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => { setIsOpen(false); setEditingWar(null); }}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-2"
              disabled={loading || isPending}
            >
              {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              {editingWar ? 'حفظ التعديلات' : 'إنشاء'}
            </button>
          </div>
        </form>
      </Modal>

      <WarList 
        key={refreshKey} 
        onEdit={openEditModal} 
        onRefresh={() => setRefreshKey(prev => prev + 1)} 
      />
    </div>
  );
}

function WarList({ onEdit, onRefresh }: { onEdit: (war: War) => void, onRefresh: () => void }) {
  const [data, setData] = useState<{ wars: War[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getWars();
      if ((res as any).error) setError((res as any).error);
      else setData(res as any);
    })();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الحرب؟')) return;
    
    const res = await deleteWar(id);
    if (res.error) {
      alert(res.error);
    } else {
      onRefresh();
    }
  }

  if (error) {
    return <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">{error}</div>;
  }

  if (!data) {
    return <div className="text-muted-foreground">جاري التحميل...</div>;
  }

  const wars = data.wars;

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl border border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-900 text-slate-300 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">اسم الحرب</th>
              <th className="px-4 py-3">النوع</th>
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-sm">
            {wars.map((w) => (
              <tr key={w.id} className="hover:bg-slate-700/50 transition-colors text-slate-200">
                <td className="px-4 py-3 font-medium text-white">{w.name}</td>
                <td className="px-4 py-3">{WAR_TYPES[w.type as keyof typeof WAR_TYPES] || w.type}</td>
                <td className="px-4 py-3" dir="ltr">{new Date(w.date).toLocaleDateString('ar-EG')}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link 
                      href={`/coordinator/war-management/${w.id}/attendance`}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                      title="تسجيل الحضور"
                    >
                      <UserCheck className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/coordinator/war-management/${w.id}`}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                      title="الدخول لقاعدة بيانات الحرب"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(w)}
                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                      title="تعديل معلومات الحرب"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="حذف الحرب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {wars.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">لا توجد حروب حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
