import Image from "next/image";
import Link from "next/link";
import { SparklesIcon } from "./SparklesIcon";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="blob-bg top-[-20%] left-[-10%] bg-pink-200/40 w-[800px] h-[800px]" />
        <div className="blob-bg top-[10%] right-[-10%] bg-purple-200/40 w-[600px] h-[600px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white shadow-sm mb-8 animate-fade-in-up">
          <SparklesIcon className="text-pink-500" />
          <span className="text-sm font-medium text-foreground/80 text-pink-500">
            AI-Powered Love Letters
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold font-serif tracking-tight mb-6 max-w-4xl text-foreground">
          Know Your Heart, <br />
          <span className="text-gradient">Share Your Love.</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-foreground/70 mb-10 max-w-2xl leading-relaxed">
          Transform your scattered thoughts and memories into beautifully
          crafted love letters, poems, and notes. The perfect way to say exactly
          what you mean.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            href="/create"
            className="btn-primary px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Write a Letter
          </Link>
          <button className="px-8 py-4 rounded-full bg-white text-foreground font-semibold border border-pink-100 hover:bg-pink-50 transition-colors">
            View Examples
          </button>
        </div>

        {/* Hero Visual - 3 Phone Layout (Reference Image Style) */}
        <div className="relative w-full max-w-[1100px] mx-auto h-[600px] md:h-[700px] flex justify-center items-end mt-10">
          {/* Left Phone - Tilted Left */}
          <div className="absolute left-[5%] md:left-[10%] bottom-0 w-[260px] md:w-[320px] h-[520px] md:h-[640px] z-10 transition-all duration-500 ease-out transform -rotate-[8deg] origin-bottom hover:z-30 hover:scale-105 hover:-rotate-[12deg] group">
            <div className="w-full h-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-pink-50 to-purple-50 transition-all duration-500 group-hover:shadow-[0_0_50px_-5px_rgba(236,72,153,0.5)] border-4 border-pink-200">
              <Image
                src="/share-input1.png"
                alt="App Screen - Cycle History"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 260px, 320px"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pink-100/10 group-hover:opacity-0 transition-opacity duration-300" />
            </div>
          </div>

          {/* Right Phone - Tilted Right */}
          <div className="absolute right-[5%] md:right-[10%] bottom-0 w-[260px] md:w-[320px] h-[520px] md:h-[640px] z-10 transition-all duration-500 ease-out transform rotate-[8deg] origin-bottom hover:z-30 hover:scale-105 hover:rotate-[12deg] group">
            <div className="w-full h-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50 transition-all duration-500 group-hover:shadow-[0_0_50px_-5px_rgba(168,85,247,0.5)] border-4 border-purple-200">
              <Image
                src="/share-story1.png"
                alt="App Screen - Community Feed"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 260px, 320px"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-100/10 group-hover:opacity-0 transition-opacity duration-300" />
            </div>
          </div>

          {/* Center Phone - Straight (Larger) */}
          <div className="absolute left-1/2 bottom-0 w-[280px] md:w-[360px] h-[560px] md:h-[700px] z-20 transition-all duration-500 ease-out transform -translate-x-1/2 hover:z-30 hover:scale-[1.03] hover:-translate-y-2 group">
            <div className="w-full h-full rounded-[2.75rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] bg-white transition-all duration-500 group-hover:shadow-[0_30px_80px_-10px_rgba(236,72,153,0.4)] border-4 border-rose-200">
              <Image
                src="/ai-analysis1.png"
                alt="App Screen - Main Dashboard"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 280px, 360px"
              />
              {/* Optional: Add a subtle glow effect on the center phone */}
              <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
