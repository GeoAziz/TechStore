"use client";

import Link from "next/link";
import { Menu, ShoppingCart, X, Search } from 'lucide-react';
import { useState } from 'react';
import Logo from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/deals", label: "Deals" },
  { href: "/customizer", label: "Customizer" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  }

  const authNavs = user ? 
    [{ href: "/dashboard", label: "Dashboard" }] : [];

  const allNavLinks = [...navLinks, ...authNavs];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6">
            <Logo className="h-6 w-auto" />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {allNavLinks.map(link => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transmissions..." className="pl-10" />
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/checkout">
              <ShoppingCart className="h-6 w-6" />
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
          {!loading && (
            user ? (
              <Button variant="outline" className="hidden md:inline-flex" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button variant="outline" className="hidden md:inline-flex" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-4/5 max-w-xs bg-background border-r border-border p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <Logo className="h-6 w-auto" />
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-4">
              {allNavLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </nav>
             {!loading && (
              user ? (
                <Button className="w-full mt-8" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                  Logout
                </Button>
              ) : (
                <Button className="w-full mt-8" asChild>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
