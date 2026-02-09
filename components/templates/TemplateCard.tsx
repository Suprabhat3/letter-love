"use client";

import { motion, useAnimation } from "motion/react";
import Link from "next/link";
import { Template, CATEGORIES } from "@/lib/types";
import { Clock, Star, ArrowRight, Tag, Eye } from "lucide-react";
import { useState, useEffect } from "react";

interface TemplateCardProps {
  template: Template;
  index: number;
  onQuickView?: (template: Template) => void;
}

export default function TemplateCard({
  template,
  index,
  onQuickView,
}: TemplateCardProps) {
  const category = CATEGORIES.find((c) => c.id === template.category);
  const [isHovered, setIsHovered] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = `"${template.previewText}"`;

  // Typing effect logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isHovered) {
      setTypedText("");
      let i = 0;
      const type = () => {
        if (i < fullText.length) {
          setTypedText(fullText.substring(0, i + 1));
          i++;
          timeout = setTimeout(type, 30); // Typing speed
        }
      };
      type();
    } else {
      setTypedText("");
    }
    return () => clearTimeout(timeout);
  }, [isHovered, fullText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/templates/${template.id}`} className="block h-full">
        <motion.div
          className="relative h-full min-h-[380px] rounded-3xl overflow-hidden shadow-sm transition-all duration-500 border border-white/20"
          style={{
            background: `linear-gradient(135deg, ${template.colors.secondary}15 0%, ${template.colors.primary}05 100%)`,
          }}
          whileHover={{
            y: -8,
            boxShadow:
              "0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Glass background */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md transition-opacity duration-300 group-hover:bg-white/70" />

          {/* Decorative blob */}
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: template.colors.primary }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Content Container */}
          <div className="relative z-10 h-full p-7 flex flex-col">
            {/* Header: Category & Popularity */}
            <div className="flex items-center justify-between mb-6">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 backdrop-blur-sm"
                style={{
                  backgroundColor: `${template.colors.primary}15`,
                  color: template.colors.accent,
                  border: `1px solid ${template.colors.primary}30`,
                }}
              >
                {category?.emoji} {category?.name}
              </span>

              {template.popularity && template.popularity >= 4 && (
                <div className="flex items-center gap-1 text-amber-500 bg-amber-100 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  <Star size={12} fill="currentColor" />
                  <span>Popular</span>
                </div>
              )}
            </div>

            {/* Main Interactive Area */}
            <div className="flex-1 flex flex-col relative">
              {/* Default View (Emoji + Title) */}
              <motion.div
                animate={{
                  opacity: isHovered ? 0 : 1,
                  y: isHovered ? -10 : 0,
                  scale: isHovered ? 0.95 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center absolute inset-0 text-center"
                style={{ pointerEvents: isHovered ? "none" : "auto" }}
              >
                <div className="mb-6">
                  <div className="text-7xl filter drop-shadow-xl p-4 bg-white/40 rounded-full backdrop-blur-md shadow-inner border border-white/50">
                    {template.emoji}
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-bold text-foreground/90">
                  {template.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed max-w-[200px]">
                  {template.description}
                </p>
              </motion.div>

              {/* Hover View (Typewriter Effect) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="absolute inset-x-0 top-0 bottom-16 flex flex-col justify-center items-center text-center p-2"
              >
                <p className="font-handwriting text-xl text-foreground/80 leading-relaxed italic relative">
                  <span className="absolute -top-4 -left-2 text-4xl text-primary/20">
                    "
                  </span>
                  {typedText}
                  <span className="animate-pulse">|</span>
                  <span className="absolute -bottom-4 -right-2 text-4xl text-primary/20">
                    "
                  </span>
                </p>
                <p className="text-xs font-medium text-primary mt-4 uppercase tracking-widest opacity-60">
                  Previewing...
                </p>
              </motion.div>
            </div>

            {/* Footer / Meta Info (Always Visible but shifts) */}
            <div className="mt-auto pt-6 border-t border-white/30 relative">
              <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                <div className="flex items-center gap-3">
                  {template.estimatedTime && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{template.estimatedTime}</span>
                    </div>
                  )}
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Tag size={12} />
                    <span>{template.tags?.[0] || "Personal"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Action Button (Appears on Hover) */}
            <div className="absolute bottom-6 right-6 z-20 flex gap-2">
              {onQuickView && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0, x: 20 }}
                  animate={{
                    scale: isHovered ? 1 : 0.8,
                    opacity: isHovered ? 1 : 0,
                    x: isHovered ? 0 : 20,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.05,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    onQuickView(template);
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-foreground/80 bg-white shadow-lg hover:bg-gray-50 transition-colors"
                  title="Quick View"
                >
                  <Eye size={20} />
                </motion.button>
              )}

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isHovered ? 1 : 0.8,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-110 active:scale-95 bg-gradient-to-br from-primary to-pink-600">
                  <ArrowRight size={22} />
                </span>
              </motion.div>
            </div>
          </div>

          {/* Focus Ring */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 0 1px ${template.colors.primary}60`,
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
