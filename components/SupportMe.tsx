"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Coffee, Heart, Sparkles } from "lucide-react";

export default function SupportMe() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-pink-50/30 to-white -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-pink-200/20 via-purple-200/20 to-orange-200/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Main Glass Card */}
          <div className="relative isolate overflow-hidden bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-2xl p-8 md:p-16">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/80 via-white/20 to-white/40 opacity-50" />

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 text-pink-600 text-sm font-semibold border border-pink-200 shadow-sm mx-auto lg:mx-0"
                  >
                    <Sparkles className="w-4 h-4 fill-pink-600" />
                    <span>Support the Journey</span>
                  </motion.div>

                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                    Fuel the <span className="text-pink-600">Love</span> For
                    Code
                  </h2>

                  <p className="text-lg text-foreground/70 leading-relaxed font-sans">
                    Building{" "}
                    <strong className="text-pink-600">LetterLove</strong> is a
                    passion project. If these templates have helped you express
                    your feelings, consider buying me a coffee! Your support
                    creates more features, more templates, and keeps the love
                    flowing.
                  </p>
                </div>
              </div>

              {/* Right Visual - 3D Card */}
              <div className="relative flex justify-center lg:justify-end perspective-1000 group">
                {/* Floating Elements Background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-100 to-purple-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <motion.div
                  whileHover={{
                    rotateY: -10,
                    rotateX: 5,
                    scale: 1.02,
                    boxShadow: "20px 20px 60px -15px rgba(0,0,0,0.15)",
                  }}
                  initial={{ rotateY: 0, rotateX: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative bg-white p-6 rounded-3xl shadow-xl border border-gray-100/50 w-full max-w-xs transform-gpu transition-all duration-300"
                >
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-rose-400 rounded-full flex items-center justify-center shadow-lg transform rotate-12 z-20">
                    <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                  </div>

                  {/* QR Code Container */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-pink-300 transition-colors duration-300 flex items-center justify-center">
                    <Image
                      src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dchintu914908%40okaxis%26pn%3DLetterLove&color=db2777"
                      alt="Support QR Code"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover p-4 opacity-90 group-hover:opacity-100 transition-opacity"
                      unoptimized
                    />

                    {/* Scanner Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 animate-scan" />
                  </div>

                  <div className="mt-6 text-center space-y-2">
                    <p className="font-serif font-bold text-xl text-foreground">
                      Scan to Donate
                    </p>
                    <p className="text-xs text-foreground/50 font-medium tracking-wide uppercase">
                      Secure • Fast • Appreciated
                    </p>
                  </div>

                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-pink-100 rounded-tl-3xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-purple-100 rounded-br-3xl pointer-events-none" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
