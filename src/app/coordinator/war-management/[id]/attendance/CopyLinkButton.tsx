'use client';

import { useState } from 'react';
import { Check, Copy, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CopyLinkButton({ warId }: { warId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Construct URL based on current origin
    const url = `${window.location.origin}/war-attendance/${warId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('تم نسخ الرابط بنجاح');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
    >
      {copied ? <Check size={18} /> : <LinkIcon size={18} />}
      <span>{copied ? 'تم النسخ' : 'نسخ رابط الحضور'}</span>
    </button>
  );
}
