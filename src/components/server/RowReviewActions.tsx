'use client';

import { useActionState } from 'react';
import { approveSingle, rejectSingle } from '@/app/actions/update-links';
import { useRouter } from 'next/navigation';

export default function RowReviewActions({ linkId, castleId }: { linkId: string; castleId: string }) {
  const router = useRouter();
  const [approveState, approveAction] = useActionState(approveSingle, null);
  const [rejectState, rejectAction] = useActionState(rejectSingle, null);
  return (
    <div className="flex items-center gap-2">
      <form
        action={async (fd) => {
          await approveAction(fd);
          if ((approveState as any)?.success) router.refresh();
        }}
      >
        <input type="hidden" name="linkId" value={linkId} />
        <input type="hidden" name="castleId" value={castleId} />
        <button className="px-3 py-1 rounded bg-emerald-600 text-white">سماح</button>
      </form>
      <form
        action={async (fd) => {
          await rejectAction(fd);
          if ((rejectState as any)?.success) router.refresh();
        }}
      >
        <input type="hidden" name="linkId" value={linkId} />
        <input type="hidden" name="castleId" value={castleId} />
        <button className="px-3 py-1 rounded bg-red-600 text-white">رفض</button>
      </form>
      {(approveState as any)?.error && (
        <span className="text-xs text-red-400">فشل السماح</span>
      )}
      {(rejectState as any)?.error && (
        <span className="text-xs text-red-400">فشل الرفض</span>
      )}
    </div>
  );
}
