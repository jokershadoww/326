'use client';

import type { Castle } from '@/types/castle';
import { useActionState } from 'react';
import { submitBulkUpdates } from '@/app/actions/update-links';
import { useMemo } from 'react';

export default function LinkBulkUpdateForm({ linkId, rank, castles }: { linkId: string; rank: string; castles: Castle[] }) {
  const [state, formAction] = useActionState(submitBulkUpdates, null);

  const fields = useMemo(() => ([
    { key: 'name', label: 'الاسم', type: 'text' },
    { key: 'giant', label: 'المارد', type: 'number' },
    { key: 'barracksArmor', label: 'مدرع الثكنة', type: 'number' },
    { key: 'archersArmor', label: 'مدرع الرماة', type: 'number' },
    { key: 'barracksPiercing', label: 'خارق الثكنة', type: 'number' },
    { key: 'archersPiercing', label: 'خارق الرماة', type: 'number' },
    { key: 'normalRally', label: 'الرالي العادي', type: 'number' },
    { key: 'superRally', label: 'الرالي السوبر', type: 'number' },
    { key: 'drops', label: 'القطرات', type: 'number' },
    { key: 'accountEmail', label: 'البريد/المعرف', type: 'text' },
    { key: 'accountPassword', label: 'كلمة المرور', type: 'text' },
    { key: 'readiness.speedups50', label: 'تسريعات 50', type: 'number' },
    { key: 'readiness.speedups25', label: 'تسريعات 25', type: 'number' },
    { key: 'readiness.freeHours', label: 'ساعات حرة', type: 'number' },
    { key: 'readiness.healingHours', label: 'ساعات علاج', type: 'number' },
    { key: 'readiness.goldHeroFragments', label: 'قطع ذهبية', type: 'number' },
    { key: 'readiness.redHeroFragments', label: 'قطع حمراء', type: 'number' },
  ]), []);

  const buildPayload = () => {
    const updates: Array<{ id: string; fields: Partial<Castle> }> = [];
    for (const c of castles) {
      const fieldsObj: any = {};
      for (const f of fields) {
        const el = (document.getElementById(`${c.id}:${f.key}`) as HTMLInputElement | null);
        if (!el) continue;
        const val = el.value;
        if (val === '' || val === undefined) continue;
        // nested readiness keys
        if (f.key.startsWith('readiness.')) {
          const subKey = f.key.split('.')[1];
          fieldsObj.readiness = fieldsObj.readiness || {};
          fieldsObj.readiness[subKey] = Number(val);
        } else {
          fieldsObj[f.key] = f.type === 'number' ? Number(val) : val;
        }
      }
      if (Object.keys(fieldsObj).length) {
        updates.push({ id: c.id, fields: fieldsObj });
      }
    }
    return JSON.stringify(updates);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="linkId" value={linkId} />
      <input type="hidden" name="rank" value={rank} />
      <input type="hidden" name="payload" value="" id="payload-hidden" />
      {state?.error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          تم تنفيذ التحديث بنجاح
        </div>
      )}

      <div className="bg-secondary/30 border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-secondary/50 border-b border-border text-sm text-muted-foreground">
            <tr>
              <th className="px-4 py-3">القلعة</th>
              {fields.map((f) => (
                <th key={f.key} className="px-4 py-3">{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {castles.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                {fields.map((f) => (
                  <td key={f.key} className="px-2 py-2">
                    <input
                      id={`${c.id}:${f.key}`}
                      type={f.type}
                      className="w-36 bg-background border border-border rounded px-2 py-1 text-sm"
                      placeholder=" "
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          onClick={(e) => {
            const payloadEl = document.getElementById('payload-hidden') as HTMLInputElement;
            if (payloadEl) payloadEl.value = buildPayload();
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg"
        >
          حفظ التحديثات
        </button>
      </div>
    </form>
  );
}
