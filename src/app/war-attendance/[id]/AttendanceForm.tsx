'use client';

import { useState, useTransition } from 'react';
import { registerAttendance } from '@/app/actions/attendance';
import { Castle, CASTLE_RANKS, CastleRank } from '@/types/castle';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AttendanceFormProps {
  warId: string;
  availableCastles: Castle[];
}

export default function AttendanceForm({ warId, availableCastles }: AttendanceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRank, setSelectedRank] = useState<CastleRank | ''>('');
  const [selectedCastleId, setSelectedCastleId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Filter castles based on selected rank
  const filteredCastles = availableCastles.filter(c => c.rank === selectedRank);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCastleId || !playerName) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }

    const castle = availableCastles.find(c => c.id === selectedCastleId);
    if (!castle) return;

    startTransition(async () => {
      const result = await registerAttendance(warId, {
        castleId: castle.id,
        castleName: castle.name,
        rank: castle.rank,
        playerName: playerName,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setSubmitted(true);
        toast.success('تم تسجيل الحضور بنجاح');
      }
    });
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-slate-800 rounded-lg shadow-xl text-center border border-green-500/30">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">تم تسجيل الحضور!</h2>
        <p className="text-slate-300 mb-6">شكراً لك، {playerName}. تم تسجيل حضورك بقلعة «{availableCastles.find(c => c.id === selectedCastleId)?.name}».</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          تسجيل حضور آخر
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">تسجيل حضور الحرب</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rank Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">تصنيف القلعة</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CASTLE_RANKS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setSelectedRank(key as CastleRank); setSelectedCastleId(''); }}
                className={`p-2 rounded text-sm transition-colors border ${
                  selectedRank === key 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Castle Selection */}
        {selectedRank && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium text-slate-300 mb-2">اسم القلعة</label>
            <select
              value={selectedCastleId}
              onChange={(e) => setSelectedCastleId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">اختر القلعة...</option>
              {filteredCastles.map((castle) => (
                <option key={castle.id} value={castle.id}>
                  {castle.name}
                </option>
              ))}
            </select>
            {filteredCastles.length === 0 && (
              <p className="text-yellow-500 text-xs mt-1">لا توجد قلاع متاحة في هذا التصنيف (أو تم تسجيلها جميعاً).</p>
            )}
          </div>
        )}

        {/* Player Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">اسم اللاعب</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="اكتب اسمك هنا..."
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!selectedCastleId || !playerName || isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            'تسجيل الحضور'
          )}
        </button>
      </form>
    </div>
  );
}
