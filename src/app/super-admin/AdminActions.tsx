 'use client';
 
 import { useActionState, useState } from 'react';
 import { disableAdmin, enableAdmin, deleteAdmin, updateAdmin, resetAdminPasswordAction } from '@/app/actions/admins';
 import { Pencil, Eye } from 'lucide-react';
 
 export default function AdminActions({ uid, email, isSuper }: { uid: string; email: string; isSuper: boolean }) {
   const [, disableAction, disablePending] = useActionState(disableAdmin, null);
   const [, enableAction, enablePending] = useActionState(enableAdmin, null);
   const [, deleteAction, deletePending] = useActionState(deleteAdmin, null);
   const [, updateAction, updatePending] = useActionState(updateAdmin, null);
   const [resetState, resetAction, resetPending] = useActionState(resetAdminPasswordAction, null);
   const [openEdit, setOpenEdit] = useState(false);
   const [openView, setOpenView] = useState(false);
 
   return (
     <div className="space-y-2">
       <div className="flex items-center justify-center gap-2">
         <form action={disableAction}>
           <input type="hidden" name="uid" value={uid} />
           <input type="hidden" name="email" value={email} />
           <button
             type="submit"
             disabled={disablePending || isSuper}
             className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-50"
             title={isSuper ? 'لا يمكن تعطيل السوبر أدمن' : 'تعطيل'}
           >
             تعطيل
           </button>
         </form>
         <form action={enableAction}>
           <input type="hidden" name="uid" value={uid} />
           <input type="hidden" name="email" value={email} />
           <button
             type="submit"
             disabled={enablePending || isSuper}
             className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50"
             title={isSuper ? 'لا يمكن تعديل حالة السوبر أدمن' : 'تفعيل'}
           >
             تفعيل
           </button>
         </form>
         <form action={deleteAction}>
           <input type="hidden" name="uid" value={uid} />
           <input type="hidden" name="email" value={email} />
           <button
             type="submit"
             disabled={deletePending || isSuper}
             className="px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50"
             title={isSuper ? 'لا يمكن حذف السوبر أدمن' : 'حذف'}
           >
             حذف
           </button>
         </form>
         <button
           type="button"
           onClick={() => setOpenEdit((v) => !v)}
           className="p-2 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25"
           title="تعديل"
         >
           <Pencil className="w-5 h-5" />
         </button>
         <button
           type="button"
           onClick={() => setOpenView((v) => !v)}
           className="p-2 rounded bg-slate-500/15 text-slate-200 border border-slate-500/25 hover:bg-slate-500/25"
           title="عرض"
         >
           <Eye className="w-5 h-5" />
         </button>
       </div>
 
       {openEdit && (
         <form action={updateAction} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-background/30 p-3 rounded-lg border border-border">
           <input type="hidden" name="uid" value={uid} />
           <input type="hidden" name="oldEmail" value={email} />
           <input
             name="displayName"
             placeholder="الاسم الجديد"
             className="px-2 py-1 rounded border border-border bg-background/50"
           />
           <input
             name="email"
             placeholder="البريد الجديد"
             type="email"
             className="px-2 py-1 rounded border border-border bg-background/50"
           />
           <input
             name="password"
             placeholder="كلمة مرور جديدة (اختياري)"
             type="password"
             className="px-2 py-1 rounded border border-border bg-background/50"
           />
           <button
             type="submit"
             disabled={updatePending}
             className="px-3 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-50"
           >
             حفظ
           </button>
         </form>
       )}
 
       {openView && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-background/30 p-3 rounded-lg border border-border">
           <input
             readOnly
             value={email}
             className="px-2 py-1 rounded border border-border bg-background/50"
           />
           <input
             readOnly
             value={resetState?.tempPassword ? resetState.tempPassword : 'كلمة المرور غير قابلة للعرض'}
             className="px-2 py-1 rounded border border-border bg-background/50"
           />
           <form action={resetAction} className="contents">
             <input type="hidden" name="uid" value={uid} />
             <button
               type="submit"
               disabled={resetPending}
               className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-50"
             >
               توليد كلمة مرور مؤقتة
             </button>
           </form>
           <button
             type="button"
             onClick={() => navigator.clipboard.writeText(resetState?.tempPassword || '')}
             disabled={!resetState?.tempPassword}
             className="px-3 py-1 rounded bg-zinc-500/10 text-zinc-300 border border-zinc-500/20 hover:bg-zinc-500/20 disabled:opacity-50"
           >
             نسخ كلمة المرور
           </button>
         </div>
       )}
     </div>
   );
 }
