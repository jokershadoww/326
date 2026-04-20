import { getUpdateLinkById } from '@/app/actions/update-links';
import { getAllCastles } from '@/app/actions/castles';
import PublicSingleCastleUpdate from '@/components/server/PublicSingleCastleUpdate';
import { getStagingCastles } from '@/app/actions/update-links';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PublicUpdateCastlesPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const rank = (sp.rank as string) || '';

  const res = await getUpdateLinkById(id);
  if ((res as any).error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full p-6 rounded-2xl bg-secondary/30 border border-border text-center">
          <h1 className="text-xl font-bold mb-2">الرابط غير متاح</h1>
          <p className="text-muted-foreground">{(res as any).error}</p>
        </div>
      </div>
    );
  }

  const link = (res as any).link;
  const allCastlesRes = await getAllCastles();
  const allCastles = (allCastlesRes as any).castles || [];
  const staged = await getStagingCastles(id);
  const excludedIds = (staged as any).ids || [];
  const ranks = [
    { value: 'row1', label: 'صف أول' },
    { value: 'row2', label: 'صف ثاني' },
    { value: 'row3', label: 'صف ثالث' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-background/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold">تحديث بيانات القلاع</h1>
          <div className="text-xs text-muted-foreground">
            ينتهي: {new Date(link.expiresAt).toLocaleString('ar')}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">رابط: {link.name}</p>
              <p className="text-xs text-muted-foreground">اختر التصنيف للمتابعة</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ranks.map((r) => (
                <a
                  key={r.value}
                  href={`?rank=${r.value}`}
                  className={`px-3 py-2 rounded ${rank === r.value ? 'bg-primary text-white' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}
                >
                  {r.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {!rank && (
          <div className="p-4 rounded-xl bg-secondary/30 border border-border text-muted-foreground text-center">
            اختر تصنيف القلاع لبدء التحديث.
          </div>
        )}

        {rank && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-secondary/30 border border-border text-sm text-muted-foreground">
              أدخل القيم الجديدة فقط؛ الحقول الفارغة لن تؤثر على البيانات الحالية.
            </div>
            <PublicSingleCastleUpdate
              linkId={id}
              rank={rank}
              castles={allCastles.filter((c: any) => c.rank === rank)}
              excludedIds={excludedIds}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-muted-foreground text-xs">
        © 2024 جميع الحقوق محفوظة - omar46
      </footer>
    </div>
  );
}
