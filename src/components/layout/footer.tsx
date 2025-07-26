
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
    { href: '#', label: 'Contact Us' },
    { href: '#', label: 'Shipping & Returns' },
    { href: '#', label: 'FAQ' },
    { href: '#', label: 'Warranty Info' },
  ],
  company: [
    { href: '#', label: 'About Zizo' },
    { href: '#', label: 'Mission Logs' },
    { href: '#', label: 'Join the Crew' },
    { href: '#', label: 'Press Kit' },
  ],
};

const socialLinks = [
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Github, label: 'GitHub' },
  { href: '#', icon: Bot, label: 'Discord' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0c0c1e] text-cyan-100/80 border-t border-cyan-400/20 pt-12 font-mono">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          {/* Branding Section */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <Logo className="h-8 w-auto" />
            <p className="text-muted-foreground pr-4 font-headline">
              Reinventing Tech Commerce. One Click at Light Speed.
            </p>
             <div className="flex space-x-2 pt-2">
               <Badge variant="outline" className="border-accent/40 text-accent gap-2"><ShieldCheck className="w-4 h-4"/> 100% Secure Checkout</Badge>
               <Badge variant="outline" className="border-primary/40 text-primary gap-2"><Ship className="w-4 h-4"/> Free Shipping</Badge>
             </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-3">
             <div>
              <h3 className="font-bold text-cyan-200 glow-primary mb-3">Shop</h3>
              <ul className="space-y-2">
                {footerNavLinks.shop.map((link, i) => (
                  <li key={`${link.label}-${i}`}><Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="font-bold text-cyan-200 glow-primary mb-3">Support</h3>
              <ul className="space-y-2">
                {footerNavLinks.support.map((link, i) => (
                  <li key={`${link.label}-${i}`}><Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="font-bold text-cyan-200 glow-primary mb-3">Company</h3>
              <ul className="space-y-2">
                {footerNavLinks.company.map((link, i) => (
                  <li key={`${link.label}-${i}`}><Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-cyan-400/10">
            {/* Newsletter */}
            <div>
                 <h3 className="font-bold text-cyan-200 glow-accent mb-3">Join the Mission</h3>
                 <p className="text-muted-foreground mb-4">Get exclusive deals and tech updates delivered to your inbox.</p>
                 <form className="flex space-x-2">
                    <Input type="email" placeholder="agent@zizo.net" className="flex-1 bg-[#18182c]/80 border-cyan-400/30 focus:border-cyan-400 text-cyan-100" />
                    <Button type="submit" variant="default" className="bg-accent text-white neon-glow">
                        Join <Send className="w-4 h-4 ml-2" />
                    </Button>
                 </form>
            </div>
            {/* Social Links */}
            <div className="md:text-right">
                <h3 className="font-bold text-cyan-200 glow-accent mb-3">Follow Our Logs</h3>
                <div className="flex gap-4 mt-4 md:justify-end">
                    {socialLinks.map((link, i) => (
                        <Link key={`${link.label}-${i}`} href={link.href} aria-label={link.label}>
                            <link.icon className="w-6 h-6 text-cyan-300 hover:text-accent transition-all hover:scale-110" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>

        {/* Legal Row */}
        <div className="border-t border-cyan-400/10 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p className="mb-2 sm:mb-0">&copy; {new Date().getFullYear()} Zizo_TechVerse. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary">Terms of Use</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
