import { getStagingRecords } from '@/app/actions/update-links';
import { getUpdateLinkById } from '@/app/actions/update-links';
import ApproveStagingForm from '@/components/server/ApproveStagingForm';
import RowReviewActions from '@/components/server/RowReviewActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params;
  const linkRes = await getUpdateLinkById(id);
  if ((linkRes as any).error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        {(linkRes as any).error}
      </div>
    );
  }
  const link = (linkRes as any).link;
  const recordsRes = await getStagingRecords(id);
  const records = (recordsRes as any).records || [];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مراجعة البيانات: {link.name}</h1>
          <p className="text-muted-foreground text-sm">ينتهي: {new Date(link.expiresAt).toLocaleString('ar')}</p>
        </div>
        <ApproveStagingForm linkId={id} />
      </div>

      <div className="bg-secondary/30 border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-secondary/50 border-b border-border text-sm text-muted-foreground">
            <tr>
              <th className="px-4 py-3">المعرف</th>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">المارد</th>
              <th className="px-4 py-3">مدرع الثكنة</th>
              <th className="px-4 py-3">مدرع الرماة</th>
              <th className="px-4 py-3">خارق الثكنة</th>
              <th className="px-4 py-3">خارق الرماة</th>
              <th className="px-4 py-3">الرالي العادي</th>
              <th className="px-4 py-3">الرالي السوبر</th>
              <th className="px-4 py-3">القطرات</th>
              <th className="px-4 py-3">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((r: any) => (
              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3">{r.fields.name ?? '—'}</td>
                <td className="px-4 py-3">{r.fields.giant ?? '—'}</td>
                <td className="px-4 py-3">{r.fields.barracksArmor ?? '—'}</td>
                <td className="px-4 py-3">{r.fields.archersArmor ?? '—'}</td>
                <td className="px-4 py-3">{r.fields.barracksPiercing ?? '—'}</td>
                <td className="px-4 py-3">{r.fields.archersPiercing ?? '—'}</td>
                <td className="px-4 py-3">{r.fields.normalRally ?? '—'}</td>
                <td className="px-4 py-3">{r.fields.superRally ?? '—'}</td>
                <td className="px-4 py-3">{r.fields.drops ?? '—'}</td>
                <td className="px-4 py-3">
                  <RowReviewActions linkId={id} castleId={r.id} />
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-muted-foreground">
                  لا توجد بيانات مرسلة لهذا الرابط حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
