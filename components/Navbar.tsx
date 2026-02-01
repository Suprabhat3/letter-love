import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 rounded-none bg-white/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-primary"
        >
          Letter<span className="text-foreground">Love</span>.
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
          <Link
            href="#features"
            className="hover:text-primary transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="#testimonials"
            className="hover:text-primary transition-colors"
          >
            Stories
          </Link>
          <Link
            href="#pricing"
            className="hover:text-primary transition-colors"
          >
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/get-started"
            className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
