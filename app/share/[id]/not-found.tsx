import Link from "next/link";

// A dead share link is seen by a *recipient* — someone who was sent a letter by
// a person they care about. It is the worst possible place for a bare 404.
export default function ShareNotFound() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-background p-6">
      <div className="glass-panel max-w-md w-full rounded-3xl p-10 text-center border border-white/60 shadow-xl">
        <p className="text-6xl mb-4">💌</p>
        <h1 className="text-3xl font-serif font-bold mb-3 text-foreground">
          This letter isn&apos;t here
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The link may be mistyped, or the sender deleted it. Ask them to send
          it again — or write one of your own.
        </p>
        <Link
          href="/templates"
          className="btn-primary px-8 py-3 rounded-full font-semibold inline-block"
        >
          Write a letter 💕
        </Link>
      </div>
    </main>
  );
}
