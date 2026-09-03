"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-background p-6">
      <div className="glass-panel max-w-md w-full rounded-3xl p-10 text-center border border-white/60 shadow-xl">
        <p className="text-6xl mb-4">💔</p>
        <h1 className="text-3xl font-serif font-bold mb-3 text-foreground">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page couldn&apos;t load. It&apos;s not you — try again in a
          moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="btn-primary px-6 py-3 rounded-full font-semibold"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-full font-semibold bg-white/60 border border-white/80 text-foreground/80 hover:bg-white transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
