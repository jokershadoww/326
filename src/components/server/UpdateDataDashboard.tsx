'use client';

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import { createUpdateLink, updateUpdateLink, deleteUpdateLink } from '@/app/actions/update-links';
import type { UpdateLink } from '@/types/update-link';
import { useRouter } from 'next/navigation';

export default function UpdateDataDashboard({ links }: { links: UpdateLink[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createState, createAction] = useActionState(createUpdateLink, null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editState, editAction] = useActionState(updateUpdateLink, null);
  const [deleteState, deleteAction] = useActionState(deleteUpdateLink, null);
  const [copied, setCopied] = useState<string | null>(null);
  const origin = useMemo(() => {
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
  }, []);
  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(null), 1500);
      return () => clearTimeout(t);
    }
  }, [copied]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">روابط تحديث البيانات</h2>
          <button
            onClick={() => setEditId('create')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg"
          >
            إنشاء رابط تحديث
          </button>
        </div>
        {editId === 'create' && (
          <form action={createAction} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              name="name"
              placeholder="اسم الرابط"
              className="bg-background border border-border rounded px-3 py-2"
              required
            />
            <input
              name="expiresAt"
              type="datetime-local"
              className="bg-background border border-border rounded px-3 py-2"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                إنشاء
              </button>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded"
              >
                إلغاء
              </button>
            </div>
            {createState?.error && (
              <div className="text-red-400 text-sm">{createState.error}</div>
            )}
          </form>
        )}
      </div>

      <div className="bg-secondary/30 border border-border rounded-xl">
        <table className="w-full text-right">
          <thead className="bg-secondary/50 border-b border-border text-sm text-muted-foreground">
            <tr>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">انتهاء</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">الاستخدام</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {links.map((l) => (
              <tr key={l.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3">{new Date(l.expiresAt).toLocaleString('ar')}</td>
                <td className="px-4 py-3">{l.disabled ? 'معطل' : 'مفعل'}</td>
                <td className="px-4 py-3">{l.submissionsCount || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white"
                      onClick={() => router.push(`/coordinator/server-info/update-data/links/${l.id}`)}
                    >
                      فتح
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-indigo-600 text-white"
                      onClick={() => router.push(`/coordinator/server-info/update-data/links/${l.id}/review`)}
                      title="مراجعة البيانات المرسلة"
                    >
                      مراجعة
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-emerald-600 text-white"
                      onClick={async () => {
                        const url = `${origin}/update-castles/${l.id}`;
                        try {
                          await navigator.clipboard.writeText(url);
                          setCopied(l.id);
                        } catch {
                          // fallback
                          const ta = document.createElement('textarea');
                          ta.value = url;
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand('copy');
                          document.body.removeChild(ta);
                          setCopied(l.id);
                        }
                      }}
                      title="نسخ الرابط العام"
                    >
                      نسخ الرابط
                    </button>
                    {copied === l.id && (
                      <span className="text-xs text-emerald-400">تم النسخ</span>
                    )}
                    <button
                      className="px-3 py-1 rounded bg-slate-700 text-white"
                      onClick={() => setEditId(l.id)}
                    >
                      تعديل
                    </button>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={l.id} />
                      <button className="px-3 py-1 rounded bg-red-600 text-white">
                        حذف
                      </button>
                    </form>
                    <form action={editAction}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="disabled" value={String(!l.disabled)} />
                      <button className="px-3 py-1 rounded bg-indigo-600 text-white">
                        {l.disabled ? 'تفعيل' : 'تعطيل'}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                  لا توجد روابط حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editId && editId !== 'create' && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <h3 className="font-bold mb-3">تعديل الرابط</h3>
          <form action={editAction} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="hidden" name="id" value={editId || ''} />
            <input
              name="name"
              placeholder="اسم الرابط"
              className="bg-background border border-border rounded px-3 py-2"
            />
            <input
              name="expiresAt"
              type="datetime-local"
              className="bg-background border border-border rounded px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded"
              >
                إلغاء
              </button>
            </div>
            {editState?.error && (
              <div className="text-red-400 text-sm">{editState.error}</div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
