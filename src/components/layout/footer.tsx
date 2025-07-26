
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
    <footer className="bg-[#0c0c1e] text-cyan-100/90 border-t border-cyan-400/10 font-mono">
      <div className="container max-w-7xl px-4 py-12 space-y-12">
        
        {/* Top Section: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Branding */}
          <div className="space-y-4">
            <Logo className="h-8 w-auto" />
            <p className="text-muted-foreground font-headline pr-2">
              Reinventing Tech Commerce. One Click at Light Speed.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="border-accent/30 text-accent gap-1">
                <ShieldCheck className="w-4 h-4" /> 100% Secure Checkout
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary gap-1">
                <Ship className="w-4 h-4" /> Free Shipping
              </Badge>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-6 col-span-2 sm:grid-cols-3">
            {Object.entries(footerNavLinks).map(([section, links], idx) => (
              <div key={idx}>
                <h3 className="font-bold text-cyan-200 text-sm mb-3 tracking-wide uppercase glow-accent">{section}</h3>
                <ul className="space-y-2 text-sm">
                  {links.map((link, i) => (
                    <li key={`${link.label}-${i}`}><Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="font-bold text-cyan-200 glow-accent tracking-wide uppercase text-sm">Join the Mission</h3>
            <p className="text-muted-foreground text-sm">Get exclusive deals and tech updates delivered to your inbox.</p>
            <form className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                type="email"
                placeholder="agent@zizo.net"
                className="flex-1 bg-[#18182c]/80 border-cyan-400/30 focus:border-cyan-400 text-cyan-100 placeholder:text-muted-foreground"
              />
              <Button type="submit" className="bg-accent text-white neon-glow hover:scale-[1.03]">
                Join <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>

        </div>

        {/* Social + Legal */}
        <div className="border-t border-cyan-400/10 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">

          {/* Social Links */}
          <div className="flex gap-5">
            {socialLinks.map((link, i) => (
              <Link key={i} href={link.href} aria-label={link.label}>
                <link.icon className="w-6 h-6 text-cyan-300 hover:text-accent transition-all hover:scale-110" />
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="text-sm text-muted-foreground flex flex-col sm:flex-row items-center gap-4">
            <p className="text-center">&copy; {new Date().getFullYear()} Zizo_TechVerse. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-accent">Terms of Use</Link>
              <Link href="/privacy" className="hover:text-accent">Privacy Policy</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
