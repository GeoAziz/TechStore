import Link from 'next/link';
import { Compass, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container min-h-[65vh] flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 mb-6 shadow-[0_0_40px_rgba(190,242,100,0.25)]">
        <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '12s' }} />
      </div>

      <div className="font-mono text-xs font-bold tracking-[0.3em] text-[#bef264] uppercase mb-2">
        Error 404 • Destination Unreachable
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        The coordinates you entered do not correspond to any active sector in our marketplace.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          asChild
          className="rounded-full bg-[#bef264] text-black font-bold hover:bg-lime-300 shadow-[0_0_20px_rgba(190,242,100,0.3)] gap-2 px-6"
        >
          <Link href="/">
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          asChild
          className="rounded-full border-white/20 text-white hover:bg-white/10 gap-2 px-6"
        >
          <Link href="/shop">
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Catalog</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

