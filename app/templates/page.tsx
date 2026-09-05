"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { templates } from "@/lib/templates";
import {
  FALLBACK_FEATURED,
  currentOccasion,
  occasionCountdown,
} from "@/lib/occasions";
import { CATEGORIES, TemplateCategory, Template } from "@/lib/types";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import Navbar from "@/components/Navbar";
import { Search, Users, X, Star, Zap } from "lucide-react";
import { SparklesIcon } from "@/components/SparklesIcon";

/**
 * The upcoming occasion, read on the client only.
 *
 * `useSyncExternalStore` rather than a plain call, for two reasons. This page
 * is prerendered, so a `new Date()` evaluated during render would be the build
 * date — the banner would be permanently stuck on whatever was coming up the
 * day we deployed. And a value that differs between the server HTML and the
 * first client render is a hydration mismatch; the server snapshot returning
 * "" makes the banner render generic first and swap in on the client, which is
 * the one shape React guarantees is safe.
 *
 * The snapshot is a plain string (`"diwali|Diwali in 3 days"`) because
 * `getSnapshot` must return a stable value — handing back a fresh object each
 * call is the classic infinite-loop bug with this hook. It carries the badge
 * copy too, so nothing downstream has to read the clock a second time and
 * risk disagreeing with it.
 */
const NO_SUBSCRIBE = () => () => {};
const serverOccasion = () => "";
function clientOccasion(): string {
  const found = currentOccasion();
  return found
    ? `${found.occasion.templateId}|${occasionCountdown(found)}`
    : "";
}

/** easeOutExpo (easings.net), as the tuple Motion takes. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const RECIPIENTS = [
  { id: "all", label: "Anyone" },
  { id: "Partner", label: "Partner" },
  { id: "Friend", label: "Friend" },
  { id: "Family", label: "Family" },
  { id: "Spouse", label: "Spouse" },
];

/** Feeds `.ll-rise-in`'s per-node delay without a style object per call site. */
const delay = (ms: number) => ({ "--ll-delay": `${ms}ms` }) as CSSProperties;

/**
 * A filter chip whose active state is one shared, sliding pill.
 *
 * The old chips each animated their own background and a `scale-105`, so
 * changing filter read as one thing shrinking and an unrelated thing growing.
 * A `layoutId` makes it a single element moving between them — which is also
 * the only version of this that survives the chip row wrapping onto two lines,
 * where a measured sliding underline would not.
 */
function FilterChip({
  active,
  onClick,
  layoutId,
  animate,
  children,
  className = "",
  activeTextClassName,
  pillClassName,
  idleClassName,
}: {
  active: boolean;
  onClick: () => void;
  layoutId: string;
  /** False under reduced motion: the pill still moves, just without the tween. */
  animate: boolean;
  children: ReactNode;
  className?: string;
  /** Colour the label takes when selected. The background is the pill's job. */
  activeTextClassName: string;
  /** The travelling background. Deliberately separate from the label colour —
   *  if the button painted its own background too, the pill would have nothing
   *  left to reveal and the slide would be invisible. */
  pillClassName: string;
  idleClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // `isolate` keeps the pill's negative z-index inside this button rather
      // than letting it fall behind the toolbar's own background.
      className={`relative isolate cursor-pointer rounded-full transition-colors duration-300 ease-out-soft active:scale-[0.96] active:duration-150 ${
        active ? activeTextClassName : idleClassName
      } ${className}`}
    >
      {active &&
        (animate ? (
          <motion.span
            aria-hidden
            layoutId={layoutId}
            className={`absolute inset-0 -z-10 rounded-full ${pillClassName}`}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          />
        ) : (
          <span
            aria-hidden
            className={`absolute inset-0 -z-10 rounded-full ${pillClassName}`}
          />
        ))}
      <span className="relative">{children}</span>
    </button>
  );
}

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [activeRecipient, setActiveRecipient] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const reduceMotion = useReducedMotion();

  const occasionKey = useSyncExternalStore(
    NO_SUBSCRIBE,
    clientOccasion,
    serverOccasion,
  );

  // "Featured This Week" was pinned to `birthday-wish` in JSX, so the gallery
  // said the same thing in the week before Diwali as it did in March.
  const featured = useMemo(() => {
    const [templateId = "", badge = ""] = occasionKey.split("|");
    const template = templates.find(
      (t) => t.id === (templateId || FALLBACK_FEATURED),
    );
    if (!template) return null;
    return { template, badge: badge || "Featured This Week" };
  }, [occasionKey]);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return templates.filter((template) => {
      // 1. Filter by Category
      const matchesCategory =
        activeCategory === "all" || template.category === activeCategory;

      // 2. Filter by Recipient (via tags)
      const matchesRecipient =
        activeRecipient === "all" || template.tags?.includes(activeRecipient);

      // 3. Filter by Search Query
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesRecipient && matchesSearch;
    });
  }, [activeCategory, activeRecipient, searchQuery]);

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    activeCategory !== "all" ||
    activeRecipient !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setActiveRecipient("all");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <Navbar />

      {/*
        Ambient wash.

        These were three `motion.div`s running infinite scale/opacity/rotate
        loops on 800px `blur-3xl` circles — a permanent main-thread animation
        behind a scrollable grid, which is the worst place to put one. Same
        look, but driven by the card engine's `.ll-blob` keyframe: composited
        off the main thread, and already switched off by the reduced-motion
        rule in globals.css.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="ll-blob bg-linear-to-br from-pink-200/40 to-red-200/40"
          style={
            {
              top: "-10%",
              left: "-10%",
              width: "50rem",
              height: "50rem",
              "--ll-duration": "18s",
              "--ll-opacity": "0.35",
            } as CSSProperties
          }
        />
        <div
          className="ll-blob bg-linear-to-tr from-purple-200/40 to-blue-200/40"
          style={
            {
              bottom: "-10%",
              right: "-10%",
              width: "44rem",
              height: "44rem",
              "--ll-duration": "22s",
              "--ll-delay": "2s",
              "--ll-opacity": "0.35",
            } as CSSProperties
          }
        />
        <div className="absolute top-1/2 left-1/2 h-300 w-300 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-[100px]" />
      </div>

      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero. A CSS stagger rather than four motion components: this is the
            very first paint of the route, when the main thread is busiest. */}
        <div className="relative mx-auto mb-14 max-w-4xl space-y-6 pt-18 text-center">
          <div
            className="ll-rise-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 py-1.5 text-sm font-medium text-foreground/80 shadow-xs backdrop-blur-md"
            style={delay(0)}
          >
            <SparklesIcon size={14} className="text-pink-600" />
            <span className="bg-linear-to-r from-pink-600 to-rose-600 bg-clip-text font-semibold italic text-transparent">
              AI-Powered Templates
            </span>
          </div>

          <h1
            className="ll-rise-in font-valty font-serif text-6xl font-bold tracking-tight text-foreground drop-shadow-xs md:text-8xl"
            style={delay(60)}
          >
            Find the Perfect{" "}
            <span className="text-gradient p-2 italic">Words</span>
          </h1>

          <p
            className="ll-rise-in mx-auto max-w-2xl font-serif text-xl leading-relaxed text-muted-foreground italic md:text-2xl"
            style={delay(120)}
          >
            Browse our collection of handcrafted templates. From romantic
            letters to heartfelt apologies, let AI help you express exactly how
            you feel.
          </p>
        </div>

        {/* Featured Template Banner */}
        {featured && !isFiltered && (
          <div
            className="ll-rise-in mx-auto mb-14 max-w-5xl"
            style={delay(180)}
          >
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-xl">
              <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 -mb-10 -ml-10 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center gap-8 p-8 md:flex-row md:p-12">
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-3 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                    <Star size={12} className="fill-current" /> {featured.badge}
                  </div>
                  <h2 className="font-serif text-3xl font-bold md:text-5xl">
                    {featured.template.name}
                  </h2>
                  <p className="mx-auto max-w-md text-lg text-pink-100 md:mx-0">
                    {featured.template.description}. Perfect for telling them
                    how much they mean to you.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-4 md:justify-start">
                    <Link
                      href={`/templates/${featured.template.id}`}
                      className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-bold text-pink-600 shadow-lg transition-[transform,box-shadow] duration-200 ease-out-strong active:scale-[0.97] active:duration-100 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-xl"
                    >
                      <Zap size={18} className="fill-current" /> Create Now
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(featured.template)}
                      className="rounded-full border-2 border-white/30 px-6 py-3.5 font-semibold text-white transition-[background-color,transform] duration-200 ease-out-strong hover:bg-white/10 active:scale-[0.97] active:duration-100"
                    >
                      Preview Demo
                    </button>
                  </div>
                </div>
                <div className="animate-float text-[120px] leading-none drop-shadow-2xl md:text-[160px]">
                  {featured.template.emoji}
                </div>
              </div>
            </div>
          </div>
        )}

        {/*
          Search and filters, pinned.

          In a grid this long the filters used to scroll away after the first
          row, so changing your mind meant scrolling all the way back up. `top`
          clears the floating navbar; `z-30` stays under it.
        */}
        <div className="sticky top-24 z-30 -mx-6 mb-10 px-6 py-4">
          <div className="mx-auto max-w-3xl space-y-5 rounded-4xl border border-white/60 bg-white/75 p-5 shadow-lg shadow-pink-500/5 backdrop-blur-xl">
            {/* Search */}
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-muted-foreground transition-colors group-focus-within:text-primary">
                <Search size={20} />
              </div>
              <input
                type="text"
                aria-label="Search templates"
                placeholder="Search for 'birthday', 'love', 'apology'…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/60 bg-white/70 py-4 pr-12 pl-14 text-base font-medium text-foreground transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/60 focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-[background-color,transform] duration-200 ease-out-strong hover:bg-black/5 active:scale-[0.94] active:duration-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Primary: category */}
            <div className="flex flex-wrap justify-center gap-2">
              <FilterChip
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
                layoutId="category-pill"
                animate={!reduceMotion}
                className="px-4 py-2 text-sm font-medium"
                activeTextClassName="text-background"
                pillClassName="bg-foreground shadow-md"
                idleClassName="bg-white/60 text-foreground/70 hover:bg-white"
              >
                All
              </FilterChip>
              {CATEGORIES.map((category) => (
                <FilterChip
                  key={category.id}
                  active={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                  layoutId="category-pill"
                  animate={!reduceMotion}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium"
                  activeTextClassName="text-background"
                  pillClassName="bg-foreground shadow-md"
                  idleClassName="bg-white/60 text-foreground/70 hover:bg-white"
                >
                  <span className="text-base">{category.emoji}</span>
                  {category.name}
                </FilterChip>
              ))}
            </div>

            {/* Secondary: recipient */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              <span className="mr-2 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                <Users size={12} /> For:
              </span>
              {RECIPIENTS.map((recipient) => (
                <FilterChip
                  key={recipient.id}
                  active={activeRecipient === recipient.id}
                  onClick={() => setActiveRecipient(recipient.id)}
                  layoutId="recipient-pill"
                  animate={!reduceMotion}
                  className="px-3.5 py-1.5 text-sm font-medium"
                  activeTextClassName="text-pink-700"
                  pillClassName="bg-pink-100"
                  idleClassName="text-foreground/60 hover:bg-white/60 hover:text-foreground"
                >
                  {recipient.label}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        {/* What the filters actually did. Announced, because for a screen
            reader the grid silently reshuffling is the whole feedback. */}
        <div
          aria-live="polite"
          className="mb-6 flex items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          <span>
            {filteredTemplates.length}{" "}
            {filteredTemplates.length === 1 ? "template" : "templates"}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full px-2 py-0.5 font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* The grid.
            `AnimatePresence` + each card's `layout` is what turns a filter
            change from a teleport into a rearrangement — the cards that survive
            the filter slide to their new slots while the rest fade out. */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                onQuickView={setPreviewTemplate}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <div className="ll-rise-in rounded-3xl border border-white/30 bg-white/20 py-20 text-center backdrop-blur-sm">
            <div className="mb-4 text-6xl opacity-50">🔍</div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              No templates found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or category filter.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 font-medium text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-20 text-center">
          <p className="font-serif text-sm text-muted-foreground/60 italic">
            More templates added weekly • Made with LetterLove 💕
          </p>
        </div>
      </div>
    </main>
  );
}
