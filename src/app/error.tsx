'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error caught by boundary:', error);
  }, [error]);

  return (
    <div className="container min-h-[60vh] flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
        Something went wrong
      </h1>

      <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        We encountered a temporary disruption while loading this section. Our telemetry crew has been alerted.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          onClick={() => reset()}
          className="rounded-full bg-[#bef264] text-black font-bold hover:bg-lime-300 shadow-[0_0_20px_rgba(190,242,100,0.3)] gap-2 px-6"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>

        <Button
          variant="outline"
          asChild
          className="rounded-full border-white/20 text-white hover:bg-white/10 gap-2 px-6"
        >
          <Link href="/">
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </Button>
      </div>

      {process.env.NODE_ENV !== 'production' && error?.message && (
        <div className="mt-8 max-w-lg p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-rose-300 font-mono text-left overflow-x-auto">
          {error.message}
        </div>
      )}
    </div>
  );
}

