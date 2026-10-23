"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X, Heart, User, Home as HomeIcon, Search, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from "./logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";
import { useWishlist } from "@/context/wishlist-context";
import SiteSearchDialog from "@/components/search/site-search-dialog";

const navLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/shop", label: "Shop" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Deals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { user, handleLogout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { wishlistIds } = useWishlist();
  const wishlistCount = wishlistIds.length;

  // Keyboard shortcut Ctrl+K / Cmd+K to open search dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full pt-3 pb-2 px-4 pointer-events-none transition-all no-print">
        <div className="container max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 rounded-lg p-1">
              <Logo className="h-7 w-auto transition-transform group-hover:scale-105" textClassName="hidden min-[360px]:inline-block" />
            </Link>
          </div>

          {/* Center: Floating Capsule Island Nav (Desktop) */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(link.href.split('?')[0]));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 ${
                    isActive
                      ? "bg-secondary text-foreground shadow-inner font-bold border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Circular Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Search Button (Feature 14) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card/90 backdrop-blur-xl border border-border hover:border-lime-400/50 hover:bg-muted/50 transition-all group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              aria-label="Search website content (Press Cmd+K or Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-foreground/80 group-hover:text-lime-500 dark:group-hover:text-lime-300 transition-colors" />
            </button>

            {/* Dark/Light Mode Toggle (Feature 1) */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card/90 backdrop-blur-xl border border-border hover:border-lime-400/50 hover:bg-muted/50 transition-all group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-white/90 group-hover:text-amber-300 transition-colors" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 group-hover:text-indigo-600 transition-colors" />
              )}
            </button>

            {/* Cart Icon Button with Lime Indicator */}
            <Link
              href="/checkout"
              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card/90 backdrop-blur-xl border border-border hover:border-lime-400/50 hover:bg-muted/50 transition-all group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              aria-label={`Shopping Cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-foreground/80 group-hover:text-lime-500 dark:group-hover:text-lime-300 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#bef264] text-[10px] font-black text-black shadow-[0_0_8px_rgba(190,242,100,0.8)]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card/90 backdrop-blur-xl border border-border hover:border-lime-400/50 hover:bg-muted/50 transition-all group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className="w-4 h-4 text-foreground/80 group-hover:text-lime-500 dark:group-hover:text-lime-300 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-pink-500 text-[10px] font-black text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Button */}
            <Link
              href={user ? "/dashboard" : "/login"}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card/90 backdrop-blur-xl border border-border hover:border-lime-400/50 hover:bg-muted/50 transition-all group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              aria-label={user ? "User Dashboard" : "Sign In"}
              title={user ? `Signed in as ${user.displayName || user.email}` : "Sign In"}
            >
              <User className="w-4 h-4 text-foreground/80 group-hover:text-lime-500 dark:group-hover:text-lime-300 transition-colors" />
            </Link>

            {/* Mobile Menu Toggle Button (Feature 2) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card/90 backdrop-blur-xl border border-border text-foreground hover:border-lime-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Feature 2) */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md pointer-events-auto transition-opacity"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              className="fixed right-0 top-0 bottom-0 z-50 w-4/5 max-w-sm bg-card border-l border-border p-6 shadow-2xl flex flex-col pointer-events-auto overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <Logo className="h-6 w-auto" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Search Trigger */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Search className="w-4 h-4 text-lime-500" />
                  <span>Search products & guides...</span>
                </button>
              </div>

              <nav className="flex flex-col gap-2 mt-6">
                {navLinks.map((link) => {
                  const isActive = link.href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(link.href.split('?')[0]));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 ${
                        isActive
                          ? "bg-secondary text-foreground border border-lime-400/30 font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-lime-600 dark:text-lime-300 hover:bg-muted/50"
                  >
                    My Dashboard
                  </Link>
                ) : null}
              </nav>

              <div className="mt-auto pt-6 border-t border-border space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-muted-foreground">Theme</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-semibold text-foreground"
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                    <span className="capitalize">{theme} Mode</span>
                  </button>
                </div>

                {user ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    className="w-full rounded-full bg-[#bef264] text-black font-extrabold hover:bg-lime-300 shadow-[0_0_15px_rgba(190,242,100,0.4)]"
                    asChild
                  >
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Global Site-Wide Search Dialog (Feature 14) */}
      <SiteSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
