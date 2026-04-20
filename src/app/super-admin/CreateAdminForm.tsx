 'use client';
 
 import { useActionState } from 'react';
 import { createAdmin } from '@/app/actions/admins';
 
 export default function CreateAdminForm() {
   const [state, formAction, isPending] = useActionState(createAdmin, null);
   return (
     <form action={formAction} className="space-y-4 max-w-md">
       {state?.error && (
         <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
           {state.error}
         </div>
       )}
       {state?.success && (
         <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
           {state.success}
         </div>
       )}
       <div className="space-y-2">
         <label className="text-sm font-medium">الاسم الكامل</label>
         <input
           name="displayName"
           type="text"
           required
           placeholder="مثال: أحمد محمد"
           className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary/50 outline-none"
         />
       </div>
       <div className="space-y-2">
         <label className="text-sm font-medium">البريد الإلكتروني</label>
         <input
           name="email"
           type="email"
           required
           placeholder="admin@example.com"
           className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary/50 outline-none"
         />
       </div>
       <div className="space-y-2">
         <label className="text-sm font-medium">كلمة المرور</label>
         <input
           name="password"
           type="password"
           required
           placeholder="******"
           className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary/50 outline-none"
         />
       </div>
       <button
         type="submit"
         disabled={isPending}
         className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
       >
         {isPending ? 'جاري الإنشاء...' : 'إنشاء حساب أدمن'}
       </button>
     </form>
   );
 }
