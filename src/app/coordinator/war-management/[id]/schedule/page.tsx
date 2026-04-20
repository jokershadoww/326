import { getWarById } from '@/app/actions/wars';
import { getWarSchedule } from '@/app/actions/war-schedule';
import { getAllCastles } from '@/app/actions/castles';
import WarScheduleEditor from '@/components/war/WarScheduleEditor';
import { notFound } from 'next/navigation';
import type { WarSchedule } from '@/types/war-schedule';

export default async function WarSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [warRes, scheduleRes, castlesRes] = await Promise.all([
    getWarById(id),
    getWarSchedule(id),
    getAllCastles()
  ]);

  if (warRes.error || !warRes.war) {
    notFound();
  }

  const castles = castlesRes.castles || [];
  const schedule: WarSchedule = scheduleRes.schedule || {
    warId: id,
    enemyPlatforms: [],
    enemyTiles: [],
    supers: []
  };
  
  return (
    <div className="container mx-auto py-6">
      <WarScheduleEditor 
        war={warRes.war}
        initialSchedule={schedule} 
        castles={castles} 
      />
    </div>
  );
}
