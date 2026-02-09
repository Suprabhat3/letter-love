"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Heart, Calendar, Clock, Star, ArrowRight } from "lucide-react";

export default function MilestoneTracker() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-white via-pink-50/30 to-white">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px]"
        />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[500px] bg-orange-100/30 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6"
          >
            We know your feelings, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">
              and we have the words.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-foreground/60 max-w-2xl mx-auto font-light"
          >
            Every moment counts. Celebrate your journey together with words that
            last forever.
          </motion.p>
        </div>

        {/* Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 rounded-[3.5rem] blur opacity-30" />
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-12 overflow-hidden">
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-sm font-medium mb-6 animate-pulse">
                <Heart className="w-4 h-4 fill-pink-600" />
                <span>Relationship Tracker</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">
                From your <span className="text-pink-600">First Date</span> to
                your <span className="text-purple-600">Forever</span>
              </h3>

              <p className="text-foreground/70 mb-8 text-lg font-light leading-relaxed">
                Keep track of anniversaries, special memories, and little
                moments. We'll remind you when to write something sweet.
              </p>

              <Link
                href="/dashboard"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full font-bold shadow-lg hover:shadow-pink-500/25 transition-all hover:-translate-y-1"
              >
                <span>Start Your Timeline</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Visual Part - Timeline UI */}
            <div className="flex-1 w-full relative">
              <div className="relative bg-white rounded-[2rem] p-6 shadow-xl border border-pink-50/50 min-h-[300px] flex flex-col justify-center">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-transparent rounded-bl-[100px] opacity-50" />

                {/* Timeline Items */}
                <div className="space-y-6 relative ml-4">
                  {/* Line */}
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-pink-200 to-purple-100" />

                  <TimelineItem
                    icon={Calendar}
                    title="First Date"
                    date="Oct 12, 2023"
                    color="bg-pink-100 text-pink-600"
                    delay={0.2}
                  />
                  <TimelineItem
                    icon={Star}
                    title="First 'I Love You'"
                    date="Dec 24, 2023"
                    color="bg-purple-100 text-purple-600"
                    delay={0.4}
                  />
                  <TimelineItem
                    icon={Clock}
                    title="1 Year Anniversary"
                    date="Oct 12, 2024"
                    color="bg-orange-100 text-orange-600"
                    isNext
                    delay={0.6}
                  />
                </div>
              </div>

              {/* Floating Elements (Decor) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-12 z-20"
              >
                <span className="text-3xl">🎁</span>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center -rotate-6 z-20"
              >
                <span className="text-2xl">💌</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TimelineItem({ icon: Icon, title, date, color, isNext, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
      className="relative flex items-center gap-4 pl-2"
    >
      <div
        className={cn(
          "relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm",
          color,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div
        className={cn(
          "flex-1 p-3 rounded-xl border",
          isNext
            ? "bg-gradient-to-r from-pink-50 to-white border-pink-100"
            : "bg-white border-gray-50 shadow-sm",
        )}
      >
        <p className="font-bold text-foreground text-sm">{title}</p>
        <p className="text-xs text-foreground/50 font-medium mt-0.5">{date}</p>
      </div>
      {isNext && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <span className="inline-block w-2 H-2 rounded-full bg-pink-500 animate-ping" />
        </div>
      )}
    </motion.div>
  );
}
