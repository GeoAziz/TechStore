
'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from './logo';
import { Github, Send, ShieldCheck, Ship, Twitter, Bot, CheckCircle2, CreditCard } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

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
    { href: '/about', label: 'About Us' },
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
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address to subscribe.',
      });
      return;
    }
    setIsSubscribed(true);
    toast({
      title: 'Welcome to the Frequency!',
      description: "You've successfully subscribed to TechStore drop alerts and updates.",
    });
    setEmail('');
  };
  return (
    <footer className="bg-card text-foreground/80 border-t border-border font-sans transition-colors duration-200">
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
              <Badge variant="outline" className="border-lime-400/30 text-lime-600 dark:text-[#bef264] gap-1.5 py-1 px-2.5 rounded-full text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Checkout
              </Badge>
              <Badge variant="outline" className="border-border text-foreground gap-1.5 py-1 px-2.5 rounded-full text-xs">
                <Ship className="w-3.5 h-3.5" /> Express Dispatch
              </Badge>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-6 col-span-2 sm:grid-cols-3">
            {Object.entries(footerNavLinks).map(([section, links], idx) => (
              <div key={idx}>
                <h3 id={`footer-heading-${section}`} className="font-bold text-foreground text-xs mb-4 tracking-wider uppercase">{section}</h3>
                <ul aria-labelledby={`footer-heading-${section}`} className="space-y-2.5 text-xs">
                  {links.map((link, i) => (
                    <li key={`${link.label}-${i}`}>
                      <Link href={link.href} className="text-muted-foreground hover:text-lime-600 dark:hover:text-[#bef264] transition-colors">
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
            <h3 className="font-bold text-foreground tracking-wider uppercase text-xs">Stay in the Loop</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">Get exclusive drop alerts, deals, and tech updates.</p>
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-lime-500 shrink-0" />
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <Input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="flex-1 bg-secondary/80 border-border focus:border-lime-400 text-foreground placeholder:text-muted-foreground text-xs rounded-full px-4 h-10"
                />
                <Button type="submit" className="bg-[#bef264] hover:bg-lime-400 text-black font-extrabold text-xs rounded-full px-5 h-10 transition-transform hover:scale-105">
                  Join <Send className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </form>
            )}
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

          {/* Legal + Payment Methods */}
          <div className="text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4 w-full lg:w-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground/80">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/5 font-mono">
                <CreditCard className="w-3 h-3 text-lime-400" /> Card / M-Pesa
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/5 font-mono">
                Stripe Verified
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
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

      </div>
    </footer>
  );
}
