 'use client';
 
 import { useActionState } from 'react';
 import { loginSuperAdmin } from '@/app/actions/super-admin-auth';
 import { Shield } from 'lucide-react';
 
 export default function SuperAdminLoginPage() {
   const [state, formAction, isPending] = useActionState(loginSuperAdmin, null);
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black p-4" dir="rtl">
       <div className="w-full max-w-md bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
         <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 mb-4">
             <Shield className="w-8 h-8 text-primary" />
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">دخول السوبر أدمن</h1>
           <p className="text-zinc-400">صفحة مستقلة لإدارة الأدمن</p>
         </div>
 
         <form action={formAction} className="space-y-4">
           {state?.error && (
             <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
               {state.error}
             </div>
           )}
 
           <div className="space-y-2">
             <label className="text-sm font-medium text-zinc-300">اسم المستخدم</label>
             <input
               name="username"
               type="text"
               required
               placeholder="omar46"
               className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
             />
           </div>
 
           <div className="space-y-2">
             <label className="text-sm font-medium text-zinc-300">كلمة المرور</label>
             <input
               name="password"
               type="password"
               required
               placeholder="••••••••"
               className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
             />
           </div>
 
           <button
             type="submit"
             disabled={isPending}
             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all mt-4"
           >
             {isPending ? 'جاري الدخول...' : 'دخول'}
           </button>
         </form>
 
         <div className="mt-8 text-center">
           <p className="text-xs text-zinc-600">هذه الصفحة منفصلة عن بقية الموقع</p>
         </div>
       </div>
     </div>
   );
 }
