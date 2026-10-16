"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Laptop, ArrowRight, BookOpen, HelpCircle, Tag, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getProducts } from "@/lib/firestore-service";
import type { Product } from "@/lib/types";

interface SearchIndexItem {
  id: string;
  title: string;
  type: "product" | "page" | "faq" | "category";
  category?: string;
  url: string;
  description?: string;
  price?: number;
}

const STATIC_SEARCH_ITEMS: SearchIndexItem[] = [
  { id: "page-shop", title: "Shop All Hardware", type: "page", url: "/shop", description: "Browse all laptops, GPUs, peripherals and gear" },
  { id: "page-deals", title: "Special Deals & Discounts", type: "page", url: "/deals", description: "Exclusive promotional pricing and bundles" },
  { id: "page-categories", title: "Product Categories", type: "page", url: "/categories", description: "Laptops, Desktops, Graphic Cards, Displays" },
  { id: "page-customizer", title: "PC Customizer Rig Builder", type: "page", url: "/customizer", description: "Build and verify custom PC builds" },
  { id: "page-about", title: "About TechStore", type: "page", url: "/about", description: "Learn about our vision and hardware standards" },
  { id: "page-contact", title: "Contact Support Command", type: "page", url: "/contact", description: "Open a support ticket or speak with operators" },
  { id: "page-faq", title: "Frequently Asked Questions", type: "page", url: "/faq", description: "Answers on shipping, returns, and warranties" },
  { id: "page-warranty", title: "Warranty Information", type: "page", url: "/warranty", description: "1-year standard warranty and coverage terms" },
  { id: "faq-shipping", title: "What is standard shipping time?", type: "faq", url: "/faq", description: "Standard delivery takes 3-5 business days" },
  { id: "faq-return", title: "What is the return policy?", type: "faq", url: "/faq", description: "Returns accepted within 30 days of delivery" },
];

export default function SiteSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (products.length === 0) {
        setLoading(true);
        getProducts()
          .then((items) => setProducts(items))
          .catch(() => setProducts([]))
          .finally(() => setLoading(false));
      }
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Combine products with static items
  const allItems: SearchIndexItem[] = [
    ...products.map((p) => ({
      id: p.id,
      title: p.name,
      type: "product" as const,
      category: p.category,
      url: `/product/${p.id}`,
      description: p.description,
      price: p.price,
    })),
    ...STATIC_SEARCH_ITEMS,
  ];

  const filteredItems = query.trim() === ""
    ? allItems.slice(0, 6)
    : allItems
        .filter((item) => {
          const q = query.toLowerCase();
          return (
            item.title.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q)
          );
        })
        .slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      onOpenChange(false);
      router.push(filteredItems[selectedIndex].url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-[#0d0f17] border-white/15 text-white shadow-2xl rounded-2xl top-[25%] sm:top-[30%]">
        <DialogTitle className="sr-only">Search TechStore</DialogTitle>
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-lime-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search products, categories, docs, FAQs... (or press Esc to close)"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search content"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-lime-400" />}
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-white"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &ldquo;<span className="text-white font-medium">{query}</span>&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => onOpenChange(false)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? "bg-white/10 text-white border border-lime-400/30"
                      : "text-white/80 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-lime-400 shrink-0">
                      {item.type === "product" && <Laptop className="w-4 h-4" />}
                      {item.type === "page" && <BookOpen className="w-4 h-4" />}
                      {item.type === "faq" && <HelpCircle className="w-4 h-4" />}
                      {item.type === "category" && <Tag className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    {item.price !== undefined && (
                      <span className="font-bold text-lime-400">
                        KES {item.price.toLocaleString()}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-lime-400 translate-x-0.5' : 'text-muted-foreground'} transition-transform`} />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Navigate with <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">↓</kbd></span>
          <span>Select with <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">Enter</kbd></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

