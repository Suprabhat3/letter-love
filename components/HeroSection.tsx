"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { SparklesIcon } from "./SparklesIcon";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="blob-bg top-[-20%] left-[-10%] bg-pink-200/40 w-[800px] h-[800px]" />
        <div className="blob-bg top-[10%] right-[-10%] bg-purple-200/40 w-[600px] h-[600px]" />
      </div>

      {/* Decorative Character Images */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] lg:w-[400px] hidden md:block pointer-events-none z-0"
        animate={{
          y: [-10, -30, -10],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/hero-1.png"
          alt="Boy Character"
          width={1000}
          height={1000}
          className="w-full h-auto object-contain opacity-90 drop-shadow-2xl"
        />
      </motion.div>
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] lg:w-[400px] hidden md:block pointer-events-none z-0"
        animate={{
          y: [-10, -30, -10],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Image
          src="/hero2.png"
          alt="Girl Character"
          width={1000}
          height={1000}
          className="w-full h-auto object-contain opacity-90 drop-shadow-2xl"
        />
      </motion.div>

      {/* Mobile Character Image */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] xs:w-[320px] md:hidden pointer-events-none z-0"
        animate={{
          y: [-10, -20, -10],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/hero3.png"
          alt="Couple Character"
          width={800}
          height={800}
          className="w-full h-auto object-contain opacity-80 drop-shadow-2xl"
        />
      </motion.div>

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
      </div>
    </section>
  );
}
