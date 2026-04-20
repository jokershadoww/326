
import { getAvailableCastles } from '@/app/actions/attendance';
import { getWarById } from '@/app/actions/wars';
import AttendanceForm from './AttendanceForm';
import { Toaster } from 'react-hot-toast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WarAttendancePage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch war details to ensure it exists and maybe show title
  const { war, error: warError } = await getWarById(id);
  
  if (warError || !war) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-red-500 text-center">
          <h1 className="text-2xl font-bold mb-2">عذراً</h1>
          <p>لم يتم العثور على الحرب المطلوبة.</p>
        </div>
      </div>
    );
  }

  const { castles, error: castlesError } = await getAvailableCastles(id);

  if (castlesError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-red-500 text-center">
          <p>حدث خطأ أثناء تحميل البيانات.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{war.name}</h1>
        <p className="text-slate-400">تاريخ الحرب: {new Date(war.date).toLocaleDateString('ar-EG')}</p>
      </div>
      
      <AttendanceForm warId={id} availableCastles={castles} />
      <Toaster position="bottom-center" />
    </div>
  );
}
