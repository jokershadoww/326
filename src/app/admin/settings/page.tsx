 'use client';
 
 import { useActionState } from 'react';
 import { autoFixAction } from '@/app/actions/maintenance';
 import { Wrench, RefreshCcw } from 'lucide-react';
 
 export default function AdminSettingsPage() {
   const [state, action, pending] = useActionState(autoFixAction, null);
   return (
     <div className="space-y-6">
       <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
         <h1 className="text-2xl font-bold mb-2">الإعدادات</h1>
         <p className="text-muted-foreground">إعدادات مدير النظام والإجراءات المتقدمة</p>
       </div>
 
       <div className="p-6 rounded-2xl bg-secondary/30 border border-border space-y-4">
         <h2 className="text-lg font-semibold flex items-center gap-2">
           <Wrench className="w-5 h-5 text-primary" />
           التصحيح التلقائي
         </h2>
         <p className="text-sm text-muted-foreground">
           يقوم هذا الإجراء بمزامنة ارتباطات الحسابات، وتحديث حالة التابعين حسب حالة الأدمن، وإعادة تحديث صفحات الموقع.
         </p>
         <form action={action} className="flex items-center gap-3">
           <button
             type="submit"
             disabled={pending}
             className="px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-50 flex items-center gap-2"
             title="تشغيل التصحيح التلقائي"
           >
             <RefreshCcw className="w-5 h-5" />
             {pending ? 'جارٍ التنفيذ...' : 'تشغيل التصحيح التلقائي'}
           </button>
           {state?.success && <span className="text-emerald-400 text-sm">{state.success}</span>}
           {state?.error && <span className="text-red-400 text-sm">{state.error}</span>}
         </form>
       </div>
     </div>
   );
 }
