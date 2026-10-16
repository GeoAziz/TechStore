
'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from './logo';
import { Github, Send, ShieldCheck, Ship, Twitter, Bot } from 'lucide-react';
import { Badge } from '../ui/badge';

const footerNavLinks = {
  shop: [
    { href: '/shop?category=Laptops', label: 'Laptops' },
    { href: '/shop?category=Desktops', label: 'Desktops' },
    { href: '/shop?category=Graphic Cards', label: 'Graphic Cards' },
    { href: '/deals', label: 'Special Deals' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/shipping-returns', label: 'Shipping & Returns' },
    { href: '/faq', label: 'FAQ' },
    { href: '/warranty', label: 'Warranty Info' },
  ],
  company: [
    { href: '/about', label: 'About Zizo' },
    { href: '/mission-logs', label: 'Mission Logs' },
    { href: '/join-the-crew', label: 'Join the Crew' },
    { href: '/press-kit', label: 'Press Kit' },
  ],
};

const socialLinks = [
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Github, label: 'GitHub' },
  { href: '#', icon: Bot, label: 'Discord' },
];

export default function Footer() {
  return (
    <footer className="bg-[#090a0f] text-white/80 border-t border-white/10 font-sans">
      <div className="container max-w-7xl mx-auto px-4 py-16 space-y-12">
        
        {/* Top Section: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Branding */}
          <div className="space-y-4">
            <Logo className="h-8 w-auto" />
            <p className="text-muted-foreground text-sm pr-2 leading-relaxed">
              Upgrade Your Everyday Tech. Latest gadgets, premium brands, and performance you can trust.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="border-lime-400/30 text-[#bef264] gap-1.5 py-1 px-2.5 rounded-full text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Checkout
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white gap-1.5 py-1 px-2.5 rounded-full text-xs">
                <Ship className="w-3.5 h-3.5" /> Express Dispatch
              </Badge>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-6 col-span-2 sm:grid-cols-3">
            {Object.entries(footerNavLinks).map(([section, links], idx) => (
              <div key={idx}>
                <h3 id={`footer-heading-${section}`} className="font-bold text-white text-xs mb-4 tracking-wider uppercase">{section}</h3>
                <ul aria-labelledby={`footer-heading-${section}`} className="space-y-2.5 text-xs">
                  {links.map((link, i) => (
                    <li key={`${link.label}-${i}`}>
                      <Link href={link.href} className="text-muted-foreground hover:text-[#bef264] transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="font-bold text-white tracking-wider uppercase text-xs">Stay in the Loop</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">Get exclusive drop alerts, deals, and tech updates.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="your.email@example.com"
                className="flex-1 bg-[#12141c] border-white/10 focus:border-lime-400 text-white placeholder:text-muted-foreground text-xs rounded-full px-4 h-10"
              />
              <Button type="submit" className="bg-[#bef264] hover:bg-lime-400 text-black font-extrabold text-xs rounded-full px-5 h-10 transition-transform hover:scale-105">
                Join <Send className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </div>

        </div>

        {/* Social + Legal */}
        <div className="border-t border-white/10 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((link, i) => (
              <Link 
                key={i} 
                href={link.href} 
                aria-label={link.label}
                className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-muted-foreground hover:text-[#bef264] hover:border-lime-400/40 hover:bg-white/[0.08] transition-all"
              >
                <link.icon className="w-4 h-4" />
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row items-center gap-4">
            <p className="text-center">&copy; {new Date().getFullYear()} TechStore Marketplace. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('techstore:reopen-cookie-settings'));
                }}
                className="hover:text-lime-300 transition-colors underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
