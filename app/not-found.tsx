import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-background p-6">
      <div className="glass-panel max-w-md w-full rounded-3xl p-10 text-center border border-white/60 shadow-xl">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-3xl font-serif font-bold mb-3 text-foreground">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          This page doesn&apos;t exist. Maybe write a letter instead?
        </p>
        <Link
          href="/templates"
          className="btn-primary px-8 py-3 rounded-full font-semibold inline-block"
        >
          Browse templates
        </Link>
      </div>
    </main>
  );
}
