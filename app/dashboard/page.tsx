"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getTemplateById } from "@/lib/templates";
import { SharedCard, CATEGORIES } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [cards, setCards] = useState<SharedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    if (!confirm("Are you sure you want to delete this card?")) return;

    await supabase.from("cards").delete().eq("id", cardId);
    setCards(cards.filter((c) => c.id !== cardId));
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          💕
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] bg-pink-200/30 w-[600px] h-[600px] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] bg-purple-200/30 w-[600px] h-[600px] rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold">
              My <span className="text-gradient">Cards</span>
            </h1>
            <p className="text-foreground/60 mt-2">{user.email}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3"
          >
            <Link
              href="/templates"
              className="btn-primary px-6 py-3 rounded-full font-semibold"
            >
              + Create New
            </Link>
            <button
              onClick={signOut}
              className="px-6 py-3 rounded-full bg-white/60 backdrop-blur-sm text-foreground/70 hover:bg-white/80 transition-all font-medium border border-white/50"
            >
              Sign Out
            </button>
          </motion.div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              💌
            </motion.div>
          </div>
        ) : cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-serif font-bold mb-4">No cards yet</h2>
            <p className="text-foreground/60 mb-8">
              Create your first beautiful card to share with someone special!
            </p>
            <Link
              href="/templates"
              className="btn-primary px-8 py-4 rounded-full inline-block font-semibold"
            >
              Create Your First Card 💕
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
              const template = getTemplateById(card.template_id);
              const category = template
                ? CATEGORIES.find((c) => c.id === template.category)
                : null;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
                  style={{
                    background: template
                      ? `linear-gradient(135deg, ${template.colors.secondary}30 0%, ${template.colors.primary}10 100%)`
                      : undefined,
                  }}
                >
                  {/* Template info */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-3xl">
                        {template?.emoji || "💌"}
                      </span>
                      <h3 className="font-serif font-bold text-lg mt-2">
                        {template?.name || "Card"}
                      </h3>
                      {category && (
                        <span className="text-xs text-foreground/50">
                          {category.emoji} {category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recipient */}
                  <p className="text-foreground/80 font-medium mb-2">
                    To: {card.data.recipientName || "Someone Special"}
                  </p>
                  <p className="text-foreground/50 text-sm line-clamp-2 mb-4">
                    {card.data.message?.substring(0, 80)}...
                  </p>

                  {/* Date */}
                  <p className="text-xs text-foreground/40 mb-4">
                    Created {new Date(card.created_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyShareLink(card.id)}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor:
                          copiedId === card.id
                            ? "#22c55e"
                            : template?.colors.primary || "#ec4899",
                        color: "white",
                      }}
                    >
                      {copiedId === card.id ? "✓ Copied!" : "📋 Copy Link"}
                    </button>
                    <Link
                      href={`/share/${card.id}`}
                      className="px-4 py-2 rounded-xl bg-white/60 text-foreground/70 text-sm font-medium hover:bg-white/80 transition-all"
                    >
                      👁️ View
                    </Link>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="px-3 py-2 rounded-xl bg-red-50 text-red-500 text-sm hover:bg-red-100 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
