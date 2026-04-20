import { getUpdateLinks } from '@/app/actions/update-links';
import UpdateDataDashboard from '@/components/server/UpdateDataDashboard';

export default async function UpdateDataPage() {
  const res = await getUpdateLinks();
  const links = (res as any).links || [];
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
        <h1 className="text-2xl font-bold">تحديث البيانات</h1>
        <p className="text-muted-foreground text-sm">
          إدارة وإنشاء روابط لتحديث بيانات القلاع.
        </p>
      </div>
      <UpdateDataDashboard links={links} />
      <div className="p-6 rounded-xl bg-secondary/30 border border-border">
        <h2 className="text-lg font-bold mb-2">طلبات التحديث</h2>
        <p className="text-muted-foreground text-sm">سيتم إنشاؤها لاحقاً.</p>
      </div>
    </div>
  );
}
