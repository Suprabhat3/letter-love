"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getTemplateById } from "@/lib/templates";
import { SharedCard, CATEGORIES } from "@/lib/types";
import {
  Search,
  Plus,
  LogOut,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  MoreVertical,
  Check,
  Heart,
  PenLine,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [cards, setCards] = useState<SharedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadCards() {
      if (!user) return;

      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCards(data as SharedCard[]);
      }
      setLoading(false);
    }

    if (user) {
      loadCards();
    }
  }, [user]);

  const copyShareLink = async (cardId: string) => {
    const url = `${window.location.origin}/share/${cardId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this letter?")) return;

    await supabase.from("cards").delete().eq("id", cardId);
    setCards(cards.filter((c) => c.id !== cardId));
  };

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.data.recipientName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      card.data.message?.toLowerCase().includes(searchQuery.toLowerCase());

    // Optional: Add category filtering if we stored category ID on the card directly or looked it up
    // For now, simple search is good.
    return matchesSearch;
  });

  if (authLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#faf5f6] dark:bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-pink-500"
        >
          <Heart className="w-12 h-12 fill-current" />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-[#faf5f6] dark:bg-background transition-colors duration-500">
      {/* Abstract Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-pink-200/40 to-purple-200/40 dark:from-pink-900/10 dark:to-purple-900/10 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-200/40 to-teal-200/40 dark:from-blue-900/10 dark:to-teal-900/10 blur-[100px]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 text-xs font-semibold tracking-wide uppercase">
                Dashboard
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground tracking-tight">
              Hello,{" "}
              <span className="text-pink-500">
                {user.user_metadata.full_name?.split(" ")[0] || "Writer"}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              You have crafted{" "}
              <span className="font-semibold text-foreground">
                {cards.length}
              </span>{" "}
              {cards.length === 1 ? "letter" : "letters"} filled with love.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 w-full md:w-auto"
          >
            <Link
              href="/templates"
              className="flex-1 md:flex-none btn-primary px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all flex items-center justify-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              New Letter
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </motion.div>
        </header>

        {/* Controls & Search */}
        <div className="sticky top-4 z-30 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 p-2 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by recipient or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </motion.div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-pink-400" />
            <p>Loading your beautiful letters...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/40 dark:bg-white/5 rounded-[2.5rem] border border-white/60 dark:border-white/5 backdrop-blur-md"
          >
            <div className="w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mb-6">
              <PenLine className="w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3 text-foreground">
              {searchQuery ? "No matches found" : "Your Desk is Empty"}
            </h2>
            <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
              {searchQuery
                ? "Try adjusting your search terms to find what you're looking for."
                : "The page is blank, but your heart isn't. Start writing your first letter today and share some love."}
            </p>
            {!searchQuery && (
              <Link
                href="/templates"
                className="btn-primary px-8 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-pink-200/50"
              >
                Start Writing <Plus className="w-4 h-4" />
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredCards.map((card, index) => (
                <LetterCard
                  key={card.id}
                  card={card}
                  index={index}
                  onDelete={deleteCard}
                  onCopy={copyShareLink}
                  copiedId={copiedId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

function LetterCard({
  card,
  index,
  onDelete,
  onCopy,
  copiedId,
}: {
  card: SharedCard;
  index: number;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  copiedId: string | null;
}) {
  const template = getTemplateById(card.template_id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white dark:bg-card border border-black/5 dark:border-white/10 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-pink-100/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col h-[320px]"
    >
      {/* Card Preview Header */}
      <div
        className="h-32 p-6 flex flex-col justify-between relative overflow-hidden"
        style={{
          background: template
            ? `linear-gradient(135deg, ${template.colors.secondary}40 0%, ${template.colors.primary}20 100%)`
            : "bg-muted",
        }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Link
            href={`/share/${card.id}`}
            target="_blank"
            className="p-2 bg-white/80 backdrop-blur rounded-full text-xs font-semibold hover:bg-white transition-colors flex items-center gap-1 shadow-sm"
          >
            Preview <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="text-4xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-500 origin-bottom-left pointer-events-none">
          {template?.emoji || "💌"}
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/60 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
            {template?.name || "Letter"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-grow flex flex-col">
        <Link
          href={`/share/${card.id}`}
          target="_blank"
          className="mb-4 flex-grow block group-hover:opacity-80 transition-opacity"
        >
          <h3 className="font-semibold text-foreground mb-1 truncate">
            To: {card.data.recipientName || "Someone Special"}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 font-serif italic opacity-80 leading-relaxed">
            "{card.data.message || "No message content..."}"
          </p>
        </Link>

        <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>
              {new Date(card.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onCopy(card.id)}
              className="p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 text-muted-foreground hover:text-pink-600 transition-colors relative"
              title="Copy Link"
            >
              {copiedId === card.id ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <Link
              href={`/share/${card.id}`}
              target="_blank"
              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-500 transition-colors"
              title="Open Preview"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <button
              onClick={() => onDelete(card.id)}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
