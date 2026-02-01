import Link from "next/link";
import { cn } from "@/lib/utils";
import { Twitter, Instagram, Github, Heart, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-white pt-20 pb-10 overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-200 via-purple-200 to-orange-200" />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-50/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-serif font-bold tracking-tight text-foreground">
                Letter<span className="text-pink-500">Love</span>.
              </span>
            </Link>
            <p className="text-foreground/60 text-lg leading-relaxed max-w-sm">
              Helping you find the perfect words for the people who matter most.
              Write from the heart, with a little help from AI.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="#" icon={Instagram} />
              <SocialLink href="#" icon={Github} />
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 md:col-span-4">
            <h4 className="font-bold text-foreground mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              <FooterLink href="#">Features</FooterLink>
              <FooterLink href="#">Pricing</FooterLink>
              <FooterLink href="#">Occasions</FooterLink>
              <FooterLink href="#">Gift Cards</FooterLink>
            </ul>
          </div>

          <div className="lg:col-span-2 md:col-span-4">
            <h4 className="font-bold text-foreground mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4 md:col-span-4">
            <h4 className="font-bold text-foreground mb-6">Stay Inspired</h4>
            <p className="text-sm text-foreground/60 mb-4">
              Get writing tips and romantic inspiration delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300 transition-all"
                />
              </div>
              <button className="bg-foreground text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-pink-600 transition-colors shadow-lg hover:shadow-pink-500/20">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground/50">
            &copy; {new Date().getFullYear()} LetterLove AI. All rights
            reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-foreground/60">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
            <span>in San Francisco</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <Link
      href={href}
      className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-colors"
    >
      <Icon className="w-5 h-5" />
    </Link>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="hover:text-pink-600 transition-colors block w-max relative group"
      >
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-300 transition-all duration-300 group-hover:w-full" />
      </Link>
    </li>
  );
}
