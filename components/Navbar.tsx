import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-8 right-8 z-50 glass-panel border-b-0 rounded-lg bg-white/50">
      <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-primary hover:text-pink-500 cursor-pointer"
        >
          Letter
          <span className="text-foreground font-handwriting text-3xl hover:text-pink-500 cursor-pointer">
            Love
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80 ">
          <Link
            href="#features"
            className="transition-colors hover:text-pink-500 font-bold"
          >
            How it Works
          </Link>
          <Link
            href="#testimonials"
            className="transition-colors hover:text-pink-500 font-bold"
          >
            Stories
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-pink-500 font-bold"
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
