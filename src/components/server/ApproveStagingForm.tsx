'use client';

import { useActionState } from 'react';
import { approveStaging } from '@/app/actions/update-links';
import { useRouter } from 'next/navigation';

export default function ApproveStagingForm({ linkId }: { linkId: string }) {
  const router = useRouter();
  const [state, action] = useActionState(approveStaging, null);
  return (
    <div className="flex items-center gap-3">
      <form
        action={async (fd) => {
          await action(fd);
          if ((state as any)?.success) {
            router.refresh();
          }
        }}
      >
        <input type="hidden" name="linkId" value={linkId} />
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">
          قبول البيانات
        </button>
      </form>
      {state?.success && (
        <span className="text-sm text-emerald-400">تم قبول البيانات بنجاح</span>
      )}
      {state?.error && (
        <span className="text-sm text-red-400">فشل قبول البيانات: {state.error}</span>
      )}
    </div>
  );
}
