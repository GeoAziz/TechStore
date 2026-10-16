"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  className?: string;
  label?: string;
  successText?: string;
}

export default function CopyButton({
  value,
  className,
  label = "Copy to clipboard",
  successText = "Copied!",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? successText : label}
      title={copied ? successText : label}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400",
        copied
          ? "bg-lime-400/20 text-lime-400 border-lime-400/40"
          : "bg-white/[0.06] text-white/80 border-white/10 hover:border-white/20 hover:text-white",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-lime-400" />
          <span>{successText}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 opacity-80" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

