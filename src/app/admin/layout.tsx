 'use client';
 
import { 
  LayoutDashboard, 
  Users, 
  Server, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  KeyRound
} from "lucide-react";
import Link from "next/link";
import { logoutAction } from "../actions/auth";
 import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary/50 border-l border-border hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg">لوحة التحكم</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>الرئيسية</span>
          </Link>
          
          <Link 
            href="/admin/players" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
          >
            <Users className="w-5 h-5" />
            <span>اللاعبين</span>
          </Link>
          
          
          
          <Link 
            href="/admin/server" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
          >
            <Server className="w-5 h-5" />
            <span>حالة السيرفر</span>
          </Link>
          
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>الإعدادات</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <form action={logoutAction}>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all">
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>
 
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-secondary/60 border-l border-border backdrop-blur-xl p-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg">لوحة التحكم</span>
            </div>
            <nav className="py-4 space-y-2">
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
                <LayoutDashboard className="w-5 h-5" />
                <span>الرئيسية</span>
              </Link>
              <Link href="/admin/players" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all">
                <Users className="w-5 h-5" />
                <span>اللاعبين</span>
              </Link>
              
              <Link href="/admin/server" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all">
                <Server className="w-5 h-5" />
                <span>حالة السيرفر</span>
              </Link>
              <Link href="/admin/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all">
                <Settings className="w-5 h-5" />
                <span>الإعدادات</span>
              </Link>
              <form action={logoutAction} className="pt-2">
                <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all">
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </form>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(true)} aria-label="فتح القائمة">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="بحث..." 
                className="w-64 bg-secondary/50 border border-border rounded-full py-1.5 pr-9 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-background"></span>
            </button>
            <div className="flex items-center gap-3 pr-4 border-r border-border">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">المدير العام</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="font-bold text-primary text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
