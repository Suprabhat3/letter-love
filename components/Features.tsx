"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Sparkles, Bot, HeartHandshake } from "lucide-react";
import { SparklesIcon } from "./SparklesIcon";
import { ZapIcon } from "./ZapIcon";
import { HeartIcon } from "./HeartIcon";

// Feature Data
const features = [
  {
    icon: SparklesIcon,
    title: "Share Your Story",
    description:
      "Tell us a few details about your person, your memory, or your feelings. No writing skills needed—just speak from the heart.",
    image: "/share-input1.png",
    color: "from-orange-400 to-rose-500",
    bg: "bg-orange-50",
  },
  {
    icon: ZapIcon,
    title: "AI Magic Analysis",
    description:
      "Our advanced AI analyzes the emotional tone and context of your input to draft a perfectly worded letter or poem that sounds just like you.",
    image: "/ai-analysis1.png",
    color: "from-green-400 to-blue-500",
    bg: "bg-green-50",
  },
  {
    icon: HeartIcon,
    title: "Customize & Share",
    description:
      "Edit the result to perfection, choose a beautiful background theme, and send it as a digital card or print it out for a physical keepsake.",
    image: "/share-story1.png",
    color: "from-pink-400 to-rose-500",
    bg: "bg-pink-100",
  },
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll progress for the main line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-pink-50 to-rose-50"
    >
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/30 rounded-full blur-3xl mix-blend-multiply filter" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply filter" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/50 border border-pink-200 text-pink-600 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>Process</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold font-serif mb-6 text-foreground"
          >
            Your Journey to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">
              The Perfect Words
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-foreground/60 leading-relaxed"
          >
            Follow our simple path to create something truly meaningful. We
            handle the complexity, so you can focus on the feeling.
          </motion.p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Vertical Line (Desktop) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gray-300 hidden md:block rounded-full">
            <motion.div
              style={{ scaleY }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-pink-500 via-purple-500 to-orange-400 origin-top rounded-full"
            />
          </div>

          {/* Mobile Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100 md:hidden rounded-full">
            <motion.div
              style={{ scaleY }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-pink-500 via-purple-500 to-orange-400 origin-top rounded-full"
            />
          </div>

          <div className="space-y-24 md:space-y-40">
            {features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ feature, index }: { feature: any; index: number }) {
  const isEven = index % 2 === 0;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col md:flex-row items-center gap-10 md:gap-20",
        isEven ? "md:flex-row" : "md:flex-row-reverse",
      )}
    >
      {/* Timeline Node on the line */}
      <div className="absolute left-8 md:left-1/2 top-0 md:top-1/2 transform -translate-x-1/2 md:-translate-y-1/2 z-20">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "w-16 h-16 rounded-full border-4 border-white shadow-xl flex items-center justify-center bg-gradient-to-br",
            feature.color,
          )}
        >
          <feature.icon className="w-7 h-7 text-white" />
        </motion.div>
      </div>

      {/* Content Side */}
      <div
        className={cn(
          "w-full md:w-1/2 pl-24 md:pl-0",
          isEven ? "md:text-right md:pr-16" : "md:text-left md:pl-16",
        )}
      >
        <motion.div
          initial={{ opacity: 0, x: isEven ? -50 : 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={cn("inline-block p-3 rounded-2xl mb-4", feature.bg)}>
            <span
              className={cn(
                "text-sm font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r",
                feature.color,
              )}
            >
              Step {index + 1}
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-4 text-foreground">
            {feature.title}
          </h3>
          <p className="text-lg text-foreground/70 leading-relaxed mb-6">
            {feature.description}
          </p>
        </motion.div>
      </div>

      {/* Image Side */}
      <div
        className={cn(
          "w-full md:w-1/2 pl-24 md:pl-0 flex",
          isEven
            ? "justify-center md:justify-start md:-ml-24"
            : "justify-center md:justify-end md:-mr-24",
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative w-full max-w-[600px] aspect-square flex items-center justify-center translate-x-0"
        >
          {/* Backlight Glow */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full blur-[60px] opacity-40",
              feature.color,
            )}
          />

          {/* Floating Image */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: isEven ? 0 : 3,
            }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            className="relative w-full h-full drop-shadow-2xl"
          >
            <Image
              src={feature.image}
              alt={feature.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
