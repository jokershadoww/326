import { getUpdateLinkById } from '@/app/actions/update-links';
import { getAllCastles } from '@/app/actions/castles';
import LinkBulkUpdateForm from '@/components/server/LinkBulkUpdateForm';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LinkUpdatePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const rank = (sp.rank as string) || '';

  const res = await getUpdateLinkById(id);
  if ((res as any).error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        {(res as any).error}
      </div>
    );
  }
  const link = (res as any).link;
  const allCastlesRes = await getAllCastles();
  const allCastles = (allCastlesRes as any).castles || [];
  const ranks = [
    { value: 'row1', label: 'صف أول' },
    { value: 'row2', label: 'صف ثاني' },
    { value: 'row3', label: 'صف ثالث' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">رابط التحديث: {link.name}</h1>
          <p className="text-muted-foreground text-sm">ينتهي: {new Date(link.expiresAt).toLocaleString('ar')}</p>
        </div>
        <div className="flex gap-2">
          {ranks.map(r => (
            <Link
              key={r.value}
              href={`/coordinator/server-info/update-data/links/${id}?rank=${r.value}`}
              className={`px-3 py-2 rounded ${rank === r.value ? 'bg-primary text-white' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {!rank && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border text-muted-foreground">
          اختر تصنيف القلاع لبدء التحديث.
        </div>
      )}

      {rank && (
        <LinkBulkUpdateForm
          linkId={id}
          rank={rank}
          castles={allCastles.filter((c: any) => c.rank === rank)}
        />
      )}
    </div>
  );
}
