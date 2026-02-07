"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Template, CATEGORIES } from "@/lib/types";

interface TemplateCardProps {
  template: Template;
  index: number;
}

export default function TemplateCard({ template, index }: TemplateCardProps) {
  const category = CATEGORIES.find((c) => c.id === template.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/templates/${template.id}`}>
        <div
          className="group relative h-[320px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${template.colors.secondary}40 0%, ${template.colors.primary}20 100%)`,
          }}
        >
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

          {/* Decorative blob */}
          <motion.div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
            style={{ backgroundColor: template.colors.primary }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Content */}
          <div className="relative z-10 h-full p-6 flex flex-col">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md"
                style={{
                  backgroundColor: `${template.colors.primary}20`,
                  color: template.colors.accent,
                }}
              >
                {category?.emoji} {category?.name}
              </span>
            </div>

            {/* Emoji */}
            <motion.div
              className="text-6xl mb-4 filter drop-shadow-lg"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              {template.emoji}
            </motion.div>

            {/* Title */}
            <h3
              className="text-2xl font-serif font-bold mb-2"
              style={{ color: template.colors.accent }}
            >
              {template.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
              {template.description}
            </p>

            {/* Preview text */}
            <p className="text-xs text-foreground/50 italic mt-auto line-clamp-2 font-serif">
              "{template.previewText}"
            </p>

            {/* Hover CTA */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              style={{
                background: `linear-gradient(to top, ${template.colors.primary}, transparent)`,
              }}
            >
              <span className="text-white font-semibold text-sm flex items-center justify-center gap-2">
                Create Card
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Border glow on hover */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 0 2px ${template.colors.primary}60`,
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
