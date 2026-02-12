"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { SparklesIcon } from "./SparklesIcon";

export default function HeroSection() {
  return (
    <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="blob-bg top-[-10%] md:top-[-20%] left-[-20%] md:left-[-10%] bg-pink-200/50 md:bg-pink-200/40 w-[450px] md:w-[800px] h-[450px] md:h-[800px]" />
        <div className="blob-bg top-[5%] md:top-[10%] right-[-20%] md:right-[-10%] bg-purple-200/45 md:bg-purple-200/40 w-[380px] md:w-[600px] h-[380px] md:h-[600px]" />
        <div className="blob-bg bottom-[10%] left-[5%] bg-pink-100/40 w-[350px] h-[350px] md:hidden" />
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

      {/* Mobile Character Image - Positioned at Bottom */}
      <div className="absolute left-1/2 bottom-[5%] -translate-x-1/2 w-[280px] xs:w-[320px] md:hidden pointer-events-none z-0">
        <Image
          src="/hero3.png"
          alt="Couple Character"
          width={800}
          height={800}
          className="w-full h-auto object-contain opacity-60 drop-shadow-2xl"
        />
      </div>

      {/* Mobile Floating Hearts - Static */}
      <div className="absolute top-[15%] left-[8%] md:hidden pointer-events-none z-0">
        <div className="text-5xl opacity-30">💕</div>
      </div>
      <div className="absolute top-[18%] right-[10%] md:hidden pointer-events-none z-0">
        <div className="text-4xl opacity-25">💌</div>
      </div>
      <div className="absolute top-[35%] left-[12%] md:hidden pointer-events-none z-0">
        <div className="text-3xl opacity-30">✨</div>
      </div>
      <div className="absolute top-[32%] right-[8%] md:hidden pointer-events-none z-0">
        <div className="text-4xl opacity-25">💖</div>
      </div>
      <div className="absolute top-[48%] left-[15%] md:hidden pointer-events-none z-0">
        <div className="text-3xl opacity-20">💝</div>
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center pb-40 md:pb-0">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-white shadow-md mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SparklesIcon className="text-pink-500" />
          <span className="text-sm font-medium text-foreground/80 text-pink-500 italic">
            AI-Powered Love Letters
          </span>
        </motion.div>

        {/* Heading */}
        <h1 className="text-[2.5rem] leading-[0.9] sm:leading-none sm:text-5xl md:text-6xl lg:text-7xl font-bold font-valty mb-2 md:mb-6 max-w-4xl text-foreground px-4 sm:px-0">
          Know Your Heart, <br />
          <span className="text-gradient">Share Your Love.</span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-xl text-foreground/70 mb-4 md:mb-10 max-w-2xl leading-relaxed px-2 sm:px-0 italic">
          Transform your scattered thoughts and memories into beautifully
          crafted love letters, poems, and notes. The perfect way to say exactly
          what you mean.
        </p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col w-full sm:w-auto sm:flex-row gap-3 md:gap-4 mb-8 md:mb-20 px-4 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            href="/templates"
            className="btn-primary w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full text-base md:text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex justify-center items-center"
          >
            Write a Letter
          </Link>
          <Link
            href="/templates"
            className="hidden sm:flex w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full bg-white/90 backdrop-blur-sm text-foreground font-semibold border border-pink-100 hover:bg-pink-50 transition-colors justify-center items-center shadow-md"
          >
            View Templates
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
