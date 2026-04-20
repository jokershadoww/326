
import { getWarById, initializeWarDatabase } from '@/app/actions/wars';
import Link from 'next/link';
import { ArrowRight, Database, Calendar, UserCheck, FileBarChart } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function WarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Initialize the "database" for this war
  await initializeWarDatabase(id);
  
  // Fetch war details
  const res = await getWarById(id);
  
  if (res.error || !res.war) {
    notFound();
  }
  
  const war = res.war;

  const menuItems = [
    {
      title: "جدول الحرب",
      description: "إدارة توقيتات وجولات الحرب والمنصات",
      icon: <Calendar className="w-10 h-10 text-blue-400" />,
      href: `/coordinator/war-management/${id}/schedule`,
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30",
      hover: "group-hover:border-blue-500/60 group-hover:shadow-blue-500/20",
      delay: "delay-100"
    },
    {
      title: "تسجيل الحضور",
      description: "متابعة حضور وانصراف المشاركين",
      icon: <UserCheck className="w-10 h-10 text-emerald-400" />,
      href: `/coordinator/war-management/${id}/attendance`,
      gradient: "from-emerald-500/20 to-green-500/20",
      border: "border-emerald-500/30",
      hover: "group-hover:border-emerald-500/60 group-hover:shadow-emerald-500/20",
      delay: "delay-200"
    },
    {
      title: "تقارير الحرب",
      description: "عرض الإحصائيات والنتائج النهائية",
      icon: <FileBarChart className="w-10 h-10 text-purple-400" />,
      href: "#reports", // Placeholder
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30",
      hover: "group-hover:border-purple-500/60 group-hover:shadow-purple-500/20",
      delay: "delay-300"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 relative overflow-hidden">
       {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link 
            href="/coordinator/war-management" 
            className="group p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 rounded-xl transition-all hover:scale-105"
          >
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex flex-wrap items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              {war.name}
              <span className="text-sm font-mono px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full backdrop-blur-sm">
                {new Date(war.date).toLocaleDateString('ar-EG')}
              </span>
            </h1>
            <p className="text-slate-400 flex items-center gap-2 text-lg">
              <Database className="w-5 h-5 text-slate-500" />
              لوحة التحكم المركزية للحرب
            </p>
          </div>
        </div>

        {/* Menu Table */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium text-right">القسم</th>
                <th className="px-6 py-4 font-medium text-right hidden md:table-cell">الوصف</th>
                <th className="px-6 py-4 font-medium text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {menuItems.map((item, index) => (
                <tr 
                  key={index} 
                  className="group hover:bg-white/5 transition-colors duration-300"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center border ${item.border} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <div className="scale-75 transform text-white">
                          {item.icon}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-slate-400 group-hover:text-slate-300 transition-colors hidden md:table-cell">
                    {item.description}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center">
                      <Link 
                        href={item.href}
                        className="
                          flex items-center gap-2 px-6 py-2.5 rounded-xl
                          bg-slate-800 hover:bg-blue-600 border border-white/10 hover:border-blue-500
                          text-slate-300 hover:text-white
                          font-medium transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-600/20
                        "
                      >
                        <span>دخول</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
