import Link from "next/link";
import { cn } from "@/lib/utils";
import { Twitter, Linkedin, Github, Heart, Mail } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-white pt-12 pb-8 md:pt-20 md:pb-10 overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-200 via-purple-200 to-orange-200" />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-pink-50/50 rounded-full blur-[60px] md:blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Decorative Images */}
      <div className="absolute inset-0 z-0 md:left-auto md:right-0 md:w-1/2 overflow-hidden pointer-events-none hidden md:block">
        <Image
          src="/footer1.png"
          alt=""
          fill
          className="object-cover md:object-contain md:object-right-bottom opacity-100"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 lg:mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-4 space-y-4 md:space-y-6 text-center lg:text-left flex flex-col items-center lg:block px-4">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-serif font-bold tracking-tight text-foreground font-valty">
                Letter<span className="text-pink-500">Love</span>.
              </span>
            </Link>
            <p className="text-foreground/60 text-base md:text-lg leading-relaxed max-w-sm mx-auto lg:mx-0 italic">
              Helping you find the perfect words for the people who matter most.
              Write from the heart, with a little help from AI.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <SocialLink
                href="https://x.com/suprabhat_3"
                target="_blank"
                icon={Twitter}
              />
              <SocialLink
                href="https://www.linkedin.com/in/suprabhatt/"
                target="_blank"
                icon={Linkedin}
              />
              <SocialLink
                href="https://github.com/suprabhat3"
                target="_blank"
                icon={Github}
              />
            </div>
          </div>

          {/* Links Columns */}
          <div className="col-span-1 lg:col-span-2 lg:pl-0 pl-4">
            <h4 className="font-bold text-foreground mb-4 md:mb-6">Explore</h4>
            <ul className="space-y-3 md:space-y-4 text-sm text-foreground/70">
              <FooterLink href="/templates">Browse Templates</FooterLink>
              <FooterLink href="/#features">How It Works</FooterLink>
              <FooterLink href="/#testimonials">Love Stories</FooterLink>
              <FooterLink href="/#support">Support Us</FooterLink>
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-foreground mb-4 md:mb-6">Company</h4>
            <ul className="space-y-3 md:space-y-4 text-sm text-foreground/70">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms & Conditions</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-pink-100/50 flex justify-center py-6">
          <p className="text-lg md:text-2xl font-valty italic text-foreground/60 text-center tracking-wide px-4 ">
            "To love and be loved is to feel the sun from both sides."
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon: Icon,
  target,
}: {
  href: string;
  icon: any;
  target: "_blank";
}) {
  return (
    <Link
      href={href}
      target={target}
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
