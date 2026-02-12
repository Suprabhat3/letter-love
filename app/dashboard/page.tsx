"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getTemplateById } from "@/lib/templates";
import { SharedCard, CATEGORIES } from "@/lib/types";
import ShareModal from "@/components/ShareModal";
import {
  Search,
  Plus,
  LogOut,
  Trash2,
  ExternalLink,
  Heart,
  PenLine,
  Share2,
  Mail,
  TrendingUp,
  Sparkles,
  Filter,
  ChevronDown,
} from "lucide-react";

type SortOption = "newest" | "oldest" | "recipient";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [cards, setCards] = useState<SharedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeShareUrl, setActiveShareUrl] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

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

  const handleShare = (cardId: string) => {
    const url = `${window.location.origin}/share/${cardId}`;
    setActiveShareUrl(url);
    setShareModalOpen(true);
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this letter?")) return;

    await supabase.from("cards").delete().eq("id", cardId);
    setCards(cards.filter((c) => c.id !== cardId));
  };

  const filteredCards = cards
    .filter((card) => {
      const matchesSearch =
        card.data.recipientName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        card.data.message?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "recipient":
          return (a.data.recipientName || "").localeCompare(
            b.data.recipientName || "",
          );
        default:
          return 0;
      }
    });

  // Calculate stats
  const thisWeekCount = cards.filter((card) => {
    const cardDate = new Date(card.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return cardDate >= weekAgo;
  }).length;

  const uniqueRecipients = new Set(cards.map((c) => c.data.recipientName)).size;

  if (authLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Heart className="w-12 h-12 fill-pink-500 text-pink-500" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-pink-400 rounded-full blur-xl"
          />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:bg-background transition-colors duration-500">
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={activeShareUrl}
      />

      {/* Enhanced Abstract Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[30%] -right-[15%] w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-pink-300/30 to-purple-300/30 dark:from-pink-900/20 dark:to-purple-900/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute -bottom-[30%] -left-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-blue-300/30 to-teal-300/30 dark:from-blue-900/20 dark:to-teal-900/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-rose-300/20 to-orange-300/20 dark:from-rose-900/10 dark:to-orange-900/10 blur-[100px]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Header Section */}
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <span className="text-4xl">✨</span>
                </motion.div>
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200/50 dark:border-pink-500/20 text-pink-600 dark:text-pink-300 text-sm font-semibold tracking-wide backdrop-blur-sm">
                  Your Creative Space
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-foreground tracking-tight">
                Hello,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600">
                  {user.user_metadata.full_name?.split(" ")[0] || "Writer"}
                </span>
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl leading-relaxed">
                Every letter tells a story. Keep spreading love, one message at
                a time.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 w-full lg:w-auto"
            >
              <Link
                href="/templates"
                className="flex-1 lg:flex-none btn-primary px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-pink-300/40 hover:shadow-pink-400/50 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform relative z-10" />
                <span className="relative z-10">New Letter</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="px-5 py-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 text-muted-foreground hover:text-red-500 hover:bg-red-50/80 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-500/20 transition-all shadow-sm hover:shadow-md"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
          >
            <StatCard
              icon={<Mail className="w-6 h-6" />}
              label="Total Letters"
              value={cards.length}
              gradient="from-pink-500 to-rose-500"
              delay={0.3}
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="This Week"
              value={thisWeekCount}
              gradient="from-purple-500 to-indigo-500"
              delay={0.4}
            />
            <StatCard
              icon={<Sparkles className="w-6 h-6" />}
              label="Recipients"
              value={uniqueRecipients}
              gradient="from-orange-500 to-pink-500"
              delay={0.5}
            />
          </motion.div>
        </header>

        {/* Controls & Search */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 dark:bg-black/50 backdrop-blur-2xl border border-white/60 dark:border-white/10 p-3 rounded-3xl shadow-lg shadow-black/5 flex flex-col sm:flex-row gap-3 relative z-30"
          >
            <div className="relative flex-grow group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 group-focus-within:text-pink-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by recipient or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-transparent focus:border-pink-200 dark:focus:border-pink-500/30 outline-none text-foreground placeholder:text-muted-foreground/50 transition-all"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground hover:bg-white dark:hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl z-50"
                  >
                    {[
                      { value: "newest" as SortOption, label: "Newest First" },
                      { value: "oldest" as SortOption, label: "Oldest First" },
                      {
                        value: "recipient" as SortOption,
                        label: "By Recipient",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${
                          sortBy === option.value
                            ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6 relative"
            >
              <Heart className="w-12 h-12 text-pink-400 fill-pink-400" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-pink-400 rounded-full blur-xl"
              />
            </motion.div>
            <p className="text-lg font-medium">
              Loading your beautiful letters...
            </p>
          </div>
        ) : filteredCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white/60 dark:bg-white/5 rounded-[3rem] border border-white/80 dark:border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-8 shadow-lg"
            >
              <PenLine className="w-14 h-14 text-pink-500" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-foreground">
              {searchQuery ? "No matches found" : "Your Canvas Awaits"}
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mb-10 leading-relaxed">
              {searchQuery
                ? "Try adjusting your search terms to find what you're looking for."
                : "Every great story starts with a single word. Begin your journey of heartfelt expression today."}
            </p>
            {!searchQuery && (
              <Link
                href="/templates"
                className="btn-primary px-10 py-4 rounded-2xl font-semibold inline-flex items-center gap-3 shadow-2xl shadow-pink-300/50 hover:shadow-pink-400/60 transition-all group"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Start Writing
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCards.map((card, index) => (
                <LetterCard
                  key={card.id}
                  card={card}
                  index={index}
                  onDelete={deleteCard}
                  onShare={handleShare}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl -z-10"
        style={{
          backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
        }}
      />

      <div className="relative bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all overflow-hidden">
        <div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
          style={{
            backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
          }}
        />

        <div
          className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}
        >
          <div className="text-white">{icon}</div>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-4xl font-bold font-serif text-foreground">
            {value}
          </p>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r"
          style={{
            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
          }}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: delay + 0.3, duration: 0.8 }}
        />
      </div>
    </motion.div>
  );
}

function LetterCard({
  card,
  index,
  onDelete,
  onShare,
}: {
  card: SharedCard;
  index: number;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const template = getTemplateById(card.template_id);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-pink-200/30 dark:hover:shadow-pink-900/20 hover:-translate-y-2 transition-all duration-500 flex flex-col min-h-[380px]"
    >
      {/* Gradient Overlay on Hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        initial={false}
      />

      {/* Card Preview Header */}
      <div
        className="h-32 sm:h-36 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden flex-shrink-0"
        style={{
          background: template
            ? `linear-gradient(135deg, ${template.colors.secondary}50 0%, ${template.colors.primary}30 100%)`
            : "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
        }}
      >
        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: isHovered ? ["0% 0%", "100% 100%"] : "0% 0%",
          }}
          transition={{ duration: 3, ease: "linear" }}
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Link
            href={`/share/${card.id}`}
            target="_blank"
            className="p-2 sm:p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-xs font-semibold hover:bg-white transition-all flex items-center gap-1.5 shadow-lg hover:shadow-xl"
          >
            Preview <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </Link>
        </div>

        <motion.div
          animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl drop-shadow-lg transform group-hover:scale-125 transition-transform duration-500 origin-bottom-left pointer-events-none"
        >
          {template?.emoji || "💌"}
        </motion.div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/70 bg-white/60 dark:bg-black/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl backdrop-blur-md pointer-events-none shadow-sm">
            {template?.name || "Letter"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-6 flex flex-col flex-1 relative z-10">
        <Link
          href={`/share/${card.id}`}
          target="_blank"
          className="flex-1 block group-hover:opacity-90 transition-opacity mb-4"
        >
          <h3 className="font-bold text-foreground mb-2 truncate text-base sm:text-lg">
            To: {card.data.recipientName || "Someone Special"}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 font-serif italic leading-relaxed">
            "{card.data.message || "No message content..."}"
          </p>
        </Link>

        <div className="pt-3 sm:pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-400/50"
            />
            <span className="font-medium text-xs">
              {new Date(card.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={() => onShare(card.id)}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 text-muted-foreground hover:text-pink-600 transition-all hover:scale-110"
              title="Share"
            >
              <Share2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
            <div className="w-[1px] h-4 sm:h-5 bg-border" />
            <Link
              href={`/share/${card.id}`}
              target="_blank"
              className="p-2 sm:p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-500 transition-all hover:scale-110"
              title="Open Preview"
            >
              <ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </Link>
            <div className="w-[1px] h-4 sm:h-5 bg-border" />
            <button
              onClick={() => onDelete(card.id)}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all hover:scale-110"
              title="Delete"
            >
              <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
