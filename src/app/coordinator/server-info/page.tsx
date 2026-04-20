import { getCastles } from '@/app/actions/castles';
import CastleManagement from '@/components/castles/CastleManagement';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServerInfoPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const limit = 10;
  
  const { castles, totalPages, error, totals } = await getCastles(page, limit);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">معلومات السيرفر</h1>
        <p className="text-slate-400">إدارة ومتابعة قلاع السيرفر</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <CastleManagement 
          castles={castles} 
          totalPages={totalPages ?? 1} 
          currentPage={page}
          totals={totals}
        />
      )}
    </div>
  );
}
