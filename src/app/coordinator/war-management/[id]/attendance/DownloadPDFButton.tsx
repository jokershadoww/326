'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toPng, toJpeg, toCanvas } from 'html-to-image';
import { toast } from 'react-hot-toast';
import { Castle, CASTLE_RANKS } from '@/types/castle';
import { AttendanceRecord } from '@/types/attendance';

interface DownloadPDFButtonProps {
  warName: string;
  castles: Castle[];
  attendance: AttendanceRecord[];
}

export default function DownloadPDFButton({ warName, castles, attendance }: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const node = document.getElementById('attendance-capture') || document.getElementById('attendance-table');
      if (!node) {
        toast.error('تعذر العثور على جدول الحضور في الصفحة');
        return;
      }
      if ('fonts' in document) {
        try {
          await (document as any).fonts.ready;
        } catch {}
      }
      const rect = node.getBoundingClientRect();
      const width = Math.max(node.scrollWidth, Math.ceil(rect.width));
      const height = Math.max(node.scrollHeight, Math.ceil(rect.height));
      let dataUrl: string;
      try {
        dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 1.5,
          backgroundColor: '#0f172a',
          width, 
          height,
          style: {
            fontFamily: '"Tahoma","Segoe UI",Arial,sans-serif'
          }
        });
      } catch {
        try {
          dataUrl = await toJpeg(node, {
            cacheBust: true,
            pixelRatio: 1.5,
            backgroundColor: '#0f172a',
            quality: 0.95,
            width, 
            height,
            style: {
              fontFamily: '"Tahoma","Segoe UI",Arial,sans-serif'
            }
          });
        } catch {
          const canvas = await toCanvas(node, {
            cacheBust: true,
            backgroundColor: '#0f172a',
            width,
            height,
            style: {
              fontFamily: '"Tahoma","Segoe UI",Arial,sans-serif'
            }
          });
          dataUrl = canvas.toDataURL('image/png');
        }
      }
      const link = document.createElement('a');
      link.download = `attendance-${warName}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('تم تحميل الصورة بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل الصورة');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateImage}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={18} />
      <span>{isGenerating ? 'جاري التحميل...' : 'تحميل صورة'}</span>
    </button>
  );
}
