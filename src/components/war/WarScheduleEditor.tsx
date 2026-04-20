'use client';

import { useState, useEffect, useRef } from 'react';
import { War } from '@/types/war';
import { WarSchedule, EnemyPlatform, EnemyTile, Super } from '@/types/war-schedule';
import { Castle } from '@/types/castle';
import { saveWarSchedule } from '@/app/actions/war-schedule';
import { Plus, Trash2, Save, Download, ArrowRight, Shield, Swords, MapPin, Clock, AlertCircle, Zap, Target, Edit2, FileText, Layout, Layers } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import ArabicReshaper from 'arabic-reshaper';
import { toPng } from 'html-to-image';

interface Props {
  war: War;
  initialSchedule: WarSchedule | null;
  castles: Castle[];
}

export default function WarScheduleEditor({ war, initialSchedule, castles }: Props) {
  const [schedule, setSchedule] = useState<WarSchedule>({
    warId: war.id,
    enemyPlatforms: [],
    enemyTiles: [],
    supers: [],
    ...(initialSchedule || {})
  });
  const [isSaving, setIsSaving] = useState(false);
  const pageSize = 10;
  const [platformsPage, setPlatformsPage] = useState(1);
  const [tilesPage, setTilesPage] = useState(1);
  const [supersPage, setSupersPage] = useState(1);
  const platformsTableRef = useRef<HTMLDivElement>(null);
  const tilesTableRef = useRef<HTMLDivElement>(null);
  const supersTableRef = useRef<HTMLDivElement>(null);
  const [platformsEditing, setPlatformsEditing] = useState(true);
  const [tilesEditing, setTilesEditing] = useState(true);
  const [supersEditing, setSupersEditing] = useState(true);

  const platformsPages = Math.max(1, Math.ceil(schedule.enemyPlatforms.length / pageSize));
  const tilesPages = Math.max(1, Math.ceil(schedule.enemyTiles.length / pageSize));
  const supersPages = Math.max(1, Math.ceil(schedule.supers.length / pageSize));
  const platformsPaginated = schedule.enemyPlatforms.slice((platformsPage - 1) * pageSize, platformsPage * pageSize);
  const tilesPaginated = schedule.enemyTiles.slice((tilesPage - 1) * pageSize, tilesPage * pageSize);
  const supersPaginated = schedule.supers.slice((supersPage - 1) * pageSize, supersPage * pageSize);

  const captureTable = async (which: 'platforms' | 'tiles' | 'supers') => {
    const el = which === 'platforms' ? platformsTableRef.current : which === 'tiles' ? tilesTableRef.current : supersTableRef.current;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { cacheBust: true, backgroundColor: '#0f172a', pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `war-${which}-${war.name}.png`;
      a.click();
    } catch {
      toast.error('تعذر التقاط الصورة');
    }
  };

  // Filter castles for dropdowns (Row 1 & Row 2 only)
  const validCastles = castles.filter(c => c.rank === 'row1' || c.rank === 'row2');

  // Load Arabic-capable font dynamically from CDN and register in jsPDF
  const bufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const ensureArabicFont = async (doc: jsPDF): Promise<string> => {
    const flagKey = '__arabic_font_loaded_name__';
    if (typeof window !== 'undefined' && (window as any)[flagKey]) {
      const name = (window as any)[flagKey] as string;
      doc.setFont(name, 'normal');
      return name;
    }
    const candidates = [
      {
        fileName: 'NotoSansArabic-Regular.ttf',
        fontName: 'NotoSansArabic',
        url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@5.0.6/files/noto-sans-arabic-arabic-400-normal.ttf'
      },
      {
        fileName: 'Amiri-Regular.ttf',
        fontName: 'Amiri',
        url: 'https://cdn.jsdelivr.net/gh/alif-type/amiri@master/fonts/ttf/Amiri-Regular.ttf'
      },
      {
        fileName: 'Cairo-Regular.ttf',
        fontName: 'Cairo',
        url: 'https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.16/files/cairo-arabic-400-normal.ttf'
      }
    ];
    for (const c of candidates) {
      try {
        const res = await fetch(c.url);
        if (!res.ok) continue;
        const ab = await res.arrayBuffer();
        const base64 = bufferToBase64(ab);
        (doc as any).addFileToVFS(c.fileName, base64);
        doc.addFont(c.fileName, c.fontName, 'normal');
        doc.setFont(c.fontName, 'normal');
        if (typeof window !== 'undefined') (window as any)[flagKey] = c.fontName;
        return c.fontName;
      } catch {
        // try next font
      }
    }
    doc.setFont('helvetica', 'normal');
    return 'helvetica';
  };

  // Preload font once on mount to keep export synchronous and reliable
  useEffect(() => {
    const preload = async () => {
      try {
        const tmp = new jsPDF();
        await ensureArabicFont(tmp);
      } catch {
        // ignore
      }
    };
    preload();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveWarSchedule(war.id, schedule);
    setIsSaving(false);
    if (res.success) {
      toast.success('تم حفظ الجدول بنجاح');
    } else {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };
  const savePlatforms = async () => {
    setIsSaving(true);
    const res = await saveWarSchedule(war.id, { enemyPlatforms: schedule.enemyPlatforms });
    setIsSaving(false);
    if (res.success) {
      toast.success('تم حفظ منصات الخصم');
    } else {
      toast.error('فشل حفظ المنصات');
    }
  };
  const saveTiles = async () => {
    setIsSaving(true);
    const res = await saveWarSchedule(war.id, { enemyTiles: schedule.enemyTiles });
    setIsSaving(false);
    if (res.success) {
      toast.success('تم حفظ أرضيات الخصم');
    } else {
      toast.error('فشل حفظ الأرضيات');
    }
  };
  const saveSupers = async () => {
    setIsSaving(true);
    const res = await saveWarSchedule(war.id, { supers: schedule.supers });
    setIsSaving(false);
    if (res.success) {
      toast.success('تم حفظ السوابر');
    } else {
      toast.error('فشل حفظ السوابر');
    }
  };
  const clearPlatforms = () => {
    if (!confirm('سيتم حذف كل المنصات في هذا الجدول. هل تؤكد؟')) return;
    setSchedule(prev => ({ ...prev, enemyPlatforms: [] }));
    toast.success('تم حذف كل منصات الخصم');
  };
  const clearTiles = () => {
    if (!confirm('سيتم حذف كل الأرضيات في هذا الجدول. هل تؤكد؟')) return;
    setSchedule(prev => ({ ...prev, enemyTiles: [] }));
    toast.success('تم حذف كل أرضيات الخصم');
  };
  const clearSupers = () => {
    if (!confirm('سيتم حذف كل السوابر في هذا الجدول. هل تؤكد؟')) return;
    setSchedule(prev => ({ ...prev, supers: [] }));
    toast.success('تم حذف كل السوابر');
  };

  const addPlatform = () => {
    const newPlatform: EnemyPlatform = {
      id: crypto.randomUUID(),
      name: '',
      type: 'Archer',
      arenaCorpsPower: 0,
      counterCastleId: '',
      counterCastleName: '',
      capsCastleId: '',
      capsCastleName: '',
      superCounterCastleId: '',
      superCounterCastleName: '',
      notes: ''
    };
    setSchedule(prev => ({ ...prev, enemyPlatforms: [...prev.enemyPlatforms, newPlatform] }));
  };

  const addTile = () => {
    const newTile: EnemyTile = {
      id: crypto.randomUUID(),
      name: '',
      type: 'Barracks',
      archerArmorCount: 0,
      barracksArmorCount: 0,
      zeroingResponsible: ''
    };
    setSchedule(prev => ({ ...prev, enemyTiles: [...prev.enemyTiles, newTile] }));
  };

  const addSuper = () => {
    const newSuper: Super = {
      id: crypto.randomUUID(),
      platformName: '',
      time: '1',
      location: 'Defense'
    };
    setSchedule(prev => ({ ...prev, supers: [...prev.supers, newSuper] }));
  };

  const updatePlatform = (id: string, field: keyof EnemyPlatform, value: any) => {
    setSchedule(prev => ({
      ...prev,
      enemyPlatforms: prev.enemyPlatforms.map(p => {
        if (p.id !== id) return p;
        if (field === 'counterCastleId' || field === 'capsCastleId' || field === 'superCounterCastleId') {
           const castle = validCastles.find(c => c.id === value);
           const nameField = field.replace('Id', 'Name') as keyof EnemyPlatform;
           return { ...p, [field]: value, [nameField]: castle ? castle.name : '' };
        }
        return { ...p, [field]: value };
      })
    }));
  };

  const updateTile = (id: string, field: keyof EnemyTile, value: any) => {
    setSchedule(prev => ({
      ...prev,
      enemyTiles: prev.enemyTiles.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const updateSuper = (id: string, field: keyof Super, value: any) => {
    setSchedule(prev => ({
      ...prev,
      supers: prev.supers.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const deleteItem = (type: 'platform' | 'tile' | 'super', id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    setSchedule(prev => ({
      ...prev,
      enemyPlatforms: type === 'platform' ? prev.enemyPlatforms.filter(p => p.id !== id) : prev.enemyPlatforms,
      enemyTiles: type === 'tile' ? prev.enemyTiles.filter(t => t.id !== id) : prev.enemyTiles,
      supers: type === 'super' ? prev.supers.filter(s => s.id !== id) : prev.supers,
    }));
  };

  // Convert Western digits to Eastern Arabic numerals for readability
  const toArabicDigits = (val: string | number) => {
    const s = String(val);
    const map: Record<string, string> = {
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };
    return s.replace(/[0-9]/g, d => map[d] || d);
  };

  const formatArabicNumber = (num: number) => {
    const withSep = num.toLocaleString('en-US'); // use commas then map
    // replace comma with Arabic comma '،'
    const arabicComma = withSep.replace(/,/g, '،');
    return toArabicDigits(arabicComma);
  };

  const ar = (s: string) => {
    if (!s) return '';
    try {
      return ArabicReshaper.convertArabic(s);
    } catch {
      return s;
    }
  };

  const generatePDF = async (mode: '1' | '1-2' | 'all') => {
    try {
      const doc = new jsPDF();
      const arabicFont = await ensureArabicFont(doc);
      doc.setFontSize(18);
      doc.text(ar(`جدول حرب: ${war.name}`), 105, 15, { align: 'center' });
      
      let finalY = 25;

      if (schedule.enemyPlatforms.length > 0) {
        doc.setFontSize(14);
        doc.text(ar('منصات الخصم'), 190, finalY, { align: 'right' });
        autoTable(doc, {
          startY: finalY + 5,
          head: [[ar('ملاحظات'), ar('سوبر مضاد'), ar('كبس'), ar('مضاد'), ar('قوة الفيلق'), ar('النوع'), ar('المنصة')]],
          body: schedule.enemyPlatforms.map(p => [
            ar(p.notes),
            ar(p.superCounterCastleName),
            ar(p.capsCastleName),
            ar(p.counterCastleName),
            formatArabicNumber(p.arenaCorpsPower),
            ar(p.type === 'Archer' ? 'رماة' : p.type === 'Barracks' ? 'ثكنة' : 'خطين'),
            ar(p.name)
          ]),
          styles: { halign: 'right', font: arabicFont, fontSize: 12 },
          headStyles: { fillColor: [41, 128, 185], font: arabicFont, fontSize: 12, textColor: [255,255,255] },
          bodyStyles: { font: arabicFont },
          columnStyles: {
            4: { halign: 'center' }, // قوة الفيلق
            5: { halign: 'center' }  // النوع
          },
          theme: 'grid',
          margin: { left: 10, right: 10 }
        });
        finalY = (doc as any).lastAutoTable.finalY + 10;
      }

      if ((mode === '1-2' || mode === 'all') && schedule.enemyTiles.length > 0) {
        doc.text(ar('أرضيات الخصم'), 190, finalY, { align: 'right' });
        autoTable(doc, {
          startY: finalY + 5,
          head: [[ar('مسئول التصفير'), ar('مدرع ثكنة'), ar('مدرع رماة'), ar('النوع'), ar('الأرضية')]],
          body: schedule.enemyTiles.map(t => [
            ar(t.zeroingResponsible),
            formatArabicNumber(t.barracksArmorCount),
            formatArabicNumber(t.archerArmorCount),
            ar(t.type === 'Archer' ? 'رماة' : 'ثكنة'),
            ar(t.name)
          ]),
          styles: { halign: 'right', font: arabicFont, fontSize: 12 },
          headStyles: { fillColor: [39, 174, 96], font: arabicFont, fontSize: 12, textColor: [255,255,255] },
          bodyStyles: { font: arabicFont },
          columnStyles: {
            1: { halign: 'center' }, // مدرع ثكنة
            2: { halign: 'center' }  // مدرع رماة
          },
          theme: 'grid',
          margin: { left: 10, right: 10 }
        });
        finalY = (doc as any).lastAutoTable.finalY + 10;
      }

      if (mode === 'all' && schedule.supers.length > 0) {
        doc.text(ar('السوابر'), 190, finalY, { align: 'right' });
        autoTable(doc, {
          startY: finalY + 5,
          head: [[ar('المكان'), ar('التوقيت'), ar('المنصة')]],
          body: schedule.supers.map(s => [
            ar(s.location === 'Defense' ? 'دفاع' : 'هجوم'),
            toArabicDigits(s.time),
            ar(s.platformName)
          ]),
          styles: { halign: 'right', font: arabicFont, fontSize: 12 },
          headStyles: { fillColor: [142, 68, 173], font: arabicFont, fontSize: 12, textColor: [255,255,255] },
          bodyStyles: { font: arabicFont },
          columnStyles: {
            1: { halign: 'center' } // التوقيت
          },
          theme: 'grid',
          margin: { left: 10, right: 10 }
        });
      }

      doc.save(`war-schedule-${war.name}.pdf`);
      toast.success('تم توليد ملف PDF بنجاح');
    } catch (err) {
      toast.error('تعذر توليد PDF. حاول مرة أخرى.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Sticky Header - Control Panel Style */}
      <header className="sticky top-4 z-50 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-2 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Left Card: Info & Navigation */}
            <div className="flex items-center gap-3 bg-[#0f172a]/60 rounded-xl p-2 pr-4 border border-white/5 w-full md:w-auto">
              <Link href={`/coordinator/war-management/${war.id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white group">
                <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="h-8 w-px bg-white/10 mx-1"></div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-blue-400" />
                  غرفة العمليات
                </h1>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                  {war.name}
                </div>
              </div>
            </div>
            
            <div className="flex-1"></div>
            
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
               <Swords className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">المنصات</p>
               <p className="text-2xl font-bold text-white">{schedule.enemyPlatforms.length}</p>
             </div>
          </div>
          <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
               <MapPin className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">الأرضيات</p>
               <p className="text-2xl font-bold text-white">{schedule.enemyTiles.length}</p>
             </div>
          </div>
           <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
               <Shield className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">السوابر</p>
               <p className="text-2xl font-bold text-white">{schedule.supers.length}</p>
             </div>
          </div>
           <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
               <Zap className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">القوة الكلية</p>
               <p className="text-2xl font-bold text-white">
                 {formatArabicNumber(schedule.enemyPlatforms.reduce((acc, curr) => acc + (curr.arenaCorpsPower || 0), 0))}
               </p>
             </div>
          </div>
        </div>
        
        {/* Enemy Platforms Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 ring-1 ring-white/10">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">منصات الخصم</h2>
                <p className="text-sm text-slate-400">توزيع المضادات واستراتيجيات الهجوم</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={addPlatform}
                disabled={!platformsEditing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all border border-blue-500/20 hover:border-blue-500/40 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-bold">إضافة منصة</span>
              </button>
              <button
                onClick={() => captureTable('platforms')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10 hover:border-white/20"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-bold">تحميل صورة</span>
              </button>
              <button
                onClick={savePlatforms}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all border border-emerald-500/20 hover:border-emerald-500/40"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-bold">حفظ</span>
              </button>
              <button
                onClick={() => setPlatformsEditing(e => !e)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${platformsEditing ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-slate-800/70 text-slate-300 border-white/10 hover:bg-slate-700/70'}`}
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-bold">تعديل</span>
              </button>
              <button
                onClick={clearPlatforms}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20 hover:border-red-500/40"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-bold">حذف</span>
              </button>
            </div>
          </div>
          
          <div ref={platformsTableRef} className={`overflow-hidden bg-[#1e293b]/60 backdrop-blur-md rounded-3xl border border-white/5 ${!platformsEditing ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[1000px]">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-medium text-right">اسم المنصة</th>
                    <th className="px-4 py-3 font-medium text-center">النوع</th>
                    <th className="px-4 py-3 font-medium text-center">القوة</th>
                    <th className="px-4 py-3 font-medium text-right">المضاد الأساسي</th>
                    <th className="px-4 py-3 font-medium text-right">كبس</th>
                    <th className="px-4 py-3 font-medium text-right">سوبر مضاد</th>
                    <th className="px-4 py-3 font-medium text-right">ملاحظات</th>
                    <th className="px-4 py-3 font-medium text-center w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {platformsPaginated.map((p) => (
                    <tr key={p.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          className="bg-transparent text-sm font-bold text-white placeholder-slate-600 focus:outline-none w-full border border-transparent focus:border-blue-500/50 rounded-lg px-2 py-1.5 transition-all focus:bg-white/5"
                          value={p.name} 
                          onChange={e => updatePlatform(p.id, 'name', e.target.value)} 
                          placeholder="اسم المنصة..." 
                        />
                      </td>
                      <td className="px-4 py-3">
                         <select 
                            className="select select-xs h-8 bg-[#0f172a]/50 border-white/10 text-slate-300 focus:border-blue-500 rounded-lg w-full min-w-[100px]"
                            value={p.type} 
                            onChange={e => updatePlatform(p.id, 'type', e.target.value)}
                          >
                            <option value="Archer">🏹 رماة</option>
                            <option value="Barracks">🛡️ ثكنة</option>
                            <option value="TwoLines">⚔️ خطين</option>
                          </select>
                      </td>
                      <td className="px-4 py-3">
                         <div className="relative">
                             <input 
                              type="number" 
                              className="input input-xs h-8 bg-[#0f172a]/50 border-white/10 text-slate-300 focus:border-blue-500 w-full rounded-lg pl-7 pr-2 text-center font-mono"
                              value={p.arenaCorpsPower} 
                              onChange={e => updatePlatform(p.id, 'arenaCorpsPower', Number(e.target.value))}
                              placeholder="0" 
                            />
                            <Zap className="w-3 h-3 text-amber-400 absolute left-2 top-2.5" />
                          </div>
                      </td>
                      <td className="px-4 py-3">
                         <select className="select select-xs w-full bg-[#0f172a]/50 border-white/10 focus:border-blue-500 text-blue-100 rounded-lg" value={p.counterCastleId} onChange={e => updatePlatform(p.id, 'counterCastleId', e.target.value)}>
                            <option value="">-- اختر --</option>
                            {validCastles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </td>
                      <td className="px-4 py-3">
                          <select className="select select-xs w-full bg-[#0f172a]/50 border-white/10 focus:border-amber-500 text-amber-100 rounded-lg" value={p.capsCastleId} onChange={e => updatePlatform(p.id, 'capsCastleId', e.target.value)}>
                            <option value="">-- اختر --</option>
                            {validCastles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </td>
                      <td className="px-4 py-3">
                          <select className="select select-xs w-full bg-[#0f172a]/50 border-white/10 focus:border-purple-500 text-purple-100 rounded-lg" value={p.superCounterCastleId} onChange={e => updatePlatform(p.id, 'superCounterCastleId', e.target.value)}>
                            <option value="">-- اختر --</option>
                            {validCastles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </td>
                      <td className="px-4 py-3">
                         <div className="relative group/note min-w-[150px]">
                            <Edit2 className="w-3 h-3 text-slate-600 absolute right-2 top-2.5 group-focus-within/note:text-blue-400 transition-colors" />
                            <input 
                              type="text" 
                              className="input input-xs h-8 w-full bg-transparent border-transparent focus:border-white/10 focus:bg-white/5 text-slate-300 rounded-lg pr-7 transition-all"
                              value={p.notes} 
                              onChange={e => updatePlatform(p.id, 'notes', e.target.value)} 
                              placeholder="ملاحظات..." 
                            />
                          </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => deleteItem('platform', p.id)} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {schedule.enemyPlatforms.length === 0 && (
                     <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                           <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                              <Swords className="w-6 h-6 opacity-20" />
                           </div>
                           <p>لا توجد منصات مضافة بعد</p>
                           <button onClick={addPlatform} className="text-blue-400 text-sm hover:underline">إضافة منصة جديدة</button>
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
            {schedule.enemyPlatforms.length > 0 && (
              <div className="p-3 bg-slate-900/30 border-t border-white/5 flex items-center justify-between">
                <button onClick={addPlatform} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 py-1 px-3 rounded hover:bg-blue-500/10 transition-colors">
                   <Plus className="w-3 h-3" /> إضافة منصة أخرى
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPlatformsPage(p => Math.max(1, p - 1))} 
                    className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                    disabled={platformsPage <= 1}
                  >
                    السابق 10
                  </button>
                  <span className="text-[11px] text-slate-400">{platformsPage} / {platformsPages}</span>
                  <button 
                    onClick={() => setPlatformsPage(p => Math.min(platformsPages, p + 1))} 
                    className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                    disabled={platformsPage >= platformsPages}
                  >
                    التالي 10
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="sm:hidden">
            <button onClick={addPlatform} className="btn btn-block btn-primary">
              <Plus className="w-4 h-4" /> إضافة منصة
            </button>
            <button onClick={() => captureTable('platforms')} className="btn btn-block mt-2">
              <Download className="w-4 h-4" /> تحميل صورة
            </button>
          </div>
        </section>

        {/* Enemy Tiles Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 ring-1 ring-white/10">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">أرضيات الخصم</h2>
                <p className="text-sm text-slate-400">توزيع المدرعات والمسؤولين</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={addTile}
                disabled={!tilesEditing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all border border-emerald-500/20 hover:border-emerald-500/40 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-bold">إضافة أرضية</span>
              </button>
              <button
                onClick={() => captureTable('tiles')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10 hover:border-white/20"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-bold">تحميل صورة</span>
              </button>
              <button
                onClick={saveTiles}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all border border-emerald-500/20 hover:border-emerald-500/40"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-bold">حفظ</span>
              </button>
              <button
                onClick={() => setTilesEditing(e => !e)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${tilesEditing ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-slate-800/70 text-slate-300 border-white/10 hover:bg-slate-700/70'}`}
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-bold">تعديل</span>
              </button>
              <button
                onClick={clearTiles}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20 hover:border-red-500/40"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-bold">حذف</span>
              </button>
            </div>
          </div>

          <div ref={tilesTableRef} className={`overflow-hidden bg-[#1e293b]/60 backdrop-blur-md rounded-3xl border border-white/5 ${!tilesEditing ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[800px]">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-medium text-right">اسم الأرضية</th>
                    <th className="px-4 py-3 font-medium text-center">النوع</th>
                    <th className="px-4 py-3 font-medium text-center">مدرع رماة</th>
                    <th className="px-4 py-3 font-medium text-center">مدرع ثكنة</th>
                    <th className="px-4 py-3 font-medium text-right">مسئول التصفير</th>
                    <th className="px-4 py-3 font-medium text-center w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tilesPaginated.map((t) => (
                    <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <input 
                           type="text" 
                           className="bg-transparent text-sm font-bold text-white placeholder-slate-600 focus:outline-none w-full border border-transparent focus:border-emerald-500/50 rounded-lg px-2 py-1.5 transition-all focus:bg-white/5"
                           value={t.name} 
                           onChange={e => updateTile(t.id, 'name', e.target.value)} 
                           placeholder="اسم الأرضية..." 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select 
                           className="select select-xs h-8 bg-[#0f172a]/50 border-white/10 text-slate-300 focus:border-emerald-500 rounded-lg w-full min-w-[100px]"
                           value={t.type} 
                           onChange={e => updateTile(t.id, 'type', e.target.value)}
                        >
                           <option value="Barracks">🛡️ ثكنة</option>
                           <option value="Archer">🏹 رماة</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="number" className="input input-xs h-8 w-20 text-center font-mono bg-[#0f172a]/50 border-white/10 focus:border-emerald-500 rounded-lg mx-auto" value={t.archerArmorCount} onChange={e => updateTile(t.id, 'archerArmorCount', Number(e.target.value))} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="number" className="input input-xs h-8 w-20 text-center font-mono bg-[#0f172a]/50 border-white/10 focus:border-emerald-500 rounded-lg mx-auto" value={t.barracksArmorCount} onChange={e => updateTile(t.id, 'barracksArmorCount', Number(e.target.value))} />
                      </td>
                      <td className="px-4 py-3">
                         <div className="flex items-center gap-2 bg-red-500/5 px-2 py-1 rounded-lg border border-red-500/10">
                            <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                            <input 
                              type="text" 
                              className="bg-transparent text-xs font-bold text-red-200 placeholder-red-900/50 focus:outline-none w-full border-none p-0 focus:ring-0"
                              value={t.zeroingResponsible} 
                              onChange={e => updateTile(t.id, 'zeroingResponsible', e.target.value)} 
                              placeholder="اسم المسؤول..."
                            />
                         </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => deleteItem('tile', t.id)} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {schedule.enemyTiles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                          <MapPin className="w-6 h-6 opacity-20" />
                        </div>
                        <p>لا توجد أرضيات مضافة بعد</p>
                        <button onClick={addTile} className="text-emerald-400 text-sm hover:underline">إضافة أرضية جديدة</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {schedule.enemyTiles.length > 0 && (
              <div className="p-3 bg-slate-900/30 border-t border-white/5 flex items-center justify-between">
                <button onClick={addTile} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 py-1 px-3 rounded hover:bg-emerald-500/10 transition-colors">
                   <Plus className="w-3 h-3" /> إضافة أرضية أخرى
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTilesPage(p => Math.max(1, p - 1))} 
                    className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                    disabled={tilesPage <= 1}
                  >
                    السابق 10
                  </button>
                  <span className="text-[11px] text-slate-400">{tilesPage} / {tilesPages}</span>
                  <button 
                    onClick={() => setTilesPage(p => Math.min(tilesPages, p + 1))} 
                    className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                    disabled={tilesPage >= tilesPages}
                  >
                    التالي 10
                  </button>
                </div>
              </div>
            )}
          </div>
          
           <div className="sm:hidden">
            <button onClick={addTile} className="btn btn-block btn-accent">
              <Plus className="w-4 h-4" /> إضافة أرضية
            </button>
            <button onClick={() => captureTable('tiles')} className="btn btn-block mt-2">
              <Download className="w-4 h-4" /> تحميل صورة
            </button>
          </div>
        </section>

        {/* Supers Section */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 pb-20">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-600/20 ring-1 ring-white/10">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">السوابر</h2>
                <p className="text-sm text-slate-400">توزيع سوابر الدفاع والهجوم</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={addSuper}
                disabled={!supersEditing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-all border border-purple-500/20 hover:border-purple-500/40 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-bold">إضافة سوبر</span>
              </button>
              <button
                onClick={() => captureTable('supers')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/10 hover:border-white/20"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-bold">تحميل صورة</span>
              </button>
              <button
                onClick={saveSupers}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all border border-emerald-500/20 hover:border-emerald-500/40"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-bold">حفظ</span>
              </button>
              <button
                onClick={() => setSupersEditing(e => !e)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${supersEditing ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-slate-800/70 text-slate-300 border-white/10 hover:bg-slate-700/70'}`}
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-bold">تعديل</span>
              </button>
              <button
                onClick={clearSupers}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20 hover:border-red-500/40"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-bold">حذف</span>
              </button>
            </div>
          </div>

          <div ref={supersTableRef} className={`overflow-hidden bg-[#1e293b]/60 backdrop-blur-md rounded-3xl border border-white/5 ${!supersEditing ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[600px]">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-medium text-right">المنصة</th>
                    <th className="px-4 py-3 font-medium text-center">التوقيت</th>
                    <th className="px-4 py-3 font-medium text-center">المكان</th>
                    <th className="px-4 py-3 font-medium text-center w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {supersPaginated.map((s) => (
                    <tr key={s.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <select className="select select-xs w-full bg-[#0f172a]/50 border-white/10 focus:border-purple-500 text-purple-100 font-bold rounded-lg" value={s.platformName} onChange={e => updateSuper(s.id, 'platformName', e.target.value)}>
                          <option value="">-- اختر --</option>
                          {validCastles.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                         <div className="flex items-center justify-center gap-2">
                           <Clock className="w-3 h-3 text-slate-500" />
                           <select className="select select-xs w-20 bg-[#0f172a]/50 border-white/10 focus:border-purple-500 rounded-lg text-center" value={s.time} onChange={e => updateSuper(s.id, 'time', e.target.value)}>
                             {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                           </select>
                         </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                         <select 
                            className={`select select-xs w-28 border-white/10 focus:border-purple-500 font-bold rounded-lg ${s.location === 'Defense' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}
                            value={s.location} 
                            onChange={e => updateSuper(s.id, 'location', e.target.value)}
                         >
                           <option value="Defense">🛡️ دفاع</option>
                           <option value="Attack">⚔️ هجوم</option>
                         </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => deleteItem('super', s.id)} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {schedule.supers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                          <Shield className="w-6 h-6 opacity-20" />
                        </div>
                        <p>لا توجد سوابر مضافة بعد</p>
                        <button onClick={addSuper} className="text-purple-400 text-sm hover:underline">إضافة سوبر جديد</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {schedule.supers.length > 0 && (
              <div className="p-3 bg-slate-900/30 border-t border-white/5 flex items-center justify-between">
                <button onClick={addSuper} className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 py-1 px-3 rounded hover:bg-purple-500/10 transition-colors">
                   <Plus className="w-3 h-3" /> إضافة سوبر آخر
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSupersPage(p => Math.max(1, p - 1))} 
                    className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                    disabled={supersPage <= 1}
                  >
                    السابق 10
                  </button>
                  <span className="text-[11px] text-slate-400">{supersPage} / {supersPages}</span>
                  <button 
                    onClick={() => setSupersPage(p => Math.min(supersPages, p + 1))} 
                    className="text-xs px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                    disabled={supersPage >= supersPages}
                  >
                    التالي 10
                  </button>
                </div>
              </div>
            )}
          </div>
          
           <div className="sm:hidden">
            <button onClick={addSuper} className="btn btn-block btn-secondary">
              <Plus className="w-4 h-4" /> إضافة سوبر
            </button>
            <button onClick={() => captureTable('supers')} className="btn btn-block mt-2">
              <Download className="w-4 h-4" /> تحميل صورة
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
