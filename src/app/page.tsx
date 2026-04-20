'use client';

import Link from "next/link";
import { Shield, Users, BarChart3, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">انتقام السلاطين</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors text-sm"
          >
            تسجيل الدخول
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            نظام الإدارة المتقدم
            <br />
            <span className="text-primary">لسيرفر انتقام السلاطين</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            منصة متكاملة لإدارة اللاعبين، المنسقين، والعمليات الإدارية بكفاءة عالية وأمان تام.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              الدخول للوحة التحكم
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-blue-400" />}
            title="إدارة الأعضاء"
            description="تحكم كامل في حسابات اللاعبين والمنسقين مع صلاحيات مخصصة."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-purple-400" />}
            title="حماية وأمان"
            description="نظام مصادقة متطور وتسجيل دقيق لجميع العمليات الإدارية."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-emerald-400" />}
            title="تقارير وإحصائيات"
            description="لوحة بيانات شاملة تعرض أهم المؤشرات وحالة السيرفر."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-muted-foreground text-sm">
        <p>© 2024 جميع الحقوق محفوظة - omar46</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-secondary/30 border border-border hover:border-primary/50 transition-colors text-right">
      <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
