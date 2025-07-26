
"use client";

import Link from "next/link";
import { Menu, ShoppingCart, X, Search, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { auth, app } from "@/lib/firebase"; // Import app
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore'; // Import firestore functions

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/deals", label: "Deals" },
  { href: "/customizer", label: "Customizer" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (user) {
      const db = getFirestore(app);
      
      // Cart count listener
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const unsubscribeCart = onSnapshot(cartRef, (snapshot) => {
        setCartCount(snapshot.size);
      });

      // Wishlist count listener
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeWishlist = onSnapshot(userDocRef, (doc) => {
          const data = doc.data();
          setWishlistCount(data?.wishlist?.length || 0);
      });

      return () => {
        unsubscribeCart();
        unsubscribeWishlist();
      };
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [user]);

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/80" />
            <Input placeholder="Search transmissions..." className="pl-10 font-[Orbitron,Space Grotesk,monospace] bg-[#18182c]/80 border-cyan-400/30 focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-400/40 shadow-[0_0_8px_#00fff733]" />
          </div>
          <Button variant="ghost" size="icon" asChild className="relative hover:bg-cyan-400/10">
            <Link href="/wishlist">
              <Heart className="h-6 w-6 text-cyan-300" />
               {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white shadow-[0_0_8px_#ff00c8]">
                    {wishlistCount}
                  </span>
                )}
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>
          {/* Floating cart icon for mobile */}
          <div className="md:relative fixed bottom-6 right-6 md:bottom-auto md:right-auto z-[60] md:z-auto">
            <Button variant="ghost" size="icon" asChild className="relative bg-cyan-400/90 hover:bg-cyan-400 text-black md:bg-transparent md:text-cyan-300 shadow-[0_0_16px_#00fff7] md:shadow-none rounded-full md:rounded-none transition-all">
              <Link href="/checkout">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white animate-pulse shadow-[0_0_8px_#ff00c8]">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
          </div>
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
        <>
          <div className="fixed inset-0 z-40 bg-[#0c0c1e]" onClick={() => setIsMenuOpen(false)} />
          <div
            className="fixed inset-0 z-50 flex md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className="fixed left-0 top-0 h-full w-4/5 max-w-xs bg-[#10102a]/90 backdrop-blur-lg border-r border-cyan-400/20 p-6 shadow-2xl flex flex-col"
              style={{ boxShadow: '0 0 48px #00fff7cc, 0 0 8px #00fff7' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <Link href="/">
                  <Logo className="h-6 w-auto" />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-6 w-6 text-cyan-300" />
                </Button>
              </div>
              <nav className="flex flex-col space-y-4 mt-2">
                {allNavLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-bold tracking-wide font-[Orbitron,Space Grotesk,monospace] text-cyan-100 hover:text-cyan-400 transition-colors px-2 py-2 rounded-md hover:bg-cyan-400/10 focus:bg-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex-1" />
              {!loading && (
                user ? (
                  <Button className="w-full mt-8 font-[Orbitron,Space Grotesk,monospace] bg-cyan-400/20 text-cyan-100 border-cyan-400/40 hover:bg-cyan-400/30" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                    Logout
                  </Button>
                ) : (
                  <Button className="w-full mt-8 font-[Orbitron,Space Grotesk,monospace] bg-cyan-400/20 text-cyan-100 border-cyan-400/40 hover:bg-cyan-400/30" asChild>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  </Button>
                )
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
