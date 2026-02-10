"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Templates", href: "/templates" },
    { name: "How it Works", href: "/#features" },
    { name: "Stories", href: "/#testimonials" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <nav
        className={`fixed z-50 transition-all duration-300 ${
          scrolled ? "top-2 md:top-4" : "top-2 md:top-4"
        } left-0 right-0 flex justify-center px-4`}
      >
        <div
          className={`w-full max-w-7xl transition-all duration-300 ${
            scrolled
              ? "glass-panel rounded-full px-4 py-2.5 md:py-3 bg-white/80 shadow-lg backdrop-blur-xl"
              : "glass-panel rounded-2xl px-5 py-3 md:px-6 bg-white/60 backdrop-blur-lg"
          } flex items-center justify-between border border-white/40 shadow-sm`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-primary transition-colors group-hover:text-pink-600">
              Letter
            </span>
            <span className="text-foreground font-handwriting text-2xl md:text-3xl transition-transform group-hover:scale-110 group-hover:rotate-[-5deg] duration-300 origin-center text-pink-500 pb-1">
              Love
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground/70 hover:text-primary hover:font-semibold transition-all duration-200 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!loading &&
              (user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-pink-50"
                  >
                    My Cards
                  </Link>
                  <Link
                    href="/templates"
                    className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-pink-200/50 shadow-lg hover:shadow-pink-300/60 transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    + Create New
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-pink-50"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/templates"
                    className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-pink-200/50 shadow-lg hover:shadow-pink-300/60 transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </>
              ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-full hover:bg-black/5 text-foreground/80 transition-colors focus:outline-none active:scale-95"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-5">
              <span
                className={`absolute left-0 w-full h-0.5 bg-current rounded-full transition-all duration-300 ${
                  isMenuOpen ? "top-2.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 w-full h-0.5 bg-current rounded-full transition-all duration-300 ${
                  isMenuOpen ? "opacity-0 top-2.5" : "top-2.5 opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 w-full h-0.5 bg-current rounded-full transition-all duration-300 ${
                  isMenuOpen ? "top-2.5 -rotate-45" : "top-5"
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-gradient-to-b from-white/95 to-pink-50/95 backdrop-blur-2xl transition-all duration-500 ease-[bezier(0.32,0.72,0,1)] md:hidden ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center min-h-full h-full gap-8 p-4 overflow-y-auto">
          {navLinks.map((link, idx) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`text-3xl font-serif font-medium text-foreground/80 hover:text-primary transition-all duration-500 transform ${
                isMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-8 opacity-0"
              }`}
              style={{
                transitionDelay: `${isMenuOpen ? idx * 100 + 100 : 0}ms`,
              }}
            >
              {link.name}
            </Link>
          ))}
          <div
            className={`w-16 h-0.5 bg-border/50 rounded-full my-2 transition-all duration-500 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "400ms" }}
          ></div>

          <div
            className={`flex flex-col items-center gap-6 w-full max-w-xs transition-all duration-700 delay-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {!loading &&
              (user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium text-foreground/70 hover:text-primary transition-colors w-full text-center py-2"
                  >
                    My Cards
                  </Link>
                  <Link
                    href="/templates"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary w-full py-3.5 rounded-full text-lg font-bold shadow-xl shadow-pink-200/50 flex justify-center items-center"
                  >
                    + Create New
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium text-foreground/70 hover:text-primary transition-colors w-full text-center py-2"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/templates"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary w-full py-3.5 rounded-full text-lg font-bold shadow-xl shadow-pink-200/50 flex justify-center items-center"
                  >
                    Get Started
                  </Link>
                </>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
