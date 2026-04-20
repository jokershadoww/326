
import { getAllCastles } from '@/app/actions/castles';
import { getWarAttendance } from '@/app/actions/attendance';
import { getWarById } from '@/app/actions/wars';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import CopyLinkButton from './CopyLinkButton';
import DownloadPDFButton from './DownloadPDFButton';
import { Toaster } from 'react-hot-toast';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export default async function AttendancePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const pageParam = searchParams ? (await searchParams).page : undefined;
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const pageSize = 10;
  
  const [warRes, castlesRes, attendanceRes] = await Promise.all([
    getWarById(id),
    getAllCastles(),
    getWarAttendance(id)
  ]);

  if (warRes.error || !warRes.war) {
    return <div className="text-red-500">الحرب غير موجودة</div>;
  }

  if (castlesRes.error || !castlesRes.castles) {
    return <div className="text-red-500">خطأ في جلب القلاع</div>;
  }

  const attendanceMap = new Map();
  attendanceRes.attendance?.forEach(record => {
    attendanceMap.set(record.castleId, record);
  });
  
  const totalCastles = castlesRes.castles.length;
  const totalPages = Math.max(1, Math.ceil(totalCastles / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const visibleCastles = castlesRes.castles.slice(start, end);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">تسجيل حضور الحرب: {warRes.war.name}</h1>
          <p className="text-slate-400">متابعة الحضور والغياب للقلاع المسجلة</p>
        </div>
        <div className="flex gap-2">
          <DownloadPDFButton 
            warName={warRes.war.name} 
            castles={castlesRes.castles} 
            attendance={attendanceRes.attendance || []} 
          />
          <CopyLinkButton warId={id} />
        </div>
      </div>

      <div id="attendance-capture" className="bg-slate-800 rounded-lg overflow-hidden shadow-xl border border-slate-700">
        <div className="overflow-x-auto">
          <table id="attendance-table" className="w-full text-right">
            <thead className="bg-slate-900 text-slate-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">حالة الحضور</th>
                <th className="px-4 py-3">اسم القلعة</th>
                <th className="px-4 py-3">التصنيف</th>
                <th className="px-4 py-3">اسم اللاعب</th>
                <th className="px-4 py-3">وقت التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm">
              {visibleCastles.map((castle: { id: string; name: string; rank: string }) => {
                const record = attendanceMap.get(castle.id);
                const attended = !!record;

                return (
                  <tr key={castle.id} className={`transition-colors ${attended ? 'bg-green-900/10 hover:bg-green-900/20' : 'hover:bg-slate-700/50'}`}>
                    <td className="px-4 py-3">
                      {attended ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <Check size={18} />
                          <span>حاضر</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 opacity-50">
                          <X size={18} />
                          <span>غائب</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{castle.name}</td>
                    <td className="px-4 py-3 text-slate-400">{castle.rank}</td>
                    <td className="px-4 py-3 text-white">
                      {attended ? record.playerName : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-400" dir="ltr">
                      {attended ? new Date(record.timestamp).toLocaleString('ar-EG') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3">
        <Link 
          href={`?page=${Math.max(1, currentPage - 1)}`} 
          className={`px-3 py-2 rounded ${currentPage > 1 ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'}`}
          aria-disabled={currentPage <= 1}
        >
          الصفحة السابقة
        </Link>
        <div className="text-slate-300">
          صفحة {currentPage} من {totalPages} — إجمالي القلاع: {totalCastles}
        </div>
        <Link 
          href={`?page=${Math.min(totalPages, currentPage + 1)}`} 
          className={`px-3 py-2 rounded ${currentPage < totalPages ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'}`}
          aria-disabled={currentPage >= totalPages}
        >
          الصفحة التالية
        </Link>
      </div>
      <Toaster position="bottom-left" />
    </div>
  );
}
