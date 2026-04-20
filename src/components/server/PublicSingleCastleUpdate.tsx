'use client';

import type { Castle } from '@/types/castle';
import { useActionState, useMemo, useState } from 'react';
import { submitSingleUpdate } from '@/app/actions/update-links';

export default function PublicSingleCastleUpdate({
  linkId,
  rank,
  castles,
  excludedIds,
}: {
  linkId: string;
  rank: string;
  castles: Castle[];
  excludedIds: string[];
}) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [state, formAction] = useActionState(submitSingleUpdate, null);
  const [submitted, setSubmitted] = useState(false);
  const [localExcluded, setLocalExcluded] = useState<string[]>([]);
  const available = useMemo(() => castles.filter(c => !excludedIds.concat(localExcluded).includes(c.id)), [castles, excludedIds, localExcluded]);

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

  const selectedCastle = available.find(c => c.id === selectedId);

  const buildPayload = () => {
    const out: any = {};
    for (const f of fields) {
      const el = document.getElementById(`${f.key}`) as HTMLInputElement | null;
      if (!el) continue;
      const val = el.value;
      if (val === '' || val === undefined) continue;
      if (f.key.startsWith('readiness.')) {
        const subKey = f.key.split('.')[1];
        out.readiness = out.readiness || {};
        out.readiness[subKey] = f.type === 'number' ? Number(val) : val;
      } else {
        out[f.key] = f.type === 'number' ? Number(val) : val;
      }
    }
    return JSON.stringify(out);
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border text-center space-y-3">
        <h3 className="text-xl font-bold">تم إرسال البيانات بنجاح</h3>
        <p className="text-muted-foreground">يمكنك إرسال تحديث آخر بالضغط على الزر التالي</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSelectedId('');
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg"
        >
          إرسال تحديث آخر
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            className="w-full sm:w-auto bg-background border border-border rounded px-3 py-2"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">اختر قلعة من {rank}</option>
            {available.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {available.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">لا توجد قلاع متاحة للتحديث في هذا التصنيف.</p>
        )}
      </div>

      {selectedCastle && (
        <form
          action={async (fd) => {
            await formAction(fd);
            if (!state?.error) {
              setLocalExcluded((prev) => prev.concat(selectedCastle.id));
              setSelectedId('');
              setSubmitted(true);
            }
          }}
          className="space-y-3"
        >
          <input type="hidden" name="linkId" value={linkId} />
          <input type="hidden" name="castleId" value={selectedCastle.id} />
          <input type="hidden" name="payload" id="payload-hidden" value="" />
          {state?.error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {state.error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-sm text-muted-foreground">{f.label}</label>
                <input
                  id={f.key}
                  type={f.type}
                  className="w-full bg-background border border-border rounded px-3 py-2"
                  placeholder=" "
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              onClick={() => {
                const payloadEl = document.getElementById('payload-hidden') as HTMLInputElement;
                if (payloadEl) payloadEl.value = buildPayload();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg"
            >
              تحديث
            </button>
            <button
              type="button"
              onClick={() => setSelectedId('')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
