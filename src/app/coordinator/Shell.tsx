 'use client';
 
 import { logoutAction } from '@/app/actions/auth';
 import { useState } from 'react';
 import { 
   LogOut, 
   Shield, 
   LayoutDashboard, 
   Info, 
   Swords, 
   Menu,
   Bell,
   X
 } from 'lucide-react';
 import Link from 'next/link';
 import { usePathname } from 'next/navigation';
 
 export default function CoordinatorShell({
   children,
 }: {
   children: React.ReactNode;
 }) {
   const pathname = usePathname();
   const [mobileOpen, setMobileOpen] = useState(false);
 
   return (
     <div className="min-h-screen bg-background flex">
       <aside className="w-64 bg-secondary/50 border-l border-border hidden md:flex flex-col sticky top-0 h-screen">
         <div className="p-6 border-b border-border flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
             <Shield className="w-5 h-5 text-primary" />
           </div>
           <div>
             <h1 className="font-bold text-lg leading-none">لوحة المنسق</h1>
             <p className="text-xs text-muted-foreground mt-1">انتقام السلاطين</p>
           </div>
         </div>
 
         <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
           <Link 
             href="/coordinator" 
             className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
               pathname === '/coordinator' 
                 ? 'bg-primary/10 text-primary border border-primary/20' 
                 : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
             }`}
           >
             <LayoutDashboard className="w-5 h-5" />
             <span>الرئيسية</span>
           </Link>
           
           <Link 
             href="/coordinator/server-info" 
             className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
               pathname === '/coordinator/server-info' 
                 ? 'bg-primary/10 text-primary border border-primary/20' 
                 : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
             }`}
           >
             <Info className="w-5 h-5" />
             <span>معلومات السيرفر</span>
           </Link>
           
           <Link 
             href="/coordinator/war-management" 
             className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
               pathname === '/coordinator/war-management' 
                 ? 'bg-primary/10 text-primary border border-primary/20' 
                 : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
             }`}
           >
             <Swords className="w-5 h-5" />
             <span>إدارة الحروب</span>
           </Link>
         </nav>
 
         <div className="p-4 border-t border-border">
           <button 
             onClick={() => logoutAction()}
             className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all"
           >
             <LogOut className="w-5 h-5" />
             <span>تسجيل الخروج</span>
           </button>
         </div>
       </aside>
 
       <div className="flex-1 flex flex-col min-w-0">
         <header className="h-16 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20 px-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground">
               <Menu className="w-6 h-6" />
             </button>
           </div>
 
           <div className="flex items-center gap-4">
             <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-background"></span>
             </button>
             <div className="flex items-center gap-3 pr-4 border-r border-border">
               <div className="text-left hidden sm:block">
                 <p className="text-sm font-medium">المنسق</p>
                 <p className="text-xs text-muted-foreground">Coordinator</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                 <span className="font-bold text-primary text-sm">C</span>
               </div>
             </div>
           </div>
         </header>
 
         <div className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
           <div
             onClick={() => setMobileOpen(false)}
             className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
           />
           <div className={`absolute right-0 top-0 h-full w-64 bg-secondary/50 border-l border-border transform transition-transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="p-4 border-b border-border flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                   <Shield className="w-4 h-4 text-primary" />
                 </div>
                 <span className="font-medium text-sm">لوحة المنسق</span>
               </div>
               <button onClick={() => setMobileOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                 <X className="w-5 h-5" />
               </button>
             </div>
             <nav className="p-4 space-y-2">
               <Link 
                 href="/coordinator" 
                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                   pathname === '/coordinator' 
                     ? 'bg-primary/10 text-primary border border-primary/20' 
                     : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                 }`}
                 onClick={() => setMobileOpen(false)}
               >
                 <LayoutDashboard className="w-5 h-5" />
                 <span>الرئيسية</span>
               </Link>
               <Link 
                 href="/coordinator/server-info" 
                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                   pathname === '/coordinator/server-info' 
                     ? 'bg-primary/10 text-primary border border-primary/20' 
                     : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                 }`}
                 onClick={() => setMobileOpen(false)}
               >
                 <Info className="w-5 h-5" />
                 <span>معلومات السيرفر</span>
               </Link>
               <Link 
                 href="/coordinator/war-management" 
                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                   pathname === '/coordinator/war-management' 
                     ? 'bg-primary/10 text-primary border border-primary/20' 
                     : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                 }`}
                 onClick={() => setMobileOpen(false)}
               >
                 <Swords className="w-5 h-5" />
                 <span>إدارة الحروب</span>
               </Link>
             </nav>
             <div className="p-4 border-t border-border">
               <button 
                 onClick={() => { setMobileOpen(false); logoutAction(); }}
                 className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all"
               >
                 <LogOut className="w-5 h-5" />
                 <span>تسجيل الخروج</span>
               </button>
             </div>
           </div>
         </div>
 
         <div className="md:hidden bg-secondary/40 border-b border-border px-4 py-2 sticky top-16 z-10">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
             <Link 
               href="/coordinator"
               className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                 pathname === '/coordinator' ? 'bg-primary/20 text-primary' : 'bg-background/60 text-muted-foreground'
               }`}
             >
               الرئيسية
             </Link>
             <Link 
               href="/coordinator/server-info" 
               className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                 pathname === '/coordinator/server-info' ? 'bg-primary/20 text-primary' : 'bg-background/60 text-muted-foreground'
               }`}
             >
               معلومات السيرفر
             </Link>
             <Link 
               href="/coordinator/war-management" 
               className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                 pathname === '/coordinator/war-management' ? 'bg-primary/20 text-primary' : 'bg-background/60 text-muted-foreground'
               }`}
             >
               إدارة الحروب
             </Link>
           </div>
         </div>
 
         <main className="flex-1 p-4 md:p-6 overflow-y-auto">
           {children}
         </main>
       </div>
     </div>
   );
 }
