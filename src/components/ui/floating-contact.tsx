"use client";

import Link from 'next/link';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="floating-contact" className="fixed bottom-6 left-6 z-40 no-print">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Contact channels"
          className="mb-3 p-3 rounded-2xl bg-[#131622]/95 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col gap-2 min-w-[190px] animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 pt-1">
            Fast Support
          </div>
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Mail className="w-4 h-4 text-lime-400" />
            <span>Support Ticket</span>
          </Link>
          <a
            href="mailto:support@techstore.co.ke"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Email Direct</span>
          </a>
          <a
            href="tel:+254700000000"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>+254 700 000 000</span>
          </a>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/90 text-foreground border border-border shadow-lg backdrop-blur-md hover:border-lime-400/50 hover:text-lime-500 dark:hover:text-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 transition-all duration-200 active:scale-95 group text-xs font-bold"
      >
        <MessageCircle className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Contact Support</span>
      </button>
    </div>
  );
}

